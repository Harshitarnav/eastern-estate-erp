'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { expensesService, accountsService, type Expense } from '@/services/accounting.service';
import { FormSkeleton } from '@/components/Skeletons';
import { useAuthStore } from '@/store/authStore';

const CATEGORIES = [
  'Rent', 'Utilities', 'Office Supplies', 'Salaries', 'Marketing',
  'Materials', 'Maintenance', 'Travel', 'Professional Fees', 'Insurance', 'Taxes', 'Other',
];

const TYPE_SUGGESTIONS: Record<string, string[]> = {
  Rent:              ['Office Rent', 'Warehouse Rent', 'Site Rent'],
  Utilities:         ['Electricity', 'Water', 'Internet', 'Phone'],
  'Office Supplies': ['Stationery', 'Printer Ink', 'Furniture'],
  Salaries:          ['Basic Salary', 'Bonus', 'Overtime', 'Advance'],
  Marketing:         ['Digital Ads', 'Print Ads', 'Events', 'Branding'],
  Materials:         ['Raw Material', 'Cement', 'Steel', 'Paint'],
  Maintenance:       ['Repairs', 'AMC', 'Cleaning', 'Security'],
  Travel:            ['Fuel', 'Flights', 'Hotel', 'Local Conveyance'],
  'Professional Fees': ['Legal', 'CA/Audit', 'Consultant', 'Architect'],
  Insurance:         ['Property', 'Vehicle', 'Health', 'Life'],
  Taxes:             ['GST', 'Professional Tax', 'Property Tax'],
  Other:             ['Miscellaneous'],
};

type ExpenseForm = {
  expenseDate: string;
  expenseCategory: string;
  expenseType: string;
  amount: number;
  accountId: string;
  paymentReference: string;
  description: string;
  paymentMethod: string;
  status: Expense['status'];
};

export default function EditExpensePage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const { user } = useAuthStore();
  const canEdit = user?.roles?.some((r: any) =>
    ['super_admin', 'admin'].includes(typeof r === 'string' ? r : r.name)
  );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [accounts, setAccounts] = useState<any[]>([]);

  const [formData, setFormData] = useState<ExpenseForm>({
    expenseDate: '',
    expenseCategory: '',
    expenseType: '',
    amount: 0,
    accountId: '',
    paymentReference: '',
    description: '',
    paymentMethod: 'CASH',
    status: 'PENDING',
  });

  useEffect(() => {
    fetchAccounts();
    if (id) fetchExpense();
  }, [id]);

  const fetchAccounts = async () => {
    try {
      const data = await accountsService.getAll({ accountType: 'EXPENSE' });
      setAccounts(data || []);
    } catch (err) {
      console.error('Error fetching accounts:', err);
    }
  };

  const fetchExpense = async () => {
    try {
      setLoading(true);
      const data = await expensesService.getById(id);
      if (data.status !== 'PENDING') {
        setError(`This expense is ${data.status} and cannot be edited.`);
        setLoading(false);
        return;
      }
      const cat = data.expenseCategory || '';
      const rawType = data.expenseType || '';
      // If type was auto-mirrored as same as category, treat it as blank
      const type = rawType === cat ? '' : rawType;
      setFormData({
        expenseDate: (data.expenseDate || '').split('T')[0],
        expenseCategory: cat,
        expenseType: type,
        amount: Number(data.amount) || 0,
        accountId: data.accountId || '',
        paymentReference: (data as any).paymentReference || '',
        description: data.description || '',
        paymentMethod: (data as any).paymentMethod || 'CASH',
        status: data.status,
      });
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch expense');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...formData,
        expenseType: formData.expenseType || formData.expenseCategory,
        // Don't send empty strings for optional UUID fields
        accountId: formData.accountId || undefined,
        paymentReference: formData.paymentReference || undefined,
      };
      await expensesService.update(id, payload as any);
      router.push('/accounting/expenses');
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join('. ') : msg || 'Failed to update expense');
      setSaving(false);
    }
  };

  if (loading) return <FormSkeleton fields={8} />;

  if (!canEdit) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          You do not have permission to edit expenses. Please contact an admin.
        </div>
        <button
          onClick={() => router.push(`/accounting/expenses/${id}`)}
          className="mt-4 flex items-center gap-2 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="h-5 w-5" /> Back
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <button
        onClick={() => router.push('/accounting/expenses')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
      >
        <ArrowLeft className="h-5 w-5" />
        Back to Expenses
      </button>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6" style={{ color: '#7B1E12' }}>
          Edit Expense
        </h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Expense Date *</label>
              <input
                type="date"
                required
                value={formData.expenseDate}
                onChange={(e) => setFormData({ ...formData, expenseDate: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
              <select
                required
                value={formData.expenseCategory}
                onChange={(e) => setFormData({ ...formData, expenseCategory: e.target.value, expenseType: '' })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
              >
                <option value="">Select Category</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type <span className="text-gray-400 font-normal">(optional — specific label)</span>
              </label>
              {(() => {
                const suggestions = TYPE_SUGGESTIONS[formData.expenseCategory] || [];
                const isCustom = formData.expenseType !== '' && !suggestions.includes(formData.expenseType);
                const selectVal = isCustom ? '__custom__' : formData.expenseType;
                return (
                  <>
                    <select
                      value={selectVal}
                      onChange={(e) => {
                        if (e.target.value === '__custom__') {
                          setFormData({ ...formData, expenseType: '' });
                        } else {
                          setFormData({ ...formData, expenseType: e.target.value });
                        }
                      }}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                    >
                      <option value="">— Same as category —</option>
                      {suggestions.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                      <option value="__custom__">Other (type manually)…</option>
                    </select>
                    {(selectVal === '__custom__' || isCustom) && (
                      <input
                        type="text"
                        value={isCustom ? formData.expenseType : ''}
                        onChange={(e) => setFormData({ ...formData, expenseType: e.target.value })}
                        className="w-full mt-2 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                        placeholder="Type a specific label…"
                        maxLength={100}
                      />
                    )}
                  </>
                );
              })()}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Amount *</label>
              <input
                type="number"
                required
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Expense Account</label>
              <select
                value={formData.accountId}
                onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
              >
                <option value="">Select Account</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.accountCode} - {account.accountName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method *</label>
              <select
                required
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
              >
                <option value="CASH">Cash</option>
                <option value="BANK">Bank Transfer</option>
                <option value="CHEQUE">Cheque</option>
                <option value="CARD">Card</option>
                <option value="UPI">UPI</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Reference</label>
              <input
                type="text"
                value={formData.paymentReference}
                onChange={(e) => setFormData({ ...formData, paymentReference: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                placeholder="e.g., Cheque No. 123, UPI Ref."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status *</label>
              <select
                required
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as Expense['status'] })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
              >
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="PAID">Paid</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                rows={3}
                placeholder="Optional notes about this expense"
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-6 border-t">
            <button
              type="button"
              onClick={() => router.push('/accounting/expenses')}
              className="px-6 py-2 border rounded-lg hover:bg-gray-50"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 rounded-lg text-white disabled:opacity-50"
              style={{ backgroundColor: '#A8211B' }}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
