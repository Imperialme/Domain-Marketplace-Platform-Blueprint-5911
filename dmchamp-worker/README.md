# DM Champ Webhook — Cloudflare Worker

Cloudflare Workers-native rewrite of `../dmchamp-webhook` (the Express/Node version).
Same behavior — receives DM Champ inquiry POSTs, writes to Notion, appends a Google
Sheets row, and creates a Gmail draft — but implemented with plain `fetch()` calls
against the Notion/Google REST APIs instead of the Node SDKs, so it runs natively on
Workers with no bundler shims needed.

Deploys to an existing Worker named **`dmchamp-notion`** (see `wrangler.toml`).

## File structure

```
dmchamp-worker/
├── src/
│   ├── index.js     # fetch() entrypoint, routing, /webhook handler
│   ├── notion.js     # Notion REST calls + duplicate reference check
│   ├── sheets.js      # Google Sheets REST append
│   ├── gmail.js       # Gmail REST draft creation
│   ├── oauth.js       # Google token refresh + /oauth/start /oauth/callback
│   └── util.js
├── wrangler.toml
├── setup-secrets.sh
├── package.json
└── README.md
```

## One-time setup

```bash
cd dmchamp-worker
npm install
```

Edit `wrangler.toml`:
- Confirm `account_id` matches your Cloudflare account.
- Replace the `GOOGLE_REDIRECT_URI` placeholder with your Worker's real URL —
  either `https://dmchamp-notion.<your-workers-dev-subdomain>.workers.dev/oauth/callback`
  (find your subdomain under Workers & Pages in the Cloudflare dashboard) or a
  custom domain/route you've attached to this Worker.

## Deploy

Requires a Cloudflare API token (Workers Scripts: Edit permission) and your account ID.

```bash
export CLOUDFLARE_API_TOKEN="your-token"
export CLOUDFLARE_ACCOUNT_ID="your-account-id"

npx wrangler deploy
```

This publishes to the existing `dmchamp-notion` Worker (overwrites its current script).

## Set secrets

Secrets are encrypted by Cloudflare and never touch `wrangler.toml` or git.

```bash
export CLOUDFLARE_API_TOKEN="your-token"
export CLOUDFLARE_ACCOUNT_ID="your-account-id"

export NOTION_TOKEN="ntn_xxx"
export GOOGLE_CLIENT_ID="xxx.apps.googleusercontent.com"
export GOOGLE_CLIENT_SECRET="GOCSPX-xxx"
# leave GOOGLE_REFRESH_TOKEN unset for now — see below

./setup-secrets.sh
```

Any variable left unset is skipped (or prompted for interactively with hidden input).

## Get the Google refresh token

1. Make sure the redirect URI in `wrangler.toml` is registered in the
   [GCP Console](https://console.cloud.google.com/apis/credentials) for this OAuth client.
2. Visit `https://dmchamp-notion.<your-subdomain>.workers.dev/oauth/start`, sign in as
   `sales@spareparts.me`, and approve access.
3. The `/oauth/callback` page shows a refresh token. Set it:
   ```bash
   export GOOGLE_REFRESH_TOKEN="1//xxx"
   CLOUDFLARE_API_TOKEN=... CLOUDFLARE_ACCOUNT_ID=... ./setup-secrets.sh
   ```
   (Or just `printf '%s' "1//xxx" | npx wrangler secret put GOOGLE_REFRESH_TOKEN`.)

## Test

```bash
curl -X POST https://dmchamp-notion.<your-subdomain>.workers.dev/webhook \
  -H "Content-Type: application/json" \
  -d '{"task_title":"Test","contact_name":"Test Customer","email":"test@example.com","phone":"+971500000000","brand_vehicle":"Toyota","parts_list":"Oil Filter x2","destination":"Dubai","inquiry_type":"B2C","reference":"INQ26-TST-TEST"}'
```

Expected:

```json
{ "status": "success", "reference": "INQ26-TST-TEST", "notion": "created", "sheet": "appended", "gmail": "draft_created" }
```

## Rules

- `/webhook` never returns non-200 — every downstream call (Notion, Sheets, Gmail) is
  wrapped independently via `Promise.allSettled`, so one failing doesn't block the others.
- Gmail is draft-only, never sent.
- Missing payload fields default to `""`.
- A duplicate `reference` skips the Notion write only; Sheets and Gmail still run, and
  the top-level `status` is `"duplicate"`.
