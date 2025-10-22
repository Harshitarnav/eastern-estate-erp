'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { accountsService } from '@/services/accounting.service';

export default function ViewAccountPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  
  const [account, setAccount] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      fetchAccount();
    }
  }, [id]);

  const fetchAccount = async () => {
    try {
      setLoading(true);
      const data = await accountsService.getById(id);
      setAccount(data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch account');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete account "${account?.accountName}"?`)) {
      return;
    }

    try {
      await accountsService.delete(id);
      router.push('/accounting/accounts');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete account');
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center py-16">
          <p className="text-gray-600">Loading account...</p>
        </div>
      </div>
    );
  }

  if (error || !account) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {error || 'Account not found'}
        </div>
        <button
          onClick={() => router.push('/accounting/accounts')}
          className="mt-4 flex items-center gap-2 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Accounts</span>
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <button
        onClick={() => router.push('/accounting/accounts')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
      >
        <ArrowLeft className="h-5 w-5" />
        <span>Back to Accounts</span>
      </button>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#7B1E12' }}>
              Account Details
            </h1>
            <p className="text-gray-600 mt-1">{account.accountCode}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push(`/accounting/accounts/${id}/edit`)}
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
              Account Name
            </label>
            <p className="text-lg font-semibold">{account.accountName}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Account Type
            </label>
            <p className="text-lg font-semibold">{account.accountType}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <p className="text-lg font-semibold">{account.accountCategory}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Opening Balance
            </label>
            <p className="text-lg font-semibold">
              ₹{Number(account.openingBalance || 0).toLocaleString('en-IN')}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Balance
            </label>
            <p className="text-lg font-semibold">
              ₹{Number(account.currentBalance || 0).toLocaleString('en-IN')}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <p className="text-lg font-semibold">
              {account.isActive ? (
                <span className="text-green-600">Active</span>
              ) : (
                <span className="text-red-600">Inactive</span>
              )}
            </p>
          </div>

          {account.description && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <p className="text-gray-800">{account.description}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Created At
            </label>
            <p className="text-gray-800">
              {new Date(account.createdAt).toLocaleString('en-IN')}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Updated
            </label>
            <p className="text-gray-800">
              {new Date(account.updatedAt).toLocaleString('en-IN')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
