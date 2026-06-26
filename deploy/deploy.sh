#!/bin/bash
# =============================================================================
# Procure.parts — Redeploy Script (run after every code update)
# Usage: bash /var/www/procure-parts/deploy/deploy.sh
# =============================================================================

set -e

APP_DIR="/var/www/procure-parts"
APP_USER="procure"

echo ""
echo "============================================="
echo "  Procure.parts — Redeploying..."
echo "============================================="
echo ""

cd "${APP_DIR}"

echo "[1/4] Pulling latest code..."
sudo -u ${APP_USER} git pull origin main

echo "[2/4] Installing / updating dependencies..."
sudo -u ${APP_USER} pnpm install --frozen-lockfile

echo "[3/4] Building..."
sudo -u ${APP_USER} pnpm build

echo "[4/4] Restarting service..."
systemctl restart procure-parts
sleep 2
systemctl status procure-parts --no-pager -l

echo ""
echo "  Deployed successfully."
echo "  Logs: journalctl -u procure-parts -f"
echo ""
