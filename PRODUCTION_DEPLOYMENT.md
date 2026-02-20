# 🚀 Production Deployment Guide

**Eastern Estate ERP - Complete Production Setup Guide**

---

## 📋 Overview

This guide will help you deploy the Eastern Estate ERP system to your production server with proper environment configurations and initial user setup.

---

## 🎯 Pre-Deployment Checklist

### Server Requirements
- [ ] Ubuntu 20.04+ or similar Linux distribution
- [ ] Node.js 20.x LTS installed
- [ ] PostgreSQL 14+ installed and running
- [ ] Nginx or Caddy (for reverse proxy)
- [ ] SSL certificate for HTTPS
- [ ] Domain name configured and pointing to server

### Required Access
- [ ] SSH access to production server
- [ ] Database credentials
- [ ] Google Cloud Console access (for OAuth)
- [ ] Git repository access

---

## 📝 Step 1: Environment Configuration

### Backend Environment Variables

1. **Copy production environment template:**
```bash
cd backend
cp .env.production .env
```

2. **Edit `.env` with your production values:**
```bash
nano .env
```

3. **Required configurations:**

```env
# ============================================
# DATABASE - Replace with your production DB
# ============================================
DATABASE_HOST=your-db-host.example.com
DATABASE_PORT=5432
DATABASE_USERNAME=your_db_user
DATABASE_PASSWORD=your_secure_db_password
DATABASE_NAME=eastern_estate_erp

# ============================================
# JWT SECRETS - Generate NEW secure secrets!
# ============================================
# Run: openssl rand -base64 32
JWT_SECRET=your_generated_jwt_secret_min_32_chars
JWT_EXPIRATION=24h
JWT_REFRESH_SECRET=your_generated_refresh_secret_min_32_chars
JWT_REFRESH_EXPIRATION=7d

# ============================================
# GOOGLE OAUTH - Production credentials
# ============================================
GOOGLE_CLIENT_ID=your-prod-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-prod-client-secret
GOOGLE_CALLBACK_URL=https://yourdomain.com/api/v1/auth/google/callback
FRONTEND_URL=https://yourdomain.com

# ============================================
# SERVER
# ============================================
PORT=3001
NODE_ENV=production

# ============================================
# CORS - Your production domain(s)
# ============================================
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### Frontend Environment Variables

1. **Copy production environment template:**
```bash
cd frontend
cp .env.production .env.local
```

2. **Content should be:**
```env
# Use relative path - Nginx/Caddy will proxy /api/v1 to backend
NEXT_PUBLIC_API_URL=/api/v1
```

---

## 🔧 Step 2: Generate Secure Secrets

Run these commands on your server to generate secure secrets:

```bash
# Generate JWT Secret
openssl rand -base64 32

# Generate JWT Refresh Secret
openssl rand -base64 32
```

Copy the outputs and replace the values in your backend `.env` file.

---

## 🔐 Step 3: Google OAuth Setup

### Update Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to: **APIs & Services > Credentials**
4. Edit your OAuth 2.0 Client ID
5. **Update Authorized JavaScript origins:**
   ```
   https://yourdomain.com
   ```
6. **Update Authorized redirect URIs:**
   ```
   https://yourdomain.com/api/v1/auth/google/callback
   ```
7. Click **Save**

### Wait for Propagation
Google OAuth changes can take 5-10 minutes to propagate globally.

---

## 🗄️ Step 4: Database Setup

### 1. Create Production Database

```bash
# SSH into your server
ssh user@your-server.com

# Switch to postgres user
sudo -u postgres psql

# Create database
CREATE DATABASE eastern_estate_erp;

# Create user (if needed)
CREATE USER your_db_user WITH ENCRYPTED PASSWORD 'your_secure_password';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE eastern_estate_erp TO your_db_user;

# Exit psql
\q
```

### 2. Run Migrations

```bash
cd /path/to/backend

# Install dependencies
npm install

