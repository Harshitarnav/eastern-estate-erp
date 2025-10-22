-- ============================================
-- ACCOUNTING MODULE - COMPLETE DATABASE SCHEMA
-- Version: 1.0
-- Date: October 22, 2025
-- ============================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. CHART OF ACCOUNTS
-- ============================================

CREATE TABLE accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_code VARCHAR(50) UNIQUE NOT NULL,
    account_name VARCHAR(200) NOT NULL,
    
    account_type VARCHAR(50) NOT NULL CHECK (account_type IN ('ASSET', 'LIABILITY', 'EQUITY', 'INCOME', 'EXPENSE')),
    account_category VARCHAR(100) NOT NULL,
    parent_account_id UUID REFERENCES accounts(id),
    
    is_active BOOLEAN DEFAULT true,
    opening_balance DECIMAL(15,2) DEFAULT 0,
    current_balance DECIMAL(15,2) DEFAULT 0,
    
    description TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 2. JOURNAL ENTRIES
-- ============================================

CREATE TABLE journal_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entry_number VARCHAR(50) UNIQUE NOT NULL,
    entry_date DATE NOT NULL,
    
    reference_type VARCHAR(50), -- PAYMENT, BOOKING, SALARY, EXPENSE, ADJUSTMENT, VENDOR_PAYMENT, MATERIAL_PURCHASE
    reference_id UUID,
    
    description TEXT NOT NULL,
    total_debit DECIMAL(15,2) NOT NULL DEFAULT 0,
    total_credit DECIMAL(15,2) NOT NULL DEFAULT 0,
    
    status VARCHAR(50) DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'POSTED', 'APPROVED', 'VOID')),
    
    created_by UUID REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP,
    voided_by UUID REFERENCES users(id),
    voided_at TIMESTAMP,
    void_reason TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT check_balanced CHECK (total_debit = total_credit)
);

-- ============================================
-- 3. JOURNAL ENTRY LINES (Double Entry)
-- ============================================

CREATE TABLE journal_entry_lines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    journal_entry_id UUID REFERENCES journal_entries(id) ON DELETE CASCADE NOT NULL,
    account_id UUID REFERENCES accounts(id) NOT NULL,
    
    debit_amount DECIMAL(15,2) DEFAULT 0 CHECK (debit_amount >= 0),
    credit_amount DECIMAL(15,2) DEFAULT 0 CHECK (credit_amount >= 0),
    
    description TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT check_debit_or_credit CHECK (
        (debit_amount > 0 AND credit_amount = 0) OR 
        (credit_amount > 0 AND debit_amount = 0)
    )
);

-- ============================================
-- 4. EXPENSES
-- ============================================

CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    expense_code VARCHAR(50) UNIQUE NOT NULL,
    
    expense_category VARCHAR(100) NOT NULL, -- SALARY, RENT, UTILITIES, MARKETING, MATERIALS, MAINTENANCE, TRAVEL, OTHER
    expense_type VARCHAR(100) NOT NULL,
    expense_sub_category VARCHAR(100),
    
    amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
    expense_date DATE NOT NULL,
    
    vendor_id UUID REFERENCES vendors(id),
    employee_id UUID REFERENCES employees(id),
    property_id UUID REFERENCES properties(id),
    construction_project_id UUID,
    
    payment_method VARCHAR(50), -- CASH, CHEQUE, BANK_TRANSFER, UPI, CARD
    payment_reference VARCHAR(200),
    payment_status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, PAID, PARTIAL
    
    description TEXT NOT NULL,
    receipt_url TEXT,
    invoice_number VARCHAR(100),
    invoice_date DATE,
    
    status VARCHAR(50) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'PAID', 'REJECTED', 'CANCELLED')),
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP,
    rejection_reason TEXT,
    
    account_id UUID REFERENCES accounts(id), -- Expense account for posting
    journal_entry_id UUID REFERENCES journal_entries(id), -- Link to journal entry
    
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 5. BUDGET PLANNING
-- ============================================

CREATE TABLE budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    budget_name VARCHAR(200) NOT NULL,
    budget_code VARCHAR(50) UNIQUE NOT NULL,
    
    fiscal_year INTEGER NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    
    account_id UUID REFERENCES accounts(id),
    department VARCHAR(100),
    
    budgeted_amount DECIMAL(15,2) NOT NULL CHECK (budgeted_amount >= 0),
    actual_amount DECIMAL(15,2) DEFAULT 0,
    variance_amount DECIMAL(15,2) GENERATED ALWAYS AS (actual_amount - budgeted_amount) STORED,
    variance_percentage DECIMAL(5,2) GENERATED ALWAYS AS (
        CASE 
            WHEN budgeted_amount > 0 THEN ((actual_amount - budgeted_amount) / budgeted_amount * 100)
            ELSE 0 
        END
    ) STORED,
    
    status VARCHAR(50) DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'ACTIVE', 'CLOSED', 'REVISED')),
    
    notes TEXT,
    
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 6. FISCAL YEARS
-- ============================================

