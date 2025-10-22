-- Construction Module Test Data (Fixed to match actual schema)
-- Run this after the schema is created

-- ============================================
-- CONSTRUCTION PROJECTS TEST DATA
-- ============================================

INSERT INTO construction_projects (
    project_code, project_name, property_id, tower_id, site_engineer_id,
    project_phase, status, start_date, expected_completion_date,
    overall_progress, structure_progress, interior_progress, finishing_progress,
    budget_allocated, budget_spent, is_active
) VALUES
    (
        'CONS-20251022001',
        'Tower A Construction',
        (SELECT id FROM properties LIMIT 1),
        (SELECT id FROM towers LIMIT 1),
        (SELECT id FROM employees LIMIT 1),
        'STRUCTURE',
        'ACTIVE',
        '2024-01-15',
        '2025-12-31',
        45.5,
        60.0,
        30.0,
        15.0,
        50000000,
        25000000,
        true
    ),
    (
        'CONS-20251022002',
        'Tower B Foundation',
        (SELECT id FROM properties LIMIT 1 OFFSET 1),
        (SELECT id FROM towers LIMIT 1 OFFSET 1),
        (SELECT id FROM employees LIMIT 1 OFFSET 1),
        'FOUNDATION',
        'ACTIVE',
        '2024-06-01',
        '2026-03-31',
        25.0,
        40.0,
        10.0,
        5.0,
        35000000,
        15000000,
        true
    ),
    (
        'CONS-20251022003',
        'Amenities Block',
        (SELECT id FROM properties LIMIT 1),
        NULL,
        (SELECT id FROM employees LIMIT 1),
        'FINISHING',
        'ACTIVE',
        '2023-09-01',
        '2024-12-31',
        85.0,
        100.0,
        90.0,
        75.0,
        20000000,
        18500000,
        true
    );

-- ============================================
-- CONSTRUCTION TEAMS TEST DATA
-- ============================================

INSERT INTO construction_teams (
    team_name, team_code, team_type, property_id, construction_project_id,
    leader_name, contact_number, email, total_members, active_members,
    specialization, contract_start_date, contract_end_date, daily_rate, is_active
) VALUES
    (
        'Tower A Main Crew',
        'TEAM-001',
        'CONTRACTOR',
        (SELECT id FROM properties LIMIT 1),
        (SELECT id FROM construction_projects WHERE project_code = 'CONS-20251022001'),
        'Rajesh Kumar',
        '+919876543210',
        'rajesh@contractor.com',
        35,
        32,
        'Structural Work',
        '2024-01-15',
        '2025-12-31',
        45000,
        true
    ),
    (
        'Tower A Plumbing Team',
        'TEAM-002',
        'CONTRACTOR',
        (SELECT id FROM properties LIMIT 1),
        (SELECT id FROM construction_projects WHERE project_code = 'CONS-20251022001'),
        'Suresh Patil',
        '+919876543211',
        'suresh@plumbing.com',
        12,
        12,
        'Plumbing & Sanitation',
        '2024-03-01',
        '2025-09-30',
        25000,
        true
    ),
    (
        'Tower B Foundation Team',
        'TEAM-003',
        'CONTRACTOR',
        (SELECT id FROM properties LIMIT 1 OFFSET 1),
        (SELECT id FROM construction_projects WHERE project_code = 'CONS-20251022002'),
        'Vikas Sharma',
        '+919876543212',
        'vikas@foundation.com',
        28,
        28,
        'Foundation & Excavation',
        '2024-06-01',
        '2025-12-31',
        40000,
        true
    ),
    (
        'Amenities Finishing Crew',
        'TEAM-004',
        'IN_HOUSE',
        (SELECT id FROM properties LIMIT 1),
        (SELECT id FROM construction_projects WHERE project_code = 'CONS-20251022003'),
        'Amit Verma',
        '+919876543213',
        'amit@easternest.com',
        20,
        18,
        'Finishing & Painting',
        '2024-08-01',
        '2024-12-31',
        35000,
        true
    );

-- ============================================
-- PROGRESS LOGS TEST DATA
-- ============================================

INSERT INTO construction_progress_logs (
    property_id, tower_id, construction_project_id, log_date,
    progress_type, description, progress_percentage,
    weather_condition, temperature, logged_by
) VALUES
    (
        (SELECT id FROM properties LIMIT 1),
        (SELECT id FROM towers LIMIT 1),
        (SELECT id FROM construction_projects WHERE project_code = 'CONS-20251022001'),
        '2024-10-20',
        'STRUCTURE',
        'Completed 3rd floor slab casting. Started column work for 4th floor. All safety measures in place.',
        60.0,
        'Sunny',
        32.5,
        (SELECT id FROM users LIMIT 1)
    ),
    (
        (SELECT id FROM properties LIMIT 1),
        (SELECT id FROM towers LIMIT 1),
        (SELECT id FROM construction_projects WHERE project_code = 'CONS-20251022001'),
        '2024-10-19',
        'INTERIOR',
        'Installed plumbing lines for floors 1-2. Electrical conduit work in progress on floor 3.',
        30.0,
        'Partly Cloudy',
        28.0,
        (SELECT id FROM users LIMIT 1)
    ),
    (
        (SELECT id FROM properties LIMIT 1 OFFSET 1),
        (SELECT id FROM towers LIMIT 1 OFFSET 1),
        (SELECT id FROM construction_projects WHERE project_code = 'CONS-20251022002'),
        '2024-10-20',
        'STRUCTURE',
        'Foundation excavation completed. Started laying foundation base with reinforcement.',
        40.0,
        'Sunny',
        33.0,
        (SELECT id FROM users LIMIT 1)
    ),
    (
        (SELECT id FROM properties LIMIT 1),
        NULL,
        (SELECT id FROM construction_projects WHERE project_code = 'CONS-20251022003'),
        '2024-10-20',
        'FINISHING',
        'Final finishing touches. Painting completed in 80% area. Touch-ups in progress.',
        75.0,
        'Clear',
        30.5,
        (SELECT id FROM users LIMIT 1)
    );

