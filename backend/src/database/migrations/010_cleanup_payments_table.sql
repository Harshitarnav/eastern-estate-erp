-- Migration 010: Clean up payments table orphan camelCase columns
-- Keeps useful audit data by renaming to snake_case, drops true duplicates

-- Step 1: Drop FK constraints on orphan camelCase columns
ALTER TABLE payments DROP CONSTRAINT IF EXISTS "FK_payments_booking";
ALTER TABLE payments DROP CONSTRAINT IF EXISTS "FK_payments_creator";
ALTER TABLE payments DROP CONSTRAINT IF EXISTS "FK_payments_customer";
ALTER TABLE payments DROP CONSTRAINT IF EXISTS "FK_payments_employee";
ALTER TABLE payments DROP CONSTRAINT IF EXISTS "FK_payments_verifier";

-- Step 2: Rename useful audit columns from camelCase to snake_case
-- (only if snake_case version doesn't already exist)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payments' AND column_name='verifiedby')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payments' AND column_name='verified_by') THEN
    ALTER TABLE payments RENAME COLUMN "verifiedBy" TO verified_by;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payments' AND column_name='verifiedat')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payments' AND column_name='verified_at') THEN
    ALTER TABLE payments RENAME COLUMN "verifiedAt" TO verified_at;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payments' AND column_name='createdby')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payments' AND column_name='created_by') THEN
    ALTER TABLE payments RENAME COLUMN "createdBy" TO created_by;
  END IF;
END $$;

-- Step 3: Drop pure duplicate columns (snake_case versions already exist)
ALTER TABLE payments DROP COLUMN IF EXISTS "bookingId";
ALTER TABLE payments DROP COLUMN IF EXISTS "customerId";

-- Step 4: Drop orphan columns not needed in the entity
ALTER TABLE payments DROP COLUMN IF EXISTS "employeeId";
ALTER TABLE payments DROP COLUMN IF EXISTS "vendorId";

-- Step 5: Add proper FK constraints on the new snake_case audit columns (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_payments_verified_by' AND conrelid = 'public.payments'::regclass
  ) THEN
    ALTER TABLE payments
      ADD CONSTRAINT fk_payments_verified_by
      FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_payments_created_by' AND conrelid = 'public.payments'::regclass
  ) THEN
    ALTER TABLE payments
      ADD CONSTRAINT fk_payments_created_by
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Step 6: Ensure payment_status has proper values (fix 'RECEIVED' → 'COMPLETED')
UPDATE payments SET payment_status = 'COMPLETED' WHERE payment_status = 'RECEIVED';

-- Verify
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'payments' 
ORDER BY ordinal_position;
