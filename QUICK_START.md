# Eastern Estate ERP - Quick Start

Database already exists! Just start the servers.

## Step 1: Backend Setup
```bash
cd backend

# Create .env file
cat > .env << 'EOF'
NODE_ENV=development
PORT=3001
API_PREFIX=api/v1

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=eastern_estate
DB_PASSWORD=
DB_DATABASE=eastern_estate_erp

JWT_SECRET=eastern_estate_secret_key_minimum_32_characters_required_here
JWT_EXPIRATION=24h
JWT_REFRESH_SECRET=eastern_estate_refresh_secret_minimum_32_chars_needed
JWT_REFRESH_EXPIRATION=7d

BCRYPT_ROUNDS=10
CORS_ORIGINS=http://localhost:3000
EOF

# Install and start
npm install --legacy-peer-deps
npm run start:dev
```

## Step 2: Frontend Setup (New Terminal)
```bash
cd frontend

# Create .env.local
cat > .env.local << 'EOF'
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
EOF

# Install and start
npm install --legacy-peer-deps
npm run dev
```

## Step 3: Access
Open http://localhost:3000

Login: admin@easternestate.com / Admin@123
