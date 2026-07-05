#!/usr/bin/env bash
#
# One-shot Plesk installer for the Drop Catcher.
#
# Run this ONCE, over SSH, as root on your Plesk server:
#
#   sudo bash plesk-install.sh dropcatcher.yourdomain.com you@yourdomain.com
#
# What it does:
#   1. Installs Node.js if needed
#   2. Deploys the app to /opt/dropcatcher
#   3. Runs it as a systemd service, bound to 127.0.0.1 only (not exposed
#      on your public IP directly — Plesk's subdomain + SSL fronts it)
#   4. Creates the Plesk subdomain you named
#   5. Requests a free Let's Encrypt certificate for it
#
# The reverse-proxy step (pointing the subdomain at the app) has one manual
# copy-paste at the end, printed for you — Plesk's exact field for this
# varies slightly by version, so this script won't guess wrong on your
# live server. It takes about 30 seconds.
#
# Nothing here touches your other Plesk sites/domains.
set -uo pipefail

SUBDOMAIN="${1:-}"
EMAIL="${2:-}"
if [ -z "$SUBDOMAIN" ] || [ -z "$EMAIL" ]; then
  echo "Usage: sudo bash $0 <subdomain, e.g. dropcatcher.yourdomain.com> <your-email>" >&2
  exit 1
fi
PARENT_DOMAIN="${SUBDOMAIN#*.}"
SUB_LABEL="${SUBDOMAIN%%.*}"
PORT="${PORT:-8053}"
APP_DIR="/opt/dropcatcher"
REPO_URL="${REPO_URL:-https://github.com/Imperialme/Domain-Marketplace-Platform-Blueprint-5911.git}"
BRANCH="${BRANCH:-claude/domain-drop-catcher-1la4e1}"

if [ "$(id -u)" -ne 0 ]; then
  echo "Please run as root:  sudo bash $0 $SUBDOMAIN $EMAIL" >&2
  exit 1
fi
if ! command -v plesk >/dev/null 2>&1; then
  echo "No 'plesk' command found — this doesn't look like a Plesk server." >&2
  exit 1
fi

echo "==> Checking Node.js…"
if ! command -v node >/dev/null 2>&1 || [ "$(node -e 'console.log(process.versions.node.split(".")[0])')" -lt 18 ]; then
  echo "==> Installing Node.js 20 (NodeSource)…"
  apt-get update -y
  apt-get install -y ca-certificates curl gnupg
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi
echo "    node $(node --version)"

echo "==> Deploying app code to $APP_DIR…"
if [ -d "$APP_DIR/.git" ]; then
  git -C "$APP_DIR" fetch origin "$BRANCH"
  git -C "$APP_DIR" checkout "$BRANCH"
  git -C "$APP_DIR" reset --hard "origin/$BRANCH"
else
  rm -rf "$APP_DIR"
  git clone --branch "$BRANCH" --single-branch "$REPO_URL" "$APP_DIR"
fi
cd "$APP_DIR/dropcatcher"
[ -f config.json ] || cp config.example.json config.json
chmod 600 config.json

echo "==> Creating systemd service on 127.0.0.1:$PORT…"
cat > /etc/systemd/system/dropcatcher.service <<EOF
[Unit]
Description=Domain drop catcher (dashboard + engine)
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
WorkingDirectory=$APP_DIR/dropcatcher
Environment=NODE_ENV=production
Environment=PORT=$PORT
Environment=HOST=127.0.0.1
ExecStart=$(command -v node) app.js
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF
systemctl daemon-reload
systemctl enable --now dropcatcher
sleep 2
if systemctl is-active --quiet dropcatcher; then
  echo "    service is running"
else
  echo "    ⚠ service did not start — check: journalctl -u dropcatcher -e"
fi

echo "==> Creating Plesk subdomain $SUBDOMAIN…"
if plesk bin subdomain --list "$PARENT_DOMAIN" 2>/dev/null | grep -qx "$SUB_LABEL"; then
  echo "    $SUBDOMAIN already exists, skipping"
elif plesk bin subdomain --create "$SUB_LABEL" -domain "$PARENT_DOMAIN"; then
  echo "    created"
else
  echo "    ⚠ could not create it automatically — in Plesk: Websites & Domains → Add Subdomain → \"$SUB_LABEL\" under $PARENT_DOMAIN"
fi

echo "==> Requesting a free SSL certificate for $SUBDOMAIN…"
if plesk bin extension --exec letsencrypt cli.php -d "$SUBDOMAIN" -m "$EMAIL"; then
  echo "    certificate issued"
else
  echo "    ⚠ automatic SSL failed — in Plesk: $SUBDOMAIN → SSL/TLS Certificates → Get free certificate"
fi

echo
echo "=================================================================="
echo "  One manual step left (about 30 seconds):"
echo
echo "  In Plesk: Websites & Domains → $SUBDOMAIN → Apache & nginx Settings"
echo "  → \"Additional nginx directives\" → paste the block below → Apply."
echo "  (This tells $SUBDOMAIN to forward traffic to the app.)"
echo
cat <<NGINX
  location / {
      proxy_pass http://127.0.0.1:$PORT;
      proxy_http_version 1.1;
      proxy_set_header Upgrade \$http_upgrade;
      proxy_set_header Connection "upgrade";
      proxy_set_header Host \$host;
      proxy_set_header X-Forwarded-Proto \$scheme;
      proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
  }
NGINX
echo
echo "  Then open:  https://$SUBDOMAIN"
echo "  1. Create a password   2. Paste your Dynadot API key   3. Add domains"
echo
echo "  Logs:    journalctl -u dropcatcher -f"
echo "  Restart: systemctl restart dropcatcher"
echo "=================================================================="
