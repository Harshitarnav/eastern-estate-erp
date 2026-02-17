-- 003_property_level_access_control.sql
-- Property-Level Multi-Tenancy & Access Control

-- ============================================
-- 1. USER PROPERTY ACCESS TABLE
-- ============================================

CREATE TABLE user_property_access (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  assigned_by UUID REFERENCES users(id),
  assigned_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- User can have same property with different roles
  CONSTRAINT unique_user_property_role UNIQUE(user_id, property_id, role)
);

-- Indexes for performance
CREATE INDEX idx_user_property_access_user ON user_property_access(user_id);
CREATE INDEX idx_user_property_access_property ON user_property_access(property_id);
CREATE INDEX idx_user_property_access_role ON user_property_access(role);
CREATE INDEX idx_user_property_access_active ON user_property_access(is_active) WHERE is_active = TRUE;

-- ============================================
-- 2. UPDATE USERS TABLE FOR EMAIL DOMAIN
-- ============================================

-- Add email domain fields
ALTER TABLE users
ADD COLUMN email_domain VARCHAR(100),
ADD COLUMN allowed_domain VARCHAR(100) DEFAULT 'eecd.in',
ADD COLUMN is_domain_verified BOOLEAN DEFAULT FALSE;

-- Populate email_domain for existing users
UPDATE users 
SET email_domain = SUBSTRING(email FROM '@(.*)$')
WHERE email IS NOT NULL;

-- Update is_domain_verified for @eecd.in users
UPDATE users 
SET is_domain_verified = TRUE
WHERE email_domain = 'eecd.in';

CREATE INDEX idx_users_email_domain ON users(email_domain);

-- ============================================
-- 3. PROPERTY ROLE TEMPLATES (Auto-Assignment)
-- ============================================

CREATE TABLE property_role_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL,
  email_pattern VARCHAR(255),
  auto_assign BOOLEAN DEFAULT FALSE,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT unique_property_role_template UNIQUE(property_id, role, email_pattern)
);

CREATE INDEX idx_property_role_templates_property ON property_role_templates(property_id);
CREATE INDEX idx_property_role_templates_auto ON property_role_templates(auto_assign) WHERE auto_assign = TRUE;

-- ============================================
-- 4. INSERT PROPERTY-SPECIFIC ROLES
-- ============================================

INSERT INTO roles (name, display_name, description, is_system, is_active)
VALUES
  ('GM_SALES', 'GM Sales', 'General Manager - Sales for specific property', TRUE, TRUE),
  ('GM_MARKETING', 'GM Marketing', 'General Manager - Marketing for specific property', TRUE, TRUE),
  ('GM_CONSTRUCTION', 'GM Construction', 'General Manager - Construction for specific property', TRUE, TRUE),
  ('PROPERTY_ADMIN', 'Property Admin', 'Full access to specific property', TRUE, TRUE),
  ('PROPERTY_VIEWER', 'Property Viewer', 'Read-only access to specific property', TRUE, TRUE)
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- 5. GRANT SUPER_ADMIN ACCESS TO ALL PROPERTIES
-- ============================================

-- Give all existing SUPER_ADMIN users access to all properties
INSERT INTO user_property_access (user_id, property_id, role, assigned_by)
SELECT 
  u.id AS user_id,
  p.id AS property_id,
  'PROPERTY_ADMIN' AS role,
  u.id AS assigned_by
FROM users u
CROSS JOIN properties p
INNER JOIN user_roles ur ON u.id = ur.user_id
INNER JOIN roles r ON ur.role_id = r.id
WHERE r.name IN ('SUPER_ADMIN', 'ADMIN')
  AND u.email LIKE '%@eecd.in'
ON CONFLICT (user_id, property_id, role) DO NOTHING;

-- ============================================
-- 6. ADD COMMENTS FOR CLARITY
-- ============================================

COMMENT ON TABLE user_property_access IS 'Maps users to specific properties with role-based access control';
COMMENT ON COLUMN user_property_access.role IS 'Property-level role: GM_SALES, GM_MARKETING, GM_CONSTRUCTION, PROPERTY_ADMIN, etc.';
COMMENT ON COLUMN user_property_access.is_active IS 'Whether this access is currently active (soft delete)';

COMMENT ON TABLE property_role_templates IS 'Templates for auto-assigning property access to new users based on email patterns';
COMMENT ON COLUMN property_role_templates.email_pattern IS 'Email pattern to match (e.g., sales.diamond@eecd.in)';
COMMENT ON COLUMN property_role_templates.auto_assign IS 'Whether to automatically assign this role when pattern matches';

COMMENT ON COLUMN users.email_domain IS 'Domain part of email address (e.g., eecd.in)';
COMMENT ON COLUMN users.allowed_domain IS 'Allowed email domain for this user';
COMMENT ON COLUMN users.is_domain_verified IS 'Whether the email domain has been verified';

-- ============================================
-- 7. CREATE HELPER FUNCTION
-- ============================================

-- Function to check if user has access to property
CREATE OR REPLACE FUNCTION user_has_property_access(
  p_user_id UUID,
  p_property_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM user_property_access
    WHERE user_id = p_user_id
      AND property_id = p_property_id
      AND is_active = TRUE
  );
END;
$$ LANGUAGE plpgsql;

-- Function to get user's accessible property IDs
CREATE OR REPLACE FUNCTION get_user_property_ids(p_user_id UUID)
RETURNS UUID[] AS $$
BEGIN
  RETURN ARRAY(
    SELECT property_id
    FROM user_property_access
    WHERE user_id = p_user_id
      AND is_active = TRUE
  );
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- View user property access summary
CREATE OR REPLACE VIEW v_user_property_access_summary AS
SELECT 
  u.id AS user_id,
  u.email,
  u.first_name || ' ' || u.last_name AS full_name,
  u.email_domain,
  u.is_domain_verified,
  COUNT(upa.id) AS properties_count,
  ARRAY_AGG(DISTINCT upa.role) FILTER (WHERE upa.role IS NOT NULL) AS roles,
  ARRAY_AGG(DISTINCT p.name) FILTER (WHERE p.name IS NOT NULL) AS properties
FROM users u
LEFT JOIN user_property_access upa ON u.id = upa.user_id AND upa.is_active = TRUE
LEFT JOIN properties p ON upa.property_id = p.id
GROUP BY u.id, u.email, u.first_name, u.last_name, u.email_domain, u.is_domain_verified;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✅ Property-Level Access Control migration completed successfully!';
  RAISE NOTICE '📊 Summary:';
  RAISE NOTICE '   - user_property_access table created';
  RAISE NOTICE '   - Email domain fields added to users';
  RAISE NOTICE '   - Property role templates table created';
  RAISE NOTICE '   - Property-specific roles inserted';
  RAISE NOTICE '   - Super admins granted access to all properties';
  RAISE NOTICE '   - Helper functions and views created';
END $$;
