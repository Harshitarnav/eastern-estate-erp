# 🚀 Quick Start: Admin Login Guide

This guide will help you quickly set up and login to the Eastern Estate ERP system with admin credentials.

---

## 📋 Prerequisites

Before you begin, ensure you have:
- ✅ PostgreSQL database running
- ✅ Backend dependencies installed (`npm install` in `backend/`)
- ✅ Frontend dependencies installed (`npm install` in `frontend/`)
- ✅ Environment variables configured (`.env` file in `backend/`)

---

## 🎯 Quick Start Steps

### Step 1: Install Missing Dependency

```bash
cd eastern-estate-erp/backend
npm install tsconfig-paths --save-dev
```

### Step 2: Seed the Database with Users

Run the user seeder to create sample accounts:

```bash
cd eastern-estate-erp/backend
npm run seed:users
```

**Expected Output:**
```
🌱 Starting database seeding...
📝 Creating roles...
✅ Role created/updated: Super Administrator
✅ Role created/updated: Administrator
... (more roles)
📝 Creating permissions...
✅ Created/updated 33 permissions
📝 Assigning permissions to roles...
... (permission assignments)
📝 Creating sample users...
✅ Created user: superadmin@easternestates.com (super_admin)
✅ Created user: admin@easternestates.com (admin)
... (more users)

✅ User seed completed successfully!

📋 LOGIN CREDENTIALS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SUPER_ADMIN          | Email: superadmin@easternestates.com    | Password: Password@123
ADMIN                | Email: admin@easternestates.com         | Password: Password@123
... (more accounts)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Step 3: Start the Backend Server

```bash
# In eastern-estate-erp/backend directory
npm run start:dev
```

Wait for the message: `Application is running on: http://localhost:5000`

### Step 4: Start the Frontend Server

Open a new terminal:

```bash
# In eastern-estate-erp/frontend directory
npm run dev
```

Wait for the message: `✓ Ready on http://localhost:3000`

### Step 5: Access the Application

Open your browser and navigate to:
```
http://localhost:3000/login
```

### Step 6: Login with Admin Credentials

Use one of these accounts:

#### 🔴 Super Admin (Full Access)
- **Email:** `superadmin@easternestates.com`
- **Password:** `Password@123`
- **Access:** All modules and permissions

#### 🟠 Admin (Most Access)
- **Email:** `admin@easternestates.com`
- **Password:** `Password@123`
- **Access:** Most administrative features

---

## 🎭 All Available Test Accounts

| Role | Email | Password | Key Capabilities |
|------|-------|----------|------------------|
| **Super Admin** | superadmin@easternestates.com | Password@123 | Full system access |
| **Admin** | admin@easternestates.com | Password@123 | Most admin features |
| **Accountant** | accountant@easternestates.com | Password@123 | Financial operations |
| **Sales Manager** | salesmanager@easternestates.com | Password@123 | Sales team management |
| **Sales Executive** | salesexec@easternestates.com | Password@123 | Sales operations |
| **Marketing Manager** | marketing@easternestates.com | Password@123 | Marketing & leads |
| **Construction Manager** | construction@easternestates.com | Password@123 | Property updates |
| **Store Keeper** | storekeeper@easternestates.com | Password@123 | Inventory management |
| **HR Manager** | hr@easternestates.com | Password@123 | User management |

---

## 📊 Understanding Access Levels

The system has **11 different roles** with varying access levels:

### Role Hierarchy (from highest to lowest access):
1. 🔴 **Super Admin** - Complete system access
2. 🟠 **Admin** - Most administrative features
3. 💰 **Accountant** - Financial operations
4. 📊 **Sales Manager** - Sales team leadership
5. 🎯 **Sales Executive** - Sales operations
6. 📢 **Marketing Manager** - Marketing campaigns
7. 🏗️ **Construction Manager** - Construction updates
8. 📦 **Store Keeper** - Inventory management
9. 👥 **HR Manager** - HR operations
10. 👤 **Customer** - Customer portal
11. 🤝 **Broker** - Broker portal

For detailed permissions, see [ACCESS_LEVELS.md](./docs/ACCESS_LEVELS.md)

---

## 🔐 API Authentication Testing

You can also test the API directly using curl or Postman:

### Login API Request
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@easternestates.com",
    "password": "Password@123"
  }'
