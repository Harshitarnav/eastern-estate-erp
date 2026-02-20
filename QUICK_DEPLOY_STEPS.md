# 🚀 Quick Deployment Instructions

## 📝 What You Need to Do

### 1. Push the New Files to GitHub

```bash
# Add the new Docker Compose file and environment template
git add docker-compose.prod.yml .env.production.example
git add backend/src/database/seeds/production-users.sql
git add DOCKER_DEPLOYMENT.md DOCKER_QUICK_DEPLOY.txt

git commit -m "Add Docker Compose and production user seeding"
git push origin main
```

### 2. Setup Environment on Server

```bash
# SSH to your server
ssh -i ~/Downloads/ERP.pem ubuntu@3.238.49.77
cd ~/eastern-estate-erp

# Pull the new files
git pull origin main

# Create .env file (if it doesn't exist)
cp .env.production.example .env

# Edit .env with your actual values
nano .env
```

**Required values in `.env`:**
```env
DATABASE_USERNAME=eastern_estate
DATABASE_PASSWORD=your_actual_password
JWT_SECRET=your_actual_jwt_secret
JWT_REFRESH_SECRET=your_actual_refresh_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=https://yourdomain.com/api/v1/auth/google/callback
FRONTEND_URL=https://yourdomain.com
CORS_ORIGINS=https://yourdomain.com
```

### 3. Deploy with Docker Compose

```bash
# On your server (after pulling and setting up .env)
cd ~/eastern-estate-erp

# Build and deploy
docker compose -f docker-compose.prod.yml build backend frontend
docker compose -f docker-compose.prod.yml up -d --force-recreate backend frontend

# Check status
docker compose -f docker-compose.prod.yml ps

# Check logs
docker compose -f docker-compose.prod.yml logs backend --tail 100 -f
```

### 4. Add New Admin Users (One-Time)

```bash
# On your server
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

-- Verify users
SELECT email, username, is_active FROM users 
WHERE email IN ('info@eecd.in', 'arnav@eecd.in', 'hr@eecd.in');

SQL
```

### 5. Verify Deployment

```bash
# Check all containers are running
docker compose -f docker-compose.prod.yml ps

# Check backend logs
docker compose -f docker-compose.prod.yml logs backend --tail 50

# Check frontend logs
docker compose -f docker-compose.prod.yml logs frontend --tail 50

# Test login
# Go to: https://yourdomain.com
# Login: info@eecd.in / info@easternestate
```

---

## 🔐 New User Credentials

| Email | Password | Role |
|-------|----------|------|
| `info@eecd.in` | `info@easternestate` | Super Admin |
| `arnav@eecd.in` | `arnav@easternestate` | Admin |
| `hr@eecd.in` | `hr@easternestate` | HR |

⚠️ **Change passwords immediately after first login!**

---

## 🔧 Useful Commands

```bash
# View all logs
docker compose -f docker-compose.prod.yml logs -f

# Restart a service
docker compose -f docker-compose.prod.yml restart backend

# Stop all services
docker compose -f docker-compose.prod.yml down

# Start all services
docker compose -f docker-compose.prod.yml up -d

# Access database
docker compose -f docker-compose.prod.yml exec postgres \
  psql -U eastern_estate -d eastern_estate_erp

# Check environment variables
docker compose -f docker-compose.prod.yml exec backend env | grep DATABASE
```

---

## 📚 Full Documentation

- **Complete Docker Guide:** DOCKER_DEPLOYMENT.md
- **Quick Reference:** DOCKER_QUICK_DEPLOY.txt
- **System Overview:** IMPLEMENTATION_SUMMARY.md

---

**Last Updated:** February 20, 2026
