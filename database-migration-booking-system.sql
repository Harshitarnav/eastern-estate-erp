-- ============================================
-- EVENT-DRIVEN BOOKING SYSTEM - DATABASE MIGRATION
-- Eastern Estate ERP
-- Version: 1.0.0
-- Date: January 2025
-- ============================================

-- This migration adds support for:
-- 1. Payment schedules
-- 2. Payment plan tracking
-- 3. Tower ID in bookings
-- 4. Customer last booking date

BEGIN;

-- ============================================
-- 1. ADD COLUMNS TO EXISTING TABLES
-- ============================================

-- Add payment_plan and tower_id to bookings table
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS payment_plan VARCHAR(50),
ADD COLUMN IF NOT EXISTS tower_id UUID;

COMMENT ON COLUMN bookings.payment_plan IS 'Payment plan type: CONSTRUCTION_LINKED, TIME_LINKED, or DOWN_PAYMENT';
COMMENT ON COLUMN bookings.tower_id IS 'Reference to the tower where the flat is located';

-- Add last_booking_date to customers table
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS last_booking_date DATE;

COMMENT ON COLUMN customers.last_booking_date IS 'Date of customer''s most recent booking';

-- ============================================
-- 2. CREATE PAYMENT_SCHEDULES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS payment_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Booking Reference
    booking_id UUID NOT NULL,
    
    -- Schedule Details
    schedule_number VARCHAR(50) NOT NULL,
    installment_number INT NOT NULL,
    total_installments INT NOT NULL,
    due_date DATE NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    description TEXT,
    milestone VARCHAR(100),
    
    -- Payment Status
    status VARCHAR(20) DEFAULT 'PENDING',
    paid_amount DECIMAL(15, 2) DEFAULT 0,
    paid_date DATE,
    payment_id UUID,
    
    -- Overdue Tracking
    is_overdue BOOLEAN DEFAULT false,
    overdue_days INT DEFAULT 0,
    penalty_amount DECIMAL(15, 2) DEFAULT 0,
    
    -- Waiver
    is_waived BOOLEAN DEFAULT false,
    waiver_reason TEXT,
    waived_date DATE,
    waived_by UUID,
    
    -- Notes
    notes TEXT,
    
    -- System Fields
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID,
    
    -- Constraints
    CONSTRAINT fk_payment_schedules_booking 
        FOREIGN KEY (booking_id) 
        REFERENCES bookings(id) 
        ON DELETE CASCADE,
        
    CONSTRAINT chk_installment_number 
        CHECK (installment_number > 0),
        
    CONSTRAINT chk_total_installments 
        CHECK (total_installments > 0),
        
    CONSTRAINT chk_amount_positive 
        CHECK (amount >= 0),
        
    CONSTRAINT chk_paid_amount_positive 
        CHECK (paid_amount >= 0),
        
    CONSTRAINT chk_overdue_days 
        CHECK (overdue_days >= 0)
);

-- Add table comments
COMMENT ON TABLE payment_schedules IS 'Payment installment schedules for bookings';
COMMENT ON COLUMN payment_schedules.booking_id IS 'Reference to the booking this schedule belongs to';
COMMENT ON COLUMN payment_schedules.schedule_number IS 'Unique schedule reference number (e.g., BK-2025-001-001)';
COMMENT ON COLUMN payment_schedules.installment_number IS 'Sequential installment number (1, 2, 3, ...)';
COMMENT ON COLUMN payment_schedules.milestone IS 'Construction milestone for milestone-based plans';
COMMENT ON COLUMN payment_schedules.status IS 'Payment status: PENDING, PAID, OVERDUE, WAIVED, PARTIAL';

-- ============================================
-- 3. CREATE INDEXES
-- ============================================

-- Indexes for payment_schedules
CREATE INDEX IF NOT EXISTS idx_payment_schedules_booking 
    ON payment_schedules(booking_id);

CREATE INDEX IF NOT EXISTS idx_payment_schedules_due_date 
    ON payment_schedules(due_date);

CREATE INDEX IF NOT EXISTS idx_payment_schedules_status 
    ON payment_schedules(status);

CREATE INDEX IF NOT EXISTS idx_payment_schedules_payment 
    ON payment_schedules(payment_id) 
    WHERE payment_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_payment_schedules_overdue 
    ON payment_schedules(is_overdue, due_date) 
    WHERE is_overdue = true;

-- Index for customers last_booking_date
CREATE INDEX IF NOT EXISTS idx_customers_last_booking_date 
    ON customers(last_booking_date);

-- ============================================
-- 4. CREATE VIEWS FOR REPORTING
-- ============================================

-- View: Overdue payment schedules
CREATE OR REPLACE VIEW v_overdue_schedules AS
SELECT 
    ps.id,
    ps.schedule_number,
    ps.booking_id,
    b.booking_number,
    ps.due_date,
    ps.amount,
    ps.paid_amount,
    ps.amount - ps.paid_amount AS balance_amount,
    ps.overdue_days,
    ps.penalty_amount,
    c.first_name || ' ' || c.last_name AS customer_name,
    c.email AS customer_email,
    c.phone AS customer_phone,
    p.name AS property_name
