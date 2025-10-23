-- Add new lead sources to the enum
-- This script updates the lead source enum to include 99ACRES and MAGICBRICKS

-- First, check current enum values
-- SELECT enum_range(NULL::lead_source_enum);

-- Add new enum values if they don't exist
DO $$
BEGIN
    -- Add 99ACRES if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = '99ACRES' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'leads_source_enum')
    ) THEN
        ALTER TYPE leads_source_enum ADD VALUE '99ACRES' BEFORE 'OTHER';
    END IF;

    -- Add MAGICBRICKS if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'MAGICBRICKS' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'leads_source_enum')
    ) THEN
        ALTER TYPE leads_source_enum ADD VALUE 'MAGICBRICKS' BEFORE 'OTHER';
    END IF;
END$$;

-- Verify the enum values
SELECT enum_range(NULL::leads_source_enum);
