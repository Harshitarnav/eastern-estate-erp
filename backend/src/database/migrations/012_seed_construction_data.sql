-- Migration 012: Seed realistic construction data
-- Materials, Vendors, Purchase Orders, Material Entries/Exits, Vendor Payments

-- ============================================================
-- 1. MATERIALS
-- ============================================================
INSERT INTO materials (id, material_code, material_name, category, unit_of_measurement,
  current_stock, minimum_stock_level, maximum_stock_level, minimum_stock, maximum_stock,
  unit_price, gst_percentage, specifications, is_active, created_at, updated_at)
VALUES
  (gen_random_uuid(), 'MAT-001', 'Ordinary Portland Cement (OPC 53)',  'CEMENT',     'BAG',         30,  50,  500,  50,  500,  380.00, 28, '53 grade, 50 kg bags, BIS certified',               true, NOW(), NOW()),
  (gen_random_uuid(), 'MAT-002', 'River Sand (Fine)',                   'SAND',       'CUBIC_METER', 10,  5,   60,   5,   60,  1350.00, 5,  'Washed river sand, FM 2.4-2.9, per cubic meter',    true, NOW(), NOW()),
  (gen_random_uuid(), 'MAT-003', 'Crushed Stone Aggregate 20mm',        'AGGREGATE',  'CUBIC_METER',  5,  5,   60,   5,   60,  1650.00, 5,  'Angular, clean, 20mm nominal size, per cubic meter',true, NOW(), NOW()),
  (gen_random_uuid(), 'MAT-004', 'TMT Steel Bars Fe-500 (12mm)',        'STEEL',      'TONNE',        2,  5,   100,  5,   100, 68000.00,18, 'TATA/SAIL brand, Fe-500 grade, 12mm dia',           true, NOW(), NOW()),
  (gen_random_uuid(), 'MAT-005', 'TMT Steel Bars Fe-500 (8mm)',         'STEEL',      'TONNE',        0,  2,   50,   2,   50,  68500.00,18, 'TATA/SAIL brand, Fe-500 grade, 8mm dia',            true, NOW(), NOW()),
  (gen_random_uuid(), 'MAT-006', 'Red Bricks (Standard)',               'BRICKS',     'PIECE',     5000,2000,50000,2000,50000,    8.00, 5,  '230x110x70mm, class A designation',                 true, NOW(), NOW()),
  (gen_random_uuid(), 'MAT-007', 'AAC Blocks (600x200x150)',            'BRICKS',     'PIECE',      500, 200, 5000, 200, 5000,   48.00, 18, 'Autoclaved Aerated Concrete, 600x200x150mm',        true, NOW(), NOW()),
  (gen_random_uuid(), 'MAT-008', 'PVC Pipes (4 inch, 3m length)',       'PLUMBING',   'PIECE',       80,  50,  500,  50,  500,  360.00, 18, 'ISI marked, pressure rated, 4 inch dia, 3m length', true, NOW(), NOW()),
  (gen_random_uuid(), 'MAT-009', 'CPVC Pipes (1 inch, 3m length)',      'PLUMBING',   'PIECE',       40,  30,  300,  30,  300,  255.00, 18, 'Astral/Supreme CPVC, 1 inch, 3m length',            true, NOW(), NOW()),
  (gen_random_uuid(), 'MAT-010', 'Electrical Wire 2.5 sqmm (FR, 90m)', 'ELECTRICAL', 'SET',          0,  5,   50,   5,   50,  3150.00, 18, 'Finolex/Havells FR grade, 2.5sqmm, 90m coil',      true, NOW(), NOW()),
  (gen_random_uuid(), 'MAT-011', 'Electrical Wire 1.5 sqmm (FR, 90m)', 'ELECTRICAL', 'SET',          0,  5,   50,   5,   50,  1980.00, 18, 'Finolex/Havells FR grade, 1.5sqmm, 90m coil',      true, NOW(), NOW()),
  (gen_random_uuid(), 'MAT-012', 'Ceramic Floor Tiles 24x24 (White)',  'TILES',      'SQUARE_METER', 0, 20,  500,  20,  500,   485.00, 18, 'Johnson/RAK, 600x600mm, glossy finish',              true, NOW(), NOW()),
  (gen_random_uuid(), 'MAT-013', 'Ceramic Wall Tiles 12x18',           'TILES',      'SQUARE_METER', 0, 10,  300,  10,  300,   410.00, 18, 'Johnson/Somany, 300x450mm, bathroom tiles',          true, NOW(), NOW()),
  (gen_random_uuid(), 'MAT-014', 'Asian Paints Apex Exterior (20L)',   'PAINT',      'LITRE',         0, 20,  500,  20,  500,   220.00, 18, '20L drum, exterior emulsion, weather shield',        true, NOW(), NOW()),
  (gen_random_uuid(), 'MAT-015', 'Asian Paints Tractor Interior (20L)','PAINT',      'LITRE',         0, 20,  500,  20,  500,   185.00, 18, '20L drum, interior emulsion',                       true, NOW(), NOW()),
  (gen_random_uuid(), 'MAT-016', 'Blue Metal Chips (10mm)',             'AGGREGATE',  'CUBIC_METER',  3,  3,   30,   3,   30,  1800.00, 5,  'Crushed granite, 10mm, for fine concrete',           true, NOW(), NOW()),
  (gen_random_uuid(), 'MAT-017', 'Waterproofing Compound (Dr. Fixit)', 'OTHER',      'KG',           45, 20,  200,  20,  200,   450.00, 18, 'Dr. Fixit Powder Waterproofing',                    true, NOW(), NOW()),
  (gen_random_uuid(), 'MAT-018', 'Safety Helmets',                     'OTHER',      'PIECE',        25, 10,  100,  10,  100,   180.00, 18, 'ISI marked, HDPE, adjustable strap',                true, NOW(), NOW()),
  (gen_random_uuid(), 'MAT-019', 'Binding Wire (16 gauge)',             'HARDWARE',   'KG',           35, 20,  200,  20,  200,    80.00, 18, 'Annealed wire, 16 gauge, for rebar tying',          true, NOW(), NOW()),
  (gen_random_uuid(), 'MAT-020', 'Plywood 18mm (8x4 ft)',              'OTHER',      'PIECE',        15, 20,  200,  20,  200,  1800.00, 18, 'BWR grade, 18mm thickness, 8x4 feet',               true, NOW(), NOW())
