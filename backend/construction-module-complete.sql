-- ============================================================================
-- CONSTRUCTION MODULE - COMPLETE DATABASE MIGRATION
-- ============================================================================
-- This migration creates all tables for the comprehensive construction module
-- including construction projects, materials, inventory, purchase orders, and vendors
-- ============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. MATERIALS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    material_code VARCHAR(50) UNIQUE NOT NULL,
    material_name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN (
        'CEMENT', 'STEEL', 'SAND', 'AGGREGATE', 'BRICKS', 'TILES', 
        'ELECTRICAL', 'PLUMBING', 'PAINT', 'HARDWARE', 'OTHER'
    )),
    unit_of_measurement VARCHAR(20) NOT NULL CHECK (unit_of_measurement IN (
        'KG', 'TONNE', 'BAG', 'PIECE', 'LITRE', 'CUBIC_METER', 
        'SQUARE_METER', 'BOX', 'SET'
    )),
    current_stock DECIMAL(15, 3) DEFAULT 0,
    minimum_stock_level DECIMAL(15, 3) DEFAULT 0,
    maximum_stock_level DECIMAL(15, 3) DEFAULT 0,
    unit_price DECIMAL(15, 2) DEFAULT 0,
    gst_percentage DECIMAL(5, 2) DEFAULT 0,
    specifications TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

CREATE INDEX idx_materials_code ON materials(material_code);
CREATE INDEX idx_materials_category ON materials(category);
CREATE INDEX idx_materials_active ON materials(is_active);

-- ============================================================================
-- 2. VENDORS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS vendors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_code VARCHAR(50) UNIQUE NOT NULL,
    vendor_name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    email VARCHAR(255),
    phone_number VARCHAR(20) NOT NULL,
    alternate_phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(10),
    gst_number VARCHAR(20),
    pan_number VARCHAR(20),
    bank_name VARCHAR(255),
    bank_account_number VARCHAR(50),
    ifsc_code VARCHAR(20),
    materials_supplied JSONB DEFAULT '[]',
    rating DECIMAL(3, 2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
    payment_terms VARCHAR(255),
    credit_limit DECIMAL(15, 2) DEFAULT 0,
    outstanding_amount DECIMAL(15, 2) DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

CREATE INDEX idx_vendors_code ON vendors(vendor_code);
CREATE INDEX idx_vendors_active ON vendors(is_active);
CREATE INDEX idx_vendors_name ON vendors(vendor_name);

-- ============================================================================
-- 3. PURCHASE ORDERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS purchase_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    po_number VARCHAR(50) UNIQUE NOT NULL,
    vendor_id UUID NOT NULL REFERENCES vendors(id),
    order_date DATE NOT NULL,
    expected_delivery_date DATE NOT NULL,
    actual_delivery_date DATE,
    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT' CHECK (status IN (
        'DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'SENT', 
        'PARTIALLY_RECEIVED', 'RECEIVED', 'CANCELLED'
    )),
    total_amount DECIMAL(15, 2) DEFAULT 0,
    gst_amount DECIMAL(15, 2) DEFAULT 0,
    grand_total DECIMAL(15, 2) DEFAULT 0,
    payment_terms VARCHAR(255),
    payment_status VARCHAR(20) DEFAULT 'PENDING' CHECK (payment_status IN (
        'PENDING', 'PARTIAL', 'PAID'
    )),
    approved_by UUID REFERENCES employees(id),
    created_by UUID NOT NULL REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_po_number ON purchase_orders(po_number);
CREATE INDEX idx_po_vendor ON purchase_orders(vendor_id);
CREATE INDEX idx_po_status ON purchase_orders(status);
CREATE INDEX idx_po_date ON purchase_orders(order_date);

-- ============================================================================
-- 4. PURCHASE ORDER ITEMS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS purchase_order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    material_id UUID NOT NULL REFERENCES materials(id),
    quantity_ordered DECIMAL(15, 3) NOT NULL,
    quantity_received DECIMAL(15, 3) DEFAULT 0,
    unit_price DECIMAL(15, 2) NOT NULL,
    gst_percentage DECIMAL(5, 2) DEFAULT 0,
    total_price DECIMAL(15, 2) NOT NULL,
    specifications TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_po_items_po ON purchase_order_items(purchase_order_id);
CREATE INDEX idx_po_items_material ON purchase_order_items(material_id);

