import { apiService } from './api';

export type CollectionTier =
  | 'ON_TRACK'
  | 'OVERDUE'
  | 'REMINDER_1'
  | 'REMINDER_2'
  | 'REMINDER_3'
  | 'REMINDER_4'
  | 'WARNING'
  | 'POST_WARNING'
  | 'AT_RISK';

export type DemandDraftStatus =
  | 'DRAFT'
  | 'READY'
  | 'SENT'
  | 'FAILED'
  | 'PAID';

export type DemandDraftTone =
  | 'ON_TIME'
  | 'REMINDER_1'
  | 'REMINDER_2'
  | 'REMINDER_3'
  | 'REMINDER_4'
  | 'CANCELLATION_WARNING'
  | 'POST_WARNING';

export interface CollectionsRow {
  id: string;
  title: string | null;
  amount: number;
  status: DemandDraftStatus;
  tone: DemandDraftTone;
  escalationLevel: number;
  reminderCount: number;
  dueDate: string | null;
  daysOverdue: number;
  lastReminderAt: string | null;
  nextReminderDueAt: string | null;
  cancellationWarningIssuedAt: string | null;
  parentDemandDraftId: string | null;
  isLegacyImport: boolean;
  createdAt: string;
  customerId: string | null;
  customerName: string | null;
  customerPhone: string | null;
  customerEmail: string | null;
  bookingId: string | null;
  bookingCode: string | null;
  bookingStatus: string | null;
  flatId: string | null;
  flatCode: string | null;
  propertyId: string | null;
  propertyName: string | null;
  pauseRemindersUntil: string | null;
  collectorUserId: string | null;
  collectorName: string | null;
  assignedAt: string | null;
  tier: CollectionTier;
}

export interface CollectorSummary {
  userId: string;
  name: string;
  email: string | null;
  assignedCount: number;
  overdueCount: number;
}

export interface CollectionsStats {
  totalOverdueAmount: number;
  totalPendingAmount: number;
  ddCount: number;
  overdueCount: number;
  atRiskBookingCount: number;
  byTier: Record<CollectionTier, { count: number; amount: number }>;
  agingBuckets: {
    d_0_7: { count: number; amount: number };
    d_8_30: { count: number; amount: number };
    d_31_90: { count: number; amount: number };
    d_91_180: { count: number; amount: number };
    d_181_365: { count: number; amount: number };
    d_365_plus: { count: number; amount: number };
  };
  draftWarningsPending: number;
  pausedCount: number;
  legacyOverdueAmount: number;
}

export interface CollectionsListFilter {
  tier?: CollectionTier;
  customerId?: string;
  bookingId?: string;
  propertyId?: string;
  flatId?: string;
  status?: DemandDraftStatus;
  tone?: DemandDraftTone;
  includeLegacyOnly?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
  /** user id, or the string "unassigned" for rows without a collector */
  assigneeId?: string;
  /** when true, server filters to DDs owned by the current user */
  mine?: boolean;
}

export interface CollectionsTimelineEvent {
  at: string;
  kind: string;
  label: string;
  detail?: string;
  /**
   * Present for events that originate from a specific DD in the thread
   * (`generated`, `reminder`, `warning`). The detail page uses this to
   * render each entry as a link to `/collections/:id` so the user can
   * jump to the exact reminder / draft that was sent.
   */
  demandDraftId?: string;
}

