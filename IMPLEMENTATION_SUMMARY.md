# 🏢 Eastern Estate ERP - Implementation Summary

**Last Updated:** February 17, 2026

This document provides a comprehensive overview of the Eastern Estate ERP system implementation, including all features, configurations, and usage instructions.

---

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Role-Based Access Control](#role-based-access-control)
3. [Property-Level Access](#property-level-access)
4. [Google OAuth Integration](#google-oauth-integration)
5. [Key Features](#key-features)
6. [User Credentials](#user-credentials)
7. [Setup & Configuration](#setup--configuration)
8. [Testing Guide](#testing-guide)
9. [Common Issues](#common-issues)

---

## 🎯 System Overview

**Eastern Estate ERP** is a comprehensive real estate management system with:
- Role-based access control (8 roles)
- Property-level multi-tenancy
- Google OAuth authentication
- Automated user provisioning
- Notification system
- Construction management
- Sales & CRM
- HR & employee management

### Technology Stack
- **Backend:** NestJS, PostgreSQL, TypeORM
- **Frontend:** Next.js 15, React, Tailwind CSS, Zustand
- **Authentication:** JWT, Google OAuth 2.0, Bcrypt
- **Ports:** Backend (3001), Frontend (3000), Database (5432)

---

## 🔐 Role-Based Access Control

### 8 Core Roles

| Role | Access Level | Key Permissions |
|------|-------------|-----------------|
| **Super Admin** | Full system access | Everything |
| **Admin** | Operational management | Property CRUD, user management |
| **HR** | Human resources | Employee & user management |
| **Construction Team** | Construction ops | Construction logs, materials |
| **Marketing Team** | Marketing & leads | Leads, campaigns, inventory (view) |
| **Sales Team** | Sales operations | Bookings, customers, payments |
| **Staff** | Basic access | View assigned properties only |
| **Customer** | Portal access | Future implementation |

### Role Implementation

**Backend:** `/backend/src/common/constants/roles.constant.ts`
```typescript
export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  HR = 'hr',
  CONSTRUCTION_TEAM = 'construction_team',
  MARKETING_TEAM = 'marketing_team',
  SALES_TEAM = 'sales_team',
  STAFF = 'staff',
  CUSTOMER = 'customer',
}
```

**Frontend:** `/frontend/src/lib/roles.ts`
- Same role definitions
- Module access configuration
- Sidebar filtering based on roles

### Key Features
- ✅ Multiple roles per user
- ✅ Dynamic sidebar navigation
- ✅ API-level authorization using guards
- ✅ Frontend route protection

---

## 🏘️ Property-Level Access

### Overview
Users can only access properties explicitly assigned to them. Admins have access to all properties.

### Database Schema
**Table:** `user_property_access`
```sql
- user_id (UUID)
- property_id (UUID)
- role (PropertyRole enum)
- is_active (boolean)
- assigned_by (UUID)
- assigned_at (timestamp)
```

### Property Roles
```typescript
enum PropertyRole {
  SUPER_ADMIN        // Full access to everything
  ADMIN              // Full access to everything
  PROPERTY_ADMIN     // Full access to specific property
  GM_SALES           // Sales management for property
  GM_MARKETING       // Marketing management for property
  GM_CONSTRUCTION    // Construction management for property
  PROPERTY_VIEWER    // Read-only access
}
```

### Implementation

**Backend Guard:** `PropertyAccessGuard`
- Checks if user has global admin status
- OR checks if user has access to specific property
- Attaches accessible property IDs to request

**Usage Example:**
```typescript
@UseGuards(JwtAuthGuard, RolesGuard, PropertyAccessGuard)
@Get()
async findAll(@Request() req) {
  // req.accessiblePropertyIds contains user's properties
  return this.service.findAll(req.user.id);
}
```

### Admin Interface
**URL:** `http://localhost:3000/property-access`
- View all users and their property access
- Grant/revoke access to properties
- Bulk operations support
- Real-time notifications

---

## 🔑 Google OAuth Integration

### Features
- ✅ One-click Google sign-in
- ✅ **Domain restriction:** Only `@eecd.in` emails allowed
- ✅ Auto user creation for valid domains
- ✅ Default `staff` role assignment
- ✅ 403 Forbidden for unauthorized domains

### Setup

#### 1. Google Cloud Console
1. Go to [console.cloud.google.com](https://console.cloud.google.com/)
2. Create project: "Eastern Estate ERP"
3. Enable "Google+ API"
4. Create OAuth 2.0 credentials (Web application)
5. Add redirect URI:
   ```
   http://localhost:3001/api/v1/auth/google/callback
   ```
6. Copy Client ID and Client Secret

#### 2. Backend Configuration
Add to `/backend/.env`:
```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3001/api/v1/auth/google/callback
FRONTEND_URL=http://localhost:3000
```

#### 3. Restart Backend
```bash
cd backend
npm run start:dev
```

### OAuth Flow
```
User clicks "Sign in with Google"
  ↓
Backend redirects to Google OAuth
  ↓
User selects Google account
  ↓
Backend validates email domain (@eecd.in)
  ↓
If valid: Create/find user → Generate JWT
If invalid: 403 Forbidden error
  ↓
Redirect to frontend with tokens
  ↓
Frontend stores tokens → Fetch user data
  ↓
✅ User logged in
```

### Domain Validation
**File:** `/backend/src/auth/strategies/google.strategy.ts`
```typescript
if (!email.endsWith('@eecd.in')) {
  throw new UnauthorizedException(
    'Access denied. Only @eecd.in email addresses are allowed.'
  );
}
```

---

## ✨ Key Features

### 1. Automated User Provisioning
When an employee is created:
- User account automatically generated
- Email validation: Must be `@eecd.in`
- Username extracted from email
- Default password: `{username}@easternestate`
- Initial role: `staff`
- Admin/HR updates roles later

**Implementation:** `/backend/src/modules/employees/employees.service.ts`

### 2. Property Inventory Protection
- **View Access:** All roles can view properties, towers, flats (for dropdowns)
- **Edit Access:** Only Admin and Super Admin can create/edit/delete
- **Guards Applied:**
  - PropertiesController: `@Roles(ADMIN, SUPER_ADMIN)` on mutations
  - TowersController: `@Roles(ADMIN, SUPER_ADMIN)` on mutations
  - FlatsController: `@Roles(ADMIN, SUPER_ADMIN)` on mutations

### 3. Notification System
**Triggers:**
- Property access granted/revoked
- User roles updated
- Demand drafts submitted
- Construction milestones updated

**Access:** Bell icon in top-right corner

### 4. Demand Drafts
- Users can create their own demand drafts
- Select flat to send to
- Admin approval required
- Notifications sent to admins

### 5. Construction Milestone Sorting
**For Admin/Super Admin:**
- Sort by property in construction milestones
- Filter by property
- View project-wise progress

### 6. Dynamic Dashboard
**URL:** `http://localhost:3000/`
- Beautiful animated UI
- Role-based content
- Quick action cards
- Modern gradient design

---

## 👤 User Credentials

### Test Accounts

| Email | Password | Role | Property Access |
|-------|----------|------|-----------------|
| `admin@eecd.in` | `admin@easternestate` | Super Admin | All properties |
| `info@eecd.in` | `info@easternestate` | Staff | 6 properties assigned |
| `arnav@eecd.in` | `arnav@easternestate` | Construction Team | All properties assigned |

### Creating New Users

**Via Employee Module:**
1. Go to HR → Employees
2. Add new employee with `@eecd.in` email
3. User automatically created
4. Update role in Users module

**Via Google OAuth:**
1. Sign in with `@eecd.in` Google account
2. User automatically created with `staff` role
3. Admin updates roles as needed

---

## ⚙️ Setup & Configuration

### Prerequisites
- Node.js 20+
- PostgreSQL 14+
- npm or yarn

### Initial Setup

#### 1. Clone & Install
```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

#### 2. Database Setup
```bash
# Create database
createdb eastern_estate_erp

# Run migrations
cd backend
npm run migration:run
```

#### 3. Environment Variables

**Backend** (`/backend/.env`):
```env
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your_password
DATABASE_NAME=eastern_estate_erp

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRATION=24h
JWT_REFRESH_SECRET=your-super-secret-refresh-key
JWT_REFRESH_EXPIRATION=7d

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3001/api/v1/auth/google/callback
FRONTEND_URL=http://localhost:3000

# Server
PORT=3001
```

**Frontend** (`/frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

#### 4. Start Services
```bash
# Terminal 1 - Backend
cd backend
npm run start:dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

#### 5. Access Application
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001/api/v1

---

## 🧪 Testing Guide

### 1. Login Testing

**Regular Login:**
```
URL: http://localhost:3000/login
Credentials: admin@eecd.in / admin@easternestate
Expected: ✅ Login successful, redirect to dashboard
```

**Google OAuth (Valid Domain):**
```
Click: "Sign in with Google (@eecd.in)"
Account: any-name@eecd.in
Expected: ✅ Login successful, user auto-created
```

**Google OAuth (Invalid Domain):**
```
Click: "Sign in with Google (@eecd.in)"
Account: someone@gmail.com
Expected: ❌ 403 Forbidden, error page shown
```

### 2. Role-Based Access Testing

**Admin:**
- Can access: All modules
- Can edit: Properties, towers, flats
- Can manage: Users, roles, property access

**Staff:**
- Can access: Assigned modules only
- Cannot edit: Properties, towers, flats
- Cannot access: Database, Users, Roles

### 3. Property Access Testing

**Assign Property:**
```
1. Login as admin@eecd.in
2. Go to: http://localhost:3000/property-access
3. Select user → Click "Grant Access"
4. Choose property & role → Save
5. User should see property in their list
```

**Test Access:**
```
1. Login as staff user (info@eecd.in)
2. Try to edit a flat
3. Expected: ❌ 403 Forbidden
```

### 4. Employee Auto-User Creation

**Test:**
```
1. Go to HR → Employees
2. Add employee: test@eecd.in
3. Check Users module
4. User "test" should exist with staff role
5. Login: test@eecd.in / test@easternestate
```

---

## 🔧 Common Issues

### Issue 1: Google OAuth "redirect_uri_mismatch"

**Cause:** Redirect URI in Google Console doesn't match backend config

**Solution:**
1. Check `/backend/.env`: `GOOGLE_CALLBACK_URL=http://localhost:3001/api/v1/auth/google/callback`
2. Verify in Google Cloud Console: Same URI added to "Authorized redirect URIs"
3. Restart backend: `cd backend && npm run start:dev`
4. Wait 2 minutes for Google changes to propagate

### Issue 2: "Invalid Credentials" on Login

**Cause:** Password hashing mismatch or wrong password

**Solution:**
```sql
-- Reset password for user
UPDATE users 
SET password_hash = crypt('newpassword', gen_salt('bf'))
WHERE email = 'user@eecd.in';

-- Enable pgcrypto extension if not enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;
```

### Issue 3: "Cannot POST /api/v1/users/:id/property-access"

**Cause:** Backend routes not registered or server not restarted

**Solution:**
1. Restart backend
2. Check `/backend/src/modules/users/users.module.ts`
3. Verify `PropertyAccessController` is in controllers array

### Issue 4: User Cannot See Assigned Properties

**Cause:** 
- Property access not assigned in database
- User doesn't have correct role

**Solution:**
```sql
-- Check user's property access
SELECT u.email, p.name as property, upa.role, upa.is_active
FROM user_property_access upa
JOIN users u ON upa.user_id = u.id
JOIN properties p ON upa.property_id = p.id
WHERE u.email = 'user@eecd.in';

-- Grant access if missing
INSERT INTO user_property_access (user_id, property_id, role, is_active)
SELECT 
  (SELECT id FROM users WHERE email = 'user@eecd.in'),
  id,
  'PROPERTY_VIEWER',
  true
FROM properties;
```

### Issue 5: Backend Won't Start - "Port 3001 in use"

**Solution:**
```bash
# Kill process on port 3001
lsof -ti :3001 | xargs kill -9

# Restart backend
cd backend
npm run start:dev
```

---

## 📚 Important Files Reference

### Backend Key Files
```
backend/
├── src/
│   ├── auth/
│   │   ├── strategies/
│   │   │   ├── google.strategy.ts     # Google OAuth logic
│   │   │   └── jwt.strategy.ts        # JWT validation
│   │   ├── guards/
│   │   │   ├── roles.guard.ts         # Role-based authorization
│   │   │   └── property-access.guard.ts  # Property-level access
│   │   └── auth.controller.ts         # Auth routes
│   ├── common/
│   │   └── constants/roles.constant.ts  # Role definitions
│   ├── modules/
│   │   ├── users/
│   │   │   ├── services/property-access.service.ts
│   │   │   ├── controllers/property-access.controller.ts
│   │   │   └── users.service.ts
│   │   ├── employees/employees.service.ts
│   │   ├── properties/properties.service.ts
│   │   ├── flats/flats.controller.ts
│   │   └── towers/towers.controller.ts
│   └── database/migrations/
│       ├── 004_simplify_roles_system.sql
│       └── 005_create_users_for_employees.sql
└── .env                              # Environment variables
```

### Frontend Key Files
```
frontend/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx        # Login page with Google button
│   │   │   └── auth/google/callback/page.tsx  # OAuth callback
│   │   ├── (dashboard)/
│   │   │   ├── page.tsx              # Beautiful dashboard
│   │   │   └── property-access/page.tsx  # Property access management
│   │   └── layout.tsx
│   ├── components/layout/Sidebar.tsx  # Role-based navigation
│   ├── lib/roles.ts                  # Role definitions & access config
│   ├── store/authStore.ts            # Authentication state
│   └── services/
│       ├── auth.service.ts           # Auth API calls
│       └── api.ts                    # Axios instance with interceptors
└── .env.local                        # Environment variables
```

---

## 🎯 Summary of Implementation

### What Was Built (Last 3 Days)

#### Day 1: Role System & Access Control
- ✅ Simplified roles from 15+ to 8 core roles
- ✅ Implemented role-based guards and decorators
- ✅ Dynamic sidebar navigation based on roles
- ✅ Database cleanup (removed inactive roles)

#### Day 2: Property-Level Multi-Tenancy
- ✅ Property access system with `user_property_access` table
- ✅ PropertyAccessGuard for filtering data
- ✅ Property access management UI
- ✅ Bulk property assignment operations
- ✅ Notification system integration

#### Day 3: Google OAuth & Refinements
- ✅ Google OAuth integration with domain validation
- ✅ Automated user provisioning from employees
- ✅ Fixed property inventory permissions
- ✅ Beautiful dashboard redesign
- ✅ Comprehensive testing and bug fixes

### Database Changes
- ✅ 8 active roles (old roles deleted)
- ✅ All users have bcrypt-hashed passwords
- ✅ Property access tracking table
- ✅ User auto-creation for employees
- ✅ pgcrypto extension enabled

### Security Enhancements
- ✅ Domain-restricted authentication
- ✅ Role-based API authorization
- ✅ Property-level data isolation
- ✅ JWT token authentication
- ✅ Password lockout after 5 failed attempts

---

## 🚀 Production Deployment Notes

**Before deploying to production:**

1. **Environment Variables:**
   - Change all secrets and keys
   - Update database credentials
   - Set production Google OAuth callback URL
   - Configure frontend URL

2. **Database:**
   - Run all migrations
   - Set up backups
   - Configure connection pooling

3. **Security:**
   - Enable HTTPS
   - Configure CORS properly
   - Set secure cookie flags
   - Enable rate limiting

4. **Google OAuth:**
   - Update redirect URIs in Google Console
   - Add production domain
   - Review consent screen settings

---

## 📞 Support

**For issues or questions:**
- Check "Common Issues" section above
- Review relevant files in "Important Files Reference"
- Contact system administrator

---

**Document Version:** 1.0  
**Last Updated:** February 17, 2026  
**System:** Eastern Estate ERP v1.0
