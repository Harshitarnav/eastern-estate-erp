-- ============================================
-- GRANT HR USER PROPERTY ACCESS
-- ============================================
-- This script grants the existing HR user access to all properties
-- Run this on the production server if hr@eecd.in exists but has no property access
-- 
-- Usage: docker exec -i eastern-estate-postgres psql -U eastern_estate -d eastern_estate_erp < backend/src/database/seeds/grant-hr-property-access.sql
-- ============================================

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
  (SELECT id FROM users WHERE email = 'info@eecd.in' LIMIT 1),  -- Assigned by super admin
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

-- Display property access for HR user
SELECT 
  u.email,
  COUNT(upa.property_id) as property_count,
  STRING_AGG(DISTINCT upa.role::text, ', ') as property_roles
FROM users u
LEFT JOIN user_property_access upa ON u.id = upa.user_id
WHERE u.email = 'hr@eecd.in'
  AND (upa.is_active = true OR upa.is_active IS NULL)
GROUP BY u.email;

-- Success message
DO $$
DECLARE
  access_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO access_count
  FROM user_property_access upa
  JOIN users u ON upa.user_id = u.id
  WHERE u.email = 'hr@eecd.in'
    AND upa.is_active = true;
  
  RAISE NOTICE '';
  RAISE NOTICE '✅ HR user property access granted successfully!';
  RAISE NOTICE 'hr@eecd.in now has access to % properties', access_count;
  RAISE NOTICE '';
END $$;
