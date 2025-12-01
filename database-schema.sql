-- ============================================================================
-- Eastern Estate ERP - Unified Database Schema
-- PostgreSQL 16+
-- This script creates all core/public tables and then pulls in module-specific
-- schemas (notifications, chat, accounting, telephony).
-- Run with: psql -f database-schema.sql
-- ============================================================================

\set ON_ERROR_STOP on

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================================
-- CORE AUTH & RBAC
-- ============================================================================

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name  VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    alternate_phone VARCHAR(20),
    date_of_birth DATE,
    gender VARCHAR(20),
    profile_image TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    email_verified_at TIMESTAMP,
    last_login_at TIMESTAMP,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP,
    created_by UUID,
    updated_by UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(200) NOT NULL,
    description TEXT,
    -- Two flags to satisfy both user/roles modules
    is_system BOOLEAN DEFAULT FALSE,
    is_system_role BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID,
    updated_by UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- Users module shape
    name VARCHAR(100) UNIQUE,
    display_name VARCHAR(100),
    -- Roles module shape
    module VARCHAR(100) NOT NULL,
    action VARCHAR(100),
    resource VARCHAR(100),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_permissions_module_action_resource UNIQUE (module, action, resource)
);

CREATE TABLE IF NOT EXISTS role_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    constraints JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS user_roles (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_by UUID,
    PRIMARY KEY (user_id, role_id)
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(500) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- EMPLOYEES & HR
-- ============================================================================

CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_code VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(200) NOT NULL,
    email VARCHAR(200),
    phone_number VARCHAR(50) NOT NULL,
    alternate_phone VARCHAR(50),
    date_of_birth DATE NOT NULL,
    gender VARCHAR(20) NOT NULL,
    blood_group VARCHAR(50),
    marital_status VARCHAR(50),
    current_address TEXT NOT NULL,
    permanent_address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(20),
    department VARCHAR(50) NOT NULL,
    designation VARCHAR(200) NOT NULL,
    employment_type VARCHAR(20) NOT NULL,
    employment_status VARCHAR(20) DEFAULT 'ACTIVE',
    joining_date DATE NOT NULL,
    confirmation_date DATE,
    resignation_date DATE,
    last_working_date DATE,
    reporting_manager_id UUID,
    reporting_manager_name VARCHAR(200),
    basic_salary DECIMAL(15,2) NOT NULL,
    house_rent_allowance DECIMAL(15,2) DEFAULT 0,
    transport_allowance DECIMAL(15,2) DEFAULT 0,
    medical_allowance DECIMAL(15,2) DEFAULT 0,
    other_allowances DECIMAL(15,2) DEFAULT 0,
    gross_salary DECIMAL(15,2) NOT NULL,
    pf_deduction DECIMAL(15,2) DEFAULT 0,
    esi_deduction DECIMAL(15,2) DEFAULT 0,
    tax_deduction DECIMAL(15,2) DEFAULT 0,
    other_deductions DECIMAL(15,2) DEFAULT 0,
    net_salary DECIMAL(15,2) NOT NULL,
    bank_name VARCHAR(200),
    bank_account_number VARCHAR(50),
    ifsc_code VARCHAR(50),
    branch_name VARCHAR(200),
    aadhar_number VARCHAR(50),
    pan_number VARCHAR(50),
    pf_number VARCHAR(50),
    esi_number VARCHAR(50),
    uan_number VARCHAR(50),
    documents TEXT[],
    emergency_contact_name VARCHAR(200),
    emergency_contact_phone VARCHAR(50),
    emergency_contact_relation VARCHAR(100),
    casual_leave_balance INT DEFAULT 0,
    sick_leave_balance INT DEFAULT 0,
    earned_leave_balance INT DEFAULT 0,
    leave_taken INT DEFAULT 0,
    total_present INT DEFAULT 0,
    total_absent INT DEFAULT 0,
    total_late_arrival INT DEFAULT 0,
    skills TEXT,
    qualifications TEXT,
    experience TEXT,
    performance_rating DECIMAL(3,2),
    last_review_date TIMESTAMP,
    notes TEXT,
    tags TEXT[],
    is_active BOOLEAN DEFAULT TRUE,
    user_id UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID
);

CREATE INDEX IF NOT EXISTS idx_employees_code ON employees(employee_code);
CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(department);
CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(employment_status);
CREATE INDEX IF NOT EXISTS idx_employees_active ON employees(is_active);

