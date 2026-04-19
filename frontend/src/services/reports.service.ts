import { apiService } from './api';

export interface DashboardSummary {
  totalAgreementValue: number;
  totalCollected: number;
  totalOutstanding: number;
  thisMonthCollection: number;
  thisMonthPaymentCount: number;
  totalFlats: number;
  availableFlats: number;
  bookedFlats: number;
  soldFlats: number;
  onHoldFlats: number;
  availablePercent: number;
  totalCustomers: number;
  activeBookings: number;
  activeLeads: number;
  overdueMilestoneUnits: number;
  totalInventoryValue: number;
  bookedInventoryValue: number;
  recentPayments: Array<{
    id: string;
    customerName: string;
    amount: number;
    paymentDate: string;
    flatNumber: string;
    property: string;
    paymentMethod: string;
  }>;
  overdueUnits: Array<{
    bookingId: string;
    customerName: string;
    flatNumber: string;
    property: string;
    outstanding: number;
    overdueDays: number | null;
    overdueMilestones: number;
  }>;
  statusBreakdown: Record<string, number>;
}

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

// ── Inventory report ──────────────────────────────────────────────────────────

export interface InventoryRow {
  flatId: string;
  property: string;
  propertyId: string;
  tower: string;
  towerId: string;
  flatNumber: string;
  flatType: string;
  floor: number | null;
  carpetArea: number | null;
  builtUpArea: number | null;
  basePrice: number | null;
  finalPrice: number | null;
  status: string;
  customerName: string | null;
  customerPhone: string | null;
  bookingNumber: string | null;
  bookingDate: string | null;
}

export interface InventoryReport {
  rows: InventoryRow[];
  summary: {
    total: number;
    byStatus: Record<string, number>;
    byType: Record<string, number>;
    availablePercent: number;
    totalValue: number;
    bookedValue: number;
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

  async getInventory(filters?: {
    propertyId?: string;
    towerId?: string;
    status?: string;
    flatType?: string;
  }): Promise<InventoryReport> {
    return apiService.get('/reports/inventory', { params: filters ?? {} });
  }

  async getDashboard(params?: { propertyId?: string }): Promise<DashboardSummary> {
    return apiService.get('/reports/dashboard', { params: params ?? {} });
  }
}

export const reportsService = new ReportsService();
