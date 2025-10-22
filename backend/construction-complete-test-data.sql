-- =====================================================
-- COMPREHENSIVE TEST DATA FOR CONSTRUCTION MODULE
-- Run this file to populate all construction-related data
-- =====================================================

-- First, let's get the property and employee IDs we'll use
-- You'll need to replace these with actual IDs from your database

-- Get a sample property ID (replace with actual)
-- SELECT id FROM properties LIMIT 1;

-- Get a sample employee ID for project manager (replace with actual)
-- SELECT id FROM employees WHERE designation LIKE '%Manager%' LIMIT 1;

-- For this script, I'll use placeholder UUIDs that you should replace


-- =====================================================
-- 1. CONSTRUCTION PROJECTS
-- =====================================================

-- Note: Replace these UUIDs with actual property_id and employee_id from your database
INSERT INTO construction_projects (
  id,
  property_id,
  project_name,
  start_date,
  expected_completion_date,
  status,
  overall_progress,
  budget_allocated,
  budget_spent,
  project_manager_id,
  created_at,
  updated_at
) VALUES
-- Project 1: Active High-Rise Construction
(
  gen_random_uuid(),
  (SELECT id FROM properties LIMIT 1 OFFSET 0),  -- First property
  'Tower A - Foundation & Structure',
  '2024-01-15',
  '2025-06-30',
  'IN_PROGRESS',
  45.50,
  15000000.00,
  6825000.00,
  (SELECT id FROM employees WHERE status = 'ACTIVE' LIMIT 1),
  NOW(),
  NOW()
),
-- Project 2: Early Stage Project
(
  gen_random_uuid(),
  (SELECT id FROM properties LIMIT 1 OFFSET 0),
  'Tower B - Foundation Work',
  '2024-06-01',
  '2025-12-31',
  'IN_PROGRESS',
  25.00,
  12000000.00,
  3000000.00,
  (SELECT id FROM employees WHERE status = 'ACTIVE' LIMIT 1),
  NOW(),
  NOW()
),
-- Project 3: Planning Stage
(
  gen_random_uuid(),
  (SELECT id FROM properties LIMIT 1 OFFSET 0),
  'Tower C - Site Preparation',
  '2024-09-01',
  '2026-03-31',
  'PLANNING',
  5.00,
  18000000.00,
  900000.00,
  (SELECT id FROM employees WHERE status = 'ACTIVE' LIMIT 1),
  NOW(),
  NOW()
),
-- Project 4: Advanced Stage
(
  gen_random_uuid(),
  (SELECT id FROM properties LIMIT 1 OFFSET 0),
  'Community Amenities Construction',
  '2023-12-01',
  '2025-03-31',
  'IN_PROGRESS',
  75.00,
  8000000.00,
  6000000.00,
  (SELECT id FROM employees WHERE status = 'ACTIVE' LIMIT 1),
  NOW(),
  NOW()
),
-- Project 5: Near Completion
(
  gen_random_uuid(),
  (SELECT id FROM properties LIMIT 1 OFFSET 1),  -- Second property if exists
  'Parking Structure',
  '2024-03-01',
  '2025-01-31',
  'IN_PROGRESS',
  90.00,
  5000000.00,
  4500000.00,
  (SELECT id FROM employees WHERE status = 'ACTIVE' LIMIT 1 OFFSET 1),
  NOW(),
  NOW()
);


-- =====================================================
-- 2. MATERIALS INVENTORY
-- =====================================================

INSERT INTO materials (
  id,
  material_code,
  material_name,
  category,
  unit_of_measurement,
  unit_price,
  current_stock,
  minimum_stock,
  maximum_stock,
  is_active,
  created_at,
  updated_at
) VALUES
-- Cement
(gen_random_uuid(), 'MAT-001', 'OPC 53 Grade Cement', 'CEMENT', 'Bags (50kg)', 450.00, 500, 200, 1000, true, NOW(), NOW()),
(gen_random_uuid(), 'MAT-002', 'PPC Cement', 'CEMENT', 'Bags (50kg)', 420.00, 300, 150, 800, true, NOW(), NOW()),

