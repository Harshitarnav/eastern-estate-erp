-- ============================================================
-- Migration 008: Create bank_accounts and bank_statements tables
-- Run this ONCE in psql: \i 008_create_bank_tables.sql
-- ============================================================

-- Bank Accounts
CREATE TABLE IF NOT EXISTS bank_accounts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_number  VARCHAR(100) UNIQUE NOT NULL,
  account_name    VARCHAR(255) NOT NULL,
  bank_name       VARCHAR(255) NOT NULL,
  branch_name     VARCHAR(255),
  ifsc_code       VARCHAR(20),
  account_type    VARCHAR(50) NOT NULL DEFAULT 'Current',
  opening_balance NUMERIC(15,2) NOT NULL DEFAULT 0,
  current_balance NUMERIC(15,2) NOT NULL DEFAULT 0,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  description     TEXT,
  created_at      TIMESTAMP NOT NULL DEFAULT now(),
  updated_at      TIMESTAMP NOT NULL DEFAULT now()
);

-- Bank Statements (imported transaction lines)
CREATE TABLE IF NOT EXISTS bank_statements (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_account_id           UUID NOT NULL REFERENCES bank_accounts(id) ON DELETE CASCADE,
  statement_date            DATE,
  transaction_date          DATE NOT NULL,
  transaction_id            VARCHAR(100),
  description               TEXT NOT NULL,
  reference_number          VARCHAR(100),
  debit_amount              NUMERIC(15,2) NOT NULL DEFAULT 0,
  credit_amount             NUMERIC(15,2) NOT NULL DEFAULT 0,
  balance                   NUMERIC(15,2) NOT NULL DEFAULT 0,
  transaction_type          VARCHAR(50),
  is_reconciled             BOOLEAN NOT NULL DEFAULT FALSE,
  reconciled_with_entry_id  UUID REFERENCES journal_entries(id) ON DELETE SET NULL,
  reconciled_date           DATE,
  uploaded_file             VARCHAR(500),
  created_at                TIMESTAMP NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_bank_statements_bank_account_id ON bank_statements(bank_account_id);
CREATE INDEX IF NOT EXISTS idx_bank_statements_is_reconciled    ON bank_statements(is_reconciled);
CREATE INDEX IF NOT EXISTS idx_bank_statements_transaction_date  ON bank_statements(transaction_date);
