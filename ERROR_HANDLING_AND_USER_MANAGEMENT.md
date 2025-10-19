# Complete Error Handling and User Management Guide

## Overview

This document provides a comprehensive guide to the error handling and user management implementation for the Eastern Estate ERP system.

## ✅ Completed: Comprehensive Database Error Handling

### Backend Exception Filter Enhanced

**File**: `backend/src/common/filters/http-exception.filter.ts`

All PostgreSQL error codes are now handled with user-friendly messages:

### Error Categories Handled

#### 1. Integrity Constraint Violations (Class 23)
- **23000**: Data integrity violation
- **23001**: Restrict violation (record referenced by others)
- **23502**: NOT NULL violation (missing required field)
- **23503**: Foreign key violation (referenced record not found)
- **23505**: Unique constraint violation (duplicate entry)
- **23514**: Check constraint violation (validation failed)

#### 2. Data Exceptions (Class 22)
- **22000**: Generic data exception
- **22001**: String too long
- **22003**: Numeric value out of range
- **22007**: Invalid datetime format
- **22008**: Datetime field overflow
- **22012**: Division by zero
- **22P02**: Invalid text representation/data format

#### 3. Syntax/Access Violations (Class 42)
- **42501**: Insufficient privileges
- **42601**: SQL syntax error
- **42703**: Undefined column (schema error)
- **42P01**: Undefined table

#### 4. Connection Exceptions (Class 08)
- **08000/08003/08006**: Database connection errors

#### 5. Resource Issues (Class 53)
- **53000/53100/53200/53300**: Server resource exhaustion

#### 6. Operation Cancellation (Class 57)
- **57000/57014/57P01**: Database operation cancelled

#### 7. Transaction Conflicts (Class 40)
- **40000/40001/40P01**: Transaction rollback/conflict

### Example Error Responses

**Duplicate Entry**:
```json
{
  "statusCode": 409,
  "timestamp": "2025-10-18T10:30:00.000Z",
  "path": "/api/v1/flats",
  "method": "POST",
  "error": "Duplicate Entry",
  "message": "This record already exists. Please use unique values."
}
```

**Missing Required Field**:
```json
{
  "statusCode": 400,
  "timestamp": "2025-10-18T10:30:00.000Z",
  "path": "/api/v1/customers",
  "method": "POST",
  "error": "Not Null Violation",
  "message": "Required field is missing. Please fill all required fields."
}
```

**Foreign Key Violation**:
```json
{
  "statusCode": 400,
  "timestamp": "2025-10-18T10:30:00.000Z",
  "path": "/api/v1/bookings",
  "method": "POST",
  "error": "Foreign Key Violation",
  "message": "Referenced record not found. Please check related data."
}
```

## ✅ User Management for Superadmin

### Existing Functionality

The system already has complete user management functionality that allows superadmins to:

1. **Create Users**
2. **Assign Roles**
3. **Update Users**
4. **Delete Users**
5. **Toggle User Status**
6. **List All Users**

### API Endpoints

#### 1. Create User (with Role Assignment)

**Endpoint**: `POST /api/v1/users`

**Authorization**: `super_admin`, `admin`, or `hr_manager`

**Request Body**:
```json
{
  "email": "user@example.com",
  "username": "newuser",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "roleIds": ["role-uuid-1", "role-uuid-2"]
}
```

**Response**:
```json
{
  "id": "user-uuid",
  "email": "user@example.com",
  "username": "newuser",
  "firstName": "John",
  "lastName": "Doe",
  "roles": [
    {
      "id": "role-uuid-1",
      "name": "sales_manager"
    }
  ],
  "isActive": true,
  "createdAt": "2025-10-18T10:30:00.000Z"
}
```

#### 2. List All Users

**Endpoint**: `GET /api/v1/users`

**Authorization**: `super_admin`, `admin`, or `hr_manager`

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `search`: Search by name/email
- `role`: Filter by role
- `isActive`: Filter by active status

**Response**:
```json
{
  "data": [
    {
      "id": "user-uuid",
      "email": "user@example.com",
      "username": "user1",
      "firstName": "John",
      "lastName": "Doe",
      "roles": [...],
      "isActive": true
    }
  ],
  "meta": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

#### 3. Get User by ID

**Endpoint**: `GET /api/v1/users/:id`

**Authorization**: Authenticated users (can view own profile or if authorized)

#### 4. Update User

**Endpoint**: `PATCH /api/v1/users/:id`

**Authorization**: `super_admin` or `admin` (or user updating own profile)

**Request Body**:
```json
{
  "firstName": "Updated Name",
  "roleIds": ["new-role-uuid"]
}
```

#### 5. Delete User

**Endpoint**: `DELETE /api/v1/users/:id`

**Authorization**: `super_admin` or `admin`

#### 6. Toggle User Active Status

**Endpoint**: `PATCH /api/v1/users/:id/toggle-active`

**Authorization**: `super_admin` or `admin`

### Available Roles

The system includes the following roles (configurable):

1. **super_admin**: Full system access
2. **admin**: Administrative access
3. **hr_manager**: HR and user management
4. **sales_manager**: Sales operations
5. **accountant**: Financial operations
6. **construction_manager**: Construction projects
7. **inventory_manager**: Inventory management
8. **marketing_manager**: Marketing campaigns
9. **receptionist**: Front desk operations
10. **agent**: Sales agent access

### Frontend Integration

Create a user management page:

```typescript
// Example: Creating a user from frontend
import { userService } from '@/services/users.service';

