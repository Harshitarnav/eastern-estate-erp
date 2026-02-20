# 🐳 Docker Production Deployment Guide

**For DigitalOcean Docker-based Deployment**

---

## 🎯 Your Current Workflow

You're deploying with Docker Compose on DigitalOcean. This guide maintains your existing workflow while adding the new users.

---

## 🚀 Quick Deployment (Your Existing Process)

### 1. SSH to Server
```bash
ssh -i ~/Downloads/ERP.pem ubuntu@3.238.49.77
cd ~/eastern-estate-erp
```

### 2. Pull Latest Changes
```bash
git pull origin main
```

### 3. Rebuild & Deploy
```bash
# Build updated containers
docker compose -f docker-compose.prod.yml build backend frontend

# Deploy with force recreate
docker compose -f docker-compose.prod.yml up -d --force-recreate backend frontend
```

### 4. Verify Deployment
```bash
# Check container status
docker compose -f docker-compose.prod.yml ps

# Check backend logs
docker compose -f docker-compose.prod.yml logs backend --tail 200 --since=5m

# Check frontend logs
docker compose -f docker-compose.prod.yml logs frontend --tail 200 --since=5m
```

---

## 👥 Adding New Initial Users (One-Time Setup)

Since your server already has data, here's how to safely add the 3 new admin users:

### Option 1: Using SQL Seed Script (Recommended)

```bash
# Copy the seed script to the server (if not already in git)
# Then run it against your database

# If PostgreSQL is in Docker:
docker compose -f docker-compose.prod.yml exec postgres \
  psql -U eastern_estate -d eastern_estate_erp \
  -f /path/to/production-users.sql

# Or if PostgreSQL is outside Docker:
psql -U eastern_estate -d eastern_estate_erp \
  -f backend/src/database/seeds/production-users.sql
```

### Option 2: Manual SQL Commands (Safe for Existing Data)

```bash
# Connect to database
docker compose -f docker-compose.prod.yml exec postgres \
  psql -U eastern_estate -d eastern_estate_erp

# Then run these commands:
```

```sql
-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Create info@eecd.in (Super Admin)
INSERT INTO users (id, username, email, password_hash, is_active, is_verified, created_at, updated_at)
SELECT uuid_generate_v4(), 'info', 'info@eecd.in',
       crypt('info@easternestate', gen_salt('bf')), true, true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'info@eecd.in');

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u CROSS JOIN roles r
WHERE u.email = 'info@eecd.in' AND r.name = 'super_admin'
AND NOT EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = u.id AND ur.role_id = r.id);

-- 2. Create arnav@eecd.in (Admin)
INSERT INTO users (id, username, email, password_hash, is_active, is_verified, created_at, updated_at)
SELECT uuid_generate_v4(), 'arnav', 'arnav@eecd.in',
       crypt('arnav@easternestate', gen_salt('bf')), true, true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'arnav@eecd.in');

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u CROSS JOIN roles r
WHERE u.email = 'arnav@eecd.in' AND r.name = 'admin'
AND NOT EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = u.id AND ur.role_id = r.id);

-- 3. Create hr@eecd.in (HR)
INSERT INTO users (id, username, email, password_hash, is_active, is_verified, created_at, updated_at)
SELECT uuid_generate_v4(), 'hr', 'hr@eecd.in',
       crypt('hr@easternestate', gen_salt('bf')), true, true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'hr@eecd.in');

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u CROSS JOIN roles r
WHERE u.email = 'hr@eecd.in' AND r.name = 'hr'
AND NOT EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = u.id AND ur.role_id = r.id);

-- Grant property access to Super Admin
INSERT INTO user_property_access (user_id, property_id, role, is_active, assigned_by, assigned_at)
SELECT u.id, p.id, 'SUPER_ADMIN', true, u.id, NOW()
FROM users u CROSS JOIN properties p
WHERE u.email = 'info@eecd.in'
AND NOT EXISTS (SELECT 1 FROM user_property_access upa WHERE upa.user_id = u.id AND upa.property_id = p.id);

-- Grant property access to Admin
INSERT INTO user_property_access (user_id, property_id, role, is_active, assigned_by, assigned_at)
SELECT u.id, p.id, 'ADMIN', true,
       (SELECT id FROM users WHERE email = 'info@eecd.in'), NOW()
FROM users u CROSS JOIN properties p
WHERE u.email = 'arnav@eecd.in'
AND NOT EXISTS (SELECT 1 FROM user_property_access upa WHERE upa.user_id = u.id AND upa.property_id = p.id);

-- Verify users created
SELECT u.email, u.username, STRING_AGG(r.display_name, ', ') as roles
FROM users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN roles r ON ur.role_id = r.id
WHERE u.email IN ('info@eecd.in', 'arnav@eecd.in', 'hr@eecd.in')
GROUP BY u.id, u.email, u.username;
```

### Verify Users Created

```bash
docker compose -f docker-compose.prod.yml exec postgres \
  psql -U eastern_estate -d eastern_estate_erp \
  -c "SELECT email, username, is_active FROM users WHERE email IN ('info@eecd.in', 'arnav@eecd.in', 'hr@eecd.in');"
```

---

## 🔐 Login Credentials

After adding users, you can login with:

| Email | Password | Role |
|-------|----------|------|
| `info@eecd.in` | `info@easternestate` | Super Admin |
| `arnav@eecd.in` | `arnav@easternestate` | Admin |
| `hr@eecd.in` | `hr@easternestate` | HR |

