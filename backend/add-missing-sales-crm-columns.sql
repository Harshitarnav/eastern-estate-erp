-- =============================================
-- Sales CRM Missing Columns Migration Script
-- =============================================
-- This script adds all missing columns that were defined in the
-- Sales CRM entity files but don't exist in the database.
-- Run this script to fix the 500 errors on the Sales Dashboard.
-- =============================================

-- Start transaction
BEGIN;

-- =============================================
-- LEADS TABLE - Add Missing Columns
-- =============================================

-- Add assigned_at column
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMP;

-- Add preferred_location column  
ALTER TABLE leads
ADD COLUMN IF NOT EXISTS preferred_location VARCHAR(100);

-- Add requirements column (stored as text array in jsonb for PostgreSQL compatibility)
ALTER TABLE leads
ADD COLUMN IF NOT EXISTS requirements TEXT[];

-- Add is_qualified column
ALTER TABLE leads
ADD COLUMN IF NOT EXISTS is_qualified BOOLEAN DEFAULT false;

-- Add is_first_time_buyer column
ALTER TABLE leads
ADD COLUMN IF NOT EXISTS is_first_time_buyer BOOLEAN DEFAULT false;

-- Add has_existing_property column
ALTER TABLE leads
ADD COLUMN IF NOT EXISTS has_existing_property BOOLEAN DEFAULT false;

-- Add needs_home_loan column
ALTER TABLE leads
ADD COLUMN IF NOT EXISTS needs_home_loan BOOLEAN DEFAULT false;

-- Add has_approved_loan column
ALTER TABLE leads
ADD COLUMN IF NOT EXISTS has_approved_loan BOOLEAN DEFAULT false;

-- Add current_occupation column
ALTER TABLE leads
ADD COLUMN IF NOT EXISTS current_occupation VARCHAR(100);

-- Add annual_income column
ALTER TABLE leads
ADD COLUMN IF NOT EXISTS annual_income DECIMAL(15,2);

-- Add campaign_name column
ALTER TABLE leads
ADD COLUMN IF NOT EXISTS campaign_name VARCHAR(200);

-- Add utm_source column
ALTER TABLE leads
ADD COLUMN IF NOT EXISTS utm_source VARCHAR(100);

-- Add utm_medium column
ALTER TABLE leads
ADD COLUMN IF NOT EXISTS utm_medium VARCHAR(100);

-- Add utm_campaign column
ALTER TABLE leads
ADD COLUMN IF NOT EXISTS utm_campaign VARCHAR(200);

-- Add tags column
ALTER TABLE leads
ADD COLUMN IF NOT EXISTS tags TEXT[];

-- Add referred_by column
ALTER TABLE leads
ADD COLUMN IF NOT EXISTS referred_by VARCHAR(100);

-- Add referral_name column
ALTER TABLE leads
ADD COLUMN IF NOT EXISTS referral_name VARCHAR(200);

-- Add referral_phone column
ALTER TABLE leads
ADD COLUMN IF NOT EXISTS referral_phone VARCHAR(20);

-- Add has_site_visit column
ALTER TABLE leads
ADD COLUMN IF NOT EXISTS has_site_visit BOOLEAN DEFAULT false;

-- Add site_visit_feedback column
ALTER TABLE leads
ADD COLUMN IF NOT EXISTS site_visit_feedback TEXT;

-- Add total_site_visits column
ALTER TABLE leads
ADD COLUMN IF NOT EXISTS total_site_visits INTEGER DEFAULT 0;

-- Add total_calls column
ALTER TABLE leads
ADD COLUMN IF NOT EXISTS total_calls INTEGER DEFAULT 0;

-- Add total_emails column
ALTER TABLE leads
ADD COLUMN IF NOT EXISTS total_emails INTEGER DEFAULT 0;

-- Add total_meetings column
ALTER TABLE leads
ADD COLUMN IF NOT EXISTS total_meetings INTEGER DEFAULT 0;

-- Add last_call_date column
ALTER TABLE leads
ADD COLUMN IF NOT EXISTS last_call_date TIMESTAMP;

-- Add last_email_date column
ALTER TABLE leads
ADD COLUMN IF NOT EXISTS last_email_date TIMESTAMP;

-- Add last_meeting_date column
ALTER TABLE leads
ADD COLUMN IF NOT EXISTS last_meeting_date TIMESTAMP;

-- Add converted_at column
ALTER TABLE leads
ADD COLUMN IF NOT EXISTS converted_at TIMESTAMP;

-- Add lost_reason column
ALTER TABLE leads
ADD COLUMN IF NOT EXISTS lost_reason TEXT;

-- Add lost_at column
ALTER TABLE leads
ADD COLUMN IF NOT EXISTS lost_at TIMESTAMP;

-- Add created_by column
ALTER TABLE leads
ADD COLUMN IF NOT EXISTS created_by UUID;