```

### Expected Response
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-here",
      "email": "admin@easternestates.com",
      "firstName": "Admin",
      "lastName": "User",
      "roles": ["admin"]
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Using the Access Token
```bash
curl -X GET http://localhost:5000/api/properties \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

---

## 🎯 What You Can Do After Login

Once logged in as **Admin** or **Super Admin**, you can:

### ✅ Dashboard
- View key metrics and statistics
- Monitor recent activities
- See system overview

### ✅ Properties Module
- Create new properties
- View property listings
- Update property details
- Manage property status

### ✅ Inventory Module
- View all towers/blocks
- View all flats/units
- Update inventory status
- Manage availability

### ✅ Sales Module
- View and manage leads
- Create bookings
- Track sales pipeline
- Assign leads to team members

### ✅ Finance Module
- Record payments
- View payment schedules
- Generate invoices
- Track outstanding amounts

### ✅ Reports
- Generate sales reports
- View financial reports
- Export data to Excel/PDF
- Custom report generation

### ✅ User Management
- Create new users
- Assign roles
- Manage permissions
- View user activity

---

## 🐛 Troubleshooting

### Issue: Seed command fails with "tsconfig-paths not found"
**Solution:** Install the missing dependency:
```bash
cd eastern-estate-erp/backend
npm install tsconfig-paths --save-dev
```

### Issue: Database connection error
**Solution:** Check your `.env` file and ensure PostgreSQL is running:
```bash
# Check if PostgreSQL is running
psql -U postgres -l

# Verify .env file has correct database credentials
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=eastern_estate_erp
```

### Issue: Port already in use
**Solution:** 
```bash
# For backend (port 5000)
lsof -ti:5000 | xargs kill -9

# For frontend (port 3000)
lsof -ti:3000 | xargs kill -9
```

### Issue: Cannot login after seeding
**Solution:** Clear browser cache and cookies, then try again. Verify the user was created:
```bash
psql -U postgres -d eastern_estate_erp
SELECT email, first_name, last_name FROM users WHERE email = 'admin@easternestates.com';
```

---

## 📚 Additional Resources

- **Full Access Levels Documentation:** [docs/ACCESS_LEVELS.md](./docs/ACCESS_LEVELS.md)
- **Setup Guide:** [SETUP_GUIDE.md](./SETUP_GUIDE.md)
- **Backend API Docs:** Check backend endpoints in `src/*/controllers/`
- **Frontend Components:** Check `frontend/src/components/`

---

## 🔒 Security Notes

⚠️ **IMPORTANT:** These are TEST ACCOUNTS for development only!

### For Production:
1. **Change all default passwords immediately**
2. **Use strong, unique passwords (minimum 12 characters)**
3. **Enable two-factor authentication (2FA)**
4. **Implement password expiration policies**
5. **Regular security audits**
6. **Use environment-specific credentials**
7. **Never commit credentials to version control**
8. **Implement rate limiting on login endpoints**

---

## 🎉 Success Checklist

After following this guide, you should be able to:

- [ ] Seed database with users successfully
- [ ] Start backend server without errors
- [ ] Start frontend server without errors
- [ ] Access login page at http://localhost:3000/login
- [ ] Login with admin credentials
- [ ] See the dashboard after login
- [ ] Navigate between different modules
- [ ] Create/view/edit data (based on role permissions)
- [ ] Logout successfully

---

## 💡 Next Steps

Once you're logged in and familiar with the system:

1. **Explore the Properties Module:** Learn how to add and manage properties
2. **Add Sample Data:** Create some test properties, leads, and bookings
3. **Try Different Roles:** Logout and login with different role accounts to understand access levels
4. **Test API Endpoints:** Use Postman or curl to test backend APIs
5. **Review Documentation:** Read through [ACCESS_LEVELS.md](./docs/ACCESS_LEVELS.md) for detailed permissions

---

## 📞 Need Help?

If you encounter issues:
1. Check the console logs (both frontend and backend)
2. Review the [SETUP_GUIDE.md](./SETUP_GUIDE.md)
3. Check PostgreSQL connection and logs
4. Verify all environment variables are set correctly
5. Ensure all dependencies are installed

---

**Happy Coding! 🚀**

*Last Updated: October 2025*
