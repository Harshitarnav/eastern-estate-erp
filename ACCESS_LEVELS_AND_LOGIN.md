# Eastern Estate ERP - Access Levels & Login Guide

## 🚀 Quick Start - Admin Login

### Super Administrator Account
- **Email:** `superadmin@easternestates.com`
- **Username:** `superadmin`
- **Password:** `Password@123`
- **Access:** Full system access with all permissions

### Regular Administrator Account
- **Email:** `admin@easternestates.com`
- **Username:** `admin`
- **Password:** `Password@123`
- **Access:** Administrative access to most features

---

## 📋 System Access Levels

The Eastern Estate ERP uses a **Role-Based Access Control (RBAC)** system with 9 different access levels. Each role has specific permissions tailored to their job functions.

### 1. Super Administrator 👑
**Role:** `super_admin`  
**Email:** `superadmin@easternestates.com`  
**Access Level:** Complete System Access

**Permissions:**
- ✅ Full access to all modules
- ✅ User management (create, update, delete users)
- ✅ Role and permission management
- ✅ System configuration
- ✅ All CRUD operations on all entities
- ✅ Access to all reports and analytics
- ✅ Audit log access

**Use Case:** System administrators, IT managers, Business owners

---

### 2. Administrator 🔑
**Role:** `admin`  
**Email:** `admin@easternestates.com`  
**Access Level:** High-Level Management Access

**Permissions:**
- ✅ User management (view, create, update)
- ✅ Full property management
- ✅ Full customer and lead management
- ✅ Full sales operations (bookings, payments)
- ✅ Inventory management
- ✅ Construction project oversight
- ✅ Marketing campaign management
- ✅ Employee management
- ✅ Report generation
- ❌ Cannot modify system settings
- ❌ Cannot delete users
- ❌ Limited role management

**Use Case:** General managers, Operations managers

---

### 3. Accountant 💰
**Role:** `accountant`  
**Email:** `accountant@easternestates.com`  
**Access Level:** Finance & Accounting

**Permissions:**
- ✅ Full accounting module access
- ✅ Payment processing and verification
- ✅ Journal entry management
- ✅ Bank reconciliation
- ✅ Financial reports
- ✅ View bookings and customer data
- ✅ View properties and inventory
- ❌ Cannot create/edit properties
- ❌ Cannot manage leads
- ❌ Limited user access

**Use Case:** Accountants, Finance managers, Bookkeepers

---

### 4. Sales Manager 📊
**Role:** `sales_manager`  
**Email:** `salesmanager@easternestates.com`  
**Access Level:** Sales Operations Management

**Permissions:**
- ✅ Full lead management
- ✅ Full customer management
- ✅ Full booking management
- ✅ Payment tracking (view, update)
- ✅ Property viewing
- ✅ Sales team management
- ✅ Sales reports and analytics
- ✅ Marketing campaign viewing
- ❌ Cannot modify properties
- ❌ Limited accounting access
- ❌ Cannot manage inventory

**Use Case:** Sales managers, Team leaders

---

### 5. Sales Executive 🤝
**Role:** `sales_executive`  
**Email:** `salesexec@easternestates.com`  
**Access Level:** Direct Sales Operations

**Permissions:**
- ✅ Lead management (assigned leads)
- ✅ Customer interaction
- ✅ Booking creation
- ✅ Property viewing
- ✅ Basic reporting
- ❌ Cannot view all leads
- ❌ Cannot modify payments
- ❌ Limited customer editing
- ❌ No team management

**Use Case:** Sales executives, Field sales personnel

---

### 6. Marketing Manager 📢
**Role:** `marketing_manager`  
**Email:** `marketing@easternestates.com`  
**Access Level:** Marketing Operations

**Permissions:**
- ✅ Full marketing campaign management
- ✅ Lead generation tracking
- ✅ View customer data
- ✅ View properties
- ✅ Marketing analytics
- ✅ Campaign performance reports
- ❌ Cannot modify bookings
- ❌ Cannot access payments
- ❌ Limited customer data editing

**Use Case:** Marketing managers, Digital marketing leads

---

### 7. Construction Manager 🏗️
**Role:** `construction_manager`  
**Email:** `construction@easternestates.com`  
**Access Level:** Construction & Project Management

**Permissions:**
- ✅ Full construction project management
- ✅ Inventory management (construction materials)
- ✅ Purchase order management
- ✅ Vendor management
- ✅ View properties
- ✅ Project timeline tracking
- ✅ Construction reports
- ❌ Cannot access customer data
- ❌ Cannot view financial details
- ❌ Limited payment access

**Use Case:** Construction managers, Site engineers, Project coordinators

---

### 8. Store Keeper 📦
**Role:** `store_keeper`  
**Email:** `storekeeper@easternestates.com`  
**Access Level:** Inventory Management

**Permissions:**
- ✅ Full inventory management
- ✅ Stock tracking
- ✅ Material issue/receipt
- ✅ Purchase order tracking
- ✅ Inventory reports
- ✅ View construction projects
- ❌ Cannot create purchase orders
- ❌ No customer access
- ❌ No financial access

