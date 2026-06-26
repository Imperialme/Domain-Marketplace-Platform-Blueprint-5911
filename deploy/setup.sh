#!/bin/bash
# =============================================================================
# Procure.parts — One-Shot Server Setup for Contabo VPS (Ubuntu 22.04)
# Run once as root: bash setup.sh
# =============================================================================

set -e

APP_USER="procure"
APP_DIR="/var/www/procure-parts"
DOMAIN="${DOMAIN:-procure.parts}"
NODE_VERSION="22"

echo ""
echo "============================================="
echo "  Procure.parts — Contabo VPS Setup"
echo "============================================="
echo ""

# ── 1. System packages ────────────────────────────────────────────────────────
echo "[1/9] Updating system packages..."
apt-get update -qq
apt-get upgrade -y -qq
apt-get install -y -qq \
  curl wget git unzip build-essential \
  nginx certbot python3-certbot-nginx \
  ufw fail2ban

# ── 2. Node.js 22 ─────────────────────────────────────────────────────────────
echo "[2/9] Installing Node.js ${NODE_VERSION}..."
if ! command -v node &>/dev/null || [[ "$(node -v)" != v${NODE_VERSION}* ]]; then
  curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
  apt-get install -y nodejs
fi
echo "  Node: $(node -v) | npm: $(npm -v)"

# ── 3. pnpm ───────────────────────────────────────────────────────────────────
echo "[3/9] Installing pnpm..."
npm install -g pnpm@latest --silent
echo "  pnpm: $(pnpm -v)"

# ── 4. MySQL 8 ────────────────────────────────────────────────────────────────
echo "[4/9] Installing MySQL 8..."
if ! command -v mysql &>/dev/null; then
  apt-get install -y -qq mysql-server
  systemctl enable mysql
  systemctl start mysql
fi

# Create database + user (skip if already exists)
DB_PASS=$(openssl rand -base64 24 | tr -d '/+=')
mysql -u root <<EOF
CREATE DATABASE IF NOT EXISTS procure_parts CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'procure_user'@'localhost' IDENTIFIED BY '${DB_PASS}';
GRANT ALL PRIVILEGES ON procure_parts.* TO 'procure_user'@'localhost';
FLUSH PRIVILEGES;
EOF

# Write credentials to a temp file for reference
echo "DB_PASS=${DB_PASS}" > /root/procure-db-credentials.txt
chmod 600 /root/procure-db-credentials.txt
echo "  MySQL ready. DB password saved to /root/procure-db-credentials.txt"

# ── 5. App user + directory ───────────────────────────────────────────────────
echo "[5/9] Creating app user and directory..."
if ! id "${APP_USER}" &>/dev/null; then
  useradd -r -m -d /home/${APP_USER} -s /bin/bash ${APP_USER}
fi
mkdir -p "${APP_DIR}"
chown -R ${APP_USER}:${APP_USER} "${APP_DIR}"

# ── 6. Clone / pull repo ──────────────────────────────────────────────────────
echo "[6/9] Setting up application files..."
if [ -d "${APP_DIR}/.git" ]; then
  echo "  Repo exists — pulling latest..."
  sudo -u ${APP_USER} git -C "${APP_DIR}" pull origin main
else
  echo "  Cloning repository..."
  echo "  !! Set your GitHub repo URL below before running:"
  REPO_URL="${REPO_URL:-https://github.com/Imperialme/Domain-Marketplace-Platform-Blueprint-5911.git}"
  sudo -u ${APP_USER} git clone "${REPO_URL}" "${APP_DIR}"
fi

# ── 7. Environment file ───────────────────────────────────────────────────────
echo "[7/9] Setting up environment variables..."
if [ ! -f "${APP_DIR}/.env.production" ]; then
  DB_PASS_SAVED=$(grep DB_PASS /root/procure-db-credentials.txt | cut -d= -f2)
  cat > "${APP_DIR}/.env.production" <<ENVEOF
# ── Database ──────────────────────────────────────────────────────────────────
DATABASE_URL=mysql://procure_user:${DB_PASS_SAVED}@127.0.0.1:3306/procure_parts

# ── Auth ──────────────────────────────────────────────────────────────────────
JWT_SECRET=$(openssl rand -base64 48)
VITE_APP_ID=REPLACE_WITH_YOUR_MANUS_APP_ID
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://login.manus.im
OWNER_OPEN_ID=REPLACE_WITH_YOUR_MANUS_OPEN_ID
OWNER_NAME=REPLACE_WITH_YOUR_NAME

# ── Manus AI APIs ─────────────────────────────────────────────────────────────
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=REPLACE_WITH_KEY
VITE_FRONTEND_FORGE_API_KEY=REPLACE_WITH_KEY
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im

# ── SMTP Email ────────────────────────────────────────────────────────────────
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=REPLACE_WITH_YOUR_EMAIL
SMTP_PASS=REPLACE_WITH_APP_PASSWORD
SMTP_FROM=noreply@${DOMAIN}

# ── Platform ──────────────────────────────────────────────────────────────────
PLATFORM_URL=https://${DOMAIN}
NODE_ENV=production
PORT=3000

# ── PayPal (optional) ─────────────────────────────────────────────────────────
# PAYPAL_CLIENT_ID=
# PAYPAL_CLIENT_SECRET=
ENVEOF
  chown ${APP_USER}:${APP_USER} "${APP_DIR}/.env.production"
  chmod 600 "${APP_DIR}/.env.production"
  echo ""
  echo "  !! .env.production created at ${APP_DIR}/.env.production"
  echo "  !! Edit it now to fill in your Manus credentials and SMTP details."
  echo ""
fi

# ── 8. Install deps + build ───────────────────────────────────────────────────
echo "[8/9] Installing dependencies and building..."
cd "${APP_DIR}"
sudo -u ${APP_USER} pnpm install --frozen-lockfile
sudo -u ${APP_USER} pnpm build

# ── 9. Systemd service ────────────────────────────────────────────────────────
echo "[9/9] Installing systemd service..."
cp "${APP_DIR}/deploy/procure-parts.service" /etc/systemd/system/procure-parts.service
systemctl daemon-reload
systemctl enable procure-parts
systemctl restart procure-parts

# ── Nginx ─────────────────────────────────────────────────────────────────────
echo ""
echo "Setting up Nginx..."
cp "${APP_DIR}/deploy/nginx.conf" /etc/nginx/sites-available/procure-parts
ln -sf /etc/nginx/sites-available/procure-parts /etc/nginx/sites-enabled/procure-parts
rm -f /etc/nginx/sites-enabled/default
sed -i "s/__DOMAIN__/${DOMAIN}/g" /etc/nginx/sites-available/procure-parts
nginx -t && systemctl reload nginx

# ── Firewall ──────────────────────────────────────────────────────────────────
echo "Configuring firewall..."
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

# ── SSL ───────────────────────────────────────────────────────────────────────
echo ""
echo "============================================="
echo "  NEXT STEP: Get SSL certificate"
echo "  Run: certbot --nginx -d ${DOMAIN}"
echo "============================================="
echo ""
echo "============================================="
echo "  Setup complete!"
echo ""
echo "  1. Edit ${APP_DIR}/.env.production"
echo "     (fill in Manus credentials + SMTP)"
echo "  2. Run: certbot --nginx -d ${DOMAIN}"
echo "  3. Run: systemctl restart procure-parts"
echo "  4. Check status: systemctl status procure-parts"
echo "============================================="