ON CONFLICT (material_code) DO NOTHING;

-- ============================================================
-- 2. VENDORS
-- ============================================================
INSERT INTO vendors (id, vendor_code, vendor_name, contact_person, email, phone_number,
  address, city, state, pincode, gst_number, pan_number,
  materials_supplied, rating, payment_terms, credit_limit, outstanding_amount, is_active, created_at, updated_at)
VALUES
  (gen_random_uuid(), 'VEN-001', 'Shree Ram Cement & Aggregates',       'Ramesh Gupta',     'ramesh@shreeram.com',    '9876543210',
   'Plot 12, Industrial Area, Phase 2', 'Pune', 'Maharashtra', '411019',
   '27AABCS1234B1Z5', 'AABCS1234B',
   '["Cement", "Sand", "Aggregates"]'::jsonb, 4.2, 'Net 30 days', 500000.00, 97150.00, true, NOW(), NOW()),

  (gen_random_uuid(), 'VEN-002', 'Kalyani Steel Traders',               'Sunil Kalyani',    'sunil@kalyani.com',      '9871234567',
   '45 Steel Market, Kamathipura', 'Mumbai', 'Maharashtra', '400008',
   '27AADCK5678D1Z2', 'AADCK5678D',
   '["Steel", "MS Plates", "Binding Wire"]'::jsonb, 4.5, 'Net 15 days', 2000000.00, 301200.00, true, NOW(), NOW()),

  (gen_random_uuid(), 'VEN-003', 'Modern Electrical Supplies',          'Deepak Sharma',    'deepak@modernelec.com',  '9823456789',
   '78, Electrical Market, Dadar', 'Mumbai', 'Maharashtra', '400014',
   '27AADCM3456F1Z8', 'AADCM3456F',
   '["Electrical Wire", "Switches", "MCB", "Cables"]'::jsonb, 4.0, 'Net 30 days', 300000.00, 103250.00, true, NOW(), NOW()),

  (gen_random_uuid(), 'VEN-004', 'Jai Tiles & Ceramics',                'Jayesh Patel',     'jayesh@jaitiles.com',    '9867891234',
   '120, Tile Market, Bhiwandi', 'Thane', 'Maharashtra', '421302',
   '27AAICJ7890H1Z3', 'AAICJ7890H',
   '["Tiles", "Marble", "Granite", "Sanitary Ware"]'::jsonb, 3.8, 'Cash / Net 7 days', 150000.00, 0.00, true, NOW(), NOW()),

  (gen_random_uuid(), 'VEN-005', 'National Paints Distributor',         'Anil Mehta',       'anil@natpaints.com',     '9812345678',
   '33, Paint Market, Kurla West', 'Mumbai', 'Maharashtra', '400070',
   '27AAICN2345K1Z6', 'AAICN2345K',
   '["Paint", "Putty", "Primer", "Waterproofing"]'::jsonb, 4.3, 'Net 30 days', 200000.00, 0.00, true, NOW(), NOW()),

  (gen_random_uuid(), 'VEN-006', 'Patel Brothers Plumbing Works',       'Haresh Patel',     'haresh@patelbros.com',   '9834567890',
   '67, Plumbers Lane, Malad', 'Mumbai', 'Maharashtra', '400064',
   '27AAICP4567M1Z4', 'AAICP4567M',
   '["PVC Pipes", "CPVC Pipes", "Fittings", "Valves"]'::jsonb, 4.1, 'Net 15 days', 250000.00, 0.00, true, NOW(), NOW()),

  (gen_random_uuid(), 'VEN-007', 'Shiv Construction & Labour Contractor','Shivaji Rane',   'shivaji@shivconstruct.com','9845678901',
   '10, Labour Colony, Vikhroli', 'Mumbai', 'Maharashtra', '400083',
   '27AAHCS5678N1Z9', 'AAHCS5678N',
   '["Labour", "Shuttering", "Safety Equipment"]'::jsonb, 4.6, 'Weekly Payment', 500000.00, 0.00, true, NOW(), NOW())
