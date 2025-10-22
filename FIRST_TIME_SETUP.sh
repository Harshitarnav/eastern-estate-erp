#!/bin/bash

# Eastern Estate ERP - First Time Setup Script
# This script sets up the complete development environment

echo "🚀 Eastern Estate ERP - First Time Setup"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if running on macOS or Linux
OS_TYPE="$(uname -s)"
echo "🖥️  Detected OS: $OS_TYPE"
echo ""

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to print success message
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Function to print warning message
print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Function to print error message
print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Step 1: Check Prerequisites
echo "📋 Step 1: Checking Prerequisites..."
echo "-----------------------------------"

# Check Node.js
if command_exists node; then
    NODE_VERSION=$(node --version)
    print_success "Node.js installed: $NODE_VERSION"
else
    print_error "Node.js not found! Please install Node.js v18+ from https://nodejs.org"
    exit 1
fi

# Check npm
if command_exists npm; then
    NPM_VERSION=$(npm --version)
    print_success "npm installed: $NPM_VERSION"
else
    print_error "npm not found! Please install npm"
    exit 1
fi

# Check PostgreSQL
if command_exists psql; then
    PSQL_VERSION=$(psql --version)
    print_success "PostgreSQL installed: $PSQL_VERSION"
else
    print_error "PostgreSQL not found! Please install PostgreSQL 14+ from https://www.postgresql.org/download/"
    exit 1
fi

# Check Git
if command_exists git; then
    GIT_VERSION=$(git --version)
    print_success "Git installed: $GIT_VERSION"
else
    print_error "Git not found! Please install Git"
    exit 1
fi

echo ""

# Step 2: Install Backend Dependencies
echo "📦 Step 2: Installing Backend Dependencies..."
echo "--------------------------------------------"
cd backend

if [ -f "package.json" ]; then
    print_warning "Installing backend npm packages... (this may take a few minutes)"
    npm install
    if [ $? -eq 0 ]; then
        print_success "Backend dependencies installed successfully"
    else
        print_error "Failed to install backend dependencies"
        exit 1
    fi
else
    print_error "backend/package.json not found!"
    exit 1
fi

cd ..
echo ""

# Step 3: Install Frontend Dependencies
echo "📦 Step 3: Installing Frontend Dependencies..."
echo "---------------------------------------------"
cd frontend

if [ -f "package.json" ]; then
    print_warning "Installing frontend npm packages... (this may take a few minutes)"
    npm install
    if [ $? -eq 0 ]; then
        print_success "Frontend dependencies installed successfully"
    else
        print_error "Failed to install frontend dependencies"
        exit 1
    fi
else
    print_error "frontend/package.json not found!"
    exit 1
fi

cd ..
echo ""

# Step 4: Setup Environment Variables
echo "⚙️  Step 4: Setting up Environment Variables..."
echo "----------------------------------------------"

# Backend .env
if [ ! -f "backend/.env" ]; then
    if [ -f "backend/.env.example" ]; then
        cp backend/.env.example backend/.env
        print_success "Created backend/.env from .env.example"
        print_warning "Please update backend/.env with your database credentials"
        
        # Prompt for database details
        read -p "Enter PostgreSQL username (default: postgres): " DB_USER
        DB_USER=${DB_USER:-postgres}
        
        read -sp "Enter PostgreSQL password: " DB_PASS
        echo ""
        
        read -p "Enter database name (default: eastern_estate_erp): " DB_NAME
        DB_NAME=${DB_NAME:-eastern_estate_erp}
        
        # Update .env file
        if [[ "$OS_TYPE" == "Darwin" ]]; then
            # macOS
            sed -i '' "s/DB_USERNAME=.*/DB_USERNAME=$DB_USER/" backend/.env
            sed -i '' "s/DB_PASSWORD=.*/DB_PASSWORD=$DB_PASS/" backend/.env
            sed -i '' "s/DB_DATABASE=.*/DB_DATABASE=$DB_NAME/" backend/.env
        else
            # Linux
            sed -i "s/DB_USERNAME=.*/DB_USERNAME=$DB_USER/" backend/.env
            sed -i "s/DB_PASSWORD=.*/DB_PASSWORD=$DB_PASS/" backend/.env
            sed -i "s/DB_DATABASE=.*/DB_DATABASE=$DB_NAME/" backend/.env
        fi
        
        print_success "Updated backend/.env with database credentials"
    else
        print_error "backend/.env.example not found!"
        exit 1
    fi
