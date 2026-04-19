-- ============================================================
-- v002: Fix flats array column types
-- Run ONCE on production BEFORE deploying the latest code.
-- Safe to run multiple times (fully idempotent).
-- ============================================================
--
-- What this fixes:
--   • flats.amenities must be text[] (PostgreSQL native array)
--     The TypeORM entity was changed from simple-array (TEXT) to
--     { type: 'text', array: true } (text[]). Without this migration
--     inserts will fail if the column is JSONB or TEXT on the server.
--
--   • flats.images must be TEXT (TypeORM simple-array format)
--     The original database-schema.sql had this as JSONB. If production
--     still has JSONB, inserting comma-delimited strings would fail.
-- ============================================================

-- ── 1. Fix flats.amenities → text[] ─────────────────────────────────────────

DO $$
DECLARE
  col_type TEXT;
BEGIN
  SELECT c.data_type
    INTO col_type
    FROM information_schema.columns AS c
   WHERE c.table_schema = 'public'
     AND c.table_name   = 'flats'
     AND c.column_name  = 'amenities';

  IF col_type IS NULL THEN
    -- Column missing entirely (pre-sync schema) - add it
    ALTER TABLE flats ADD COLUMN amenities text[];
    RAISE NOTICE '[v002] flats.amenities: did not exist → added as text[]';

  ELSIF col_type = 'ARRAY' THEN
    -- Already text[]; nothing to do
    RAISE NOTICE '[v002] flats.amenities: already text[], skipping';

  ELSIF col_type = 'jsonb' THEN
    -- Original schema had JSONB - convert JSON arrays to text[]
    ALTER TABLE flats ADD COLUMN amenities_new text[];
    UPDATE flats
       SET amenities_new = (
             SELECT array_agg(v)
               FROM jsonb_array_elements_text(amenities) v
           )
     WHERE amenities IS NOT NULL
       AND jsonb_typeof(amenities) = 'array';
    ALTER TABLE flats DROP COLUMN amenities;
    ALTER TABLE flats RENAME COLUMN amenities_new TO amenities;
    RAISE NOTICE '[v002] flats.amenities: migrated JSONB → text[]';

  ELSIF col_type = 'text' THEN
    -- TypeORM simple-array stored comma-delimited text - split into array
    ALTER TABLE flats
      ALTER COLUMN amenities TYPE text[]
      USING CASE
              WHEN amenities IS NULL OR trim(amenities) = '' THEN NULL
              ELSE string_to_array(amenities, ',')
            END;
    RAISE NOTICE '[v002] flats.amenities: migrated TEXT (simple-array) → text[]';

  ELSE
    RAISE WARNING '[v002] flats.amenities: unexpected type "%" - manual review needed', col_type;
  END IF;
END $$;


-- ── 2. Fix flats.images → TEXT (simple-array format) ────────────────────────

DO $$
DECLARE
  col_type TEXT;
BEGIN
  SELECT data_type
    INTO col_type
    FROM information_schema.columns
   WHERE table_schema = 'public'
     AND table_name   = 'flats'
     AND column_name  = 'images';

  IF col_type IS NULL THEN
    -- Column missing - add as TEXT (simple-array stores as comma-delimited text)
    ALTER TABLE flats ADD COLUMN images text;
    RAISE NOTICE '[v002] flats.images: did not exist → added as TEXT';

  ELSIF col_type = 'text' THEN
    RAISE NOTICE '[v002] flats.images: already TEXT, skipping';

  ELSIF col_type = 'jsonb' THEN
    -- Original schema had JSONB - flatten JSON array to comma-delimited text
    ALTER TABLE flats
      ALTER COLUMN images TYPE text
      USING CASE
              WHEN images IS NULL THEN NULL
              WHEN jsonb_typeof(images) = 'array' THEN (
                SELECT string_agg(v, ',')
                  FROM jsonb_array_elements_text(images) v
              )
              ELSE NULL
            END;
    RAISE NOTICE '[v002] flats.images: migrated JSONB → TEXT';

  ELSE
    RAISE WARNING '[v002] flats.images: unexpected type "%" - manual review needed', col_type;
  END IF;
END $$;


-- ── 3. Verify ────────────────────────────────────────────────────────────────

SELECT
  column_name,
  data_type,
  udt_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name   = 'flats'
  AND column_name  IN ('amenities', 'images')
ORDER BY column_name;

-- Expected output:
--  column_name | data_type | udt_name
-- -------------+-----------+----------
--  amenities   | ARRAY     | _text
--  images      | text      | text