# Run all migrations
npm run migration:run
```

### 3. Seed Initial Users

Create the three initial admin users:

```bash
# Run the production user seed script
psql -d eastern_estate_erp -U your_db_user -f src/database/seeds/production-users.sql
```

This will create:
- **info@eecd.in** - Super Admin (full access)
- **arnav@eecd.in** - Admin (operational management)
- **hr@eecd.in** - HR (human resources)

**Default passwords:**
- `info@easternestate`
- `arnav@easternestate`
- `hr@easternestate`

⚠️ **IMPORTANT:** Change all passwords immediately after first login!

---

## 🏗️ Step 5: Build Applications

### Build Backend

```bash
cd backend
npm install --production=false
npm run build
```

### Build Frontend

```bash
cd frontend
npm install --production=false
npm run build
```

---

## 🚀 Step 6: Configure Reverse Proxy

Choose either Nginx or Caddy:

### Option A: Nginx Configuration

Create `/etc/nginx/sites-available/eastern-estate`:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration
    ssl_certificate /path/to/fullchain.pem;
    ssl_certificate_key /path/to/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api/v1 {
        proxy_pass http://localhost:3001/api/v1;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend uploads
    location /uploads {
        proxy_pass http://localhost:3001/uploads;
        proxy_set_header Host $host;
    }
}
```

Enable and restart:
```bash
sudo ln -s /etc/nginx/sites-available/eastern-estate /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Option B: Caddy Configuration (Recommended)

Create `/etc/caddy/Caddyfile`:

```caddy
yourdomain.com {
    # Frontend
    reverse_proxy / localhost:3000

    # Backend API
    reverse_proxy /api/v1* localhost:3001

    # Backend uploads
    reverse_proxy /uploads* localhost:3001

    # Automatic HTTPS
    tls your-email@eecd.in
}
```

Restart Caddy:
```bash
sudo systemctl restart caddy
```

---

## 🔄 Step 7: Process Management (PM2)

### Install PM2

```bash
npm install -g pm2
```

### Create Backend PM2 Config

Create `backend/ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'eastern-estate-backend',
    script: 'dist/main.js',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
    },
    error_file: './logs/backend-error.log',
    out_file: './logs/backend-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
  }],
};
```

### Create Frontend PM2 Config

Create `frontend/ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'eastern-estate-frontend',
    script: 'npm',
    args: 'start',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
    },
    error_file: './logs/frontend-error.log',
    out_file: './logs/frontend-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
  }],
};
```

### Start Applications

```bash
# Backend
cd backend
pm2 start ecosystem.config.js

# Frontend
cd frontend
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

---

## ✅ Step 8: Verification

### 1. Check Services

```bash
# Check PM2 processes
pm2 list

# Check backend logs
pm2 logs eastern-estate-backend --lines 50

# Check frontend logs
pm2 logs eastern-estate-frontend --lines 50
```

### 2. Test Application

1. **Access frontend:** `https://yourdomain.com`
2. **Test login:** Use `info@eecd.in` / `info@easternestate`
3. **Test Google OAuth:** Click "Sign in with Google"
4. **Test API:** `https://yourdomain.com/api/v1/health` (if you have a health endpoint)

### 3. Verify Database Users

```bash
psql -d eastern_estate_erp -c "SELECT email, username, is_active FROM users WHERE email IN ('info@eecd.in', 'arnav@eecd.in', 'hr@eecd.in');"
```

---

## 🔐 Step 9: Security Hardening

### Change Default Passwords

1. Login as each user
2. Go to Profile → Change Password
3. Update to strong passwords
4. Save securely

### Update Database Passwords

After users change passwords from the UI, they're automatically updated in the database.

### Firewall Configuration

```bash
# Allow SSH, HTTP, HTTPS
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Block direct access to backend port from outside
sudo ufw deny 3001/tcp

# Enable firewall
sudo ufw enable
```

### Database Security

```bash
# Edit PostgreSQL config
sudo nano /etc/postgresql/14/main/pg_hba.conf

# Ensure these settings:
# local   all             postgres                                peer
# host    all             all             127.0.0.1/32            scram-sha-256
# host    all             all             ::1/128                 scram-sha-256

# Restart PostgreSQL
sudo systemctl restart postgresql
```

---

## 🔄 Step 10: Backup Configuration

### Automated Database Backups

Create `/usr/local/bin/backup-eastern-estate.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/eastern-estate"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="eastern_estate_erp"
DB_USER="your_db_user"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
pg_dump -U $DB_USER -F c $DB_NAME > $BACKUP_DIR/db_backup_$DATE.dump

# Keep only last 7 days
find $BACKUP_DIR -name "db_backup_*.dump" -mtime +7 -delete

echo "Backup completed: $DATE"
```

