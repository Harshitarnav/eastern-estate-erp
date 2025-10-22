'use client';

import { useState, useEffect } from 'react';
import Modal from './Modal';
import { api } from '@/services/api';

interface CreatePurchaseOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  propertyId: string;
}

interface OrderItem {
  id: string;
  materialId: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export default function CreatePurchaseOrderModal({ isOpen, onClose, onSuccess, propertyId }: CreatePurchaseOrderModalProps) {
  const [vendors, setVendors] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    vendorId: '',
    orderDate: new Date().toISOString().split('T')[0],
    expectedDeliveryDate: '',
    paymentTerms: '',
    discount: '0',
    taxRate: '18',
    remarks: '',
  });
  const [items, setItems] = useState<OrderItem[]>([
    { id: '1', materialId: '', quantity: 0, unitPrice: 0, subtotal: 0 }
  ]);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    try {
      const [vendorsRes, materialsRes] = await Promise.all([
        api.get('/vendors'),
        api.get('/materials')
      ]);
      
      const vendorsData = Array.isArray(vendorsRes.data) ? vendorsRes.data : (vendorsRes.data?.data || []);
      const materialsData = Array.isArray(materialsRes.data) ? materialsRes.data : (materialsRes.data?.data || []);
      
      setVendors(vendorsData.filter((v: any) => v.isActive));
      setMaterials(materialsData.filter((m: any) => m.isActive));
    } catch (error) {
      console.error('Failed to load data:', error);
      alert('Failed to load vendors and materials');
    }
  };

  const addItem = () => {
    setItems([...items, { 
      id: Date.now().toString(), 
      materialId: '', 
      quantity: 0, 
      unitPrice: 0, 
      subtotal: 0 
    }]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof OrderItem, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        
        // Auto-fill unit price when material is selected
        if (field === 'materialId') {
          const material = materials.find(m => m.id === value);
          if (material) {
            updated.unitPrice = material.unitPrice;
          }
        }
        
        // Calculate subtotal
        if (field === 'quantity' || field === 'unitPrice' || field === 'materialId') {
          updated.subtotal = updated.quantity * updated.unitPrice;
        }
        
        return updated;
      }
      return item;
    }));
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    const discountAmount = (subtotal * parseFloat(formData.discount || '0')) / 100;
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = (taxableAmount * parseFloat(formData.taxRate || '0')) / 100;
    const grandTotal = taxableAmount + taxAmount;

    return { subtotal, discountAmount, taxableAmount, taxAmount, grandTotal };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.vendorId || items.length === 0) {
      alert('Please select vendor and add at least one item');
      return;
    }

    // Validate all items
    const invalidItem = items.find(item => !item.materialId || item.quantity <= 0);
    if (invalidItem) {
      alert('Please fill in all item details');
      return;
    }

    const totals = calculateTotals();
    
    setLoading(true);
    try {
      await api.post('/purchase-orders', {
        vendorId: formData.vendorId,
        orderDate: formData.orderDate,
        expectedDeliveryDate: formData.expectedDeliveryDate || null,
        totalAmount: totals.grandTotal,
        taxAmount: totals.taxAmount,
        discount: parseFloat(formData.discount || '0'),
        paymentTerms: formData.paymentTerms || null,
        status: 'PENDING',
        remarks: formData.remarks || null,
        items: items.map(item => ({
          materialId: item.materialId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          subtotal: item.subtotal,
        })),
      });

      alert('Purchase order created successfully!');
      onSuccess();
      handleClose();
    } catch (error: any) {
      console.error('Failed to create purchase order:', error);
      alert(error.response?.data?.message || 'Failed to create purchase order');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      vendorId: '',
      orderDate: new Date().toISOString().split('T')[0],
      expectedDeliveryDate: '',
      paymentTerms: '',
      discount: '0',
      taxRate: '18',
      remarks: '',
    });
    setItems([{ id: '1', materialId: '', quantity: 0, unitPrice: 0, subtotal: 0 }]);
    onClose();
  };

  const totals = calculateTotals();

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create Purchase Order" size="xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header Information */}
        <div>
          <h3 className="text-lg font-semibold mb-3" style={{ color: '#A8211B' }}>
            Order Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                {vendors.map((vendor) => (
                  <option key={vendor.id} value={vendor.id}>
                    {vendor.vendorName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Order Date <span className="text-red-600">*</span>
              </label>
              <input
                type="date"
                value={formData.orderDate}
                onChange={(e) => setFormData({ ...formData, orderDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expected Delivery Date
              </label>
              <input
                type="date"
                value={formData.expectedDeliveryDate}
                onChange={(e) => setFormData({ ...formData, expectedDeliveryDate: e.target.value })}
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
          </div>
        </div>

        {/* Order Items */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold" style={{ color: '#A8211B' }}>
              Order Items
            </h3>
            <button
              type="button"
              onClick={addItem}
              className="px-4 py-2 text-white rounded-lg text-sm font-medium"
              style={{ backgroundColor: '#A8211B' }}
            >
              + Add Item
            </button>
          </div>
          
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {items.map((item, index) => (
              <div key={item.id} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700">Item {index + 1}</span>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Material <span className="text-red-600">*</span>
                    </label>
                    <select
                      value={item.materialId}
                      onChange={(e) => updateItem(item.id, 'materialId', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      required
                    >
                      <option value="">Select Material</option>
                      {materials.map((material) => (
                        <option key={material.id} value={material.id}>
                          {material.materialName} - ₹{material.unitPrice}/{material.unitOfMeasurement}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Quantity <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={item.quantity || ''}
                      onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      placeholder="0"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Unit Price (₹) <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={item.unitPrice || ''}
                      onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>
                <div className="mt-2 text-right">
                  <span className="text-sm font-semibold text-gray-700">
                    Subtotal: ₹{item.subtotal.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Details */}
        <div>
          <h3 className="text-lg font-semibold mb-3" style={{ color: '#A8211B' }}>
            Pricing
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discount (%)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.discount}
                onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tax Rate (% GST)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.taxRate}
                onChange={(e) => setFormData({ ...formData, taxRate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="18"
              />
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border-2" style={{ borderColor: '#A8211B' }}>
          <h3 className="text-lg font-semibold mb-3" style={{ color: '#A8211B' }}>
            Order Summary
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium">₹{totals.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Discount ({formData.discount}%):</span>
              <span className="font-medium text-red-600">- ₹{totals.discountAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Taxable Amount:</span>
              <span className="font-medium">₹{totals.taxableAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax ({formData.taxRate}% GST):</span>
              <span className="font-medium">₹{totals.taxAmount.toFixed(2)}</span>
            </div>
            <div className="pt-2 border-t-2 flex justify-between">
              <span className="text-lg font-bold" style={{ color: '#A8211B' }}>Grand Total:</span>
              <span className="text-2xl font-bold" style={{ color: '#A8211B' }}>
                ₹{totals.grandTotal.toFixed(2)}
              </span>
            </div>
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
            rows={2}
            placeholder="Any special instructions or notes..."
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
            {loading ? 'Creating...' : 'Create Purchase Order'}
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
