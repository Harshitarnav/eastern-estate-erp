-- v008: Add missing columns to construction_projects table
-- Safe to run multiple times (idempotent)

ALTER TABLE construction_projects
  ADD COLUMN IF NOT EXISTS actual_end_date DATE NULL;

-- Also ensure budget_spent column exists (may be missing in some envs)
ALTER TABLE construction_projects
  ADD COLUMN IF NOT EXISTS budget_spent DECIMAL(15,2) NOT NULL DEFAULT 0;
