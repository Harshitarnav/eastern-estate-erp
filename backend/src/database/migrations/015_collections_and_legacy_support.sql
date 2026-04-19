-- ============================================================================
-- Migration 015: Collections workstation + legacy-import support
-- ============================================================================
-- Adds everything needed to wire construction progress -> demand drafts ->
-- automated reminders -> cancellation warnings, while safely handling
-- legacy/historical bookings that are being back-filled years after the fact.
--
-- This file is the PAPER TRAIL. The actual DDL runs idempotently on every
-- boot via the project's schema-sync services:
--   - backend/src/modules/demand-drafts/demand-drafts.schema-sync.service.ts
--   - backend/src/modules/payment-plans/payment-plans.schema-sync.service.ts
--   - backend/src/database/schema-sync.service.ts
-- Keeping this SQL here lets DBAs audit exactly what changed.
-- ============================================================================

-- ── demand_drafts: escalation / reminder cadence / import batch ────────────
ALTER TABLE demand_drafts ADD COLUMN IF NOT EXISTS tone VARCHAR(40) NOT NULL DEFAULT 'ON_TIME';
ALTER TABLE demand_drafts ADD COLUMN IF NOT EXISTS reminder_count INT NOT NULL DEFAULT 0;
ALTER TABLE demand_drafts ADD COLUMN IF NOT EXISTS last_reminder_at TIMESTAMP NULL;
ALTER TABLE demand_drafts ADD COLUMN IF NOT EXISTS next_reminder_due_at TIMESTAMP NULL;
ALTER TABLE demand_drafts ADD COLUMN IF NOT EXISTS escalation_level INT NOT NULL DEFAULT 0;
ALTER TABLE demand_drafts ADD COLUMN IF NOT EXISTS days_overdue INT NOT NULL DEFAULT 0;
ALTER TABLE demand_drafts ADD COLUMN IF NOT EXISTS cancellation_warning_issued_at TIMESTAMP NULL;
ALTER TABLE demand_drafts ADD COLUMN IF NOT EXISTS parent_demand_draft_id UUID NULL;
ALTER TABLE demand_drafts ADD COLUMN IF NOT EXISTS import_batch_id VARCHAR(64) NULL;

CREATE INDEX IF NOT EXISTS idx_demand_drafts_tone ON demand_drafts(tone);
CREATE INDEX IF NOT EXISTS idx_demand_drafts_next_reminder
  ON demand_drafts(next_reminder_due_at) WHERE next_reminder_due_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_demand_drafts_parent ON demand_drafts(parent_demand_draft_id);
CREATE INDEX IF NOT EXISTS idx_demand_drafts_import_batch ON demand_drafts(import_batch_id);

-- ── flat_payment_plans: legacy-import flags + per-plan reminder controls ───
ALTER TABLE flat_payment_plans ADD COLUMN IF NOT EXISTS is_legacy_import BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE flat_payment_plans ADD COLUMN IF NOT EXISTS imported_at TIMESTAMP NULL;
ALTER TABLE flat_payment_plans ADD COLUMN IF NOT EXISTS initial_escalation_level INT NOT NULL DEFAULT 0;
ALTER TABLE flat_payment_plans ADD COLUMN IF NOT EXISTS reminders_enabled BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE flat_payment_plans ADD COLUMN IF NOT EXISTS pause_reminders_until TIMESTAMP NULL;
ALTER TABLE flat_payment_plans ADD COLUMN IF NOT EXISTS import_batch_id VARCHAR(64) NULL;

CREATE INDEX IF NOT EXISTS idx_fpp_is_legacy_import ON flat_payment_plans(is_legacy_import);
CREATE INDEX IF NOT EXISTS idx_fpp_import_batch_id ON flat_payment_plans(import_batch_id);

-- ── demand_draft_templates: tone dimension for multiple tone variants ─────
ALTER TABLE demand_draft_templates ADD COLUMN IF NOT EXISTS tone VARCHAR(40) NOT NULL DEFAULT 'ON_TIME';
CREATE INDEX IF NOT EXISTS idx_ddt_tone ON demand_draft_templates(tone);

-- ── customers: account-wide reminder pause ────────────────────────────────
ALTER TABLE customers ADD COLUMN IF NOT EXISTS pause_reminders_until TIMESTAMP NULL;

-- ── company_settings: collections knobs (interval, thresholds, cap, SMS) ──
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS overdue_reminder_interval_days INT NOT NULL DEFAULT 7;
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS cancellation_warning_threshold_days INT NOT NULL DEFAULT 30;
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS legacy_auto_remind_max_age_days INT NOT NULL DEFAULT 180;
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS overdue_reminder_daily_cap INT NOT NULL DEFAULT 50;
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS enable_sms_reminders BOOLEAN NOT NULL DEFAULT FALSE;

-- ── bookings.status enum: add AT_RISK ─────────────────────────────────────
-- The booking-status enum was auto-named by TypeORM (usually bookings_status_enum).
-- The DO block looks up the actual enum type attached to bookings.status and
-- appends AT_RISK only if it is not already present. Safe to re-run.
DO $$
DECLARE
  enum_typname TEXT;
BEGIN
  SELECT t.typname INTO enum_typname
  FROM pg_type t
  JOIN pg_attribute a ON a.atttypid = t.oid
  JOIN pg_class c ON c.oid = a.attrelid
  WHERE c.relname = 'bookings' AND a.attname = 'status' AND t.typtype = 'e'
  LIMIT 1;

  IF enum_typname IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_enum e
      JOIN pg_type t ON t.oid = e.enumtypid
      WHERE t.typname = enum_typname AND e.enumlabel = 'AT_RISK'
    ) THEN
      EXECUTE format('ALTER TYPE %I ADD VALUE IF NOT EXISTS %L', enum_typname, 'AT_RISK');
    END IF;
  END IF;
END $$;
