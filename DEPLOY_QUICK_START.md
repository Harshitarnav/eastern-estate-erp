# 🚀 Quick Production Deployment Reference

**Fast reference for deploying Eastern Estate ERP to production**

---

## ⚡ Quick Start Commands

### 1. Environment Setup (5 min)

```bash
# Generate secure secrets
openssl rand -base64 32  # For JWT_SECRET
openssl rand -base64 32  # For JWT_REFRESH_SECRET

# Copy environment files
cd backend && cp .env.production .env
cd frontend && cp .env.production .env.local

# Edit with your values
nano backend/.env
```

### 2. Database Setup (5 min)

```bash
# Create database
sudo -u postgres psql -c "CREATE DATABASE eastern_estate_erp;"

# Run migrations
cd backend && npm run migration:run

# Seed initial users
psql -d eastern_estate_erp -f src/database/seeds/production-users.sql
```

### 3. Build & Deploy (10 min)

```bash
# Build backend
cd backend && npm install && npm run build

# Build frontend
cd frontend && npm install && npm run build

# Start with PM2
cd backend && pm2 start ecosystem.config.js
cd frontend && pm2 start ecosystem.config.js
pm2 save && pm2 startup
```

---

## 🔐 Initial User Credentials

| Email | Password | Role |
|-------|----------|------|
| `info@eecd.in` | `info@easternestate` | Super Admin |
| `arnav@eecd.in` | `arnav@easternestate` | Admin |
| `hr@eecd.in` | `hr@easternestate` | HR |

⚠️ **Change passwords immediately after first login!**

---

## 🌐 Required Environment Variables

### Backend (.env)

```env
# Database
DATABASE_HOST=your-db-host
DATABASE_USERNAME=your-db-user
DATABASE_PASSWORD=your-db-password
DATABASE_NAME=eastern_estate_erp

# JWT (generate with: openssl rand -base64 32)
JWT_SECRET=your-generated-secret
JWT_REFRESH_SECRET=your-generated-refresh-secret

# Google OAuth
GOOGLE_CLIENT_ID=your-prod-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-prod-client-secret
GOOGLE_CALLBACK_URL=https://yourdomain.com/api/v1/auth/google/callback
FRONTEND_URL=https://yourdomain.com

# Server
PORT=3001
NODE_ENV=production
CORS_ORIGINS=https://yourdomain.com
```

### Frontend (.env.local)

```env
# Use relative path (proxied by Nginx/Caddy)
NEXT_PUBLIC_API_URL=/api/v1
```

---

## 🔧 Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Edit OAuth 2.0 Client
3. Add JavaScript origin: `https://yourdomain.com`
4. Add redirect URI: `https://yourdomain.com/api/v1/auth/google/callback`
5. Save and wait 5-10 minutes

---

## 🔄 Nginx Configuration (Quick)

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /path/to/fullchain.pem;
    ssl_certificate_key /path/to/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
    }

    location /api/v1 {
        proxy_pass http://localhost:3001/api/v1;
        proxy_set_header Host $host;
    }
}
```

---

## 📊 PM2 Commands

```bash
# Status
pm2 list

# Logs (real-time)
pm2 logs

# Restart
pm2 restart all

# Stop
pm2 stop all

# Monitoring
pm2 monit
```

---

## 🔍 Troubleshooting

### Can't connect to database
```bash
psql -h HOST -U USER -d eastern_estate_erp  # Test connection
sudo systemctl status postgresql            # Check status
```

### Backend won't start
```bash
pm2 logs eastern-estate-backend            # Check logs
lsof -i :3001                              # Check port
```

### Google OAuth not working
- Verify callback URL matches exactly
- Wait 5-10 minutes for Google propagation
- Check CORS_ORIGINS includes your domain

---

## ✅ Verification Steps

1. ✅ Check services: `pm2 list`
2. ✅ Access frontend: `https://yourdomain.com`
3. ✅ Login: `info@eecd.in` / `info@easternestate`
4. ✅ Test Google OAuth with @eecd.in email
5. ✅ Verify non-@eecd.in emails are rejected (403)
6. ✅ Change all default passwords

---

## 📦 Files Created for Production

```
backend/
├── .env.example              # Environment template
├── .env.production          # Production defaults
└── src/database/seeds/
    └── production-users.sql  # Initial users script

frontend/
├── .env.example             # Environment template
└── .env.production          # Production defaults
```

---

## 🔐 Security Checklist

- [ ] Changed all default passwords
- [ ] Generated new JWT secrets (not using examples)
- [ ] Configured firewall (block port 3001 from outside)
- [ ] SSL certificate installed
- [ ] CORS_ORIGINS set to your domain only
- [ ] Database password is strong
- [ ] Backup script configured

---

## 📚 Full Documentation

For complete step-by-step guide, see:
**[PRODUCTION_DEPLOYMENT.md](./PRODUCTION_DEPLOYMENT.md)**

For system overview and features, see:
**[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)**

---

**Deploy Time:** ~20 minutes  
**Prerequisites:** Node.js, PostgreSQL, Nginx/Caddy, SSL cert
