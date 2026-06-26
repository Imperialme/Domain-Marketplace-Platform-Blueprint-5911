#!/bin/bash
# =============================================================================
# Procure.parts — Daily Backup Script
# Cron: 0 2 * * * /var/www/procure-parts/deploy/backup.sh
# =============================================================================

set -e

APP_DIR="/var/www/procure-parts"
BACKUP_DIR="/var/backups/procure-parts"
DATE=$(date +%Y%m%d_%H%M%S)
KEEP_DAYS=14

mkdir -p "${BACKUP_DIR}"

# Load env to get DB credentials
source "${APP_DIR}/.env.production"

# Parse DATABASE_URL: mysql://user:pass@host:port/db
DB_USER=$(echo "$DATABASE_URL" | sed -E 's|mysql://([^:]+):.*|\1|')
DB_PASS=$(echo "$DATABASE_URL" | sed -E 's|mysql://[^:]+:([^@]+)@.*|\1|')
DB_HOST=$(echo "$DATABASE_URL" | sed -E 's|.*@([^:/]+).*|\1|')
DB_PORT=$(echo "$DATABASE_URL" | sed -E 's|.*:([0-9]+)/.*|\1|')
DB_NAME=$(echo "$DATABASE_URL" | sed -E 's|.*/([^?]+)|\1|')

echo "[$(date)] Starting backup..."

# Database dump
DUMP_FILE="${BACKUP_DIR}/db_${DATE}.sql.gz"
mysqldump -u"${DB_USER}" -p"${DB_PASS}" -h"${DB_HOST}" -P"${DB_PORT}" \
  --single-transaction --quick --lock-tables=false \
  "${DB_NAME}" | gzip > "${DUMP_FILE}"
echo "[$(date)] DB dump: ${DUMP_FILE}"

# App files (exclude node_modules and dist)
APP_FILE="${BACKUP_DIR}/app_${DATE}.tar.gz"
tar --exclude="${APP_DIR}/node_modules" \
    --exclude="${APP_DIR}/dist" \
    --exclude="${APP_DIR}/.git" \
    -czf "${APP_FILE}" -C /var/www procure-parts
echo "[$(date)] App backup: ${APP_FILE}"

# Remove backups older than KEEP_DAYS
find "${BACKUP_DIR}" -name "*.sql.gz" -mtime +${KEEP_DAYS} -delete
find "${BACKUP_DIR}" -name "*.tar.gz" -mtime +${KEEP_DAYS} -delete
echo "[$(date)] Pruned backups older than ${KEEP_DAYS} days."

# Report disk usage
du -sh "${BACKUP_DIR}"
echo "[$(date)] Backup complete."
