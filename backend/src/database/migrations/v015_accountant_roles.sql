-- v015: Accountant roles (assign via User Management / Property Access as needed)
-- Idempotent inserts

INSERT INTO roles (name, display_name, description, is_system, is_active)
SELECT 'accountant', 'Accountant',
       'Project-scoped accounting: books, expenses, JEs, reports for assigned projects only',
       TRUE, TRUE
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'accountant');

INSERT INTO roles (name, display_name, description, is_system, is_active)
SELECT 'head_accountant', 'Head Accountant',
       'Company-wide accounting view, budgets, payroll visibility, all-project reports',
       TRUE, TRUE
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'head_accountant');
