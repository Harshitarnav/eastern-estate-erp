import api from './api';

export const accountingService = {
  // ============ CHART OF ACCOUNTS ============
  async getAccounts() {
    const response = await api.get('/accounting/accounts');
    return response;
  },

  async getAccountById(id: string) {
    const response = await api.get(`/accounting/accounts/${id}`);
    return response;
  },

  async createAccount(data: any) {
    const response = await api.post('/accounting/accounts', data);
    return response;
  },

  async updateAccount(id: string, data: any) {
    const response = await api.put(`/accounting/accounts/${id}`, data);
    return response;
  },

  // ============ JOURNAL ENTRIES ============
  async createJournalEntry(data: any) {
    const response = await api.post('/accounting/journal-entries', data);
    return response;
  },

  async getJournalEntryById(id: string) {
    const response = await api.get(`/accounting/journal-entries/${id}`);
    return response;
  },

  async getJournalEntryLines(id: string) {
    const response = await api.get(`/accounting/journal-entries/${id}/lines`);
    return response;
  },

  async importJournalEntriesFromExcel(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/accounting/journal-entries/import-excel', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response;
  },

  // ============ LEDGER REPORTS ============
  async getAccountLedger(accountId: string, startDate: string, endDate: string) {
    const response = await api.get(`/accounting/ledgers/account/${accountId}`, {
      params: { startDate, endDate },
    });
    return response;
  },

  async getWeeklyLedger(week: number, year: number) {
    const response = await api.get('/accounting/ledgers/weekly', {
      params: { week, year },
    });
    return response;
  },

  async getCashBook(startDate: string, endDate: string) {
    const response = await api.get('/accounting/ledgers/cash-book', {
      params: { startDate, endDate },
    });
    return response;
  },

  async getBankBook(bankAccountId: string, startDate: string, endDate: string) {
    const response = await api.get(`/accounting/ledgers/bank-book/${bankAccountId}`, {
      params: { startDate, endDate },
    });
    return response;
  },

  // ============ EXPORTS ============
  async exportLedgerToExcel(accountId: string, startDate: string, endDate: string) {
    const response = await api.get<Blob>(`/accounting/exports/ledger/${accountId}`, {
      params: { startDate, endDate },
      responseType: 'blob',
    });
    
    // Download file
    const blob = response instanceof Blob ? response : new Blob([response as unknown as BlobPart]);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ledger-${accountId}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  async exportTrialBalance(date: string) {
    const response = await api.get<Blob>('/accounting/exports/trial-balance', {
      params: { date },
      responseType: 'blob',
    });
    
    const blob = response instanceof Blob ? response : new Blob([response as unknown as BlobPart]);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `trial-balance-${date}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  async exportForITR(financialYear: string) {
    const response = await api.get('/accounting/exports/itr', {
      params: { financialYear },
    });
    return response;
  },

  // ============ BANK ACCOUNTS ============
  async getBankAccounts() {
    const response = await api.get('/accounting/bank-accounts');
    return response;
  },

  async getBankAccountById(id: string) {
    const response = await api.get(`/accounting/bank-accounts/${id}`);
    return response;
  },

  async createBankAccount(data: any) {
    const response = await api.post('/accounting/bank-accounts', data);
    return response;
  },

  // ============ BANK STATEMENTS & RECONCILIATION ============
  async uploadBankStatement(bankAccountId: string, file: File) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('bankAccountId', bankAccountId);
    const response = await api.post('/accounting/bank-statements/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response;
  },

  async getUnreconciledTransactions(bankAccountId: string) {
    const response = await api.get(`/accounting/bank-statements/unreconciled/${bankAccountId}`);
    return response;
  },

  async reconcileTransaction(statementId: string, journalEntryId: string) {
    const response = await api.post(`/accounting/bank-statements/${statementId}/reconcile`, {
      journalEntryId,
    });
    return response;
  },
};
