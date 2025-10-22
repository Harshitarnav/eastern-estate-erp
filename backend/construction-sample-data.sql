-- Sample Data for Construction Module
-- Run this after running the main construction-module-complete.sql

-- ============================================
-- MATERIALS SAMPLE DATA
-- ============================================

-- Insert sample materials
INSERT INTO materials (
    material_code, material_name, category, unit, 
    current_stock, minimum_stock_level, unit_price, 
    gst_percentage, description, is_active
) VALUES
-- Cement
('CEM-001', 'Cement - OPC 53', 'CEMENT', 'BAG', 500, 200, 450, 18, 'Ordinary Portland Cement 53 grade', true),
('CEM-002', 'Cement - PPC', 'CEMENT', 'BAG', 150, 200, 420, 18, 'Portland Pozzolana Cement', true),

-- Steel
('STL-001', 'TMT Steel 8mm', 'STEEL', 'TON', 5, 3, 65000, 18, '8mm TMT steel bars', true),
('STL-002', 'TMT Steel 12mm', 'STEEL', 'TON', 3, 2, 68000, 18, '12mm TMT steel bars', true),
('STL-003', 'TMT Steel 16mm', 'STEEL', 'TON', 2, 2, 70000, 18, '16mm TMT steel bars', true),

-- Sand
('SND-001', 'River Sand', 'SAND', 'CFT', 1000, 500, 45, 5, 'Fine quality river sand', true),
('SND-002', 'M-Sand', 'SAND', 'CFT', 800, 500, 40, 5, 'Manufactured sand', true),

-- Aggregates
('AGG-001', '20mm Aggregates', 'AGGREGATES', 'CFT', 600, 300, 55, 5, '20mm coarse aggregates', true),
('AGG-002', '10mm Aggregates', 'AGGREGATES', 'CFT', 400, 300, 50, 5, '10mm coarse aggregates', true),

-- Bricks
('BRK-001', 'Red Clay Bricks', 'BRICKS', 'PCS', 5000, 2000, 12, 12, 'Standard red clay bricks', true),
('BRK-002', 'Fly Ash Bricks', 'BRICKS', 'PCS', 3000, 2000, 8, 12, 'Eco-friendly fly ash bricks', true),

-- Paint
('PNT-001', 'Exterior Emulsion', 'PAINT', 'LTR', 200, 100, 450, 28, 'Weather proof exterior paint', true),
('PNT-002', 'Interior Emulsion', 'PAINT', 'LTR', 150, 100, 380, 28, 'Luxury interior emulsion', true),

-- Tiles
('TIL-001', 'Floor Tiles 2x2', 'TILES', 'BOX', 100, 50, 850, 28, 'Vitrified floor tiles', true),
('TIL-002', 'Wall Tiles 1x2', 'TILES', 'BOX', 80, 50, 650, 28, 'Ceramic wall tiles', true),

-- Electrical
('ELC-001', 'Copper Wire 2.5mm', 'ELECTRICAL', 'MTR', 500, 200, 45, 18, 'Single core copper wire', true),
('ELC-002', 'MCB 32A', 'ELECTRICAL', 'PCS', 50, 20, 280, 18, 'Miniature circuit breaker', true),

-- Plumbing
('PLB-001', 'PVC Pipe 4inch', 'PLUMBING', 'MTR', 200, 100, 180, 18, 'PVC drainage pipe', true),
('PLB-002', 'CPVC Pipe 1inch', 'PLUMBING', 'MTR', 300, 150, 95, 18, 'CPVC water supply pipe', true),

-- Hardware
('HRD-001', 'Door Hinges', 'HARDWARE', 'PCS', 100, 50, 45, 18, 'SS door hinges', true),
('HRD-002', 'Door Lock', 'HARDWARE', 'PCS', 30, 20, 850, 18, 'Premium door lock', true);

-- ============================================
-- VENDORS SAMPLE DATA
-- ============================================

INSERT INTO vendors (
    vendor_code, vendor_name, contact_person, email, phone,
    address, city, state, gst_number, pan_number,
    rating, total_order_value, outstanding_amount,
    payment_terms, is_active
) VALUES
('VEN-001', 'Ultratech Cement Suppliers', 'Rajesh Kumar', 'rajesh@ultratech.com', '9876543210',
 '123 Industrial Area', 'Bangalore', 'Karnataka', '29AAACU1234A1Z5', 'AAACU1234A',
 4.5, 2500000, 150000, 'Net 30 days', true),

('VEN-002', 'Steel World', 'Amit Sharma', 'amit@steelworld.com', '9876543211',
 '456 Steel Market', 'Bangalore', 'Karnataka', '29BBBST5678B2Z5', 'BBBST5678B',
 4.8, 5000000, 250000, 'Net 45 days', true),

('VEN-003', 'Prime Aggregates', 'Suresh Reddy', 'suresh@primeagg.com', '9876543212',
 '789 Mining Road', 'Bangalore', 'Karnataka', '29CCCPA9012C3Z5', 'CCCPA9012C',
 4.2, 1500000, 80000, 'Net 30 days', true),

