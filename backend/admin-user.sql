
-- Create superadmin user
INSERT INTO users (id, email, username, password, first_name, last_name, is_active, email_verified, created_at, updated_at)
VALUES (gen_random_uuid(), 'superadmin@easternestates.com', 'superadmin', '$2b$10$CHruEmWgawVwIHie3yu7muklLUj/8UjJMrOfIoyEu1eWwwdpVzkB6', 'Super', 'Admin', true, true, NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- Get the user ID (you'll need to run this separately to get the ID)
-- SELECT id FROM users WHERE email = 'superadmin@easternestates.com';

-- After getting the user ID, assign the super_admin role
-- Replace <user_id> with the actual UUID
-- INSERT INTO user_roles (user_id, role_id) 
-- SELECT '<user_id>', id FROM roles WHERE name = 'super_admin';

