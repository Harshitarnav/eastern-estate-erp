-- =====================================================
-- CONSTRUCTION MODULE SCHEMA MIGRATION
-- Aligns database schema with TypeScript entities
-- =====================================================

-- This migration updates the database schema to match the TypeScript entity definitions
-- Run this BEFORE loading test data

BEGIN;

-- =====================================================
-- 1. CONSTRUCTION PROJECTS TABLE
-- =====================================================

-- Rename columns to match entity
ALTER TABLE construction_projects 
  RENAME COLUMN estimated_end_date TO expected_completion_date;

ALTER TABLE construction_projects 
  RENAME COLUMN estimated_budget TO budget_allocated;

ALTER TABLE construction_projects 
  RENAME COLUMN actual_cost TO budget_spent;

-- Add new columns
ALTER TABLE construction_projects 
  ADD COLUMN IF NOT EXISTS overall_progress DECIMAL(5,2) DEFAULT 0;

-- Drop old project_manager column and add proper foreign key
ALTER TABLE construction_projects 
  DROP COLUMN IF EXISTS project_manager CASCADE;

ALTER TABLE construction_projects 
  ADD COLUMN IF NOT EXISTS project_manager_id UUID REFERENCES employees(id);

-- Make project_code optional (entity has it as optional)
ALTER TABLE construction_projects 
  ALTER COLUMN project_code DROP NOT NULL;

-- Update project_type to allow more flexibility
ALTER TABLE construction_projects 
  ALTER COLUMN project_type DROP NOT NULL;

-- Add created_by and updated_by if they don't exist
ALTER TABLE construction_projects 
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id);

ALTER TABLE construction_projects 
  ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES users(id);


-- =====================================================
-- 2. MATERIALS TABLE
-- =====================================================

-- Add min/max stock columns if they don't exist
ALTER TABLE materials 
  ADD COLUMN IF NOT EXISTS minimum_stock DECIMAL(12,2) DEFAULT 0;

ALTER TABLE materials 
  ADD COLUMN IF NOT EXISTS maximum_stock DECIMAL(12,2) DEFAULT 0;

-- Ensure all required columns exist
ALTER TABLE materials 
  ADD COLUMN IF NOT EXISTS material_code VARCHAR(50);

ALTER TABLE materials 
  ADD COLUMN IF NOT EXISTS material_name VARCHAR(255);

ALTER TABLE materials 
  ADD COLUMN IF NOT EXISTS category VARCHAR(100);

ALTER TABLE materials 
  ADD COLUMN IF NOT EXISTS unit_of_measurement VARCHAR(50);

ALTER TABLE materials 
  ADD COLUMN IF NOT EXISTS unit_price DECIMAL(12,2) DEFAULT 0;

ALTER TABLE materials 
  ADD COLUMN IF NOT EXISTS current_stock DECIMAL(12,2) DEFAULT 0;

ALTER TABLE materials 
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;


-- =====================================================
-- 3. VENDORS TABLE
-- =====================================================

-- Add address columns if they don't exist
ALTER TABLE vendors 
  ADD COLUMN IF NOT EXISTS address_line1 VARCHAR(255);

ALTER TABLE vendors 
  ADD COLUMN IF NOT EXISTS address_line2 VARCHAR(255);

ALTER TABLE vendors 
  ADD COLUMN IF NOT EXISTS city VARCHAR(100);

ALTER TABLE vendors 
  ADD COLUMN IF NOT EXISTS state VARCHAR(100);

ALTER TABLE vendors 
  ADD COLUMN IF NOT EXISTS pin_code VARCHAR(10);

-- Add other vendor fields
ALTER TABLE vendors 
  ADD COLUMN IF NOT EXISTS vendor_code VARCHAR(50);

ALTER TABLE vendors 
  ADD COLUMN IF NOT EXISTS vendor_name VARCHAR(255);

ALTER TABLE vendors 
  ADD COLUMN IF NOT EXISTS contact_person VARCHAR(255);

ALTER TABLE vendors 
  ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20);

ALTER TABLE vendors 
  ADD COLUMN IF NOT EXISTS email VARCHAR(255);

ALTER TABLE vendors 
  ADD COLUMN IF NOT EXISTS gst_number VARCHAR(15);

