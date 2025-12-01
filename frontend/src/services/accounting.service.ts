import api from './api';

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
  createdAt: string;
  updatedAt: string;
}

export interface Expense {
  id: string;
  expenseCode: string;
  expenseCategory: string;
  expenseType: string;
  amount: number;
  expenseDate: string;
  description: string;
  status: 'PENDING' | 'APPROVED' | 'PAID' | 'REJECTED' | 'CANCELLED';
  receiptUrl?: string;
  invoiceNumber?: string;
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
  budgetedAmount: number;
  actualAmount: number;
  varianceAmount: number;
  variancePercentage: number;
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
  status: 'DRAFT' | 'POSTED' | 'VOIDED';
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
  getAll: async (params?: { accountType?: string; isActive?: boolean }) => {
    const response = await api.get('/accounting/accounts', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/accounting/accounts/${id}`);
    return response.data;
  },

  getOne: async (id: string) => {
    const response = await api.get(`/accounting/accounts/${id}`);
    return response.data;
  },

  getByCode: async (code: string) => {
    const response = await api.get(`/accounting/accounts/code/${code}`);
    return response.data;
  },

  getHierarchy: async () => {
    const response = await api.get('/accounting/accounts/hierarchy');
    return response.data;
  },

  getBalanceSheet: async () => {
    const response = await api.get('/accounting/accounts/balance-sheet');
    return response.data;
  },

  getProfitLoss: async () => {
    const response = await api.get('/accounting/accounts/profit-loss');
    return response.data;
  },

  create: async (data: Partial<Account>) => {
    const response = await api.post('/accounting/accounts', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Account>) => {
    const response = await api.patch(`/accounting/accounts/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/accounting/accounts/${id}`);
    return response.data;
  },
};

// Expenses Service
export const expensesService = {
  getAll: async (params?: { category?: string; status?: string; startDate?: string; endDate?: string }) => {
    const response = await api.get('/accounting/expenses', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/accounting/expenses/${id}`);
    return response.data;
  },

  getOne: async (id: string) => {
    const response = await api.get(`/accounting/expenses/${id}`);
    return response.data;
  },

  getSummary: async (params?: { startDate?: string; endDate?: string }) => {
    const response = await api.get('/accounting/expenses/summary', { params });
    return response.data;
  },

  create: async (data: Partial<Expense>) => {
    const response = await api.post('/accounting/expenses', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Expense>) => {
    const response = await api.patch(`/accounting/expenses/${id}`, data);
    return response.data;
  },

  approve: async (id: string, notes?: string) => {
    const response = await api.post(`/accounting/expenses/${id}/approve`, { notes });
    return response.data;
  },

  reject: async (id: string, rejectionReason: string) => {
    const response = await api.post(`/accounting/expenses/${id}/reject`, { rejectionReason });
    return response.data;
  },

  markAsPaid: async (id: string) => {
    const response = await api.post(`/accounting/expenses/${id}/paid`);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/accounting/expenses/${id}`);
    return response.data;
  },
};

// Budgets Service
export const budgetsService = {
  getAll: async (params?: { fiscalYear?: number; status?: string }) => {
    const response = await api.get('/accounting/budgets', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/accounting/budgets/${id}`);
    return response.data;
  },

  getOne: async (id: string) => {
    const response = await api.get(`/accounting/budgets/${id}`);
    return response.data;
  },

  getVarianceReport: async (fiscalYear?: number) => {
    const response = await api.get('/accounting/budgets/variance-report', {
      params: { fiscalYear },
    });
    return response.data;
  },

  create: async (data: Partial<Budget>) => {
    const response = await api.post('/accounting/budgets', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Budget>) => {
    const response = await api.patch(`/accounting/budgets/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/accounting/budgets/${id}`);
    return response.data;
  },
};

// Journal Entries Service
export const journalEntriesService = {
  getAll: async (params?: { status?: string; startDate?: string; endDate?: string }) => {
    const response = await api.get('/journal-entries', { params });
    return response.data;
  },

  getOne: async (id: string) => {
    const response = await api.get(`/journal-entries/${id}`);
    return response.data;
  },

  create: async (data: { entryDate: string; description: string; lines: Partial<JournalEntryLine>[] }) => {
    const response = await api.post('/journal-entries', data);
    return response.data;
  },

  update: async (id: string, data: Partial<JournalEntry>) => {
    const response = await api.patch(`/journal-entries/${id}`, data);
    return response.data;
  },

  post: async (id: string) => {
    const response = await api.post(`/journal-entries/${id}/post`);
    return response.data;
  },

  void: async (id: string, voidReason: string) => {
    const response = await api.post(`/journal-entries/${id}/void`, { voidReason });
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/journal-entries/${id}`);
    return response.data;
  },
};

export default {
  accounts: accountsService,
  expenses: expensesService,
  budgets: budgetsService,
  journalEntries: journalEntriesService,
};
