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

  getBalanceSheet: async () => {
    return await api.get('/accounting/accounts/balance-sheet');
  },

  getProfitLoss: async () => {
    return await api.get('/accounting/accounts/profit-loss');
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
  getAll: async (params?: { category?: string; status?: string; startDate?: string; endDate?: string }) => {
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

  getVarianceReport: async (fiscalYear?: number) => {
    return await api.get('/accounting/budgets/variance-report', {
      params: { fiscalYear },
    });
  },

  create: async (data: Partial<Budget>) => {
    return await api.post('/accounting/budgets', data);
  },

  update: async (id: string, data: Partial<Budget>) => {
    return await api.patch(`/accounting/budgets/${id}`, data);
  },

  delete: async (id: string) => {
    return await api.delete(`/accounting/budgets/${id}`);
  },
};

// Journal Entries Service
export const journalEntriesService = {
  getAll: async (params?: { status?: string; startDate?: string; endDate?: string }) => {
    return await api.get('/journal-entries', { params });
  },

  getOne: async (id: string) => {
    return await api.get(`/journal-entries/${id}`);
  },

  create: async (data: { entryDate: string; description: string; lines: Partial<JournalEntryLine>[] }) => {
    return await api.post('/journal-entries', data);
  },

  update: async (id: string, data: Partial<JournalEntry>) => {
    return await api.patch(`/journal-entries/${id}`, data);
  },

  post: async (id: string) => {
    return await api.post(`/journal-entries/${id}/post`);
  },

  void: async (id: string, voidReason: string) => {
    return await api.post(`/journal-entries/${id}/void`, { voidReason });
  },

  delete: async (id: string) => {
    return await api.delete(`/journal-entries/${id}`);
  },
};

export default {
  accounts: accountsService,
  expenses: expensesService,
  budgets: budgetsService,
  journalEntries: journalEntriesService,
};
