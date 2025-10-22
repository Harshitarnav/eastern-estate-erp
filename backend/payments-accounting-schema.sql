-- ============================================================================
-- PAYMENTS & ACCOUNTING MODULE - COMPLETE DATABASE SCHEMA
-- ============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- PAYMENTS MODULE
-- ============================================================================

-- Payment Transactions Table
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_code VARCHAR(50) UNIQUE NOT NULL,
    
    -- References
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    vendor_id UUID,
    
    -- Payment Details
    payment_type VARCHAR(50) NOT NULL CHECK (payment_type IN ('BOOKING', 'SALARY', 'VENDOR', 'EXPENSE', 'OTHER')),
    payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('CASH', 'CHEQUE', 'BANK_TRANSFER', 'UPI', 'CARD', 'OTHER')),
    payment_category VARCHAR(50) NOT NULL,
    
    amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    
    -- Bank Details
    bank_name VARCHAR(200),
    account_number VARCHAR(50),
    transaction_reference VARCHAR(200),
    cheque_number VARCHAR(50),
    cheque_date DATE,
    upi_id VARCHAR(100),
    
    -- Status
    status VARCHAR(50) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED', 'REFUNDED')),
    verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
    verified_at TIMESTAMP,
    
    -- Receipt
    receipt_number VARCHAR(50),
    receipt_url TEXT,
    
    -- Notes
    notes TEXT,
    remarks TEXT,
    
    -- Timestamps
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payment Installments (EMI tracking)
CREATE TABLE IF NOT EXISTS payment_installments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE NOT NULL,
    
    installment_number INTEGER NOT NULL,
    due_date DATE NOT NULL,
    amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
    
    status VARCHAR(50) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PAID', 'OVERDUE', 'WAIVED', 'PARTIAL')),
    
    payment_id UUID REFERENCES payments(id) ON DELETE SET NULL,
    paid_date DATE,
    paid_amount DECIMAL(15,2) DEFAULT 0,
    
    -- Late fees
    late_fee DECIMAL(10,2) DEFAULT 0,
    late_fee_waived BOOLEAN DEFAULT false,
    
    notes TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(booking_id, installment_number)
);

-- Payment Refunds
CREATE TABLE IF NOT EXISTS payment_refunds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_id UUID REFERENCES payments(id) ON DELETE CASCADE NOT NULL,
    
    refund_amount DECIMAL(15,2) NOT NULL CHECK (refund_amount > 0),
    refund_reason TEXT NOT NULL,
    refund_date DATE NOT NULL,
    refund_method VARCHAR(50) NOT NULL,
    
    status VARCHAR(50) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'PROCESSED', 'REJECTED')),
    
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_at TIMESTAMP,
    processed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    processed_at TIMESTAMP,
    
    bank_details TEXT,
    transaction_reference VARCHAR(200),
    
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- ACCOUNTING MODULE
-- ============================================================================

-- Chart of Accounts
CREATE TABLE IF NOT EXISTS accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_code VARCHAR(50) UNIQUE NOT NULL,
    account_name VARCHAR(200) NOT NULL,
    
    account_type VARCHAR(50) NOT NULL CHECK (account_type IN ('ASSET', 'LIABILITY', 'EQUITY', 'INCOME', 'EXPENSE')),
    account_category VARCHAR(100) NOT NULL,
    parent_account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
    
    is_active BOOLEAN DEFAULT true,
    opening_balance DECIMAL(15,2) DEFAULT 0,
    current_balance DECIMAL(15,2) DEFAULT 0,
    
    description TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Journal Entries
CREATE TABLE IF NOT EXISTS journal_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entry_number VARCHAR(50) UNIQUE NOT NULL,
    entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
    
    reference_type VARCHAR(50),
    reference_id UUID,
    
    description TEXT NOT NULL,
    total_debit DECIMAL(15,2) NOT NULL DEFAULT 0,
    total_credit DECIMAL(15,2) NOT NULL DEFAULT 0,
    
    status VARCHAR(50) DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'POSTED', 'APPROVED', 'VOID')),
    
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT journal_balanced CHECK (total_debit = total_credit)
);

