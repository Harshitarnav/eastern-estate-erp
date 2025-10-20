-- =====================================================
-- Sales & CRM Module Enhancement - Phase 1 Migration
-- =====================================================
-- This migration adds enhanced fields for sales tracking,
-- follow-up management, and CRM functionality.
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. ENHANCE LEADS TABLE
-- =====================================================

-- Add Site Visit Status Enum
DO $$ BEGIN
    CREATE TYPE site_visit_status AS ENUM (
        'NOT_SCHEDULED',
        'SCHEDULED',
        'PENDING',
        'DONE',
        'CANCELLED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add Customer Requirement Type Enum
DO $$ BEGIN
    CREATE TYPE customer_requirement_type AS ENUM (
        'END_USER',
        'INVESTOR',
        'BOTH'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add Property Preference Enum
DO $$ BEGIN
    CREATE TYPE property_preference AS ENUM (
        'FLAT',
        'DUPLEX',
        'PENTHOUSE',
        'VILLA',
        'PLOT',
        'COMMERCIAL',
        'ANY'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add new columns to leads table
ALTER TABLE leads
ADD COLUMN IF NOT EXISTS site_visit_status site_visit_status DEFAULT 'NOT_SCHEDULED',
ADD COLUMN IF NOT EXISTS site_visit_time TIME,
ADD COLUMN IF NOT EXISTS last_site_visit_date DATE,
ADD COLUMN IF NOT EXISTS requirement_type customer_requirement_type DEFAULT 'END_USER',
ADD COLUMN IF NOT EXISTS property_preference property_preference DEFAULT 'FLAT',
ADD COLUMN IF NOT EXISTS tentative_purchase_timeframe VARCHAR(100),
ADD COLUMN IF NOT EXISTS last_follow_up_feedback TEXT,
ADD COLUMN IF NOT EXISTS total_follow_ups INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS send_follow_up_reminder BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS reminder_sent_at TIMESTAMP;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_leads_site_visit_status ON leads(site_visit_status);
CREATE INDEX IF NOT EXISTS idx_leads_requirement_type ON leads(requirement_type);
CREATE INDEX IF NOT EXISTS idx_leads_property_preference ON leads(property_preference);

-- =====================================================
-- 2. ENHANCE CUSTOMERS TABLE
-- =====================================================

-- Add requirement and preference columns to customers
ALTER TABLE customers
ADD COLUMN IF NOT EXISTS requirement_type customer_requirement_type DEFAULT 'END_USER',
ADD COLUMN IF NOT EXISTS property_preference property_preference DEFAULT 'FLAT',
ADD COLUMN IF NOT EXISTS tentative_purchase_timeframe VARCHAR(100);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_customers_requirement_type ON customers(requirement_type);
CREATE INDEX IF NOT EXISTS idx_customers_property_preference ON customers(property_preference);

-- =====================================================
-- 3. CREATE FOLLOWUPS TABLE
-- =====================================================

-- Add FollowUp Type Enum
DO $$ BEGIN
    CREATE TYPE followup_type AS ENUM (
        'CALL',
        'EMAIL',
        'MEETING',
        'WHATSAPP',
        'SMS',
        'SITE_VISIT',
        'VIDEO_CALL'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add FollowUp Outcome Enum
DO $$ BEGIN
    CREATE TYPE followup_outcome AS ENUM (
        'INTERESTED',
        'NOT_INTERESTED',
        'CALLBACK_REQUESTED',
        'SITE_VISIT_SCHEDULED',
        'DOCUMENTATION_REQUESTED',
        'PRICE_NEGOTIATION',
        'NEEDS_TIME',
        'NOT_REACHABLE',
        'WRONG_NUMBER',
        'CONVERTED',
        'LOST'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create followups table
CREATE TABLE IF NOT EXISTS followups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    follow_up_date DATE NOT NULL,
    follow_up_type followup_type NOT NULL,
    duration_minutes INT DEFAULT 0,
    performed_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    outcome followup_outcome NOT NULL,
    feedback TEXT NOT NULL,
    customer_response TEXT,
    actions_taken TEXT,
    lead_status_before VARCHAR(50),
    lead_status_after VARCHAR(50),
    next_follow_up_date DATE,
    next_follow_up_plan TEXT,
    is_site_visit BOOLEAN DEFAULT false,
    site_visit_property VARCHAR(200),
    site_visit_rating INT DEFAULT 0,
    site_visit_feedback TEXT,
    interest_level INT DEFAULT 5,
    budget_fit INT DEFAULT 5,
    timeline_fit INT DEFAULT 5,
    reminder_sent BOOLEAN DEFAULT false,
    reminder_sent_at TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for followups
CREATE INDEX IF NOT EXISTS idx_followups_lead_id ON followups(lead_id);
CREATE INDEX IF NOT EXISTS idx_followups_performed_by ON followups(performed_by);
CREATE INDEX IF NOT EXISTS idx_followups_follow_up_date ON followups(follow_up_date);
CREATE INDEX IF NOT EXISTS idx_followups_next_follow_up_date ON followups(next_follow_up_date);
CREATE INDEX IF NOT EXISTS idx_followups_lead_date ON followups(lead_id, follow_up_date);
CREATE INDEX IF NOT EXISTS idx_followups_user_date ON followups(performed_by, follow_up_date);

-- =====================================================
-- 4. CREATE SALES TARGETS TABLE
-- =====================================================

-- Add Target Period Enum
DO $$ BEGIN
    CREATE TYPE target_period AS ENUM (
        'MONTHLY',
        'QUARTERLY',
        'HALF_YEARLY',
        'YEARLY'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add Target Status Enum
DO $$ BEGIN
    CREATE TYPE target_status AS ENUM (
        'ACTIVE',
        'ACHIEVED',
        'MISSED',
        'IN_PROGRESS'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create sales_targets table
CREATE TABLE IF NOT EXISTS sales_targets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sales_person_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_period target_period NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    -- Target Metrics
    target_leads INT DEFAULT 0,
    target_site_visits INT DEFAULT 0,
    target_conversions INT DEFAULT 0,
    target_bookings INT DEFAULT 0,
    target_revenue DECIMAL(15, 2) DEFAULT 0,
    -- Self Targets
    self_target_bookings INT DEFAULT 0,
    self_target_revenue DECIMAL(15, 2) DEFAULT 0,
    self_target_notes TEXT,
    -- Achievement
    achieved_leads INT DEFAULT 0,
    achieved_site_visits INT DEFAULT 0,
    achieved_conversions INT DEFAULT 0,
    achieved_bookings INT DEFAULT 0,
    achieved_revenue DECIMAL(15, 2) DEFAULT 0,
    -- Achievement Percentages
    leads_achievement_pct DECIMAL(5, 2) DEFAULT 0,
    site_visits_achievement_pct DECIMAL(5, 2) DEFAULT 0,
    conversions_achievement_pct DECIMAL(5, 2) DEFAULT 0,
    bookings_achievement_pct DECIMAL(5, 2) DEFAULT 0,
    revenue_achievement_pct DECIMAL(5, 2) DEFAULT 0,
    overall_achievement_pct DECIMAL(5, 2) DEFAULT 0,
    -- Incentive Calculation
    base_incentive DECIMAL(15, 2) DEFAULT 0,
    earned_incentive DECIMAL(15, 2) DEFAULT 0,
    bonus_incentive DECIMAL(15, 2) DEFAULT 0,
    total_incentive DECIMAL(15, 2) DEFAULT 0,
    incentive_paid BOOLEAN DEFAULT false,
    incentive_paid_date DATE,
    -- Motivational
    motivational_message TEXT,
    missed_by INT DEFAULT 0,
    -- Status
    status target_status DEFAULT 'IN_PROGRESS',
    set_by UUID REFERENCES users(id),
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID
);

-- Create indexes for sales_targets
CREATE INDEX IF NOT EXISTS idx_sales_targets_sales_person ON sales_targets(sales_person_id);
CREATE INDEX IF NOT EXISTS idx_sales_targets_period ON sales_targets(target_period);
CREATE INDEX IF NOT EXISTS idx_sales_targets_status ON sales_targets(status);
CREATE INDEX IF NOT EXISTS idx_sales_targets_person_period ON sales_targets(sales_person_id, target_period, start_date);

-- =====================================================
-- 5. CREATE SALES TASKS TABLE (Personal Scheduler)
-- =====================================================

-- Add Task Type Enum
DO $$ BEGIN
    CREATE TYPE task_type AS ENUM (
        'FOLLOWUP_CALL',
        'SITE_VISIT',
        'MEETING',
        'DOCUMENTATION',
        'PROPERTY_TOUR',
        'CLIENT_MEETING',
        'INTERNAL_MEETING',
        'EMAIL_FOLLOWUP',
        'NEGOTIATION',
        'OTHER'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add Task Priority Enum
DO $$ BEGIN
    CREATE TYPE task_priority AS ENUM (
        'LOW',
        'MEDIUM',
        'HIGH',
        'URGENT'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add Task Status Enum
DO $$ BEGIN
    CREATE TYPE task_status AS ENUM (
        'PENDING',
        'IN_PROGRESS',
        'COMPLETED',
        'CANCELLED',
        'OVERDUE'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create sales_tasks table
CREATE TABLE IF NOT EXISTS sales_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    task_type task_type NOT NULL,
    priority task_priority DEFAULT 'MEDIUM',
    status task_status DEFAULT 'PENDING',
    -- Assignment
    assigned_to UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES users(id),
    -- Timeline
    due_date DATE NOT NULL,
    due_time TIME,
    estimated_duration_minutes INT DEFAULT 60,
    completed_at TIMESTAMP,
    -- Related Entities
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    customer_id UUID,
    property_id UUID,
    -- Location
    location VARCHAR(255),
    location_details TEXT,
    -- Meeting Details
    attendees TEXT[], -- Array of attendees
    meeting_link VARCHAR(500),
    -- Reminder
    send_reminder BOOLEAN DEFAULT true,
    reminder_before_minutes INT DEFAULT 1440, -- 24 hours
    reminder_sent BOOLEAN DEFAULT false,
    reminder_sent_at TIMESTAMP,
    -- Outcome
    outcome TEXT,
    notes TEXT,
    attachments TEXT[], -- Array of file paths
    -- Recurrence
    is_recurring BOOLEAN DEFAULT false,
    recurrence_pattern VARCHAR(50),
    parent_task_id UUID,
    -- System Fields
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID
);

-- Create indexes for sales_tasks
CREATE INDEX IF NOT EXISTS idx_sales_tasks_assigned_to ON sales_tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_sales_tasks_due_date ON sales_tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_sales_tasks_status ON sales_tasks(status);
CREATE INDEX IF NOT EXISTS idx_sales_tasks_task_type ON sales_tasks(task_type);
CREATE INDEX IF NOT EXISTS idx_sales_tasks_lead_id ON sales_tasks(lead_id);
CREATE INDEX IF NOT EXISTS idx_sales_tasks_assigned_due ON sales_tasks(assigned_to, due_date);
CREATE INDEX IF NOT EXISTS idx_sales_tasks_assigned_status ON sales_tasks(assigned_to, status);
CREATE INDEX IF NOT EXISTS idx_sales_tasks_due_status ON sales_tasks(due_date, status);

-- =====================================================
-- 6. CREATE UPDATE TIMESTAMP TRIGGERS
-- =====================================================

-- Function to update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_followups_updated_at BEFORE UPDATE ON followups
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sales_targets_updated_at BEFORE UPDATE ON sales_targets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sales_tasks_updated_at BEFORE UPDATE ON sales_tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 7. ADD SAMPLE DATA (Optional - for testing)
-- =====================================================

-- Add some sample tentative purchase timeframes
COMMENT ON COLUMN leads.tentative_purchase_timeframe IS 'Examples: 1-3 months, 3-6 months, 6-12 months, 1+ year';
COMMENT ON COLUMN customers.tentative_purchase_timeframe IS 'Examples: 1-3 months, 3-6 months, 6-12 months, 1+ year';

-- =====================================================
-- Migration Complete
-- =====================================================

-- Display summary
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Sales & CRM Enhancement Migration Complete';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'New Tables Created:';
    RAISE NOTICE '  - followups (Lead followup tracking)';
    RAISE NOTICE '  - sales_targets (Sales performance targets)';
    RAISE NOTICE '  - sales_tasks (Personal task scheduler)';
    RAISE NOTICE '';
    RAISE NOTICE 'Enhanced Tables:';
    RAISE NOTICE '  - leads (Added site visit status, requirements, reminders)';
    RAISE NOTICE '  - customers (Added requirements and preferences)';
    RAISE NOTICE '';
    RAISE NOTICE 'New ENUMs Created:';
    RAISE NOTICE '  - site_visit_status, customer_requirement_type';
    RAISE NOTICE '  - property_preference, followup_type, followup_outcome';
    RAISE NOTICE '  - target_period, target_status';
    RAISE NOTICE '  - task_type, task_priority, task_status';
    RAISE NOTICE '========================================';
END $$;



