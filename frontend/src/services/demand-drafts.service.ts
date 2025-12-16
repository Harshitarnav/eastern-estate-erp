import api from './api';

export type DemandDraftStatus = 'DRAFT' | 'READY' | 'SENT' | 'FAILED';

export interface DemandDraft {
  id: string;
  flatId?: string | null;
  customerId?: string | null;
  bookingId?: string | null;
  milestoneId?: string | null;
  amount: number;
  status: DemandDraftStatus;
  fileUrl?: string | null;
  content?: string | null;
  metadata?: any;
  generatedAt?: string | null;
  sentAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

class DemandDraftsService {
  async list(params: { flatId?: string; customerId?: string; bookingId?: string; milestoneId?: string }) {
    const query = new URLSearchParams();
    Object.entries(params || {}).forEach(([k, v]) => {
      if (v) query.append(k, v);
    });
    return api.get<DemandDraft[]>(`/demand-drafts?${query.toString()}`);
  }

  async create(payload: Partial<DemandDraft>) {
    return api.post<DemandDraft>('/demand-drafts', payload);
  }

  async update(id: string, payload: Partial<DemandDraft>) {
    return api.patch<DemandDraft>(`/demand-drafts/${id}`, payload);
  }

  async markSent(id: string, fileUrl?: string) {
    return api.post<DemandDraft>(`/demand-drafts/${id}/send`, { fileUrl });
  }

  async getHtml(id: string): Promise<{ html: string }> {
    return api.get<{ html: string }>(`/demand-drafts/${id}/html`);
  }
}

export const demandDraftsService = new DemandDraftsService();
export default demandDraftsService;
