-- Fix Towers Table - Add missing tower_number column
-- Run this with: PGPASSWORD=your_secure_password_here psql -h localhost -U eastern_estate -d eastern_estate_erp -f fix-towers-table.sql

BEGIN;

-- Add the missing tower_number column (nullable first)
ALTER TABLE towers 
ADD COLUMN IF NOT EXISTS tower_number VARCHAR(50);

-- Update existing rows with sequential default values if any exist
WITH numbered_rows AS (
  SELECT id, 'T-' || ROW_NUMBER() OVER (ORDER BY id) as new_tower_number
  FROM towers
  WHERE tower_number IS NULL OR tower_number = ''
)
UPDATE towers
SET tower_number = numbered_rows.new_tower_number
FROM numbered_rows
WHERE towers.id = numbered_rows.id;

-- Make it NOT NULL after setting defaults (only if there are no NULL values)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM towers WHERE tower_number IS NULL) THEN
    ALTER TABLE towers ALTER COLUMN tower_number SET NOT NULL;
  END IF;
END $$;

-- Add index for tower_number
CREATE INDEX IF NOT EXISTS idx_towers_number ON towers(tower_number);

COMMIT;

SELECT 'Towers table fixed successfully! tower_number column added.' as message;
