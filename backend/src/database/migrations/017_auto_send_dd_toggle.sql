-- 017_auto_send_dd_toggle.sql
--
-- Paper-trail migration for the three-layer "auto-send milestone demand
-- drafts" toggle. Mirrors the DDL already emitted idempotently by the
-- runtime SchemaSyncService, so fresh envs and manual DBAs stay in sync.
--
-- Precedence at send time is:
--    customers.auto_send_milestone_demand_drafts       (nullable override)
--    > properties.auto_send_milestone_demand_drafts    (nullable override)
--    > company_settings.auto_send_milestone_demand_drafts (non-null default)
--
-- When the effective value resolves to TRUE, newly-generated milestone
-- DDs skip the DRAFT → READY → SENT hand-shake: they are written as SENT
-- directly and the notification pipeline (email, SMS if enabled, in-app)
-- fires immediately. When FALSE (the safe default), every DD lands in
-- the Collections Workstation for a human to review and press Send Now.

BEGIN;

-- Company-wide default (NOT NULL, defaults off so behaviour is unchanged
-- for existing environments until someone explicitly flips it).
ALTER TABLE company_settings
  ADD COLUMN IF NOT EXISTS auto_send_milestone_demand_drafts
  BOOLEAN NOT NULL DEFAULT FALSE;

-- Per-project override (nullable: NULL means "inherit from company").
ALTER TABLE properties
  ADD COLUMN IF NOT EXISTS auto_send_milestone_demand_drafts
  BOOLEAN NULL;

-- Per-customer override (nullable: NULL means "inherit from property /
-- company"). Takes precedence over every other layer.
ALTER TABLE customers
  ADD COLUMN IF NOT EXISTS auto_send_milestone_demand_drafts
  BOOLEAN NULL;

COMMIT;