FROM payment_schedules ps
INNER JOIN bookings b ON ps.booking_id = b.id
INNER JOIN customers c ON b.customer_id = c.id
INNER JOIN properties p ON b.property_id = p.id
WHERE ps.status = 'OVERDUE'
  AND ps.is_active = true
ORDER BY ps.due_date ASC;

COMMENT ON VIEW v_overdue_schedules IS 'View of all overdue payment schedules with customer and property details';

-- View: Upcoming payment schedules (next 30 days)
CREATE OR REPLACE VIEW v_upcoming_schedules AS
SELECT 
    ps.id,
    ps.schedule_number,
    ps.booking_id,
    b.booking_number,
    ps.due_date,
    ps.amount,
    ps.description,
    ps.milestone,
    c.first_name || ' ' || c.last_name AS customer_name,
    c.email AS customer_email,
    c.phone AS customer_phone,
    p.name AS property_name,
    f.flat_number
FROM payment_schedules ps
INNER JOIN bookings b ON ps.booking_id = b.id
INNER JOIN customers c ON b.customer_id = c.id
INNER JOIN properties p ON b.property_id = p.id
INNER JOIN flats f ON b.flat_id = f.id
WHERE ps.status = 'PENDING'
  AND ps.due_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
  AND ps.is_active = true
ORDER BY ps.due_date ASC;

COMMENT ON VIEW v_upcoming_schedules IS 'View of payment schedules due in the next 30 days';

-- ============================================
-- 5. CREATE TRIGGER FOR AUTO-UPDATE
-- ============================================

-- Function to update payment_schedules.updated_at
CREATE OR REPLACE FUNCTION update_payment_schedules_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for payment_schedules
DROP TRIGGER IF EXISTS trg_payment_schedules_updated_at ON payment_schedules;
CREATE TRIGGER trg_payment_schedules_updated_at
    BEFORE UPDATE ON payment_schedules
    FOR EACH ROW
    EXECUTE FUNCTION update_payment_schedules_timestamp();

-- ============================================
-- 6. GRANT PERMISSIONS
-- ============================================

-- Grant permissions to application user (update with your actual user)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON payment_schedules TO eastern_estate_app;
-- GRANT SELECT ON v_overdue_schedules TO eastern_estate_app;
-- GRANT SELECT ON v_upcoming_schedules TO eastern_estate_app;

-- ============================================
-- 7. VERIFY MIGRATION
-- ============================================

DO $$
DECLARE
    v_count INTEGER;
BEGIN
    -- Check if payment_schedules table was created
    SELECT COUNT(*) INTO v_count
    FROM information_schema.tables
    WHERE table_name = 'payment_schedules';
    
    IF v_count = 1 THEN
        RAISE NOTICE 'SUCCESS: payment_schedules table created';
    ELSE
        RAISE EXCEPTION 'FAILED: payment_schedules table not created';
    END IF;
    
    -- Check if bookings.payment_plan column was added
    SELECT COUNT(*) INTO v_count
    FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'payment_plan';
    
    IF v_count = 1 THEN
        RAISE NOTICE 'SUCCESS: bookings.payment_plan column added';
    ELSE
        RAISE EXCEPTION 'FAILED: bookings.payment_plan column not added';
    END IF;
    
    -- Check if customers.last_booking_date column was added
    SELECT COUNT(*) INTO v_count
    FROM information_schema.columns
    WHERE table_name = 'customers' AND column_name = 'last_booking_date';
    
    IF v_count = 1 THEN
        RAISE NOTICE 'SUCCESS: customers.last_booking_date column added';
    ELSE
        RAISE EXCEPTION 'FAILED: customers.last_booking_date column not added';
    END IF;
END $$;

COMMIT;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================

SELECT 
    'Migration completed successfully!' AS status,
    CURRENT_TIMESTAMP AS completed_at;

-- ============================================
-- ROLLBACK SCRIPT (if needed)
-- ============================================

-- Uncomment the following to rollback this migration:

/*
BEGIN;

DROP VIEW IF EXISTS v_upcoming_schedules;
DROP VIEW IF EXISTS v_overdue_schedules;
DROP TRIGGER IF EXISTS trg_payment_schedules_updated_at ON payment_schedules;
DROP FUNCTION IF EXISTS update_payment_schedules_timestamp();
DROP TABLE IF EXISTS payment_schedules;
ALTER TABLE bookings DROP COLUMN IF EXISTS payment_plan;
ALTER TABLE bookings DROP COLUMN IF EXISTS tower_id;
ALTER TABLE customers DROP COLUMN IF EXISTS last_booking_date;

COMMIT;
*/



