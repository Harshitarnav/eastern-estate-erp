#!/bin/bash

# Database Migration Script for Roles & Permissions System
# Run this script to apply the roles system to your database

echo "🔐 Eastern Estate ERP - Roles & Permissions Migration"
echo "======================================================"
echo ""
echo "This script will create:"
echo "  ✓ Roles table (15 default roles)"
echo "  ✓ Permissions table (60+ permissions)"
echo "  ✓ Role-permissions junction table"
echo "  ✓ Add role_id column to employees table"
echo ""

# Get database credentials
read -p "Enter PostgreSQL username [postgres]: " DB_USER
DB_USER=${DB_USER:-postgres}

read -p "Enter database name [eastern_estate_erp]: " DB_NAME
DB_NAME=${DB_NAME:-eastern_estate_erp}

echo ""
echo "Running migration..."
echo "Command: psql -U $DB_USER -d $DB_NAME -f backend/create-roles-system.sql"
echo ""

cd backend
psql -U "$DB_USER" -d "$DB_NAME" -f create-roles-system.sql

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ SUCCESS! Database migration completed successfully!"
    echo ""
    echo "Next steps:"
    echo "  1. Start backend: cd backend && npm run start:dev"
    echo "  2. Test API: curl http://localhost:3000/roles"
    echo "  3. Access dashboards:"
    echo "     - /sales/agent/{agentId}"
    echo "     - /sales/admin"
    echo "     - /sales/team/{gmId}"
    echo ""
else
    echo ""
    echo "❌ Migration failed. Please check:"
    echo "  1. PostgreSQL is running"
    echo "  2. Database exists"
    echo "  3. User has correct permissions"
    echo "  4. Connection details are correct"
    echo ""
fi
