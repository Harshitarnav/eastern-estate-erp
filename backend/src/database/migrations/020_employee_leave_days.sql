-- Per-calendar-day leave ledger (full or half day). Persists independently of payroll month totals.

CREATE TABLE IF NOT EXISTS employee_leave_days (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id  UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  leave_date   DATE NOT NULL,
  day_fraction NUMERIC(3, 2) NOT NULL DEFAULT 1.0,
  leave_kind   VARCHAR(20) NOT NULL,
  notes        TEXT,
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by   UUID,
  updated_by   UUID,
  CONSTRAINT employee_leave_days_fraction_chk
    CHECK (day_fraction IN (0.5, 1)),
  CONSTRAINT employee_leave_days_kind_chk
    CHECK (leave_kind IN ('PAID', 'UNPAID', 'ABSENT'))
);

CREATE UNIQUE INDEX IF NOT EXISTS employee_leave_days_emp_date_kind_key
  ON employee_leave_days (employee_id, leave_date, leave_kind)
  WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS employee_leave_days_emp_date_idx
  ON employee_leave_days (employee_id, leave_date DESC);