ON CONFLICT (vendor_code) DO NOTHING;

-- ============================================================
-- 3. UPDATE CONSTRUCTION PROJECT WITH REALISTIC DATA
-- ============================================================
UPDATE construction_projects SET
  project_code        = 'CP-2025-001',
  status              = 'IN_PROGRESS',
  overall_progress    = 65,
  budget_allocated    = 35000000,
  budget_spent        = 22750000,
  contractor_name     = 'Shiv Construction & Labour Contractor',
  site_engineer       = 'Priya Singh',
  start_date          = '2025-04-01',
  expected_completion_date = '2026-12-31',
  notes               = 'Phase 1: 12 floors, 48 units. Foundation complete. Slab work on 8th floor in progress.'
WHERE project_name = 'Eastern Heights - Phase 1'
  AND (project_code IS NULL OR project_code = '');

-- ============================================================
-- 4. PURCHASE ORDERS
-- ============================================================
DO $$
DECLARE
  v_proj_id    UUID;
  v_ven_cement UUID;
  v_ven_steel  UUID;
  v_ven_elec   UUID;
  v_mat_cement UUID;
  v_mat_sand   UUID;
  v_mat_steel  UUID;
  v_mat_wire   UUID;
  v_po1        UUID;
  v_po2        UUID;
  v_po3        UUID;
