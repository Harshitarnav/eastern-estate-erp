-- Migration 009: Rename salary_payments columns from camelCase → snake_case
-- Idempotent: skips renames when camelCase columns are already gone (prod was created with snake_case).

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'salary_payments' AND column_name = 'employeeId')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'salary_payments' AND column_name = 'employee_id') THEN
    ALTER TABLE salary_payments RENAME COLUMN "employeeId" TO employee_id;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'salary_payments' AND column_name = 'paymentMonth')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'salary_payments' AND column_name = 'payment_month') THEN
    ALTER TABLE salary_payments RENAME COLUMN "paymentMonth" TO payment_month;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'salary_payments' AND column_name = 'workingDays')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'salary_payments' AND column_name = 'working_days') THEN
    ALTER TABLE salary_payments RENAME COLUMN "workingDays" TO working_days;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'salary_payments' AND column_name = 'presentDays')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'salary_payments' AND column_name = 'present_days') THEN
    ALTER TABLE salary_payments RENAME COLUMN "presentDays" TO present_days;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'salary_payments' AND column_name = 'absentDays')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'salary_payments' AND column_name = 'absent_days') THEN
    ALTER TABLE salary_payments RENAME COLUMN "absentDays" TO absent_days;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'salary_payments' AND column_name = 'paidLeaveDays')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'salary_payments' AND column_name = 'paid_leave_days') THEN
    ALTER TABLE salary_payments RENAME COLUMN "paidLeaveDays" TO paid_leave_days;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'salary_payments' AND column_name = 'unpaidLeaveDays')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'salary_payments' AND column_name = 'unpaid_leave_days') THEN
    ALTER TABLE salary_payments RENAME COLUMN "unpaidLeaveDays" TO unpaid_leave_days;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'salary_payments' AND column_name = 'overtimeHours')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'salary_payments' AND column_name = 'overtime_hours') THEN
    ALTER TABLE salary_payments RENAME COLUMN "overtimeHours" TO overtime_hours;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'salary_payments' AND column_name = 'basicSalary')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'salary_payments' AND column_name = 'basic_salary') THEN
    ALTER TABLE salary_payments RENAME COLUMN "basicSalary" TO basic_salary;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'salary_payments' AND column_name = 'houseRentAllowance')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'salary_payments' AND column_name = 'house_rent_allowance') THEN
    ALTER TABLE salary_payments RENAME COLUMN "houseRentAllowance" TO house_rent_allowance;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'salary_payments' AND column_name = 'transportAllowance')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'salary_payments' AND column_name = 'transport_allowance') THEN
    ALTER TABLE salary_payments RENAME COLUMN "transportAllowance" TO transport_allowance;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'salary_payments' AND column_name = 'medicalAllowance')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'salary_payments' AND column_name = 'medical_allowance') THEN
    ALTER TABLE salary_payments RENAME COLUMN "medicalAllowance" TO medical_allowance;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'salary_payments' AND column_name = 'overtimePayment')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'salary_payments' AND column_name = 'overtime_payment') THEN
    ALTER TABLE salary_payments RENAME COLUMN "overtimePayment" TO overtime_payment;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'salary_payments' AND column_name = 'otherAllowances')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'salary_payments' AND column_name = 'other_allowances') THEN
    ALTER TABLE salary_payments RENAME COLUMN "otherAllowances" TO other_allowances;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'salary_payments' AND column_name = 'grossSalary')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'salary_payments' AND column_name = 'gross_salary') THEN
    ALTER TABLE salary_payments RENAME COLUMN "grossSalary" TO gross_salary;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'salary_payments' AND column_name = 'pfDeduction')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'salary_payments' AND column_name = 'pf_deduction') THEN
    ALTER TABLE salary_payments RENAME COLUMN "pfDeduction" TO pf_deduction;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'salary_payments' AND column_name = 'esiDeduction')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'salary_payments' AND column_name = 'esi_deduction') THEN
    ALTER TABLE salary_payments RENAME COLUMN "esiDeduction" TO esi_deduction;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'salary_payments' AND column_name = 'taxDeduction')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'salary_payments' AND column_name = 'tax_deduction') THEN
    ALTER TABLE salary_payments RENAME COLUMN "taxDeduction" TO tax_deduction;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'salary_payments' AND column_name = 'advanceDeduction')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'salary_payments' AND column_name = 'advance_deduction') THEN
    ALTER TABLE salary_payments RENAME COLUMN "advanceDeduction" TO advance_deduction;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'salary_payments' AND column_name = 'loanDeduction')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'salary_payments' AND column_name = 'loan_deduction') THEN
    ALTER TABLE salary_payments RENAME COLUMN "loanDeduction" TO loan_deduction;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'salary_payments' AND column_name = 'otherDeductions')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'salary_payments' AND column_name = 'other_deductions') THEN
    ALTER TABLE salary_payments RENAME COLUMN "otherDeductions" TO other_deductions;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'salary_payments' AND column_name = 'totalDeductions')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'salary_payments' AND column_name = 'total_deductions') THEN
    ALTER TABLE salary_payments RENAME COLUMN "totalDeductions" TO total_deductions;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'salary_payments' AND column_name = 'netSalary')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'salary_payments' AND column_name = 'net_salary') THEN
    ALTER TABLE salary_payments RENAME COLUMN "netSalary" TO net_salary;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'salary_payments' AND column_name = 'paymentStatus')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'salary_payments' AND column_name = 'payment_status') THEN
    ALTER TABLE salary_payments RENAME COLUMN "paymentStatus" TO payment_status;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'salary_payments' AND column_name = 'paymentMode')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'salary_payments' AND column_name = 'payment_mode') THEN
    ALTER TABLE salary_payments RENAME COLUMN "paymentMode" TO payment_mode;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'salary_payments' AND column_name = 'paymentDate')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'salary_payments' AND column_name = 'payment_date') THEN
    ALTER TABLE salary_payments RENAME COLUMN "paymentDate" TO payment_date;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'salary_payments' AND column_name = 'transactionReference')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'salary_payments' AND column_name = 'transaction_reference') THEN
    ALTER TABLE salary_payments RENAME COLUMN "transactionReference" TO transaction_reference;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'salary_payments' AND column_name = 'paymentRemarks')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'salary_payments' AND column_name = 'payment_remarks') THEN
    ALTER TABLE salary_payments RENAME COLUMN "paymentRemarks" TO payment_remarks;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'salary_payments' AND column_name = 'bankName')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'salary_payments' AND column_name = 'bank_name') THEN
    ALTER TABLE salary_payments RENAME COLUMN "bankName" TO bank_name;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'salary_payments' AND column_name = 'accountNumber')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'salary_payments' AND column_name = 'account_number') THEN
    ALTER TABLE salary_payments RENAME COLUMN "accountNumber" TO account_number;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'salary_payments' AND column_name = 'ifscCode')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'salary_payments' AND column_name = 'ifsc_code') THEN
    ALTER TABLE salary_payments RENAME COLUMN "ifscCode" TO ifsc_code;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'salary_payments' AND column_name = 'isActive')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'salary_payments' AND column_name = 'is_active') THEN
    ALTER TABLE salary_payments RENAME COLUMN "isActive" TO is_active;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'salary_payments' AND column_name = 'createdAt')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'salary_payments' AND column_name = 'created_at') THEN
    ALTER TABLE salary_payments RENAME COLUMN "createdAt" TO created_at;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'salary_payments' AND column_name = 'updatedAt')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'salary_payments' AND column_name = 'updated_at') THEN
    ALTER TABLE salary_payments RENAME COLUMN "updatedAt" TO updated_at;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'salary_payments' AND column_name = 'createdBy')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'salary_payments' AND column_name = 'created_by') THEN
    ALTER TABLE salary_payments RENAME COLUMN "createdBy" TO created_by;
  END IF;
END $$;

ALTER TABLE salary_payments
  ADD COLUMN IF NOT EXISTS updated_by  UUID,
  ADD COLUMN IF NOT EXISTS approved_by UUID,
  ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP;
