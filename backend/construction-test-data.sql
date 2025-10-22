-- Construction Module Test Data
-- Run this after the main schema is created

-- Note: This assumes you have properties, vendors, materials, and employees already in the database
-- If not, you'll need to replace the IDs with actual IDs from your database

-- ============================================
-- CONSTRUCTION PROJECTS TEST DATA
-- ============================================

-- Insert sample construction projects (replace property IDs with actual ones)
INSERT INTO construction_projects (
    project_code, project_name, property_id, tower_id, site_engineer_id,
    project_phase, status, start_date, estimated_completion_date,
    estimated_budget, actual_cost, overall_progress, structure_progress,
    interior_progress, finishing_progress, is_active
) VALUES
    (
        'CONS-20251022001',
        'Tower A Construction',
        (SELECT id FROM properties LIMIT 1),
        (SELECT id FROM towers LIMIT 1),
        (SELECT id FROM employees LIMIT 1),
        'STRUCTURE',
        'IN_PROGRESS',
        '2024-01-15',
        '2025-12-31',
        50000000,
        25000000,
        45.5,
        60.0,
        30.0,
        15.0,
        true
    ),
    (
        'CONS-20251022002',
        'Tower B Foundation',
        (SELECT id FROM properties LIMIT 1 OFFSET 1),
        (SELECT id FROM towers LIMIT 1 OFFSET 1),
        (SELECT id FROM employees LIMIT 1 OFFSET 1),
        'FOUNDATION',
        'IN_PROGRESS',
        '2024-06-01',
        '2026-03-31',
        35000000,
        15000000,
        25.0,
        40.0,
        10.0,
        5.0,
        true
    ),
    (
        'CONS-20251022003',
        'Amenities Block',
        (SELECT id FROM properties LIMIT 1),
        NULL,
        (SELECT id FROM employees LIMIT 1),
        'FINISHING',
        'IN_PROGRESS',
        '2023-09-01',
        '2024-12-31',
        20000000,
        18500000,
        85.0,
        100.0,
        90.0,
        75.0,
        true
    );

-- ============================================
-- PURCHASE ORDERS TEST DATA
-- ============================================

-- Insert sample purchase orders (replace IDs with actual ones)
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

-- Insert PO items (replace IDs with actual material IDs)
INSERT INTO purchase_order_items (
    purchase_order_id, material_id, quantity, unit_price,
    tax_percentage, discount_percentage, total_amount, notes
) VALUES
    -- Items for PO-20251022001
    (
        (SELECT id FROM purchase_orders WHERE po_number = 'PO-20251022001'),
        (SELECT id FROM materials LIMIT 1),
        100,
        3000,
        18,
        2,
        294000,
        '50kg cement bags'
    ),
    (
        (SELECT id FROM purchase_orders WHERE po_number = 'PO-20251022001'),
        (SELECT id FROM materials LIMIT 1 OFFSET 1),
        50,
        5000,
        18,
        2,
        245000,
        '12mm steel rods'
    ),
    -- Items for PO-20251022002
    (
        (SELECT id FROM purchase_orders WHERE po_number = 'PO-20251022002'),
        (SELECT id FROM materials LIMIT 1 OFFSET 2),
        200,
        1500,
        18,
        2,
        294000,
        'PVC pipes 4 inch'
    );

-- ============================================
-- CONSTRUCTION TEAMS TEST DATA
-- ============================================

-- Insert team members (replace IDs with actual employee IDs)
INSERT INTO construction_teams (
    construction_project_id, employee_id, role, assigned_date, is_active
) VALUES
    (
        (SELECT id FROM construction_projects WHERE project_code = 'CONS-20251022001'),
        (SELECT id FROM employees LIMIT 1),
        'Site Engineer',
        '2024-01-15',
        true
    ),
    (
        (SELECT id FROM construction_projects WHERE project_code = 'CONS-20251022001'),
        (SELECT id FROM employees LIMIT 1 OFFSET 1),
        'Foreman',
        '2024-01-15',
        true
    ),
    (
        (SELECT id FROM construction_projects WHERE project_code = 'CONS-20251022001'),
        (SELECT id FROM employees LIMIT 1 OFFSET 2),
        'Safety Officer',
        '2024-01-20',
        true
    ),
    (
        (SELECT id FROM construction_projects WHERE project_code = 'CONS-20251022002'),
        (SELECT id FROM employees LIMIT 1 OFFSET 1),
        'Site Engineer',
        '2024-06-01',
        true
    ),
    (
        (SELECT id FROM construction_projects WHERE project_code = 'CONS-20251022003'),
        (SELECT id FROM employees LIMIT 1),
        'Project Manager',
        '2023-09-01',
        true
    );

-- ============================================
-- PROGRESS LOGS TEST DATA
-- ============================================

-- Insert progress logs
INSERT INTO construction_progress_logs (
    construction_project_id, log_date, work_description,
    overall_progress, structure_progress, interior_progress, finishing_progress,
    workers_present, weather_condition, issues_faced, logged_by_id
) VALUES
    (
        (SELECT id FROM construction_projects WHERE project_code = 'CONS-20251022001'),
        '2024-10-20',
        'Completed 3rd floor slab casting. Started column work for 4th floor.',
        45.5,
        60.0,
        30.0,
        15.0,
        35,
        'Sunny',
        'None',
        (SELECT id FROM employees LIMIT 1)
    ),
    (
        (SELECT id FROM construction_projects WHERE project_code = 'CONS-20251022001'),
        '2024-10-19',
        'Installed plumbing lines for floors 1-2. Electrical conduit work in progress.',
        44.0,
        58.0,
        28.0,
        14.0,
        32,
        'Partly Cloudy',
        'Minor delay in material delivery',
        (SELECT id FROM employees LIMIT 1)
    ),
    (
        (SELECT id FROM construction_projects WHERE project_code = 'CONS-20251022002'),
        '2024-10-20',
        'Foundation excavation completed. Started laying foundation base.',
        25.0,
        40.0,
        10.0,
        5.0,
        28,
        'Sunny',
        'None',
        (SELECT id FROM employees LIMIT 1 OFFSET 1)
    ),
    (
        (SELECT id FROM construction_projects WHERE project_code = 'CONS-20251022003'),
        '2024-10-20',
        'Final finishing touches. Painting completed in 80% area.',
        85.0,
        100.0,
        90.0,
        75.0,
        20,
        'Clear',
        'Waiting for final inspection approval',
        (SELECT id FROM employees LIMIT 1)
    );

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check inserted data
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
    COUNT(DISTINCT ct.id) as team_members,
    COUNT(DISTINCT cpl.id) as progress_logs,
    COUNT(DISTINCT po.id) as purchase_orders
FROM construction_projects cp
LEFT JOIN construction_teams ct ON cp.id = ct.construction_project_id AND ct.is_active = true
LEFT JOIN construction_progress_logs cpl ON cp.id = cpl.construction_project_id
LEFT JOIN purchase_orders po ON cp.id = po.construction_project_id AND po.is_active = true
WHERE cp.is_active = true
GROUP BY cp.id, cp.project_code, cp.project_name, cp.overall_progress
ORDER BY cp.project_code;

COMMIT;
