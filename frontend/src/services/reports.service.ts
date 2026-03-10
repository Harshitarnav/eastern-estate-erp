import { apiService } from './api';

export interface OutstandingRow {
  planId: string;
  bookingId: string;
  bookingNumber: string;
  property: string;
  tower: string;
  flatNumber: string;
  flatType: string;
  customerName: string;
  customerPhone: string;
  totalAmount: number;
  totalDemanded: number;
  totalPaid: number;
  outstanding: number;
  overdueMilestones: number;
  oldestOverdueDays: number | null;
  planStatus: string;
}

export interface OutstandingReport {
  rows: OutstandingRow[];
  summary: {
    totalUnits: number;
    totalAgreementValue: number;
    totalDemanded: number;
    totalPaid: number;
    totalOutstanding: number;
    unitsWithOverdue: number;
  };
}

export interface CollectionRow {
  paymentId: string;
  paymentCode: string;
  paymentDate: string;
  property: string;
  tower: string;
  flatNumber: string;
  customerName: string;
  customerPhone: string;
  bookingNumber: string;
  amount: number;
  paymentMethod: string;
  paymentType: string;
  status: string;
  receiptNumber: string;
  reference: string;
}

export interface CollectionReport {
  rows: CollectionRow[];
  summary: {
    totalPayments: number;
    totalAmount: number;
    byMethod: Record<string, number>;
    byStatus: Record<string, number>;
  };
}

class ReportsService {
  async getOutstanding(filters?: {
    propertyId?: string;
    towerId?: string;
    status?: string;
  }): Promise<OutstandingReport> {
    return apiService.get('/reports/outstanding', { params: filters ?? {} });
  }

  async getCollection(filters?: {
    propertyId?: string;
    towerId?: string;
    startDate?: string;
    endDate?: string;
    paymentMethod?: string;
  }): Promise<CollectionReport> {
    return apiService.get('/reports/collection', { params: filters ?? {} });
  }
}

export const reportsService = new ReportsService();
