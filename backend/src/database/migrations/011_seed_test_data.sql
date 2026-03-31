-- Migration 011: Seed test data for accounting integration testing
-- Creates expenses, salary payments, and journal entries for a realistic accounting state

-- ============================================================
-- EXPENSES
-- ============================================================
DO $$
BEGIN
  -- Insert sample expenses if none exist
  IF (SELECT COUNT(*) FROM expenses) = 0 THEN
    INSERT INTO expenses (id, expense_code, expense_category, expense_type, amount, expense_date, description, status, created_at, updated_at)
    VALUES
      (gen_random_uuid(), 'EXP-2026-001', 'CONSTRUCTION', 'MATERIAL',  285000.00, CURRENT_DATE - INTERVAL '30 days', 'Cement, sand, and steel rods for Block A foundation', 'APPROVED', NOW(), NOW()),
      (gen_random_uuid(), 'EXP-2026-002', 'LABOUR',       'CONTRACTOR',150000.00, CURRENT_DATE - INTERVAL '15 days', 'Monthly labour contractor fees for March 2026',        'APPROVED', NOW(), NOW()),
      (gen_random_uuid(), 'EXP-2026-003', 'CONSTRUCTION', 'ELECTRICAL', 95000.00, CURRENT_DATE - INTERVAL '10 days', 'Internal wiring and panel installation - Block B',      'PENDING',  NOW(), NOW()),
      (gen_random_uuid(), 'EXP-2026-004', 'ADMINISTRATIVE','SUPPLIES',   8500.00, CURRENT_DATE - INTERVAL '5 days',  'Printer cartridges, paper, stationery for main office', 'APPROVED', NOW(), NOW()),
      (gen_random_uuid(), 'EXP-2026-005', 'MARKETING',    'ADVERTISING',45000.00, CURRENT_DATE - INTERVAL '2 days',  'Brochure printing and digital ads for Tower C launch',  'APPROVED', NOW(), NOW());

    RAISE NOTICE 'Inserted 5 sample expenses';
  ELSE
    RAISE NOTICE 'Expenses already exist, skipping';
  END IF;
END $$;

-- ============================================================
-- SALARY PAYMENTS
-- ============================================================
DO $$
DECLARE
  v_emp1 UUID;
  v_emp2 UUID;
  v_emp3 UUID;
BEGIN
  -- Get first 3 employees
  SELECT id INTO v_emp1 FROM employees ORDER BY created_at LIMIT 1;
  SELECT id INTO v_emp2 FROM employees ORDER BY created_at OFFSET 1 LIMIT 1;
  SELECT id INTO v_emp3 FROM employees ORDER BY created_at OFFSET 2 LIMIT 1;

  IF (SELECT COUNT(*) FROM salary_payments) = 0 AND v_emp1 IS NOT NULL THEN
    INSERT INTO salary_payments (
      id, employee_id, payment_month, basic_salary, hra, special_allowance,
      pf_deduction, tds_deduction, other_deductions, gross_salary, net_salary,
      payment_status, payment_mode, payment_date, remarks, created_at, updated_at
    )
    VALUES
      (
        gen_random_uuid(), v_emp1, '2026-02-01', 60000.00, 15000.00, 5000.00,
        7200.00, 3000.00, 0.00, 80000.00, 69800.00,
        'PAID', 'BANK_TRANSFER', '2026-03-01', 'February 2026 salary', NOW(), NOW()
      ),
      (
        gen_random_uuid(), v_emp2, '2026-02-01', 45000.00, 11250.00, 3500.00,
        5400.00, 2000.00, 0.00, 59750.00, 52350.00,
        'PAID', 'BANK_TRANSFER', '2026-03-01', 'February 2026 salary', NOW(), NOW()
      ),
      (
        gen_random_uuid(), v_emp3, '2026-02-01', 35000.00, 8750.00, 2500.00,
        4200.00, 1500.00, 0.00, 46250.00, 40550.00,
        'PAID', 'BANK_TRANSFER', '2026-03-01', 'February 2026 salary', NOW(), NOW()
      );
    RAISE NOTICE 'Inserted 3 sample salary payments';
  ELSE
    RAISE NOTICE 'Salary payments already exist or no employees found, skipping';
  END IF;
END $$;

-- ============================================================
-- JOURNAL ENTRIES (manual test data for reports)
-- ============================================================
DO $$
DECLARE
  v_cash_acct    UUID;
  v_revenue_acct UUID;
  v_expense_acct UUID;
  v_salary_acct  UUID;
  v_je1          UUID;
  v_je2          UUID;
  v_je3          UUID;