BEGIN
  SELECT id INTO v_proj_id    FROM construction_projects WHERE project_name = 'Eastern Heights - Phase 1' LIMIT 1;
  SELECT id INTO v_ven_cement FROM vendors WHERE vendor_code = 'VEN-001';
  SELECT id INTO v_ven_steel  FROM vendors WHERE vendor_code = 'VEN-002';
  SELECT id INTO v_ven_elec   FROM vendors WHERE vendor_code = 'VEN-003';
  SELECT id INTO v_mat_cement FROM materials WHERE material_code = 'MAT-001';
  SELECT id INTO v_mat_sand   FROM materials WHERE material_code = 'MAT-002';
  SELECT id INTO v_mat_steel  FROM materials WHERE material_code = 'MAT-004';
  SELECT id INTO v_mat_wire   FROM materials WHERE material_code = 'MAT-010';

  IF v_proj_id IS NOT NULL AND v_ven_cement IS NOT NULL AND (SELECT COUNT(*) FROM purchase_orders) = 0 THEN

    -- PO 1: Cement & Sand (DELIVERED)
    v_po1 := gen_random_uuid();
    INSERT INTO purchase_orders (id, po_number, po_date, vendor_id, construction_project_id,
      status, expected_delivery_date, actual_delivery_date,
      subtotal, tax_amount, total_amount,
      payment_terms, advance_paid, balance_amount,
      notes, is_active, created_at, updated_at)
    VALUES (v_po1, 'PO-2026-001', CURRENT_DATE - INTERVAL '20 days',
      v_ven_cement, v_proj_id, 'DELIVERED',
      CURRENT_DATE - INTERVAL '15 days', CURRENT_DATE - INTERVAL '15 days',
      135000.00, 12150.00, 147150.00,
      'Net 30 days', 50000.00, 97150.00,
      'Cement and sand for floors 7-9 slab work', true, NOW(), NOW());

    INSERT INTO purchase_order_items (id, purchase_order_id, material_id,
      quantity, unit_price, subtotal, tax_percentage, tax_amount, total_amount, created_at, updated_at)
    VALUES
      (gen_random_uuid(), v_po1, v_mat_cement, 200, 380.00, 76000.00, 28.00, 21280.00, 97280.00, NOW(), NOW()),
      (gen_random_uuid(), v_po1, v_mat_sand,   800, 45.00,  36000.00,  5.00,  1800.00, 37800.00, NOW(), NOW());

    -- PO 2: Steel (APPROVED, pending delivery)
    v_po2 := gen_random_uuid();
    INSERT INTO purchase_orders (id, po_number, po_date, vendor_id, construction_project_id,
      status, expected_delivery_date,
      subtotal, tax_amount, total_amount,
      payment_terms, advance_paid, balance_amount,
      notes, is_active, created_at, updated_at)
    VALUES (v_po2, 'PO-2026-002', CURRENT_DATE - INTERVAL '10 days',
      v_ven_steel, v_proj_id, 'APPROVED',
      CURRENT_DATE + INTERVAL '5 days',
      340000.00, 61200.00, 401200.00,
      'Net 15 days', 100000.00, 301200.00,
      '5 MT steel for 8th and 9th floor columns', true, NOW(), NOW());

    INSERT INTO purchase_order_items (id, purchase_order_id, material_id,
      quantity, unit_price, subtotal, tax_percentage, tax_amount, total_amount, created_at, updated_at)
    VALUES (gen_random_uuid(), v_po2, v_mat_steel, 5, 68000.00, 340000.00, 18.00, 61200.00, 401200.00, NOW(), NOW());

    -- PO 3: Electrical wire (DRAFT)
    v_po3 := gen_random_uuid();
    INSERT INTO purchase_orders (id, po_number, po_date, vendor_id, construction_project_id,
      status, expected_delivery_date,
      subtotal, tax_amount, total_amount,
      payment_terms, advance_paid, balance_amount,
      notes, is_active, created_at, updated_at)
    VALUES (v_po3, 'PO-2026-003', CURRENT_DATE - INTERVAL '2 days',
      v_ven_elec, v_proj_id, 'DRAFT',
      CURRENT_DATE + INTERVAL '10 days',
      87500.00, 15750.00, 103250.00,
      'Net 30 days', 0.00, 103250.00,
      'Electrical wiring for floors 5-10', true, NOW(), NOW());

    INSERT INTO purchase_order_items (id, purchase_order_id, material_id,
      quantity, unit_price, subtotal, tax_percentage, tax_amount, total_amount, created_at, updated_at)
    VALUES (gen_random_uuid(), v_po3, v_mat_wire, 2500, 35.00, 87500.00, 18.00, 15750.00, 103250.00, NOW(), NOW());

    RAISE NOTICE 'Created 3 purchase orders';
  ELSE
    RAISE NOTICE 'POs already exist or missing data, skipping';
  END IF;
END $$;

-- ============================================================
-- 5. MATERIAL ENTRIES (stock received)
-- ============================================================
DO $$
DECLARE
  v_mat_cement UUID;
  v_mat_sand   UUID;
  v_ven_cement UUID;
  v_po1        UUID;
  v_user_id    UUID;
BEGIN
  SELECT id INTO v_mat_cement FROM materials WHERE material_code = 'MAT-001';
  SELECT id INTO v_mat_sand   FROM materials WHERE material_code = 'MAT-002';
  SELECT id INTO v_ven_cement FROM vendors WHERE vendor_code = 'VEN-001';
  SELECT id INTO v_po1        FROM purchase_orders WHERE po_number = 'PO-2026-001';
  SELECT id INTO v_user_id    FROM users LIMIT 1;

  IF v_mat_cement IS NOT NULL AND v_po1 IS NOT NULL AND v_user_id IS NOT NULL
     AND (SELECT COUNT(*) FROM material_entries) = 0 THEN

    INSERT INTO material_entries (id, material_id, entry_type, quantity, unit_price, total_value,
      vendor_id, purchase_order_id, entry_date, entered_by, invoice_number, remarks, created_at, updated_at)
    VALUES
      (gen_random_uuid(), v_mat_cement, 'PURCHASE', 200, 380.00, 76000.00,
       v_ven_cement, v_po1, NOW() - INTERVAL '15 days', v_user_id,
       'INV/2026/0312', 'Cement delivery - 200 bags against PO-2026-001', NOW(), NOW()),
      (gen_random_uuid(), v_mat_sand, 'PURCHASE', 800, 45.00, 36000.00,
       v_ven_cement, v_po1, NOW() - INTERVAL '15 days', v_user_id,
       'INV/2026/0312', 'River sand delivery - 800 CFt against PO-2026-001', NOW(), NOW());

    RAISE NOTICE 'Created material entries';
  ELSE
    RAISE NOTICE 'Material entries already exist or missing data, skipping';
  END IF;