CREATE TABLE IF NOT EXISTS employee_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL,
    document_name VARCHAR(200) NOT NULL,
    document_number VARCHAR(100),
    document_description TEXT,
    document_url VARCHAR(500) NOT NULL,
    file_name VARCHAR(100),
    file_type VARCHAR(50),
    file_size INT,
    document_status VARCHAR(20) DEFAULT 'PENDING',
    issue_date DATE,
    expiry_date DATE,
    is_expirable BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    verified_by UUID,
    verified_by_name VARCHAR(200),
    verified_at TIMESTAMP,
    verification_remarks TEXT,
    rejected_by UUID,
    rejected_at TIMESTAMP,
    rejection_reason TEXT,
    submitted_date DATE,
    submission_remarks TEXT,
    send_expiry_reminder BOOLEAN DEFAULT FALSE,
    reminder_days_before INT,
    last_reminder_sent TIMESTAMP,
    notes TEXT,
    tags TEXT[],
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID
);

CREATE TABLE IF NOT EXISTS employee_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    provider_id UUID,
    provider_name VARCHAR(200),
    provider_designation VARCHAR(200),
    provider_relationship VARCHAR(200),
    feedback_type VARCHAR(50) NOT NULL,
    feedback_title VARCHAR(200) NOT NULL,
    feedback_date DATE NOT NULL,
    feedback_status VARCHAR(20) DEFAULT 'DRAFT',
    positive_aspects TEXT,
    areas_for_improvement TEXT,
    specific_examples TEXT,
    recommendations TEXT,
    general_comments TEXT,
    technical_skills_rating DECIMAL(3,2),
    communication_rating DECIMAL(3,2),
    teamwork_rating DECIMAL(3,2),
    leadership_rating DECIMAL(3,2),
    problem_solving_rating DECIMAL(3,2),
    reliability_rating DECIMAL(3,2),
    professionalism_rating DECIMAL(3,2),
    overall_rating DECIMAL(3,2),
    is_anonymous BOOLEAN DEFAULT FALSE,
    employee_acknowledged BOOLEAN DEFAULT FALSE,
    employee_acknowledged_at TIMESTAMP,
    employee_response TEXT,
    manager_reviewed BOOLEAN DEFAULT FALSE,
    manager_reviewed_by UUID,
    manager_reviewed_at TIMESTAMP,
    manager_comments TEXT,
    attachments TEXT[],
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID
);

CREATE TABLE IF NOT EXISTS employee_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    review_type VARCHAR(20) NOT NULL,
    review_title VARCHAR(200) NOT NULL,
    review_date DATE NOT NULL,
    review_period_start DATE NOT NULL,
    review_period_end DATE NOT NULL,
    review_status VARCHAR(20) DEFAULT 'SCHEDULED',
    reviewer_id UUID,
    reviewer_name VARCHAR(200),
    reviewer_designation VARCHAR(200),
    technical_skills_rating DECIMAL(3,2),
    communication_rating DECIMAL(3,2),
    teamwork_rating DECIMAL(3,2),
    leadership_rating DECIMAL(3,2),
    problem_solving_rating DECIMAL(3,2),
    initiative_rating DECIMAL(3,2),
    punctuality_rating DECIMAL(3,2),
    quality_of_work_rating DECIMAL(3,2),
    productivity_rating DECIMAL(3,2),
    attendance_rating DECIMAL(3,2),
    overall_rating DECIMAL(3,2) NOT NULL,
    achievements TEXT,
    strengths TEXT,
    areas_of_improvement TEXT,
    goals TEXT,
    training_needs TEXT,
    development_plan TEXT,
    reviewer_comments TEXT,
    employee_comments TEXT,
    target_achievement DECIMAL(15,2),
    actual_achievement DECIMAL(15,2),
    kpi_achievement_percentage DECIMAL(5,2),
    recommended_for_promotion BOOLEAN DEFAULT FALSE,
    recommended_for_increment BOOLEAN DEFAULT FALSE,
    recommended_increment_percentage DECIMAL(5,2),
    recommended_for_bonus BOOLEAN DEFAULT FALSE,
    recommended_bonus_amount DECIMAL(15,2),
    recommended_for_training BOOLEAN DEFAULT FALSE,
    training_recommendations TEXT,
    action_items TEXT,
    next_review_date DATE,
    employee_acknowledged BOOLEAN DEFAULT FALSE,
    employee_acknowledged_at TIMESTAMP,
    manager_approved BOOLEAN DEFAULT FALSE,
    manager_approved_by UUID,
    manager_approved_at TIMESTAMP,
    attachments TEXT[],
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID
);

