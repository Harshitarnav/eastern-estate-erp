import { apiService } from './api';

export interface LegacyCustomerInput {
  rowId: string;
  existingCustomerId?: string;
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  panNumber?: string;
  aadharNumber?: string;
  addressLine1?: string;
  city?: string;
  state?: string;
  pincode?: string;
  notes?: string;
}

export interface LegacyBookingInput {
  rowId: string;
  customerRowId?: string;
  existingCustomerId?: string;
  flatId: string;
  bookingNumber?: string;
  bookingDate: string;
  totalAmount: number;
  tokenAmount?: number;
  isLegacyImport?: boolean;
  initialEscalationLevel?: 0 | 1 | 2 | 3;
  remindersEnabled?: boolean;
}

export interface LegacyMilestoneInput {
  bookingRowId: string;
  sequence: number;
  name: string;
  description?: string;
  amount: number;
  paymentPercentage?: number;
  dueDate?: string;
  constructionPhase?: string;
  phasePercentage?: number;
  status?: 'PENDING' | 'PAID' | 'OVERDUE' | 'TRIGGERED';
}

export interface LegacyPaymentInput {
  bookingRowId: string;
  milestoneSequence?: number;
  amount: number;
  paymentDate: string;
  paymentMode: string;
  referenceNumber?: string;
  notes?: string;
}

export interface LegacyImportPayload {
  importBatchId?: string;
  customers: LegacyCustomerInput[];
  bookings: LegacyBookingInput[];
  milestones: LegacyMilestoneInput[];
  payments?: LegacyPaymentInput[];
}

export interface LegacyImportPreview {
  importBatchId: string;
  summary: {
    customers: number;
    existingCustomersReferenced: number;
    bookings: number;
    milestones: number;
    payments: number;
    estimatedOverdueMilestones: number;
  };
  errors: string[];
  warnings: string[];
}

export interface LegacyImportResult {
  importBatchId: string;
  created: {
    customers: number;
    bookings: number;
    plans: number;
    milestones: number;
    payments: number;
    demandDrafts: number;
  };
  errors: string[];
}

class LegacyImportService {
  async preview(payload: LegacyImportPayload): Promise<LegacyImportPreview> {
    return apiService.post('/legacy-import/preview', payload);
  }
  async commit(payload: LegacyImportPayload): Promise<LegacyImportResult> {
    return apiService.post('/legacy-import/commit', payload);
  }
  async scanNow(): Promise<any> {
    return apiService.post('/legacy-import/scan-overdues', {});
  }
}

export const legacyImportService = new LegacyImportService();
export default legacyImportService;
