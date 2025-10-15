-- Eastern Estate ERP - FIXED Database Schema
-- PostgreSQL 16+
-- This version has all syntax errors corrected

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================
-- CORE TABLES
-- ============================================

-- Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    alternate_phone VARCHAR(20),
    date_of_birth DATE,
    gender VARCHAR(20),
    profile_image TEXT,
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    email_verified_at TIMESTAMP,
    last_login_at TIMESTAMP,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID
);

-- Roles
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    is_system BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Permissions
CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    module VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Role-Permission mapping
CREATE TABLE role_permissions (
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- User-Role mapping
CREATE TABLE user_roles (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_by UUID,
    PRIMARY KEY (user_id, role_id)
);

-- Refresh Tokens
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(500) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- PROPERTY MANAGEMENT
-- ============================================

-- Properties
CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(10) NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    total_area DECIMAL(15, 2),
    area_unit VARCHAR(20) DEFAULT 'sqft',
    launch_date DATE,
    expected_completion_date DATE,
    actual_completion_date DATE,
    rera_number VARCHAR(100),
    project_type VARCHAR(50),
    status VARCHAR(50) DEFAULT 'Active',
    images JSONB,
    documents JSONB,
    amenities JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID
);

-- Towers/Blocks
CREATE TABLE towers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    tower_code VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    total_floors INTEGER NOT NULL,
    flats_per_floor INTEGER,
    total_flats INTEGER,
    tower_size DECIMAL(15, 2),
    facing VARCHAR(50),
    position VARCHAR(100),
    has_lift BOOLEAN DEFAULT false,
    number_of_lifts INTEGER DEFAULT 0,
    lift_capacity INTEGER,
    has_stairs BOOLEAN DEFAULT true,
    number_of_stairs INTEGER DEFAULT 1,
    parking_type VARCHAR(50),
    parking_capacity INTEGER,
    has_gym BOOLEAN DEFAULT false,
    has_garden BOOLEAN DEFAULT false,
    has_security_alarm BOOLEAN DEFAULT false,
    has_fire_alarm BOOLEAN DEFAULT false,
    is_vastu_compliant BOOLEAN DEFAULT false,
    has_central_ac BOOLEAN DEFAULT false,
    has_intercom BOOLEAN DEFAULT false,
    layout_images JSONB,
    arial_view_images JSONB,
    amenities JSONB,
    surrounding_description TEXT,
    status VARCHAR(50) DEFAULT 'Active',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID,
    UNIQUE(property_id, tower_code)
);

-- Floors
CREATE TABLE floors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tower_id UUID REFERENCES towers(id) ON DELETE CASCADE,
    floor_number INTEGER NOT NULL,
    floor_name VARCHAR(100),
    total_flats INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tower_id, floor_number)
);

-- Flats/Units
CREATE TABLE flats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    tower_id UUID REFERENCES towers(id) ON DELETE CASCADE,
    floor_id UUID REFERENCES floors(id) ON DELETE CASCADE,
    flat_code VARCHAR(50) NOT NULL,
    flat_number VARCHAR(50) NOT NULL,
    flat_name VARCHAR(100),
    flat_type VARCHAR(50) NOT NULL,
    description TEXT,
    carpet_area DECIMAL(15, 2) NOT NULL,
    built_up_area DECIMAL(15, 2),
    super_built_up_area DECIMAL(15, 2),
    area_unit VARCHAR(20) DEFAULT 'sqft',
    base_rate_per_sqft DECIMAL(15, 2) NOT NULL,
    base_price DECIMAL(15, 2) NOT NULL,
    gst_amount DECIMAL(15, 2),
    registration_charges DECIMAL(15, 2),
    other_charges DECIMAL(15, 2),
    total_price DECIMAL(15, 2) NOT NULL,
    bedrooms INTEGER NOT NULL,
    bathrooms INTEGER NOT NULL,
    balconies INTEGER DEFAULT 0,
    has_study_room BOOLEAN DEFAULT false,
    has_servant_room BOOLEAN DEFAULT false,
    has_pooja_room BOOLEAN DEFAULT false,
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
    is_verified BOOLEAN DEFAULT false,
    verified_at TIMESTAMP,
    verified_by UUID,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID,
    UNIQUE(property_id, flat_code),
    UNIQUE(tower_id, flat_number)
);

-- Customers
CREATE TABLE customers (
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
    annual_income DECIMAL(15, 2),
    portal_user_id UUID,
    source VARCHAR(50),
    referred_by UUID,
    broker_id UUID,
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID
);