**Use Case:** Store keepers, Warehouse managers, Inventory clerks

---

### 9. HR Manager 👥
**Role:** `hr_manager`  
**Email:** `hr@easternestates.com`  
**Access Level:** Human Resources Management

**Permissions:**
- ✅ Full employee management
- ✅ User account creation (limited)
- ✅ Attendance tracking
- ✅ Leave management
- ✅ Performance reviews
- ✅ HR reports
- ❌ Cannot modify roles
- ❌ Limited financial access
- ❌ No customer data access

**Use Case:** HR managers, People operations

---

## 🔐 Security Features

### Password Policy
- **Default Password:** `Password@123` (for all seed accounts)
- **Recommendation:** Change password immediately after first login
- **Requirements:**
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character

### Account Security
- JWT token-based authentication
- Refresh token mechanism
- Email verification required
- Account lockout after failed attempts
- Session management

### Permission System
- Granular permission control
- Module-based permissions
- Action-level permissions (view, create, update, delete)
- Dynamic permission checking
- Role-permission mapping

---

## 📱 Login Process

### Web Application Login
1. Navigate to: `http://localhost:3001` (Frontend)
2. Enter email or username
3. Enter password
4. Click "Login"
5. Dashboard will load based on your role

### API Authentication
**Endpoint:** `POST http://localhost:3000/api/auth/login`

**Request Body:**
```json
{
  "email": "superadmin@easternestates.com",
  "password": "Password@123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "superadmin@easternestates.com",
      "username": "superadmin",
      "firstName": "Super",
      "lastName": "Admin",
      "roles": ["super_admin"]
    },
    "accessToken": "jwt_token_here",
    "refreshToken": "refresh_token_here"
  }
}
```

---

## 📊 Permission Matrix

| Module | Super Admin | Admin | Accountant | Sales Mgr | Sales Exec | Marketing | Construction | Store | HR |
|--------|------------|-------|------------|-----------|------------|-----------|--------------|-------|-----|
| **Users** | Full | View, Create, Update | View | View | - | - | - | - | Create, Update |
| **Properties** | Full | Full | View | View | View | View | View | View | - |
| **Customers** | Full | Full | View | Full | Limited | View | - | - | - |
| **Leads** | Full | Full | View | Full | Assigned | View | - | - | - |
| **Bookings** | Full | Full | View | Full | Create, View | View | - | - | - |
| **Payments** | Full | Full | Full | View | View | - | View | - | - |
| **Inventory** | Full | Full | View | View | - | - | Full | Full | - |
| **Construction** | Full | Full | View | View | - | - | Full | View | - |
| **Purchase Orders** | Full | Full | View | View | - | - | Full | View | - |
| **Employees** | Full | Full | View | View | - | - | - | - | Full |
| **Marketing** | Full | Full | - | View | - | Full | - | - | - |
| **Accounting** | Full | Full | Full | Limited | - | - | Limited | - | - |
| **Reports** | Full | Full | Full | Full | Limited | Full | Full | Limited | Full |

---

## 🎯 Role Hierarchy

```
Super Administrator (Highest)
    ↓
Administrator
    ↓
Department Managers (Accountant, Sales Manager, Marketing Manager, Construction Manager, HR Manager)
    ↓
Operational Staff (Sales Executive, Store Keeper)
```

---

## 🔄 Changing User Roles

**Super Admin Only:**
1. Login as Super Admin
2. Navigate to User Management
3. Select user to modify
4. Assign/remove roles
5. Save changes

**Note:** Role changes take effect on next login.

---

## 🆘 Common Issues & Solutions

### Cannot Login
- Verify email/username spelling
- Check if account is active
- Ensure password is correct (default: `Password@123`)
- Clear browser cache/cookies
- Check if backend is running on port 3000

### Permission Denied
- Verify your role has required permissions
- Contact administrator to grant permissions
- Check if you're in the correct module
- Refresh the page to reload permissions

### Account Locked
- Wait 15 minutes for automatic unlock
- Contact system administrator
- Check email for security alert

---

## 📞 Support

For access-related issues:
- **Email:** support@easternestates.com
- **Phone:** +91-98765-43210
- **Admin Contact:** superadmin@easternestates.com

---

## 📝 Notes

1. **First-Time Setup:** Run the user seed script to create all default users
   ```bash
   cd backend
   npm run seed:users
   ```

2. **Production Deployment:** 
   - Change all default passwords immediately
   - Enable 2FA for admin accounts
   - Implement IP whitelisting for super admin
   - Set up audit logging

3. **Regular Maintenance:**
   - Review user access quarterly
   - Remove inactive accounts
   - Update permissions as roles evolve
   - Monitor failed login attempts

4. **Best Practices:**
   - Use strong, unique passwords
   - Enable email notifications
   - Log out after each session
   - Don't share credentials
   - Report suspicious activity immediately

---

*Last Updated: October 16, 2025*
*Version: 1.0.0*
