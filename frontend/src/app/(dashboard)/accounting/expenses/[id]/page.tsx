'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { expensesService } from '@/services/accounting.service';

export default function ViewExpensePage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  
  const [expense, setExpense] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      fetchExpense();
    }
  }, [id]);

  const fetchExpense = async () => {
    try {
      setLoading(true);
      const data = await expensesService.getById(id);
      setExpense(data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch expense');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete this expense?`)) {
      return;
    }

    try {
      await expensesService.delete(id);
      router.push('/accounting/expenses');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete expense');
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center py-16">
          <p className="text-gray-600">Loading expense...</p>
        </div>
      </div>
    );
  }

  if (error || !expense) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {error || 'Expense not found'}
        </div>
        <button
          onClick={() => router.push('/accounting/expenses')}
          className="mt-4 flex items-center gap-2 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Expenses</span>
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
        <span>Back to Expenses</span>
      </button>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#7B1E12' }}>
              Expense Details
            </h1>
            <p className="text-gray-600 mt-1">{expense.category}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push(`/accounting/expenses/${id}/edit`)}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2"
              style={{ borderColor: '#A8211B', color: '#A8211B' }}
            >
              <Edit className="h-4 w-4" />
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expense Date
            </label>
            <p className="text-lg font-semibold">
              {new Date(expense.expenseDate).toLocaleDateString('en-IN')}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount
            </label>
            <p className="text-lg font-semibold text-green-600">
              ₹{Number(expense.amount || 0).toLocaleString('en-IN')}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <p className="text-lg font-semibold">{expense.category}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Method
            </label>
            <p className="text-lg font-semibold">{expense.paymentMethod}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <p className="text-lg font-semibold">
              <span className={`px-3 py-1 rounded-full text-sm ${
                expense.status === 'PAID' ? 'bg-green-100 text-green-800' :
                expense.status === 'APPROVED' ? 'bg-blue-100 text-blue-800' :
                expense.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {expense.status}
              </span>
            </p>
          </div>

          {expense.vendor && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vendor
              </label>
              <p className="text-lg font-semibold">{expense.vendor}</p>
            </div>
          )}

          {expense.description && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <p className="text-gray-800">{expense.description}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Created At
            </label>
            <p className="text-gray-800">
              {new Date(expense.createdAt).toLocaleString('en-IN')}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Updated
            </label>
            <p className="text-gray-800">
              {new Date(expense.updatedAt).toLocaleString('en-IN')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
