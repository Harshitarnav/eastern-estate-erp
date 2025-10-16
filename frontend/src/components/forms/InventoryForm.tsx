'use client';

import { useState, useEffect } from 'react';
import { Form, FormField } from './Form';
import { propertiesService } from '@/services/properties.service';

interface InventoryFormProps {
  onSubmit: (data: any) => void;
  initialData?: any;
  onCancel?: () => void;
}

export default function InventoryForm({ onSubmit, initialData, onCancel }: InventoryFormProps) {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('basic');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const propsRes = await propertiesService.getProperties({ limit: 100, isActive: true });
      setProperties(propsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Tab 1: Basic Information
  const basicFields: FormField[] = [
    {
      name: 'itemCode',
      label: 'Item Code *',
      type: 'text',
      required: true,
      placeholder: 'e.g., ITM-001',
    },
    {
      name: 'itemName',
      label: 'Item Name *',
      type: 'text',
      required: true,
      placeholder: 'e.g., Portland Cement',
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
      label: 'Category *',
      type: 'select',
      required: true,
      options: [
        { value: 'CONSTRUCTION_MATERIAL', label: 'Construction Material' },
        { value: 'ELECTRICAL', label: 'Electrical' },
        { value: 'PLUMBING', label: 'Plumbing' },
        { value: 'HARDWARE', label: 'Hardware' },
        { value: 'PAINT', label: 'Paint' },
        { value: 'TILES', label: 'Tiles' },
        { value: 'FIXTURES', label: 'Fixtures' },
        { value: 'TOOLS', label: 'Tools' },
        { value: 'SAFETY_EQUIPMENT', label: 'Safety Equipment' },
        { value: 'OTHER', label: 'Other' },
      ],
    },
    {
      name: 'brand',
      label: 'Brand',
      type: 'text',
      required: false,
      placeholder: 'e.g., ACC, Ultratech',
    },
    {
      name: 'model',
      label: 'Model / Grade',
      type: 'text',
      required: false,
      placeholder: 'e.g., OPC-43, PPC-53',
    },
  ];

  // Tab 2: Stock Information
  const stockFields: FormField[] = [
    {
      name: 'quantity',
      label: 'Current Quantity *',
      type: 'number',
      required: true,
      placeholder: 'e.g., 100',
    },
    {
      name: 'unit',
      label: 'Unit of Measurement *',
      type: 'select',
      required: true,
      options: [
        { value: 'KG', label: 'Kilogram (KG)' },
        { value: 'LITRE', label: 'Litre' },
        { value: 'METER', label: 'Meter' },
        { value: 'SQ_METER', label: 'Square Meter' },
        { value: 'PIECE', label: 'Piece' },
        { value: 'BOX', label: 'Box' },
        { value: 'BAG', label: 'Bag' },
        { value: 'ROLL', label: 'Roll' },
        { value: 'SET', label: 'Set' },
        { value: 'UNIT', label: 'Unit' },
      ],
    },
    {
      name: 'minimumStock',
      label: 'Minimum Stock Level',
      type: 'number',
      required: false,
      placeholder: 'e.g., 20',
    },
    {
      name: 'maximumStock',
      label: 'Maximum Stock Level',
      type: 'number',
      required: false,
      placeholder: 'e.g., 500',
    },
    {
      name: 'reorderPoint',
      label: 'Reorder Point',
      type: 'number',
      required: false,
      placeholder: 'e.g., 50',
    },
    {
      name: 'stockStatus',
      label: 'Stock Status *',
      type: 'select',
      required: true,
      options: [
        { value: 'IN_STOCK', label: 'In Stock' },
        { value: 'LOW_STOCK', label: 'Low Stock' },
        { value: 'OUT_OF_STOCK', label: 'Out of Stock' },
        { value: 'ORDERED', label: 'Ordered' },
        { value: 'DISCONTINUED', label: 'Discontinued' },
      ],
    },
  ];

  // Tab 3: Pricing Information
  const pricingFields: FormField[] = [
    {
      name: 'unitPrice',
      label: 'Unit Price (₹) *',
      type: 'number',
      required: true,
      placeholder: 'e.g., 350',
    },
    {
      name: 'totalValue',
      label: 'Total Value (₹) *',
      type: 'number',
      required: true,
      placeholder: 'e.g., 35000',
    },
    {
      name: 'lastPurchasePrice',
      label: 'Last Purchase Price (₹)',
      type: 'number',
      required: false,
      placeholder: 'e.g., 340',
    },
    {
      name: 'lastPurchaseDate',
      label: 'Last Purchase Date',
      type: 'date',
      required: false,
    },
  ];

  // Tab 4: Supplier Information
  const supplierFields: FormField[] = [
    {
      name: 'supplierName',
      label: 'Supplier Name',
      type: 'text',
      required: false,
      placeholder: 'e.g., ABC Suppliers Pvt Ltd',
    },
    {
      name: 'supplierEmail',
      label: 'Supplier Email',
      type: 'email',
      required: false,
      placeholder: 'e.g., contact@abcsuppliers.com',
    },
    {
      name: 'supplierPhone',
      label: 'Supplier Phone',
      type: 'tel',
      required: false,
      placeholder: 'e.g., 9876543210',
    },
    {
      name: 'supplierAddress',
      label: 'Supplier Address',
      type: 'textarea',
      required: false,
      placeholder: 'Full supplier address...',
    },
  ];

  // Tab 5: Location & Storage
  const locationFields: FormField[] = [
    {
      name: 'propertyId',
      label: 'Assigned to Property',
      type: 'select',
      required: false,
      options: properties.map(p => ({ value: p.id, label: `${p.name} - ${p.location}` })),
    },
    {
      name: 'warehouseLocation',
      label: 'Warehouse Location',
      type: 'text',
      required: false,
      placeholder: 'e.g., Main Warehouse - Section A',
    },
    {
      name: 'rackNumber',
      label: 'Rack Number',
      type: 'text',
      required: false,
      placeholder: 'e.g., R-12',
    },
    {
      name: 'binNumber',
      label: 'Bin Number',
      type: 'text',
      required: false,
      placeholder: 'e.g., B-045',
    },
  ];

  // Tab 6: Quality & Specifications
  const qualityFields: FormField[] = [
    {
      name: 'specification',
      label: 'Specification',
      type: 'text',
      required: false,
      placeholder: 'e.g., IS 269:2015',
    },
    {
      name: 'grade',
      label: 'Grade',
      type: 'text',
      required: false,
      placeholder: 'e.g., Grade A, Premium',
    },
    {
      name: 'manufacturingDate',
      label: 'Manufacturing Date',
      type: 'date',
      required: false,
    },
    {
      name: 'expiryDate',
      label: 'Expiry Date',
      type: 'date',
      required: false,
    },
    {
      name: 'batchNumber',
      label: 'Batch Number',
      type: 'text',
      required: false,
      placeholder: 'e.g., BATCH-2025-001',
    },
    {
      name: 'serialNumber',
      label: 'Serial Number',
      type: 'text',
      required: false,
      placeholder: 'e.g., SN123456789',
    },
  ];

  // Tab 7: Usage Tracking
  const usageFields: FormField[] = [
    {
      name: 'totalIssued',
      label: 'Total Issued',
      type: 'number',
      required: false,
      placeholder: 'e.g., 50',
    },
    {
      name: 'totalReceived',
      label: 'Total Received',
      type: 'number',
      required: false,
      placeholder: 'e.g., 200',
    },
    {
      name: 'totalReturned',
      label: 'Total Returned',
      type: 'number',
      required: false,
      placeholder: 'e.g., 5',
    },
    {
      name: 'lastIssuedDate',
      label: 'Last Issued Date',
      type: 'date',
      required: false,
    },
    {
      name: 'lastReceivedDate',
      label: 'Last Received Date',
      type: 'date',
      required: false,
    },
  ];

  // Tab 8: Notes
  const notesFields: FormField[] = [
    {
      name: 'notes',
      label: 'Notes',
      type: 'textarea',
      required: false,
      placeholder: 'Any additional notes about this item...',
    },
  ];

  const tabs = [
    { id: 'basic', label: 'Basic Info', fields: basicFields },
    { id: 'stock', label: 'Stock', fields: stockFields },
    { id: 'pricing', label: 'Pricing', fields: pricingFields },
    { id: 'supplier', label: 'Supplier', fields: supplierFields },
    { id: 'location', label: 'Location', fields: locationFields },
    { id: 'quality', label: 'Quality', fields: qualityFields },
    { id: 'usage', label: 'Usage', fields: usageFields },
    { id: 'notes', label: 'Notes', fields: notesFields },
  ];

  const currentFields = tabs.find(t => t.id === activeTab)?.fields || [];

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: '#A8211B' }}></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-4 overflow-x-auto" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                whitespace-nowrap py-3 px-4 border-b-2 font-medium text-sm transition-colors
                ${activeTab === tab.id
                  ? 'border-[#A8211B] text-[#A8211B]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Form */}
      <Form
        fields={currentFields}
        onSubmit={onSubmit}
        submitLabel={initialData ? 'Update Item' : 'Add Item'}
        onCancel={onCancel}
      />
    </div>
  );
}
