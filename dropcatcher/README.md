# NetZone Drop Catcher

Self-hosted domain drop catching — the thing backorder services charge $59–$99+ per domain for, running on your own VPS with your own registrar API key. Total cost: **your VPS you already have + the normal registration fee, only when a catch succeeds.**

No npm dependencies. Pure Node.js ≥ 18.

## How it works

Every expiring domain goes through the same registry lifecycle:

```
active → expired (grace, ~0–45 days) → redemptionPeriod (~30 days)
       → pendingDelete (~5 days) → DROPPED (available to anyone)
```

The tool has two jobs:

1. **Monitor** (cheap, hourly): looks up each watched domain via **RDAP** (the free, structured registry data service — no API key needed) and tracks which phase it's in. You get a Telegram/webhook ping on every transition, so you know days in advance when a drop is coming.
2. **Catch** (intense, minutes–hours): once a domain hits `pendingDelete` and your configured UTC drop window opens, it switches to a tight sequential loop against your registrar's availability API and fires a `register` call the instant the registry releases the name.

## Quick start (VPS)

```bash
cd dropcatcher
node src/cli.js init                # creates config.json from the example
export DYNADOT_API_KEY=your_key    # dynadot.com → Tools → API
node src/cli.js add tell.me 100     # watch tell.me, max price $100
node src/cli.js check tell.me       # one-off: RDAP phase + registrar availability
node src/cli.js run                 # the daemon — leave running under pm2/systemd
```

Keep it alive across reboots with one of:

- **systemd**: `deploy/dropcatcher.service` (instructions in the file header)
- **pm2**: `pm2 start deploy/ecosystem.config.cjs && pm2 save`

### CLI reference

| Command | What it does |
|---|---|
| `init` | Create `config.json` from the example |
| `add <domain> [maxPrice]` | Watch a domain |
| `remove <domain>` | Stop watching |
| `list` | Watchlist + last known phase per domain |
| `check <domain>` | One-off RDAP + registrar availability check |
| `monitor-once` | Single sweep — for cron or Netlify |
| `run` | Long-running daemon (monitor + auto-burst) |
| `catch <domain>` | Force burst mode **now**, ignoring the drop window |

## Configuration

`config.json` (never commit it — it's gitignored). Secrets use `"env:VAR_NAME"` references so they stay out of the file:

```jsonc
{
  "registrar": "dynadot",                  // or "godaddy"
  "dynadot": { "apiKey": "env:DYNADOT_API_KEY", "currency": "USD" },
  "notify": {
    "webhookUrl": "",                       // Discord/Slack webhook (optional)
    "telegram": { "botToken": "env:TELEGRAM_BOT_TOKEN", "chatId": "123456" }
  },
  "catch": {
    "pollMs": 1500,                         // availability poll interval in burst mode
    "registerRetries": 8,
    "maxBurstHours": 12
  },
  "watchlist": [
    { "domain": "tell.me", "maxPrice": 100,
      "dropWindowUtc": { "start": "10:00", "end": "22:00" } }
  ]
}
```

**`maxPrice` matters**: high-value drops (short .me names like `tell.me` very much included) are often flagged *premium* by the registry, with registration prices in the hundreds or thousands instead of ~$20. The catcher checks the live price before registering and refuses anything above your cap — you'll get a notification telling you the real price so you can decide.

**`dropWindowUtc`**: registries delete domains in a daily batch at a roughly consistent time of day, which varies by TLD (Verisign's .com/.net drop is famously ~18:00–19:00 UTC; other registries differ). The window here just bounds when burst mode runs so you're not hammering the API 24/7. Strategy: while the domain sits in `pendingDelete` (~5 days), run `node src/cli.js check <domain>` a few times a day — or watch the monitor logs — and note when similar domains on that TLD disappear from RDAP, then tighten the window around that time. A wide window (e.g. `10:00`–`22:00`) is a safe default if you don't know.

## Registrar APIs

### Dynadot (recommended — free API, cheap .me pricing)

1. Fund your Dynadot account (registrations are paid from account balance — an unfunded account means the `register` call fails at the worst possible moment).
2. Tools → API → generate a key, whitelist your VPS IP.
3. `export DYNADOT_API_KEY=...`

Note: Dynadot processes **one API request per key at a time**. The adapter serializes calls automatically — this is also why the burst loop is sequential rather than parallel. Parallelism wouldn't help anyway; it just gets the key throttled.

### GoDaddy (alternative)

Availability checks need only the key/secret from developer.godaddy.com. **Purchasing** additionally requires registrant contact details in the config:

```jsonc
"godaddy": {
  "apiKey": "env:GODADDY_API_KEY",
  "apiSecret": "env:GODADDY_API_SECRET",
  "contact": {
    "nameFirst": "Your", "nameLast": "Name", "email": "you@example.com",
    "phone": "+1.5555555555",
    "addressMailing": { "address1": "...", "city": "...", "state": "...",
                        "postalCode": "...", "country": "US" }
  }
}
```

Adding another registrar is one small adapter file in `src/registrars/` implementing `checkAvailability(domain)` and `register(domain, years)`.

## Netlify (optional watchtower)

Netlify **cannot** do the actual catching — scheduled functions run at most once a minute and time out in seconds, while a catch needs a persistent 1.5-second polling loop. What Netlify *is* good for: a free, always-up hourly monitor that pings your Telegram when a domain changes phase, as a backup to the VPS.

1. Merge `netlify/netlify.toml` settings into your site's root `netlify.toml`.
2. In Netlify UI set `DROPCATCHER_CONFIG_JSON` (your whole config as one JSON line), `DROPCATCHER_STATE=/tmp/state.json`, and optionally `DYNADOT_API_KEY` + `TELEGRAM_BOT_TOKEN`.
3. Deploy — `dropcatcher/netlify/functions/monitor.mjs` runs `@hourly`. If it finds a watched domain already dropped, it will even attempt an opportunistic registration.

(Netlify's `/tmp` doesn't persist between runs, so phase-change notifications may repeat hourly there. Harmless; the VPS daemon keeps real state.)

## Honest expectations for `tell.me`

- `tell.me` is a **premium two-word .me** — check its actual phase first (`node src/cli.js check tell.me`). If it's `active` and nowhere near expiry, no catcher can get it; your move is a purchase inquiry or waiting for it to actually expire. The monitor will watch it for years for free and tell you the moment its status changes.
- For contested drops, the big services (DropCatch, SnapNames) hold hundreds of accredited registrar connections talking EPP directly to the registry — a single registrar API can't outrace them on a famous name. Where a self-hosted catcher **wins**: the long tail of decent names nobody backordered, which is most drops.
- Best odds play: run this catcher **and** place a cheap backorder (Dynadot's is ~$5–15) on truly contested names — the backorder rides Dynadot's own registry connection, and this tool catches everything the services didn't bother with. They don't conflict.

## Being a good citizen (and staying uncanned)

- RDAP sweeps are hourly with 1s spacing — well within polite use.
- Burst mode is bounded (`maxBurstHours`, drop windows) and backs off exponentially on API errors. Don't set `pollMs` below ~1000ms; Dynadot serializes your requests anyway, and aggressive polling is how API keys get suspended.
- Registered-name sniping via registrar APIs is fully legitimate — it's the same thing the backorder services do, just with your key.
