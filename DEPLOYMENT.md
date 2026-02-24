# 🚀 Production Deployment Guide

**Eastern Estate ERP - Docker Deployment on DigitalOcean**

---

## 📋 Overview

This guide covers deploying the Eastern Estate ERP to production using Docker Compose on DigitalOcean (or any Linux server). The system includes:

- **Frontend:** Next.js (Port 3000)
- **Backend:** NestJS API (Port 3001)
- **Database:** PostgreSQL 14
- **Architecture:** Docker Compose multi-container setup

---

## 🔧 Prerequisites

### On Your Server
- Ubuntu 22.04/24.04 LTS
- Docker & Docker Compose installed
- SSH access with key
- Domain pointed to server (optional, for HTTPS)

### On Your Local Machine
- Git access to repository
- SSH key for server access

---

## 📝 Quick Deployment Steps

### 1. Install Docker on Server

```bash
# SSH to server
# ssh -i ~/Downloads/ERP.pem ubuntu@3.238.49.77
ssh root@143.244.135.165

# Install Docker
sudo apt update
sudo apt install -y docker.io docker-compose-plugin git
sudo systemctl enable --now docker

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker  # or log out and back in
```

### 2. Clone Repository

```bash
cd ~
git clone https://github.com/Harshitarnav/eastern-estate-erp.git
cd eastern-estate-erp
```

### 3. Configure Environment

```bash
# Create .env file from template
cp .env.production.example .env

# Edit with your values
nano .env
```

**Required values in `.env`:**
```env
# Database
DATABASE_USERNAME=eastern_estate
DATABASE_PASSWORD=your_secure_password
DATABASE_NAME=eastern_estate_erp

# JWT Secrets (generate with: openssl rand -base64 32)
JWT_SECRET=your_generated_jwt_secret_32_chars_minimum
JWT_EXPIRATION=24h
JWT_REFRESH_SECRET=your_generated_refresh_secret_32_chars
JWT_REFRESH_EXPIRATION=7d

# Google OAuth (from Google Cloud Console)
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_CALLBACK_URL=https://yourdomain.com/api/v1/auth/google/callback
FRONTEND_URL=https://yourdomain.com

# CORS
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Frontend
NEXT_PUBLIC_API_URL=/api/v1
```

### 4. Build and Deploy

```bash
# Build Docker images
docker compose -f docker-compose.prod.yml build backend frontend

# Start all services
docker compose -f docker-compose.prod.yml up -d --force-recreate backend frontend

# Check status
docker compose -f docker-compose.prod.yml ps

# View logs
docker compose -f docker-compose.prod.yml logs backend --tail 100 -f
```

### 5. Add Initial Admin Users

```bash
# Run SQL to create 3 admin users
docker compose -f docker-compose.prod.yml exec postgres \
  psql -U eastern_estate -d eastern_estate_erp << 'SQL'

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- info@eecd.in (Super Admin)
INSERT INTO users (id, username, email, password_hash, is_active, is_verified, created_at, updated_at)
SELECT uuid_generate_v4(), 'info', 'info@eecd.in',
       crypt('info@easternestate', gen_salt('bf')), true, true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'info@eecd.in');

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u CROSS JOIN roles r
WHERE u.email = 'info@eecd.in' AND r.name = 'super_admin'
AND NOT EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = u.id AND ur.role_id = r.id);

-- arnav@eecd.in (Admin)
INSERT INTO users (id, username, email, password_hash, is_active, is_verified, created_at, updated_at)
SELECT uuid_generate_v4(), 'arnav', 'arnav@eecd.in',
       crypt('arnav@easternestate', gen_salt('bf')), true, true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'arnav@eecd.in');

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u CROSS JOIN roles r
WHERE u.email = 'arnav@eecd.in' AND r.name = 'admin'
AND NOT EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = u.id AND ur.role_id = r.id);

-- hr@eecd.in (HR)
INSERT INTO users (id, username, email, password_hash, is_active, is_verified, created_at, updated_at)
SELECT uuid_generate_v4(), 'hr', 'hr@eecd.in',
       crypt('hr@easternestate', gen_salt('bf')), true, true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'hr@eecd.in');

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u CROSS JOIN roles r
WHERE u.email = 'hr@eecd.in' AND r.name = 'hr'
AND NOT EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = u.id AND ur.role_id = r.id);

-- Grant property access to admins
INSERT INTO user_property_access (user_id, property_id, role, is_active, assigned_by, assigned_at)
SELECT u.id, p.id, 'SUPER_ADMIN', true, u.id, NOW()
FROM users u CROSS JOIN properties p
WHERE u.email = 'info@eecd.in'
AND NOT EXISTS (SELECT 1 FROM user_property_access upa WHERE upa.user_id = u.id AND upa.property_id = p.id);

INSERT INTO user_property_access (user_id, property_id, role, is_active, assigned_by, assigned_at)
SELECT u.id, p.id, 'ADMIN', true, (SELECT id FROM users WHERE email = 'info@eecd.in'), NOW()
FROM users u CROSS JOIN properties p
WHERE u.email = 'arnav@eecd.in'
AND NOT EXISTS (SELECT 1 FROM user_property_access upa WHERE upa.user_id = u.id AND upa.property_id = p.id);

-- Verify users
SELECT email, username, is_active FROM users 
WHERE email IN ('info@eecd.in', 'arnav@eecd.in', 'hr@eecd.in');

SQL
```

