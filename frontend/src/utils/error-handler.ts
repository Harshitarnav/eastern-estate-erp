/**
 * Error Handler Utility
 * Provides user-friendly error messages and form validation
 */

import { toast } from 'sonner';

// ─── Human-readable field label map ──────────────────────────────────────────
// Maps the raw camelCase field names from NestJS validation messages to proper
// labels a non-technical user can understand.
const FIELD_LABELS: Record<string, string> = {
  // Booking
  bookingNumber: 'Booking Number',
  bookingDate: 'Booking Date',
  customerId: 'Customer',
  propertyId: 'Property',
  towerId: 'Tower',
  flatId: 'Flat / Unit',
  totalAmount: 'Total Amount',
  tokenAmount: 'Token Amount',
  agreementAmount: 'Agreement Amount',
  discountAmount: 'Discount Amount',
  gstAmount: 'GST Amount',
  stampDuty: 'Stamp Duty',
  registrationCharges: 'Registration Charges',
  maintenanceDeposit: 'Maintenance Deposit',
  parkingCharges: 'Parking Charges',
  otherCharges: 'Other Charges',
  tokenPaidDate: 'Token Paid Date',
  tokenReceiptNumber: 'Token Receipt Number',
  tokenPaymentMode: 'Token Payment Mode',
  agreementNumber: 'Agreement Number',
  agreementDate: 'Agreement Date',
  agreementSignedDate: 'Agreement Signed Date',
  expectedPossessionDate: 'Expected Possession Date',
  actualPossessionDate: 'Actual Possession Date',
  registrationDate: 'Registration Date',
  isHomeLoan: 'Home Loan',
  bankName: 'Bank Name',
  loanAmount: 'Loan Amount',
  loanApplicationNumber: 'Loan Application Number',
  loanApprovalDate: 'Loan Approval Date',
  loanDisbursementDate: 'Loan Disbursement Date',
  nominee1Name: 'Nominee 1 Name',
  nominee1Relation: 'Nominee 1 Relation',
  nominee2Name: 'Nominee 2 Name',
  nominee2Relation: 'Nominee 2 Relation',
  coApplicantName: 'Co-applicant Name',
  coApplicantEmail: 'Co-applicant Email',
  coApplicantPhone: 'Co-applicant Phone',
  coApplicantRelation: 'Co-applicant Relation',
  paymentPlan: 'Payment Plan',
  status: 'Status',
  notes: 'Notes',
  specialTerms: 'Special Terms',

  // Payment
  paymentCode: 'Payment Number',
  paymentType: 'Payment Type',
  paymentMethod: 'Payment Method',
  paymentMode: 'Payment Mode',
  paymentCategory: 'Payment Category',
  amount: 'Amount',
  paymentDate: 'Payment Date',
  chequeNumber: 'Cheque Number',
  chequeDate: 'Cheque Date',
  transactionReference: 'Transaction Reference',
  upiId: 'UPI ID',
  receiptNumber: 'Receipt Number',
  installmentNumber: 'Installment Number',
  dueDate: 'Due Date',
  lateFee: 'Late Fee',
  tdsAmount: 'TDS Amount',
  gstAmount2: 'GST Amount',
  netAmount: 'Net Amount',

  // Customer
  firstName: 'First Name',
  lastName: 'Last Name',
  fullName: 'Full Name',
  email: 'Email',
  phone: 'Phone',
  alternatePhone: 'Alternate Phone',
  dateOfBirth: 'Date of Birth',
  gender: 'Gender',
  address: 'Address',
  city: 'City',
  state: 'State',
  pincode: 'Pincode',
  type: 'Customer Type',
  occupation: 'Occupation',
  annualIncome: 'Annual Income',
  company: 'Company',
  designation: 'Designation',
  panNumber: 'PAN Number',
  aadharNumber: 'Aadhar Number',
  needsHomeLoan: 'Home Loan Required',
  hasApprovedLoan: 'Approved Loan',
  kycStatus: 'KYC Status',

  // Employee
  employeeCode: 'Employee Code',
  firstName2: 'First Name',
  department: 'Department',
  position: 'Position',
  basicSalary: 'Basic Salary',

  // Payment plan template
  paymentPercentage: 'Payment %',
  sequence: 'Installment order',
  milestones: 'Payment milestones',
  templateType: 'Template type',
  isDefault: 'Default template',

  // Common
  name: 'Name',
  description: 'Description',
  startDate: 'Start Date',
  endDate: 'End Date',
  createdAt: 'Created At',
  updatedAt: 'Updated At',
  id: 'ID',
};

