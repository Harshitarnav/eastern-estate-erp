'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { expensesService, accountsService, Expense } from '@/services/accounting.service';

export default function NewExpensePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [accounts, setAccounts] = useState<any[]>([]);
  
  type ExpenseForm = {
    expenseDate: string;
    category: string;
    amount: number;
    accountId: string;
    vendor: string;
    description: string;
    paymentMethod: string;
    status: Expense['status'];
  };

  const [formData, setFormData] = useState<ExpenseForm>({
    expenseDate: new Date().toISOString().split('T')[0],
    category: '',
    amount: 0,
    accountId: '',
    vendor: '',
    description: '',
    paymentMethod: 'CASH',
    status: 'PENDING'
  });

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const data = await accountsService.getAll({ accountType: 'EXPENSE' });
      setAccounts(data);
    } catch (err) {
      console.error('Error fetching accounts:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await expensesService.create(formData);
      window.location.href = '/accounting/expenses';
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create expense');
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <button
        onClick={() => router.push('/accounting/expenses')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
      >
        <ArrowLeft className="h-5 w-5" />
        <span>Back to Expenses</span>
      </button>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6" style={{ color: '#7B1E12' }}>
          New Expense
        </h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expense Date *
              </label>
              <input
                type="date"
                required
                value={formData.expenseDate}
                onChange={(e) => setFormData({ ...formData, expenseDate: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <input
                type="text"
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                placeholder="e.g., Office Supplies, Utilities"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount *
              </label>
              <input
                type="number"
                required
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expense Account *
              </label>
              <select
                required
                value={formData.accountId}
                onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
              >
                <option value="">Select Account</option>
                {(accounts || []).map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.accountCode} - {account.accountName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vendor
              </label>
              <input
                type="text"
                value={formData.vendor}
                onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                placeholder="Vendor name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method *
              </label>
              <select
                required
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
              >
                <option value="CASH">Cash</option>
                <option value="BANK">Bank Transfer</option>
                <option value="CHECK">Check</option>
                <option value="CARD">Card</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status *
              </label>
              <select
                required
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as Expense['status'],
                  })
                }
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
              >
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="PAID">Paid</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                rows={3}
                placeholder="Optional description"
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-6 border-t">
            <button
              type="button"
              onClick={() => router.push('/accounting/expenses')}
              className="px-6 py-2 border rounded-lg hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 rounded-lg text-white disabled:opacity-50"
              style={{ backgroundColor: '#A8211B' }}
            >
              {loading ? 'Creating...' : 'Create Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
