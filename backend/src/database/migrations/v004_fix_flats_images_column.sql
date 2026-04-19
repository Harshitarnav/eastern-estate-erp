-- ============================================================
-- v004: Fix flats.images JSONB → TEXT (simple-array format)
-- Run on production after v003.
-- IDEMPOTENT - safe to run multiple times.
--
-- On the server:
--   docker exec -i $(docker ps -q --filter name=postgres) \
--     psql -U eastern_estate -d eastern_estate_erp \
--     < backend/src/database/migrations/v004_fix_flats_images_column.sql
-- ============================================================

DO $$
DECLARE
  col_type TEXT;
BEGIN
  SELECT data_type INTO col_type
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name   = 'flats'
    AND column_name  = 'images';

  IF col_type IS NULL THEN
    ALTER TABLE flats ADD COLUMN images text;
    RAISE NOTICE '[v004] flats.images: did not exist → added as TEXT';

  ELSIF col_type = 'text' THEN
    RAISE NOTICE '[v004] flats.images: already TEXT, skipping';

  ELSIF col_type = 'jsonb' THEN
    -- Cannot use subquery in USING clause, so use temp column approach
    ALTER TABLE flats ADD COLUMN images_text text;

    -- Convert each JSONB array to comma-delimited string
    UPDATE flats
       SET images_text = (
         WITH arr AS (
           SELECT string_agg(elem, ',') AS joined
           FROM jsonb_array_elements_text(images) AS elem
         )
         SELECT joined FROM arr
       )
     WHERE images IS NOT NULL
       AND jsonb_typeof(images) = 'array';

    ALTER TABLE flats DROP COLUMN images;
    ALTER TABLE flats RENAME COLUMN images_text TO images;
    RAISE NOTICE '[v004] flats.images: migrated JSONB → TEXT (simple-array)';

  ELSE
    RAISE WARNING '[v004] flats.images: unexpected type "%" - manual review needed', col_type;
  END IF;
END $$;

-- Verify
SELECT column_name, data_type, udt_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name   = 'flats'
  AND column_name  = 'images';

-- Expected:
--  column_name | data_type | udt_name
-- -------------+-----------+----------
--  images      | text      | text
