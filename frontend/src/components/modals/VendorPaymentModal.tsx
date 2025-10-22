'use client';

import { useState, useEffect } from 'react';
import Modal from './Modal';
import { api } from '@/services/api';

interface VendorPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const PAYMENT_METHODS = ['CASH', 'CHEQUE', 'BANK_TRANSFER', 'UPI', 'OTHER'];
const PAYMENT_STATUS = ['PENDING', 'COMPLETED', 'FAILED'];

export default function VendorPaymentModal({ isOpen, onClose, onSuccess }: VendorPaymentModalProps) {
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    vendorId: '',
    amount: '',
    paymentMethod: 'BANK_TRANSFER',
    paymentDate: new Date().toISOString().split('T')[0],
    referenceNumber: '',
    paymentStatus: 'COMPLETED',
    remarks: '',
  });

  useEffect(() => {
    if (isOpen) {
      loadVendors();
    }
  }, [isOpen]);

  const loadVendors = async () => {
    try {
      const response = await api.get('/vendors');
      const data = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      setVendors(d((ata || [])).filter((v: any) => v.isActive));
    } catch (error) {
      console.error('Failed to load vendors:', error);
      alert('Failed to load vendors');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.vendorId || !formData.amount) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      await api.post('/vendor-payments', {
        vendorId: formData.vendorId,
        amountPaid: parseFloat(formData.amount),
        paymentMethod: formData.paymentMethod,
        paymentDate: formData.paymentDate,
        referenceNumber: formData.referenceNumber || null,
        paymentStatus: formData.paymentStatus,
        remarks: formData.remarks || null,
      });

      alert('Vendor payment recorded successfully!');
      onSuccess();
      handleClose();
    } catch (error: any) {
      console.error('Failed to record payment:', error);
      alert(error.response?.data?.message || 'Failed to record payment');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      vendorId: '',
      amount: '',
      paymentMethod: 'BANK_TRANSFER',
      paymentDate: new Date().toISOString().split('T')[0],
      referenceNumber: '',
      paymentStatus: 'COMPLETED',
      remarks: '',
    });
    onClose();
  };

  const selectedVendor = vendors.find(v => v.id === formData.vendorId);

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Record Vendor Payment" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Vendor Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Vendor <span className="text-red-600">*</span>
          </label>
          <select
            value={formData.vendorId}
            onChange={(e) => setFormData({ ...formData, vendorId: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            required
          >
            <option value="">Select Vendor</option>
            {((vendors || [])).map((vendor) => (
              <option key={vendor.id} value={vendor.id}>
                {vendor.vendorName} ({vendor.vendorCode})
              </option>
            ))}
          </select>
          {selectedVendor && selectedVendor.outstandingAmount > 0 && (
            <p className="text-sm text-red-600 mt-1">
              Outstanding Amount: ₹{selectedVendor.outstandingAmount?.toLocaleString('en-IN')}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Amount (₹) <span className="text-red-600">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Enter amount"
              required
            />
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Method <span className="text-red-600">*</span>
            </label>
            <select
              value={formData.paymentMethod}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              required
            >
              {((PAYMENT_METHODS || [])).map((method) => (
                <option key={method} value={method}>
                  {method.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Date <span className="text-red-600">*</span>
            </label>
            <input
              type="date"
              value={formData.paymentDate}
              onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              required
            />
          </div>

          {/* Reference Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reference Number
            </label>
            <input
              type="text"
              value={formData.referenceNumber}
              onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Cheque/Transaction ID"
            />
          </div>

          {/* Payment Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Status <span className="text-red-600">*</span>
            </label>
            <select
              value={formData.paymentStatus}
              onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              required
            >
              {((PAYMENT_STATUS || [])).map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Outstanding Amount Info */}
        {selectedVendor && parseFloat(formData.amount) > 0 && (
          <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-700">Current Outstanding:</span>
                <span className="text-lg font-bold text-gray-900">
                  ₹{(selectedVendor.outstandingAmount || 0).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-700">Payment Amount:</span>
                <span className="text-lg font-bold text-blue-600">
                  - ₹{parseFloat(formData.amount).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="pt-2 border-t border-blue-300 flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-700">Remaining Outstanding:</span>
                <span className="text-xl font-bold" style={{ color: '#A8211B' }}>
                  ₹{Math.max(0, (selectedVendor.outstandingAmount || 0) - parseFloat(formData.amount)).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Remarks */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Remarks
          </label>
          <textarea
            value={formData.remarks}
            onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            rows={3}
            placeholder="Any additional notes about this payment..."
          />
        </div>

        {/* Form Actions */}
        <div className="flex gap-3 pt-4 border-t">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-3 text-white rounded-lg font-medium disabled:opacity-50"
            style={{ backgroundColor: '#A8211B' }}
          >
            {loading ? 'Recording...' : 'Record Payment'}
          </button>
          <button
            type="button"
            onClick={handleClose}
            className="px-6 py-3 border-2 border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}