CREATE TABLE IF NOT EXISTS bonuses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    bonus_type VARCHAR(30) NOT NULL,
    bonus_title VARCHAR(200) NOT NULL,
    bonus_description TEXT,
    bonus_amount DECIMAL(15,2) NOT NULL,
    bonus_date DATE NOT NULL,
    payment_date DATE,
    performance_rating DECIMAL(5,2),
    target_amount DECIMAL(15,2),
    achieved_amount DECIMAL(15,2),
    achievement_percentage DECIMAL(5,2),
    bonus_status VARCHAR(20) DEFAULT 'PENDING',
    approved_by UUID,
    approved_by_name VARCHAR(200),
    approved_at TIMESTAMP,
    approval_remarks TEXT,
    rejected_by UUID,
    rejected_at TIMESTAMP,
    rejection_reason TEXT,
    transaction_reference VARCHAR(100),
    payment_mode VARCHAR(200),
    payment_remarks TEXT,
    tax_deduction DECIMAL(15,2) DEFAULT 0,
    net_bonus_amount DECIMAL(15,2) NOT NULL,
    notes TEXT,
    attachments TEXT[],
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID
);

CREATE TABLE IF NOT EXISTS salary_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    payment_month DATE NOT NULL,
    working_days INT NOT NULL,
    present_days INT NOT NULL,
    absent_days INT DEFAULT 0,
    paid_leave_days INT DEFAULT 0,
    unpaid_leave_days INT DEFAULT 0,
    overtime_hours INT DEFAULT 0,
    basic_salary DECIMAL(15,2) NOT NULL,
    house_rent_allowance DECIMAL(15,2) DEFAULT 0,
    transport_allowance DECIMAL(15,2) DEFAULT 0,
    medical_allowance DECIMAL(15,2) DEFAULT 0,
    overtime_payment DECIMAL(15,2) DEFAULT 0,
    other_allowances DECIMAL(15,2) DEFAULT 0,
    gross_salary DECIMAL(15,2) NOT NULL,
    pf_deduction DECIMAL(15,2) DEFAULT 0,
    esi_deduction DECIMAL(15,2) DEFAULT 0,
    tax_deduction DECIMAL(15,2) DEFAULT 0,
    advance_deduction DECIMAL(15,2) DEFAULT 0,
    loan_deduction DECIMAL(15,2) DEFAULT 0,
    other_deductions DECIMAL(15,2) DEFAULT 0,
    total_deductions DECIMAL(15,2) NOT NULL,
    net_salary DECIMAL(15,2) NOT NULL,
    payment_status VARCHAR(20) DEFAULT 'PENDING',
    payment_mode VARCHAR(20),
    payment_date DATE,
    transaction_reference VARCHAR(100),
    payment_remarks VARCHAR(200),
    bank_name VARCHAR(200),
    account_number VARCHAR(50),
    ifsc_code VARCHAR(50),
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID,
    approved_by UUID,
    approved_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sales_targets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sales_person_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_period VARCHAR(20) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    target_leads INT DEFAULT 0,
    target_site_visits INT DEFAULT 0,
    target_conversions INT DEFAULT 0,
    target_bookings INT DEFAULT 0,
    target_revenue DECIMAL(15,2) DEFAULT 0,
    self_target_bookings INT DEFAULT 0,
    self_target_revenue DECIMAL(15,2) DEFAULT 0,
    self_target_notes TEXT,
    achieved_leads INT DEFAULT 0,
    achieved_site_visits INT DEFAULT 0,
    achieved_conversions INT DEFAULT 0,
    achieved_bookings INT DEFAULT 0,
    achieved_revenue DECIMAL(15,2) DEFAULT 0,
    leads_achievement_pct DECIMAL(5,2) DEFAULT 0,
    site_visits_achievement_pct DECIMAL(5,2) DEFAULT 0,
    conversions_achievement_pct DECIMAL(5,2) DEFAULT 0,
    bookings_achievement_pct DECIMAL(5,2) DEFAULT 0,
    revenue_achievement_pct DECIMAL(5,2) DEFAULT 0,
    overall_achievement_pct DECIMAL(5,2) DEFAULT 0,
    base_incentive DECIMAL(15,2) DEFAULT 0,
    earned_incentive DECIMAL(15,2) DEFAULT 0,
    bonus_incentive DECIMAL(15,2) DEFAULT 0,
    total_incentive DECIMAL(15,2) DEFAULT 0,
    incentive_paid BOOLEAN DEFAULT FALSE,
    incentive_paid_date DATE,
    motivational_message TEXT,
    missed_by INT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'IN_PROGRESS',
    set_by UUID,
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID
);

