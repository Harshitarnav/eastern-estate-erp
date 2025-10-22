-- Construction Projects & Purchase Orders Module
-- Complete database schema for construction management

-- =====================================================
-- ENUMS
-- =====================================================

-- Construction project phases
CREATE TYPE construction_project_phase AS ENUM (
  'PLANNING',
  'EXCAVATION',
  'FOUNDATION',
  'STRUCTURE',
  'FINISHING',
  'COMPLETE'
);

-- Construction project status
CREATE TYPE construction_project_status AS ENUM (
  'ACTIVE',
  'ON_HOLD',
  'DELAYED',
  'COMPLETED',
  'CANCELLED'
);

-- Purchase order status
CREATE TYPE purchase_order_status AS ENUM (
  'DRAFT',
  'PENDING_APPROVAL',
  'APPROVED',
  'ORDERED',
  'PARTIALLY_RECEIVED',
  'RECEIVED',
  'CANCELLED'
);

-- Team type
CREATE TYPE team_type AS ENUM (
  'CONTRACTOR',
  'IN_HOUSE',
  'LABOR'
);

-- Progress type
CREATE TYPE progress_type AS ENUM (
  'STRUCTURE',
  'INTERIOR',
  'FINISHING',
  'QUALITY_CHECK'
);

-- =====================================================
-- CONSTRUCTION PROJECTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS construction_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  tower_id UUID REFERENCES towers(id) ON DELETE SET NULL,
  
  -- Project identifiers
  project_code VARCHAR(50) UNIQUE NOT NULL,
  project_name VARCHAR(255) NOT NULL,
  
  -- Project timeline
  project_phase construction_project_phase DEFAULT 'PLANNING',
  start_date DATE,
  expected_completion_date DATE,
  actual_completion_date DATE,
  
  -- Progress tracking (percentages)
  overall_progress NUMERIC(5,2) DEFAULT 0 CHECK (overall_progress >= 0 AND overall_progress <= 100),
  structure_progress NUMERIC(5,2) DEFAULT 0 CHECK (structure_progress >= 0 AND structure_progress <= 100),
  interior_progress NUMERIC(5,2) DEFAULT 0 CHECK (interior_progress >= 0 AND interior_progress <= 100),
  finishing_progress NUMERIC(5,2) DEFAULT 0 CHECK (finishing_progress >= 0 AND finishing_progress <= 100),
  
  -- Team & Management
  site_engineer_id UUID REFERENCES employees(id) ON DELETE SET NULL,
  contractor_name VARCHAR(255),
  contractor_contact VARCHAR(20),
  
  -- Status & Budget
  status construction_project_status DEFAULT 'ACTIVE',
  budget_allocated NUMERIC(15,2) DEFAULT 0,
  budget_spent NUMERIC(15,2) DEFAULT 0,
  
  -- Additional info
  notes TEXT,
  issues TEXT[],
  
  -- Audit fields
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- =====================================================
-- CONSTRUCTION TEAMS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS construction_teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Team identifiers
  team_name VARCHAR(255) NOT NULL,
  team_code VARCHAR(50) UNIQUE,
  team_type team_type NOT NULL,
  
  -- Assignment
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  construction_project_id UUID REFERENCES construction_projects(id) ON DELETE SET NULL,
  
  -- Team details
  leader_name VARCHAR(255) NOT NULL,
  contact_number VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  
  -- Members
  total_members INTEGER DEFAULT 0,
  active_members INTEGER DEFAULT 0,
  
  -- Specialization
  specialization VARCHAR(255),
  skills TEXT[],
  
  -- Contract details
  contract_start_date DATE,
  contract_end_date DATE,
  daily_rate NUMERIC(10,2),
  
  -- Audit fields
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- CONSTRUCTION PROGRESS LOGS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS construction_progress_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- References
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  tower_id UUID REFERENCES towers(id) ON DELETE SET NULL,
  construction_project_id UUID REFERENCES construction_projects(id) ON DELETE SET NULL,
  
  -- Log details
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  progress_type progress_type NOT NULL,
  description TEXT NOT NULL,
  progress_percentage NUMERIC(5,2) CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  
  -- Media
  photos JSONB DEFAULT '[]',
  
  -- Weather & Conditions
  weather_condition VARCHAR(100),
  temperature NUMERIC(5,2),
  
  -- Logged by
  logged_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Audit
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- PURCHASE ORDERS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS purchase_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- PO identifiers
  po_number VARCHAR(50) UNIQUE NOT NULL,
  po_date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- Vendor
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE RESTRICT,
  
  -- Project reference
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  construction_project_id UUID REFERENCES construction_projects(id) ON DELETE SET NULL,
  
  -- Status & Workflow
  status purchase_order_status DEFAULT 'DRAFT',
  
  -- Dates
  expected_delivery_date DATE,
  actual_delivery_date DATE,
  
  -- Financial
  subtotal NUMERIC(15,2) DEFAULT 0,
  tax_amount NUMERIC(15,2) DEFAULT 0,
  discount_amount NUMERIC(15,2) DEFAULT 0,
  total_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
  
  -- Payment
  payment_terms VARCHAR(255),
  advance_paid NUMERIC(15,2) DEFAULT 0,
  balance_amount NUMERIC(15,2) DEFAULT 0,
  
  -- Approval
  approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  approved_at TIMESTAMP,
  
  -- Delivery
  delivery_address TEXT,
  delivery_contact VARCHAR(255),
  delivery_phone VARCHAR(20),
  
  -- Notes
  notes TEXT,
  terms_and_conditions TEXT,
  
  -- Audit
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- =====================================================
-- PURCHASE ORDER ITEMS TABLE (Already exists, updating)
-- =====================================================

