# Gmail MCP (multi-account)

A local-only MCP server that gives Claude Cowork read/search/draft/send access to two or more Gmail
accounts (e.g. Imperial MEA + personal), with encrypted token storage and a small CLI for adding/removing
accounts. Runs entirely on your Mac over stdio — nothing is hosted anywhere.

## How it's put together

```
gmail-mcp-server/
  bin/
    gmail-mcp.js          CLI entrypoint          (gmail-mcp init / add-account / ...)
    gmail-mcp-server.js   MCP server entrypoint    (what Cowork launches)
  src/
    cli.js                 CLI commands (commander)
    server.js               MCP server: registers all tools, connects over stdio
    gmailClient.js          Per-account authenticated Gmail API client + auto token refresh
    oauth.js                Google OAuth2 client + loopback browser auth flow
    crypto.js                AES-256-GCM encryption, keyed by a macOS Keychain-backed master key
    store.js                 Reads/writes ~/.gmail-mcp/config.json and encrypted token files
    mime.js                  Builds outgoing RFC 2822 messages, parses incoming ones
    paths.js                  Where state lives on disk
    tools/                    One file per tool (or small group): accounts, search, read, draft, send, labels
  config/
    accounts.example.json    Reference only — shows the shape of ~/.gmail-mcp/config.json
```

Runtime state (tokens, account list, OAuth client id/secret) lives outside the repo, under
`~/.gmail-mcp/`, never inside this project folder.

## Security model

- **Nothing leaves your Mac.** The server talks only to Google's APIs, using credentials you provide.
- **Tokens are encrypted at rest.** OAuth tokens are AES-256-GCM encrypted before being written to
  `~/.gmail-mcp/tokens/<account-id>.enc`. The encryption key is generated once and stored in the macOS
  Keychain (via `keytar`) under service `gmail-mcp-multi-account`. If Keychain access isn't available for
  some reason, it falls back to a `0600` key file — the CLI will warn you if that happens.
- **Scope:** every account is authorized with `gmail.modify` only — enough for search/read, label changes
  (archive, mark read/unread), and drafts/send. It excludes permanent delete; this server never calls any
  delete API.
- **Draft-first, always.** There is intentionally no "send raw email" tool. `send_draft` is the only way
  to send, and it requires `confirm: true`, which Claude is instructed (via the tool description) to set
  only after you've explicitly approved the exact draft content.

## 1. Create a Google OAuth client (one-time, ~5 minutes)

1. Go to the [Google Cloud Console](https://console.cloud.google.com/), create a project (or reuse one).
2. **APIs & Services → Library** → enable the **Gmail API**.
3. **APIs & Services → OAuth consent screen**:
   - User type: External (Internal only works if you're on a Google Workspace org you admin).
   - Add yourself as a **test user** if the app stays in "Testing" mode — this is normal for personal
     tools and doesn't require Google review, but tokens are limited to test users you list.
4. **APIs & Services → Credentials → Create Credentials → OAuth client ID**:
   - Application type: **Desktop app**.
   - Name it anything, e.g. "Gmail MCP local".
5. Copy the generated **Client ID** and **Client Secret**.

Desktop-app clients are allowed to use Google's loopback redirect (`http://127.0.0.1:<any port>/...`)
without pre-registering a specific port, which is what this server relies on for `add-account`.

## 2. Install

```bash
cd gmail-mcp-server
npm install
```

(Optional) link the CLI globally so you can run `gmail-mcp` from anywhere:

```bash
npm link
```

Without linking, use `node bin/gmail-mcp.js ...` in place of `gmail-mcp ...` below.

## 3. Store your OAuth client credentials

```bash
gmail-mcp init
# prompts for Client ID and Client Secret, or pass them directly:
gmail-mcp init --client-id "xxxx.apps.googleusercontent.com" --client-secret "yyyy"
```

This writes `~/.gmail-mcp/config.json` (the client id/secret, not a per-user secret, but still local-only
and `0600`-permissioned).

## 4. Add your accounts

```bash
gmail-mcp add-account --label "Imperial MEA"
gmail-mcp add-account --label "Personal"
```

Each run opens your browser to Google's consent screen, then stores that account's tokens encrypted under
`~/.gmail-mcp/tokens/`. Verify:

```bash
gmail-mcp list-accounts
# imperial-mea   you@imperialmea.com   Imperial MEA   (added 2026-...)
# personal       you@gmail.com         Personal       (added 2026-...)
```

Other CLI commands:

```bash
gmail-mcp test-auth imperial-mea      # confirms the stored token still works
gmail-mcp remove-account personal     # deletes local tokens + account entry
```

Token refresh is automatic after this — the server refreshes expired access tokens transparently on every
call and persists the refreshed token, so you shouldn't need to re-run `add-account` unless you explicitly
remove an account or revoke access from your Google Account settings.

## 5. Wire it into Claude Cowork

Add an MCP server entry pointing at `bin/gmail-mcp-server.js` with an **absolute path**. In whichever MCP
server configuration surface Cowork exposes on your Mac (Settings → Connectors/MCP Servers, or its
underlying JSON config file), add:

```json
{
  "mcpServers": {
    "gmail-multi-account": {
      "command": "node",
      "args": ["/absolute/path/to/gmail-mcp-server/bin/gmail-mcp-server.js"]
    }
  }
}
```

If you ran `npm link`, you can use the linked binary instead:

```json
{
  "mcpServers": {
    "gmail-multi-account": {
      "command": "gmail-mcp-server"
    }
  }
}
```

Restart Cowork (or reload MCP servers) after adding this. The server itself reads all state from
`~/.gmail-mcp/`, so no env vars or extra config are required in the Cowork entry.

## Tools exposed to Claude

| Tool | What it does |
|---|---|
| `list_accounts` | Lists configured accounts (id, email, label) — use the id/email as the `account` param elsewhere |
| `search_emails` | Gmail search syntax (`from:`, `is:unread`, `after:`, ...), returns lightweight summaries |
| `read_email` | Full headers + plain-text body for one message id |
| `create_draft` | Creates a draft (new message or reply via `threadId`/`inReplyTo`) — never sends |
| `update_draft` | Replaces an existing draft's content |
| `send_draft` | Sends a draft; requires `confirm: true`, meant to be set only after your explicit go-ahead |
| `archive_email` | Removes the `INBOX` label |
| `mark_email_read` / `mark_email_unread` | Toggles the `UNREAD` label |

Every tool except `list_accounts` takes an `account` parameter (id or email) so Claude always operates on
the account you (or it, when asked) specify — nothing is sent from the wrong inbox by default since every
call is explicit about which account it targets.

## Troubleshooting

- **`redirect_uri_mismatch`**: confirm the OAuth client is type **Desktop app**, not "Web application" —
  only Desktop clients get Google's automatic loopback allowance this server relies on.
- **`invalid_grant` / token stopped working**: re-run `gmail-mcp add-account` for that account (you can
  reuse the same `--id` to overwrite in place, or just let it create a new slug and remove the old one).
- **Consent screen says the app isn't verified**: expected in "Testing" mode — click Advanced → Go to
  (app name) to proceed, as long as you added yourself as a test user in step 1.
- **Changed scopes**: if you ever edit `GMAIL_SCOPES` in `src/oauth.js`, existing accounts need
  `add-account` re-run to pick up the new consent.