-- ============================================================================
-- PROPERTIES / INVENTORY
-- ============================================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'data_completeness_status_enum') THEN
        CREATE TYPE data_completeness_status_enum AS ENUM ('NOT_STARTED','IN_PROGRESS','COMPLETED','NEEDS_REVIEW');
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    country VARCHAR(100),
    address TEXT NOT NULL,
    location TEXT,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(10) NOT NULL,
    nearby_landmarks TEXT,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    total_area DECIMAL(15,2),
    area_unit VARCHAR(20) DEFAULT 'sqft',
    built_up_area DECIMAL(15,2),
    number_of_towers INT,
    number_of_units INT,
    total_towers_planned INT,
    total_units_planned INT,
    floors_per_tower VARCHAR(50),
    launch_date DATE,
    expected_completion_date DATE,
    actual_completion_date DATE,
    rera_number VARCHAR(100),
    rera_status VARCHAR(50),
    project_type VARCHAR(50),
    property_type VARCHAR(50),
    status VARCHAR(50) DEFAULT 'Active',
    price_min DECIMAL(15,2),
    price_max DECIMAL(15,2),
    expected_revenue DECIMAL(18,2),
    bhk_types TEXT[],
    images JSONB,
    documents JSONB,
    amenities JSONB,
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    inventory_checklist JSONB,
    data_completion_pct DECIMAL(5,2) DEFAULT 0,
    data_completeness_status data_completeness_status_enum DEFAULT 'NOT_STARTED',
    created_by UUID,
    updated_by UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS towers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    tower_code VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    total_floors INT NOT NULL,
    flats_per_floor INT,
    total_flats INT,
    tower_size DECIMAL(15,2),
    facing VARCHAR(50),
    position VARCHAR(100),
    has_lift BOOLEAN DEFAULT FALSE,
    number_of_lifts INT DEFAULT 0,
    lift_capacity INT,
    has_stairs BOOLEAN DEFAULT TRUE,
    number_of_stairs INT DEFAULT 1,
    parking_type VARCHAR(50),
    parking_capacity INT,
    has_gym BOOLEAN DEFAULT FALSE,
    has_garden BOOLEAN DEFAULT FALSE,
    has_security_alarm BOOLEAN DEFAULT FALSE,
    has_fire_alarm BOOLEAN DEFAULT FALSE,
    is_vastu_compliant BOOLEAN DEFAULT FALSE,
    has_central_ac BOOLEAN DEFAULT FALSE,
    has_intercom BOOLEAN DEFAULT FALSE,
    layout_images JSONB,
    arial_view_images JSONB,
    amenities JSONB,
    surrounding_description TEXT,
    status VARCHAR(50) DEFAULT 'Active',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID,
    UNIQUE(property_id, tower_code)
);

CREATE TABLE IF NOT EXISTS flats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    tower_id UUID REFERENCES towers(id) ON DELETE CASCADE,
    flat_code VARCHAR(50) NOT NULL,
    flat_number VARCHAR(50) NOT NULL,
    flat_name VARCHAR(100),
    flat_type VARCHAR(50) NOT NULL,
    description TEXT,
    carpet_area DECIMAL(15,2) NOT NULL,
    built_up_area DECIMAL(15,2),
    super_built_up_area DECIMAL(15,2),
    area_unit VARCHAR(20) DEFAULT 'sqft',
    base_rate_per_sqft DECIMAL(15,2) NOT NULL,
    base_price DECIMAL(15,2) NOT NULL,
    gst_amount DECIMAL(15,2),
    registration_charges DECIMAL(15,2),
    other_charges DECIMAL(15,2),
    total_price DECIMAL(15,2) NOT NULL,
    bedrooms INT NOT NULL,
    bathrooms INT NOT NULL,
    balconies INT DEFAULT 0,
    has_study_room BOOLEAN DEFAULT FALSE,
    has_servant_room BOOLEAN DEFAULT FALSE,
    has_pooja_room BOOLEAN DEFAULT FALSE,
    room_details JSONB,
    facing VARCHAR(50),
    furnishing_status VARCHAR(50) DEFAULT 'Unfurnished',
    flooring_type VARCHAR(50),
    kitchen_type VARCHAR(50),
    floor_plan_image TEXT,
    images JSONB,
    payment_plan_document TEXT,
    surrounding_description TEXT,
    status VARCHAR(50) DEFAULT 'Available',
    is_verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMP,
    verified_by UUID,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID,
    UNIQUE(property_id, flat_code),
    UNIQUE(tower_id, flat_number)
);