-- Leads
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_code VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20) NOT NULL,
    alternate_phone VARCHAR(20),
    interested_in VARCHAR(50),
    property_id UUID REFERENCES properties(id),
    preferred_flat_type VARCHAR(50),
    budget_min DECIMAL(15, 2),
    budget_max DECIMAL(15, 2),
    source VARCHAR(50) NOT NULL,
    source_details TEXT,
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),
    assigned_to UUID,
    assigned_at TIMESTAMP,
    lead_score INTEGER DEFAULT 0,
    lead_quality VARCHAR(50),
    status VARCHAR(50) DEFAULT 'New',
    sub_status VARCHAR(100),
    next_follow_up_date TIMESTAMP,
    last_contacted_at TIMESTAMP,
    converted_to_customer_id UUID,
    converted_at TIMESTAMP,
    lost_reason TEXT,
    lost_at TIMESTAMP,
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID
);

-- Bookings
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_code VARCHAR(50) UNIQUE NOT NULL,
    customer_id UUID REFERENCES customers(id) NOT NULL,
    flat_id UUID REFERENCES flats(id) NOT NULL,
    property_id UUID REFERENCES properties(id) NOT NULL,
    tower_id UUID REFERENCES towers(id) NOT NULL,
    booking_date DATE NOT NULL,
    booking_type VARCHAR(50) DEFAULT 'Direct',
    broker_id UUID,
    broker_commission_percentage DECIMAL(5, 2),
    broker_commission_amount DECIMAL(15, 2),
    flat_base_price DECIMAL(15, 2) NOT NULL,
    discount_amount DECIMAL(15, 2) DEFAULT 0,
    discount_reason TEXT,
    gst_amount DECIMAL(15, 2),
    registration_charges DECIMAL(15, 2),
    other_charges DECIMAL(15, 2),
    total_amount DECIMAL(15, 2) NOT NULL,
    payment_plan_type VARCHAR(50) NOT NULL,
    token_amount DECIMAL(15, 2) DEFAULT 0,
    token_received_date DATE,
    downpayment_percentage DECIMAL(5, 2),
    downpayment_amount DECIMAL(15, 2),
    agreement_date DATE,
    agreement_document TEXT,
    possession_date DATE,
    handover_date DATE,
    status VARCHAR(50) DEFAULT 'Token',
    cancellation_reason TEXT,
    cancellation_date DATE,
    cancellation_refund_amount DECIMAL(15, 2),
    sales_person_id UUID,
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID
);

-- Payments
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_code VARCHAR(50) UNIQUE NOT NULL,
    receipt_number VARCHAR(50) UNIQUE NOT NULL,
    booking_id UUID REFERENCES bookings(id) NOT NULL,
    customer_id UUID REFERENCES customers(id) NOT NULL,
    payment_schedule_id UUID,
    payment_date DATE NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    payment_mode VARCHAR(50) NOT NULL,
    transaction_id VARCHAR(200),
    cheque_number VARCHAR(100),
    cheque_date DATE,
    bank_name VARCHAR(200),
    branch_name VARCHAR(200),
    upi_id VARCHAR(100),
    card_last_4_digits VARCHAR(4),
    principal_amount DECIMAL(15, 2),
    gst_amount DECIMAL(15, 2),
    late_payment_charges DECIMAL(15, 2),
    adjustment_amount DECIMAL(15, 2),
    receipt_type VARCHAR(50) DEFAULT 'Money Receipt',
    receipt_document TEXT,
    invoice_document TEXT,
    status VARCHAR(50) DEFAULT 'Received',
    cleared_date DATE,
    bounce_reason TEXT,
    refund_reason TEXT,
    refund_date DATE,
    remarks TEXT,
    received_by UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID
);