BEGIN
  -- Find accounts
  SELECT id INTO v_cash_acct    FROM accounts WHERE account_type = 'ASSET'   AND account_name ILIKE '%cash%'    LIMIT 1;
  SELECT id INTO v_revenue_acct FROM accounts WHERE account_type = 'REVENUE'                                    LIMIT 1;
  SELECT id INTO v_expense_acct FROM accounts WHERE account_type = 'EXPENSE'                                    LIMIT 1;
  SELECT id INTO v_salary_acct  FROM accounts WHERE account_type = 'EXPENSE' AND account_name ILIKE '%salary%'  LIMIT 1;

  IF v_salary_acct IS NULL THEN
    v_salary_acct := v_expense_acct;
  END IF;

  -- Only seed if we have the required accounts and < 3 journal entries
  IF v_cash_acct IS NOT NULL AND v_revenue_acct IS NOT NULL AND v_expense_acct IS NOT NULL
     AND (SELECT COUNT(*) FROM journal_entries) < 3 THEN

    -- JE 1: Payment received from customer
    v_je1 := gen_random_uuid();
    INSERT INTO journal_entries (id, entry_number, entry_date, description, reference_type, status, created_at, updated_at)
    VALUES (v_je1, 'JE-SEED-001', CURRENT_DATE - INTERVAL '20 days', 'Payment received - Booking PAY-001', 'PAYMENT', 'POSTED', NOW(), NOW());

    INSERT INTO journal_entry_lines (id, journal_entry_id, account_id, debit_amount, credit_amount, description, created_at, updated_at)
    VALUES
      (gen_random_uuid(), v_je1, v_cash_acct,    500000.00, 0.00,      'Cash received from customer', NOW(), NOW()),
      (gen_random_uuid(), v_je1, v_revenue_acct, 0.00,      500000.00, 'Revenue - Property sale',     NOW(), NOW());

    -- Update account balances
    UPDATE accounts SET current_balance = current_balance + 500000 WHERE id = v_cash_acct;
    UPDATE accounts SET current_balance = current_balance + 500000 WHERE id = v_revenue_acct;

    -- JE 2: Site expenses paid
    v_je2 := gen_random_uuid();
    INSERT INTO journal_entries (id, entry_number, entry_date, description, reference_type, status, created_at, updated_at)
    VALUES (v_je2, 'JE-SEED-002', CURRENT_DATE - INTERVAL '15 days', 'Site materials expense - Block A', 'EXPENSE', 'POSTED', NOW(), NOW());

    INSERT INTO journal_entry_lines (id, journal_entry_id, account_id, debit_amount, credit_amount, description, created_at, updated_at)
    VALUES
      (gen_random_uuid(), v_je2, v_expense_acct, 285000.00, 0.00,      'Site materials - Block A', NOW(), NOW()),
      (gen_random_uuid(), v_je2, v_cash_acct,    0.00,      285000.00, 'Cash paid for materials',  NOW(), NOW());

    UPDATE accounts SET current_balance = current_balance + 285000 WHERE id = v_expense_acct;
    UPDATE accounts SET current_balance = current_balance - 285000 WHERE id = v_cash_acct;

    -- JE 3: Salary payment
    IF v_salary_acct IS NOT NULL THEN
      v_je3 := gen_random_uuid();
      INSERT INTO journal_entries (id, entry_number, entry_date, description, reference_type, status, created_at, updated_at)
      VALUES (v_je3, 'JE-SEED-003', CURRENT_DATE - INTERVAL '5 days', 'Salary payment - March 2026', 'SALARY', 'POSTED', NOW(), NOW());

      INSERT INTO journal_entry_lines (id, journal_entry_id, account_id, debit_amount, credit_amount, description, created_at, updated_at)
      VALUES
        (gen_random_uuid(), v_je3, v_salary_acct, 162700.00, 0.00,      'Salary expense March 2026', NOW(), NOW()),
        (gen_random_uuid(), v_je3, v_cash_acct,   0.00,      162700.00, 'Cash paid for salaries',    NOW(), NOW());

      UPDATE accounts SET current_balance = current_balance + 162700 WHERE id = v_salary_acct;
      UPDATE accounts SET current_balance = current_balance - 162700 WHERE id = v_cash_acct;
    END IF;

    RAISE NOTICE 'Inserted 3 seed journal entries';
  ELSE
    RAISE NOTICE 'Journal entries already exist or required accounts not found, skipping JE seed';
  END IF;
END $$;

-- ============================================================
-- VERIFY
-- ============================================================
SELECT 'expenses' AS table_name, COUNT(*) FROM expenses
UNION ALL SELECT 'salary_payments', COUNT(*) FROM salary_payments
UNION ALL SELECT 'journal_entries', COUNT(*) FROM journal_entries
UNION ALL SELECT 'journal_entry_lines', COUNT(*) FROM journal_entry_lines;