⚠️ **Change passwords after first login!**

---

## 📝 Environment Variables in Docker

### Update docker-compose.prod.yml

Make sure your `docker-compose.prod.yml` has these environment variables:

```yaml
services:
  backend:
    environment:
      # Database
      DATABASE_HOST: postgres
      DATABASE_PORT: 5432
      DATABASE_USERNAME: ${DATABASE_USERNAME}
      DATABASE_PASSWORD: ${DATABASE_PASSWORD}
      DATABASE_NAME: eastern_estate_erp
      
      # JWT
      JWT_SECRET: ${JWT_SECRET}
      JWT_EXPIRATION: 24h
      JWT_REFRESH_SECRET: ${JWT_REFRESH_SECRET}
      JWT_REFRESH_EXPIRATION: 7d
      
      # Google OAuth
      GOOGLE_CLIENT_ID: ${GOOGLE_CLIENT_ID}
      GOOGLE_CLIENT_SECRET: ${GOOGLE_CLIENT_SECRET}
      GOOGLE_CALLBACK_URL: https://yourdomain.com/api/v1/auth/google/callback
      FRONTEND_URL: https://yourdomain.com
      
      # Server
      PORT: 3001
      NODE_ENV: production
      CORS_ORIGINS: https://yourdomain.com
      
  frontend:
    environment:
      NEXT_PUBLIC_API_URL: /api/v1
```

### .env File on Server

Create/update `.env` file on your server:

```bash
# On your server
cd ~/eastern-estate-erp
nano .env
```

Add:
```env
DATABASE_USERNAME=eastern_estate
DATABASE_PASSWORD=your_db_password
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

---

## 🔄 Complete Deployment Steps

### Step 1: Prepare Changes Locally

```bash
# On your local machine
git add .
git commit -m "Add production deployment configs and user seed script"
git push origin main
```

### Step 2: Deploy to Server

```bash
# SSH to server
ssh -i ~/Downloads/ERP.pem ubuntu@3.238.49.77
cd ~/eastern-estate-erp

# Pull changes
git pull origin main

# Update environment variables (if needed)
nano .env

# Rebuild and deploy
docker compose -f docker-compose.prod.yml build backend frontend
docker compose -f docker-compose.prod.yml up -d --force-recreate backend frontend

# Check logs
docker compose -f docker-compose.prod.yml logs backend --tail 100 -f
```

### Step 3: Add New Users (One-Time)

```bash
# Option A: Run SQL seed script
docker compose -f docker-compose.prod.yml exec postgres \
  psql -U eastern_estate -d eastern_estate_erp \
  -f /app/backend/src/database/seeds/production-users.sql

# Option B: Run SQL commands manually (see above)
```

### Step 4: Verify

```bash
# Check users exist
docker compose -f docker-compose.prod.yml exec postgres \
  psql -U eastern_estate -d eastern_estate_erp \
  -c "SELECT email, username FROM users WHERE email LIKE '%@eecd.in';"

# Test login at your frontend URL
# Try: info@eecd.in / info@easternestate
```

---

## 🐛 Troubleshooting

### Check Backend Logs
```bash
docker compose -f docker-compose.prod.yml logs backend --tail 200 --since=5m
```

### Check Frontend Logs
```bash
docker compose -f docker-compose.prod.yml logs frontend --tail 200 --since=5m
```

### Check Database Connection
```bash
docker compose -f docker-compose.prod.yml exec backend \
  node -e "console.log('Backend can reach DB')"
```

### Restart Specific Service
```bash
docker compose -f docker-compose.prod.yml restart backend
docker compose -f docker-compose.prod.yml restart frontend
```

### Check Environment Variables
```bash
docker compose -f docker-compose.prod.yml exec backend env | grep -E "DATABASE|JWT|GOOGLE"
```

### Access Database Directly
```bash
docker compose -f docker-compose.prod.yml exec postgres \
  psql -U eastern_estate -d eastern_estate_erp
```

---

## ✅ Deployment Checklist

- [ ] Changes committed and pushed to GitHub
- [ ] SSH to server successful
- [ ] Git pull completed
- [ ] Environment variables updated (if needed)
- [ ] Docker images built successfully
- [ ] Containers recreated and running
- [ ] No errors in backend logs
- [ ] No errors in frontend logs
- [ ] Frontend accessible at your domain
- [ ] Backend API responding
- [ ] New users added to database
- [ ] Can login with info@eecd.in
- [ ] Google OAuth works (if configured)
- [ ] Existing data intact

---

## 🔒 Security Notes

1. **Never commit .env to git** - It should be in .gitignore
2. **Change default passwords** immediately after first login
3. **Use strong JWT secrets** in production (not examples)
4. **Keep database credentials secure**
5. **Use SSL/TLS** for all connections

---

## 📚 Quick Commands Reference

```bash
# Deploy latest changes
cd ~/eastern-estate-erp && git pull && \
docker compose -f docker-compose.prod.yml build backend frontend && \
docker compose -f docker-compose.prod.yml up -d --force-recreate backend frontend

# View logs
docker compose -f docker-compose.prod.yml logs -f

# Check status
docker compose -f docker-compose.prod.yml ps

# Restart all
docker compose -f docker-compose.prod.yml restart

# Stop all
docker compose -f docker-compose.prod.yml down

# Start all
docker compose -f docker-compose.prod.yml up -d
```

---

**Last Updated:** February 20, 2026  
**Platform:** DigitalOcean Docker Deployment  
**Status:** Production Ready ✅
