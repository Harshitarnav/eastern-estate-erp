-- Align construction_flat_progress with TypeORM ConstructionFlatProgress (phase-based model).
-- Legacy rows often have stage, progress_percentage, progress_date, remarks, issues only.
-- Fixes: MilestoneDetectionService cron "column ... phase does not exist".

ALTER TABLE construction_flat_progress ADD COLUMN IF NOT EXISTS phase VARCHAR(30);
-- No DEFAULT on add: existing rows must stay NULL until backfill from progress_percentage
ALTER TABLE construction_flat_progress ADD COLUMN IF NOT EXISTS phase_progress NUMERIC(5, 2);
ALTER TABLE construction_flat_progress ADD COLUMN IF NOT EXISTS overall_progress NUMERIC(5, 2);
ALTER TABLE construction_flat_progress ADD COLUMN IF NOT EXISTS start_date DATE;
ALTER TABLE construction_flat_progress ADD COLUMN IF NOT EXISTS expected_end_date DATE;
ALTER TABLE construction_flat_progress ADD COLUMN IF NOT EXISTS actual_end_date DATE;
ALTER TABLE construction_flat_progress ADD COLUMN IF NOT EXISTS notes TEXT;

-- phase from legacy stage (enum names only; else FOUNDATION)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'construction_flat_progress' AND column_name = 'stage'
  ) THEN
    EXECUTE $u$
      UPDATE construction_flat_progress
      SET phase = CASE
        WHEN UPPER(TRIM(stage)) IN ('FOUNDATION', 'STRUCTURE', 'MEP', 'FINISHING', 'HANDOVER')
          THEN UPPER(TRIM(stage))
        ELSE 'FOUNDATION'
      END
      WHERE phase IS NULL OR TRIM(COALESCE(phase, '')) = ''
    $u$;
  END IF;
END $$;

UPDATE construction_flat_progress
SET phase = 'FOUNDATION'
WHERE phase IS NULL OR TRIM(COALESCE(phase, '')) = '';

-- Progress columns from legacy progress_percentage
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'construction_flat_progress' AND column_name = 'progress_percentage'
  ) THEN
    EXECUTE $u$
      UPDATE construction_flat_progress
      SET
        phase_progress = COALESCE(phase_progress, progress_percentage, 0),
        overall_progress = COALESCE(overall_progress, progress_percentage, 0)
      WHERE phase_progress IS NULL OR overall_progress IS NULL
    $u$;
  END IF;
END $$;

UPDATE construction_flat_progress SET phase_progress = 0 WHERE phase_progress IS NULL;
UPDATE construction_flat_progress SET overall_progress = 0 WHERE overall_progress IS NULL;

-- start_date from legacy progress_date
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'construction_flat_progress' AND column_name = 'progress_date'
  ) THEN
    EXECUTE $u$
      UPDATE construction_flat_progress
      SET start_date = progress_date::date
      WHERE start_date IS NULL AND progress_date IS NOT NULL
    $u$;
  END IF;
END $$;

-- notes from remarks / issues
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'construction_flat_progress' AND column_name = 'remarks'
  ) THEN
    EXECUTE $u$
      UPDATE construction_flat_progress
      SET notes = COALESCE(notes, remarks)
      WHERE notes IS NULL AND remarks IS NOT NULL
    $u$;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'construction_flat_progress' AND column_name = 'issues'
  ) THEN
    EXECUTE $u$
      UPDATE construction_flat_progress
      SET notes = COALESCE(notes, issues)
      WHERE notes IS NULL AND issues IS NOT NULL
    $u$;
  END IF;
END $$;

ALTER TABLE construction_flat_progress ALTER COLUMN phase SET DEFAULT 'FOUNDATION';
ALTER TABLE construction_flat_progress ALTER COLUMN phase SET NOT NULL;
ALTER TABLE construction_flat_progress ALTER COLUMN phase_progress SET DEFAULT 0;
ALTER TABLE construction_flat_progress ALTER COLUMN phase_progress SET NOT NULL;
ALTER TABLE construction_flat_progress ALTER COLUMN overall_progress SET DEFAULT 0;
ALTER TABLE construction_flat_progress ALTER COLUMN overall_progress SET NOT NULL;