**Login Credentials:**
- `info@eecd.in` / `info@easternestate` → Super Admin
- `arnav@eecd.in` / `arnav@easternestate` → Admin
- `hr@eecd.in` / `hr@easternestate` → HR

⚠️ **Change passwords immediately after first login!**

### 6. Verify Deployment

```bash
# Check all containers are running
docker compose -f docker-compose.prod.yml ps

# Check logs for errors
docker compose -f docker-compose.prod.yml logs backend --tail 50
docker compose -f docker-compose.prod.yml logs frontend --tail 50

# Access application
# http://<server-ip>:3000
# https://yourdomain.com (if HTTPS configured)
```

---

## 🔄 Updating Deployment

### Your Standard Update Workflow

```bash
# SSH to server
ssh root@143.244.135.165
cd ~/eastern-estate-erp

# Pull latest changes
git pull origin main

# Rebuild and deploy
docker compose -f docker-compose.prod.yml build backend frontend
docker compose -f docker-compose.prod.yml up -d --force-recreate backend frontend

# Check logs
docker compose -f docker-compose.prod.yml logs backend --tail 200 --since=5m
```

### Using Automated Script

```bash
# From your local machine
./deploy.sh

# Or with user seeding (first time only)
./deploy.sh --with-users
```

---

## 🔧 Common Commands

### Container Management

```bash
# View all services
docker compose -f docker-compose.prod.yml ps

# View logs (follow)
docker compose -f docker-compose.prod.yml logs -f

# View backend logs only
docker compose -f docker-compose.prod.yml logs backend --tail 100 -f

# Restart a service
docker compose -f docker-compose.prod.yml restart backend

# Stop all services
docker compose -f docker-compose.prod.yml down

# Start all services
docker compose -f docker-compose.prod.yml up -d

# Rebuild specific service
docker compose -f docker-compose.prod.yml build backend
docker compose -f docker-compose.prod.yml up -d backend
```

### Database Operations

```bash
# Access PostgreSQL
docker compose -f docker-compose.prod.yml exec postgres \
  psql -U eastern_estate -d eastern_estate_erp

# Run SQL file
docker compose -f docker-compose.prod.yml exec postgres \
  psql -U eastern_estate -d eastern_estate_erp -f /path/to/file.sql

# Backup database
docker compose -f docker-compose.prod.yml exec postgres \
  pg_dump -U eastern_estate eastern_estate_erp > backup.sql

# Restore database
cat backup.sql | docker compose -f docker-compose.prod.yml exec -T postgres \
  psql -U eastern_estate -d eastern_estate_erp

# Check users
docker compose -f docker-compose.prod.yml exec postgres \
  psql -U eastern_estate -d eastern_estate_erp \
  -c "SELECT email, username, is_active FROM users LIMIT 10;"
```

### Debugging

```bash
# Check environment variables
docker compose -f docker-compose.prod.yml exec backend env | grep -E "DATABASE|JWT|GOOGLE"

# Access backend shell
docker compose -f docker-compose.prod.yml exec backend /bin/sh

# Check backend health
curl http://localhost:3001/api/v1/health

# View disk usage
docker system df

# Clean up unused images
docker system prune -a
```

---

## 🌐 HTTPS Setup (Optional but Recommended)

### Using Nginx Reverse Proxy

1. **Install Nginx:**
```bash
sudo apt install -y nginx certbot python3-certbot-nginx
```

