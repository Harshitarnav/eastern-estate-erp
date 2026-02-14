# Eastern Estate ERP - Quick Access Guide

## 🚀 Start Using Now

### 1. Open Your Browser
Navigate to: **http://localhost:3000**

### 2. Login
- **Email:** `admin@eastern-estate.com`
- **Password:** `Admin@123`
- **Role:** Super Administrator (Full Access)

---

## 🔗 Quick Links

| Service | URL | Credentials |
|---------|-----|-------------|
| **Frontend (Main App)** | http://localhost:3000 | admin@eastern-estate.com / Admin@123 |
| **Backend API** | http://localhost:3001/api/v1 | (Use JWT token) |
| **MinIO Console (Storage)** | http://localhost:9001 | minioadmin / minioadmin |
| **Database** | localhost:5432 | eastern_estate / (no password) |

---

## 📋 Available Modules

Once logged in, you'll have access to:

1. **📊 Dashboard** - Overview, analytics, quick stats
2. **🏢 Properties** - Property, tower, and flat management
3. **👥 Leads** - CRM and lead tracking system
4. **👤 Customers** - Customer profiles and management
5. **📝 Bookings** - Property bookings and agreements
6. **💰 Payments** - Payment tracking and receipts
7. **🏗️ Construction** - Project management and tracking
8. **📦 Inventory** - Materials and stock management
9. **🛒 Purchase Orders** - Procurement workflow
10. **👔 Employees** - HR and employee management
11. **📢 Marketing** - Campaign tracking and analytics
12. **💬 Chat** - Internal team communication
13. **🔔 Notifications** - Real-time alerts system
14. **📈 Reports** - Business intelligence and reports
15. **⚙️ Settings** - System configuration
16. **👥 Users & Roles** - User and permission management

---

## 📊 Sample Data Available

The system includes sample data for testing:
- **6 Properties** - Various types including townships
- **34 Leads** - Active leads in the pipeline
- **11 Customers** - Registered customer profiles
- **2 Bookings** - Active property bookings

---

## 🔧 Services Running

All services are currently running:
- ✅ Frontend (Next.js) - Port 3000
- ✅ Backend (NestJS) - Port 3001
- ✅ PostgreSQL - Port 5432
- ✅ Redis - Port 6379
- ✅ MinIO (S3) - Ports 9000, 9001

---

## 📱 Common API Endpoints

### Authentication
```bash
# Login
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@eastern-estate.com", "password": "Admin@123"}'

# Get Current User
curl http://localhost:3001/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Properties
```bash
# List Properties
curl http://localhost:3001/api/v1/properties \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Leads
```bash
# List Leads
curl http://localhost:3001/api/v1/leads \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🛑 Stop Services

If you need to stop the services:

```bash
# Stop Frontend (find and kill process on port 3000)
lsof -ti:3000 | xargs kill -9

# Stop Backend (find and kill process on port 3001)
lsof -ti:3001 | xargs kill -9

# Stop MinIO (find and kill process on port 9000)
lsof -ti:9000 | xargs kill -9

# Stop Redis (via Homebrew)
brew services stop redis

# Stop PostgreSQL (via Homebrew)
brew services stop postgresql@16
```

---

## 🔄 Restart Services

```bash
# Start Redis & PostgreSQL
brew services start redis
brew services start postgresql@16

# Start MinIO (in new terminal)
mkdir -p ~/minio/data
minio server ~/minio/data --console-address ":9001"

# Start Backend (in new terminal)
cd /Users/arnav/Desktop/Train-Rex.nosync/eastern-estate-erp/backend
npm run start:dev

# Start Frontend (in new terminal)
cd /Users/arnav/Desktop/Train-Rex.nosync/eastern-estate-erp/frontend
npm run dev
```

---

## 📞 Support Files

- **System Status:** See `SYSTEM_STATUS.md`
- **Test Results:** See `TESTING_RESULTS.md`
- **Full Documentation:** See `README.md`
- **Quick Start:** See `QUICK_START.md`

---

## 🎯 What to Try First

1. **Login** to the system
2. **Explore the Dashboard** - Get an overview of the system
3. **View Properties** - Check out the property listings
4. **View Leads** - See the CRM in action
5. **Check Notifications** - Click the bell icon in the top bar
6. **Try the Chat** - Click the chat icon in the top bar
7. **View Reports** - Check out the analytics

---

## 💡 Pro Tips

- **JWT Token Expiry:** Access tokens expire in 24 hours, refresh tokens in 7 days
- **MinIO Storage:** Use the MinIO console to manage uploaded files
- **Database Access:** Connect directly to PostgreSQL for advanced queries
- **API Testing:** Use tools like Postman or Thunder Client for API testing
- **Hot Reload:** Both frontend and backend support hot reload during development

---

**Last Updated:** January 14, 2026, 8:55 PM IST
**Status:** ✅ All Systems Ready

**👉 Ready to go? Open http://localhost:3000 and start exploring!**
