-- v019: Payment category split — Primary / Miscellaneous / Tax
--
-- Adds per-category amount columns to payments and demand_drafts so every
-- rupee collected or demanded can be classified into one of three buckets:
--   primary  = construction / base cost
--   misc     = parking, lift, amenities, maintenance deposit, PLC, etc.
--   tax      = GST, stamp duty, registration charges
--
-- Also adds PRIMARY_PAID and PARTIALLY_PAID statuses to demand_drafts so
-- the collections queue can distinguish tax-deferred closures from genuine
-- partial payments without triggering escalation on expected deferrals.

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. payments — category allocation columns
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS primary_amount   DECIMAL(15,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS misc_amount      DECIMAL(15,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tax_amount       DECIMAL(15,2) NOT NULL DEFAULT 0;

-- Backfill: existing payments are treated as 100% primary (safest default;
-- team can re-apportion known tax/misc payments afterwards).
UPDATE payments
SET primary_amount = amount,
    misc_amount    = 0,
    tax_amount     = 0
WHERE primary_amount = 0 AND misc_amount = 0 AND tax_amount = 0;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. demand_drafts — category demand columns + deferred-tax tracking
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE demand_drafts
  ADD COLUMN IF NOT EXISTS primary_amount    DECIMAL(15,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS misc_amount       DECIMAL(15,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tax_amount        DECIMAL(15,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS arrears_primary   DECIMAL(15,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS arrears_misc      DECIMAL(15,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS arrears_tax       DECIMAL(15,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tax_deferred_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tax_deferred_at   TIMESTAMP    NULL;

-- Backfill: existing DDs — treat full amount as primary.
UPDATE demand_drafts
SET primary_amount = amount,
    misc_amount    = 0,
    tax_amount     = 0
WHERE primary_amount = 0 AND misc_amount = 0 AND tax_amount = 0;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. demand_drafts.status / tone — convert any ENUM column to VARCHAR
--    The entity declares these as varchar. Some DBs created them as Postgres
--    enums, which then reject new values (PRIMARY_PAID, PARTIALLY_PAID) with
--    "invalid input value for enum". Converting to varchar aligns DB ↔ entity
--    and removes the whole class of error. Enum type name is discovered
--    dynamically so this works no matter what it's called.
-- ─────────────────────────────────────────────────────────────────────────────
DO $$
DECLARE
  col record;
BEGIN
  FOR col IN
    SELECT a.attname AS column_name
    FROM pg_attribute a
    JOIN pg_class c ON c.oid = a.attrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    JOIN pg_type t ON t.oid = a.atttypid
    WHERE c.relname = 'demand_drafts'
      AND a.attname IN ('status', 'tone')
      AND t.typtype = 'e'
      AND n.nspname = current_schema()
  LOOP
    EXECUTE format('ALTER TABLE demand_drafts ALTER COLUMN %I DROP DEFAULT', col.column_name);
    EXECUTE format('ALTER TABLE demand_drafts ALTER COLUMN %I TYPE VARCHAR(40) USING %I::text', col.column_name, col.column_name);
  END LOOP;

  BEGIN ALTER TABLE demand_drafts ALTER COLUMN status SET DEFAULT 'DRAFT'; EXCEPTION WHEN undefined_column THEN NULL; END;
  BEGIN ALTER TABLE demand_drafts ALTER COLUMN tone SET DEFAULT 'ON_TIME'; EXCEPTION WHEN undefined_column THEN NULL; END;
END
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. Indexes to support fast arrear queries
-- ─────────────────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_demand_drafts_booking_status
  ON demand_drafts (booking_id, status)
  WHERE booking_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_payments_booking_id
  ON payments (booking_id)
  WHERE booking_id IS NOT NULL;

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. payment_type: add REGISTRY for registry-time tax collection
-- ─────────────────────────────────────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumlabel = 'REGISTRY'
      AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'payment_type')
  ) THEN
    ALTER TYPE payment_type ADD VALUE 'REGISTRY';
  END IF;
EXCEPTION WHEN others THEN
  -- payment_type may be a varchar column, not an enum; silently skip.
  NULL;
END
$$;