-- Drop existing if needed and recreate
DROP TABLE IF EXISTS purchase_order_items CASCADE;

CREATE TABLE purchase_order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- References
  purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  material_id UUID NOT NULL REFERENCES materials(id) ON DELETE RESTRICT,
  
  -- Quantities
  quantity NUMERIC(15,3) NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(15,2) NOT NULL CHECK (unit_price >= 0),
  
  -- Amounts
  subtotal NUMERIC(15,2) NOT NULL,
  tax_percentage NUMERIC(5,2) DEFAULT 0,
  tax_amount NUMERIC(15,2) DEFAULT 0,
  discount_percentage NUMERIC(5,2) DEFAULT 0,
  discount_amount NUMERIC(15,2) DEFAULT 0,
  total_amount NUMERIC(15,2) NOT NULL,
  
  -- Delivery tracking
  quantity_received NUMERIC(15,3) DEFAULT 0,
  quantity_pending NUMERIC(15,3) DEFAULT 0,
  
  -- Notes
  notes TEXT,
  
  -- Audit
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Construction Projects
CREATE INDEX idx_construction_projects_property ON construction_projects(property_id);
CREATE INDEX idx_construction_projects_tower ON construction_projects(tower_id);
CREATE INDEX idx_construction_projects_status ON construction_projects(status);
CREATE INDEX idx_construction_projects_phase ON construction_projects(project_phase);
CREATE INDEX idx_construction_projects_active ON construction_projects(is_active);

-- Construction Teams
CREATE INDEX idx_construction_teams_property ON construction_teams(property_id);
CREATE INDEX idx_construction_teams_project ON construction_teams(construction_project_id);
CREATE INDEX idx_construction_teams_type ON construction_teams(team_type);
CREATE INDEX idx_construction_teams_active ON construction_teams(is_active);

-- Construction Progress Logs
CREATE INDEX idx_progress_logs_property ON construction_progress_logs(property_id);
CREATE INDEX idx_progress_logs_tower ON construction_progress_logs(tower_id);
CREATE INDEX idx_progress_logs_project ON construction_progress_logs(construction_project_id);
CREATE INDEX idx_progress_logs_date ON construction_progress_logs(log_date);

-- Purchase Orders
CREATE INDEX idx_purchase_orders_vendor ON purchase_orders(vendor_id);
CREATE INDEX idx_purchase_orders_property ON purchase_orders(property_id);
CREATE INDEX idx_purchase_orders_project ON purchase_orders(construction_project_id);
CREATE INDEX idx_purchase_orders_status ON purchase_orders(status);
CREATE INDEX idx_purchase_orders_date ON purchase_orders(po_date);
CREATE INDEX idx_purchase_orders_active ON purchase_orders(is_active);

-- Purchase Order Items
CREATE INDEX idx_po_items_po ON purchase_order_items(purchase_order_id);
CREATE INDEX idx_po_items_material ON purchase_order_items(material_id);

-- =====================================================
-- TRIGGERS FOR AUTO-UPDATE
-- =====================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_construction_projects_updated_at
    BEFORE UPDATE ON construction_projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_construction_teams_updated_at
    BEFORE UPDATE ON construction_teams
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_purchase_orders_updated_at
    BEFORE UPDATE ON purchase_orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_purchase_order_items_updated_at
    BEFORE UPDATE ON purchase_order_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Auto-generate PO number
CREATE OR REPLACE FUNCTION generate_po_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.po_number IS NULL OR NEW.po_number = '' THEN
    NEW.po_number := 'PO' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || LPAD(NEXTVAL('po_number_seq')::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE IF NOT EXISTS po_number_seq START 1;

CREATE TRIGGER generate_po_number_trigger
    BEFORE INSERT ON purchase_orders
    FOR EACH ROW
    EXECUTE FUNCTION generate_po_number();

-- Auto-generate project code
CREATE OR REPLACE FUNCTION generate_project_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.project_code IS NULL OR NEW.project_code = '' THEN
    NEW.project_code := 'CONS' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || LPAD(NEXTVAL('construction_project_code_seq')::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE IF NOT EXISTS construction_project_code_seq START 1;

CREATE TRIGGER generate_project_code_trigger
    BEFORE INSERT ON construction_projects
    FOR EACH ROW
    EXECUTE FUNCTION generate_project_code();

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE construction_projects IS 'Construction projects linked to properties and towers';
COMMENT ON TABLE construction_teams IS 'Teams working on construction sites';
COMMENT ON TABLE construction_progress_logs IS 'Daily progress logs with photos and updates';
COMMENT ON TABLE purchase_orders IS 'Purchase orders for materials from vendors';
COMMENT ON TABLE purchase_order_items IS 'Line items in purchase orders';

-- =====================================================
-- GRANT PERMISSIONS (adjust as needed)
-- =====================================================

-- Grant permissions to your application user
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_app_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_app_user;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE 'Construction Projects & Purchase Orders schema created successfully!';
  RAISE NOTICE 'Tables: construction_projects, construction_teams, construction_progress_logs, purchase_orders, purchase_order_items';
  RAISE NOTICE 'All triggers, indexes, and sequences configured.';
END $$;
