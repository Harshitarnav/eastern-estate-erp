-- Paper-trail migration for collector queues + DD assignment.
-- Applied idempotently by DemandDraftsSchemaSyncService on boot; this
-- file exists for DBAs / manual inspection.

ALTER TABLE demand_drafts
  ADD COLUMN IF NOT EXISTS collector_user_id UUID NULL,
  ADD COLUMN IF NOT EXISTS assigned_at       TIMESTAMP NULL,
  ADD COLUMN IF NOT EXISTS assigned_by       UUID NULL;

CREATE INDEX IF NOT EXISTS idx_demand_drafts_collector_user
  ON demand_drafts(collector_user_id);

DO $$
BEGIN
  IF EXISTS (
       SELECT 1 FROM information_schema.tables WHERE table_name = 'users'
     )
     AND NOT EXISTS (
       SELECT 1 FROM information_schema.table_constraints
       WHERE constraint_name = 'fk_demand_drafts_collector_user'
     )
  THEN
    ALTER TABLE demand_drafts
      ADD CONSTRAINT fk_demand_drafts_collector_user
      FOREIGN KEY (collector_user_id) REFERENCES users(id) ON DELETE SET NULL;
  END IF;
END $$;
