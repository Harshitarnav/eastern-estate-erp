import api from './api';

// ─── Shared authenticated file download helper ─────────────────────────────
// Use this for all Excel/PDF downloads that need a JWT token.
export async function downloadWithAuth(
  path: string,           // e.g. '/accounting/exports/trial-balance?date=2026-01-01'
  filename: string,       // e.g. 'trial-balance-2026.xlsx'
): Promise<void> {
  const apiBase = (
    (typeof window !== 'undefined' && (window as any).__NEXT_PUBLIC_API_URL__) ||
    process.env.NEXT_PUBLIC_API_URL ||
    'http://localhost:3001/api/v1'
  ).replace(/\/+$/, '');

  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : '';
  const url = `${apiBase}${path}`;

  const response = await fetch(url, {
    headers: { Authorization: token ? `Bearer ${token}` : '' },
  });

  if (!response.ok) {
    const msg = await response.text().catch(() => response.statusText);
    throw new Error(`Export failed: ${msg}`);
  }

  const blob = await response.blob();
  const blobUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(blobUrl);
}

// Types
export interface Account {
  id: string;
  accountCode: string;
  accountName: string;
  accountType: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'INCOME' | 'EXPENSE';
  accountCategory: string;
  parentAccountId?: string;
  isActive: boolean;
  currentBalance: number;
  propertyId?: string | null;
  property?: { id: string; name: string };
  createdAt: string;
  updatedAt: string;
}

export interface Expense {
  id: string;
  expenseCode: string;
  expenseCategory: string;
  expenseType?: string;
  expenseSubCategory?: string;
  amount: number;
  expenseDate: string;
  description?: string;
  accountId?: string;
  paymentMethod?: string;
  paymentReference?: string;
  paymentStatus?: string;
  vendorId?: string;
  employeeId?: string;
  propertyId?: string;
  constructionProjectId?: string;
  status: 'PENDING' | 'APPROVED' | 'PAID' | 'REJECTED' | 'CANCELLED';
  receiptUrl?: string;
  invoiceNumber?: string;
  invoiceDate?: string;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
}

export interface Budget {
  id: string;
  budgetCode: string;
  budgetName: string;
  fiscalYear: number;
  startDate: string;
  endDate: string;
  accountId?: string;
  department?: string;
  budgetedAmount: number;
  actualAmount: number;
  varianceAmount?: number;
  variancePercentage?: number;
  status: 'DRAFT' | 'ACTIVE' | 'CLOSED' | 'REVISED';
  notes?: string;
  createdAt: string;
}

export interface JournalEntry {
  id: string;
  entryNumber: string;
  entryDate: string;
  description: string;
  totalDebit: number;
  totalCredit: number;
  status: 'DRAFT' | 'POSTED' | 'VOIDED' | 'VOID';
  referenceType?: string;
  referenceId?: string;
  createdBy?: string;
  lines: JournalEntryLine[];
  createdAt: string;
}

export interface JournalEntryLine {
  id: string;
  accountId: string;
  debitAmount: number;
  creditAmount: number;
  description?: string;
  account?: Account;
}

// Accounts Service
export const accountsService = {
  getAll: async (params?: { accountType?: string; isActive?: boolean; propertyId?: string }) => {
    return await api.get('/accounting/accounts', { params });
  },

  getById: async (id: string) => {
    return await api.get(`/accounting/accounts/${id}`);
  },

  getOne: async (id: string) => {
    return await api.get(`/accounting/accounts/${id}`);
  },

  getByCode: async (code: string) => {
    return await api.get(`/accounting/accounts/code/${code}`);
  },

  getHierarchy: async () => {
    return await api.get('/accounting/accounts/hierarchy');
  },

  getBalanceSheet: async (propertyId?: string) => {
    return await api.get('/accounting/accounts/balance-sheet', { params: propertyId ? { propertyId } : undefined });
  },

  getProfitLoss: async (propertyId?: string, startDate?: string, endDate?: string) => {
    return await api.get('/accounting/accounts/profit-loss', {
      params: { ...(propertyId ? { propertyId } : {}), ...(startDate ? { startDate } : {}), ...(endDate ? { endDate } : {}) },
    });
  },

  getTrialBalance: async (propertyId?: string) => {
    return await api.get('/accounting/accounts/trial-balance', { params: propertyId ? { propertyId } : undefined });
  },

  seedCoaForProject: async (propertyId: string) => {
    return await api.post(`/accounting/accounts/seed-for-project/${propertyId}`);
  },

  getPropertyWisePL: async (propertyId: string) => {
    return await api.get('/accounting/accounts/property-pl', { params: { propertyId } });
  },

  getLedger: async (accountId: string, startDate: string, endDate: string) => {
    return await api.get(`/accounting/ledgers/account/${accountId}`, {
      params: { startDate, endDate },
    });
  },

  getCashBook: async (startDate: string, endDate: string, propertyId?: string) => {
    return await api.get('/accounting/ledgers/cash-book', { params: { startDate, endDate, ...(propertyId ? { propertyId } : {}) } });
  },

  getBankBook: async (bankAccountId: string, startDate: string, endDate: string) => {
    return await api.get(`/accounting/ledgers/bank-book/${bankAccountId}`, {
      params: { startDate, endDate },
    });
  },

  exportLedger: (accountId: string, startDate: string, endDate: string) => {
    return `/accounting/exports/ledger/${accountId}?startDate=${startDate}&endDate=${endDate}`;
  },

  exportTrialBalance: (date: string) => {
    return `/accounting/exports/trial-balance?date=${date}`;
  },

  exportITR: async (financialYear: string) => {
    return await api.get('/accounting/exports/itr', { params: { financialYear } });
  },

  create: async (data: Partial<Account>) => {
    return await api.post('/accounting/accounts', data);
  },

  update: async (id: string, data: Partial<Account>) => {
    return await api.patch(`/accounting/accounts/${id}`, data);
  },

  delete: async (id: string) => {
    return await api.delete(`/accounting/accounts/${id}`);
  },
};

