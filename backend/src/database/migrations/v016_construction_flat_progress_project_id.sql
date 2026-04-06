-- TypeORM entity uses construction_project_id; legacy DBs often have project_id only.
-- Fixes: MilestoneDetectionService cron QueryFailedError on missing column.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'construction_flat_progress'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'construction_flat_progress'
      AND column_name = 'construction_project_id'
  ) THEN
    ALTER TABLE construction_flat_progress
      ADD COLUMN construction_project_id UUID REFERENCES construction_projects(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Backfill from legacy project_id only when that column exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'construction_flat_progress'
      AND column_name = 'project_id'
  ) THEN
    EXECUTE $u$
      UPDATE construction_flat_progress
      SET construction_project_id = project_id
      WHERE construction_project_id IS NULL AND project_id IS NOT NULL
    $u$;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_construction_flat_progress_construction_project_id
  ON construction_flat_progress(construction_project_id);

-- Enforce NOT NULL only when every row has a value (matches entity)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM construction_flat_progress WHERE construction_project_id IS NULL
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'construction_flat_progress'
      AND column_name = 'construction_project_id'
      AND is_nullable = 'YES'
  ) THEN
    ALTER TABLE construction_flat_progress
      ALTER COLUMN construction_project_id SET NOT NULL;
  END IF;
END $$;