-- Steel
(gen_random_uuid(), 'MAT-003', 'TMT Steel Bars 8mm', 'STEEL', 'Tons', 65000.00, 15, 5, 30, true, NOW(), NOW()),
(gen_random_uuid(), 'MAT-004', 'TMT Steel Bars 12mm', 'STEEL', 'Tons', 64000.00, 20, 8, 40, true, NOW(), NOW()),
(gen_random_uuid(), 'MAT-005', 'TMT Steel Bars 16mm', 'STEEL', 'Tons', 63500.00, 25, 10, 50, true, NOW(), NOW()),
(gen_random_uuid(), 'MAT-006', 'Steel Plates', 'STEEL', 'Tons', 68000.00, 5, 2, 15, true, NOW(), NOW()),

-- Sand & Aggregates
(gen_random_uuid(), 'MAT-007', 'River Sand', 'SAND', 'Cubic Meters', 1200.00, 100, 50, 200, true, NOW(), NOW()),
(gen_random_uuid(), 'MAT-008', 'M-Sand', 'SAND', 'Cubic Meters', 1000.00, 150, 80, 300, true, NOW(), NOW()),
(gen_random_uuid(), 'MAT-009', '20mm Aggregate', 'AGGREGATES', 'Cubic Meters', 1500.00, 80, 40, 150, true, NOW(), NOW()),
(gen_random_uuid(), 'MAT-010', '10mm Aggregate', 'AGGREGATES', 'Cubic Meters', 1600.00, 60, 30, 120, true, NOW(), NOW()),

-- Bricks & Blocks
(gen_random_uuid(), 'MAT-011', 'Red Clay Bricks', 'BRICKS', 'Numbers', 8.00, 50000, 20000, 100000, true, NOW(), NOW()),
(gen_random_uuid(), 'MAT-012', 'Fly Ash Bricks', 'BRICKS', 'Numbers', 6.50, 40000, 15000, 80000, true, NOW(), NOW()),
(gen_random_uuid(), 'MAT-013', 'AAC Blocks', 'BLOCKS', 'Numbers', 45.00, 5000, 2000, 10000, true, NOW(), NOW()),
(gen_random_uuid(), 'MAT-014', 'Concrete Blocks', 'BLOCKS', 'Numbers', 35.00, 8000, 3000, 15000, true, NOW(), NOW()),

-- Paint & Finishing
(gen_random_uuid(), 'MAT-015', 'Exterior Emulsion Paint', 'PAINT', 'Liters', 450.00, 500, 200, 1000, true, NOW(), NOW()),
(gen_random_uuid(), 'MAT-016', 'Interior Emulsion Paint', 'PAINT', 'Liters', 380.00, 600, 250, 1200, true, NOW(), NOW()),
(gen_random_uuid(), 'MAT-017', 'Primer', 'PAINT', 'Liters', 280.00, 300, 150, 600, true, NOW(), NOW()),

-- Electrical
(gen_random_uuid(), 'MAT-018', 'Copper Wire 2.5 sq mm', 'ELECTRICAL', 'Meters', 45.00, 2000, 1000, 5000, true, NOW(), NOW()),
(gen_random_uuid(), 'MAT-019', 'PVC Conduit Pipes', 'ELECTRICAL', 'Meters', 35.00, 3000, 1500, 6000, true, NOW(), NOW()),
(gen_random_uuid(), 'MAT-020', 'MCB Switches', 'ELECTRICAL', 'Numbers', 250.00, 200, 100, 400, true, NOW(), NOW()),

-- Plumbing
(gen_random_uuid(), 'MAT-021', 'PVC Pipes 4 inch', 'PLUMBING', 'Meters', 180.00, 1000, 500, 2000, true, NOW(), NOW()),
(gen_random_uuid(), 'MAT-022', 'CPVC Pipes 1 inch', 'PLUMBING', 'Meters', 120.00, 1500, 800, 3000, true, NOW(), NOW()),
(gen_random_uuid(), 'MAT-023', 'Water Tanks 1000L', 'PLUMBING', 'Numbers', 8500.00, 50, 20, 100, true, NOW(), NOW()),