class CollectionsService {
  async list(filter: CollectionsListFilter = {}): Promise<{ rows: CollectionsRow[]; total: number }> {
    const qs = new URLSearchParams();
    Object.entries(filter).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') qs.append(k, String(v));
    });
    return apiService.get<{ rows: CollectionsRow[]; total: number }>(
      `/collections?${qs.toString()}`,
    );
  }

  async stats(params: { propertyId?: string } = {}): Promise<CollectionsStats> {
    const qs = new URLSearchParams();
    if (params.propertyId) qs.append('propertyId', params.propertyId);
    return apiService.get<CollectionsStats>(`/collections/stats?${qs.toString()}`);
  }

  async detail(id: string): Promise<{
    row: CollectionsRow;
    thread: CollectionsRow[];
    timeline: CollectionsTimelineEvent[];
  }> {
    return apiService.get(`/collections/${id}`);
  }

  async pause(
    id: string,
    body: { days: number; scope: 'plan' | 'customer'; note?: string },
  ): Promise<{ pausedUntil: string; scope: string }> {
    return apiService.post(`/collections/${id}/pause`, body);
  }

  async recordContact(
    id: string,
    body: { channel: 'phone' | 'email' | 'sms' | 'visit' | 'other'; note: string },
  ): Promise<{ ok: boolean }> {
    return apiService.post(`/collections/${id}/contact`, body);
  }

  async sendWarning(id: string): Promise<any> {
    return apiService.post(`/collections/${id}/send-warning`, {});
  }

  async scanNow(): Promise<{
    examined: number;
    remindersSent: number;
    warningsPrepared: number;
    postWarningsSent: number;
    bookingsFlaggedAtRisk: number;
    skippedPaused: number;
    skippedLegacyDisabled: number;
    skippedCapped: number;
    errors: number;
  }> {
    return apiService.post(`/collections/scan-now`, {});
  }

  async bulkPause(body: {
    ids: string[];
    days: number;
    scope: 'plan' | 'customer';
    note?: string;
  }): Promise<{
    ok: string[];
    failed: Array<{ id: string; reason: string }>;
  }> {
    return apiService.post(`/collections/bulk/pause`, body);
  }

  async bulkSend(ids: string[]): Promise<{
    sent: string[];
    skipped: Array<{ id: string; reason: string }>;
    failed: Array<{ id: string; reason: string }>;
  }> {
    return apiService.post(`/collections/bulk/send`, { ids });
  }

  async pauseCustomer(
    customerId: string,
    body: { days: number; note?: string },
  ): Promise<{ pausedUntil: string; affectedDds: number }> {
    return apiService.post(`/collections/customer/${customerId}/pause`, body);
  }

  async bulkContact(body: {
    ids: string[];
    channel: 'phone' | 'email' | 'sms' | 'visit' | 'other';
    note: string;
  }): Promise<{
    ok: string[];
    failed: Array<{ id: string; reason: string }>;
  }> {
    return apiService.post(`/collections/bulk/contact`, body);
  }

  async bulkAssign(body: {
    ids: string[];
    assigneeId: string | null;
  }): Promise<{ updated: number }> {
    return apiService.post(`/collections/bulk/assign`, body);
  }

  /**
   * Mark a DD as paid by recording the payment that settles it. The
   * backend creates + verifies a Payment row, which in turn triggers
   * the standard post-completion pipeline (milestone → PAID, booking
   * totals updated, journal entry posted, reminder DDs closed).
   */
  async recordPayment(
    id: string,
    body: {
      amount?: number;
      paymentMethod?: string;
      paymentDate?: string;
      transactionReference?: string;
      chequeNumber?: string;
      bankName?: string;
      notes?: string;
    } = {},
  ): Promise<{
    ok: boolean;
    paymentId: string;
    paymentCode: string;
    amount: number;
    status: string;
    demandDraftId: string;
    journalEntryId: string | null;
    // Non-null when the auto-JE was skipped so the UI can surface a
    // warning. 'missing-default-accounts' means the Chart of Accounts
    // needs a Bank/Cash ASSET + Sales/Revenue INCOME account.
    journalEntrySkipReason: string | null;
  }> {
    return apiService.post(`/collections/${id}/record-payment`, body);
  }

  async assignees(filter?: { propertyId?: string }): Promise<CollectorSummary[]> {
    const qs = filter?.propertyId
      ? `?propertyId=${encodeURIComponent(filter.propertyId)}`
      : '';
    return apiService.get(`/collections/assignees${qs}`);
  }
}

export const collectionsService = new CollectionsService();
export default collectionsService;

// ── UI helpers ─────────────────────────────────────────────────────────────

export const TIER_LABELS: Record<CollectionTier, string> = {
  ON_TRACK: 'On Track',
  OVERDUE: 'Overdue',
  REMINDER_1: 'Reminder 1',
  REMINDER_2: 'Reminder 2',
  REMINDER_3: 'Reminder 3',
  REMINDER_4: 'Reminder 4',
  WARNING: 'Cancellation Warning',
  POST_WARNING: 'Post-Warning',
  AT_RISK: 'At Risk',
};

export const TIER_COLORS: Record<CollectionTier, string> = {
  ON_TRACK: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  OVERDUE: 'bg-amber-50 text-amber-800 border-amber-200',
  REMINDER_1: 'bg-yellow-50 text-yellow-800 border-yellow-200',
  REMINDER_2: 'bg-orange-50 text-orange-800 border-orange-200',
  REMINDER_3: 'bg-orange-100 text-orange-900 border-orange-300',
  REMINDER_4: 'bg-red-50 text-red-800 border-red-200',
  WARNING: 'bg-red-100 text-red-900 border-red-300',
  POST_WARNING: 'bg-red-200 text-red-950 border-red-400',
  AT_RISK: 'bg-red-600 text-white border-red-700',
};