-- ============================================================================
-- CUSTOMERS
-- ============================================================================

CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_code VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20) NOT NULL,
    alternate_phone VARCHAR(20),
    date_of_birth DATE,
    gender VARCHAR(20),
    marital_status VARCHAR(50),
    address_line1 TEXT,
    address_line2 TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(10),
    country VARCHAR(100) DEFAULT 'India',
    pan_number VARCHAR(20),
    pan_document TEXT,
    aadhar_number VARCHAR(20),
    aadhar_document TEXT,
    passport_number VARCHAR(20),
    passport_document TEXT,
    occupation VARCHAR(100),
    company_name VARCHAR(200),
    annual_income DECIMAL(15,2),
    portal_user_id UUID,
    source VARCHAR(50),
    referred_by UUID,
    broker_id UUID,
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID
);

-- ============================================================================
-- LEADS / CRM
-- ============================================================================

CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_code VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(200) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    alternate_phone VARCHAR(20),
    address_line1 TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    status VARCHAR(20) DEFAULT 'NEW',
    source VARCHAR(50) NOT NULL,
    priority VARCHAR(10) DEFAULT 'MEDIUM',
    interested_in VARCHAR(255),
    requirement_type VARCHAR(20) DEFAULT 'END_USER',
    property_preference VARCHAR(20) DEFAULT 'FLAT',
    budget_min DECIMAL(15,2),
    budget_max DECIMAL(15,2),
    preferred_location VARCHAR(100),
    requirements TEXT[],
    tentative_purchase_timeframe VARCHAR(100),
    timeline DATE,
    last_contact_date DATE,
    follow_up_date DATE,
    notes TEXT,
    last_follow_up_feedback TEXT,
    total_follow_ups INT DEFAULT 0,
    send_follow_up_reminder BOOLEAN DEFAULT TRUE,
    reminder_sent BOOLEAN DEFAULT FALSE,
    reminder_sent_at TIMESTAMP,
    assigned_to VARCHAR(255),
    assigned_at TIMESTAMP,
    is_qualified BOOLEAN DEFAULT FALSE,
    is_first_time_buyer BOOLEAN DEFAULT FALSE,
    has_existing_property BOOLEAN DEFAULT FALSE,
    needs_home_loan BOOLEAN DEFAULT FALSE,
    has_approved_loan BOOLEAN DEFAULT FALSE,
    current_occupation VARCHAR(100),
    annual_income DECIMAL(15,2),
    campaign_name VARCHAR(100),
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),
    tags TEXT[],
    referred_by UUID,
    referral_name VARCHAR(200),
    referral_phone VARCHAR(20),
    has_site_visit BOOLEAN DEFAULT FALSE,
    site_visit_status VARCHAR(30) DEFAULT 'NOT_SCHEDULED',
    site_visit_time TIME,
    site_visit_feedback TEXT,
    total_site_visits INT DEFAULT 0,
    last_site_visit_date DATE,
    total_calls INT DEFAULT 0,
    total_emails INT DEFAULT 0,
    total_meetings INT DEFAULT 0,
    last_call_date DATE,
    last_email_date DATE,
    last_meeting_date DATE,
    converted_to_customer UUID,
    converted_at DATE,
    lost_reason TEXT,
    lost_at DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID
);

CREATE TABLE IF NOT EXISTS followups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    follow_up_date DATE NOT NULL,
    follow_up_type VARCHAR(20) NOT NULL,
    duration_minutes INT DEFAULT 0,
    performed_by UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    outcome VARCHAR(30) NOT NULL,
    feedback TEXT NOT NULL,
    customer_response TEXT,
    actions_taken TEXT,
    lead_status_before VARCHAR(50),
    lead_status_after VARCHAR(50),
    next_follow_up_date DATE,
    next_follow_up_plan TEXT,
    is_site_visit BOOLEAN DEFAULT FALSE,
    site_visit_property VARCHAR(200),
    site_visit_rating INT DEFAULT 0,
    site_visit_feedback TEXT,
    interest_level INT DEFAULT 5,
    budget_fit INT DEFAULT 5,
    timeline_fit INT DEFAULT 5,
    reminder_sent BOOLEAN DEFAULT FALSE,
    reminder_sent_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sales_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    task_type VARCHAR(30) NOT NULL,
    priority VARCHAR(10) DEFAULT 'MEDIUM',
    status VARCHAR(20) DEFAULT 'PENDING',
    assigned_to UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    assigned_by UUID,
    due_date DATE NOT NULL,
    due_time TIME,
    estimated_duration_minutes INT DEFAULT 60,
    completed_at TIMESTAMP,
    lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
    customer_id UUID,
    property_id UUID,
    location VARCHAR(255),
    location_details TEXT,
    attendees TEXT[],
    meeting_link VARCHAR(500),
    send_reminder BOOLEAN DEFAULT TRUE,
    reminder_before_minutes INT DEFAULT 1440,
    reminder_sent BOOLEAN DEFAULT FALSE,
    reminder_sent_at TIMESTAMP,
    outcome TEXT,
    notes TEXT,
    attachments TEXT[],
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_pattern VARCHAR(50),
    parent_task_id UUID,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID
);

