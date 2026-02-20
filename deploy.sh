#!/bin/bash

# ═══════════════════════════════════════════════════════════════
# EASTERN ESTATE ERP - DOCKER DEPLOYMENT SCRIPT
# ═══════════════════════════════════════════════════════════════
# Usage: ./deploy.sh [--with-users]
#
# Options:
#   --with-users    Also seed the 3 new admin users after deployment
#
# Server: DigitalOcean (3.238.49.77)
# ═══════════════════════════════════════════════════════════════

set -e  # Exit on error

SERVER="ubuntu@3.238.49.77"
KEY="~/Downloads/ERP.pem"
PROJECT_DIR="~/eastern-estate-erp"

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║          Eastern Estate ERP - Docker Deployment               ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Check if we should seed users
SEED_USERS=false
if [[ "$1" == "--with-users" ]]; then
  SEED_USERS=true
  echo "🌱 Will seed new admin users after deployment"
fi

echo "🚀 Starting deployment to DigitalOcean..."
echo ""

# Deploy
ssh -i "$KEY" "$SERVER" << 'ENDSSH'
set -e
cd ~/eastern-estate-erp

echo "📥 Pulling latest changes..."
git pull origin main

echo "🔧 Building Docker images..."
docker compose -f docker-compose.prod.yml build backend frontend

echo "🚀 Deploying containers..."
docker compose -f docker-compose.prod.yml up -d --force-recreate backend frontend

echo "⏳ Waiting for services to start..."
sleep 10

echo "✅ Checking service status..."
docker compose -f docker-compose.prod.yml ps

echo ""
echo "📊 Backend logs (last 50 lines):"
docker compose -f docker-compose.prod.yml logs backend --tail 50

ENDSSH

# Seed users if requested
if [ "$SEED_USERS" = true ]; then
  echo ""
  echo "🌱 Seeding new admin users..."
  ssh -i "$KEY" "$SERVER" << 'ENDSSH'
  cd ~/eastern-estate-erp
  
  docker compose -f docker-compose.prod.yml exec -T postgres \
    psql -U eastern_estate -d eastern_estate_erp << 'EOSQL'
    
-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create info@eecd.in (Super Admin)
INSERT INTO users (id, username, email, password_hash, is_active, is_verified, created_at, updated_at)
SELECT uuid_generate_v4(), 'info', 'info@eecd.in',
       crypt('info@easternestate', gen_salt('bf')), true, true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'info@eecd.in');

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u CROSS JOIN roles r
WHERE u.email = 'info@eecd.in' AND r.name = 'super_admin'
AND NOT EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = u.id AND ur.role_id = r.id);

-- Create arnav@eecd.in (Admin)
INSERT INTO users (id, username, email, password_hash, is_active, is_verified, created_at, updated_at)
SELECT uuid_generate_v4(), 'arnav', 'arnav@eecd.in',
       crypt('arnav@easternestate', gen_salt('bf')), true, true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'arnav@eecd.in');

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u CROSS JOIN roles r
WHERE u.email = 'arnav@eecd.in' AND r.name = 'admin'
AND NOT EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = u.id AND ur.role_id = r.id);

-- Create hr@eecd.in (HR)
INSERT INTO users (id, username, email, password_hash, is_active, is_verified, created_at, updated_at)
SELECT uuid_generate_v4(), 'hr', 'hr@eecd.in',
       crypt('hr@easternestate', gen_salt('bf')), true, true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'hr@eecd.in');

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u CROSS JOIN roles r
WHERE u.email = 'hr@eecd.in' AND r.name = 'hr'
AND NOT EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = u.id AND ur.role_id = r.id);

-- Verify users
SELECT email, username, is_active as active FROM users 
WHERE email IN ('info@eecd.in', 'arnav@eecd.in', 'hr@eecd.in');

EOSQL
  
ENDSSH
  
  echo ""
  echo "✅ Users seeded successfully!"
  echo ""
  echo "🔐 Login Credentials:"
  echo "   info@eecd.in   / info@easternestate   (Super Admin)"
  echo "   arnav@eecd.in  / arnav@easternestate  (Admin)"
  echo "   hr@eecd.in     / hr@easternestate     (HR)"
fi

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                   ✅ DEPLOYMENT COMPLETE! ✅                   ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "🌐 Access your application at: https://yourdomain.com"
echo ""
echo "📊 View logs:"
echo "   ssh -i $KEY $SERVER"
echo "   cd $PROJECT_DIR"
echo "   docker compose -f docker-compose.prod.yml logs -f"
echo ""