-- Add updated_by column
ALTER TABLE leads
ADD COLUMN IF NOT EXISTS updated_by UUID;

-- =============================================
-- BOOKINGS TABLE - Add Missing Columns
-- =============================================

-- Add token_paid_date column
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS token_paid_date DATE;

-- Add token_receipt_number column
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS token_receipt_number VARCHAR(100);

-- Add token_payment_mode column
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS token_payment_mode VARCHAR(100);

-- Add agreement_number column (if not exists)
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS agreement_number VARCHAR(100);

-- Add agreement_signed_date column
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS agreement_signed_date DATE;

-- Add agreement_document_url column
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS agreement_document_url TEXT;

-- Add expected_possession_date column
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS expected_possession_date DATE;

-- Add actual_possession_date column
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS actual_possession_date DATE;

-- Add registration_date column
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS registration_date DATE;

-- Add discount_amount column
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(15,2);

-- Add discount_reason column
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS discount_reason TEXT;

-- Add stamp_duty column
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS stamp_duty DECIMAL(15,2);

-- Add registration_charges column
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS registration_charges DECIMAL(15,2);

-- Add gst_amount column
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS gst_amount DECIMAL(15,2);

-- Add maintenance_deposit column
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS maintenance_deposit DECIMAL(15,2);

-- Add parking_charges column
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS parking_charges DECIMAL(15,2);

-- Add other_charges column
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS other_charges DECIMAL(15,2);

-- Add loan_application_number column
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS loan_application_number VARCHAR(100);

-- Add loan_approval_date column
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS loan_approval_date DATE;

-- Add loan_disbursement_date column
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS loan_disbursement_date DATE;

-- Add nominee1_name column
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS nominee1_name VARCHAR(200);

-- Add nominee1_relation column
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS nominee1_relation VARCHAR(100);

-- Add nominee2_name column
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS nominee2_name VARCHAR(200);

-- Add nominee2_relation column
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS nominee2_relation VARCHAR(100);

-- Add co_applicant_name column
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS co_applicant_name VARCHAR(200);

-- Add co_applicant_email column
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS co_applicant_email VARCHAR(200);

-- Add co_applicant_phone column
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS co_applicant_phone VARCHAR(20);

-- Add co_applicant_relation column
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS co_applicant_relation VARCHAR(100);

-- Add cancellation_date column
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS cancellation_date DATE;

-- Add cancellation_reason column
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;

-- Add refund_amount column
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS refund_amount DECIMAL(15,2);

-- Add refund_date column
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS refund_date DATE;

-- Add documents column (JSONB for storing multiple documents)
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS documents JSONB;

-- Add tower_id column
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS tower_id UUID;

-- Add special_terms column
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS special_terms TEXT;

-- Add tags column
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS tags TEXT[];

-- Add created_by column
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS created_by UUID;

-- Add updated_by column
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS updated_by UUID;

-- =============================================
-- Add Foreign Key Constraints
-- =============================================

-- Add foreign key for tower_id in bookings
ALTER TABLE bookings
ADD CONSTRAINT fk_booking_tower
FOREIGN KEY (tower_id) REFERENCES towers(id) ON DELETE SET NULL;

-- Add foreign key for created_by in leads
ALTER TABLE leads
ADD CONSTRAINT fk_lead_created_by
FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;

-- Add foreign key for updated_by in leads
ALTER TABLE leads
ADD CONSTRAINT fk_lead_updated_by
FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL;

-- Add foreign key for created_by in bookings
ALTER TABLE bookings
ADD CONSTRAINT fk_booking_created_by
FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;

-- Add foreign key for updated_by in bookings
ALTER TABLE bookings
ADD CONSTRAINT fk_booking_updated_by
FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL;

-- =============================================
-- Create Indexes for Performance
-- =============================================

-- Index on assigned_at for sorting
CREATE INDEX IF NOT EXISTS idx_leads_assigned_at ON leads(assigned_at);

-- Index on converted_at for filtering
CREATE INDEX IF NOT EXISTS idx_leads_converted_at ON leads(converted_at);

-- Index on tower_id for filtering
CREATE INDEX IF NOT EXISTS idx_bookings_tower_id ON bookings(tower_id);

-- Index on token_payment_mode for reporting
CREATE INDEX IF NOT EXISTS idx_bookings_token_payment_mode ON bookings(token_payment_mode);

-- Index on created_by for audit trail
CREATE INDEX IF NOT EXISTS idx_leads_created_by ON leads(created_by);
CREATE INDEX IF NOT EXISTS idx_bookings_created_by ON bookings(created_by);

-- =============================================
-- Commit transaction
-- =============================================

COMMIT;

-- =============================================
-- Verification Query
-- =============================================

-- Run this to verify all columns were added successfully
-- \d leads
-- \d bookings

