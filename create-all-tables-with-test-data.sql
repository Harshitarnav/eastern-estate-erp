-- =====================================================
-- Eastern Estate ERP - Complete Database Setup with Test Data
-- =====================================================
-- This script creates all tables and populates them with test data
-- Run this with: PGPASSWORD=your_secure_password_here psql -h localhost -U eastern_estate -d eastern_estate_erp -f create-all-tables-with-test-data.sql
-- =====================================================

BEGIN;

-- Drop existing tables if they exist (in correct order to handle foreign keys)
DROP TABLE IF EXISTS purchase_order_items CASCADE;
DROP TABLE IF EXISTS purchase_orders CASCADE;
DROP TABLE IF EXISTS inventory_items CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS construction_projects CASCADE;
DROP TABLE IF EXISTS campaigns CASCADE;
DROP TABLE IF EXISTS flats CASCADE;
DROP TABLE IF EXISTS properties CASCADE;
DROP TABLE IF EXISTS leads CASCADE;
DROP TABLE IF EXISTS customers CASCADE;

-- =====================================================
-- 1. CUSTOMERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_code VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone_number VARCHAR(20) NOT NULL,
    alternate_phone VARCHAR(20),
    date_of_birth DATE,
    gender VARCHAR(20),
    occupation VARCHAR(100),
    company_name VARCHAR(255),
    address_line1 TEXT,
    address_line2 TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(10),
    country VARCHAR(100) DEFAULT 'India',
    pan_number VARCHAR(20),
    aadhar_number VARCHAR(20),
    customer_type VARCHAR(50) DEFAULT 'INDIVIDUAL',
    lead_source VARCHAR(100),
    assigned_sales_person VARCHAR(255),
    credit_limit DECIMAL(15,2) DEFAULT 0,
    outstanding_balance DECIMAL(15,2) DEFAULT 0,
    total_bookings INTEGER DEFAULT 0,
    total_purchases DECIMAL(15,2) DEFAULT 0,
    kyc_status VARCHAR(50) DEFAULT 'PENDING',
    kyc_documents JSONB,
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_customers_code ON customers(customer_code);
CREATE INDEX idx_customers_phone ON customers(phone_number);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_active ON customers(is_active);

-- =====================================================
-- 2. LEADS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_code VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone_number VARCHAR(20) NOT NULL,
    alternate_phone VARCHAR(20),
    source VARCHAR(100),
    status VARCHAR(50) DEFAULT 'NEW',
    priority VARCHAR(20) DEFAULT 'MEDIUM',
    interested_in VARCHAR(255),
    budget_min DECIMAL(15,2),
    budget_max DECIMAL(15,2),
    timeline VARCHAR(100),
    assigned_to VARCHAR(255),
    address_line1 TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'India',
    notes TEXT,
    follow_up_date DATE,
    last_contact_date DATE,
    converted_to_customer BOOLEAN DEFAULT false,
    customer_id UUID REFERENCES customers(id),
    is_active BOOLEAN DEFAULT true,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_leads_code ON leads(lead_code);
CREATE INDEX idx_leads_phone ON leads(phone_number);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_active ON leads(is_active);

-- =====================================================
-- 3. PROPERTIES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    property_type VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'PLANNED',
    location TEXT NOT NULL,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(10),
    total_area DECIMAL(15,2),
    built_up_area DECIMAL(15,2),
    total_units INTEGER DEFAULT 0,
    available_units INTEGER DEFAULT 0,
    sold_units INTEGER DEFAULT 0,
    price_per_sqft DECIMAL(15,2),
    amenities TEXT[],
    description TEXT,
    rera_number VARCHAR(100),
    launch_date DATE,
    completion_date DATE,
    is_active BOOLEAN DEFAULT true,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_properties_code ON properties(property_code);
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_active ON properties(is_active);

-- =====================================================
-- 4. FLATS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS flats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES properties(id) NOT NULL,
    flat_number VARCHAR(50) NOT NULL,
    floor_number INTEGER,
    flat_type VARCHAR(100),
    bhk_type VARCHAR(20),
    carpet_area DECIMAL(15,2),
    built_up_area DECIMAL(15,2),
    super_built_up_area DECIMAL(15,2),
    base_price DECIMAL(15,2) NOT NULL,
    total_price DECIMAL(15,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'AVAILABLE',
    facing VARCHAR(50),
    balconies INTEGER DEFAULT 0,
    bathrooms INTEGER DEFAULT 0,
    is_corner_unit BOOLEAN DEFAULT false,
    parking_slots INTEGER DEFAULT 0,
    amenities TEXT[],
    is_active BOOLEAN DEFAULT true,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(property_id, flat_number)
);

