-- Migration: Add profile_picture column to employees table
-- Description: Adds a text column to store the URL of the employee's profile picture
-- Date: 2026-02-14

-- Add profile_picture column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'employees' 
        AND column_name = 'profile_picture'
    ) THEN
        ALTER TABLE employees ADD COLUMN profile_picture TEXT NULL;
        RAISE NOTICE 'Column profile_picture added to employees table';
    ELSE
        RAISE NOTICE 'Column profile_picture already exists in employees table';
    END IF;
END $$;

-- Add comment to document the column
COMMENT ON COLUMN employees.profile_picture IS 'URL of the employee profile picture for ID card generation';
