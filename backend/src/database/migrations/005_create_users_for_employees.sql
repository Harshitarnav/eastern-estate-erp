-- ============================================================================
-- Script to Create Users for Existing Employees with @eecd.in emails
-- Eastern Estate ERP - Backfill User Accounts
-- Run this after migration 004_simplify_roles_system.sql
-- ============================================================================

-- ============================================================================
-- 1. CREATE USERS FOR EMPLOYEES
-- ============================================================================

DO $$
DECLARE
  employee_record RECORD;
  username_val VARCHAR(100);
  password_val VARCHAR(255);
  staff_role_id UUID;
  new_user_id UUID;
  hashed_password VARCHAR(255);
BEGIN
  -- Get the staff role ID
  SELECT id INTO staff_role_id FROM roles WHERE name = 'staff' AND is_active = TRUE LIMIT 1;
  
  IF staff_role_id IS NULL THEN
    RAISE EXCEPTION 'Staff role not found. Please run migration 004_simplify_roles_system.sql first.';
  END IF;

  -- Loop through employees with @eecd.in emails who don't have user accounts
  FOR employee_record IN 
    SELECT e.id, e.email, e.full_name, e.phone_number
    FROM employees e
    WHERE e.email LIKE '%@eecd.in'
      AND e.is_active = TRUE
      AND (e.user_id IS NULL OR NOT EXISTS (
        SELECT 1 FROM users u WHERE u.email = e.email
      ))
  LOOP
    -- Extract username from email
    username_val := SPLIT_PART(employee_record.email, '@', 1);
    
    -- Create password: {username}@easternestate
    password_val := username_val || '@easternestate';
    
    -- Hash password (using bcrypt with 12 rounds)
    -- Note: This is a placeholder. In production, use proper bcrypt hashing
    -- The application will handle actual password hashing
    hashed_password := '$2b$12$' || encode(digest(password_val || 'salt', 'sha256'), 'hex');
    
    -- Check if user already exists
    SELECT id INTO new_user_id FROM users WHERE email = employee_record.email;
    
    IF new_user_id IS NULL THEN
      -- Create new user
      INSERT INTO users (
        email,
        username,
        password_hash,
        first_name,
        last_name,
        phone,
        is_active,
        is_verified,
        created_at,
        updated_at
      ) VALUES (
        employee_record.email,
        username_val,
        hashed_password, -- Will need to be reset by user
        SPLIT_PART(employee_record.full_name, ' ', 1),
        SUBSTRING(employee_record.full_name FROM POSITION(' ' IN employee_record.full_name) + 1),
        employee_record.phone_number,
        TRUE,
        FALSE,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
      )
      RETURNING id INTO new_user_id;
      
      -- Assign staff role to new user
      INSERT INTO user_roles (user_id, role_id, assigned_at)
      VALUES (new_user_id, staff_role_id, CURRENT_TIMESTAMP);
      
      -- Update employee with user_id
      UPDATE employees 
      SET user_id = new_user_id, updated_at = CURRENT_TIMESTAMP
      WHERE id = employee_record.id;
      
      RAISE NOTICE 'Created user for employee: % (ID: %)', employee_record.email, new_user_id;
    ELSE
      -- Link existing user to employee
      UPDATE employees 
      SET user_id = new_user_id, updated_at = CURRENT_TIMESTAMP
      WHERE id = employee_record.id;
      
      RAISE NOTICE 'Linked existing user to employee: %', employee_record.email;
    END IF;
  END LOOP;
  
  RAISE NOTICE 'User creation completed successfully';
END $$;

-- ============================================================================
-- 2. CREATE NOTIFICATIONS FOR ADMIN
-- ============================================================================

-- Create notification for admins about new user accounts
INSERT INTO notifications (
  target_roles,
  title,
  message,
  type,
  category,
  action_url,
  action_label,
  should_send_email,
  priority,
  created_at
)
SELECT 
  'admin,super_admin',
  'Employee User Accounts Created',
  'User accounts have been created for ' || COUNT(*) || ' employees. Please assign appropriate roles and property access.',
  'INFO',
  'EMPLOYEE',
  '/employees',
  'View Employees',
  TRUE,
  5,
  CURRENT_TIMESTAMP
FROM employees e
WHERE e.email LIKE '%@eecd.in'
  AND e.is_active = TRUE
  AND e.user_id IS NOT NULL
HAVING COUNT(*) > 0;

-- ============================================================================
-- 3. VERIFICATION QUERIES
-- ============================================================================

-- Show employees with newly created users
-- SELECT 
--   e.full_name,
--   e.email,
--   u.username,
--   u.is_active,
--   STRING_AGG(r.display_name, ', ') as roles
-- FROM employees e
-- JOIN users u ON e.user_id = u.id
-- LEFT JOIN user_roles ur ON u.id = ur.user_id
-- LEFT JOIN roles r ON ur.role_id = r.id
-- WHERE e.email LIKE '%@eecd.in'
-- GROUP BY e.id, e.full_name, e.email, u.username, u.is_active
-- ORDER BY e.full_name;

-- Count employees with and without user accounts
-- SELECT 
--   COUNT(*) FILTER (WHERE user_id IS NOT NULL) as with_user_account,
--   COUNT(*) FILTER (WHERE user_id IS NULL) as without_user_account,
--   COUNT(*) as total_employees
-- FROM employees
-- WHERE email LIKE '%@eecd.in' AND is_active = TRUE;

-- Migration completed successfully
-- This script backfills user accounts for existing employees with @eecd.in emails
