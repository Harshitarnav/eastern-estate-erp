-- Roles and Permissions System Migration
-- Eastern Estate ERP (idempotent)

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Ensure roles table columns exist (unified with backend/src/modules/users & roles)
ALTER TABLE roles 
    ADD COLUMN IF NOT EXISTS display_name VARCHAR(200) NOT NULL DEFAULT name,
    ADD COLUMN IF NOT EXISTS description TEXT,
    ADD COLUMN IF NOT EXISTS is_system BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS is_system_role BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS created_by UUID,
    ADD COLUMN IF NOT EXISTS updated_by UUID,
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Ensure permissions table columns exist (supports both name/display_name and module/action/resource)
ALTER TABLE permissions 
    ADD COLUMN IF NOT EXISTS name VARCHAR(100),
    ADD COLUMN IF NOT EXISTS display_name VARCHAR(100),
    ADD COLUMN IF NOT EXISTS module VARCHAR(100),
    ADD COLUMN IF NOT EXISTS action VARCHAR(100),
    ADD COLUMN IF NOT EXISTS resource VARCHAR(100),
    ADD COLUMN IF NOT EXISTS description TEXT,
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'uq_permissions_module_action_resource'
    ) THEN
        ALTER TABLE permissions ADD CONSTRAINT uq_permissions_module_action_resource UNIQUE (module, action, resource);
    END IF;
END $$;

-- Ensure role_permissions junction table exists with id + metadata
CREATE TABLE IF NOT EXISTS role_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    constraints JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(role_id, permission_id)
);

-- Add role mapping columns on employees
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
INSERT INTO roles (name, display_name, description, is_system, is_system_role, is_active) VALUES
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
INSERT INTO permissions (name, display_name, module, action, resource, description) VALUES
('properties:create', 'Create Properties', 'properties', 'create', NULL, 'Create new properties'),
('properties:read', 'View Properties', 'properties', 'read', NULL, 'View properties'),
('properties:update', 'Update Properties', 'properties', 'update', NULL, 'Update properties'),
('properties:delete', 'Delete Properties', 'properties', 'delete', NULL, 'Delete properties'),
('properties:manage_pricing', 'Manage Pricing', 'properties', 'manage_pricing', NULL, 'Manage property pricing'),

('bookings:create', 'Create Bookings', 'bookings', 'create', NULL, 'Create new bookings'),
('bookings:read', 'View Bookings', 'bookings', 'read', NULL, 'View bookings'),
('bookings:update', 'Update Bookings', 'bookings', 'update', NULL, 'Update bookings'),
('bookings:delete', 'Delete Bookings', 'bookings', 'delete', NULL, 'Delete bookings'),
('bookings:approve', 'Approve Bookings', 'bookings', 'approve', NULL, 'Approve bookings'),

('payments:create', 'Record Payments', 'payments', 'create', NULL, 'Record payments'),
('payments:read', 'View Payments', 'payments', 'read', NULL, 'View payments'),
('payments:update', 'Update Payments', 'payments', 'update', NULL, 'Update payments'),
('payments:approve', 'Approve Payments', 'payments', 'approve', NULL, 'Approve payments'),
('payments:refund', 'Process Refunds', 'payments', 'refund', NULL, 'Process refunds'),

('customers:create', 'Create Customers', 'customers', 'create', NULL, 'Create customers'),
('customers:read', 'View Customers', 'customers', 'read', NULL, 'View customers'),
('customers:update', 'Update Customers', 'customers', 'update', NULL, 'Update customers'),
('customers:delete', 'Delete Customers', 'customers', 'delete', NULL, 'Delete customers'),

('employees:create', 'Create Employees', 'employees', 'create', NULL, 'Create employees'),
('employees:read', 'View Employees', 'employees', 'read', NULL, 'View employees'),
('employees:update', 'Update Employees', 'employees', 'update', NULL, 'Update employees'),
('employees:delete', 'Delete Employees', 'employees', 'delete', NULL, 'Delete employees'),
('employees:manage_salary', 'Manage Salaries', 'employees', 'manage_salary', NULL, 'Manage employee salaries'),

('leads:create', 'Create Leads', 'leads', 'create', NULL, 'Create leads'),
('leads:read', 'View Leads', 'leads', 'read', NULL, 'View leads'),
('leads:update', 'Update Leads', 'leads', 'update', NULL, 'Update leads'),
('leads:delete', 'Delete Leads', 'leads', 'delete', NULL, 'Delete leads'),
('leads:assign', 'Assign Leads', 'leads', 'assign', NULL, 'Assign leads to agents'),
('leads:bulk_operations', 'Bulk Lead Operations', 'leads', 'bulk_operations', NULL, 'Perform bulk operations'),

('construction:create', 'Create Projects', 'construction', 'create', NULL, 'Create construction projects'),
('construction:read', 'View Projects', 'construction', 'read', NULL, 'View construction projects'),
('construction:update', 'Update Projects', 'construction', 'update', NULL, 'Update construction projects'),
('construction:approve', 'Approve Construction', 'construction', 'approve', NULL, 'Approve construction changes'),

('materials:create', 'Add Materials', 'materials', 'create', NULL, 'Add materials'),
('materials:read', 'View Materials', 'materials', 'read', NULL, 'View materials'),
('materials:update', 'Update Materials', 'materials', 'update', NULL, 'Update materials'),
('materials:request', 'Request Materials', 'materials', 'request', NULL, 'Request materials'),

('vendors:create', 'Create Vendors', 'vendors', 'create', NULL, 'Create vendors'),
('vendors:read', 'View Vendors', 'vendors', 'read', NULL, 'View vendors'),
('vendors:update', 'Update Vendors', 'vendors', 'update', NULL, 'Update vendors'),
('vendors:manage_payments', 'Manage Vendor Payments', 'vendors', 'manage_payments', NULL, 'Manage vendor payments'),

('accounting:create', 'Create Accounting Entries', 'accounting', 'create', NULL, 'Create accounting entries'),
('accounting:read', 'View Accounting', 'accounting', 'read', NULL, 'View accounting data'),
('accounting:update', 'Update Accounting Entries', 'accounting', 'update', NULL, 'Update accounting entries'),
('accounting:approve', 'Approve Accounting Entries', 'accounting', 'approve', NULL, 'Approve accounting entries'),

('reports:view_all', 'View All Reports', 'reports', 'view_all', NULL, 'View all reports'),
('reports:view_sales', 'View Sales Reports', 'reports', 'view_sales', NULL, 'View sales reports'),
('reports:view_financial', 'View Financial Reports', 'reports', 'view_financial', NULL, 'View financial reports'),
('reports:view_construction', 'View Construction Reports', 'reports', 'view_construction', NULL, 'View construction reports'),
('reports:export', 'Export Reports', 'reports', 'export', NULL, 'Export reports')

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

-- Summary
DO $$
BEGIN
    RAISE NOTICE '✅ Roles and permissions ensured.';
END $$;
