-- ============================================================================
-- 004_simplify_roles_system.sql
-- Simplify role system to 8 core roles with clear responsibilities
-- Eastern Estate ERP - Role Simplification
-- ============================================================================

-- ============================================================================
-- 1. DEACTIVATE OLD COMPLEX ROLES
-- ============================================================================

-- Mark all existing roles as inactive (preserve data for audit)
UPDATE roles 
SET is_active = FALSE, 
    updated_at = CURRENT_TIMESTAMP
WHERE name NOT IN ('super_admin', 'admin');

-- ============================================================================
-- 2. CREATE NEW SIMPLIFIED ROLES
-- ============================================================================

-- Delete any existing roles with the new names (if they exist but with wrong config)
DELETE FROM roles WHERE name IN (
  'super_admin', 'admin', 'hr', 'construction_team', 
  'marketing_team', 'sales_team', 'staff', 'customer'
);

-- Insert the 8 simplified roles
INSERT INTO roles (name, display_name, description, is_system, is_active) VALUES
  -- Super Admin - Complete system access
  ('super_admin', 'Super Admin', 
   'Full system access including configuration, security settings, and all modules', 
   TRUE, TRUE),
  
  -- Admin - Property & operational management
  ('admin', 'Admin', 
   'Property management, user management, and operational oversight', 
   TRUE, TRUE),
  
  -- HR - Human resources & employee management
  ('hr', 'HR Manager', 
   'Employee management, user creation, role assignment, and HR operations', 
   TRUE, TRUE),
  
  -- Construction Team - Construction operations
  ('construction_team', 'Construction Team', 
   'Construction progress logging, milestone tracking for assigned properties', 
   TRUE, TRUE),
  
  -- Marketing Team - Marketing & lead generation
  ('marketing_team', 'Marketing Team', 
   'Marketing campaigns, lead management, and promotional activities', 
   TRUE, TRUE),
  
  -- Sales Team - Sales operations
  ('sales_team', 'Sales Team', 
   'Customer management, bookings, payments, and sales operations', 
   TRUE, TRUE),
  
  -- Staff - General operational access
  ('staff', 'Staff', 
   'Basic operational access for support staff', 
   TRUE, TRUE),
  
  -- Customer - Customer portal access
  ('customer', 'Customer', 
   'Customer portal for viewing bookings and payments', 
   TRUE, TRUE);

-- ============================================================================
-- 3. UPDATE USER ROLES MAPPING
-- ============================================================================

-- Map old roles to new roles (preserve existing assignments where logical)
-- Note: This is a one-time migration, manual review recommended

-- Map all super_admin users (keep as is)
-- (already handled above)

-- Map admin users (keep as is)
-- (already handled above)

-- Map HR-related roles
INSERT INTO user_roles (user_id, role_id, assigned_at)
SELECT DISTINCT ur.user_id, 
       (SELECT id FROM roles WHERE name = 'hr' LIMIT 1),
       CURRENT_TIMESTAMP
FROM user_roles ur
JOIN roles r ON ur.role_id = r.id
WHERE r.name IN ('hr_manager', 'hr_executive')
  AND ur.user_id NOT IN (
    SELECT user_id FROM user_roles 
    WHERE role_id = (SELECT id FROM roles WHERE name = 'hr' LIMIT 1)
  );

-- Map Sales-related roles
INSERT INTO user_roles (user_id, role_id, assigned_at)
SELECT DISTINCT ur.user_id, 
       (SELECT id FROM roles WHERE name = 'sales_team' LIMIT 1),
       CURRENT_TIMESTAMP
FROM user_roles ur
JOIN roles r ON ur.role_id = r.id
WHERE r.name IN ('gm_sales', 'sales_manager', 'sales_executive', 'sales_agent')
  AND ur.user_id NOT IN (
    SELECT user_id FROM user_roles 
    WHERE role_id = (SELECT id FROM roles WHERE name = 'sales_team' LIMIT 1)
  );

-- Map Marketing-related roles
INSERT INTO user_roles (user_id, role_id, assigned_at)
SELECT DISTINCT ur.user_id, 
       (SELECT id FROM roles WHERE name = 'marketing_team' LIMIT 1),
       CURRENT_TIMESTAMP
