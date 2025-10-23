-- Roles and Permissions System Migration
-- Eastern Estate ERP

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create roles table
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(200) NOT NULL,
    description TEXT,
    is_system_role BOOLEAN DEFAULT false, -- Cannot be deleted if true
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- Create permissions table
CREATE TABLE IF NOT EXISTS permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module VARCHAR(100) NOT NULL, -- e.g., 'properties', 'bookings', 'leads'
    action VARCHAR(100) NOT NULL, -- e.g., 'create', 'read', 'update', 'delete'
    resource VARCHAR(100), -- Optional sub-resource
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(module, action, resource)
);

-- Create role_permissions junction table
CREATE TABLE IF NOT EXISTS role_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    constraints JSONB, -- Additional constraints like {"scope": "own_only"}
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(role_id, permission_id)
);

-- Add role_id to employees table
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS role_id UUID REFERENCES roles(id),
ADD COLUMN IF NOT EXISTS secondary_roles UUID[] DEFAULT '{}';

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_roles_name ON roles(name);
CREATE INDEX IF NOT EXISTS idx_roles_active ON roles(is_active);
CREATE INDEX IF NOT EXISTS idx_permissions_module ON permissions(module);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission ON role_permissions(permission_id);
CREATE INDEX IF NOT EXISTS idx_employees_role ON employees(role_id);

-- Insert default system roles
INSERT INTO roles (name, display_name, description, is_system_role) VALUES
('super_admin', 'Super Admin', 'Company owner/director with full system access', true),
('admin', 'Admin', 'General Manager overseeing all operations', true),
('sales_manager', 'Sales Manager', 'Leads the sales team', true),
('sales_agent', 'Sales Agent', 'Front-line sales representatives', true),
('construction_manager', 'Construction Manager', 'Oversees all construction projects', true),
('site_engineer', 'Site Engineer', 'On-site project execution', true),
('construction_worker', 'Construction Worker', 'Field workers', true),
('accounts_manager', 'Accounts Manager', 'Head of finance department', true),
('accountant', 'Accountant', 'Day-to-day accounting operations', true),
('property_manager', 'Property Manager', 'Manages property inventory', true),
('hr_manager', 'HR Manager', 'Human resources head', true),
('hr_executive', 'HR Executive', 'HR operations', true),
('marketing_manager', 'Marketing Manager', 'Marketing & campaigns lead', true),
('marketing_executive', 'Marketing Executive', 'Marketing operations', true),
('customer_service', 'Customer Service', 'Customer support', true)
ON CONFLICT (name) DO NOTHING;

-- Insert default permissions
INSERT INTO permissions (module, action, resource, description) VALUES
-- Properties
('properties', 'create', NULL, 'Create new properties'),
('properties', 'read', NULL, 'View properties'),
('properties', 'update', NULL, 'Update properties'),
('properties', 'delete', NULL, 'Delete properties'),
('properties', 'manage_pricing', NULL, 'Manage property pricing'),

-- Bookings
('bookings', 'create', NULL, 'Create new bookings'),
('bookings', 'read', NULL, 'View bookings'),
('bookings', 'update', NULL, 'Update bookings'),
('bookings', 'delete', NULL, 'Delete bookings'),
('bookings', 'approve', NULL, 'Approve bookings'),

-- Payments
('payments', 'create', NULL, 'Record payments'),
('payments', 'read', NULL, 'View payments'),
('payments', 'update', NULL, 'Update payments'),
('payments', 'approve', NULL, 'Approve payments'),
('payments', 'refund', NULL, 'Process refunds'),

-- Customers
('customers', 'create', NULL, 'Create customers'),
('customers', 'read', NULL, 'View customers'),
('customers', 'update', NULL, 'Update customers'),
('customers', 'delete', NULL, 'Delete customers'),

-- Employees
('employees', 'create', NULL, 'Create employees'),
('employees', 'read', NULL, 'View employees'),
('employees', 'update', NULL, 'Update employees'),
('employees', 'delete', NULL, 'Delete employees'),
('employees', 'manage_salary', NULL, 'Manage employee salaries'),

-- Leads
('leads', 'create', NULL, 'Create leads'),
('leads', 'read', NULL, 'View leads'),
('leads', 'update', NULL, 'Update leads'),
('leads', 'delete', NULL, 'Delete leads'),
('leads', 'assign', NULL, 'Assign leads to agents'),
('leads', 'bulk_operations', NULL, 'Perform bulk operations'),

-- Construction
('construction', 'create', NULL, 'Create construction projects'),
('construction', 'read', NULL, 'View construction projects'),
('construction', 'update', NULL, 'Update construction projects'),
('construction', 'approve', NULL, 'Approve construction changes'),

-- Materials
('materials', 'create', NULL, 'Add materials'),
('materials', 'read', NULL, 'View materials'),
('materials', 'update', NULL, 'Update materials'),
('materials', 'request', NULL, 'Request materials'),

-- Vendors
('vendors', 'create', NULL, 'Create vendors'),
('vendors', 'read', NULL, 'View vendors'),
('vendors', 'update', NULL, 'Update vendors'),
('vendors', 'manage_payments', NULL, 'Manage vendor payments'),

-- Accounting
('accounting', 'create', NULL, 'Create accounting entries'),
('accounting', 'read', NULL, 'View accounting data'),
('accounting', 'update', NULL, 'Update accounting entries'),
('accounting', 'approve', NULL, 'Approve accounting entries'),

-- Reports
('reports', 'view_all', NULL, 'View all reports'),
('reports', 'view_sales', NULL, 'View sales reports'),
('reports', 'view_financial', NULL, 'View financial reports'),
('reports', 'view_construction', NULL, 'View construction reports'),
('reports', 'export', NULL, 'Export reports')

ON CONFLICT (module, action, resource) DO NOTHING;

-- Grant permissions to Super Admin (all permissions)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'super_admin'
ON CONFLICT DO NOTHING;

-- Grant permissions to Admin
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'admin'
AND p.module NOT IN ('employees') -- Limited employee access
ON CONFLICT DO NOTHING;

-- Grant permissions to Sales Manager
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'sales_manager'
AND p.module IN ('properties', 'leads', 'bookings', 'customers', 'payments', 'reports')
AND p.action != 'delete'
ON CONFLICT DO NOTHING;

-- Grant permissions to Sales Agent
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'sales_agent'
AND p.module IN ('properties', 'leads', 'bookings', 'customers')
AND p.action IN ('read', 'create', 'update')
ON CONFLICT DO NOTHING;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers
DROP TRIGGER IF EXISTS update_roles_updated_at ON roles;
CREATE TRIGGER update_roles_updated_at
    BEFORE UPDATE ON roles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE roles IS 'System roles for RBAC';
COMMENT ON TABLE permissions IS 'System permissions for granular access control';
COMMENT ON TABLE role_permissions IS 'Junction table mapping roles to permissions';
COMMENT ON COLUMN role_permissions.constraints IS 'JSON constraints like scope limitations';