END $$;

-- ============================================================
-- 6. MATERIAL EXITS (materials issued to site)
-- ============================================================
DO $$
DECLARE
  v_mat_cement UUID;
  v_mat_sand   UUID;
  v_proj_id    UUID;
  v_user_id    UUID;
BEGIN
  SELECT id INTO v_mat_cement FROM materials WHERE material_code = 'MAT-001';
  SELECT id INTO v_mat_sand   FROM materials WHERE material_code = 'MAT-002';
  SELECT id INTO v_proj_id    FROM construction_projects WHERE project_name = 'Eastern Heights - Phase 1' LIMIT 1;
  SELECT id INTO v_user_id    FROM users LIMIT 1;

  IF v_mat_cement IS NOT NULL AND v_proj_id IS NOT NULL AND v_user_id IS NOT NULL
     AND (SELECT COUNT(*) FROM material_exits) = 0 THEN

    INSERT INTO material_exits (id, material_id, construction_project_id, quantity, purpose,
      issued_to, exit_date, remarks, created_at, updated_at)
    VALUES
      (gen_random_uuid(), v_mat_cement, v_proj_id, 120,
       'Cement for 7th floor slab - 120 bags used for M25 concrete mix',
       v_user_id, NOW() - INTERVAL '12 days', '7th floor slab pour', NOW(), NOW()),
      (gen_random_uuid(), v_mat_sand, v_proj_id, 450,
       'River sand for 7th floor slab - used in concrete mix',
       v_user_id, NOW() - INTERVAL '12 days', '7th floor slab pour', NOW(), NOW()),
      (gen_random_uuid(), v_mat_cement, v_proj_id, 50,
       'Cement for 8th floor column casting - 50 bags used',
       v_user_id, NOW() - INTERVAL '5 days', '8th floor columns', NOW(), NOW());

    RAISE NOTICE 'Created material exits';
  ELSE
    RAISE NOTICE 'Material exits already exist or missing data, skipping';
  END IF;
END $$;

-- ============================================================
-- 7. VENDOR PAYMENT
-- ============================================================
DO $$
DECLARE
  v_ven_cement UUID;
  v_po1        UUID;
  v_user_id    UUID;
BEGIN
  SELECT id INTO v_ven_cement FROM vendors WHERE vendor_code = 'VEN-001';
  SELECT id INTO v_po1        FROM purchase_orders WHERE po_number = 'PO-2026-001';
  SELECT id INTO v_user_id    FROM users LIMIT 1;

  IF v_ven_cement IS NOT NULL AND v_po1 IS NOT NULL AND v_user_id IS NOT NULL
     AND (SELECT COUNT(*) FROM vendor_payments) = 0 THEN

    INSERT INTO vendor_payments (id, vendor_id, purchase_order_id, amount,
      payment_date, payment_mode, transaction_reference,
      notes, created_by, created_at, updated_at)
    VALUES (
      gen_random_uuid(), v_ven_cement, v_po1, 50000.00,
      CURRENT_DATE - INTERVAL '18 days', 'BANK_TRANSFER', 'NEFT/2026/03/001',
      'Advance payment for PO-2026-001 cement/sand delivery',
      v_user_id, NOW(), NOW()
    );

    RAISE NOTICE 'Created vendor payment';
  ELSE
    RAISE NOTICE 'Vendor payments already exist or missing data, skipping';
  END IF;
END $$;

-- ============================================================
-- VERIFY
-- ============================================================
SELECT 'materials'       AS table_name, COUNT(*) FROM materials
UNION ALL SELECT 'vendors',            COUNT(*) FROM vendors
UNION ALL SELECT 'purchase_orders',    COUNT(*) FROM purchase_orders
UNION ALL SELECT 'purchase_order_items',COUNT(*) FROM purchase_order_items
UNION ALL SELECT 'material_entries',   COUNT(*) FROM material_entries
UNION ALL SELECT 'material_exits',     COUNT(*) FROM material_exits
UNION ALL SELECT 'vendor_payments',    COUNT(*) FROM vendor_payments
ORDER BY 1;