-- Low Stock Items (for testing alerts)
(gen_random_uuid(), 'MAT-024', 'Waterproofing Membrane', 'WATERPROOFING', 'Square Meters', 450.00, 180, 200, 500, true, NOW(), NOW()),
(gen_random_uuid(), 'MAT-025', 'Tile Adhesive', 'ADHESIVES', 'Bags (20kg)', 350.00, 45, 50, 200, true, NOW(), NOW()),
(gen_random_uuid(), 'MAT-026', 'Silicon Sealant', 'ADHESIVES', 'Tubes', 180.00, 28, 30, 100, true, NOW(), NOW());


-- =====================================================
-- 3. VENDORS
-- =====================================================

INSERT INTO vendors (
  id,
  vendor_code,
  vendor_name,
  contact_person,
  phone_number,
  email,
  address_line1,
  address_line2,
  city,
  state,
  pin_code,
  gst_number,
  pan_number,
  materials_supplied,
  credit_limit,
  payment_terms,
  bank_name,
  bank_account_number,
  bank_ifsc,
  rating,
  outstanding_amount,
  is_active,
  created_at,
  updated_at
) VALUES
-- Cement Supplier
(
  gen_random_uuid(),
  'VEN-001',
  'Ambuja Cement Distributors',
  'Rajesh Kumar',
  '9876543210',
  'rajesh@ambujadistr.com',
  '123 Industrial Area',
  'Phase 2',
  'Mumbai',
  'Maharashtra',
  '400001',
  '27AABCU9603R1Z6',
  'AABCU9603R',
  ARRAY['CEMENT', 'CONCRETE']::varchar[],
  2000000.00,
  'Net 30 days',
  'HDFC Bank',
  '50100123456789',
  'HDFC0001234',
  4.5,
  150000.00,
  true,
  NOW(),
  NOW()
),
-- Steel Supplier
(
  gen_random_uuid(),
  'VEN-002',
  'Tata Steel Trading Co.',
  'Suresh Patel',
  '9876543211',
  'suresh@tatasteel.com',
  '456 Steel Market',
  'Sector 15',
  'Pune',
  'Maharashtra',
  '411001',
  '27AAACT2803R1Z8',
  'AAACT2803R',
  ARRAY['STEEL', 'IRON']::varchar[],
  5000000.00,
  'Net 45 days',
  'ICICI Bank',
  '60200987654321',
  'ICIC0006789',
  4.8,
  450000.00,
  true,
  NOW(),
  NOW()
),
-- Sand & Aggregates
(
  gen_random_uuid(),
  'VEN-003',
  'Shree Aggregates & Mining',
  'Mahesh Reddy',
  '9876543212',
  'mahesh@shreeagg.com',
  '789 Mining Road',
  'Quarry Site',
  'Hyderabad',
  'Telangana',
  '500001',
  '36AABCS5343R1Z4',
  'AABCS5343R',
  ARRAY['SAND', 'AGGREGATES', 'STONE']::varchar[],
  1500000.00,
  'Net 15 days',
  'SBI',
  '30123456789012',
  'SBIN0001234',
  4.2,
  85000.00,
  true,
  NOW(),
  NOW()
),
-- Bricks Manufacturer
(
  gen_random_uuid(),
  'VEN-004',
  'Modern Brick Industries',
  'Vijay Shah',
  '9876543213',
  'vijay@modernbrick.com',
  '321 Kiln Area',
  'Industrial Estate',
  'Ahmedabad',
  'Gujarat',
  '380001',
  '24AABCM1234R1Z7',
  'AABCM1234R',
  ARRAY['BRICKS', 'BLOCKS', 'TILES']::varchar[],
  1000000.00,
  'Net 30 days',
  'Axis Bank',
  '91234567890123',
  'UTIB0001234',
  4.3,
  125000.00,
  true,
  NOW(),
  NOW()
),
-- Paint Supplier
(
  gen_random_uuid(),
  'VEN-005',
  'Asian Paints Depot',
  'Anil Sharma',
  '9876543214',
  'anil@asianpaints.com',
  '654 Paint Market',
  'Karol Bagh',
  'New Delhi',
  'Delhi',
  '110005',
  '07AABCA1234R1Z9',
  'AABCA1234R',
  ARRAY['PAINT', 'PRIMER', 'PUTTY']::varchar[],
  800000.00,
  'Net 30 days',
  'HDFC Bank',
  '50987654321098',
  'HDFC0005678',
  4.7,
  95000.00,
  true,
  NOW(),
  NOW()
),
-- Electrical Supplier
(
  gen_random_uuid(),
  'VEN-006',
  'Havells Electrical Traders',
  'Ramesh Gupta',
  '9876543215',
  'ramesh@havellstr.com',
  '987 Electric Market',
  'Chandni Chowk',
  'New Delhi',
  'Delhi',
  '110006',
  '07AABCH5678R1Z3',
  'AABCH5678R',
  ARRAY['ELECTRICAL', 'WIRING', 'SWITCHES']::varchar[],
  1200000.00,
  'Net 45 days',
  'ICICI Bank',
  '60111222333444',
  'ICIC0002345',
  4.6,
  180000.00,
  true,
  NOW(),
  NOW()
),
-- Plumbing Supplier
(
  gen_random_uuid(),
  'VEN-007',
  'Supreme Pipes & Fittings',
  'Prakash Jain',
  '9876543216',
  'prakash@supremepipes.com',
  '147 Plumbing Bazaar',
  'Lal Darwaza',
  'Ahmedabad',
  'Gujarat',
  '380002',
  '24AABCP9876R1Z2',
  'AABCP9876R',
  ARRAY['PLUMBING', 'PIPES', 'FITTINGS']::varchar[],
  900000.00,
  'Net 30 days',
  'SBI',
  '30999888777666',
  'SBIN0005678',
  4.4,
  110000.00,
  true,
  NOW(),
  NOW()
);