-- ============================================================================
-- BOOKINGS & PAYMENTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id UUID NOT NULL REFERENCES customers(id),
    flat_id UUID NOT NULL REFERENCES flats(id),
    property_id UUID NOT NULL REFERENCES properties(id),
    status VARCHAR(30) DEFAULT 'TOKEN_PAID',
    booking_date DATE NOT NULL,
    total_amount DECIMAL(15,2) NOT NULL,
    booking_amount DECIMAL(15,2) NOT NULL,
    paid_amount DECIMAL(15,2) DEFAULT 0,
    balance_amount DECIMAL(15,2) DEFAULT 0,
    token_payment_mode VARCHAR(100),
    rtgs_number VARCHAR(100),
    utr_number VARCHAR(100),
    cheque_number VARCHAR(100),
    cheque_date DATE,
    payment_bank VARCHAR(200),
    payment_branch VARCHAR(200),
    agreement_number VARCHAR(100),
    agreement_date DATE,
    agreement_signed_date DATE,
    agreement_document_url TEXT,
    expected_possession_date DATE,
    actual_possession_date DATE,
    registration_date DATE,
    discount_amount DECIMAL(15,2) DEFAULT 0,
    discount_reason VARCHAR(200),
    stamp_duty DECIMAL(15,2) DEFAULT 0,
    registration_charges DECIMAL(15,2) DEFAULT 0,
    gst_amount DECIMAL(15,2) DEFAULT 0,
    maintenance_deposit DECIMAL(15,2) DEFAULT 0,
    parking_charges DECIMAL(15,2) DEFAULT 0,
    other_charges DECIMAL(15,2) DEFAULT 0,
    is_home_loan BOOLEAN DEFAULT FALSE,
    bank_name VARCHAR(100),
    loan_amount DECIMAL(15,2),
    loan_application_number VARCHAR(100),
    loan_approval_date DATE,
    loan_disbursement_date DATE,
    nominee1_name VARCHAR(200),
    nominee1_relation VARCHAR(100),
    nominee2_name VARCHAR(200),
    nominee2_relation VARCHAR(100),
    co_applicant_name VARCHAR(200),
    co_applicant_email VARCHAR(200),
    co_applicant_phone VARCHAR(20),
    co_applicant_relation VARCHAR(100),
    cancellation_date DATE,
    cancellation_reason TEXT,
    refund_amount DECIMAL(15,2),
    refund_date DATE,
    documents TEXT[],
    payment_plan VARCHAR(50),
    tower_id UUID REFERENCES towers(id),
    notes TEXT,
    special_terms TEXT,
    tags TEXT[],
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID
);

CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_number VARCHAR(100) UNIQUE NOT NULL,
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    customer_id UUID NOT NULL REFERENCES customers(id),
    payment_type VARCHAR(50) NOT NULL,
    payment_mode VARCHAR(50) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    payment_date DATE NOT NULL,
    bank_name VARCHAR(255),
    transaction_id VARCHAR(200),
    cheque_number VARCHAR(100),
    cheque_date DATE,
    utr_number VARCHAR(200),
    payment_status VARCHAR(20) DEFAULT 'PENDING',
    receipt_number VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payment_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    schedule_number VARCHAR(50) NOT NULL,
    installment_number INT NOT NULL,
    total_installments INT NOT NULL,
    due_date DATE NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    description TEXT,
    milestone VARCHAR(100),
    status VARCHAR(20) DEFAULT 'PENDING',
    paid_amount DECIMAL(15,2) DEFAULT 0,
    paid_date DATE,
    payment_id UUID,
    is_overdue BOOLEAN DEFAULT FALSE,
    overdue_days INT DEFAULT 0,
    penalty_amount DECIMAL(15,2) DEFAULT 0,
    is_waived BOOLEAN DEFAULT FALSE,
    waiver_reason TEXT,
    waived_date DATE,
    waived_by UUID,
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID,
    UNIQUE(booking_id, schedule_number)
);

