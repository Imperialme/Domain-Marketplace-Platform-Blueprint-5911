# Procure.parts — Deployment Guide

This guide covers deploying Procure.parts to your VPS with Plesk or a standalone Node.js server.

---

## Pre-Deployment Checklist

- [ ] Node.js 22+ installed on your VPS
- [ ] MySQL 8.0+ or TiDB database created
- [ ] Domain name pointed to your VPS IP
- [ ] SSL certificate configured (Let's Encrypt recommended)
- [ ] SMTP credentials obtained (Gmail, SendGrid, etc.)
- [ ] S3 bucket created (or equivalent file storage)
- [ ] Manus OAuth credentials (from Manus platform)

---

## Option 1: Deploy via GitHub (Recommended)

### Step 1 — Export Code to GitHub

1. In Manus Management UI → Settings → GitHub
2. Connect your GitHub account
3. Export the project to a new repository
4. Choose repository name: `procure-parts`
5. Choose owner: your GitHub username

### Step 2 — Clone on Your VPS

```bash
# SSH into your VPS
ssh user@your-vps-ip

# Clone the repository
git clone https://github.com/your-username/procure-parts.git
cd procure-parts

# Install dependencies
pnpm install

# Build the project
pnpm build
```

### Step 3 — Configure Environment Variables

Create a `.env.production` file in the project root:

```bash
# Database
DATABASE_URL=mysql://procure_user:strong_password@localhost:3306/procure_parts

# JWT & Auth
JWT_SECRET=your-random-jwt-secret-key-here
VITE_APP_ID=your-manus-app-id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://login.manus.im
OWNER_OPEN_ID=your-manus-user-id
OWNER_NAME="Your Name"

# Manus APIs
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=your-forge-api-key
VITE_FRONTEND_FORGE_API_KEY=your-frontend-api-key
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im

# SMTP Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@procure.parts

# Platform URL
PLATFORM_URL=https://procure.parts

# Optional: PayPal
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-secret
```

### Step 4 — Run the Server

```bash
# Start in production mode
NODE_ENV=production pnpm start

# Or use PM2 for process management
npm install -g pm2
pm2 start "NODE_ENV=production pnpm start" --name procure-parts
pm2 save
pm2 startup
```

### Step 5 — Configure Reverse Proxy (Nginx)

If using Nginx on your VPS:

```nginx
server {
    listen 80;
    server_name procure.parts;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name procure.parts;
    
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Reload Nginx:
```bash
sudo systemctl reload nginx
```

---

## Option 2: Deploy via Plesk

### Step 1 — Upload Project Files

1. Download `procure-parts-complete.zip` from Manus
2. In Plesk → File Manager → upload the ZIP
3. Extract the ZIP in the document root

### Step 2 — Create Node.js Application

1. In Plesk → Applications → Node.js
2. Click "Add Application"
3. Configure:
   - **Application name:** `procure-parts`
   - **Application root:** `/procure-parts`
   - **Startup file:** `dist/server.js`
   - **Node.js version:** 22.x or latest

### Step 3 — Install Dependencies

In Plesk → Terminal (or SSH):

```bash
cd /var/www/vhosts/your-domain.com/procure-parts
pnpm install
pnpm build
```

### Step 4 — Set Environment Variables

In Plesk → Node.js Settings → Environment Variables, add:

```
DATABASE_URL=mysql://procure_user:password@localhost/procure_parts
JWT_SECRET=your-random-secret
VITE_APP_ID=your-manus-app-id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://login.manus.im
OWNER_OPEN_ID=your-manus-user-id
OWNER_NAME=Your Name
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=your-forge-key
VITE_FRONTEND_FORGE_API_KEY=your-frontend-key
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@procure.parts
PLATFORM_URL=https://procure.parts
NODE_ENV=production
```

### Step 5 — Restart Application

In Plesk → Node.js → Restart Application

---

## Option 3: Deploy via Manual ZIP Upload

### Step 1 — Download & Upload

1. Download `procure-parts-complete.zip`
2. SCP to your VPS:
   ```bash
   scp procure-parts-complete.zip user@your-vps-ip:/home/user/
   ```

### Step 2 — Extract & Install

```bash
cd /home/user
unzip procure-parts-complete.zip
cd procure-parts
pnpm install
pnpm build
```

### Step 3 — Create Systemd Service

Create `/etc/systemd/system/procure-parts.service`:

```ini
[Unit]
Description=Procure.parts Application
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/home/user/procure-parts
EnvironmentFile=/home/user/procure-parts/.env.production
ExecStart=/usr/local/bin/node dist/server.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl daemon-reload
sudo systemctl enable procure-parts
sudo systemctl start procure-parts
sudo systemctl status procure-parts
```

---

## Database Setup

### Create Database

```bash
mysql -u root -p

CREATE DATABASE procure_parts CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'procure_user'@'localhost' IDENTIFIED BY 'strong_password_here';
GRANT ALL PRIVILEGES ON procure_parts.* TO 'procure_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Apply Migrations

The database schema is automatically applied on first server start. If you need to manually apply migrations:

```bash
# Generate migration SQL (if schema changed)
pnpm drizzle-kit generate

# Apply migrations manually via MySQL client
mysql -u procure_user -p procure_parts < drizzle/migrations/0001_initial.sql
```

---

## SSL Certificate Setup

### Using Let's Encrypt (Free)

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Get certificate
sudo certbot certonly --nginx -d procure.parts

# Auto-renew
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

### Using Plesk

1. Plesk → Domains → your-domain.com
2. SSL/TLS Certificates → Get Free Certificate (Let's Encrypt)
3. Auto-renewal is enabled by default

---

## Monitoring & Logs

### View Application Logs

**Systemd:**
```bash
sudo journalctl -u procure-parts -f
```

**PM2:**
```bash
pm2 logs procure-parts
```

**Plesk:**
Plesk → Node.js → Logs

### Monitor Server Health

```bash
# Check if server is running
curl https://procure.parts/api/trpc/auth.me

# Check database connection
mysql -u procure_user -p procure_parts -e "SELECT 1;"

# Check disk space
df -h

# Check memory usage
free -h
```

---

## Backup & Recovery

### Backup Database

```bash
# Full backup
mysqldump -u procure_user -p procure_parts > backup-$(date +%Y%m%d).sql

# Compressed backup
mysqldump -u procure_user -p procure_parts | gzip > backup-$(date +%Y%m%d).sql.gz
```

### Backup Application Files

```bash
# Tar the project
tar -czf procure-parts-backup-$(date +%Y%m%d).tar.gz /home/user/procure-parts

# Upload to S3 or external storage
aws s3 cp procure-parts-backup-*.tar.gz s3://your-backup-bucket/
```

### Restore from Backup

```bash
# Restore database
mysql -u procure_user -p procure_parts < backup-20260626.sql

# Restore files
tar -xzf procure-parts-backup-20260626.tar.gz -C /home/user/
```

---

## Troubleshooting

### Server won't start

**Error:** `EADDRINUSE: address already in use :::3000`

```bash
# Kill process on port 3000
sudo lsof -i :3000
sudo kill -9 <PID>

# Or use a different port
PORT=3001 NODE_ENV=production pnpm start
```

### Database connection fails

**Error:** `ER_ACCESS_DENIED_FOR_USER`

```bash
# Verify credentials
mysql -u procure_user -p -h localhost procure_parts -e "SELECT 1;"

# Check DATABASE_URL format
echo $DATABASE_URL
```

### Emails not sending

**Error:** `SMTP connection failed`

```bash
# Test SMTP credentials
telnet smtp.gmail.com 587

# Check environment variables
env | grep SMTP

# Verify Gmail app password is generated (if using Gmail)
```

### High memory usage

```bash
# Check process memory
ps aux | grep node

# Restart application
sudo systemctl restart procure-parts

# Or with PM2
pm2 restart procure-parts
```

---

## Performance Tuning

### Increase Node.js Memory Limit

```bash
NODE_OPTIONS="--max-old-space-size=2048" pnpm start
```

### Enable Gzip Compression

Add to Nginx config:

```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript;
gzip_min_length 1000;
```

### Database Query Optimization

Ensure indexes exist:

```sql
CREATE INDEX idx_rfqs_company ON rfqs(companyId);
CREATE INDEX idx_rfqs_status ON rfqs(status);
CREATE INDEX idx_quotations_rfq ON quotations(rfqId);
CREATE INDEX idx_vendors_user ON vendors(userId);
```

---

## Support

For deployment issues:
- Check `.env.production` for missing variables
- Review server logs: `journalctl -u procure-parts -f`
- Verify database connectivity: `mysql -u procure_user -p procure_parts -e "SELECT 1;"`
- Contact Manus support: https://help.manus.im

---

## Next Steps After Deployment

1. **Test the full flow:**
   - Submit a buyer application
   - Approve it in Admin Console
   - Submit an RFQ
   - Build a quotation
   - Download PDF/Excel

2. **Configure email:**
   - Test SMTP by sending a test email
   - Verify all email templates render correctly

3. **Add real data:**
   - Populate Parts DNA with your supplier catalog
   - Add blog posts for SEO

4. **Monitor performance:**
   - Set up uptime monitoring (UptimeRobot, Pingdom)
   - Configure alerts for errors
   - Track database query performance

5. **Onboard first users:**
   - Invite 3–5 test buyers
   - Invite 3–5 test vendors
   - Run a complete RFQ cycle end-to-end