CREATE INDEX idx_flats_property ON flats(property_id);
CREATE INDEX idx_flats_status ON flats(status);
CREATE INDEX idx_flats_active ON flats(is_active);

-- =====================================================
-- 5. BOOKINGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id UUID REFERENCES customers(id) NOT NULL,
    property_id UUID REFERENCES properties(id) NOT NULL,
    flat_id UUID REFERENCES flats(id),
    booking_date DATE NOT NULL,
    booking_amount DECIMAL(15,2) NOT NULL,
    total_amount DECIMAL(15,2) NOT NULL,
    paid_amount DECIMAL(15,2) DEFAULT 0,
    balance_amount DECIMAL(15,2),
    status VARCHAR(50) DEFAULT 'PENDING',
    payment_plan VARCHAR(100),
    possession_date DATE,
    agreement_date DATE,
    registry_date DATE,
    is_home_loan BOOLEAN DEFAULT false,
    bank_name VARCHAR(255),
    loan_amount DECIMAL(15,2),
    loan_status VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_bookings_number ON bookings(booking_number);
CREATE INDEX idx_bookings_customer ON bookings(customer_id);
CREATE INDEX idx_bookings_property ON bookings(property_id);
CREATE INDEX idx_bookings_status ON bookings(status);

-- =====================================================
-- 6. PAYMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_number VARCHAR(50) UNIQUE NOT NULL,
    booking_id UUID REFERENCES bookings(id),
    customer_id UUID REFERENCES customers(id) NOT NULL,
    payment_date DATE NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    payment_mode VARCHAR(50) NOT NULL,
    payment_type VARCHAR(50) NOT NULL,
    transaction_id VARCHAR(255),
    bank_name VARCHAR(255),
    cheque_number VARCHAR(100),
    cheque_date DATE,
    utr_number VARCHAR(100),
    payment_status VARCHAR(50) DEFAULT 'PENDING',
    receipt_number VARCHAR(100),
    receipt_date DATE,
    remarks TEXT,
    is_active BOOLEAN DEFAULT true,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payments_number ON payments(payment_number);
CREATE INDEX idx_payments_booking ON payments(booking_id);
CREATE INDEX idx_payments_customer ON payments(customer_id);
CREATE INDEX idx_payments_status ON payments(payment_status);