CREATE TABLE IF NOT EXISTS payment_installments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    installment_number INT NOT NULL,
    due_date DATE NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    status VARCHAR(15) DEFAULT 'PENDING',
    payment_id UUID REFERENCES payments(id) ON DELETE SET NULL,
    paid_date DATE,
    paid_amount DECIMAL(15,2) DEFAULT 0,
    late_fee DECIMAL(10,2) DEFAULT 0,
    late_fee_waived BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payment_refunds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
    refund_amount DECIMAL(15,2) NOT NULL,
    refund_reason TEXT NOT NULL,
    refund_date DATE NOT NULL,
    refund_method VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING',
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP,
    processed_by UUID REFERENCES users(id),
    processed_at TIMESTAMP,
    bank_details TEXT,
    transaction_reference VARCHAR(200),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- VENDORS & PROCUREMENT
-- ============================================================================

CREATE TABLE IF NOT EXISTS vendors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(200),
    email VARCHAR(200),
    phone VARCHAR(50),
    alternate_phone VARCHAR(50),
    gst_number VARCHAR(30),
    pan_number VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(10),
    payment_terms TEXT,
    bank_details TEXT,
    rating DECIMAL(3,2),
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID
);

CREATE TABLE IF NOT EXISTS vendor_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
    payment_date DATE NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    reference_number VARCHAR(100),
    status VARCHAR(20) DEFAULT 'PENDING',
    remarks TEXT,
    created_by UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS purchase_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    po_number VARCHAR(50) UNIQUE NOT NULL,
    po_date DATE NOT NULL,
    vendor_id UUID NOT NULL REFERENCES vendors(id),
    property_id UUID REFERENCES properties(id),
    construction_project_id UUID,
    status VARCHAR(30) DEFAULT 'DRAFT',
    expected_delivery_date DATE,
    actual_delivery_date DATE,
    subtotal DECIMAL(15,2) DEFAULT 0,
    tax_amount DECIMAL(15,2) DEFAULT 0,
    discount_amount DECIMAL(15,2) DEFAULT 0,
    total_amount DECIMAL(15,2) NOT NULL,
    payment_terms VARCHAR(255),
    advance_paid DECIMAL(15,2) DEFAULT 0,
    balance_amount DECIMAL(15,2) DEFAULT 0,
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP,
    delivery_address TEXT,
    delivery_contact VARCHAR(255),
    delivery_phone VARCHAR(20),
    notes TEXT,
    terms_and_conditions TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS purchase_order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    purchase_order_id UUID REFERENCES purchase_orders(id) ON DELETE CASCADE,
    material_id UUID,
    item_name VARCHAR(255) NOT NULL,
    quantity DECIMAL(15,3) NOT NULL,
    unit_of_measurement VARCHAR(30) NOT NULL,
    unit_price DECIMAL(15,2) NOT NULL,
    tax_percentage DECIMAL(5,2) DEFAULT 0,
    discount_percentage DECIMAL(5,2) DEFAULT 0,
    subtotal DECIMAL(15,2) NOT NULL,
    remarks TEXT
);

-- ============================================================================
-- MATERIALS / INVENTORY
-- ============================================================================

CREATE TABLE IF NOT EXISTS materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    material_code VARCHAR(50) UNIQUE NOT NULL,
    material_name VARCHAR(255) NOT NULL,
    category VARCHAR(30) NOT NULL,
    unit_of_measurement VARCHAR(30) NOT NULL,
    current_stock DECIMAL(15,3) DEFAULT 0,
    minimum_stock_level DECIMAL(15,3) DEFAULT 0,
    maximum_stock_level DECIMAL(15,3) DEFAULT 0,
    unit_price DECIMAL(15,2) DEFAULT 0,
    gst_percentage DECIMAL(5,2) DEFAULT 0,
    specifications TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID
);

