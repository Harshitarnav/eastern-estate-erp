-- Migration 006: Add missing audit columns to journal_entries
-- SnakeNamingStrategy converts camelCase → snake_case automatically.
-- These columns were added to the entity after synchronize was disabled.
-- Run ONCE on your database, then restart the backend.

ALTER TABLE journal_entries
  ADD COLUMN IF NOT EXISTS created_by  UUID REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS voided_by   UUID REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS voided_at   TIMESTAMP,
  ADD COLUMN IF NOT EXISTS void_reason TEXT;

-- Indexes for common lookups
CREATE INDEX IF NOT EXISTS idx_journal_entries_created_by ON journal_entries(created_by);
CREATE INDEX IF NOT EXISTS idx_journal_entries_voided_by  ON journal_entries(voided_by);
