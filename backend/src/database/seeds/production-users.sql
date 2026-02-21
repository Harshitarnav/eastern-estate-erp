-- ============================================
-- PRODUCTION INITIAL USERS SEED SCRIPT
-- ============================================
-- Creates initial admin users for production environment
-- Run this after deploying to production server
-- 
-- Usage: psql -d eastern_estate_erp -f backend/src/database/seeds/production-users.sql
--
-- Default passwords follow pattern: {username}@easternestate
-- IMPORTANT: Change passwords after first login!
-- ============================================

-- Enable required extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Ensure roles table has the correct active roles
DO $$
BEGIN
  -- Verify roles exist
  IF NOT EXISTS (SELECT 1 FROM roles WHERE name = 'super_admin' AND is_active = true) THEN
    RAISE EXCEPTION 'Role super_admin not found or inactive. Run migrations first!';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM roles WHERE name = 'admin' AND is_active = true) THEN
    RAISE EXCEPTION 'Role admin not found or inactive. Run migrations first!';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM roles WHERE name = 'hr' AND is_active = true) THEN
    RAISE EXCEPTION 'Role hr not found or inactive. Run migrations first!';
  END IF;
END $$;

-- ============================================
-- CREATE INITIAL ADMIN USERS
-- ============================================

-- 1. Super Admin: info@eecd.in
INSERT INTO users (
  id,
  username,
  email,
  password_hash,
  first_name,
  last_name,
  is_active,
  is_verified,
  created_at,
  updated_at
)
SELECT
  uuid_generate_v4(),
  'info',
  'info@eecd.in',
  crypt('info@easternestate', gen_salt('bf')),
  'Super',
  'Admin',
  true,
  true,
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'info@eecd.in'
);

-- Assign Super Admin role to info@eecd.in
INSERT INTO user_roles (user_id, role_id)
SELECT 
  u.id,
  r.id
FROM users u
CROSS JOIN roles r
WHERE u.email = 'info@eecd.in'
  AND r.name = 'super_admin'
  AND NOT EXISTS (
    SELECT 1 
    FROM user_roles ur 
    WHERE ur.user_id = u.id 
      AND ur.role_id = r.id
  );

-- 2. Admin: arnav@eecd.in
INSERT INTO users (
  id,
  username,
  email,
  password_hash,
  first_name,
  last_name,
  is_active,
  is_verified,
  created_at,
  updated_at
)
SELECT
  uuid_generate_v4(),
  'arnav',
  'arnav@eecd.in',
  crypt('arnav@easternestate', gen_salt('bf')),
  'Arnav',
  'Agarwal',
  true,
  true,
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'arnav@eecd.in'
);

-- Assign Admin role to arnav@eecd.in
INSERT INTO user_roles (user_id, role_id)
SELECT 
  u.id,
  r.id
FROM users u
CROSS JOIN roles r
WHERE u.email = 'arnav@eecd.in'
  AND r.name = 'admin'
  AND NOT EXISTS (
    SELECT 1 
    FROM user_roles ur 
    WHERE ur.user_id = u.id 
      AND ur.role_id = r.id
  );

-- 3. HR: hr@eecd.in
INSERT INTO users (
  id,
  username,
  email,
  password_hash,
  first_name,
  last_name,
  is_active,
  is_verified,
  created_at,
  updated_at
)
SELECT
  uuid_generate_v4(),
  'hr',
  'hr@eecd.in',
  crypt('hr@easternestate', gen_salt('bf')),
  'HR',
  'Manager',
  true,
  true,
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'hr@eecd.in'
);

-- Assign HR role to hr@eecd.in
INSERT INTO user_roles (user_id, role_id)
SELECT 
  u.id,
  r.id
FROM users u
CROSS JOIN roles r
WHERE u.email = 'hr@eecd.in'
  AND r.name = 'hr'
  AND NOT EXISTS (
    SELECT 1 
    FROM user_roles ur 
    WHERE ur.user_id = u.id 
      AND ur.role_id = r.id
  );

-- ============================================
-- GRANT SUPER ADMIN AND ADMIN ACCESS TO ALL PROPERTIES
-- ============================================

-- Grant Super Admin (info@eecd.in) access to all properties
INSERT INTO user_property_access (
  user_id,
  property_id,
  role,
  is_active,
  assigned_by,
  assigned_at
)
SELECT 
  u.id,
  p.id,
  'SUPER_ADMIN',
  true,
  u.id,  -- Self-assigned
  NOW()
FROM users u
CROSS JOIN properties p
WHERE u.email = 'info@eecd.in'
  AND NOT EXISTS (
    SELECT 1 
    FROM user_property_access upa 
    WHERE upa.user_id = u.id 
      AND upa.property_id = p.id
  );

-- Grant Admin (arnav@eecd.in) access to all properties
INSERT INTO user_property_access (
  user_id,
  property_id,
  role,
  is_active,
  assigned_by,
  assigned_at
)
SELECT 
  u.id,
  p.id,
  'ADMIN',
  true,
  (SELECT id FROM users WHERE email = 'info@eecd.in'),  -- Assigned by super admin
  NOW()
FROM users u
CROSS JOIN properties p
WHERE u.email = 'arnav@eecd.in'
  AND NOT EXISTS (
    SELECT 1 
    FROM user_property_access upa 
    WHERE upa.user_id = u.id 
      AND upa.property_id = p.id
  );

-- Grant HR (hr@eecd.in) access to all properties with READ_WRITE role
INSERT INTO user_property_access (
  user_id,
  property_id,
  role,
  is_active,
  assigned_by,
  assigned_at
)
SELECT 
  u.id,
  p.id,
  'READ_WRITE',
  true,
  (SELECT id FROM users WHERE email = 'info@eecd.in'),  -- Assigned by super admin
  NOW()
FROM users u
CROSS JOIN properties p
WHERE u.email = 'hr@eecd.in'
  AND NOT EXISTS (
    SELECT 1 
    FROM user_property_access upa 
    WHERE upa.user_id = u.id 
      AND upa.property_id = p.id
  );

-- ============================================
-- VERIFICATION AND SUMMARY
-- ============================================

-- Display created users
SELECT 
  u.username,
  u.email,
  STRING_AGG(r.display_name, ', ') as roles,
  u.is_active,
  u.is_verified,
  u.created_at
FROM users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN roles r ON ur.role_id = r.id
WHERE u.email IN ('info@eecd.in', 'arnav@eecd.in', 'hr@eecd.in')
GROUP BY u.id, u.username, u.email, u.is_active, u.is_verified, u.created_at
ORDER BY u.email;

-- Display property access counts
SELECT 
  u.email,
  COUNT(upa.property_id) as property_count,
  STRING_AGG(DISTINCT upa.role::text, ', ') as property_roles
FROM users u
LEFT JOIN user_property_access upa ON u.id = upa.user_id
WHERE u.email IN ('info@eecd.in', 'arnav@eecd.in', 'hr@eecd.in')
  AND upa.is_active = true
GROUP BY u.email
ORDER BY u.email;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅ Production users created successfully!';
  RAISE NOTICE '';
  RAISE NOTICE '📧 Login Credentials (DEFAULT - CHANGE AFTER FIRST LOGIN):';
  RAISE NOTICE '1. info@eecd.in     | info@easternestate     | Super Admin';
  RAISE NOTICE '2. arnav@eecd.in    | arnav@easternestate    | Admin';
  RAISE NOTICE '3. hr@eecd.in       | hr@easternestate       | HR';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  IMPORTANT: Change all passwords immediately after first login!';
  RAISE NOTICE '';
END $$;
