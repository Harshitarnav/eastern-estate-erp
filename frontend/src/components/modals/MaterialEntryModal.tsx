'use client';

import { useState, useEffect } from 'react';
import Modal from './Modal';
import { api } from '@/services/api';

interface MaterialEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function MaterialEntryModal({ isOpen, onClose, onSuccess }: MaterialEntryModalProps) {
  const [materials, setMaterials] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    materialId: '',
    vendorId: '',
    quantity: '',
    unitPrice: '',
    invoiceNumber: '',
    entryDate: new Date().toISOString().split('T')[0],
    remarks: '',
  });

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    try {
      const [materialsRes, vendorsRes] = await Promise.all([
        api.get('/materials'),
        api.get('/vendors')
      ]);
      
      const materialsData = Array.isArray(materialsRes.data) ? materialsRes.data : (materialsRes.data?.data || []);
      const vendorsData = Array.isArray(vendorsRes.data) ? vendorsRes.data : (vendorsRes.data?.data || []);
      
      setMaterials((materialsData || []).filter((m: any) => m.isActive));
      setVendors((vendorsData || []).filter((v: any) => v.isActive));
    } catch (error) {
      console.error('Failed to load data:', error);
      alert('Failed to load materials and vendors');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.materialId || !formData.quantity || !formData.unitPrice) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      await api.post('/material-entries', {
        materialId: formData.materialId,
        vendorId: formData.vendorId || null,
        quantityReceived: parseFloat(formData.quantity),
        unitPrice: parseFloat(formData.unitPrice),
        totalAmount: parseFloat(formData.quantity) * parseFloat(formData.unitPrice),
        invoiceNumber: formData.invoiceNumber || null,
        entryDate: formData.entryDate,
        remarks: formData.remarks || null,
      });

      alert('Material entry recorded successfully!');
      onSuccess();
      handleClose();
    } catch (error: any) {
      console.error('Failed to record material entry:', error);
      alert(error.response?.data?.message || 'Failed to record material entry');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      materialId: '',
      vendorId: '',
      quantity: '',
      unitPrice: '',
      invoiceNumber: '',
      entryDate: new Date().toISOString().split('T')[0],
      remarks: '',
    });
    onClose();
  };

  const selectedMaterial = materials.find(m => m.id === formData.materialId);
  const totalAmount = formData.quantity && formData.unitPrice
    ? (parseFloat(formData.quantity) * parseFloat(formData.unitPrice)).toFixed(2)
    : '0.00';

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Record Material Entry" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Material Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Material <span className="text-red-600">*</span>
            </label>
            <select
              value={formData.materialId}
              onChange={(e) => setFormData({ ...formData, materialId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              required
            >
              <option value="">Select Material</option>
              {((materials || [])).map((material) => (
                <option key={material.id} value={material.id}>
                  {material.materialName} ({material.materialCode})
                </option>
              ))}
            </select>
            {selectedMaterial && (
              <p className="text-xs text-gray-500 mt-1">
                Current Stock: {selectedMaterial.currentStock} {selectedMaterial.unitOfMeasurement}
              </p>
            )}
          </div>

          {/* Vendor Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vendor (Optional)
            </label>
            <select
              value={formData.vendorId}
              onChange={(e) => setFormData({ ...formData, vendorId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="">Select Vendor</option>
              {((vendors || [])).map((vendor) => (
                <option key={vendor.id} value={vendor.id}>
                  {vendor.vendorName}
                </option>
              ))}
            </select>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantity Received <span className="text-red-600">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Enter quantity"
              required
            />
            {selectedMaterial && (
              <p className="text-xs text-gray-500 mt-1">
                Unit: {selectedMaterial.unitOfMeasurement}
              </p>
            )}
          </div>

          {/* Unit Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Unit Price (₹) <span className="text-red-600">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.unitPrice}
              onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Enter unit price"
              required
            />
          </div>

          {/* Invoice Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Invoice Number
            </label>
            <input
              type="text"
              value={formData.invoiceNumber}
              onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Enter invoice number"
            />
          </div>

          {/* Entry Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Entry Date <span className="text-red-600">*</span>
            </label>
            <input
              type="date"
              value={formData.entryDate}
              onChange={(e) => setFormData({ ...formData, entryDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        {/* Total Amount Display */}
        <div className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-gray-700">Total Amount:</span>
            <span className="text-2xl font-bold" style={{ color: '#A8211B' }}>
              ₹{totalAmount}
            </span>
          </div>
        </div>

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
            placeholder="Any additional notes..."
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
            {loading ? 'Recording...' : 'Record Entry'}
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
