-- Migration 013: Make entered_by and issued_to nullable in construction tables
-- Idempotent: only alters columns that exist (some prod DBs lack issued_to).

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'material_entries' AND column_name = 'entered_by'
  ) THEN
    ALTER TABLE material_entries ALTER COLUMN entered_by DROP NOT NULL;
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'material_exits' AND column_name = 'issued_to'
  ) THEN
    ALTER TABLE material_exits ALTER COLUMN issued_to DROP NOT NULL;
  END IF;
END $$;

-- Also fix any typo in column names if they exist as camelCase
-- (safe to run - will error silently if already correct)
DO $$
BEGIN
  -- Check if enteredBy column exists (camelCase) and rename to snake_case
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'material_entries' AND column_name = 'enteredBy'
  ) THEN
    ALTER TABLE material_entries RENAME COLUMN "enteredBy" TO entered_by;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'material_exits' AND column_name = 'issuedTo'
  ) THEN
    ALTER TABLE material_exits RENAME COLUMN "issuedTo" TO issued_to;
  END IF;
END $$;

SELECT 'Migration 013 complete: made entered_by and issued_to nullable' AS status;
