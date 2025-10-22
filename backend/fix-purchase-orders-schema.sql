-- =====================================================
-- FIX PURCHASE ORDERS TABLE SCHEMA
-- Aligns purchase_orders table with PurchaseOrder entity
-- =====================================================

BEGIN;

-- Drop the old purchase_orders table if it has wrong structure
-- and recreate it with correct structure matching the entity

DROP TABLE IF EXISTS purchase_orders CASCADE;

CREATE TABLE purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  po_number VARCHAR(50) UNIQUE NOT NULL,
  po_date DATE NOT NULL,
  vendor_id UUID NOT NULL REFERENCES vendors(id),
  property_id UUID REFERENCES properties(id),
  construction_project_id UUID REFERENCES construction_projects(id),
  status VARCHAR(50) DEFAULT 'DRAFT',
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
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id)
);

-- Create indexes for better performance
CREATE INDEX idx_po_vendor ON purchase_orders(vendor_id);
CREATE INDEX idx_po_property ON purchase_orders(property_id);
CREATE INDEX idx_po_project ON purchase_orders(construction_project_id);
CREATE INDEX idx_po_status ON purchase_orders(status);
CREATE INDEX idx_po_date ON purchase_orders(po_date);

COMMIT;

SELECT 'Purchase Orders table schema fixed successfully!' as message;
