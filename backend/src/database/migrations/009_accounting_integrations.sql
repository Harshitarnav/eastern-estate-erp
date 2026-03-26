-- ============================================================
-- Migration 009: Accounting Module Integrations
-- ============================================================
-- 1. Add journal_entry_id to payments table (track auto-JE)
-- 2. Create salary_payments table (if not exists)
-- 3. Fix salary_payments entity column names for snake_case
-- ============================================================

-- 1. Link payments to auto-created journal entries
ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS journal_entry_id UUID REFERENCES journal_entries(id) ON DELETE SET NULL;

-- 2. Create salary_payments table (SnakeNamingStrategy compatible)
CREATE TABLE IF NOT EXISTS salary_payments (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id          UUID NOT NULL REFERENCES employees(id) ON DELETE RESTRICT,
  payment_month        DATE NOT NULL,
  working_days         INT NOT NULL DEFAULT 26,
  present_days         INT NOT NULL DEFAULT 26,
  absent_days          INT NOT NULL DEFAULT 0,
  paid_leave_days      INT NOT NULL DEFAULT 0,
  unpaid_leave_days    INT NOT NULL DEFAULT 0,
  overtime_hours       INT NOT NULL DEFAULT 0,

  -- Earnings
  basic_salary         NUMERIC(15,2) NOT NULL DEFAULT 0,
  house_rent_allowance NUMERIC(15,2) NOT NULL DEFAULT 0,
  transport_allowance  NUMERIC(15,2) NOT NULL DEFAULT 0,
  medical_allowance    NUMERIC(15,2) NOT NULL DEFAULT 0,
  overtime_payment     NUMERIC(15,2) NOT NULL DEFAULT 0,
  other_allowances     NUMERIC(15,2) NOT NULL DEFAULT 0,
  gross_salary         NUMERIC(15,2) NOT NULL DEFAULT 0,

  -- Deductions
  pf_deduction         NUMERIC(15,2) NOT NULL DEFAULT 0,
  esi_deduction        NUMERIC(15,2) NOT NULL DEFAULT 0,
  tax_deduction        NUMERIC(15,2) NOT NULL DEFAULT 0,
  advance_deduction    NUMERIC(15,2) NOT NULL DEFAULT 0,
  loan_deduction       NUMERIC(15,2) NOT NULL DEFAULT 0,
  other_deductions     NUMERIC(15,2) NOT NULL DEFAULT 0,
  total_deductions     NUMERIC(15,2) NOT NULL DEFAULT 0,
  net_salary           NUMERIC(15,2) NOT NULL DEFAULT 0,

  -- Payment details
  payment_status       VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  payment_mode         VARCHAR(20),
  payment_date         DATE,
  transaction_reference VARCHAR(100),
  payment_remarks      VARCHAR(200),

  -- Bank details
  bank_name            VARCHAR(200),
  account_number       VARCHAR(50),
  ifsc_code            VARCHAR(50),

  -- Meta
  notes                TEXT,
  is_active            BOOLEAN NOT NULL DEFAULT TRUE,
  created_at           TIMESTAMP NOT NULL DEFAULT now(),
  updated_at           TIMESTAMP NOT NULL DEFAULT now(),
  created_by           UUID,
  updated_by           UUID,
  approved_by          UUID,
  approved_at          TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_salary_payments_employee ON salary_payments(employee_id);
CREATE INDEX IF NOT EXISTS idx_salary_payments_month ON salary_payments(payment_month);
CREATE INDEX IF NOT EXISTS idx_salary_payments_status ON salary_payments(payment_status);

-- ============================================================
-- Run this file in psql:
--   \i /path/to/009_accounting_integrations.sql
-- ============================================================
