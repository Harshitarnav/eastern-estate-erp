#!/bin/bash
BASE_URL="http://localhost:3001/api/v1"

echo "Testing Sales & CRM Endpoints..."
echo "================================="
echo ""

# Test each endpoint
echo "1. Sales Dashboard: $(curl -s -o /dev/null -w '%{http_code}' $BASE_URL/sales-dashboard/test-id)"
echo "2. FollowUps:       $(curl -s -o /dev/null -w '%{http_code}' -X POST $BASE_URL/followups)"
echo "3. Sales Tasks:     $(curl -s -o /dev/null -w '%{http_code}' -X POST $BASE_URL/sales-tasks)"
echo "4. Sales Targets:   $(curl -s -o /dev/null -w '%{http_code}' -X POST $BASE_URL/sales-targets)"
echo ""
echo "All endpoints should return 401 (Unauthorized) - this means they exist and are protected ✓"