CREATE TABLE IF NOT EXISTS material_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    material_id UUID NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
    entry_type VARCHAR(20) NOT NULL,
    quantity DECIMAL(15,3) NOT NULL,
    unit_price DECIMAL(15,2) NOT NULL,
    total_value DECIMAL(15,2) NOT NULL,
    vendor_id UUID REFERENCES vendors(id),
    purchase_order_id UUID,
    entry_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    entered_by UUID NOT NULL REFERENCES users(id),
    invoice_number VARCHAR(100),
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS material_exits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    material_id UUID NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
    exit_type VARCHAR(20) NOT NULL,
    quantity DECIMAL(15,3) NOT NULL,
    unit_price DECIMAL(15,2) NOT NULL,
    total_value DECIMAL(15,2) NOT NULL,
    used_for VARCHAR(200),
    project_id UUID,
    requested_by UUID REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    issued_by UUID REFERENCES users(id),
    exit_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- CONSTRUCTION
-- ============================================================================

CREATE TABLE IF NOT EXISTS construction_projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL REFERENCES properties(id),
    project_name VARCHAR(255) NOT NULL,
    start_date DATE,
    expected_completion_date DATE,
    actual_completion_date DATE,
    status VARCHAR(20) DEFAULT 'PLANNING',
    overall_progress DECIMAL(5,2) DEFAULT 0,
    budget_allocated DECIMAL(15,2) DEFAULT 0,
    budget_spent DECIMAL(15,2) DEFAULT 0,
    project_manager_id UUID REFERENCES employees(id),
    description TEXT,
    location TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID
);

CREATE TABLE IF NOT EXISTS construction_progress_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES construction_projects(id) ON DELETE CASCADE,
    progress_date DATE NOT NULL,
    progress_percentage DECIMAL(5,2) NOT NULL,
    status VARCHAR(50),
    notes TEXT,
    attachments TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID
);

CREATE TABLE IF NOT EXISTS construction_tower_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES construction_projects(id) ON DELETE CASCADE,
    tower_id UUID REFERENCES towers(id),
    progress_date DATE NOT NULL,
    structural_progress DECIMAL(5,2) DEFAULT 0,
    finishing_progress DECIMAL(5,2) DEFAULT 0,
    m_e_progress DECIMAL(5,2) DEFAULT 0,
    overall_progress DECIMAL(5,2) DEFAULT 0,
    status VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS construction_flat_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES construction_projects(id) ON DELETE CASCADE,
    flat_id UUID REFERENCES flats(id),
    progress_date DATE NOT NULL,
    stage VARCHAR(100),
    progress_percentage DECIMAL(5,2) DEFAULT 0,
    status VARCHAR(50),
    issues TEXT,
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS construction_teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES construction_projects(id) ON DELETE CASCADE,
    team_name VARCHAR(200) NOT NULL,
    team_lead UUID REFERENCES employees(id),
    members UUID[],
    responsibilities TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS construction_project_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES construction_projects(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES employees(id),
    role VARCHAR(100),
    start_date DATE,
    end_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS construction_development_updates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES construction_projects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    update_date DATE NOT NULL,
    status VARCHAR(50),
    attachments TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- MARKETING
-- ============================================================================

CREATE TABLE IF NOT EXISTS campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    channel VARCHAR(100),
    budget DECIMAL(15,2),
    start_date DATE,
    end_date DATE,
    target_audience JSONB,
    leads_generated INT DEFAULT 0,
    conversions INT DEFAULT 0,
    revenue_generated DECIMAL(15,2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'PLANNED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID
);

-- ============================================================================
-- NOTIFICATIONS / CHAT / ACCOUNTING / TELEPHONY
-- ============================================================================

-- Notifications table (targets, categories, status)
\i backend/create-notifications-table.sql

-- Chat system (groups, participants, messages, attachments, reactions)
\i backend/create-chat-tables.sql

-- Accounting (accounts, journals, budgets, expenses, fiscal years, views, triggers)
\i backend/accounting-complete-schema.sql

-- Telephony (schema telephony.*, IVR, recordings, AI insights)
\i backend/database-telephony-schema.sql

-- ============================================================================
-- INDEXES (common lookups)
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_roles_name ON roles(name);
CREATE INDEX IF NOT EXISTS idx_permissions_module_action ON permissions(module, action);
CREATE INDEX IF NOT EXISTS idx_properties_code ON properties(property_code);
CREATE INDEX IF NOT EXISTS idx_flats_property ON flats(property_id);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_leads_phone ON leads(phone_number);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_payments_booking ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_materials_code ON materials(material_code);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_vendor ON purchase_orders(vendor_id);

-- ============================================================================
-- SUCCESS SUMMARY
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Database schema created/updated for Eastern Estate ERP.';
END $$;
