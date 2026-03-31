-- Migration 009: Rename salary_payments columns from camelCase → snake_case
-- Needed because the table was created before SnakeNamingStrategy was active.
-- Run: psql eastern_estate_erp -f <this_file>

ALTER TABLE salary_payments
  RENAME COLUMN "employeeId"           TO employee_id;

ALTER TABLE salary_payments
  RENAME COLUMN "paymentMonth"         TO payment_month;

ALTER TABLE salary_payments
  RENAME COLUMN "workingDays"          TO working_days;

ALTER TABLE salary_payments
  RENAME COLUMN "presentDays"          TO present_days;

ALTER TABLE salary_payments
  RENAME COLUMN "absentDays"           TO absent_days;

ALTER TABLE salary_payments
  RENAME COLUMN "paidLeaveDays"        TO paid_leave_days;

ALTER TABLE salary_payments
  RENAME COLUMN "unpaidLeaveDays"      TO unpaid_leave_days;

ALTER TABLE salary_payments
  RENAME COLUMN "overtimeHours"        TO overtime_hours;

ALTER TABLE salary_payments
  RENAME COLUMN "basicSalary"          TO basic_salary;

ALTER TABLE salary_payments
  RENAME COLUMN "houseRentAllowance"   TO house_rent_allowance;

ALTER TABLE salary_payments
  RENAME COLUMN "transportAllowance"   TO transport_allowance;

ALTER TABLE salary_payments
  RENAME COLUMN "medicalAllowance"     TO medical_allowance;

ALTER TABLE salary_payments
  RENAME COLUMN "overtimePayment"      TO overtime_payment;

ALTER TABLE salary_payments
  RENAME COLUMN "otherAllowances"      TO other_allowances;

ALTER TABLE salary_payments
  RENAME COLUMN "grossSalary"          TO gross_salary;

ALTER TABLE salary_payments
  RENAME COLUMN "pfDeduction"          TO pf_deduction;

ALTER TABLE salary_payments
  RENAME COLUMN "esiDeduction"         TO esi_deduction;

ALTER TABLE salary_payments
  RENAME COLUMN "taxDeduction"         TO tax_deduction;

ALTER TABLE salary_payments
  RENAME COLUMN "advanceDeduction"     TO advance_deduction;

ALTER TABLE salary_payments
  RENAME COLUMN "loanDeduction"        TO loan_deduction;

ALTER TABLE salary_payments
  RENAME COLUMN "otherDeductions"      TO other_deductions;

ALTER TABLE salary_payments
  RENAME COLUMN "totalDeductions"      TO total_deductions;

ALTER TABLE salary_payments
  RENAME COLUMN "netSalary"            TO net_salary;

ALTER TABLE salary_payments
  RENAME COLUMN "paymentStatus"        TO payment_status;

ALTER TABLE salary_payments
  RENAME COLUMN "paymentMode"          TO payment_mode;

ALTER TABLE salary_payments
  RENAME COLUMN "paymentDate"          TO payment_date;

ALTER TABLE salary_payments
  RENAME COLUMN "transactionReference" TO transaction_reference;

ALTER TABLE salary_payments
  RENAME COLUMN "paymentRemarks"       TO payment_remarks;

ALTER TABLE salary_payments
  RENAME COLUMN "bankName"             TO bank_name;

ALTER TABLE salary_payments
  RENAME COLUMN "accountNumber"        TO account_number;

ALTER TABLE salary_payments
  RENAME COLUMN "ifscCode"             TO ifsc_code;

ALTER TABLE salary_payments
  RENAME COLUMN "isActive"             TO is_active;

ALTER TABLE salary_payments
  RENAME COLUMN "createdAt"            TO created_at;

ALTER TABLE salary_payments
  RENAME COLUMN "updatedAt"            TO updated_at;

ALTER TABLE salary_payments
  RENAME COLUMN "createdBy"            TO created_by;

-- Add missing audit columns (not present in original table)
ALTER TABLE salary_payments
  ADD COLUMN IF NOT EXISTS updated_by  UUID,
  ADD COLUMN IF NOT EXISTS approved_by UUID,
  ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP;

-- Fix paymentStatus/paymentMode: change from varchar to the correct column name
-- (already a varchar, enum values stored as strings — no type change needed)

