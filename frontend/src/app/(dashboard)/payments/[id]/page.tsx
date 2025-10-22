'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { paymentsService } from '@/services/payments.service';

export default function ViewPaymentPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  
  const [payment, setPayment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      fetchPayment();
    }
  }, [id]);

  const fetchPayment = async () => {
    try {
      setLoading(true);
      const data = await paymentsService.getById(id);
      setPayment(data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch payment');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete payment "${payment?.paymentNumber}"?`)) {
      return;
    }

    try {
      await paymentsService.deletePayment(id);
      router.push('/payments');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete payment');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CLEARED':
        return '#3DA35D';
      case 'RECEIVED':
        return '#3B82F6';
      case 'PENDING':
        return '#F2C94C';
      case 'BOUNCED':
        return '#EF4444';
      case 'CANCELLED':
        return '#6B7280';
      default:
        return '#6B7280';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center py-16">
          <p className="text-gray-600">Loading payment...</p>
        </div>
      </div>
    );
  }

  if (error || !payment) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {error || 'Payment not found'}
        </div>
        <button
          onClick={() => router.push('/payments')}
          className="mt-4 flex items-center gap-2 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Payments</span>
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <button
        onClick={() => router.push('/payments')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
      >
        <ArrowLeft className="h-5 w-5" />
        <span>Back to Payments</span>
      </button>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#7B1E12' }}>
              Payment Details
            </h1>
            <p className="text-gray-600 mt-1">{payment.paymentNumber}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push(`/payments/${id}/edit`)}
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
              Payment Date
            </label>
            <p className="text-lg font-semibold">
              {payment.paymentDate
                ? new Date(payment.paymentDate).toLocaleDateString('en-IN')
                : '—'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount
            </label>
            <p className="text-lg font-semibold text-green-600">
              ₹{Number(payment.amount || 0).toLocaleString('en-IN')}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Mode
            </label>
            <p className="text-lg font-semibold">{payment.paymentMode?.replace(/_/g, ' ') || 'N/A'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <span
              className="px-3 py-1 rounded-full text-sm font-medium"
              style={{
                backgroundColor: `${getStatusColor(payment.status)}15`,
                color: getStatusColor(payment.status),
              }}
            >
              {payment.status}
            </span>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Verification Status
            </label>
            <div className="flex items-center gap-2">
              {payment.isVerified ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-green-600 font-semibold">Verified</span>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-red-600" />
                  <span className="text-red-600 font-semibold">Unverified</span>
                </>
              )}
            </div>
          </div>

          {payment.receiptNumber && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Receipt Number
              </label>
              <p className="text-lg font-semibold">{payment.receiptNumber}</p>
            </div>
          )}

          {payment.transactionId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Transaction ID
              </label>
              <p className="text-lg font-semibold">{payment.transactionId}</p>
            </div>
          )}

          {payment.remarks && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Remarks
              </label>
              <p className="text-gray-800">{payment.remarks}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Created At
            </label>
            <p className="text-gray-800">
              {new Date(payment.createdAt).toLocaleString('en-IN')}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Updated
            </label>
            <p className="text-gray-800">
              {new Date(payment.updatedAt).toLocaleString('en-IN')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