// Expenses Service
export const expensesService = {
  getAll: async (params?: { category?: string; status?: string; startDate?: string; endDate?: string; propertyId?: string }) => {
    return await api.get('/accounting/expenses', { params });
  },

  getById: async (id: string) => {
    return await api.get(`/accounting/expenses/${id}`);
  },

  getOne: async (id: string) => {
    return await api.get(`/accounting/expenses/${id}`);
  },

  getSummary: async (params?: { startDate?: string; endDate?: string }) => {
    return await api.get('/accounting/expenses/summary', { params });
  },

  create: async (data: Partial<Expense>) => {
    return await api.post('/accounting/expenses', data);
  },

  update: async (id: string, data: Partial<Expense>) => {
    return await api.patch(`/accounting/expenses/${id}`, data);
  },

  approve: async (id: string, notes?: string) => {
    return await api.post(`/accounting/expenses/${id}/approve`, { notes });
  },

  reject: async (id: string, rejectionReason: string) => {
    return await api.post(`/accounting/expenses/${id}/reject`, { rejectionReason });
  },

  markAsPaid: async (id: string) => {
    return await api.post(`/accounting/expenses/${id}/paid`);
  },

  delete: async (id: string) => {
    return await api.delete(`/accounting/expenses/${id}`);
  },
};

// Budgets Service
export const budgetsService = {
  getAll: async (params?: { fiscalYear?: number; status?: string }) => {
    return await api.get('/accounting/budgets', { params });
  },

  getById: async (id: string) => {
    return await api.get(`/accounting/budgets/${id}`);
  },

  getOne: async (id: string) => {
    return await api.get(`/accounting/budgets/${id}`);
  },

  create: async (dto: Partial<Budget>) => {
    return await api.post('/accounting/budgets', dto);
  },

  update: async (id: string, dto: Partial<Budget>) => {
    return await api.patch(`/accounting/budgets/${id}`, dto);
  },

  delete: async (id: string) => {
    return await api.delete(`/accounting/budgets/${id}`);
  },

  getVarianceReport: async (fiscalYear?: number) => {
    return await api.get('/accounting/budgets/variance-report', {
      params: { fiscalYear },
    });
  },
};

// Journal Entries Service
export const journalEntriesService = {
  getAll: async (params?: { status?: string; startDate?: string; endDate?: string; referenceType?: string }) => {
    return await api.get('/accounting/journal-entries', { params });
  },

  getOne: async (id: string) => {
    return await api.get(`/accounting/journal-entries/${id}`);
  },

  create: async (data: {
    entryDate: string;
    description: string;
    referenceType?: string;
    referenceId?: string;
    lines: Partial<JournalEntryLine>[];
  }) => {
    return await api.post('/accounting/journal-entries', data);
  },

  update: async (id: string, data: Partial<JournalEntry>) => {
    return await api.patch(`/accounting/journal-entries/${id}`, data);
  },

  post: async (id: string) => {
    return await api.post(`/accounting/journal-entries/${id}/post`);
  },

  void: async (id: string, voidReason: string) => {
    return await api.post(`/accounting/journal-entries/${id}/void`, { voidReason });
  },

  delete: async (id: string) => {
    return await api.delete(`/accounting/journal-entries/${id}`);
  },
};

export const bankAccountsService = {
  getAll: async (propertyId?: string) => {
    return await api.get('/accounting/bank-accounts', { params: propertyId ? { propertyId } : undefined });
  },
  getOne: async (id: string) => {
    return await api.get(`/accounting/bank-accounts/${id}`);
  },
  create: async (data: {
    accountNumber: string;
    accountName: string;
    bankName: string;
    branchName?: string;
    ifscCode?: string;
    accountType?: string;
    openingBalance?: number;
    description?: string;
    propertyId?: string;
  }) => {
    return await api.post('/accounting/bank-accounts', data);
  },
  update: async (id: string, data: Partial<{
    accountName: string;
    bankName: string;
    branchName: string;
    ifscCode: string;
    accountType: string;
    description: string;
    isActive: boolean;
  }>) => {
    return await api.patch(`/accounting/bank-accounts/${id}`, data);
  },
  delete: async (id: string) => {
    return await api.delete(`/accounting/bank-accounts/${id}`);
  },
};

export const bankStatementsService = {
  upload: async (bankAccountId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('bankAccountId', bankAccountId);
    return await api.post('/accounting/bank-statements/upload', formData);
  },
  getUnreconciled: async (bankAccountId: string) => {
    return await api.get(`/accounting/bank-statements/unreconciled/${bankAccountId}`);
  },
  reconcile: async (statementId: string, journalEntryId: string) => {
    return await api.post(`/accounting/bank-statements/${statementId}/reconcile`, { journalEntryId });
  },
};

export default {
  accounts: accountsService,
  expenses: expensesService,
  budgets: budgetsService,
  journalEntries: journalEntriesService,
  bankAccounts: bankAccountsService,
  bankStatements: bankStatementsService,
};