-- =====================================================
-- 7. INVENTORY ITEMS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS inventory_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_code VARCHAR(50) UNIQUE NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    brand VARCHAR(100),
    model VARCHAR(100),
    quantity DECIMAL(15,2) NOT NULL DEFAULT 0,
    unit VARCHAR(50) NOT NULL,
    minimum_stock DECIMAL(15,2) DEFAULT 0,
    maximum_stock DECIMAL(15,2),
    reorder_point DECIMAL(15,2),
    unit_price DECIMAL(15,2) NOT NULL,
    total_value DECIMAL(15,2),
    stock_status VARCHAR(50) DEFAULT 'IN_STOCK',
    supplier_name VARCHAR(255),
    supplier_email VARCHAR(255),
    supplier_phone VARCHAR(20),
    warehouse_location VARCHAR(255),
    rack_number VARCHAR(50),
    bin_number VARCHAR(50),
    last_purchase_date DATE,
    last_purchase_price DECIMAL(15,2),
    total_issued DECIMAL(15,2) DEFAULT 0,
    total_received DECIMAL(15,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_inventory_code ON inventory_items(item_code);
CREATE INDEX idx_inventory_category ON inventory_items(category);
CREATE INDEX idx_inventory_status ON inventory_items(stock_status);

-- =====================================================
-- 8. PURCHASE ORDERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS purchase_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    order_date DATE NOT NULL,
    supplier_name VARCHAR(255) NOT NULL,
    supplier_email VARCHAR(255),
    supplier_phone VARCHAR(20),
    supplier_address TEXT,
    order_status VARCHAR(50) DEFAULT 'DRAFT',
    payment_status VARCHAR(50) DEFAULT 'UNPAID',
    payment_terms VARCHAR(100),
    payment_due_date DATE,
    subtotal DECIMAL(15,2) NOT NULL,
    discount_amount DECIMAL(15,2) DEFAULT 0,
    tax_amount DECIMAL(15,2) DEFAULT 0,
    shipping_cost DECIMAL(15,2) DEFAULT 0,
    total_amount DECIMAL(15,2) NOT NULL,
    paid_amount DECIMAL(15,2) DEFAULT 0,
    balance_amount DECIMAL(15,2),
    expected_delivery_date DATE,
    actual_delivery_date DATE,
    total_items_ordered INTEGER DEFAULT 0,
    total_items_received INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_po_number ON purchase_orders(order_number);
CREATE INDEX idx_po_status ON purchase_orders(order_status);
CREATE INDEX idx_po_payment_status ON purchase_orders(payment_status);

-- =====================================================
-- 9. CONSTRUCTION PROJECTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS construction_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_code VARCHAR(50) UNIQUE NOT NULL,
    project_name VARCHAR(255) NOT NULL,
    property_id UUID REFERENCES properties(id),
    project_type VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'PLANNED',
    start_date DATE,
    estimated_end_date DATE,
    actual_end_date DATE,
    estimated_budget DECIMAL(15,2),
    actual_cost DECIMAL(15,2) DEFAULT 0,
    contractor_name VARCHAR(255),
    contractor_contact VARCHAR(20),
    site_engineer VARCHAR(255),
    project_manager VARCHAR(255),
    completion_percentage DECIMAL(5,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_construction_code ON construction_projects(project_code);
CREATE INDEX idx_construction_status ON construction_projects(status);
CREATE INDEX idx_construction_property ON construction_projects(property_id);

-- =====================================================
-- 10. MARKETING CAMPAIGNS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_code VARCHAR(50) UNIQUE NOT NULL,
    campaign_name VARCHAR(255) NOT NULL,
    campaign_type VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'DRAFT',
    start_date DATE,
    end_date DATE,
    budget DECIMAL(15,2),
    actual_cost DECIMAL(15,2) DEFAULT 0,
    target_audience TEXT,
    channel VARCHAR(100),
    leads_generated INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    roi DECIMAL(10,2),
    is_active BOOLEAN DEFAULT true,
    description TEXT,
    notes TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_campaigns_code ON campaigns(campaign_code);
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_type ON campaigns(campaign_type);

-- =====================================================
-- INSERT TEST DATA
-- =====================================================

-- Test Customers
INSERT INTO customers (customer_code, full_name, email, phone_number, city, state, customer_type, credit_limit) VALUES
('CUST-001', 'Rajesh Kumar', 'rajesh.kumar@email.com', '9876543210', 'Mumbai', 'Maharashtra', 'INDIVIDUAL', 5000000),
('CUST-002', 'Priya Sharma', 'priya.sharma@email.com', '9876543211', 'Delhi', 'Delhi', 'INDIVIDUAL', 3000000),
('CUST-003', 'Amit Patel', 'amit.patel@email.com', '9876543212', 'Ahmedabad', 'Gujarat', 'INDIVIDUAL', 4000000);

-- Test Leads
INSERT INTO leads (lead_code, full_name, email, phone_number, source, status, priority, interested_in, budget_min, budget_max, assigned_to) VALUES
('LEAD-001', 'Sunita Reddy', 'sunita.reddy@email.com', '9876543220', 'WEBSITE', 'NEW', 'HIGH', '2 BHK Flat', 3000000, 4000000, 'Sales Team'),
('LEAD-002', 'Vikram Singh', 'vikram.singh@email.com', '9876543221', 'REFERRAL', 'CONTACTED', 'MEDIUM', '3 BHK Flat', 5000000, 6000000, 'Sales Team'),
('LEAD-003', 'Anjali Gupta', 'anjali.gupta@email.com', '9876543222', 'SOCIAL_MEDIA', 'QUALIFIED', 'HIGH', 'Villa', 8000000, 10000000, 'Sales Team');

-- Test Properties
INSERT INTO properties (property_code, name, property_type, status, location, city, state, total_area, total_units, available_units, price_per_sqft, launch_date) VALUES
('PROP-001', 'Eastern Heights', 'RESIDENTIAL', 'UNDER_CONSTRUCTION', 'Andheri West', 'Mumbai', 'Maharashtra', 50000, 100, 75, 15000, '2024-01-15'),
('PROP-002', 'Green Valley Homes', 'RESIDENTIAL', 'COMPLETED', 'Whitefield', 'Bangalore', 'Karnataka', 75000, 150, 50, 12000, '2023-06-01'),
('PROP-003', 'Sunrise Villas', 'RESIDENTIAL', 'PLANNED', 'Gachibowli', 'Hyderabad', 'Telangana', 100000, 80, 80, 18000, '2025-03-01');

-- Test Flats
INSERT INTO flats (property_id, flat_number, floor_number, flat_type, bhk_type, carpet_area, built_up_area, base_price, total_price, status, facing) VALUES
((SELECT id FROM properties WHERE property_code = 'PROP-001'), '101', 1, '2BHK', '2', 850, 1000, 3500000, 3800000, 'AVAILABLE', 'EAST'),
((SELECT id FROM properties WHERE property_code = 'PROP-001'), '201', 2, '3BHK', '3', 1200, 1400, 5000000, 5500000, 'AVAILABLE', 'NORTH'),
((SELECT id FROM properties WHERE property_code = 'PROP-002'), '301', 3, '2BHK', '2', 900, 1050, 3200000, 3500000, 'BOOKED', 'SOUTH');

-- Test Bookings
INSERT INTO bookings (booking_number, customer_id, property_id, flat_id, booking_date, booking_amount, total_amount, paid_amount, balance_amount, status) VALUES
('BOOK-001', 
 (SELECT id FROM customers WHERE customer_code = 'CUST-001'),
 (SELECT id FROM properties WHERE property_code = 'PROP-001'),
 (SELECT id FROM flats WHERE flat_number = '101'),
 '2025-01-15', 500000, 3800000, 500000, 3300000, 'CONFIRMED');

-- Test Payments
INSERT INTO payments (payment_number, booking_id, customer_id, payment_date, amount, payment_mode, payment_type, payment_status, receipt_number) VALUES
('PAY-001',
 (SELECT id FROM bookings WHERE booking_number = 'BOOK-001'),
 (SELECT id FROM customers WHERE customer_code = 'CUST-001'),
 '2025-01-15', 500000, 'CHEQUE', 'BOOKING', 'COMPLETED', 'RCP-001');

-- Test Inventory Items
INSERT INTO inventory_items (item_code, item_name, category, quantity, unit, unit_price, total_value, stock_status, supplier_name) VALUES
('INV-001', 'Portland Cement - OPC 53', 'CONSTRUCTION_MATERIAL', 500, 'BAG', 350, 175000, 'IN_STOCK', 'ABC Cement Suppliers'),
('INV-002', 'Steel TMT Bars - 12mm', 'CONSTRUCTION_MATERIAL', 10000, 'KG', 65, 650000, 'IN_STOCK', 'Steel Corporation Ltd'),
('INV-003', 'Ceramic Floor Tiles', 'TILES', 2000, 'SQ_METER', 450, 900000, 'IN_STOCK', 'Tile World');

-- Test Purchase Orders
INSERT INTO purchase_orders (order_number, order_date, supplier_name, supplier_phone, order_status, payment_status, subtotal, total_amount, total_items_ordered) VALUES
('PO-001', '2025-01-10', 'ABC Cement Suppliers', '9876500001', 'APPROVED', 'PARTIALLY_PAID', 175000, 189000, 500),
('PO-002', '2025-01-12', 'Steel Corporation Ltd', '9876500002', 'ORDERED', 'UNPAID', 650000, 702000, 10000);

-- Test Construction Projects
INSERT INTO construction_projects (project_code, project_name, property_id, project_type, status, start_date, estimated_end_date, estimated_budget, contractor_name) VALUES
('CONST-001', 'Eastern Heights - Phase 1', 
 (SELECT id FROM properties WHERE property_code = 'PROP-001'),
 'NEW_CONSTRUCTION', 'IN_PROGRESS', '2024-06-01', '2026-12-31', 150000000, 'BuildRight Contractors');

-- Test Marketing Campaigns
INSERT INTO campaigns (campaign_code, campaign_name, campaign_type, status, start_date, end_date, budget, channel, leads_generated) VALUES
('CAMP-001', 'Monsoon Sale 2025', 'SEASONAL', 'ACTIVE', '2025-06-01', '2025-08-31', 500000, 'DIGITAL', 45),
('CAMP-002', 'Festive Offers - Diwali', 'FESTIVE', 'PLANNED', '2025-10-15', '2025-11-15', 750000, 'MIXED', 0);

COMMIT;

SELECT 'Database setup completed successfully!' as message;
SELECT 'Test data inserted for all modules.' as message;
SELECT 'To delete test data later, run: DELETE FROM <table_name> WHERE created_at > ''2025-01-01'';' as message;
