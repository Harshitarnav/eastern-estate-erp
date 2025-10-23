# ERP Roles & Permissions System

## Overview
Comprehensive role-based access control (RBAC) system for Eastern Estate ERP with granular permissions across all modules.

---

## Role Hierarchy

```
SUPER_ADMIN (Company Owner/Director)
├── ADMIN (General Manager)
├── SALES_MANAGER (Sales GM)
│   └── SALES_AGENT
├── CONSTRUCTION_MANAGER (Project Manager)
│   ├── SITE_ENGINEER
│   └── CONSTRUCTION_WORKER
├── ACCOUNTS_MANAGER (Finance Head)
│   └── ACCOUNTANT
├── PROPERTY_MANAGER
├── HR_MANAGER
│   └── HR_EXECUTIVE
├── MARKETING_MANAGER
│   └── MARKETING_EXECUTIVE
└── CUSTOMER_SERVICE
```

---

## Role Definitions

### 1. SUPER_ADMIN
**Description:** Company owner/director with full system access
**Permissions:** ALL
- Full access to all modules
- Can create/modify/delete any record
- Can assign any role
- Can view all reports and analytics
- Can configure system settings

### 2. ADMIN
**Description:** General Manager overseeing all operations
**Permissions:**
- **Properties:** Full access
- **Bookings:** Full access
- **Payments:** Full access  
- **Customers:** Full access
- **Employees:** Full access (except salary details of seniors)
- **Construction:** View & approve
- **Accounting:** View all, edit non-finalized
- **Leads/Sales:** View all, edit own team
- **Marketing:** Full access
- **Reports:** View all

### 3. SALES_MANAGER
**Description:** Leads the sales team
**Permissions:**
- **Properties:** View all, edit pricing
- **Leads:** Full access to team leads
- **Bookings:** Create, edit, view all
- **Customers:** Full access
- **Payments:** View, create payment requests
- **Employees:** View team only
- **Reports:** Sales reports

### 4. SALES_AGENT
**Description:** Front-line sales representatives
**Permissions:**
- **Properties:** View all (read-only)
- **Leads:** View/edit assigned leads only
- **Bookings:** Create, view own
- **Customers:** View/edit assigned customers
- **Payments:** View assigned, request payments
- **Employees:** View team members
- **Reports:** Personal performance only

### 5. CONSTRUCTION_MANAGER
**Description:** Oversees all construction projects
**Permissions:**
- **Construction Projects:** Full access
- **Materials:** Full inventory management
- **Vendors:** Full access
- **Purchase Orders:** Create, approve
- **Teams:** Full team management
- **Progress:** Update, view all
- **Properties:** View related properties
- **Employees:** Manage construction team
- **Reports:** Construction & inventory reports

### 6. SITE_ENGINEER
**Description:** On-site project execution
**Permissions:**
- **Construction Projects:** View assigned, update progress
- **Materials:** Request, track usage
- **Vendors:** View, coordinate
- **Purchase Orders:** Request only
- **Teams:** View team, update work logs
- **Progress:** Update assigned projects
- **Properties:** View assigned
- **Reports:** Site progress reports

### 7. CONSTRUCTION_WORKER
**Description:** Field workers
**Permissions:**
- **Construction Projects:** View assigned tasks
- **Materials:** View requirements
- **Teams:** View team info
- **Progress:** Mark tasks complete
- **Reports:** Personal attendance

### 8. ACCOUNTS_MANAGER
**Description:** Head of finance department
**Permissions:**
- **Accounting:** Full access
- **Payments:** Full access, approve all
- **Expenses:** Full access
- **Budgets:** Create, manage, approve
- **Journal Entries:** Full access
- **Bookings:** View financial details
- **Vendors:** View payment history
- **Employees:** View, manage salaries
- **Reports:** All financial reports

### 9. ACCOUNTANT
**Description:** Day-to-day accounting operations
**Permissions:**
- **Accounting:** Create/edit entries
- **Payments:** Record, process
- **Expenses:** Record, categorize
- **Budgets:** View, track
- **Journal Entries:** Create (pending approval)
- **Bookings:** View payment schedules
- **Vendors:** Record payments
- **Reports:** Standard financial reports

### 10. PROPERTY_MANAGER
**Description:** Manages property inventory
**Permissions:**
- **Properties:** Full access
- **Towers:** Full access
- **Flats:** Full access
- **Construction:** View progress
- **Bookings:** View all
- **Customers:** View property-related
- **Reports:** Inventory & availability reports

### 11. HR_MANAGER
**Description:** Human resources head
**Permissions:**
- **Employees:** Full access
- **Salaries:** Full access
- **Bonuses:** Approve & process
- **Reviews:** Full access
- **Documents:** Full access
- **Attendance:** View all
- **Leaves:** Approve all
- **Reports:** HR & payroll reports

### 12. HR_EXECUTIVE
**Description:** HR operations
**Permissions:**
- **Employees:** Create, view, edit (non-sensitive)
- **Documents:** Upload, manage
- **Attendance:** Record & view
- **Leaves:** Request approval
- **Reviews:** Schedule, record
- **Reports:** Basic HR reports

### 13. MARKETING_MANAGER
**Description:** Marketing & campaigns lead
**Permissions:**
- **Marketing:** Full campaign management
- **Leads:** View all, assign to sales
- **Properties:** View all for campaigns
- **Customers:** View for segmentation
- **Reports:** Marketing analytics

### 14. MARKETING_EXECUTIVE
**Description:** Marketing operations
**Permissions:**
- **Marketing:** Create/manage campaigns
- **Leads:** Create, import
- **Properties:** View for marketing
- **Reports:** Campaign performance

