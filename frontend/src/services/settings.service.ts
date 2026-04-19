import { apiService } from './api';

export interface CompanySettings {
  id?: string;
  companyName: string;
  tagline?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  phone?: string;
  email?: string;
  website?: string;
  // Tax & Legal
  gstin?: string;
  reraNumber?: string;
  // Bank
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
  ifscCode?: string;
  branch?: string;
  upiId?: string;
  // SMTP
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPass?: string;
  smtpFrom?: string;
  // Collections / overdue reminders
  overdueReminderIntervalDays?: number;
  cancellationWarningThresholdDays?: number;
  legacyAutoRemindMaxAgeDays?: number;
  overdueReminderDailyCap?: number;
  enableSmsReminders?: boolean;
  // Company-wide default for milestone-triggered demand drafts.
  //   false: each newly-generated DD lands in the Workstation as DRAFT
  //   true:  each newly-generated DD is created as SENT and emailed
  //          immediately (SMS + in-app follow once wired)
  // Can be overridden per-project on the Property edit form and
  // per-customer on the Customer edit form.
  autoSendMilestoneDemandDrafts?: boolean;
}

export interface TestEmailResult {
  success: boolean;
  message: string;
  detail?: string;
  messageId?: string;
}

export const settingsService = {
  getCompanySettings: (): Promise<CompanySettings> =>
    apiService.get('/settings/company'),

  updateCompanySettings: (data: Partial<CompanySettings>): Promise<CompanySettings> =>
    apiService.patch('/settings/company', data),

  testEmail: (to: string, subject?: string, message?: string): Promise<TestEmailResult> =>
    apiService.post('/settings/company/test-email', { to, subject, message }),
};