-- =====================================================
-- 4. PURCHASE ORDERS
-- =====================================================

-- First, let's create some POs
INSERT INTO purchase_orders (
  id,
  po_number,
  vendor_id,
  order_date,
  expected_delivery_date,
  total_amount,
  tax_amount,
  discount,
  grand_total,
  payment_terms,
  status,
  payment_status,
  remarks,
  created_at,
  updated_at
) VALUES
-- PO 1: Cement Order
(
  gen_random_uuid(),
  'PO-2024-001',
  (SELECT id FROM vendors WHERE vendor_code = 'VEN-001'),
  '2024-10-01',
  '2024-10-15',
  450000.00,
  81000.00,
  5000.00,
  526000.00,
  'Net 30 days',
  'RECEIVED',
  'PAID',
  'Monthly cement supply for Tower A',
  NOW(),
  NOW()
),
-- PO 2: Steel Order (Pending)
(
  gen_random_uuid(),
  'PO-2024-002',
  (SELECT id FROM vendors WHERE vendor_code = 'VEN-002'),
  '2024-10-15',
  '2024-10-30',
  1280000.00,
  230400.00,
  15000.00,
  1495400.00,
  'Net 45 days',
  'PENDING_APPROVAL',
  'PENDING',
  'Steel bars for Tower B foundation',
  NOW(),
  NOW()
),
-- PO 3: Sand & Aggregates
(
  gen_random_uuid(),
  'PO-2024-003',
  (SELECT id FROM vendors WHERE vendor_code = 'VEN-003'),
  '2024-10-10',
  '2024-10-25',
  200000.00,
  36000.00,
  3000.00,
  233000.00,
  'Net 15 days',
  'APPROVED',
  'PENDING',
  'Sand and aggregates for multiple projects',
  NOW(),
  NOW()
),
-- PO 4: Bricks Order
(
  gen_random_uuid(),
  'PO-2024-004',
  (SELECT id FROM vendors WHERE vendor_code = 'VEN-004'),
  '2024-09-20',
  '2024-10-05',
  400000.00,
  72000.00,
  10000.00,
  462000.00,
  'Net 30 days',
  'RECEIVED',
  'PARTIAL',
  'Bricks for Tower A walls',
  NOW(),
  NOW()
),
-- PO 5: Paint Order (Pending Approval)
(
  gen_random_uuid(),
  'PO-2024-005',
  (SELECT id FROM vendors WHERE vendor_code = 'VEN-005'),
  '2024-10-20',
  '2024-11-10',
  180000.00,
  32400.00,
  2000.00,
  210400.00,
  'Net 30 days',
  'PENDING_APPROVAL',
  'PENDING',
  'Paint for community amenities finishing',
  NOW(),
  NOW()
);