-- Payment Schedules
CREATE TABLE payment_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    installment_number INTEGER NOT NULL,
    installment_type VARCHAR(50),
    description TEXT,
    due_date DATE NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    gst_amount DECIMAL(15, 2) DEFAULT 0,
    total_amount DECIMAL(15, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending',
    paid_amount DECIMAL(15, 2) DEFAULT 0,
    balance_amount DECIMAL(15, 2),
    paid_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(booking_id, installment_number)
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_is_active ON users(is_active);

CREATE INDEX idx_properties_property_code ON properties(property_code);
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_towers_property_id ON towers(property_id);
CREATE INDEX idx_towers_tower_code ON towers(tower_code);
CREATE INDEX idx_floors_tower_id ON floors(tower_id);

CREATE INDEX idx_flats_property_id ON flats(property_id);
CREATE INDEX idx_flats_tower_id ON flats(tower_id);
CREATE INDEX idx_flats_floor_id ON flats(floor_id);
CREATE INDEX idx_flats_status ON flats(status);
CREATE INDEX idx_flats_flat_code ON flats(flat_code);
CREATE INDEX idx_flats_flat_type ON flats(flat_type);

CREATE INDEX idx_customers_customer_code ON customers(customer_code);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_is_active ON customers(is_active);

CREATE INDEX idx_leads_lead_code ON leads(lead_code);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_assigned_to ON leads(assigned_to);
CREATE INDEX idx_leads_phone ON leads(phone);
CREATE INDEX idx_leads_source ON leads(source);
CREATE INDEX idx_leads_created_at ON leads(created_at);

CREATE INDEX idx_bookings_booking_code ON bookings(booking_code);
CREATE INDEX idx_bookings_customer_id ON bookings(customer_id);
CREATE INDEX idx_bookings_flat_id ON bookings(flat_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_booking_date ON bookings(booking_date);
CREATE INDEX idx_bookings_sales_person_id ON bookings(sales_person_id);

CREATE INDEX idx_payments_payment_code ON payments(payment_code);
CREATE INDEX idx_payments_receipt_number ON payments(receipt_number);
CREATE INDEX idx_payments_booking_id ON payments(booking_id);
CREATE INDEX idx_payments_customer_id ON payments(customer_id);
CREATE INDEX idx_payments_payment_date ON payments(payment_date);
CREATE INDEX idx_payments_status ON payments(status);

CREATE INDEX idx_payment_schedules_booking_id ON payment_schedules(booking_id);
CREATE INDEX idx_payment_schedules_status ON payment_schedules(status);
CREATE INDEX idx_payment_schedules_due_date ON payment_schedules(due_date);

-- ============================================
-- SEED DATA
-- ============================================

INSERT INTO roles (id, name, display_name, description, is_system) VALUES
(uuid_generate_v4(), 'super_admin', 'Super Administrator', 'Full system access', true),
(uuid_generate_v4(), 'admin', 'Administrator', 'Administrative access', true),
(uuid_generate_v4(), 'accountant', 'Accountant', 'Accounting and finance access', false),
(uuid_generate_v4(), 'sales_manager', 'Sales Manager', 'Sales team management', false),
(uuid_generate_v4(), 'sales_executive', 'Sales Executive', 'Sales operations', false),
(uuid_generate_v4(), 'marketing_manager', 'Marketing Manager', 'Marketing operations', false),
(uuid_generate_v4(), 'construction_manager', 'Construction Manager', 'Construction management', false),
(uuid_generate_v4(), 'store_keeper', 'Store Keeper', 'Store and inventory management', false),
(uuid_generate_v4(), 'hr_manager', 'HR Manager', 'HR operations', false),
(uuid_generate_v4(), 'customer', 'Customer', 'Customer portal access', true),
(uuid_generate_v4(), 'broker', 'Broker', 'Broker portal access', true);

INSERT INTO permissions (name, display_name, module) VALUES
('users.view', 'View Users', 'users'),
('users.create', 'Create Users', 'users'),
('users.update', 'Update Users', 'users'),
('users.delete', 'Delete Users', 'users'),
('properties.view', 'View Properties', 'properties'),
('properties.create', 'Create Properties', 'properties'),
('properties.update', 'Update Properties', 'properties'),
('properties.delete', 'Delete Properties', 'properties'),
('inventory.view', 'View Inventory', 'inventory'),
('inventory.update', 'Update Inventory', 'inventory'),
('leads.view', 'View Leads', 'sales'),
('leads.create', 'Create Leads', 'sales'),
('leads.update', 'Update Leads', 'sales'),
('bookings.view', 'View Bookings', 'sales'),
('bookings.create', 'Create Bookings', 'sales'),
('bookings.update', 'Update Bookings', 'sales'),
('payments.view', 'View Payments', 'payments'),
('payments.create', 'Create Payments', 'payments'),
('payments.update', 'Update Payments', 'payments'),
('reports.view', 'View Reports', 'reports'),
('reports.export', 'Export Reports', 'reports');

-- Success message
SELECT 'Database schema created successfully!' AS message,
       (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE') AS total_tables,
       (SELECT COUNT(*) FROM roles) AS total_roles,
       (SELECT COUNT(*) FROM permissions) AS total_permissions;