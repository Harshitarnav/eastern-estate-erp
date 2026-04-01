-- ============================================================
-- v009 - Customer Portal
-- Adds customer_id link on users table so a customer record
-- can be linked to a login account.
-- ============================================================

-- 1. Add customer_id FK to users table
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES customers(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_users_customer_id ON users(customer_id);

-- 2. Insert the 'customer' role if it doesn't already exist
INSERT INTO roles (name, display_name, description, is_active, created_at, updated_at)
SELECT 'customer', 'Customer', 'External customer with access to their own bookings, payments and construction updates.', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'customer');