-- =====================================================
-- 5. MATERIAL ENTRIES (Recent Stock Updates)
-- =====================================================

INSERT INTO material_entries (
  id,
  material_id,
  vendor_id,
  quantity,
  unit_price,
  total_amount,
  entry_date,
  invoice_number,
  remarks,
  created_at
) VALUES
-- Cement entries
(
  gen_random_uuid(),
  (SELECT id FROM materials WHERE material_code = 'MAT-001'),
  (SELECT id FROM vendors WHERE vendor_code = 'VEN-001'),
  500,
  450.00,
  225000.00,
  '2024-10-15',
  'INV-CM-001',
  'Monthly cement stock',
  NOW()
),
-- Steel entry
(
  gen_random_uuid(),
  (SELECT id FROM materials WHERE material_code = 'MAT-003'),
  (SELECT id FROM vendors WHERE vendor_code = 'VEN-002'),
  10,
  65000.00,
  650000.00,
  '2024-10-12',
  'INV-ST-012',
  'TMT bars for foundation',
  NOW()
);

-- =====================================================
-- 6. MATERIAL EXITS (Usage Records)
-- =====================================================

INSERT INTO material_exits (
  id,
  material_id,
  project_id,
  quantity,
  unit_price,
  total_value,
  exit_date,
  issued_to,
  purpose,
  remarks,
  created_at
) VALUES
-- Cement used in Tower A
(
  gen_random_uuid(),
  (SELECT id FROM materials WHERE material_code = 'MAT-001'),
  (SELECT id FROM construction_projects WHERE project_name LIKE '%Tower A%' LIMIT 1),
  200,
  450.00,
  90000.00,
  '2024-10-18',
  'Ramesh Kumar (Site Supervisor)',
  'Foundation work - Tower A',
  'For RCC foundation work',
  NOW()
),
-- Steel used in Tower B
(
  gen_random_uuid(),
  (SELECT id FROM materials WHERE material_code = 'MAT-004'),
  (SELECT id FROM construction_projects WHERE project_name LIKE '%Tower B%' LIMIT 1),
  5,
  64000.00,
  320000.00,
  '2024-10-19',
  'Sunil Patel (Engineer)',
  'Column reinforcement',
  'For structural columns',
  NOW()
);

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check counts
SELECT 'Construction Projects' as table_name, COUNT(*) as count FROM construction_projects
UNION ALL
SELECT 'Materials', COUNT(*) FROM materials
UNION ALL
SELECT 'Vendors', COUNT(*) FROM vendors
UNION ALL
SELECT 'Purchase Orders', COUNT(*) FROM purchase_orders
UNION ALL
SELECT 'Material Entries', COUNT(*) FROM material_entries
UNION ALL
SELECT 'Material Exits', COUNT(*) FROM material_exits;

-- View project summary
SELECT 
  project_name,
  status,
  overall_progress || '%' as progress,
  budget_allocated,
  budget_spent
FROM construction_projects
ORDER BY overall_progress DESC;

-- View low stock materials
SELECT 
  material_name,
  current_stock,
  minimum_stock,
  unit_of_measurement
FROM materials
WHERE current_stock <= minimum_stock
ORDER BY current_stock ASC;

-- View vendor outstanding
SELECT 
  vendor_name,
  rating,
  outstanding_amount
FROM vendors
WHERE outstanding_amount > 0
ORDER BY outstanding_amount DESC;

-- View pending POs
SELECT 
  po_number,
  v.vendor_name,
  grand_total,
  status,
  payment_status
FROM purchase_orders po
JOIN vendors v ON po.vendor_id = v.id
WHERE status = 'PENDING_APPROVAL'
ORDER BY order_date DESC;
