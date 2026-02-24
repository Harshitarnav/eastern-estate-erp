/**
 * Shared utilities for human-friendly error display on employee forms.
 */
import React from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

// ─── Error parser ─────────────────────────────────────────────────────────────

/**
 * Converts any API error into a list of plain-English sentences that a
 * non-technical HR user can act on.
 */
export function parseApiErrors(error: any): string[] {
  const raw: any = error?.response?.data;

  // 1. Structured { errors: string[] }
  if (raw?.errors && Array.isArray(raw.errors) && raw.errors.length > 0) {
    return raw.errors.map(humanise);
  }
  // 2. { message: string[] }
  if (raw?.message && Array.isArray(raw.message) && raw.message.length > 0) {
    return raw.message.map(humanise);
  }
  // 3. { message: string }
  if (typeof raw?.message === 'string') {
    return [humanise(raw.message)];
  }
  // 4. Network / unknown
  if (error?.message) {
    return [humanise(error.message)];
  }

  return ['Something went wrong. Please try again or contact support.'];
}

/** Map technical validation messages → plain English. */
export function humanise(msg: string): string {
  if (!msg) return 'An unknown error occurred.';
  const lower = msg.toLowerCase();

  if (lower.includes('employeecode') && (lower.includes('empty') || lower.includes('required')))
    return 'Employee Code is required. Please enter a unique code for this employee (e.g. EECD-EMP-001).';
  if (lower.includes('fullname') && (lower.includes('empty') || lower.includes('required')))
    return "Full Name is required. Please enter the employee's complete name.";
  if (lower.includes('email') && lower.includes('valid'))
    return 'The email address entered is not valid. Please use a proper format like name@company.com.';
  if (lower.includes('phone') && lower.includes('pattern'))
    return 'Phone number must be a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.';
  if (lower.includes('aadhar') && lower.includes('pattern'))
    return 'Aadhaar number must be exactly 12 digits with no spaces.';
  if (lower.includes('pan') && lower.includes('pattern'))
    return 'PAN number must follow the format ABCDE1234F (5 letters, 4 digits, 1 letter).';
  if (lower.includes('already exists') || lower.includes('duplicate') || lower.includes('unique'))
    return 'An employee with this Employee Code or Email already exists. Please use a different value.';
  if (lower.includes('network') || lower.includes('fetch') || lower.includes('failed to fetch'))
    return 'Unable to reach the server. Please check your internet connection and try again.';
  if (lower.includes('unauthorized') || lower.includes('401'))
    return 'Your session has expired. Please log out and log in again.';
  if (lower.includes('forbidden') || lower.includes('403'))
    return 'You do not have permission to perform this action. Please contact your administrator.';
  if (lower.includes('not found') || lower.includes('404'))
    return 'The employee record could not be found. It may have been deleted.';
  if (lower.includes('invalid input') || lower.includes('bad request'))
    return 'Some fields contain invalid values. Please review the form and correct any issues.';
  if (lower.includes('profile picture') || lower.includes('upload'))
    return 'The photo could not be uploaded. Make sure it is a JPEG or PNG image under 10 MB.';

  // Default: capitalise and return as-is
  return msg.charAt(0).toUpperCase() + msg.slice(1);
}

// ─── Status Banner component ──────────────────────────────────────────────────

export type BannerType = 'success' | 'error' | 'warning';

export interface Banner {
  type: BannerType;
  title: string;
  messages?: string[];
}

const BANNER_STYLES: Record<BannerType, { wrap: string; icon: React.ReactNode }> = {
  success: {
    wrap: 'bg-green-50 border-green-300 text-green-800',
    icon: <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />,
  },
  error: {
    wrap: 'bg-red-50 border-red-300 text-red-800',
    icon: <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />,
  },
  warning: {
    wrap: 'bg-amber-50 border-amber-300 text-amber-800',
    icon: <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />,
  },
};

export function StatusBanner({ banner, onDismiss }: { banner: Banner; onDismiss: () => void }) {
  const { wrap, icon } = BANNER_STYLES[banner.type];

  return (
    <div className={`border rounded-lg p-4 mb-6 ${wrap}`} role="alert">
      <div className="flex items-start gap-3">
        {icon}
        <div className="flex-1">
          <p className="font-semibold">{banner.title}</p>
          {banner.messages && banner.messages.length > 0 && (
            <ul className="mt-2 space-y-1 list-disc list-inside text-sm">
              {banner.messages.map((m, i) => (
                <li key={i}>{m}</li>
              ))}
            </ul>
          )}
        </div>
        <button onClick={onDismiss} aria-label="Dismiss" className="opacity-60 hover:opacity-100 flex-shrink-0">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
