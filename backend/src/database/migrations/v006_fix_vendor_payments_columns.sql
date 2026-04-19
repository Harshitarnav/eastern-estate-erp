-- ============================================================
-- v006: Fix vendor_payments table - missing columns in prod
-- IDEMPOTENT - safe to run multiple times.
-- ============================================================

-- 1. Add purchase_order_id if missing
ALTER TABLE vendor_payments ADD COLUMN IF NOT EXISTS purchase_order_id UUID;

-- 2. Make created_by nullable (service may not always have user context)
ALTER TABLE vendor_payments ALTER COLUMN created_by DROP NOT NULL;

-- 3. Add journal_entry_id if missing
ALTER TABLE vendor_payments ADD COLUMN IF NOT EXISTS journal_entry_id UUID;

-- 4. Create index on purchase_order_id if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_vendor_payments_po ON vendor_payments(purchase_order_id);

\echo '[v006] vendor_payments columns fixed'

-- Verify
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'vendor_payments'
ORDER BY ordinal_position;