-- Journal Entry Lines
CREATE TABLE IF NOT EXISTS journal_entry_lines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    journal_entry_id UUID REFERENCES journal_entries(id) ON DELETE CASCADE NOT NULL,
    account_id UUID REFERENCES accounts(id) ON DELETE RESTRICT NOT NULL,
    
    debit_amount DECIMAL(15,2) DEFAULT 0 CHECK (debit_amount >= 0),
    credit_amount DECIMAL(15,2) DEFAULT 0 CHECK (credit_amount >= 0),
    
    description TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT debit_or_credit CHECK (
        (debit_amount > 0 AND credit_amount = 0) OR 
        (credit_amount > 0 AND debit_amount = 0)
    )
);

-- Expenses
CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    expense_code VARCHAR(50) UNIQUE NOT NULL,
    
    expense_category VARCHAR(100) NOT NULL,
    expense_type VARCHAR(100) NOT NULL,
    
    amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
    expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
    
    vendor_id UUID,
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    
    payment_method VARCHAR(50),
    payment_reference VARCHAR(200),
    
    description TEXT NOT NULL,
    receipt_url TEXT,
    
    status VARCHAR(50) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'PAID', 'REJECTED')),
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_at TIMESTAMP,
    
    account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
    journal_entry_id UUID REFERENCES journal_entries(id) ON DELETE SET NULL,
    
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Budget Planning
CREATE TABLE IF NOT EXISTS budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    budget_name VARCHAR(200) NOT NULL,
    
    fiscal_year INTEGER NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    
    account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
    budgeted_amount DECIMAL(15,2) NOT NULL CHECK (budgeted_amount >= 0),
    actual_amount DECIMAL(15,2) DEFAULT 0,
    
    status VARCHAR(50) DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'ACTIVE', 'CLOSED')),
    
    notes TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(account_id, fiscal_year)
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Payments indexes
CREATE INDEX IF NOT EXISTS idx_payments_booking ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_customer ON payments(customer_id);
CREATE INDEX IF NOT EXISTS idx_payments_employee ON payments(employee_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_type ON payments(payment_type);
CREATE INDEX IF NOT EXISTS idx_payments_code ON payments(payment_code);

-- Installments indexes
CREATE INDEX IF NOT EXISTS idx_installments_booking ON payment_installments(booking_id);
CREATE INDEX IF NOT EXISTS idx_installments_due_date ON payment_installments(due_date);
CREATE INDEX IF NOT EXISTS idx_installments_status ON payment_installments(status);
CREATE INDEX IF NOT EXISTS idx_installments_payment ON payment_installments(payment_id);

-- Refunds indexes
CREATE INDEX IF NOT EXISTS idx_refunds_payment ON payment_refunds(payment_id);
CREATE INDEX IF NOT EXISTS idx_refunds_status ON payment_refunds(status);
CREATE INDEX IF NOT EXISTS idx_refunds_date ON payment_refunds(refund_date);

-- Accounts indexes
CREATE INDEX IF NOT EXISTS idx_accounts_code ON accounts(account_code);
CREATE INDEX IF NOT EXISTS idx_accounts_type ON accounts(account_type);
CREATE INDEX IF NOT EXISTS idx_accounts_active ON accounts(is_active);
CREATE INDEX IF NOT EXISTS idx_accounts_parent ON accounts(parent_account_id);

-- Journal entries indexes
CREATE INDEX IF NOT EXISTS idx_journal_entries_date ON journal_entries(entry_date);
CREATE INDEX IF NOT EXISTS idx_journal_entries_status ON journal_entries(status);
CREATE INDEX IF NOT EXISTS idx_journal_entries_reference ON journal_entries(reference_type, reference_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_number ON journal_entries(entry_number);

-- Journal entry lines indexes
CREATE INDEX IF NOT EXISTS idx_journal_entry_lines_entry ON journal_entry_lines(journal_entry_id);
CREATE INDEX IF NOT EXISTS idx_journal_entry_lines_account ON journal_entry_lines(account_id);

-- Expenses indexes
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(expense_date);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(expense_category);
CREATE INDEX IF NOT EXISTS idx_expenses_status ON expenses(status);
CREATE INDEX IF NOT EXISTS idx_expenses_vendor ON expenses(vendor_id);
CREATE INDEX IF NOT EXISTS idx_expenses_employee ON expenses(employee_id);
CREATE INDEX IF NOT EXISTS idx_expenses_code ON expenses(expense_code);

-- Budgets indexes
CREATE INDEX IF NOT EXISTS idx_budgets_fiscal_year ON budgets(fiscal_year);
CREATE INDEX IF NOT EXISTS idx_budgets_account ON budgets(account_id);
CREATE INDEX IF NOT EXISTS idx_budgets_status ON budgets(status);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to generate payment code
CREATE OR REPLACE FUNCTION generate_payment_code()
RETURNS TEXT AS $$
DECLARE
    new_code TEXT;
    code_exists BOOLEAN;
BEGIN
    LOOP
        new_code := 'PAY' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
        SELECT EXISTS(SELECT 1 FROM payments WHERE payment_code = new_code) INTO code_exists;
        EXIT WHEN NOT code_exists;
    END LOOP;
    RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- Function to generate expense code
CREATE OR REPLACE FUNCTION generate_expense_code()
RETURNS TEXT AS $$
DECLARE
    new_code TEXT;
    code_exists BOOLEAN;
BEGIN
    LOOP
        new_code := 'EXP' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
        SELECT EXISTS(SELECT 1 FROM expenses WHERE expense_code = new_code) INTO code_exists;
        EXIT WHEN NOT code_exists;
    END LOOP;
    RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- Function to generate journal entry number
CREATE OR REPLACE FUNCTION generate_journal_entry_number()
RETURNS TEXT AS $$
DECLARE
    new_number TEXT;
    number_exists BOOLEAN;
BEGIN
    LOOP
        new_number := 'JE' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
        SELECT EXISTS(SELECT 1 FROM journal_entries WHERE entry_number = new_number) INTO number_exists;
        EXIT WHEN NOT number_exists;
    END LOOP;
    RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Function to update account balance
CREATE OR REPLACE FUNCTION update_account_balance()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE accounts 
        SET current_balance = current_balance + NEW.debit_amount - NEW.credit_amount,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.account_id;
    ELSIF TG_OP = 'UPDATE' THEN
        UPDATE accounts 
        SET current_balance = current_balance - OLD.debit_amount + OLD.credit_amount + NEW.debit_amount - NEW.credit_amount,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.account_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE accounts 
        SET current_balance = current_balance - OLD.debit_amount + OLD.credit_amount,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = OLD.account_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update account balances
CREATE TRIGGER trigger_update_account_balance
AFTER INSERT OR UPDATE OR DELETE ON journal_entry_lines
FOR EACH ROW EXECUTE FUNCTION update_account_balance();

-- Function to check overdue installments
CREATE OR REPLACE FUNCTION check_overdue_installments()
RETURNS void AS $$
BEGIN
    UPDATE payment_installments
    SET status = 'OVERDUE'
    WHERE status = 'PENDING'
    AND due_date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- INITIAL DATA - Default Chart of Accounts
-- ============================================================================

INSERT INTO accounts (account_code, account_name, account_type, account_category, opening_balance) VALUES
-- Assets
('1000', 'Assets', 'ASSET', 'Main', 0),
('1100', 'Current Assets', 'ASSET', 'Sub-category', 0),
('1110', 'Cash', 'ASSET', 'Cash & Bank', 0),
('1120', 'Bank Account', 'ASSET', 'Cash & Bank', 0),
('1130', 'Accounts Receivable', 'ASSET', 'Receivables', 0),
('1200', 'Fixed Assets', 'ASSET', 'Sub-category', 0),
('1210', 'Property', 'ASSET', 'Fixed Assets', 0),
('1220', 'Equipment', 'ASSET', 'Fixed Assets', 0),

-- Liabilities
('2000', 'Liabilities', 'LIABILITY', 'Main', 0),
('2100', 'Current Liabilities', 'LIABILITY', 'Sub-category', 0),
('2110', 'Accounts Payable', 'LIABILITY', 'Payables', 0),
('2120', 'Salary Payable', 'LIABILITY', 'Payables', 0),

-- Equity
('3000', 'Equity', 'EQUITY', 'Main', 0),
('3100', 'Owner Equity', 'EQUITY', 'Capital', 0),
('3200', 'Retained Earnings', 'EQUITY', 'Earnings', 0),

-- Income
('4000', 'Income', 'INCOME', 'Main', 0),
('4100', 'Sales Revenue', 'INCOME', 'Revenue', 0),
('4110', 'Booking Revenue', 'INCOME', 'Revenue', 0),

-- Expenses
('5000', 'Expenses', 'EXPENSE', 'Main', 0),
('5100', 'Operating Expenses', 'EXPENSE', 'Sub-category', 0),
('5110', 'Salary Expense', 'EXPENSE', 'Employee Costs', 0),
('5120', 'Rent Expense', 'EXPENSE', 'Operating', 0),
('5130', 'Utilities Expense', 'EXPENSE', 'Operating', 0),
('5140', 'Marketing Expense', 'EXPENSE', 'Operating', 0),
('5150', 'Material Expense', 'EXPENSE', 'Construction', 0)
ON CONFLICT (account_code) DO NOTHING;

-- ============================================================================
-- VIEWS
-- ============================================================================

-- View for payment summary
CREATE OR REPLACE VIEW payment_summary AS
SELECT 
    DATE_TRUNC('month', payment_date) as month,
    payment_type,
    payment_method,
    status,
    COUNT(*) as payment_count,
    SUM(amount) as total_amount
FROM payments
GROUP BY DATE_TRUNC('month', payment_date), payment_type, payment_method, status;

-- View for overdue installments
CREATE OR REPLACE VIEW overdue_installments AS
SELECT 
    pi.*,
    b.booking_code,
    c.name as customer_name,
    (CURRENT_DATE - pi.due_date) as days_overdue
FROM payment_installments pi
JOIN bookings b ON pi.booking_id = b.id
JOIN customers c ON b.customer_id = c.id
WHERE pi.status IN ('PENDING', 'PARTIAL', 'OVERDUE')
AND pi.due_date < CURRENT_DATE;

-- View for account balances
CREATE OR REPLACE VIEW account_balances AS
SELECT 
    a.id,
    a.account_code,
    a.account_name,
    a.account_type,
    a.opening_balance,
    a.current_balance,
    (a.current_balance - a.opening_balance) as change
FROM accounts a
WHERE a.is_active = true;

COMMENT ON TABLE payments IS 'Stores all payment transactions';
COMMENT ON TABLE payment_installments IS 'Tracks EMI/installment schedules';
COMMENT ON TABLE payment_refunds IS 'Manages payment refund requests';
COMMENT ON TABLE accounts IS 'Chart of accounts for double-entry bookkeeping';
COMMENT ON TABLE journal_entries IS 'Journal entries for all financial transactions';
COMMENT ON TABLE journal_entry_lines IS 'Line items for journal entries';
COMMENT ON TABLE expenses IS 'Tracks all business expenses';
COMMENT ON TABLE budgets IS 'Budget planning and tracking';