const createUser = async (userData) => {
  try {
    const newUser = await userService.createUser({
      email: userData.email,
      username: userData.username,
      password: userData.password,
      firstName: userData.firstName,
      lastName: userData.lastName,
      phone: userData.phone,
      roleIds: userData.selectedRoles // Array of role UUIDs
    });
    
    console.log('User created:', newUser);
    // Show success message
  } catch (error) {
    // Error is already user-friendly thanks to exception filter
    console.error('Error creating user:', error.response?.data?.message);
    // Show error message to user
  }
};
```

### Role Management

To get available roles for assignment:

**Endpoint**: `GET /api/v1/roles`

**Authorization**: `super_admin`, `admin`, or `hr_manager`

**Response**:
```json
[
  {
    "id": "role-uuid-1",
    "name": "sales_manager",
    "description": "Manages sales operations",
    "permissions": [...]
  },
  {
    "id": "role-uuid-2",
    "name": "accountant",
    "description": "Handles financial operations",
    "permissions": [...]
  }
]
```

## Testing the Implementation

### 1. Test Database Error Handling

```bash
# Test duplicate entry
curl -X POST http://localhost:3001/api/v1/flats \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "flatNumber": "A-101",
    "towerId": "existing-tower-id",
    ...
  }'
# Second attempt should return user-friendly duplicate error

# Test missing required field
curl -X POST http://localhost:3001/api/v1/customers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "email": "test@example.com"
    # Missing required fields
  }'
# Should return user-friendly "Required field is missing" error

# Test foreign key violation
curl -X POST http://localhost:3001/api/v1/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "customerId": "non-existent-uuid",
    ...
  }'
# Should return "Referenced record not found" error
```

### 2. Test User Management

```bash
# Get available roles (as superadmin)
curl -X GET http://localhost:3001/api/v1/roles \
  -H "Authorization: Bearer SUPERADMIN_TOKEN"

# Create user with roles
curl -X POST http://localhost:3001/api/v1/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SUPERADMIN_TOKEN" \
  -d '{
    "email": "newuser@example.com",
    "username": "newuser",
    "password": "SecurePass123!",
    "firstName": "New",
    "lastName": "User",
    "roleIds": ["role-uuid-from-roles-list"]
  }'

# List all users
curl -X GET http://localhost:3001/api/v1/users \
  -H "Authorization: Bearer SUPERADMIN_TOKEN"

# Update user roles
curl -X PATCH http://localhost:3001/api/v1/users/user-uuid \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SUPERADMIN_TOKEN" \
  -d '{
    "roleIds": ["new-role-uuid"]
  }'

# Toggle user active status
curl -X PATCH http://localhost:3001/api/v1/users/user-uuid/toggle-active \
  -H "Authorization: Bearer SUPERADMIN_TOKEN"
```

## Security Considerations

### 1. Password Security
- Minimum 8 characters required
- Passwords are hashed with bcrypt
- Never stored in plain text

### 2. Role-Based Access Control (RBAC)
- All user management endpoints protected
- Only authorized roles can create/modify users
- Permissions checked at route level

### 3. Token-Based Authentication
- JWT tokens for authentication
- Refresh tokens for session management
- Tokens expire after configured time

## Best Practices

### 1. Error Handling
- ✅ Always use try-catch blocks
- ✅ Let the global exception filter handle errors
- ✅ Don't expose internal error details to users
- ✅ Log detailed errors for debugging

### 2. User Management
- ✅ Assign appropriate roles based on job function
- ✅ Regularly review user permissions
- ✅ Deactivate users instead of deleting when possible
- ✅ Enforce strong password policies

### 3. Monitoring
- ✅ Monitor error logs regularly
- ✅ Track failed authentication attempts
- ✅ Audit user creation and role changes
- ✅ Set up alerts for critical errors

## Troubleshooting

### Common Issues

#### 1. "Internal Server Error" Still Appearing
- Check if exception filter is registered in `main.ts`
- Verify database is running and accessible
- Check backend logs for actual error

#### 2. User Creation Fails
- Verify role IDs exist in database
- Check email/username uniqueness
- Ensure password meets requirements
- Verify requesting user has proper permissions

#### 3. Permission Denied Errors
- Check user's assigned roles
- Verify JWT token is valid
- Ensure role has required permissions
- Check if user is active

## Summary

### ✅ Completed Features

1. **Comprehensive Database Error Handling**
   - All PostgreSQL error codes handled
   - User-friendly error messages
   - Proper HTTP status codes
   - Detailed logging for debugging

2. **User Management for Superadmin**
   - Create users with role assignment
   - Update user details and roles
   - Delete/deactivate users
   - List and search users
   - Toggle user active status
   - Role-based access control

3. **Security**
   - Password hashing
   - JWT authentication
   - Role-based permissions
   - Audit logging

### Benefits

- **No more "Internal Server Error"** messages
- **Clear, actionable error messages** for users
- **Complete user management** from superadmin dashboard
- **Flexible role assignment** for access control
- **Secure and auditable** user operations

---

**Last Updated**: October 18, 2025