### 15. CUSTOMER_SERVICE
**Description:** Customer support
**Permissions:**
- **Customers:** View, update contact info
- **Bookings:** View, assist
- **Payments:** View status
- **Properties:** View details
- **Leads:** Create inquiries
- **Support Tickets:** Full access
- **Chat:** Respond to customer queries

---

## Permission Matrix

| Module | Super Admin | Admin | Sales Manager | Sales Agent | Construction Manager | Site Engineer | Accountant | Property Manager | HR Manager | Customer Service |
|--------|-------------|-------|---------------|-------------|---------------------|---------------|------------|------------------|------------|------------------|
| **Properties** | Full | Full | View+Edit Pricing | View | View | View | View | Full | View | View |
| **Towers** | Full | Full | View | View | View+Progress | View | View | Full | - | View |
| **Flats** | Full | Full | View | View | View+Progress | View | View | Full | - | View |
| **Bookings** | Full | Full | Full | Create+View Own | View | - | View Financial | View | - | View+Assist |
| **Payments** | Full | Full | View+Request | View Own | - | - | Full | View | View | View Status |
| **Customers** | Full | Full | Full | View Assigned | - | - | View | View | View | Full |
| **Employees** | Full | Full (limit) | View Team | View Team | View Team | View Team | View | View | Full | - |
| **Construction** | Full | View+Approve | - | - | Full | Update Assigned | View | View | - | - |
| **Materials** | Full | View | - | - | Full | Request | View | View | - | - |
| **Vendors** | Full | View | - | - | Full | View | Record Payments | View | - | - |
| **Accounting** | Full | Edit Non-Final | View | - | - | - | Full | - | View Payroll | - |
| **Expenses** | Full | View | - | - | Request | Request | Full | - | - | - |
| **Budgets** | Full | View | - | - | View | - | Full | - | View | - |
| **Leads** | Full | View All | Full Team | View Assigned | - | - | - | - | - | Create |
| **Marketing** | Full | Full | View | - | - | - | - | - | - | - |
| **Chat** | Full | Full | Full | Team Only | Full | Team Only | Full | Full | Full | Full |
| **Notifications** | All | All | Team | Own | Team | Own | Own | Own | All | Own |
| **Reports** | All | All | Sales | Personal | Construction | Site | Financial | Inventory | HR | Customer |

---

## Permission Actions

### CRUD Operations
- **CREATE:** Can create new records
- **READ:** Can view records
- **UPDATE:** Can modify records
- **DELETE:** Can delete records
- **APPROVE:** Can approve pending items
- **EXPORT:** Can export data
- **IMPORT:** Can import data

### Special Permissions
- **ASSIGN:** Can assign to others
- **BULK_OPERATIONS:** Can perform bulk actions
- **FINANCIAL_VIEW:** Can see monetary values
- **SALARY_VIEW:** Can see salary information
- **REPORTS:** Can generate reports

---

## Implementation

### Database Schema
```sql
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(200) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module VARCHAR(100) NOT NULL,
    action VARCHAR(100) NOT NULL,
    resource VARCHAR(100),
    description TEXT,
    UNIQUE(module, action, resource)
);

CREATE TABLE role_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
    constraints JSONB, -- Additional constraints like "own_only", "team_only"
    UNIQUE(role_id, permission_id)
);

-- Add role_id to employees table
ALTER TABLE employees 
ADD COLUMN role_id UUID REFERENCES roles(id),
ADD COLUMN secondary_roles UUID[]; -- For employees with multiple roles
```

---

## Frontend Implementation

### Role Selection in Employee Form
```typescript
<Select
  value={employee.roleId}
  onChange={(value) => setEmployee({...employee, roleId: value})}
>
  <SelectItem value="super-admin">Super Admin</SelectItem>
  <SelectItem value="admin">Admin</SelectItem>
  <SelectItem value="sales-manager">Sales Manager</SelectItem>
  <SelectItem value="sales-agent">Sales Agent</SelectItem>
  <SelectItem value="construction-manager">Construction Manager</SelectItem>
  <SelectItem value="site-engineer">Site Engineer</SelectItem>
  <SelectItem value="accountant">Accountant</SelectItem>
  <SelectItem value="property-manager">Property Manager</SelectItem>
  <SelectItem value="hr-manager">HR Manager</SelectItem>
  <SelectItem value="customer-service">Customer Service</SelectItem>
</Select>
```

### Permission Check Hook
```typescript
// usePermissions.ts
export function usePermissions() {
  const { user } = useAuth();
  
  const can = (module: string, action: string, resource?: any) => {
    return checkPermission(user.role, module, action, resource);
  };
  
  return { can };
}

// Usage in components
const { can } = usePermissions();

{can('bookings', 'create') && (
  <Button>Create Booking</Button>
)}
```

---

## Security Considerations

1. **Role Hierarchy:** Lower roles cannot elevate their own permissions
2. **Audit Logging:** All role changes and permission grants logged
3. **Session Management:** Role changes require re-login
4. **API Protection:** Backend validates permissions on every request
5. **UI Protection:** Frontend hides/disables unauthorized actions

---

## Migration Plan

1. Create roles and permissions tables
2. Seed initial roles and permissions
3. Assign default roles to existing employees
4. Update all API endpoints with permission checks
5. Update frontend with conditional rendering
6. Test each role thoroughly
7. Deploy with documentation

---

## Next Steps

1. Implement role entity and migrations
2. Create role management UI
3. Add permission checks to all controllers
4. Update employee form with role selection
5. Create permission checking middleware
6. Add role-based route guards
7. Create admin panel for role management