/**
 * Returns a human-readable label for a raw field name.
 * Falls back to a title-cased version of the field name.
 */
const fieldLabel = (raw: string): string => {
  if (FIELD_LABELS[raw]) return FIELD_LABELS[raw];
  // Convert camelCase → "Camel Case"
  return raw
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (s) => s.toUpperCase())
    .trim();
};

/**
 * Translates a raw NestJS validator message into a friendly sentence.
 * Input example:  "towerId must be a UUID"
 * Output example: "Tower: must be a valid selection"
 */
const humanizeMessage = (raw: string): string => {
  // Extract "fieldName rest of message" pattern
  const match = raw.match(/^([a-zA-Z0-9_.]+)\s+(.+)$/);
  if (!match) return raw;

  const [, field, rest] = match;
  const label = fieldLabel(field);

  // Translate common validator suffixes to plain English
  const phrase = rest
    .replace(/must be a UUID/i, 'must be selected from the list')
    .replace(/should not be empty/i, 'is required')
    .replace(/must not be empty/i, 'is required')
    .replace(/is not allowed to be empty/i, 'is required')
    .replace(/must be a valid ISO 8601 date string/i, 'must be a valid date')
    .replace(/must be a date string/i, 'must be a valid date')
    .replace(/must be an email/i, 'must be a valid email address')
    .replace(/must be a number conforming to the specified constraints/i, 'must be a number')
    .replace(/must be a string/i, 'must be text')
    .replace(/must be a boolean/i, 'must be Yes or No')
    .replace(/must be an integer number/i, 'must be a whole number')
    .replace(/must not be less than ([0-9.]+)/i, (_, n) => `must be at least ${n}`)
    .replace(/must not be greater than ([0-9.]+)/i, (_, n) => `must be at most ${n}`)
    .replace(/must be one of the following values: (.+)/i, (_, vals) => {
      const options = vals.split(',').map((v: string) => v.trim());
      return `must be one of: ${options.join(', ')}`;
    })
    .replace(/must be a positive number/i, 'must be a positive number')
    .replace(/must be longer than or equal to ([0-9]+) characters/i, (_, n) => `must be at least ${n} characters`)
    .replace(/must be shorter than or equal to ([0-9]+) characters/i, (_, n) => `must not exceed ${n} characters`);

  return `${label}: ${phrase}`;
};

// ─── Core error parser ────────────────────────────────────────────────────────

export interface ParsedApiError {
  /** Short headline message (1 line) */
  title: string;
  /** Optional array of individual validation issue strings */
  details: string[];
}

/**
 * Parses any Axios/API error into a structured { title, details } object.
 * Handles:
 *  - NestJS ValidationPipe arrays  { message: string[] }
 *  - NestJS single-string messages { message: string }
 *  - Network errors (no response)
 *  - HTTP status fallbacks
 */
export const parseApiError = (error: any): ParsedApiError => {
  // Network error
  if (error.request && !error.response) {
    return {
      title: 'Cannot reach server. Please check your connection.',
      details: [],
    };
  }

  if (error.response) {
    const { status, data } = error.response;

    // ── NestJS ValidationPipe: message is an array ──────────────────────────
    if (Array.isArray(data?.message) && data.message.length > 0) {
      const details = data.message.map(humanizeMessage);
      return {
        title: `${details.length} field${details.length > 1 ? 's need' : ' needs'} attention`,
        details,
      };
    }

    // ── Single string message from server ───────────────────────────────────
    if (typeof data?.message === 'string' && data.message.trim()) {
      // If it contains bullet separators from old code, split it
      const lines = data.message
        .split(/\n[•·]\s*/)
        .map((s: string) => s.replace(/^[•·]\s*/, '').trim())
        .filter(Boolean);

      if (lines.length > 1) {
        return {
          title: `${lines.length} issues found`,
          details: lines.map(humanizeMessage),
        };
      }

      return { title: data.message, details: [] };
    }

    // ── HTTP status fallbacks ────────────────────────────────────────────────
    const statusMessages: Record<number, string> = {
      400: 'Invalid request - please check the highlighted fields.',
      401: 'Session expired - please log in again.',
      403: "You don't have permission to do this.",
      404: 'Record not found.',
      409: 'This record already exists or conflicts with existing data.',
      422: 'The data provided is invalid. Please review and try again.',
      429: 'Too many requests. Please wait a moment and try again.',
      500: 'Server error. Please try again or contact support.',
      502: 'Server is temporarily unavailable. Please try again.',
      503: 'Service unavailable. Please try again shortly.',
    };

    return {
      title: statusMessages[status] ?? `Unexpected error (${status}). Please try again.`,
      details: [],
    };
  }

  // Unknown / client-side error
  return {
    title: error.message || 'An unexpected error occurred.',
    details: [],
  };
};