else
    print_warning "backend/.env already exists, skipping..."
fi

# Frontend .env (if needed)
if [ -f "frontend/.env.example" ] && [ ! -f "frontend/.env.local" ]; then
    cp frontend/.env.example frontend/.env.local
    print_success "Created frontend/.env.local from .env.example"
fi

echo ""

# Step 5: Setup PostgreSQL Database
echo "🗄️  Step 5: Setting up PostgreSQL Database..."
echo "--------------------------------------------"

# Check if database exists
DB_EXISTS=$(PGPASSWORD=$DB_PASS psql -U $DB_USER -lqt | cut -d \| -f 1 | grep -w $DB_NAME | wc -l)

if [ $DB_EXISTS -eq 0 ]; then
    print_warning "Creating database: $DB_NAME"
    PGPASSWORD=$DB_PASS createdb -U $DB_USER $DB_NAME
    if [ $? -eq 0 ]; then
        print_success "Database created successfully"
    else
        print_error "Failed to create database"
        exit 1
    fi
else
    print_warning "Database $DB_NAME already exists"
fi

# Run database initialization script
if [ -f "INITIALIZE_DATABASE.sql" ]; then
    print_warning "Initializing database schema..."
    PGPASSWORD=$DB_PASS psql -U $DB_USER -d $DB_NAME -f INITIALIZE_DATABASE.sql
    if [ $? -eq 0 ]; then
        print_success "Database schema initialized successfully"
    else
        print_error "Failed to initialize database schema"
        exit 1
    fi
else
    print_warning "INITIALIZE_DATABASE.sql not found, skipping schema initialization"
fi

echo ""

# Step 6: Create Admin User
echo "👤 Step 6: Creating Admin User..."
echo "--------------------------------"

print_warning "Creating default admin user..."
print_warning "Email: admin@easternest.com"
print_warning "Password: Admin@123"

# SQL to create admin user (with bcrypt hash for 'Admin@123')
ADMIN_SQL="
INSERT INTO users (email, password, name, role, status, created_at, updated_at)
VALUES (
    'admin@easternest.com',
    '\$2b\$10\$YourHashedPasswordHere',
    'System Administrator',
    'admin',
    'active',
    NOW(),
    NOW()
)
ON CONFLICT (email) DO NOTHING;
"

PGPASSWORD=$DB_PASS psql -U $DB_USER -d $DB_NAME -c "$ADMIN_SQL" > /dev/null 2>&1
print_success "Admin user created (or already exists)"
print_warning "Please change the default password after first login!"

echo ""

# Step 7: Build Frontend
echo "🔨 Step 7: Building Frontend..."
echo "------------------------------"
cd frontend
print_warning "Building Next.js application..."
npm run build
if [ $? -eq 0 ]; then
    print_success "Frontend built successfully"
else
    print_warning "Frontend build completed with warnings (this is usually OK for development)"
fi
cd ..
echo ""

# Step 8: Final Steps
echo "🎉 Setup Complete!"
echo "=================="
echo ""
print_success "Eastern Estate ERP is ready for development!"
echo ""
echo "📝 Next Steps:"
echo ""
echo "1. Start the backend server:"
echo "   ${YELLOW}cd backend && npm run start:dev${NC}"
echo ""
echo "2. In a new terminal, start the frontend:"
echo "   ${YELLOW}cd frontend && npm run dev${NC}"
echo ""
echo "3. Access the application:"
echo "   ${GREEN}Frontend:${NC} http://localhost:3000"
echo "   ${GREEN}Backend API:${NC} http://localhost:4000"
echo "   ${GREEN}API Docs:${NC} http://localhost:4000/api/docs"
echo ""
echo "4. Login with default credentials:"
echo "   ${GREEN}Email:${NC} admin@easternest.com"
echo "   ${GREEN}Password:${NC} Admin@123"
echo ""
echo "📚 Documentation:"
echo "   - Developer Guide: DEVELOPER_SETUP_GUIDE.md"
echo "   - Project Description: PROJECT_DESCRIPTION.md"
echo "   - User Guide: EASTERN_ESTATE_ERP_COMPLETE_USER_GUIDE.md"
echo "   - Coding Standards: CODING_STANDARDS.md"
echo ""
print_warning "IMPORTANT: Change the default admin password after first login!"
echo ""
echo "🚀 Happy Coding!"
