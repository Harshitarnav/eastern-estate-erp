# Access Levels & Permissions Guide

This document outlines all user roles, access levels, and permissions in the Eastern Estate ERP system.

---

## 📋 Table of Contents
1. [Overview](#overview)
2. [Role Hierarchy](#role-hierarchy)
3. [Detailed Role Descriptions](#detailed-role-descriptions)
4. [Permission Matrix](#permission-matrix)
5. [Sample User Accounts](#sample-user-accounts)
6. [How to Login](#how-to-login)

---

## Overview

The Eastern Estate ERP uses a **Role-Based Access Control (RBAC)** system with:
- **11 predefined roles**
- **33 granular permissions** across 8 modules
- Many-to-many relationships between roles and permissions
- Flexible permission assignment

---

## Role Hierarchy

```
┌─────────────────────────────────────────────────────┐
│                  SUPER ADMIN                        │
│              (All Permissions)                      │
└─────────────────────────────────────────────────────┘
                        │
        ┌───────────────┴───────────────┐
        │                               │
┌───────────────┐              ┌────────────────┐
│     ADMIN     │              │   HR MANAGER   │
│  (Most Access)│              │ (User Mgmt)    │
└───────────────┘              └────────────────┘
        │
  ┌─────┴─────────────────────────────────┐
  │                                       │
┌──────────────┐                  ┌──────────────────┐
│  ACCOUNTANT  │                  │  SALES MANAGER   │
│ (Financial)  │                  │  (Sales Ops)     │
└──────────────┘                  └──────────────────┘
                                          │
                                  ┌───────┴────────┐
                          ┌───────────────┐  ┌─────────────────┐
                          │SALES EXECUTIVE│  │ MARKETING MGR   │
                          └───────────────┘  └─────────────────┘

┌─────────────────┐  ┌──────────────────┐  ┌────────────────┐
│ CONSTRUCTION    │  │  STORE KEEPER    │  │   CUSTOMER     │
│    MANAGER      │  │                  │  │   & BROKER     │
└─────────────────┘  └──────────────────┘  └────────────────┘
```

---

## Detailed Role Descriptions

### 1. 🔴 Super Administrator
**Role Name:** `super_admin`  
**System Role:** Yes  
**Description:** Complete system access with all permissions

**Key Capabilities:**
- Full CRUD on all modules
- User and role management
- System settings configuration
- Complete financial access
- All reporting capabilities

**Use Cases:**
- System setup and configuration
- Critical system changes
- User access management
- Emergency interventions

---

### 2. 🟠 Administrator
**Role Name:** `admin`  
**System Role:** Yes  
**Description:** Administrative access to most features

**Key Capabilities:**
- User management (view, create, update)
- Property and inventory management
- Sales operations oversight
- Payment management
- Report generation
- Settings viewing

**Restrictions:**
- Cannot delete users
- Cannot modify system settings

**Use Cases:**
- Day-to-day administration
- Managing properties and inventory
- Overseeing sales operations
- Financial oversight

---

### 3. 💰 Accountant
**Role Name:** `accountant`  
**System Role:** No  
**Description:** Financial and accounting operations

**Key Capabilities:**
- View properties and inventory
- Manage bookings (view, update)
- Full payment management
- Customer information viewing
- Financial report access

**Restrictions:**
- Cannot create/delete properties
- Cannot manage users
- Cannot assign leads

**Use Cases:**
- Recording payments
- Managing payment schedules
- Financial reporting
- Booking updates

---

### 4. 📊 Sales Manager
**Role Name:** `sales_manager`  
**System Role:** No  
**Description:** Sales team leadership and operations

**Key Capabilities:**
- Property and inventory viewing/updating
- Lead management (view, create, update, assign)
- Booking management
- Customer management
- Payment viewing
- Sales report generation

**Restrictions:**
- Cannot delete properties
- Cannot manage users
- Limited financial operations

**Use Cases:**
- Managing sales team
- Lead distribution
- Closing deals
- Team performance monitoring

---

### 5. 🎯 Sales Executive
**Role Name:** `sales_executive`  
**System Role:** No  
**Description:** Front-line sales operations

**Key Capabilities:**
- View properties and inventory
- Lead management (view, create, update)
- Create bookings
- Customer management

**Restrictions:**
- Cannot assign leads to others
- Cannot update inventory
- Limited reporting access

**Use Cases:**
- Lead follow-ups
- Customer interactions
- Booking creation
- Site visits

---

### 6. 📢 Marketing Manager
**Role Name:** `marketing_manager`  
**System Role:** No  
**Description:** Marketing campaigns and lead generation

**Key Capabilities:**
- View properties and inventory
- Lead management and assignment
- Customer viewing
- Basic reporting

**Restrictions:**
- Cannot create bookings
- Cannot manage payments
- No financial access

**Use Cases:**
- Campaign management
- Lead generation
- Lead quality analysis
- Marketing ROI tracking

---

### 7. 🏗️ Construction Manager
**Role Name:** `construction_manager`  
**System Role:** No  
**Description:** Construction and project management

**Key Capabilities:**
- Update property details
- Update inventory status
- View basic reports

**Restrictions:**
- Cannot create/delete properties
- No sales or financial access

**Use Cases:**
- Construction progress updates
- Property status management
- Completion tracking

---

### 8. 📦 Store Keeper
**Role Name:** `store_keeper`  
**System Role:** No  
**Description:** Inventory management

**Key Capabilities:**
- View inventory
- Update inventory status

**Restrictions:**
- Very limited access
- Only inventory-focused

**Use Cases:**
- Inventory tracking
- Stock management

---

### 9. 👥 HR Manager
**Role Name:** `hr_manager`  
**System Role:** No  
**Description:** Human resources operations

**Key Capabilities:**
- User management (view, create, update)
- Basic reporting

**Restrictions:**
- No sales or financial access
- No property management

**Use Cases:**
- Employee onboarding
- User account creation
- HR reporting

---

### 10. 👤 Customer
**Role Name:** `customer`  
**System Role:** Yes  
**Description:** Customer portal access

**Key Capabilities:**
- View own bookings
- View own payments

**Restrictions:**
- Highly restricted access
- Only personal data visible

**Use Cases:**
- Customer self-service portal
- Payment status checking

---

### 11. 🤝 Broker
**Role Name:** `broker`  
**System Role:** Yes  
**Description:** Broker/Channel partner portal

**Key Capabilities:**
- View properties and inventory
- Lead creation
- View bookings
- View customers

**Restrictions:**
- Cannot update inventory
- No financial operations
- Limited access

**Use Cases:**
- Property browsing
- Lead submission
- Commission tracking

---

## Permission Matrix

| Permission | Super Admin | Admin | Accountant | Sales Mgr | Sales Exec | Marketing | Construction | Store | HR | Customer | Broker |
|------------|-------------|-------|------------|-----------|------------|-----------|--------------|-------|-----|----------|--------|
| **Users Module** |
| users.view | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| users.create | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| users.update | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| users.delete | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Properties Module** |
| properties.view | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| properties.create | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| properties.update | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| properties.delete | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Inventory Module** |
| inventory.view | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |
| inventory.create | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| inventory.update | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ |
| inventory.delete | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Leads Module** |
| leads.view | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| leads.create | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| leads.update | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| leads.delete | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| leads.assign | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Bookings Module** |
| bookings.view | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| bookings.create | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| bookings.update | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| bookings.cancel | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Payments Module** |
| payments.view | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| payments.create | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| payments.update | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| payments.delete | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Customers Module** |
| customers.view | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| customers.create | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| customers.update | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Reports Module** |
| reports.view | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| reports.export | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| reports.financial | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Settings Module** |
| settings.view | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| settings.update | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## Sample User Accounts

The system comes with pre-configured test users for each role:

| Role | Email | Username | Password | Name |
|------|-------|----------|----------|------|
| **Super Admin** | superadmin@easternestates.com | superadmin | Password@123 | Super Admin |
| **Admin** | admin@easternestates.com | admin | Password@123 | Admin User |
| **Accountant** | accountant@easternestates.com | accountant | Password@123 | John Smith |
| **Sales Manager** | salesmanager@easternestates.com | salesmanager | Password@123 | Sarah Johnson |
| **Sales Executive** | salesexec@easternestates.com | salesexec | Password@123 | Mike Williams |
| **Marketing Manager** | marketing@easternestates.com | marketing | Password@123 | Emily Davis |
| **Construction Manager** | construction@easternestates.com | construction | Password@123 | David Brown |
| **Store Keeper** | storekeeper@easternestates.com | storekeeper | Password@123 | Robert Wilson |
| **HR Manager** | hr@easternestates.com | hrmanager | Password@123 | Lisa Anderson |

⚠️ **IMPORTANT SECURITY NOTE:**
- These are **TEST ACCOUNTS ONLY**
- Change all passwords immediately in production
- Use strong, unique passwords
- Enable 2FA for admin accounts

---

## How to Login

### Step 1: Seed the Database

First, run the user seeder to create sample accounts:

```bash
cd eastern-estate-erp/backend
npm run seed:users
```

### Step 2: Start the Application

```bash
# Start backend (from eastern-estate-erp/backend)
npm run start:dev

# Start frontend (from eastern-estate-erp/frontend)
npm run dev
```

### Step 3: Access the Login Page

Navigate to: `http://localhost:3000/login`

### Step 4: Login with Admin Account

Use the following credentials to access the admin panel:

**Option 1: Super Admin (Full Access)**
- Email: `superadmin@easternestates.com`
- Password: `Password@123`

**Option 2: Regular Admin (Most Access)**
- Email: `admin@easternestates.com`
- Password: `Password@123`

### Step 5: Explore the System

Once logged in, you'll have access to:
- Dashboard with key metrics
- Property management
- Inventory (towers, flats)
- Lead management
- Booking operations
- Payment tracking
- Customer database
- Reports and analytics

---

## API Authentication

All API requests require authentication using JWT tokens:

### Login Endpoint
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@easternestates.com",
  "password": "Password@123"
}
```

### Response
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "admin@easternestates.com",
      "firstName": "Admin",
      "lastName": "User",
      "roles": ["admin"]
    },
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

### Using the Token
```bash
GET /api/properties
Authorization: Bearer eyJhbGc...
```

---

## Permission Checking in Code

### Backend (NestJS)
```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('super_admin', 'admin')
@Post()
create(@Body() dto: CreatePropertyDto) {
  // Only super_admin and admin can access
}
```

### Frontend (Next.js)
```typescript
const { user } = useAuth();

if (user.hasPermission('properties.create')) {
  // Show create button
}
```

---

## Best Practices

1. **Principle of Least Privilege**: Assign minimum required permissions
2. **Role Assignment**: Assign roles based on job function, not individuals
3. **Regular Audits**: Review and audit user access periodically
4. **Password Policy**: Enforce strong passwords and regular rotation
5. **Separation of Duties**: Critical operations require multiple roles
6. **Audit Logging**: Track all permission-sensitive operations
7. **Testing**: Test with different roles during development

---

## Adding Custom Roles

To add a new role:

1. Add role to database:
```sql
INSERT INTO roles (name, display_name, description)
VALUES ('custom_role', 'Custom Role', 'Description');
```

2. Assign permissions:
```sql
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'custom_role'
AND p.name IN ('properties.view', 'inventory.view');
```

3. Update code decorators where needed

---

## Support

For questions or issues related to access control:
- Check the code documentation
- Review role definitions in `backend/src/database/seeds/users.seed.ts`
- Contact system administrator

---

**Last Updated:** October 2025  
**Version:** 1.0.0
