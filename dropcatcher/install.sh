#!/usr/bin/env bash
# One-command installer for the drop catcher on an Ubuntu/Debian VPS.
#
#   As root (or with sudo):
#     bash dropcatcher/install.sh
#
# It installs Node.js if missing, copies the app to /opt/dropcatcher,
# sets up a systemd service, and starts the dashboard on port 8053.
set -euo pipefail

APP_DIR=/opt/dropcatcher
PORT="${PORT:-8053}"
SRC_DIR="$(cd "$(dirname "$0")" && pwd)"

if [ "$(id -u)" -ne 0 ]; then
  echo "Please run as root:  sudo bash $0" >&2
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

echo "==> Installing app to $APP_DIR…"
mkdir -p "$APP_DIR"
cp -r "$SRC_DIR/src" "$SRC_DIR/package.json" "$SRC_DIR/config.example.json" "$APP_DIR/"
# Never overwrite an existing config (it holds your API key + password).
[ -f "$APP_DIR/config.json" ] || cp "$APP_DIR/config.example.json" "$APP_DIR/config.json"
chmod 600 "$APP_DIR/config.json"

echo "==> Setting up systemd service…"
cat > /etc/systemd/system/dropcatcher.service <<EOF
[Unit]
Description=Domain drop catcher (dashboard + engine)
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
WorkingDirectory=$APP_DIR
ExecStart=$(command -v node) src/cli.js web $PORT
Restart=always
RestartSec=5
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable --now dropcatcher

# Open the firewall port if ufw is active (ignore errors otherwise).
if command -v ufw >/dev/null 2>&1 && ufw status | grep -q "Status: active"; then
  ufw allow "$PORT"/tcp || true
fi

IP=$(curl -fsS --max-time 5 https://api.ipify.org 2>/dev/null || hostname -I | awk '{print $1}')
echo
echo "=================================================================="
echo "  ✅ Drop Catcher is running."
echo
echo "  Open this in your browser to finish setup:"
echo
echo "      http://$IP:$PORT"
echo
echo "  1. Create a password  2. Paste your Dynadot API key  3. Add domains"
echo
echo "  Logs:    journalctl -u dropcatcher -f"
echo "  Restart: systemctl restart dropcatcher"
echo "=================================================================="
