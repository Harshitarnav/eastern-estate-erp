#!/bin/bash

# ============================================================================
# EASTERN ESTATE ERP - TELEPHONY SETUP SCRIPT
# Run this script to set up the complete telephony system
# ============================================================================

echo "🚀 Starting Eastern Estate Telephony Setup..."
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get database credentials
read -p "Enter PostgreSQL username [postgres]: " DB_USER
DB_USER=${DB_USER:-postgres}

read -p "Enter database name [eastern_estate_erp]: " DB_NAME
DB_NAME=${DB_NAME:-eastern_estate_erp}

echo ""
echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}  STEP 1: Running Database Schema${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

# Run schema
psql -U $DB_USER -d $DB_NAME -f backend/database-telephony-schema.sql

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Schema created successfully!${NC}"
else
    echo -e "${RED}❌ Schema creation failed!${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}  STEP 2: Loading Dummy Data${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

# Run dummy data
psql -U $DB_USER -d $DB_NAME -f backend/database-telephony-dummy-data.sql

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Dummy data loaded successfully!${NC}"
else
    echo -e "${RED}❌ Dummy data loading failed!${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}  ✅ TELEPHONY SETUP COMPLETE!${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""

# Show statistics
echo -e "${YELLOW}📊 Database Statistics:${NC}"
psql -U $DB_USER -d $DB_NAME -c "SELECT COUNT(*) as total_calls FROM telephony.call_logs;"
psql -U $DB_USER -d $DB_NAME -c "SELECT COUNT(*) as hot_leads FROM telephony.ai_insights WHERE hot_lead = true;"
psql -U $DB_USER -d $DB_NAME -c "SELECT COUNT(*) as available_agents FROM telephony.agent_availability WHERE is_available = true;"

echo ""
echo -e "${GREEN}🎉 Setup Complete! Next steps:${NC}"
echo -e "  1. Configure Exotel in backend/.env"
echo -e "  2. Run: ${BLUE}cd backend && npm run start:dev${NC}"
echo -e "  3. Access API: ${BLUE}http://localhost:3001/api/telephony${NC}"
echo ""

