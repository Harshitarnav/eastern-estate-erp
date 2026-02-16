import { apiService } from './api';

export interface PaymentMilestoneDto {
  sequence: number;
  name: string;
  constructionPhase: 'FOUNDATION' | 'STRUCTURE' | 'MEP' | 'FINISHING' | 'HANDOVER' | null;
  phasePercentage: number | null;
  paymentPercentage: number;
  description: string;
}

export interface PaymentPlanTemplate {
  id: string;
  name: string;
  type: 'CONSTRUCTION_LINKED' | 'TIME_LINKED' | 'DOWN_PAYMENT';
  description?: string;
  milestones: PaymentMilestoneDto[];
  totalPercentage: number;
  isActive: boolean;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FlatPaymentMilestone {
  sequence: number;
  name: string;
  constructionPhase: string | null;
  phasePercentage: number | null;
  amount: number;
  dueDate: string | null;
  status: 'PENDING' | 'TRIGGERED' | 'PAID' | 'OVERDUE';
  paymentScheduleId: string | null;
  constructionCheckpointId: string | null;
  demandDraftId: string | null;
  paymentId: string | null;
  completedAt: string | null;
  description: string;
}

export interface FlatPaymentPlan {
  id: string;
  flatId: string;
  bookingId: string;
  customerId: string;
  paymentPlanTemplateId: string;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  milestones: FlatPaymentMilestone[];
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
  flat?: any;
  booking?: any;
  customer?: any;
  paymentPlanTemplate?: PaymentPlanTemplate;
}

export interface DemandDraftTemplate {
  id: string;
  name: string;
  description?: string;
  subject: string;
  htmlContent: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFlatPaymentPlanDto {
  flatId: string;
  bookingId: string;
  customerId: string;
  paymentPlanTemplateId: string;
  totalAmount: number;
}

class PaymentPlansService {
  // Payment Plan Templates
  async getPaymentPlanTemplates(activeOnly?: boolean): Promise<PaymentPlanTemplate[]> {
    const params = activeOnly ? { activeOnly: 'true' } : {};
    return await apiService.get('/payment-plan-templates', { params });
  }

  async getPaymentPlanTemplate(id: string): Promise<PaymentPlanTemplate> {
    return await apiService.get(`/payment-plan-templates/${id}`);
  }

  async getDefaultPaymentPlanTemplate(): Promise<PaymentPlanTemplate | null> {
    return await apiService.get('/payment-plan-templates/default');
  }

  async createPaymentPlanTemplate(data: Partial<PaymentPlanTemplate>): Promise<PaymentPlanTemplate> {
    return await apiService.post('/payment-plan-templates', data);
  }

  async updatePaymentPlanTemplate(id: string, data: Partial<PaymentPlanTemplate>): Promise<PaymentPlanTemplate> {
    return await apiService.put(`/payment-plan-templates/${id}`, data);
  }

  async deletePaymentPlanTemplate(id: string): Promise<void> {
    await apiService.delete(`/payment-plan-templates/${id}`);
  }

  // Flat Payment Plans
  async getFlatPaymentPlans(): Promise<FlatPaymentPlan[]> {
    return await apiService.get('/flat-payment-plans');
  }

  async getFlatPaymentPlan(id: string): Promise<FlatPaymentPlan> {
    return await apiService.get(`/flat-payment-plans/${id}`);
  }

  async getFlatPaymentPlanByFlatId(flatId: string): Promise<FlatPaymentPlan | null> {
    return await apiService.get(`/flat-payment-plans/flat/${flatId}`);
  }

  async getFlatPaymentPlanByBookingId(bookingId: string): Promise<FlatPaymentPlan | null> {
    return await apiService.get(`/flat-payment-plans/booking/${bookingId}`);
  }

  async createFlatPaymentPlan(data: CreateFlatPaymentPlanDto): Promise<FlatPaymentPlan> {
    return await apiService.post('/flat-payment-plans', data);
  }

  async updateMilestone(planId: string, sequence: number, updates: Partial<FlatPaymentMilestone>): Promise<FlatPaymentPlan> {
    return await apiService.put(`/flat-payment-plans/${planId}/milestones/${sequence}`, updates);
  }

  async cancelFlatPaymentPlan(id: string): Promise<FlatPaymentPlan> {
    return await apiService.put(`/flat-payment-plans/${id}/cancel`, {});
  }

  // Demand Draft Templates
  async getDemandDraftTemplates(activeOnly?: boolean): Promise<DemandDraftTemplate[]> {
    const params = activeOnly ? { activeOnly: 'true' } : {};
    return await apiService.get('/demand-draft-templates', { params });
  }

  async getDemandDraftTemplate(id: string): Promise<DemandDraftTemplate> {
    return await apiService.get(`/demand-draft-templates/${id}`);
  }

  async createDemandDraftTemplate(data: Partial<DemandDraftTemplate>): Promise<DemandDraftTemplate> {
    return await apiService.post('/demand-draft-templates', data);
  }

  async updateDemandDraftTemplate(id: string, data: Partial<DemandDraftTemplate>): Promise<DemandDraftTemplate> {
    return await apiService.put(`/demand-draft-templates/${id}`, data);
  }

  async deleteDemandDraftTemplate(id: string): Promise<void> {
    await apiService.delete(`/demand-draft-templates/${id}`);
  }
}

export const paymentPlansService = new PaymentPlansService();
