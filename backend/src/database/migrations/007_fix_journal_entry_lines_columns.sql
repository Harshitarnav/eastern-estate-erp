-- Migration 007: Fix journal_entry_lines columns
-- The SnakeNamingStrategy was being overridden by explicit @JoinColumn({ name: 'journalEntryId' })
-- causing TypeORM to look for camelCase column names instead of snake_case.
-- This migration ensures all required snake_case columns exist.

ALTER TABLE journal_entry_lines
  ADD COLUMN IF NOT EXISTS journal_entry_id UUID REFERENCES journal_entries(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS account_id       UUID REFERENCES accounts(id) ON DELETE RESTRICT,
  ADD COLUMN IF NOT EXISTS debit_amount     NUMERIC(15,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS credit_amount    NUMERIC(15,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS description      TEXT,
  ADD COLUMN IF NOT EXISTS created_at       TIMESTAMP DEFAULT now();
