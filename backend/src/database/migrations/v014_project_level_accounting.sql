-- v014: Project-level accounting - add property_id to accounting tables
-- Each project gets its own CoA, bank accounts, and journal entries.
-- NULL property_id = company-wide (shared) record.
-- Safe to re-run (all statements are idempotent).

-- ─── 1. accounts ──────────────────────────────────────────────────────────────

ALTER TABLE accounts
  ADD COLUMN IF NOT EXISTS property_id UUID NULL REFERENCES properties(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_accounts_property_id ON accounts(property_id);

-- Drop old global unique constraint on account_code (allows same codes per project)
DO $$
BEGIN
  -- Drop TypeORM-generated unique constraint variants
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'UQ_accounts_account_code') THEN
    ALTER TABLE accounts DROP CONSTRAINT "UQ_accounts_account_code";
  END IF;
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'accounts_account_code_key') THEN
    ALTER TABLE accounts DROP CONSTRAINT "accounts_account_code_key";
  END IF;
END $$;

-- Drop old unique index if it exists as an index (not constraint)
DROP INDEX IF EXISTS "UQ_accounts_account_code";

-- New composite unique: same code is OK across projects but not within the same project scope
-- COALESCE(property_id::text, '') treats NULL as company-wide scope
CREATE UNIQUE INDEX IF NOT EXISTS "UQ_accounts_code_per_scope"
  ON accounts(account_code, COALESCE(property_id::text, ''));

-- ─── 2. bank_accounts ─────────────────────────────────────────────────────────

ALTER TABLE bank_accounts
  ADD COLUMN IF NOT EXISTS property_id UUID NULL REFERENCES properties(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_bank_accounts_property_id ON bank_accounts(property_id);

-- ─── 3. journal_entries ───────────────────────────────────────────────────────

ALTER TABLE journal_entries
  ADD COLUMN IF NOT EXISTS property_id UUID NULL REFERENCES properties(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_journal_entries_property_id ON journal_entries(property_id);

-- ─── 4. budgets ───────────────────────────────────────────────────────────────

ALTER TABLE budgets
  ADD COLUMN IF NOT EXISTS property_id UUID NULL REFERENCES properties(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_budgets_property_id ON budgets(property_id);

-- ─── 5. vendor_payments: add property_id for project-tagged outgoing payments ──

ALTER TABLE vendor_payments
  ADD COLUMN IF NOT EXISTS property_id UUID NULL REFERENCES properties(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_vendor_payments_property_id ON vendor_payments(property_id);

-- ─── 6. salary_payments: add property_id ──────────────────────────────────────

ALTER TABLE salary_payments
  ADD COLUMN IF NOT EXISTS property_id UUID NULL REFERENCES properties(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_salary_payments_property_id ON salary_payments(property_id);