/**
 * Backward-compatible: returns a flat string for old code that expects a string.
 */
export const handleApiError = (error: any): string => {
  const { title, details } = parseApiError(error);
  if (details.length === 0) return title;
  return `${title}\n• ${details.join('\n• ')}`;
};

// ─── Toast helper ─────────────────────────────────────────────────────────────

/**
 * Show a detailed, user-friendly error toast.
 *
 * Usage:
 *   showApiError(err)                        – generic
 *   showApiError(err, 'Failed to save booking')  – with custom fallback title
 */
export const showApiError = (error: any, fallbackTitle?: string): void => {
  const { title, details } = parseApiError(error);

  const headline = title || fallbackTitle || 'Something went wrong';

  if (details.length === 0) {
    toast.error(headline);
    return;
  }

  // Build a JSX-like description by joining with bullets
  const description = details.map((d) => `• ${d}`).join('\n');

  toast.error(headline, {
    description,
    duration: 8000,          // stay longer so users can read all errors
    style: { whiteSpace: 'pre-line' },  // honour the \n in description
  });
};

// ─── Legacy helpers (kept for backward compat) ───────────────────────────────

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  email?: boolean;
  phone?: boolean;
  pattern?: RegExp;
  custom?: (value: any) => boolean;
  label?: string;
}

export interface ValidationRules {
  [field: string]: ValidationRule;
}

export const validateForm = (
  data: Record<string, any>,
  rules: ValidationRules,
): string[] => {
  const errors: string[] = [];

  Object.keys(rules).forEach((field) => {
    const value = data[field];
    const rule = rules[field];
    const label =
      rule.label ||
      field.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());

    if (rule.required && (value === undefined || value === null || value === '')) {
      errors.push(`${label} is required`);
      return;
    }

    if (!value && !rule.required) return;

    if (typeof value === 'string') {
      if (rule.minLength && value.length < rule.minLength)
        errors.push(`${label} must be at least ${rule.minLength} characters`);
      if (rule.maxLength && value.length > rule.maxLength)
        errors.push(`${label} must not exceed ${rule.maxLength} characters`);
    }

    if (!isNaN(Number(value))) {
      const numValue = Number(value);
      if (rule.min !== undefined && numValue < rule.min)
        errors.push(`${label} must be at least ${rule.min}`);
      if (rule.max !== undefined && numValue > rule.max)
        errors.push(`${label} must not exceed ${rule.max}`);
    }

    if (rule.email && !isValidEmail(value))
      errors.push(`${label} must be a valid email address`);
    if (rule.phone && !isValidPhone(value))
      errors.push(`${label} must be a valid phone number`);
    if (rule.pattern && !rule.pattern.test(value))
      errors.push(`${label} format is invalid`);
    if (rule.custom && !rule.custom(value))
      errors.push(`${label} is invalid`);
  });

  return errors;
};

export const isValidEmail = (email: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const isValidPhone = (phone: string): boolean => {
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  return /^(\+91|91)?[6-9]\d{9}$/.test(cleaned);
};

export const formatValidationErrors = (errors: string[]): string => {
  if (errors.length === 0) return '';
  if (errors.length === 1) return errors[0];
  return errors.join('\n• ');
};

export const isValidationError = (error: any): boolean =>
  error?.response?.status === 422 || error?.response?.status === 400;

export const isAuthError = (error: any): boolean =>
  error?.response?.status === 401;

export const isPermissionError = (error: any): boolean =>
  error?.response?.status === 403;

export const showErrorNotification = (error: any, fallbackMessage?: string): string => {
  const message = handleApiError(error) || fallbackMessage || 'An error occurred';
  return message;
};

export const commonRules = {
  email: { required: true, email: true, label: 'Email' },
  phone: { required: true, phone: true, label: 'Phone Number' },
  name: { required: true, minLength: 2, maxLength: 100, label: 'Name' },
  amount: { required: true, min: 0, label: 'Amount' },
  date: { required: true, label: 'Date' },
  description: { maxLength: 500, label: 'Description' },
};
