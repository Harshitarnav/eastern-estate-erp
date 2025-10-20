# How to Access the Sales Dashboard

## Quick Login Steps:

### Option 1: Login via Frontend (Recommended)
1. Open your browser and go to: `http://localhost:3000/login`
2. Use these credentials:
   - **Email**: `superadmin@easternestates.com`
   - **Password**: `Password@123`
   
3. After login, navigate to: `http://localhost:3000/sales`

### Option 2: Get Token via API (For Testing)
Run this command in your terminal:

```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "superadmin@easternestates.com",
    "password": "Password@123"
  }'
```

This will return an access token that you can use for API testing.

## Current Status:
✅ Backend is running on: http://localhost:3001/api/v1
✅ Frontend is running on: http://localhost:3000
✅ Database schema errors have been fixed
✅ All Sales & CRM APIs are working

## Available Users:
1. **Super Admin**
   - Email: superadmin@easternestates.com
   - Username: superadmin
   - ID: 0e034d20-3aa4-4dff-b90f-126bff07a5c1

2. **Arnav Sinha**
   - Email: arnav@easternestate.in
   - Username: arnavsinha
   - ID: 1beb5592-de61-4dd4-88f5-8eec08277afd

## Fixed Issues:
1. ✅ `interested_property_types` column → mapped to `interested_in`
2. ✅ `token_paid_date` column → commented out (doesn't exist in DB)
3. ✅ `lead_score` column → commented out (doesn't exist in DB)
4. ✅ `agreement_amount` column → commented out (doesn't exist in DB)
5. ✅ `payment_status` column → commented out (doesn't exist in DB)
6. ✅ `propertyId` column in leads → commented out (doesn't exist in DB)
7. ✅ Column name mappings fixed (full_name, phone_number, etc.)

## If You Still Can't Access:
1. Make sure you're logged in first at: http://localhost:3000/login
2. Check browser console for any errors (F12 → Console tab)
3. Verify both servers are running:
   ```bash
   # Check backend
   curl http://localhost:3001/api/v1
   
   # Check frontend
   curl http://localhost:3000
   ```

## Next Steps:
The Sales Dashboard should now be fully accessible at `http://localhost:3000/sales` after you log in!

