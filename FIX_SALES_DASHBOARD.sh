#!/bin/bash

# =============================================
# ONE-COMMAND FIX for Sales Dashboard 500 Error
# =============================================

echo "🎯 Sales Dashboard 500 Error - ONE-COMMAND FIX"
echo "=============================================="
echo ""
echo "This script will:"
echo "  1. Backup your database"
echo "  2. Add missing columns to database"
echo "  3. Restart backend server"
echo "  4. Your Sales Dashboard will work!"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Paths
BACKEND_DIR="/Users/arnav/Desktop/Train-Rex.nosync/eastern-estate-erp/backend"
MIGRATION_FILE="$BACKEND_DIR/add-missing-sales-crm-columns.sql"

# Database
DB_HOST="localhost"
DB_USER="arnav"
DB_NAME="eastern_estate_erp"

echo -e "${YELLOW}⚠️  This will modify your database schema${NC}"
echo ""
read -p "Continue? [Y/n]: " confirm

if [[ $confirm == "n" || $confirm == "N" ]]; then
    echo "Cancelled."
    exit 0
fi

cd $BACKEND_DIR

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}Step 1/4: Creating database backup...${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

BACKUP_FILE="backup_sales_crm_$(date +%Y%m%d_%H%M%S).sql"
pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME > $BACKUP_FILE

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Backup created: $BACKUP_FILE${NC}"
else
    echo -e "${RED}❌ Backup failed! Aborting.${NC}"
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}Step 2/4: Running database migration...${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f $MIGRATION_FILE > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Migration completed successfully!${NC}"
    echo -e "${GREEN}   Added ~80 columns to leads and bookings tables${NC}"
else
    echo -e "${RED}❌ Migration failed!${NC}"
    echo ""
    echo "To rollback:"
    echo "  psql -h $DB_HOST -U $DB_USER -d $DB_NAME < $BACKUP_FILE"
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}Step 3/4: Restarting backend server...${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Kill existing node processes
pkill -9 node > /dev/null 2>&1
sleep 2

# Start backend
npm run start:dev > server.log 2>&1 &

echo -e "${GREEN}✅ Backend server restarted${NC}"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}Step 4/4: Waiting for server to start...${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

sleep 10

# Test if server is responding
curl -s http://localhost:3001 > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Backend server is running!${NC}"
else
    echo -e "${YELLOW}⚠️  Backend may still be starting...${NC}"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}🎉 MIGRATION COMPLETE!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${GREEN}✅ Database backup:${NC} $BACKUP_FILE"
echo -e "${GREEN}✅ Missing columns:${NC} Added to database"
echo -e "${GREEN}✅ Backend server:${NC} Restarted"
echo ""
echo -e "${BLUE}📊 Next: Test your Sales Dashboard${NC}"
echo ""
echo "  1. Open: ${BLUE}http://localhost:3000/login${NC}"
echo "  2. Login: ${BLUE}superadmin@easternestates.com${NC} / ${BLUE}Password@123${NC}"
echo "  3. Go to: ${BLUE}http://localhost:3000/sales${NC}"
echo ""
echo -e "${GREEN}✅ The 500 errors should now be FIXED!${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Show backend logs
echo -e "${YELLOW}📝 Recent backend logs:${NC}"
tail -5 server.log 2>/dev/null || echo "  (Logs not available yet, server still starting)"
echo ""
echo "To view full logs: tail -f $BACKEND_DIR/server.log"
echo ""