-- ============================================================================
-- 5. MATERIAL ENTRIES TABLE (Store Inward)
-- ============================================================================
CREATE TABLE IF NOT EXISTS material_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    material_id UUID NOT NULL REFERENCES materials(id),
    entry_type VARCHAR(20) NOT NULL CHECK (entry_type IN (
        'PURCHASE', 'RETURN', 'ADJUSTMENT'
    )),
    quantity DECIMAL(15, 3) NOT NULL,
    unit_price DECIMAL(15, 2) NOT NULL,
    total_value DECIMAL(15, 2) NOT NULL,
    vendor_id UUID REFERENCES vendors(id),
    purchase_order_id UUID REFERENCES purchase_orders(id),
    entry_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    entered_by UUID NOT NULL REFERENCES users(id),
    invoice_number VARCHAR(100),
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_material_entries_material ON material_entries(material_id);
CREATE INDEX idx_material_entries_vendor ON material_entries(vendor_id);
CREATE INDEX idx_material_entries_date ON material_entries(entry_date);
CREATE INDEX idx_material_entries_po ON material_entries(purchase_order_id);

-- ============================================================================
-- 6. CONSTRUCTION PROJECTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS construction_projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL REFERENCES properties(id),
    tower_id UUID REFERENCES towers(id),
    flat_id UUID REFERENCES flats(id),
    project_name VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    expected_completion_date DATE NOT NULL,
    actual_completion_date DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'PLANNING' CHECK (status IN (
        'PLANNING', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED'
    )),
    overall_progress DECIMAL(5, 2) DEFAULT 0 CHECK (overall_progress >= 0 AND overall_progress <= 100),
    budget_allocated DECIMAL(15, 2) DEFAULT 0,
    budget_spent DECIMAL(15, 2) DEFAULT 0,
    project_manager_id UUID REFERENCES employees(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

CREATE INDEX idx_construction_property ON construction_projects(property_id);
CREATE INDEX idx_construction_tower ON construction_projects(tower_id);
CREATE INDEX idx_construction_flat ON construction_projects(flat_id);
CREATE INDEX idx_construction_status ON construction_projects(status);
CREATE INDEX idx_construction_manager ON construction_projects(project_manager_id);

-- ============================================================================
-- 7. MATERIAL EXITS TABLE (Store Outward)
-- ============================================================================
CREATE TABLE IF NOT EXISTS material_exits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    material_id UUID NOT NULL REFERENCES materials(id),
    construction_project_id UUID REFERENCES construction_projects(id),
    quantity DECIMAL(15, 3) NOT NULL,
    purpose TEXT NOT NULL,
    issued_to UUID NOT NULL REFERENCES employees(id),
    approved_by UUID REFERENCES employees(id),
    exit_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    return_expected BOOLEAN DEFAULT FALSE,
    return_date TIMESTAMP,
    return_quantity DECIMAL(15, 3),
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_material_exits_material ON material_exits(material_id);
CREATE INDEX idx_material_exits_project ON material_exits(construction_project_id);
CREATE INDEX idx_material_exits_issued_to ON material_exits(issued_to);
CREATE INDEX idx_material_exits_date ON material_exits(exit_date);

-- ============================================================================
-- 8. DAILY PROGRESS REPORTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS daily_progress_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    construction_project_id UUID NOT NULL REFERENCES construction_projects(id) ON DELETE CASCADE,
    report_date DATE NOT NULL,
    reported_by UUID NOT NULL REFERENCES employees(id),
    work_completed TEXT NOT NULL,
    work_planned_for_next_day TEXT,
    progress_percentage DECIMAL(5, 2) DEFAULT 0,
    workers_present INTEGER DEFAULT 0,
    workers_absent INTEGER DEFAULT 0,
    weather_conditions VARCHAR(100),
    photos JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(construction_project_id, report_date)
);

CREATE INDEX idx_progress_project ON daily_progress_reports(construction_project_id);
CREATE INDEX idx_progress_date ON daily_progress_reports(report_date);
CREATE INDEX idx_progress_reporter ON daily_progress_reports(reported_by);

-- ============================================================================
-- 9. PAIN POINTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS pain_points (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    construction_project_id UUID NOT NULL REFERENCES construction_projects(id) ON DELETE CASCADE,
    reported_by UUID NOT NULL REFERENCES employees(id),
    pain_point_type VARCHAR(30) NOT NULL CHECK (pain_point_type IN (
        'MATERIAL_SHORTAGE', 'LABOR_SHORTAGE', 'EQUIPMENT_ISSUE', 
        'DESIGN_ISSUE', 'WEATHER', 'OTHER'
    )),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN (
        'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
    )),
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN' CHECK (status IN (
        'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'
    )),
    reported_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_date TIMESTAMP,
    resolution_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_pain_points_project ON pain_points(construction_project_id);
CREATE INDEX idx_pain_points_status ON pain_points(status);
CREATE INDEX idx_pain_points_severity ON pain_points(severity);
CREATE INDEX idx_pain_points_type ON pain_points(pain_point_type);

