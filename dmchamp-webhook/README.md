# DM Champ → Notion + Google Sheets + Gmail Webhook

Express webhook server that receives DM Champ inquiry POSTs and fans them out to:

1. **Notion** — creates a page in the Inquiry Library database (skips if the `reference` already exists)
2. **Google Sheets** — appends a row to the `Spare Parts` tab
3. **Gmail** — creates a draft acknowledgement (never sends automatically)

The `/webhook` endpoint always returns HTTP 200 with a JSON status, even if one or more downstream steps fail.

## File structure

```
dmchamp-webhook/
├── index.js      # Express app, /webhook route, error handling
├── notion.js      # Notion page creation + duplicate reference check
├── sheets.js      # Google Sheets row append
├── gmail.js       # Gmail draft creation
├── oauth.js       # Google OAuth2 client + /oauth/start /oauth/callback routes
├── .env.example
├── package.json
└── README.md
```

## Setup

```bash
cd dmchamp-webhook
npm install
cp .env.example .env
```

Fill in `.env`:

| Variable | Description |
|---|---|
| `NOTION_TOKEN` | Internal integration token from notion.so/my-integrations |
| `NOTION_DATABASE_ID` | Inquiry Library database ID (defaults to `85057367-cbd2-4e2c-a6c4-1f1da4939079`) |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth app credentials |
| `GOOGLE_REDIRECT_URI` | Must match a redirect URI registered in the GCP Console, e.g. `https://your-app.railway.app/oauth/callback` |
| `GOOGLE_REFRESH_TOKEN` | Obtained via the `/oauth/start` flow (see below); leave blank on first deploy |
| `GOOGLE_SHEET_ID` | Target spreadsheet ID |
| `GOOGLE_SHEET_TAB` | Target sheet tab name (defaults to `Spare Parts`) |
| `GMAIL_USER` | The Gmail address drafts are created from (`sales@spareparts.me`) |
| `PORT` | Server port (defaults to `3000`) |

## Before first run — Muhammad to do

1. Go to [notion.so/my-integrations](https://www.notion.so/my-integrations) → **New Integration** → copy the token → set `NOTION_TOKEN`.
2. Share the Notion **Inquiry Library** database with that integration (••• menu → Connections).
3. In the [GCP Console](https://console.cloud.google.com/apis/credentials), add the deployed callback URL as an authorized redirect URI, e.g. `https://your-app.railway.app/oauth/callback`.

## Deploy (Railway)

1. Push this folder to a repo / connect it in [railway.app](https://railway.app).
2. Set all variables from `.env.example` in the Railway service's **Variables** tab (leave `GOOGLE_REFRESH_TOKEN` blank for now, and set `GOOGLE_REDIRECT_URI` to `https://<your-app>.railway.app/oauth/callback`).
3. Deploy.
4. Visit `https://<your-app>.railway.app/oauth/start` in a browser, sign in as `sales@spareparts.me`, and grant access.
5. The `/oauth/callback` page will display a refresh token — copy it into the `GOOGLE_REFRESH_TOKEN` variable in Railway and redeploy.
6. Paste `https://<your-app>.railway.app/webhook` into the DM Champ webhook field.

## Notion field mapping

Incoming payload fields map to these Notion properties: `Reference` (title), `Customer Name`, `Company Name`, `Customer Email`, `Customer Phone`, `Parts Requested` (vehicle + parts combined), `Destination`, `Inquiry Type` (`B2B`/`B2C`, defaults to `B2C`), `Pipeline Stage` (`Pending RFQ`), `Status` (`New`), `Ack Sent` (`false`), `Duplicate Flag` (`Clean`), `Inquiry Date` (today), `Response Deadline` (today + 2 days).

If a page with the same `Reference` already exists, the Notion write is skipped and the response's top-level `status` is `"duplicate"` — Sheets and Gmail steps still run.

## Google Sheets row order

```
"", today, deadline, reference, inquiry_type, contact_name, email, phone,
brand_vehicle, "", parts_list, "", destination, "No", 0, "", "", "", task_title
```

## Gmail draft

- Subject: `Your Inquiry Has Been Received — {reference} | SpareParts.me`
- Skipped if `email` is empty.
- Draft only — never sent.

## Test

```bash
curl -X POST https://your-app.railway.app/webhook \
  -H "Content-Type: application/json" \
  -d '{"task_title":"Test","contact_name":"Test Customer","email":"test@example.com","phone":"+971500000000","brand_vehicle":"Toyota","parts_list":"Oil Filter x2","destination":"Dubai","inquiry_type":"B2C","reference":"INQ26-TST-TEST"}'
```

Expected response:

```json
{ "status": "success", "reference": "INQ26-TST-TEST", "notion": "created", "sheet": "appended", "gmail": "draft_created" }
```

## Rules

- `/webhook` never returns a non-200 response.
- Gmail is never auto-sent — draft only.
- Every missing payload field defaults to an empty string.
- A duplicate `reference` skips the Notion write but still returns 200 (with `status: "duplicate"`); Sheets and Gmail steps still run.
