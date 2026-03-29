-- ============================================================
-- v007: Full vendor_payments column fix
-- Production table was created from old schema with different
-- column names. This adds all columns the entity expects.
-- IDEMPOTENT — safe to run multiple times.
-- ============================================================

-- Columns the entity uses that the old schema didn't have
ALTER TABLE vendor_payments ADD COLUMN IF NOT EXISTS payment_mode VARCHAR(20);
ALTER TABLE vendor_payments ADD COLUMN IF NOT EXISTS transaction_reference VARCHAR(100);
ALTER TABLE vendor_payments ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE vendor_payments ADD COLUMN IF NOT EXISTS purchase_order_id UUID;
ALTER TABLE vendor_payments ADD COLUMN IF NOT EXISTS journal_entry_id UUID;

-- Make created_by nullable (entity service may not always have user context)
ALTER TABLE vendor_payments ALTER COLUMN created_by DROP NOT NULL;

-- Backfill payment_mode from the old payment_method column where possible
UPDATE vendor_payments
SET payment_mode = CASE
  WHEN payment_method ILIKE '%cash%' THEN 'CASH'
  WHEN payment_method ILIKE '%cheque%' OR payment_method ILIKE '%check%' THEN 'CHEQUE'
  WHEN payment_method ILIKE '%neft%' THEN 'NEFT'
  WHEN payment_method ILIKE '%rtgs%' THEN 'RTGS'
  WHEN payment_method ILIKE '%upi%' THEN 'UPI'
  ELSE 'NEFT'
END
WHERE payment_mode IS NULL
  AND EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vendor_payments' AND column_name = 'payment_method'
  );

-- Backfill transaction_reference from reference_number
UPDATE vendor_payments
SET transaction_reference = reference_number
WHERE transaction_reference IS NULL AND reference_number IS NOT NULL;

-- Backfill notes from remarks
UPDATE vendor_payments
SET notes = remarks
WHERE notes IS NULL AND remarks IS NOT NULL;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_vendor_payments_po ON vendor_payments(purchase_order_id);
CREATE INDEX IF NOT EXISTS idx_vendor_payments_je ON vendor_payments(journal_entry_id);

\echo '[v007] vendor_payments: all entity columns ensured'

-- Verify
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'vendor_payments'
ORDER BY ordinal_position;