('VEN-004', 'Quality Bricks Pvt Ltd', 'Venkat Rao', 'venkat@qbricks.com', '9876543213',
 '321 Brick Kiln Area', 'Bangalore', 'Karnataka', '29DDDQB3456D4Z5', 'DDDQB3456D',
 4.0, 800000, 40000, 'Net 21 days', true),

('VEN-005', 'Asian Paints Distributor', 'Prakash Jain', 'prakash@asianpaints.com', '9876543214',
 '654 Paint Street', 'Bangalore', 'Karnataka', '29EEEAP7890E5Z5', 'EEEAP7890E',
 4.7, 1200000, 60000, 'Net 30 days', true),

('VEN-006', 'Supreme Tiles & Sanitary', 'Mohan Das', 'mohan@supremetiles.com', '9876543215',
 '987 Tile Market', 'Bangalore', 'Karnataka', '29FFFST2345F6Z5', 'FFFST2345F',
 4.3, 1800000, 90000, 'Net 45 days', true),

('VEN-007', 'Electrical Solutions', 'Ravi Verma', 'ravi@elecsol.com', '9876543216',
 '147 Electronics Hub', 'Bangalore', 'Karnataka', '29GGGEL6789G7Z5', 'GGGEL6789G',
 4.1, 900000, 45000, 'Net 30 days', true),

('VEN-008', 'Plumbing Mart', 'Sanjay Gupta', 'sanjay@plumbmart.com', '9876543217',
 '258 Hardware Zone', 'Bangalore', 'Karnataka', '29HHHPM0123H8Z5', 'HHHPM0123H',
 4.4, 750000, 35000, 'Net 21 days', true);

-- ============================================
-- MATERIAL ENTRIES (Inward Stock)
-- ============================================

-- Get material and vendor IDs (these will be UUIDs in actual DB)
-- Note: You'll need to update these with actual UUIDs from your database

-- Sample entries for demonstration
-- In actual usage, replace 'material_id' and 'vendor_id' with actual UUIDs

INSERT INTO material_entries (
    material_id, vendor_id, quantity, unit_price, total_price,
    gst_amount, entry_date, invoice_number, remarks
)
SELECT 
    m.id as material_id,
    v.id as vendor_id,
    500 as quantity,
    450 as unit_price,
    225000 as total_price,
    40500 as gst_amount,
    CURRENT_DATE - INTERVAL '10 days' as entry_date,
    'INV-2025-001' as invoice_number,
    'Initial stock purchase' as remarks
FROM materials m, vendors v
WHERE m.material_code = 'CEM-001' AND v.vendor_code = 'VEN-001'
LIMIT 1;

-- Add more sample entries
INSERT INTO material_entries (
    material_id, vendor_id, quantity, unit_price, total_price,
    gst_amount, entry_date, invoice_number, remarks
)
SELECT 
    m.id, v.id, 5, 65000, 325000, 58500,
    CURRENT_DATE - INTERVAL '8 days', 'INV-2025-002', 'Steel delivery'
FROM materials m, vendors v
WHERE m.material_code = 'STL-001' AND v.vendor_code = 'VEN-002'
LIMIT 1;

-- ============================================
-- VENDOR PAYMENTS
-- ============================================

INSERT INTO vendor_payments (
    vendor_id, amount, payment_mode, payment_date,
    reference_number, remarks
)
SELECT 
    v.id, 100000, 'BANK_TRANSFER', CURRENT_DATE - INTERVAL '5 days',
    'TXN-2025-001', 'Partial payment for cement'
FROM vendors v
WHERE v.vendor_code = 'VEN-001'
LIMIT 1;

INSERT INTO vendor_payments (
    vendor_id, amount, payment_mode, payment_date,
    reference_number, remarks
)
SELECT 
    v.id, 200000, 'BANK_TRANSFER', CURRENT_DATE - INTERVAL '3 days',
    'TXN-2025-002', 'Advance payment for steel'
FROM vendors v
WHERE v.vendor_code = 'VEN-002'
LIMIT 1;

-- ============================================
-- PRINT SUCCESS MESSAGE
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Sample data inserted successfully!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Materials: 20 items added';
    RAISE NOTICE 'Vendors: 8 vendors added';
    RAISE NOTICE 'Material Entries: Sample transactions added';
    RAISE NOTICE 'Vendor Payments: Sample payments added';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'You can now view the data in the UI:';
    RAISE NOTICE '- Materials: /construction/materials';
    RAISE NOTICE '- Vendors: /construction/vendors';
    RAISE NOTICE '========================================';
END $$;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Count records
SELECT 
    (SELECT COUNT(*) FROM materials) as materials_count,
    (SELECT COUNT(*) FROM vendors) as vendors_count,
    (SELECT COUNT(*) FROM material_entries) as entries_count,
    (SELECT COUNT(*) FROM vendor_payments) as payments_count;

-- Show low stock materials
SELECT material_code, material_name, current_stock, minimum_stock_level
FROM materials
WHERE current_stock <= minimum_stock_level
ORDER BY material_name;

-- Show vendor outstanding summary
SELECT vendor_code, vendor_name, total_order_value, outstanding_amount
FROM vendors
ORDER BY outstanding_amount DESC;