Make executable:
```bash
sudo chmod +x /usr/local/bin/backup-eastern-estate.sh
```

Add to crontab (daily at 2 AM):
```bash
sudo crontab -e

# Add this line:
0 2 * * * /usr/local/bin/backup-eastern-estate.sh >> /var/log/eastern-estate-backup.log 2>&1
```

---

## 🚨 Troubleshooting

### Backend Won't Start

```bash
# Check logs
pm2 logs eastern-estate-backend

# Common issues:
# 1. Database connection failed - check DATABASE_* env vars
# 2. Port already in use - check: lsof -i :3001
# 3. Missing dependencies - run: npm install
```

### Frontend Won't Start

```bash
# Check logs
pm2 logs eastern-estate-frontend

# Common issues:
# 1. Backend API unreachable - verify NEXT_PUBLIC_API_URL
# 2. Build failed - run: npm run build
# 3. Port already in use - check: lsof -i :3000
```

### Google OAuth Not Working

1. **Verify callback URL** in Google Console matches exactly
2. **Check CORS_ORIGINS** includes your domain
3. **Wait 5-10 minutes** for Google changes to propagate
4. **Test with incognito** to avoid cached credentials

### Database Connection Failed

```bash
# Test connection
psql -h your-db-host -U your_db_user -d eastern_estate_erp

# Check PostgreSQL is running
sudo systemctl status postgresql

# Check PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-14-main.log
```

---

## 📊 Monitoring

### PM2 Monitoring

```bash
# Real-time monitoring
pm2 monit

# Process status
pm2 list

# CPU/Memory usage
pm2 status
```

### Application Logs

```bash
# Backend logs (real-time)
pm2 logs eastern-estate-backend --lines 100

# Frontend logs (real-time)
pm2 logs eastern-estate-frontend --lines 100

# All logs
pm2 logs
```

### Nginx/Caddy Logs

```bash
# Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Caddy
sudo journalctl -u caddy -f
```

---

## 🔄 Deployment Updates

### Update Application

```bash
# Pull latest code
git pull origin main

# Update backend
cd backend
npm install
npm run build
pm2 restart eastern-estate-backend

# Update frontend
cd ../frontend
npm install
npm run build
pm2 restart eastern-estate-frontend

# Verify
pm2 list
```

### Run New Migrations

```bash
cd backend
npm run migration:run
pm2 restart eastern-estate-backend
```

---

## 📧 Initial User Credentials

After running the seed script, you'll have:

| Email | Password | Role | Access Level |
|-------|----------|------|--------------|
| `info@eecd.in` | `info@easternestate` | Super Admin | Full system access |
| `arnav@eecd.in` | `arnav@easternestate` | Admin | Operational management |
| `hr@eecd.in` | `hr@easternestate` | HR | Employee & user management |

⚠️ **CRITICAL:** Change these passwords immediately after first login!

---

## ✅ Post-Deployment Checklist

- [ ] All environment variables configured correctly
- [ ] Database migrations completed successfully
- [ ] Initial users created (3 users)
- [ ] Google OAuth credentials updated in Google Console
- [ ] SSL certificate installed and working
- [ ] Reverse proxy configured (Nginx/Caddy)
- [ ] PM2 processes running and saved
- [ ] Firewall rules configured
- [ ] Default passwords changed for all users
- [ ] Backup script configured and tested
- [ ] Monitoring setup verified
- [ ] Test login with all three users
- [ ] Test Google OAuth with @eecd.in email
- [ ] Verify Google OAuth rejects non-@eecd.in emails

---

## 🎉 Success!

Your Eastern Estate ERP is now running in production!

**Access your application at:** `https://yourdomain.com`

**Next steps:**
1. Change all default passwords
2. Create additional users via HR module or Google OAuth
3. Import property data
4. Configure notification preferences
5. Train your team

---

## 📞 Support

For issues during deployment:
- Check [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) for system details
- Review logs in `/var/log/` and PM2 logs
- Verify environment variables
- Check database connectivity

---

**Last Updated:** February 20, 2026  
**Version:** 1.0