2. **Create Nginx config** (`/etc/nginx/sites-available/eastern-estate`):
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    location /api/v1 {
        proxy_pass http://localhost:3001/api/v1;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

3. **Enable site and get SSL:**
```bash
sudo ln -s /etc/nginx/sites-available/eastern-estate /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

4. **Update `.env`:**
```env
GOOGLE_CALLBACK_URL=https://yourdomain.com/api/v1/auth/google/callback
FRONTEND_URL=https://yourdomain.com
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

5. **Redeploy:**
```bash
docker compose -f docker-compose.prod.yml restart backend frontend
```

---

## 🔐 Security Checklist

- [ ] Changed default passwords for all admin users
- [ ] Generated new JWT secrets (not using examples)
- [ ] Configured firewall to block unused ports
- [ ] SSL/TLS certificate installed and working
- [ ] CORS configured with specific domain (not *)
- [ ] Database password is strong and unique
- [ ] Environment variables not committed to git
- [ ] Google OAuth configured with production callback URL
- [ ] Regular backups configured

### Firewall Configuration

```bash
# Allow SSH, HTTP, HTTPS
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Block direct access to backend and database
# (only accessible via Nginx proxy)
sudo ufw deny 3001/tcp
sudo ufw deny 5432/tcp

# Enable firewall
sudo ufw enable
```

---

## 🚨 Troubleshooting

### Backend Won't Start

```bash
# Check logs
docker compose -f docker-compose.prod.yml logs backend

# Common issues:
# 1. Database connection failed - check DATABASE_* in .env
# 2. Port already in use - check: lsof -i :3001
# 3. Missing dependencies - rebuild: docker compose build backend
```

### Frontend Won't Start

```bash
# Check logs
docker compose -f docker-compose.prod.yml logs frontend

# Common issues:
# 1. NEXT_PUBLIC_API_URL not set correctly
# 2. Build failed - check: docker compose build frontend
# 3. Backend not accessible - verify backend is running
```

### Build Fails with Network Error (ECONNRESET)

This is a common issue during `npm ci` due to network timeouts:

```bash
# Solution 1: Simply retry (often works)
docker compose -f docker-compose.prod.yml build frontend

# Solution 2: Clear cache and rebuild
docker compose -f docker-compose.prod.yml build --no-cache frontend

# Solution 3: Build with increased memory
docker compose -f docker-compose.prod.yml build frontend --memory=4g

# Solution 4: Check if DNS is working
docker run --rm node:20 ping -c 3 registry.npmjs.org

# Solution 5: If DNS fails, add Google DNS to /etc/docker/daemon.json:
# {
#   "dns": ["8.8.8.8", "8.8.4.4"]
# }
# Then: sudo systemctl restart docker
```

**Note:** The Dockerfiles have been updated with increased timeouts and retries to handle network issues better.

### Database Connection Failed

```bash
# Check database is running
docker compose -f docker-compose.prod.yml ps postgres

# Test connection
docker compose -f docker-compose.prod.yml exec postgres \
  psql -U eastern_estate -d eastern_estate_erp -c "SELECT 1;"

# Check logs
docker compose -f docker-compose.prod.yml logs postgres
```

### Google OAuth Not Working

1. Verify callback URL in `.env` matches Google Console exactly
2. Check CORS_ORIGINS includes your domain
3. Wait 5-10 minutes after changing Google Console settings
4. Test with incognito window to avoid cached credentials

---

## 📊 Monitoring & Maintenance

### Automated Backups

Create `/usr/local/bin/backup-eastern-estate.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/eastern-estate"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup database
docker compose -f ~/eastern-estate-erp/docker-compose.prod.yml exec -T postgres \
  pg_dump -U eastern_estate eastern_estate_erp | gzip > $BACKUP_DIR/db_backup_$DATE.sql.gz

# Keep only last 7 days
find $BACKUP_DIR -name "db_backup_*.sql.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
```

Make executable and add to crontab:

```bash
sudo chmod +x /usr/local/bin/backup-eastern-estate.sh

# Add to crontab (daily at 2 AM)
sudo crontab -e
# Add: 0 2 * * * /usr/local/bin/backup-eastern-estate.sh >> /var/log/eastern-estate-backup.log 2>&1
```

### Health Monitoring

```bash
# Check container health
docker compose -f docker-compose.prod.yml ps

# Check disk usage
df -h

# Check memory usage
free -h

# Check Docker stats
docker stats --no-stream
```

---

## 📚 Additional Resources

- **System Overview:** See [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)
- **Google OAuth Setup:** See Google Cloud Console documentation
- **Docker Documentation:** https://docs.docker.com/

---

## 🎯 Summary

**Deployment time:** ~15-20 minutes

**Key files:**
- `docker-compose.prod.yml` - Docker orchestration
- `.env` - Production environment variables
- `deploy.sh` - Automated deployment script

**Your workflow:**
1. Make changes locally
2. Commit and push to GitHub
3. SSH to server, pull changes
4. Run deploy commands
5. Verify deployment

---

**Last Updated:** February 20, 2026  
**Server:** DigitalOcean (3.238.49.77)  
**Version:** 1.0

---

<!-- 
═══════════════════════════════════════════════════════════════
QUICK REFERENCE COMMANDS (COMMENTED FOR EASY ACCESS)
═══════════════════════════════════════════════════════════════

SSH TO SERVER:
ssh root@143.244.135.165
cd ~/eastern-estate-erp

STANDARD DEPLOYMENT:
git pull origin main
docker compose -f docker-compose.prod.yml build backend frontend
docker compose -f docker-compose.prod.yml up -d --force-recreate backend frontend

VIEW LOGS:
docker compose -f docker-compose.prod.yml logs backend --tail 200 --since=5m
docker compose -f docker-compose.prod.yml logs frontend --tail 100 -f

═══════════════════════════════════════════════════════════════
JWT SECRET (for reference):
JWT_SECRET=6da8009d14f4138fb04cce03ee401217b2f00fcbfe093c4c8118e1519d3b9de9
═══════════════════════════════════════════════════════════════

REPOSITORY:
git clone https://github.com/Harshitarnav/eastern-estate-erp.git

═══════════════════════════════════════════════════════════════
SEEDING USERS ON SERVER:
═══════════════════════════════════════════════════════════════

docker compose -f docker-compose.prod.yml exec backend node dist/database/seeds/seed-runner.js

VERIFY USERS EXIST:
docker compose -f docker-compose.prod.yml exec postgres \
  psql -U eastern_estate -d eastern_estate_erp \
  -c "select email, username from users limit 5;"

═══════════════════════════════════════════════════════════════
INITIAL ADMIN ACCOUNTS (from earlier setup):
═══════════════════════════════════════════════════════════════

SUPER_ADMIN          | Email: superadmin@easternestates.com       | Password: Password@123
ADMIN                | Email: admin@easternestates.com            | Password: Password@123
ACCOUNTANT           | Email: accountant@easternestates.com       | Password: Password@123
SALES_MANAGER        | Email: salesmanager@easternestates.com     | Password: Password@123
SALES_EXECUTIVE      | Email: salesexec@easternestates.com        | Password: Password@123
MARKETING_MANAGER    | Email: marketing@easternestates.com        | Password: Password@123
CONSTRUCTION_MANAGER | Email: construction@easternestates.com     | Password: Password@123
STORE_KEEPER         | Email: storekeeper@easternestates.com      | Password: Password@123
HR_MANAGER           | Email: hr@easternestates.com               | Password: Password@123

═══════════════════════════════════════════════════════════════
LOCAL DEVELOPMENT WORKFLOW:
═══════════════════════════════════════════════════════════════

Set environment variables (one-time per shell):
export NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
export CORS_ORIGINS=http://localhost:3000

Start dependencies via Docker:
docker compose -f docker-compose.prod.yml up -d postgres redis minio

Run backend in watch mode (hot reload):
cd backend
npm install        # first time only
npm run start:dev  # NestJS auto-reloads on save

Run frontend in dev mode (hot reload):
cd ../frontend
npm install        # first time only
npm run dev        # Next.js auto-reloads on save

Then open http://localhost:3000

Change code, hit Save, and refresh browser - both will rebuild automatically.

CLEAN LOCAL DB (destructive):
docker compose -f docker-compose.prod.yml down -v
docker compose -f docker-compose.prod.yml up -d postgres redis minio

Use npm run dev + npm run start:dev for rapid feedback; only use docker compose build 
when you need a production image.

═══════════════════════════════════════════════════════════════
PUBLIC LEADS API (for external React booking forms):
═══════════════════════════════════════════════════════════════

URL: https://<your-domain>/api/v1/leads/public
Headers: 
  Content-Type: application/json
  x-public-token: <YOUR_PUBLIC_LEAD_TOKEN>

Payload:
{
  "firstName": "Jane",
  "lastName": "Doe",
  "email": "jane@example.com",
  "phone": "9999999999",
  "source": "WEBSITE",
  "propertyId": "<optional-property-uuid>",
  "notes": "Came from booking form on site"
}

React example:
async function submitLead(form) {
  const payload = {
    firstName: form.firstName,
    lastName: form.lastName,
    email: form.email,
    phone: form.phone,
    source: 'WEBSITE',
    notes: form.notes || 'From booking form',
    propertyId: form.propertyId || undefined,
  };

  const res = await fetch('https://<your-domain>/api/v1/leads/public', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-public-token': '<YOUR_PUBLIC_LEAD_TOKEN>',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Lead submit failed');
  }
  return res.json();
}

Security notes:
- Do not expose admin JWTs. Use the one-purpose x-public-token.
- Consider spam protection (honeypot field, rate limit, reCAPTCHA).
- Validate email/phone client-side before sending.

Test with curl:
curl -X POST https://<your-domain>/api/v1/leads/public \
  -H "Content-Type: application/json" \
  -H "x-public-token: <YOUR_PUBLIC_LEAD_TOKEN>" \
  -d '{"firstName":"Test","lastName":"User","email":"test@example.com","phone":"9999999999","source":"WEBSITE"}'

Once wired, submissions from React booking form will create leads in the system.

═══════════════════════════════════════════════════════════════
-->
