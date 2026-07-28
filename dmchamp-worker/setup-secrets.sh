#!/usr/bin/env bash
# Sets the encrypted secrets for the dmchamp-notion Worker.
# Values are never written to disk or to wrangler.toml — each is piped
# straight into `wrangler secret put`.
#
# Usage:
#   Export the values you have as env vars first, e.g.:
#     export NOTION_TOKEN="ntn_xxx"
#     export GOOGLE_CLIENT_ID="xxx.apps.googleusercontent.com"
#     export GOOGLE_CLIENT_SECRET="GOCSPX-xxx"
#     export GOOGLE_REFRESH_TOKEN="1//xxx"   # leave unset until you've run /oauth/start once
#   Then run:
#     CLOUDFLARE_API_TOKEN=... CLOUDFLARE_ACCOUNT_ID=... ./setup-secrets.sh
#
# Any secret whose env var isn't set will prompt interactively (hidden input).

set -euo pipefail

put_secret() {
  local name="$1"
  local value="${!name:-}"
  if [ -z "$value" ]; then
    read -rsp "Enter value for $name (leave blank to skip): " value
    echo
  fi
  if [ -z "$value" ]; then
    echo "Skipped $name"
    return
  fi
  printf '%s' "$value" | npx wrangler secret put "$name"
}

put_secret NOTION_TOKEN
put_secret GOOGLE_CLIENT_ID
put_secret GOOGLE_CLIENT_SECRET
put_secret GOOGLE_REFRESH_TOKEN

echo "Done. Run 'npx wrangler deploy' if you haven't deployed yet."
