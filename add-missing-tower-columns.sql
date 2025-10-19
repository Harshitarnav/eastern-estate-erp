-- Add missing columns to towers table
-- Run this SQL script to add all required columns

-- Add total_floors if not exists
ALTER TABLE towers 
ADD COLUMN IF NOT EXISTS total_floors INTEGER NOT NULL DEFAULT 0;

-- Add total_units if not exists
ALTER TABLE towers 
ADD COLUMN IF NOT EXISTS total_units INTEGER NOT NULL DEFAULT 0;

-- Add basement_levels if not exists
ALTER TABLE towers 
ADD COLUMN IF NOT EXISTS basement_levels INTEGER NOT NULL DEFAULT 0;

-- Add units_per_floor if not exists
ALTER TABLE towers 
ADD COLUMN IF NOT EXISTS units_per_floor VARCHAR(200);

-- Add construction_status if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tower_construction_status') THEN
        CREATE TYPE tower_construction_status AS ENUM ('PLANNED', 'UNDER_CONSTRUCTION', 'COMPLETED', 'READY_TO_MOVE');
    END IF;
END $$;

ALTER TABLE towers 
ADD COLUMN IF NOT EXISTS construction_status tower_construction_status DEFAULT 'PLANNED';

-- Add construction_start_date if not exists
ALTER TABLE towers 
ADD COLUMN IF NOT EXISTS construction_start_date DATE;

-- Add completion_date if not exists
ALTER TABLE towers 
ADD COLUMN IF NOT EXISTS completion_date DATE;

-- Add rera_number if not exists
ALTER TABLE towers 
ADD COLUMN IF NOT EXISTS rera_number VARCHAR(100);

-- Add built_up_area if not exists
ALTER TABLE towers 
ADD COLUMN IF NOT EXISTS built_up_area DECIMAL(10, 2);

-- Add carpet_area if not exists
ALTER TABLE towers 
ADD COLUMN IF NOT EXISTS carpet_area DECIMAL(10, 2);

-- Add ceiling_height if not exists
ALTER TABLE towers 
ADD COLUMN IF NOT EXISTS ceiling_height DECIMAL(4, 2);

-- Add number_of_lifts if not exists
ALTER TABLE towers 
ADD COLUMN IF NOT EXISTS number_of_lifts INTEGER NOT NULL DEFAULT 1;

-- Add vastu_compliant if not exists
ALTER TABLE towers 
ADD COLUMN IF NOT EXISTS vastu_compliant BOOLEAN NOT NULL DEFAULT TRUE;

-- Add special_features if not exists
ALTER TABLE towers 
ADD COLUMN IF NOT EXISTS special_features TEXT;

-- Add is_active if not exists
ALTER TABLE towers 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;

-- Add display_order if not exists
ALTER TABLE towers 
ADD COLUMN IF NOT EXISTS display_order INTEGER NOT NULL DEFAULT 0;

-- Add floor_plans if not exists
ALTER TABLE towers 
ADD COLUMN IF NOT EXISTS floor_plans JSONB;

-- Display current table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'towers'
ORDER BY ordinal_position;
