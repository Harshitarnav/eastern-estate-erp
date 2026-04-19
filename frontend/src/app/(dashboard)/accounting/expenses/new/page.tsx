'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { expensesService, accountsService, Expense } from '@/services/accounting.service';
import { propertiesService } from '@/services/properties.service';
import { usePropertyStore } from '@/store/propertyStore';

const EXPENSE_CATEGORIES = [
  'Rent',
  'Utilities',
  'Office Supplies',
  'Salaries',
  'Marketing',
  'Materials',
  'Maintenance',
  'Travel',
  'Professional Fees',
  'Insurance',
  'Taxes',
  'Other',
];

// Suggested sub-types per category - user can still type anything
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

export default function NewExpensePage() {
  const router = useRouter();
  const { selectedProperties } = usePropertyStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [accounts, setAccounts] = useState<any[]>([]);
  const [properties, setProperties] = useState<{ id: string; name: string }[]>([]);

  type ExpenseForm = {
    expenseDate: string;
    expenseCategory: string;
    expenseType: string;
    amount: number;
    accountId: string;
    description: string;
    paymentMethod: string;
    paymentReference: string;
    status: Expense['status'];
    propertyId: string;
  };

  const [formData, setFormData] = useState<ExpenseForm>({
    expenseDate: new Date().toISOString().split('T')[0],
    expenseCategory: '',
    expenseType: '',
    amount: 0,
    accountId: '',
    description: '',
    paymentMethod: 'CASH',
    paymentReference: '',
    status: 'PENDING',
    propertyId: selectedProperties[0] ?? '',
  });

  useEffect(() => {
    const pid = formData.propertyId || undefined;
    accountsService.getAll({ accountType: 'EXPENSE', propertyId: pid })
      .then(data => setAccounts(Array.isArray(data) ? data : []))
      .catch(err => console.error('Error fetching accounts:', err));
  }, [formData.propertyId]);

  useEffect(() => {
    propertiesService.getProperties({ limit: 100 })
      .then((res: any) => {
        const list = res?.data ?? res ?? [];
        setProperties(Array.isArray(list) ? list : list.data ?? []);
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.expenseCategory) {
      setError('Please select a category');
      return;
    }
    setLoading(true);
    setError('');

    try {
      await expensesService.create({
        expenseDate: formData.expenseDate,
        expenseCategory: formData.expenseCategory,
        expenseType: formData.expenseType || formData.expenseCategory,
        amount: formData.amount,
        accountId: formData.accountId || undefined,
        description: formData.description || undefined,
        paymentMethod: formData.paymentMethod,
        paymentReference: formData.paymentReference || undefined,
        status: formData.status,
        propertyId: formData.propertyId || undefined,
      });
      window.location.href = '/accounting/expenses';
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : (msg || 'Failed to create expense'));
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
              <select
                required
                value={formData.expenseCategory}
                onChange={(e) => setFormData({ ...formData, expenseCategory: e.target.value, expenseType: '' })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
              >
                <option value="">Select a category…</option>
                {EXPENSE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type <span className="text-gray-400 font-normal">(optional - specific label)</span>
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
                      <option value="">- Same as category -</option>
                      {suggestions.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                      <option value="__custom__">Other (type manually)…</option>
                    </select>
                    {(selectVal === '__custom__' || isCustom) && (
                      <input
                        type="text"
                        autoFocus
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount (₹) *
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
                <option value="CHECK">Cheque</option>
                <option value="CARD">Card</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expense Account (optional)
              </label>
              <select
                value={formData.accountId}
                onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
              >
                <option value="">- Auto (no account) -</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.accountCode} - {account.accountName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Reference
              </label>
              <input
                type="text"
                value={formData.paymentReference}
                onChange={(e) => setFormData({ ...formData, paymentReference: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                placeholder="Cheque no. / transfer ref."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status *
              </label>
              <select
                required
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as Expense['status'] })
                }
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
              >
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="PAID">Paid</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project *
              </label>
              <select
                required
                value={formData.propertyId}
                onChange={(e) => setFormData({ ...formData, propertyId: e.target.value, accountId: '' })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
              >
                <option value="">- Select project -</option>
                {properties.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <p className="text-xs text-gray-400 mt-1">Each expense must be tied to exactly one project (RERA requirement)</p>
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
                placeholder="Optional details about this expense"
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
              {loading ? 'Creating…' : 'Create Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
