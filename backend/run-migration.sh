#!/bin/bash

# =============================================
# Sales CRM Database Migration Runner
# =============================================

echo "🎯 Sales CRM Database Migration Script"
echo "========================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Database credentials
DB_HOST="localhost"
DB_USER="arnav"
DB_NAME="eastern_estate_erp"

echo -e "${YELLOW}⚠️  WARNING: This will add 80+ columns to your database!${NC}"
echo ""
read -p "Do you want to create a backup first? (recommended) [Y/n]: " backup_choice

if [[ $backup_choice != "n" && $backup_choice != "N" ]]; then
    BACKUP_FILE="backup_before_sales_crm_migration_$(date +%Y%m%d_%H%M%S).sql"
    echo ""
    echo "📦 Creating backup: $BACKUP_FILE"
    pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME > $BACKUP_FILE
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Backup created successfully!${NC}"
    else
        echo -e "${RED}❌ Backup failed! Aborting migration.${NC}"
        exit 1
    fi
fi

echo ""
read -p "Ready to run the migration? [Y/n]: " run_choice

if [[ $run_choice == "n" || $run_choice == "N" ]]; then
    echo "Migration cancelled."
    exit 0
fi

echo ""
echo "🚀 Running migration..."
echo ""

psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f add-missing-sales-crm-columns.sql

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Migration completed successfully!${NC}"
    echo ""
    echo "📊 Verifying changes..."
    echo ""
    
    # Count new columns in leads table
    LEADS_COLS=$(psql -h $DB_HOST -U $DB_USER -d $DB_NAME -t -c "SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'leads';")
    echo -e "${GREEN}Leads table now has: $LEADS_COLS columns${NC}"
    
    # Count new columns in bookings table
    BOOKINGS_COLS=$(psql -h $DB_HOST -U $DB_USER -d $DB_NAME -t -c "SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'bookings';")
    echo -e "${GREEN}Bookings table now has: $BOOKINGS_COLS columns${NC}"
    
    echo ""
    echo -e "${GREEN}✅ Next Steps:${NC}"
    echo "1. Restart your backend server: npm run start:dev"
    echo "2. Open Sales Dashboard: http://localhost:3000/sales"
    echo "3. The 500 errors should now be fixed!"
    echo ""
else
    echo ""
    echo -e "${RED}❌ Migration failed! Check the errors above.${NC}"
    echo ""
    if [[ -f $BACKUP_FILE ]]; then
        echo "To rollback, run:"
        echo "psql -h $DB_HOST -U $DB_USER -d $DB_NAME < $BACKUP_FILE"
    fi
    exit 1
fi

