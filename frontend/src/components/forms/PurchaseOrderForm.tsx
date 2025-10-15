'use client';

import { useState } from 'react';
import { Form, FormField } from './Form';

interface PurchaseOrderFormProps {
  onSubmit: (data: any) => void;
  initialData?: any;
  onCancel?: () => void;
}

export function PurchaseOrderForm({ onSubmit, initialData, onCancel }: PurchaseOrderFormProps) {
  const [items, setItems] = useState(initialData?.items || [
    { itemId: '', itemCode: '', itemName: '', category: '', quantity: 0, unit: '', unitPrice: 0, discount: 0, taxPercent: 18 }
  ]);

  const addItem = () => {
    setItems([...items, { itemId: '', itemCode: '', itemName: '', category: '', quantity: 0, unit: '', unitPrice: 0, discount: 0, taxPercent: 18 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleFormSubmit = (formData: any) => {
    onSubmit({ ...formData, items });
  };

  const fields: FormField[] = [
    {
      name: 'orderNumber',
      label: 'Order Number',
      type: 'text',
      required: true,
      placeholder: 'e.g., PO-2025-001',
    },
    {
      name: 'orderDate',
      label: 'Order Date',
      type: 'date',
      required: true,
    },
    {
      name: 'supplierId',
      label: 'Supplier ID',
      type: 'text',
      required: true,
      placeholder: 'Supplier UUID',
    },
    {
      name: 'supplierName',
      label: 'Supplier Name',
      type: 'text',
      required: true,
      placeholder: 'e.g., ABC Suppliers Ltd.',
    },
    {
      name: 'supplierEmail',
      label: 'Supplier Email',
      type: 'email',
      required: false,
      placeholder: 'supplier@example.com',
    },
    {
      name: 'supplierPhone',
      label: 'Supplier Phone',
      type: 'text',
      required: false,
      placeholder: '+91 9876543210',
    },
    {
      name: 'supplierAddress',
      label: 'Supplier Address',
      type: 'textarea',
      required: false,
      placeholder: 'Complete supplier address...',
    },
    {
      name: 'supplierGSTIN',
      label: 'Supplier GSTIN',
      type: 'text',
      required: false,
      placeholder: 'e.g., 27AABCU9603R1ZM',
    },
    {
      name: 'paymentTerms',
      label: 'Payment Terms',
      type: 'select',
      required: true,
      options: [
        { value: 'NET_30', label: 'Net 30 Days' },
        { value: 'NET_15', label: 'Net 15 Days' },
        { value: 'NET_7', label: 'Net 7 Days' },
        { value: 'IMMEDIATE', label: 'Immediate' },
        { value: 'NET_60', label: 'Net 60 Days' },
        { value: 'NET_90', label: 'Net 90 Days' },
        { value: 'ADVANCE_50', label: '50% Advance' },
        { value: 'ADVANCE_100', label: '100% Advance' },
      ],
    },
    {
      name: 'shippingCost',
      label: 'Shipping Cost (₹)',
      type: 'number',
      required: false,
      placeholder: 'e.g., 5000',
    },
    {
      name: 'expectedDeliveryDate',
      label: 'Expected Delivery Date',
      type: 'date',
      required: false,
    },
    {
      name: 'deliveryAddress',
      label: 'Delivery Address',
      type: 'textarea',
      required: false,
      placeholder: 'Complete delivery address...',
    },
    {
      name: 'notes',
      label: 'Notes',
      type: 'textarea',
      required: false,
      placeholder: 'Any additional notes...',
    },
  ];

  return (
    <div>
      <Form
        fields={fields}
        onSubmit={handleFormSubmit}
        initialData={initialData}
        submitLabel={initialData ? 'Update Purchase Order' : 'Create Purchase Order'}
        onCancel={onCancel}
        customContent={
          <div className="col-span-2">
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">Order Items *</label>
                <button
                  type="button"
                  onClick={addItem}
                  className="px-3 py-1 text-sm rounded-lg transition-colors"
                  style={{ backgroundColor: '#3DA35D', color: 'white' }}
                >
                  + Add Item
                </button>
              </div>
              
              <div className="space-y-4 border rounded-lg p-4 bg-gray-50">
                {items.map((item, index) => (
                  <div key={index} className="bg-white p-4 rounded-lg shadow-sm border">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-medium text-gray-700">Item {index + 1}</h4>
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Item Code *"
                        value={item.itemCode}
                        onChange={(e) => updateItem(index, 'itemCode', e.target.value)}
                        className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Item Name *"
                        value={item.itemName}
                        onChange={(e) => updateItem(index, 'itemName', e.target.value)}
                        className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                        required
                      />
                      <select
                        value={item.category}
                        onChange={(e) => updateItem(index, 'category', e.target.value)}
                        className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                        required
                      >
                        <option value="">Select Category *</option>
                        <option value="RAW_MATERIAL">Raw Material</option>
                        <option value="FINISHED_GOODS">Finished Goods</option>
                        <option value="TOOLS">Tools & Equipment</option>
                        <option value="CONSUMABLES">Consumables</option>
                      </select>
                      <input
                        type="number"
                        placeholder="Quantity *"
                        value={item.quantity || ''}
                        onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                        className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                        required
                        min="0"
                      />
                      <select
                        value={item.unit}
                        onChange={(e) => updateItem(index, 'unit', e.target.value)}
                        className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                        required
                      >
                        <option value="">Select Unit *</option>
                        <option value="PCS">Pieces (PCS)</option>
                        <option value="KG">Kilograms (KG)</option>
                        <option value="LITER">Liters (L)</option>
                        <option value="BOX">Box</option>
                        <option value="BAG">Bag</option>
                      </select>
                      <input
                        type="number"
                        placeholder="Unit Price (₹) *"
                        value={item.unitPrice || ''}
                        onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                        className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                        required
                        min="0"
                      />
                      <input
                        type="number"
                        placeholder="Discount (₹)"
                        value={item.discount || ''}
                        onChange={(e) => updateItem(index, 'discount', parseFloat(e.target.value) || 0)}
                        className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                        min="0"
                      />
                      <input
                        type="number"
                        placeholder="Tax % (GST)"
                        value={item.taxPercent || ''}
                        onChange={(e) => updateItem(index, 'taxPercent', parseFloat(e.target.value) || 0)}
                        className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                        min="0"
                        max="100"
                      />
                    </div>
                    
                    <div className="mt-2 text-sm text-gray-600">
                      <strong>Subtotal:</strong> ₹{((item.quantity * item.unitPrice) - (item.discount || 0)).toLocaleString()}
                      {' | '}
                      <strong>Tax:</strong> ₹{(((item.quantity * item.unitPrice) - (item.discount || 0)) * ((item.taxPercent || 0) / 100)).toLocaleString()}
                      {' | '}
                      <strong>Total:</strong> ₹{(((item.quantity * item.unitPrice) - (item.discount || 0)) * (1 + ((item.taxPercent || 0) / 100))).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="font-medium">Total Items:</div>
                  <div className="text-right">{items.length}</div>
                  <div className="font-medium">Total Quantity:</div>
                  <div className="text-right">{items.reduce((sum, item) => sum + (item.quantity || 0), 0)}</div>
                  <div className="font-medium">Gross Amount:</div>
                  <div className="text-right">₹{items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0).toLocaleString()}</div>
                  <div className="font-medium text-lg pt-2 border-t">Grand Total:</div>
                  <div className="text-right text-lg font-bold pt-2 border-t" style={{ color: '#3DA35D' }}>
                    ₹{items.reduce((sum, item) => {
                      const subtotal = (item.quantity * item.unitPrice) - (item.discount || 0);
                      const tax = subtotal * ((item.taxPercent || 0) / 100);
                      return sum + subtotal + tax;
                    }, 0).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        }
      />
    </div>
  );
}