ALTER TABLE vendors 
  ADD COLUMN IF NOT EXISTS pan_number VARCHAR(10);

ALTER TABLE vendors 
  ADD COLUMN IF NOT EXISTS materials_supplied VARCHAR[];

ALTER TABLE vendors 
  ADD COLUMN IF NOT EXISTS credit_limit DECIMAL(15,2) DEFAULT 0;

ALTER TABLE vendors 
  ADD COLUMN IF NOT EXISTS payment_terms VARCHAR(255);

ALTER TABLE vendors 
  ADD COLUMN IF NOT EXISTS bank_name VARCHAR(255);

ALTER TABLE vendors 
  ADD COLUMN IF NOT EXISTS bank_account_number VARCHAR(50);

ALTER TABLE vendors 
  ADD COLUMN IF NOT EXISTS bank_ifsc VARCHAR(20);

ALTER TABLE vendors 
  ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) DEFAULT 0;

ALTER TABLE vendors 
  ADD COLUMN IF NOT EXISTS outstanding_amount DECIMAL(15,2) DEFAULT 0;

ALTER TABLE vendors 
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;


-- =====================================================
-- 4. PURCHASE ORDERS TABLE
-- =====================================================

-- Add PO fields if they don't exist
ALTER TABLE purchase_orders 
  ADD COLUMN IF NOT EXISTS po_number VARCHAR(50);

ALTER TABLE purchase_orders 
  ADD COLUMN IF NOT EXISTS vendor_id UUID REFERENCES vendors(id);

ALTER TABLE purchase_orders 
  ADD COLUMN IF NOT EXISTS order_date DATE;

ALTER TABLE purchase_orders 
  ADD COLUMN IF NOT EXISTS expected_delivery_date DATE;

ALTER TABLE purchase_orders 
  ADD COLUMN IF NOT EXISTS actual_delivery_date DATE;

ALTER TABLE purchase_orders 
  ADD COLUMN IF NOT EXISTS total_amount DECIMAL(15,2) DEFAULT 0;

ALTER TABLE purchase_orders 
  ADD COLUMN IF NOT EXISTS tax_amount DECIMAL(15,2) DEFAULT 0;

ALTER TABLE purchase_orders 
  ADD COLUMN IF NOT EXISTS discount DECIMAL(15,2) DEFAULT 0;

ALTER TABLE purchase_orders 
  ADD COLUMN IF NOT EXISTS grand_total DECIMAL(15,2) DEFAULT 0;

ALTER TABLE purchase_orders 
  ADD COLUMN IF NOT EXISTS payment_terms VARCHAR(255);

ALTER TABLE purchase_orders 
  ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'PENDING';

ALTER TABLE purchase_orders 
  ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'PENDING';

ALTER TABLE purchase_orders 
  ADD COLUMN IF NOT EXISTS remarks TEXT;


-- =====================================================
-- 5. MATERIAL ENTRIES TABLE
-- =====================================================

-- Add entry fields
ALTER TABLE material_entries 
  ADD COLUMN IF NOT EXISTS total_amount DECIMAL(15,2) DEFAULT 0;

ALTER TABLE material_entries 
  ADD COLUMN IF NOT EXISTS invoice_number VARCHAR(100);

ALTER TABLE material_entries 
  ADD COLUMN IF NOT EXISTS remarks TEXT;


-- =====================================================
-- 6. MATERIAL EXITS TABLE  
-- =====================================================

-- Add exit fields
ALTER TABLE material_exits 
  ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES construction_projects(id);

ALTER TABLE material_exits 
  ADD COLUMN IF NOT EXISTS issued_to VARCHAR(255);

ALTER TABLE material_exits 
  ADD COLUMN IF NOT EXISTS purpose VARCHAR(255);

ALTER TABLE material_exits 
  ADD COLUMN IF NOT EXISTS remarks TEXT;


-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check construction_projects columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'construction_projects'
ORDER BY ordinal_position;

-- Check materials columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'materials'
ORDER BY ordinal_position;

-- Check vendors columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'vendors'
ORDER BY ordinal_position;

-- Check purchase_orders columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'purchase_orders'
ORDER BY ordinal_position;

COMMIT;

-- Success message
SELECT 'Schema migration completed successfully!' as message;
SELECT 'You can now run construction-complete-test-data.sql' as next_step;
