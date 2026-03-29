-- ============================================================
-- v005: Fix vendors.name column — legacy NOT NULL column
-- The entity uses vendor_name; the old schema left a separate
-- "name" column with NOT NULL which blocks inserts.
-- Fix: copy vendor_name → name for existing rows, then drop NOT NULL.
-- IDEMPOTENT — safe to run multiple times.
-- ============================================================

DO $$
BEGIN
  -- Only act if the column exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'vendors'
      AND column_name  = 'name'
  ) THEN
    -- Backfill: copy vendor_name into name for any rows where name is null
    UPDATE vendors SET name = vendor_name WHERE name IS NULL;

    -- Remove the NOT NULL constraint
    ALTER TABLE vendors ALTER COLUMN name DROP NOT NULL;

    RAISE NOTICE '[v005] vendors.name: backfilled from vendor_name and dropped NOT NULL';
  ELSE
    RAISE NOTICE '[v005] vendors.name: column does not exist, skipping';
  END IF;
END $$;

-- Verify
SELECT column_name, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name   = 'vendors'
  AND column_name  IN ('name', 'vendor_name')
ORDER BY column_name;
