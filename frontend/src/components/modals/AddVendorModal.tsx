'use client';

import { useState } from 'react';
import Modal from './Modal';
import { api } from '@/services/api';

interface AddVendorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const MATERIAL_CATEGORIES = [
  'CEMENT', 'STEEL', 'SAND', 'AGGREGATE', 'BRICKS', 'TILES',
  'ELECTRICAL', 'PLUMBING', 'PAINT', 'HARDWARE', 'OTHER'
];

export default function AddVendorModal({ isOpen, onClose, onSuccess }: AddVendorModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    vendorName: '',
    vendorCode: '',
    contactPerson: '',
    phoneNumber: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pinCode: '',
    gstNumber: '',
    panNumber: '',
    materialsSupplied: [] as string[],
    creditLimit: '',
    paymentTerms: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    rating: '3',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.vendorName || !formData.contactPerson || !formData.phoneNumber) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      await api.post('/vendors', {
        vendorName: formData.vendorName,
        vendorCode: formData.vendorCode || `VEN-${Date.now()}`,
        contactPerson: formData.contactPerson,
        phoneNumber: formData.phoneNumber,
        email: formData.email || null,
        address: formData.address || null,
        city: formData.city || null,
        state: formData.state || null,
        pinCode: formData.pinCode || null,
        gstNumber: formData.gstNumber || null,
        panNumber: formData.panNumber || null,
        materialsSupplied: formData.materialsSupplied,
        creditLimit: formData.creditLimit ? parseFloat(formData.creditLimit) : 0,
        paymentTerms: formData.paymentTerms || null,
        bankName: formData.bankName || null,
        accountNumber: formData.accountNumber || null,
        ifscCode: formData.ifscCode || null,
        rating: parseFloat(formData.rating),
        isActive: true,
      });

      alert('Vendor added successfully!');
      onSuccess();
      handleClose();
    } catch (error: any) {
      console.error('Failed to add vendor:', error);
      alert(error.response?.data?.message || 'Failed to add vendor');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      vendorName: '',
      vendorCode: '',
      contactPerson: '',
      phoneNumber: '',
      email: '',
      address: '',
      city: '',
      state: '',
      pinCode: '',
      gstNumber: '',
      panNumber: '',
      materialsSupplied: [],
      creditLimit: '',
      paymentTerms: '',
      bankName: '',
      accountNumber: '',
      ifscCode: '',
      rating: '3',
    });
    onClose();
  };

  const toggleMaterial = (material: string) => {
    setFormData(prev => ({
      ...prev,
      materialsSupplied: prev.materialsSupplied.includes(material)
        ? prev.materialsSupplied.filter(m => m !== material)
        : [...prev.materialsSupplied, material]
    }));
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add New Vendor" size="xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div>
          <h3 className="text-lg font-semibold mb-3" style={{ color: '#A8211B' }}>
            Basic Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vendor Name <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={formData.vendorName}
                onChange={(e) => setFormData({ ...formData, vendorName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vendor Code
              </label>
              <input
                type="text"
                value={formData.vendorCode}
                onChange={(e) => setFormData({ ...formData, vendorCode: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Auto-generated if empty"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Person <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number <span className="text-red-600">*</span>
              </label>
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div>
          <h3 className="text-lg font-semibold mb-3" style={{ color: '#A8211B' }}>
            Address
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State
              </label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                PIN Code
              </label>
              <input
                type="text"
                value={formData.pinCode}
                onChange={(e) => setFormData({ ...formData, pinCode: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Tax & Business Information */}
        <div>
          <h3 className="text-lg font-semibold mb-3" style={{ color: '#A8211B' }}>
            Tax & Business Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                GST Number
              </label>
              <input
                type="text"
                value={formData.gstNumber}
                onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                PAN Number
              </label>
              <input
                type="text"
                value={formData.panNumber}
                onChange={(e) => setFormData({ ...formData, panNumber: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Materials Supplied */}
        <div>
          <h3 className="text-lg font-semibold mb-3" style={{ color: '#A8211B' }}>
            Materials Supplied
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {MATERIAL_CATEGORIES.map((material) => (
              <label key={material} className="flex items-center space-x-2 p-2 border rounded hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.materialsSupplied.includes(material)}
                  onChange={() => toggleMaterial(material)}
                  className="rounded text-red-600 focus:ring-red-500"
                />
                <span className="text-sm">{material}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Payment Terms */}
        <div>
          <h3 className="text-lg font-semibold mb-3" style={{ color: '#A8211B' }}>
            Payment Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Credit Limit (₹)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.creditLimit}
                onChange={(e) => setFormData({ ...formData, creditLimit: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Terms
              </label>
              <input
                type="text"
                value={formData.paymentTerms}
                onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="e.g., Net 30 days"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vendor Rating
              </label>
              <select
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="1">1 Star</option>
                <option value="2">2 Stars</option>
                <option value="3">3 Stars</option>
                <option value="4">4 Stars</option>
                <option value="5">5 Stars</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bank Details */}
        <div>
          <h3 className="text-lg font-semibold mb-3" style={{ color: '#A8211B' }}>
            Bank Details (Optional)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bank Name
              </label>
              <input
                type="text"
                value={formData.bankName}
                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Number
              </label>
              <input
                type="text"
                value={formData.accountNumber}
                onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                IFSC Code
              </label>
              <input
                type="text"
                value={formData.ifscCode}
                onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex gap-3 pt-4 border-t">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-3 text-white rounded-lg font-medium disabled:opacity-50"
            style={{ backgroundColor: '#A8211B' }}
          >
            {loading ? 'Adding...' : 'Add Vendor'}
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
