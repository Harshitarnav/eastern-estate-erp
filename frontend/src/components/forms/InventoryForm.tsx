'use client';

import { Form, FormField } from './Form';

interface InventoryFormProps {
  onSubmit: (data: any) => void;
  initialData?: any;
  onCancel?: () => void;
}

export function InventoryForm({ onSubmit, initialData, onCancel }: InventoryFormProps) {
  const fields: FormField[] = [
    {
      name: 'itemCode',
      label: 'Item Code',
      type: 'text',
      required: true,
      placeholder: 'e.g., ITEM-001',
    },
    {
      name: 'itemName',
      label: 'Item Name',
      type: 'text',
      required: true,
      placeholder: 'e.g., Cement Bags',
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
      required: false,
      placeholder: 'Detailed description of the item...',
    },
    {
      name: 'category',
      label: 'Category',
      type: 'select',
      required: true,
      options: [
        { value: 'RAW_MATERIAL', label: 'Raw Material' },
        { value: 'FINISHED_GOODS', label: 'Finished Goods' },
        { value: 'TOOLS', label: 'Tools & Equipment' },
        { value: 'CONSUMABLES', label: 'Consumables' },
        { value: 'SPARE_PARTS', label: 'Spare Parts' },
        { value: 'OFFICE_SUPPLIES', label: 'Office Supplies' },
        { value: 'OTHER', label: 'Other' },
      ],
    },
    {
      name: 'unit',
      label: 'Unit of Measurement',
      type: 'select',
      required: true,
      options: [
        { value: 'PCS', label: 'Pieces (PCS)' },
        { value: 'KG', label: 'Kilograms (KG)' },
        { value: 'LITER', label: 'Liters (L)' },
        { value: 'METER', label: 'Meters (M)' },
        { value: 'BOX', label: 'Box' },
        { value: 'BAG', label: 'Bag' },
        { value: 'CARTON', label: 'Carton' },
        { value: 'SET', label: 'Set' },
        { value: 'SQFT', label: 'Square Feet' },
        { value: 'SQMT', label: 'Square Meter' },
      ],
    },
    {
      name: 'currentStock',
      label: 'Current Stock',
      type: 'number',
      required: true,
      placeholder: 'e.g., 100',
    },
    {
      name: 'minStockLevel',
      label: 'Minimum Stock Level',
      type: 'number',
      required: true,
      placeholder: 'e.g., 20',
    },
    {
      name: 'maxStockLevel',
      label: 'Maximum Stock Level',
      type: 'number',
      required: false,
      placeholder: 'e.g., 500',
    },
    {
      name: 'reorderPoint',
      label: 'Reorder Point',
      type: 'number',
      required: true,
      placeholder: 'e.g., 30',
    },
    {
      name: 'unitCost',
      label: 'Unit Cost (₹)',
      type: 'number',
      required: true,
      placeholder: 'e.g., 500',
    },
    {
      name: 'sellingPrice',
      label: 'Selling Price (₹)',
      type: 'number',
      required: false,
      placeholder: 'e.g., 750',
    },
    {
      name: 'supplierName',
      label: 'Supplier Name',
      type: 'text',
      required: false,
      placeholder: 'e.g., ABC Suppliers',
    },
    {
      name: 'supplierContact',
      label: 'Supplier Contact',
      type: 'text',
      required: false,
      placeholder: 'e.g., +91 9876543210',
    },
    {
      name: 'location',
      label: 'Storage Location',
      type: 'text',
      required: false,
      placeholder: 'e.g., Warehouse A, Shelf 3',
    },
    {
      name: 'hsn',
      label: 'HSN Code',
      type: 'text',
      required: false,
      placeholder: 'e.g., 2523',
    },
    {
      name: 'gstPercent',
      label: 'GST Percentage',
      type: 'number',
      required: false,
      placeholder: 'e.g., 18',
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
    <Form
      fields={fields}
      onSubmit={onSubmit}
      initialData={initialData}
      submitLabel={initialData ? 'Update Item' : 'Add Item'}
      onCancel={onCancel}
    />
  );
}