FROM user_roles ur
JOIN roles r ON ur.role_id = r.id
WHERE r.name IN ('gm_marketing', 'marketing_manager')
  AND ur.user_id NOT IN (
    SELECT user_id FROM user_roles 
    WHERE role_id = (SELECT id FROM roles WHERE name = 'marketing_team' LIMIT 1)
  );

-- Map Construction-related roles
INSERT INTO user_roles (user_id, role_id, assigned_at)
SELECT DISTINCT ur.user_id, 
       (SELECT id FROM roles WHERE name = 'construction_team' LIMIT 1),
       CURRENT_TIMESTAMP
FROM user_roles ur
JOIN roles r ON ur.role_id = r.id
WHERE r.name IN ('gm_construction', 'construction_manager', 'site_engineer')
  AND ur.user_id NOT IN (
    SELECT user_id FROM user_roles 
    WHERE role_id = (SELECT id FROM roles WHERE name = 'construction_team' LIMIT 1)
  );

-- Map remaining users to 'staff' role if they don't have a new role
INSERT INTO user_roles (user_id, role_id, assigned_at)
SELECT DISTINCT u.id,
       (SELECT id FROM roles WHERE name = 'staff' LIMIT 1),
       CURRENT_TIMESTAMP
FROM users u
WHERE u.is_active = TRUE
  AND u.id NOT IN (
    SELECT ur.user_id 
    FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE r.name IN ('super_admin', 'admin', 'hr', 'construction_team', 
                      'marketing_team', 'sales_team', 'customer')
  );

-- ============================================================================
-- 4. CREATE PERMISSIONS FOR NEW ROLES
-- ============================================================================

-- Clear old permission assignments for inactive roles
DELETE FROM role_permissions 
WHERE role_id IN (SELECT id FROM roles WHERE is_active = FALSE);

-- Super Admin - All permissions (will be handled in application code)
-- Admin - All permissions except system configuration
-- HR - Employee, user, and role management
-- Construction Team - Construction module access
-- Marketing Team - Marketing and inventory view access
-- Sales Team - Sales, customer, booking, payment access
-- Staff - Read-only access to basic modules
-- Customer - Customer portal only

-- Note: Detailed permissions will be set up in application code
-- This migration focuses on role simplification

-- ============================================================================
-- 5. ADD AUDIT COLUMNS TO user_property_access
-- ============================================================================

-- Add additional audit columns if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'user_property_access' 
                 AND column_name = 'notes') THEN
    ALTER TABLE user_property_access ADD COLUMN notes TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'user_property_access' 
                 AND column_name = 'assigned_reason') THEN
    ALTER TABLE user_property_access ADD COLUMN assigned_reason VARCHAR(500);
  END IF;
END $$;

-- ============================================================================
-- 6. CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

-- Index on role names for quick lookups
CREATE INDEX IF NOT EXISTS idx_roles_name_active ON roles(name) WHERE is_active = TRUE;

-- Index on user_roles for role-based queries
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles(role_id);

-- ============================================================================
-- 7. VERIFICATION QUERIES
-- ============================================================================

-- Show active roles
-- SELECT name, display_name, description FROM roles WHERE is_active = TRUE ORDER BY name;

-- Show user role distribution
-- SELECT r.display_name, COUNT(ur.user_id) as user_count
-- FROM roles r
-- LEFT JOIN user_roles ur ON r.id = ur.role_id
-- WHERE r.is_active = TRUE
-- GROUP BY r.id, r.display_name
-- ORDER BY user_count DESC;

-- Show users with multiple roles
-- SELECT u.email, u.first_name, u.last_name, 
--        STRING_AGG(r.display_name, ', ') as roles
-- FROM users u
-- JOIN user_roles ur ON u.id = ur.user_id
-- JOIN roles r ON ur.role_id = r.id
-- WHERE r.is_active = TRUE
-- GROUP BY u.id, u.email, u.first_name, u.last_name
-- HAVING COUNT(ur.role_id) > 1;

COMMENT ON TABLE roles IS 'Simplified 8-role system for Eastern Estate ERP';
COMMENT ON COLUMN roles.name IS 'Role identifier: super_admin, admin, hr, construction_team, marketing_team, sales_team, staff, customer';
