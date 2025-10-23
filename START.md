# Eastern Estate ERP - Quick Start

## Prerequisites
- PostgreSQL 14+ installed and running
- Node.js 18+ installed
- npm or yarn

## Step 1: Database Setup
```bash
# Create database
createdb eastern_estate_erp

# Run schema
psql -d eastern_estate_erp -f database-schema.sql
```

## Step 2: Backend Setup
```bash
cd backend
npm install --legacy-peer-deps

# Create .env file
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

# Start backend
npm run start:dev
```

## Step 3: Frontend Setup (New Terminal)
```bash
cd frontend
npm install --legacy-peer-deps

# Create .env.local
cat > .env.local << 'EOF'
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
EOF

# Start frontend
npm run dev
```

## Step 4: Access Application
Open http://localhost:3000

**Default Admin Login:**
- Email: admin@easternestate.com
- Password: Admin@123

## Common Issues

### Backend won't start
- Check PostgreSQL is running: `pg_isready`
- Verify database exists: `psql -l | grep eastern_estate_erp`
- Check port 3001 is free: `lsof -i :3001`

### Frontend build errors
- Delete `.next` folder and `node_modules`
- Run `npm install --legacy-peer-deps` again
- Clear npm cache: `npm cache clean --force`

### Database connection fails
- Update DB_USERNAME and DB_PASSWORD in backend/.env
- Ensure PostgreSQL accepts connections from localhost

## Quick Test
After starting both servers:
1. Open http://localhost:3000
2. Login with admin credentials
3. Check dashboard loads
4. Try creating a lead
5. Navigate through different modules
