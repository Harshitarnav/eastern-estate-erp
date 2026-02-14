# Login Troubleshooting Guide

## Quick Test - Try These Steps:

### Step 1: Open Browser Console
1. Open http://localhost:3000/login in your browser
2. Press `F12` or `Cmd+Option+I` (Mac) to open Developer Tools
3. Go to the "Console" tab

### Step 2: Try to Login
- **Email:** `admin@eastern-estate.com`
- **Password:** `Admin@123`
- Click "ACCESS ERP" button

### Step 3: Check for Errors
Look for any red error messages in the console. Common issues:

#### If you see "Network Error":
- Backend might not be running
- Check: http://localhost:3001/api/v1/auth/login

#### If you see "CORS Error":
- CORS configuration issue
- Backend CORS is set to: `http://localhost:3000`

#### If you see "401 Unauthorized" or "Invalid credentials":
- Wrong email/password
- Try these users:
  - admin@eastern-estate.com / Admin@123
  - arnav@easternestate.in
  - superadmin@easternestates.com

#### If login succeeds but page doesn't redirect:
- Check the browser console for JavaScript errors
- Try refreshing the page

## Manual API Test

Open a new terminal and run:
```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@eastern-estate.com","password":"Admin@123"}'
```

### Expected Response:
You should see JSON with `accessToken`, `refreshToken`, and `user` object.

### If API test works but browser doesn't:
The issue is in the frontend. Check:
1. Browser console for errors
2. Network tab for failed requests
3. Application tab → Local Storage (should show tokens after login)

## Common Fixes:

### 1. Clear Browser Data
```javascript
// Open browser console and run:
localStorage.clear();
sessionStorage.clear();
location.reload();
```

### 2. Check Backend is Running
```bash
curl http://localhost:3001/api/v1/auth/login
# Should return: Cannot GET /api/v1/auth/login (404 is expected for GET)
```

### 3. Restart Frontend
```bash
# Find and kill the process
lsof -ti:3000 | xargs kill -9
# Restart
cd frontend
npm run dev
```

## Services Status Check:

Run these commands to verify all services:
```bash
# Backend
curl http://localhost:3001/api/v1
# Should return 404 JSON (means backend is running)

# Frontend
curl http://localhost:3000
# Should return HTML

# PostgreSQL
psql -U eastern_estate -d eastern_estate_erp -c "SELECT 1"
# Should return 1

# Redis
redis-cli ping
# Should return PONG
```

## Debug Mode:

The authStore has console.log statements. Check browser console for:
- Number "2" before login attempt
- Response data after successful login
- Number "3" after state update

If you see "2" but no response or "3", the API call is failing.

---

**Need Help?** 
Share the browser console error messages for specific diagnosis.