-- ============================================
-- PURCHASE ORDERS TEST DATA
-- ============================================

INSERT INTO purchase_orders (
    po_number, po_date, vendor_id, property_id, construction_project_id,
    status, expected_delivery_date, subtotal, tax_amount, discount_amount,
    total_amount, advance_paid, balance_amount, payment_terms,
    delivery_address, notes, is_active
) VALUES
    (
        'PO-20251022001',
        '2024-10-15',
        (SELECT id FROM vendors LIMIT 1),
        (SELECT id FROM properties LIMIT 1),
        (SELECT id FROM construction_projects WHERE project_code = 'CONS-20251022001'),
        'APPROVED',
        '2024-11-15',
        500000,
        90000,
        10000,
        580000,
        200000,
        380000,
        'Net 30 days',
        'Tower A Site, Main Road',
        'Cement and Steel for foundation work',
        true
    ),
    (
        'PO-20251022002',
        '2024-10-18',
        (SELECT id FROM vendors LIMIT 1 OFFSET 1),
        (SELECT id FROM properties LIMIT 1),
        (SELECT id FROM construction_projects WHERE project_code = 'CONS-20251022001'),
        'ORDERED',
        '2024-11-20',
        300000,
        54000,
        5000,
        349000,
        100000,
        249000,
        'Net 15 days',
        'Tower A Site, Main Road',
        'Plumbing materials for floors 1-5',
        true
    ),
    (
        'PO-20251022003',
        '2024-10-20',
        (SELECT id FROM vendors LIMIT 1),
        (SELECT id FROM properties LIMIT 1 OFFSET 1),
        (SELECT id FROM construction_projects WHERE project_code = 'CONS-20251022002'),
        'DRAFT',
        '2024-11-25',
        750000,
        135000,
        15000,
        870000,
        0,
        870000,
        'Net 30 days',
        'Tower B Site, East Wing',
        'Foundation materials - concrete and reinforcement',
        true
    );

-- ============================================
-- PURCHASE ORDER ITEMS TEST DATA
-- ============================================

INSERT INTO purchase_order_items (
    purchase_order_id, material_id, quantity, unit_price,
    subtotal, tax_percentage, tax_amount, discount_percentage, discount_amount, total_amount, notes
) VALUES
    -- Items for PO-20251022001
    (
        (SELECT id FROM purchase_orders WHERE po_number = 'PO-20251022001'),
        (SELECT id FROM materials LIMIT 1),
        100,
        3000,
        300000,
        18,
        54000,
        2,
        6000,
        348000,
        '50kg cement bags'
    ),
    (
        (SELECT id FROM purchase_orders WHERE po_number = 'PO-20251022001'),
        (SELECT id FROM materials LIMIT 1 OFFSET 1),
        50,
        5000,
        250000,
        18,
        45000,
        2,
        5000,
        290000,
        '12mm steel rods'
    ),
    -- Items for PO-20251022002
    (
        (SELECT id FROM purchase_orders WHERE po_number = 'PO-20251022002'),
        (SELECT id FROM materials LIMIT 1 OFFSET 2),
        200,
        1500,
        300000,
        18,
        54000,
        2,
        6000,
        348000,
        'PVC pipes 4 inch'
    );

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

SELECT 'Construction Projects' as table_name, COUNT(*) as count FROM construction_projects WHERE is_active = true
UNION ALL
SELECT 'Purchase Orders', COUNT(*) FROM purchase_orders WHERE is_active = true
UNION ALL
SELECT 'PO Items', COUNT(*) FROM purchase_order_items
UNION ALL
SELECT 'Construction Teams', COUNT(*) FROM construction_teams WHERE is_active = true
UNION ALL
SELECT 'Progress Logs', COUNT(*) FROM construction_progress_logs;

-- Show summary
SELECT 
    cp.project_code,
    cp.project_name,
    cp.overall_progress,
    COUNT(DISTINCT ct.id) as team_count,
    COUNT(DISTINCT cpl.id) as progress_logs,
    COUNT(DISTINCT po.id) as purchase_orders
FROM construction_projects cp
LEFT JOIN construction_teams ct ON cp.id = ct.construction_project_id AND ct.is_active = true
LEFT JOIN construction_progress_logs cpl ON cp.id = cpl.construction_project_id
LEFT JOIN purchase_orders po ON cp.id = po.construction_project_id AND po.is_active = true
WHERE cp.is_active = true
GROUP BY cp.id, cp.project_code, cp.project_name, cp.overall_progress
ORDER BY cp.project_code;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'Test data loaded successfully!';
  RAISE NOTICE '3 Construction Projects';
  RAISE NOTICE '4 Construction Teams';
  RAISE NOTICE '4 Progress Logs';
  RAISE NOTICE '3 Purchase Orders with items';
  RAISE NOTICE '==============================================';
END $$;
