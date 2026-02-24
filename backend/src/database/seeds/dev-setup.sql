-- ============================================
-- LOCAL DEVELOPMENT SETUP SCRIPT
-- ============================================
-- Idempotent: safe to run multiple times.
-- Resets the super admin password so your partner
-- can always log in locally with known credentials.
--
-- Usage:
--   psql -d eastern_estate_erp -f backend/src/database/seeds/dev-setup.sql
--
-- Login after running:
--   Email:    info@eecd.in
--   Password: info@easternestate
-- ============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- ENSURE CORE ROLES EXIST
-- ============================================

INSERT INTO roles (id, name, display_name, description, is_system, is_active, created_at, updated_at)
VALUES
  (uuid_generate_v4(), 'super_admin', 'Super Admin', 'Full system access',   true, true, NOW(), NOW()),
  (uuid_generate_v4(), 'admin',       'Admin',       'Property management',  true, true, NOW(), NOW()),
  (uuid_generate_v4(), 'hr',          'HR',          'HR & user management', true, true, NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- UPSERT SUPER ADMIN USER (always resets password)
-- ============================================

INSERT INTO users (
  id, username, email, password_hash,
  first_name, last_name,
  is_active, is_verified,
  created_at, updated_at
)
VALUES (
  uuid_generate_v4(),
  'infoadmin',
  'info@eecd.in',
  crypt('info@easternestate', gen_salt('bf')),
  'Super', 'Admin',
  true, true,
  NOW(), NOW()
)
ON CONFLICT (email) DO UPDATE
  SET password_hash = crypt('info@easternestate', gen_salt('bf')),
      is_active     = true,
      is_verified   = true,
      updated_at    = NOW();

-- Also reset by username in case there are duplicates
UPDATE users
SET password_hash = crypt('info@easternestate', gen_salt('bf')),
    is_active     = true,
    is_verified   = true,
    updated_at    = NOW()
WHERE email = 'info@eecd.in';

-- ============================================
-- ASSIGN SUPER ADMIN ROLE
-- ============================================

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM   users u
JOIN   roles r ON r.name = 'super_admin'
WHERE  u.email = 'info@eecd.in'
ON CONFLICT DO NOTHING;

-- ============================================
-- GRANT ACCESS TO ALL PROPERTIES (if any exist)
-- ============================================

INSERT INTO user_property_access (user_id, property_id, role, is_active, assigned_by, assigned_at)
SELECT u.id, p.id, 'SUPER_ADMIN', true, u.id, NOW()
FROM   users u
CROSS  JOIN properties p
WHERE  u.email = 'info@eecd.in'
ON CONFLICT DO NOTHING;

-- ============================================
-- VERIFY
-- ============================================

SELECT
  u.email,
  u.username,
  u.is_active,
  u.is_verified,
  STRING_AGG(r.name, ', ') AS roles
FROM users u
LEFT JOIN user_roles ur ON ur.user_id = u.id
LEFT JOIN roles r        ON r.id = ur.role_id
WHERE u.email = 'info@eecd.in'
GROUP BY u.id, u.email, u.username, u.is_active, u.is_verified;

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅  Dev setup complete!';
  RAISE NOTICE '    Email:    info@eecd.in';
  RAISE NOTICE '    Password: info@easternestate';
  RAISE NOTICE '    Role:     super_admin';
  RAISE NOTICE '';
END $$;
