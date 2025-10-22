'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { budgetsService } from '@/services/accounting.service';

export default function ViewBudgetPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  
  const [budget, setBudget] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      fetchBudget();
    }
  }, [id]);

  const fetchBudget = async () => {
    try {
      setLoading(true);
      const data = await budgetsService.getById(id);
      setBudget(data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch budget');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete budget "${budget?.budgetName}"?`)) {
      return;
    }

    try {
      await budgetsService.delete(id);
      router.push('/accounting/budgets');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete budget');
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center py-16">
          <p className="text-gray-600">Loading budget...</p>
        </div>
      </div>
    );
  }

  if (error || !budget) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {error || 'Budget not found'}
        </div>
        <button
          onClick={() => router.push('/accounting/budgets')}
          className="mt-4 flex items-center gap-2 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Budgets</span>
        </button>
      </div>
    );
  }

  const utilizationPercentage = budget.spentAmount 
    ? (budget.spentAmount / budget.allocatedAmount) * 100 
    : 0;

  return (
    <div className="p-6">
      <button
        onClick={() => router.push('/accounting/budgets')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
      >
        <ArrowLeft className="h-5 w-5" />
        <span>Back to Budgets</span>
      </button>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#7B1E12' }}>
              Budget Details
            </h1>
            <p className="text-gray-600 mt-1">{budget.budgetName}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push(`/accounting/budgets/${id}/edit`)}
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
              Fiscal Year
            </label>
            <p className="text-lg font-semibold">{budget.fiscalYear}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Period
            </label>
            <p className="text-lg font-semibold">{budget.period}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Allocated Amount
            </label>
            <p className="text-lg font-semibold text-green-600">
              ₹{Number(budget.allocatedAmount || 0).toLocaleString('en-IN')}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Spent Amount
            </label>
            <p className="text-lg font-semibold text-red-600">
              ₹{Number(budget.spentAmount || 0).toLocaleString('en-IN')}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Remaining Amount
            </label>
            <p className="text-lg font-semibold text-blue-600">
              ₹{Number((budget.allocatedAmount - (budget.spentAmount || 0))).toLocaleString('en-IN')}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Utilization
            </label>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-gray-200 rounded-full h-4">
                <div 
                  className={`h-4 rounded-full ${
                    utilizationPercentage > 90 ? 'bg-red-500' :
                    utilizationPercentage > 70 ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(utilizationPercentage, 100)}%` }}
                />
              </div>
              <span className="text-lg font-semibold">
                {utilizationPercentage.toFixed(1)}%
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <p className="text-lg font-semibold">
              {new Date(budget.startDate).toLocaleDateString('en-IN')}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <p className="text-lg font-semibold">
              {new Date(budget.endDate).toLocaleDateString('en-IN')}
            </p>
          </div>

          {budget.notes && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <p className="text-gray-800">{budget.notes}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Created At
            </label>
            <p className="text-gray-800">
              {new Date(budget.createdAt).toLocaleString('en-IN')}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Updated
            </label>
            <p className="text-gray-800">
              {new Date(budget.updatedAt).toLocaleString('en-IN')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
