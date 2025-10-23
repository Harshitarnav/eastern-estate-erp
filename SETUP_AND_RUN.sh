#!/bin/bash

# Eastern Estate ERP - Complete Setup and Run Script
set -e

echo "🚀 Eastern Estate ERP Setup Starting..."

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if PostgreSQL is running
echo "📦 Checking PostgreSQL..."
if ! pg_isready -q; then
    echo -e "${RED}❌ PostgreSQL is not running. Please start PostgreSQL first.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ PostgreSQL is running${NC}"

# Backend Setup
echo ""
echo "🔧 Setting up Backend..."
cd backend

# Create .env if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cat > .env << 'EOF'
NODE_ENV=development
PORT=3001
API_PREFIX=api/v1

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=eastern_estate_erp

JWT_SECRET=eastern_estate_secret_key_minimum_32_characters_required_here
JWT_EXPIRATION=24h
JWT_REFRESH_SECRET=eastern_estate_refresh_secret_minimum_32_chars_needed
JWT_REFRESH_EXPIRATION=7d

BCRYPT_ROUNDS=10
CORS_ORIGINS=http://localhost:3000
EOF
    echo -e "${GREEN}✅ Created backend .env${NC}"
fi

# Install backend dependencies
echo "Installing backend dependencies..."
npm install --legacy-peer-deps

# Create database if it doesn't exist
echo "Creating database..."
PGPASSWORD=postgres psql -U postgres -h localhost -tc "SELECT 1 FROM pg_database WHERE datname = 'eastern_estate_erp'" | grep -q 1 || \
PGPASSWORD=postgres psql -U postgres -h localhost -c "CREATE DATABASE eastern_estate_erp"
echo -e "${GREEN}✅ Database ready${NC}"

cd ..

# Frontend Setup
echo ""
echo "🎨 Setting up Frontend..."
cd frontend

# Create .env.local if it doesn't exist
if [ ! -f .env.local ]; then
    echo "Creating frontend .env.local..."
    cat > .env.local << 'EOF'
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
EOF
    echo -e "${GREEN}✅ Created frontend .env.local${NC}"
fi

# Install frontend dependencies
echo "Installing frontend dependencies..."
npm install --legacy-peer-deps

cd ..

echo ""
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo ""
echo "🚀 Starting services..."
echo ""

# Start backend in background
echo "Starting backend..."
cd backend
npm run start:dev > ../backend.log 2>&1 &
BACKEND_PID=$!
echo -e "${GREEN}✅ Backend started (PID: $BACKEND_PID)${NC}"
cd ..

# Wait for backend to be ready
echo "Waiting for backend to be ready..."
sleep 5

# Start frontend
echo "Starting frontend..."
cd frontend
npm run dev

# Cleanup on exit
trap "kill $BACKEND_PID 2>/dev/null" EXIT
