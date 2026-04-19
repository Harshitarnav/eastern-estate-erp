-- 018_drop_payment_installments.sql
--
-- Deprecation: `payment_installments` was the legacy per-installment
-- tracking table that predates `payment_schedules`. All live code was
-- migrated to use `payment_schedules` (bound to FlatPaymentPlan
-- milestones) and no service or controller writes to
-- `payment_installments` any more. The entity, controller, service
-- and DTO have been deleted from the NestJS codebase in the same
-- commit that introduced this migration.
--
-- This migration is idempotent (IF EXISTS) so it's safe to re-run
-- against any environment. It intentionally drops the table even
-- if rows exist - if your environment needs to preserve historical
-- installment rows, run a one-off
--   CREATE TABLE payment_installments_archive AS
--     SELECT * FROM payment_installments;
-- BEFORE deploying this migration.

BEGIN;

DROP TABLE IF EXISTS payment_installments CASCADE;

COMMIT;
