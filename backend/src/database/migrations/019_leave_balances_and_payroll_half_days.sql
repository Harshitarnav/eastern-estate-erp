-- Half-day leave support: employee balances + monthly salary attendance columns
-- Run against the ERP database when deploying this release.

ALTER TABLE employees
  ALTER COLUMN casual_leave_balance TYPE numeric(7,2) USING casual_leave_balance::numeric,
  ALTER COLUMN sick_leave_balance TYPE numeric(7,2) USING sick_leave_balance::numeric,
  ALTER COLUMN earned_leave_balance TYPE numeric(7,2) USING earned_leave_balance::numeric,
  ALTER COLUMN leave_taken TYPE numeric(7,2) USING leave_taken::numeric;

ALTER TABLE salary_payments
  ALTER COLUMN working_days TYPE numeric(6,2) USING working_days::numeric,
  ALTER COLUMN present_days TYPE numeric(6,2) USING present_days::numeric,
  ALTER COLUMN absent_days TYPE numeric(6,2) USING absent_days::numeric,
  ALTER COLUMN paid_leave_days TYPE numeric(6,2) USING paid_leave_days::numeric,
  ALTER COLUMN unpaid_leave_days TYPE numeric(6,2) USING unpaid_leave_days::numeric,
  ALTER COLUMN overtime_hours TYPE numeric(8,2) USING overtime_hours::numeric;
