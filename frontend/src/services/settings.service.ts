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
}

export const settingsService = {
  getCompanySettings: (): Promise<CompanySettings> =>
    apiService.get('/settings/company'),

  updateCompanySettings: (data: Partial<CompanySettings>): Promise<CompanySettings> =>
    apiService.patch('/settings/company', data),
};