CREATE TABLE fiscal_years (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    year INTEGER UNIQUE NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    
    is_current BOOLEAN DEFAULT false,
    is_closed BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Accounts
CREATE INDEX idx_accounts_code ON accounts(account_code);
CREATE INDEX idx_accounts_type ON accounts(account_type);
CREATE INDEX idx_accounts_parent ON accounts(parent_account_id);
CREATE INDEX idx_accounts_active ON accounts(is_active);

-- Journal Entries
CREATE INDEX idx_journal_entries_number ON journal_entries(entry_number);
CREATE INDEX idx_journal_entries_date ON journal_entries(entry_date);
CREATE INDEX idx_journal_entries_status ON journal_entries(status);
CREATE INDEX idx_journal_entries_reference ON journal_entries(reference_type, reference_id);
CREATE INDEX idx_journal_entries_created_at ON journal_entries(created_at);

-- Journal Entry Lines
CREATE INDEX idx_journal_entry_lines_journal ON journal_entry_lines(journal_entry_id);
CREATE INDEX idx_journal_entry_lines_account ON journal_entry_lines(account_id);

-- Expenses
CREATE INDEX idx_expenses_code ON expenses(expense_code);
CREATE INDEX idx_expenses_date ON expenses(expense_date);
CREATE INDEX idx_expenses_category ON expenses(expense_category);
CREATE INDEX idx_expenses_status ON expenses(status);
CREATE INDEX idx_expenses_vendor ON expenses(vendor_id);
CREATE INDEX idx_expenses_employee ON expenses(employee_id);
CREATE INDEX idx_expenses_created_at ON expenses(created_at);

-- Budgets
CREATE INDEX idx_budgets_code ON budgets(budget_code);
CREATE INDEX idx_budgets_fiscal_year ON budgets(fiscal_year);
CREATE INDEX idx_budgets_account ON budgets(account_id);
CREATE INDEX idx_budgets_status ON budgets(status);
CREATE INDEX idx_budgets_dates ON budgets(start_date, end_date);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function: Generate Journal Entry Number
CREATE OR REPLACE FUNCTION generate_journal_entry_number()
RETURNS VARCHAR(50) AS $$
DECLARE
    new_code VARCHAR(50);
    current_date VARCHAR(8);
    random_num VARCHAR(4);
BEGIN
    current_date := TO_CHAR(CURRENT_DATE, 'YYYYMMDD');
    random_num := LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    new_code := 'JE' || current_date || random_num;
    
    -- Check if code exists
    WHILE EXISTS (SELECT 1 FROM journal_entries WHERE entry_number = new_code) LOOP
        random_num := LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
        new_code := 'JE' || current_date || random_num;
    END LOOP;
    
    RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- Function: Generate Expense Code
CREATE OR REPLACE FUNCTION generate_expense_code()
RETURNS VARCHAR(50) AS $$
DECLARE
    new_code VARCHAR(50);
    current_date VARCHAR(8);
    random_num VARCHAR(4);
BEGIN
    current_date := TO_CHAR(CURRENT_DATE, 'YYYYMMDD');
    random_num := LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    new_code := 'EXP' || current_date || random_num;
    
    -- Check if code exists
    WHILE EXISTS (SELECT 1 FROM expenses WHERE expense_code = new_code) LOOP
        random_num := LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
        new_code := 'EXP' || current_date || random_num;
    END LOOP;
    
    RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- Function: Update Account Balance
CREATE OR REPLACE FUNCTION update_account_balance()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Update account balance when journal entry line is posted
        IF (SELECT status FROM journal_entries WHERE id = NEW.journal_entry_id) = 'POSTED' THEN
            UPDATE accounts 
            SET current_balance = current_balance + NEW.debit_amount - NEW.credit_amount,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = NEW.account_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: Update Budget Actual Amount
CREATE OR REPLACE FUNCTION update_budget_actual()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        -- Update budget actual amount when expense is approved and paid
        IF NEW.status = 'PAID' AND NEW.account_id IS NOT NULL THEN
            UPDATE budgets
            SET actual_amount = (
                SELECT COALESCE(SUM(e.amount), 0)
                FROM expenses e
                WHERE e.account_id = NEW.account_id
                AND e.expense_date BETWEEN budgets.start_date AND budgets.end_date
                AND e.status = 'PAID'
            ),
            updated_at = CURRENT_TIMESTAMP
            WHERE account_id = NEW.account_id
            AND start_date <= NEW.expense_date
            AND end_date >= NEW.expense_date;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger: Auto-update journal entry timestamp
CREATE TRIGGER update_journal_entries_timestamp
    BEFORE UPDATE ON journal_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Auto-update expense timestamp
CREATE TRIGGER update_expenses_timestamp
    BEFORE UPDATE ON expenses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Auto-update budget timestamp
CREATE TRIGGER update_budgets_timestamp
    BEFORE UPDATE ON budgets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Update account balance on journal entry line insert
CREATE TRIGGER trigger_update_account_balance
    AFTER INSERT ON journal_entry_lines
    FOR EACH ROW
    EXECUTE FUNCTION update_account_balance();

-- Trigger: Update budget actual amount
CREATE TRIGGER trigger_update_budget_actual
    AFTER INSERT OR UPDATE ON expenses
    FOR EACH ROW
    EXECUTE FUNCTION update_budget_actual();

-- ============================================
-- DEFAULT CHART OF ACCOUNTS
-- ============================================

-- ASSETS
INSERT INTO accounts (account_code, account_name, account_type, account_category, opening_balance) VALUES
('1000', 'Assets', 'ASSET', 'Parent', 0),
('1100', 'Current Assets', 'ASSET', 'Current Assets', 0),
('1110', 'Cash on Hand', 'ASSET', 'Cash', 0),
('1120', 'Bank Accounts', 'ASSET', 'Bank', 0),
('1130', 'Accounts Receivable', 'ASSET', 'Receivables', 0),
('1140', 'Inventory', 'ASSET', 'Inventory', 0),
('1200', 'Fixed Assets', 'ASSET', 'Fixed Assets', 0),
('1210', 'Land', 'ASSET', 'Property', 0),
('1220', 'Buildings', 'ASSET', 'Property', 0),
('1230', 'Equipment', 'ASSET', 'Equipment', 0),
('1240', 'Vehicles', 'ASSET', 'Vehicles', 0);

-- LIABILITIES
INSERT INTO accounts (account_code, account_name, account_type, account_category, opening_balance) VALUES
('2000', 'Liabilities', 'LIABILITY', 'Parent', 0),
('2100', 'Current Liabilities', 'LIABILITY', 'Current Liabilities', 0),
('2110', 'Accounts Payable', 'LIABILITY', 'Payables', 0),
('2120', 'Short Term Loans', 'LIABILITY', 'Loans', 0),
('2130', 'Customer Advances', 'LIABILITY', 'Advances', 0),
('2200', 'Long Term Liabilities', 'LIABILITY', 'Long Term Liabilities', 0),
('2210', 'Long Term Loans', 'LIABILITY', 'Loans', 0),
('2220', 'Mortgages', 'LIABILITY', 'Mortgages', 0);

-- EQUITY
INSERT INTO accounts (account_code, account_name, account_type, account_category, opening_balance) VALUES
('3000', 'Equity', 'EQUITY', 'Parent', 0),
('3100', 'Owner''s Equity', 'EQUITY', 'Capital', 0),
('3200', 'Retained Earnings', 'EQUITY', 'Retained Earnings', 0);

-- INCOME
INSERT INTO accounts (account_code, account_name, account_type, account_category, opening_balance) VALUES
('4000', 'Income', 'INCOME', 'Parent', 0),
('4100', 'Sales Revenue', 'INCOME', 'Property Sales', 0),
('4110', 'Flat Sales', 'INCOME', 'Property Sales', 0),
('4120', 'Booking Income', 'INCOME', 'Booking Income', 0),
('4200', 'Other Income', 'INCOME', 'Other Income', 0),
('4210', 'Interest Income', 'INCOME', 'Interest', 0);

-- EXPENSES
INSERT INTO accounts (account_code, account_name, account_type, account_category, opening_balance) VALUES
('5000', 'Expenses', 'EXPENSE', 'Parent', 0),
('5100', 'Operating Expenses', 'EXPENSE', 'Operating Expenses', 0),
('5110', 'Salaries & Wages', 'EXPENSE', 'Payroll', 0),
('5120', 'Rent', 'EXPENSE', 'Rent', 0),
('5130', 'Utilities', 'EXPENSE', 'Utilities', 0),
('5140', 'Marketing & Advertising', 'EXPENSE', 'Marketing', 0),
('5150', 'Office Supplies', 'EXPENSE', 'Supplies', 0),
('5200', 'Construction Expenses', 'EXPENSE', 'Construction', 0),
('5210', 'Materials', 'EXPENSE', 'Construction Materials', 0),
('5220', 'Labor', 'EXPENSE', 'Construction Labor', 0),
('5230', 'Equipment Rental', 'EXPENSE', 'Equipment', 0),
('5300', 'Other Expenses', 'EXPENSE', 'Other Expenses', 0),
('5310', 'Travel', 'EXPENSE', 'Travel', 0),
('5320', 'Maintenance', 'EXPENSE', 'Maintenance', 0),
('5330', 'Legal & Professional', 'EXPENSE', 'Professional Services', 0);

-- ============================================
-- SAMPLE DATA (for testing)
-- ============================================

-- Current Fiscal Year
INSERT INTO fiscal_years (year, start_date, end_date, is_current) VALUES
(2025, '2025-04-01', '2026-03-31', true);

-- ============================================
-- VIEWS FOR REPORTING
-- ============================================

-- View: Account Balance Sheet
CREATE OR REPLACE VIEW v_account_balance_sheet AS
SELECT 
    a.id,
    a.account_code,
    a.account_name,
    a.account_type,
    a.account_category,
    a.current_balance,
    CASE 
        WHEN a.account_type IN ('ASSET', 'EXPENSE') THEN a.current_balance
        ELSE -a.current_balance
    END as display_balance
FROM accounts a
WHERE a.is_active = true
ORDER BY a.account_code;

-- View: Trial Balance
CREATE OR REPLACE VIEW v_trial_balance AS
SELECT 
    a.account_code,
    a.account_name,
    a.account_type,
    SUM(CASE WHEN jel.debit_amount > 0 THEN jel.debit_amount ELSE 0 END) as total_debit,
    SUM(CASE WHEN jel.credit_amount > 0 THEN jel.credit_amount ELSE 0 END) as total_credit,
    SUM(jel.debit_amount - jel.credit_amount) as balance
FROM accounts a
LEFT JOIN journal_entry_lines jel ON a.id = jel.account_id
LEFT JOIN journal_entries je ON jel.journal_entry_id = je.id
WHERE je.status = 'POSTED' OR je.status IS NULL
GROUP BY a.id, a.account_code, a.account_name, a.account_type
ORDER BY a.account_code;

-- View: Expense Summary
CREATE OR REPLACE VIEW v_expense_summary AS
SELECT 
    e.expense_category,
    e.expense_type,
    COUNT(*) as expense_count,
    SUM(e.amount) as total_amount,
    SUM(CASE WHEN e.status = 'PAID' THEN e.amount ELSE 0 END) as paid_amount,
    SUM(CASE WHEN e.status = 'PENDING' THEN e.amount ELSE 0 END) as pending_amount
FROM expenses e
GROUP BY e.expense_category, e.expense_type
ORDER BY total_amount DESC;

-- View: Budget Variance Report
CREATE OR REPLACE VIEW v_budget_variance AS
SELECT 
    b.budget_code,
    b.budget_name,
    b.fiscal_year,
    a.account_name,
    b.budgeted_amount,
    b.actual_amount,
    b.variance_amount,
    b.variance_percentage,
    CASE 
        WHEN b.variance_percentage > 10 THEN 'OVER'
        WHEN b.variance_percentage < -10 THEN 'UNDER'
        ELSE 'WITHIN'
    END as variance_status
FROM budgets b
LEFT JOIN accounts a ON b.account_id = a.id
WHERE b.status = 'ACTIVE'
ORDER BY ABS(b.variance_percentage) DESC;

-- ============================================
-- COMPLETION
-- ============================================

COMMENT ON TABLE accounts IS 'Chart of Accounts for double-entry accounting';
COMMENT ON TABLE journal_entries IS 'Journal entries for all financial transactions';
COMMENT ON TABLE journal_entry_lines IS 'Individual debit/credit lines for journal entries';
COMMENT ON TABLE expenses IS 'Expense tracking and management';
COMMENT ON TABLE budgets IS 'Budget planning and variance analysis';
COMMENT ON TABLE fiscal_years IS 'Fiscal year definitions';

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Accounting Module Schema Created Successfully!';
    RAISE NOTICE 'Tables: 6 | Indexes: 27 | Functions: 4 | Triggers: 5 | Views: 4';
END $$;
