# HR Module Deployment Guide

## 🎯 What We're Deploying
- HR Module UI with dashboard
- Employee profile pictures feature
- Phone number validation
- Static file serving for images

---

## 📋 Pre-Deployment Checklist

### ✅ Already Done (Locally)
- [x] All features tested locally
- [x] Code committed to `db_arnav` branch
- [x] Code pushed to GitHub

---

## 🚀 DEPLOYMENT STEPS

### **STEP 1: SSH into Your Production Server**

```bash
# Replace with your actual server details
ssh your-username@your-server-ip
```

---

### **STEP 2: Navigate to Your Project Directory**

```bash
cd /path/to/eastern-estate-erp
# Example: cd /home/ubuntu/eastern-estate-erp
```

---

### **STEP 3: Pull Latest Changes**

```bash
# Fetch the latest code
git fetch origin

# Switch to your branch (or merge to main first if you prefer)
git checkout db_arnav
git pull origin db_arnav

# OR if you want to merge to main first:
# git checkout main
# git merge db_arnav
# git pull origin main
```

---

### **STEP 4: Run the Database Migration**

**Option A: Using psql command**
```bash
# Connect to your database and run the migration
psql -h localhost -U your_db_user -d eastern_estate_erp -c "ALTER TABLE employees ADD COLUMN IF NOT EXISTS profile_picture TEXT NULL;"
```

**Option B: Using a database GUI (easier for beginners)**
1. Open DBeaver, pgAdmin, or your preferred database tool
2. Connect to your **production database**
3. Run this SQL:
```sql
ALTER TABLE employees ADD COLUMN IF NOT EXISTS profile_picture TEXT NULL;
```

---

### **STEP 5: Create Uploads Directory (if it doesn't exist)**

```bash
# Navigate to backend directory
cd backend

# Create uploads and thumbnails directories
mkdir -p uploads/thumbnails

# Set proper permissions
chmod 755 uploads
chmod 755 uploads/thumbnails

# Go back to project root
cd ..
```

---

### **STEP 6: Check Environment Variables**

```bash
# Edit the backend .env file
cd backend
nano .env  # or use vim/vi

# Make sure these are set correctly:
# UPLOAD_LOCATION=./uploads
# APP_URL=https://your-production-domain.com  (or http://your-server-ip:3001)
```

**Important Environment Variables:**
- `UPLOAD_LOCATION` - Leave as `./uploads` (relative path is fine)
- `APP_URL` - Should be your production backend URL (e.g., `https://api.yourdomain.com`)
- Make sure your frontend knows the backend URL too!

---

### **STEP 7: Rebuild and Restart Services**

**If using Docker (most common):**
```bash
# Stop containers
docker compose -f docker-compose.prod.yml down

# Rebuild (to get code changes)
docker compose -f docker-compose.prod.yml build

# Start containers
docker compose -f docker-compose.prod.yml up -d
```

**If using PM2 (without Docker):**
```bash
# Backend
cd backend
npm install  # In case there are any new dependencies
pm2 restart backend  # or whatever you named your backend process

# Frontend
cd ../frontend
npm install
npm run build
pm2 restart frontend  # or reload your frontend process
```

---

### **STEP 8: Verify Deployment** ✅

1. **Check if containers are running:**
   ```bash
   docker ps
   # or
   pm2 list
   ```

2. **Check backend logs:**
   ```bash
   docker logs eastern-estate-backend -f --tail 100
   # or
   pm2 logs backend
   ```

3. **Test the uploads directory:**
   ```bash
   ls -la backend/uploads/
   # You should see the directory exists with proper permissions
   ```

4. **Test in browser:**
   - Go to your production URL (e.g., `https://yourdomain.com`)
   - Navigate to Employees → Edit an employee
   - Upload a profile picture
   - Check if it displays correctly

---

## 🐛 Troubleshooting

### Problem: "Cannot access uploads directory"
```bash
# Check permissions
ls -la backend/uploads/
# If permissions are wrong:
sudo chown -R your-user:your-user backend/uploads/
chmod -R 755 backend/uploads/
```

### Problem: "Database column doesn't exist"
```bash
# Connect to your database
psql -h localhost -U your_db_user -d eastern_estate_erp

# Check if column exists
\d employees

# If profile_picture is missing, run:
ALTER TABLE employees ADD COLUMN IF NOT EXISTS profile_picture TEXT NULL;
```

### Problem: "Images return 404"
- Check if `APP_URL` in backend `.env` is correct
- Check if static file serving is working: `curl http://your-server:3001/uploads/test.txt`
- Check nginx/caddy config if using a reverse proxy

### Problem: "Upload fails"
- Check backend logs for errors
- Verify uploads directory permissions: `ls -la backend/uploads/`
- Check if backend has write access: `touch backend/uploads/test.txt && rm backend/uploads/test.txt`

---

## 📞 Need Help?

If you see any errors:
1. Check backend logs: `docker logs eastern-estate-backend -f`
2. Check frontend logs: `docker logs eastern-estate-frontend -f`
3. Check database connection: Try logging into the database manually
4. Take a screenshot of the error and share it

---

## ✅ Post-Deployment Verification

After deployment, test these:
- [ ] Can you see "HR Module" in the sidebar?
- [ ] Can you click "HR Module" and see "Employee Login"?
- [ ] Can you access `/hr` and see the HR dashboard?
- [ ] Can you edit an employee and upload a profile picture?
- [ ] Can you see the uploaded profile picture in the employee list?
- [ ] Does the image URL work? (Check browser console for the URL)

---

## 🎉 Success!

If all checks pass, your HR Module is live! 🚀

Remember:
- Profile pictures are stored in `backend/uploads/`
- Thumbnails are in `backend/uploads/thumbnails/`
- Make sure to backup the uploads directory regularly!
