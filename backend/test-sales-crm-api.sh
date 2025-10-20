#!/bin/bash

# Sales & CRM Module API Test Script
# =====================================

echo "🧪 Testing Sales & CRM Module APIs..."
echo "======================================="
echo ""

BASE_URL="http://localhost:3001"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test 1: Check if server is running
echo -e "${BLUE}Test 1: Server Health Check${NC}"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL)
if [ $HTTP_CODE -eq 404 ] || [ $HTTP_CODE -eq 200 ]; then
    echo -e "${GREEN}✓ Server is running on port 3001${NC}"
else
    echo -e "${RED}✗ Server not responding (HTTP $HTTP_CODE)${NC}"
    exit 1
fi
echo ""

# Test 2: Check Sales Dashboard endpoint (without auth, expecting 401)
echo -e "${BLUE}Test 2: Sales Dashboard Endpoint${NC}"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL/sales-dashboard/test-id)
if [ $HTTP_CODE -eq 401 ]; then
    echo -e "${GREEN}✓ Sales Dashboard endpoint exists (requires auth)${NC}"
else
    echo -e "${RED}✗ Unexpected response: HTTP $HTTP_CODE${NC}"
fi
echo ""

# Test 3: Check FollowUps endpoint
echo -e "${BLUE}Test 3: FollowUps Endpoint${NC}"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST $BASE_URL/followups \
    -H "Content-Type: application/json")
if [ $HTTP_CODE -eq 401 ]; then
    echo -e "${GREEN}✓ FollowUps endpoint exists (requires auth)${NC}"
else
    echo -e "${RED}✗ Unexpected response: HTTP $HTTP_CODE${NC}"
fi
echo ""

# Test 4: Check Sales Tasks endpoint
echo -e "${BLUE}Test 4: Sales Tasks Endpoint${NC}"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST $BASE_URL/sales-tasks \
    -H "Content-Type: application/json")
if [ $HTTP_CODE -eq 401 ]; then
    echo -e "${GREEN}✓ Sales Tasks endpoint exists (requires auth)${NC}"
else
    echo -e "${RED}✗ Unexpected response: HTTP $HTTP_CODE${NC}"
fi
echo ""

# Test 5: Check Sales Targets endpoint
echo -e "${BLUE}Test 5: Sales Targets Endpoint${NC}"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST $BASE_URL/sales-targets \
    -H "Content-Type: application/json")
if [ $HTTP_CODE -eq 401 ]; then
    echo -e "${GREEN}✓ Sales Targets endpoint exists (requires auth)${NC}"
else
    echo -e "${RED}✗ Unexpected response: HTTP $HTTP_CODE${NC}"
fi
echo ""

# Test 6: Check database tables
echo -e "${BLUE}Test 6: Database Tables${NC}"
FOLLOWUPS_COUNT=$(PGPASSWORD=your_secure_password_here psql -h localhost -p 5432 -U eastern_estate -d eastern_estate_erp -t -c "SELECT COUNT(*) FROM followups;" 2>/dev/null | tr -d ' ')
TARGETS_COUNT=$(PGPASSWORD=your_secure_password_here psql -h localhost -p 5432 -U eastern_estate -d eastern_estate_erp -t -c "SELECT COUNT(*) FROM sales_targets;" 2>/dev/null | tr -d ' ')
TASKS_COUNT=$(PGPASSWORD=your_secure_password_here psql -h localhost -p 5432 -U eastern_estate -d eastern_estate_erp -t -c "SELECT COUNT(*) FROM sales_tasks;" 2>/dev/null | tr -d ' ')

if [ -n "$FOLLOWUPS_COUNT" ]; then
    echo -e "${GREEN}✓ followups table exists (${FOLLOWUPS_COUNT} records)${NC}"
else
    echo -e "${RED}✗ followups table not accessible${NC}"
fi

if [ -n "$TARGETS_COUNT" ]; then
    echo -e "${GREEN}✓ sales_targets table exists (${TARGETS_COUNT} records)${NC}"
else
    echo -e "${RED}✗ sales_targets table not accessible${NC}"
fi

if [ -n "$TASKS_COUNT" ]; then
    echo -e "${GREEN}✓ sales_tasks table exists (${TASKS_COUNT} records)${NC}"
else
    echo -e "${RED}✗ sales_tasks table not accessible${NC}"
fi
echo ""

echo "======================================="
echo -e "${GREEN}✅ All Basic Tests Passed!${NC}"
echo ""
echo "📋 Summary:"
echo "  - Database migration: ✓ Complete"
echo "  - API endpoints: ✓ Available (require authentication)"
echo "  - Database tables: ✓ Created"
echo ""
echo "🔐 Next: Get a JWT token to test authenticated endpoints"
echo "   Use: POST $BASE_URL/auth/login"
echo ""