-- ============================================================================
-- 10. MATERIAL SHORTAGES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS material_shortages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    construction_project_id UUID NOT NULL REFERENCES construction_projects(id) ON DELETE CASCADE,
    material_id UUID NOT NULL REFERENCES materials(id),
    quantity_required DECIMAL(15, 3) NOT NULL,
    quantity_available DECIMAL(15, 3) DEFAULT 0,
    shortage_quantity DECIMAL(15, 3) NOT NULL,
    required_by_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN (
        'PENDING', 'PO_RAISED', 'IN_TRANSIT', 'DELIVERED', 'RESOLVED'
    )),
    priority VARCHAR(10) NOT NULL CHECK (priority IN (
        'LOW', 'MEDIUM', 'HIGH', 'URGENT'
    )),
    impact_on_schedule TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_shortages_project ON material_shortages(construction_project_id);
CREATE INDEX idx_shortages_material ON material_shortages(material_id);
CREATE INDEX idx_shortages_status ON material_shortages(status);
CREATE INDEX idx_shortages_priority ON material_shortages(priority);

-- ============================================================================
-- 11. WORK SCHEDULES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS work_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    construction_project_id UUID NOT NULL REFERENCES construction_projects(id) ON DELETE CASCADE,
    task_name VARCHAR(255) NOT NULL,
    task_description TEXT,
    assigned_to UUID NOT NULL REFERENCES employees(id),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'NOT_STARTED' CHECK (status IN (
        'NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'DELAYED', 'CANCELLED'
    )),
    dependencies JSONB DEFAULT '[]',
    progress_percentage DECIMAL(5, 2) DEFAULT 0,
    actual_start_date DATE,
    actual_end_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_schedules_project ON work_schedules(construction_project_id);
CREATE INDEX idx_schedules_assigned ON work_schedules(assigned_to);
CREATE INDEX idx_schedules_status ON work_schedules(status);
CREATE INDEX idx_schedules_dates ON work_schedules(start_date, end_date);

-- ============================================================================
-- 12. VENDOR PAYMENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS vendor_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID NOT NULL REFERENCES vendors(id),
    purchase_order_id UUID REFERENCES purchase_orders(id),
    payment_date DATE NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    payment_mode VARCHAR(20) NOT NULL CHECK (payment_mode IN (
        'CASH', 'CHEQUE', 'NEFT', 'RTGS', 'UPI'
    )),
    transaction_reference VARCHAR(100),
    notes TEXT,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_vendor_payments_vendor ON vendor_payments(vendor_id);
CREATE INDEX idx_vendor_payments_po ON vendor_payments(purchase_order_id);
CREATE INDEX idx_vendor_payments_date ON vendor_payments(payment_date);

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for all tables
CREATE TRIGGER update_materials_updated_at BEFORE UPDATE ON materials
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON vendors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_purchase_orders_updated_at BEFORE UPDATE ON purchase_orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_purchase_order_items_updated_at BEFORE UPDATE ON purchase_order_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_material_entries_updated_at BEFORE UPDATE ON material_entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_construction_projects_updated_at BEFORE UPDATE ON construction_projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_material_exits_updated_at BEFORE UPDATE ON material_exits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_progress_reports_updated_at BEFORE UPDATE ON daily_progress_reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pain_points_updated_at BEFORE UPDATE ON pain_points
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_material_shortages_updated_at BEFORE UPDATE ON material_shortages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_work_schedules_updated_at BEFORE UPDATE ON work_schedules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendor_payments_updated_at BEFORE UPDATE ON vendor_payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

SELECT 'Construction module tables created successfully!' as status;

-- Verify table counts
SELECT 
    COUNT(*) FILTER (WHERE tablename = 'materials') as materials_table,
    COUNT(*) FILTER (WHERE tablename = 'vendors') as vendors_table,
    COUNT(*) FILTER (WHERE tablename = 'purchase_orders') as purchase_orders_table,
    COUNT(*) FILTER (WHERE tablename = 'purchase_order_items') as po_items_table,
    COUNT(*) FILTER (WHERE tablename = 'material_entries') as entries_table,
    COUNT(*) FILTER (WHERE tablename = 'material_exits') as exits_table,
    COUNT(*) FILTER (WHERE tablename = 'construction_projects') as projects_table,
    COUNT(*) FILTER (WHERE tablename = 'daily_progress_reports') as reports_table,
    COUNT(*) FILTER (WHERE tablename = 'pain_points') as pain_points_table,
    COUNT(*) FILTER (WHERE tablename = 'material_shortages') as shortages_table,
    COUNT(*) FILTER (WHERE tablename = 'work_schedules') as schedules_table,
    COUNT(*) FILTER (WHERE tablename = 'vendor_payments') as payments_table
FROM pg_tables 
WHERE schemaname = 'public';
