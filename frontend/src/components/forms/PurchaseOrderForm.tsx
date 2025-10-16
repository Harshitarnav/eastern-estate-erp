'use client';

import { useState, useEffect } from 'react';
import { Form, FormField } from './Form';

interface PurchaseOrderFormProps {
  onSubmit: (data: any) => void;
  initialData?: any;
  onCancel?: () => void;
}

export default function PurchaseOrderForm({ onSubmit, initialData, onCancel }: PurchaseOrderFormProps) {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  // Tab 1: Basic Information
  const basicFields: FormField[] = [
    {
      name: 'orderNumber',
      label: 'PO Number *',
      type: 'text',
      required: true,
      placeholder: 'e.g., PO-2025-001',
    },
    {
      name: 'orderDate',
      label: 'Order Date *',
      type: 'date',
      required: true,
    },
    {
      name: 'orderStatus',
      label: 'Order Status *',
      type: 'select',
      required: true,
      options: [
        { value: 'DRAFT', label: 'Draft' },
        { value: 'PENDING_APPROVAL', label: 'Pending Approval' },
        { value: 'APPROVED', label: 'Approved' },
        { value: 'REJECTED', label: 'Rejected' },
        { value: 'ORDERED', label: 'Ordered' },
        { value: 'PARTIALLY_RECEIVED', label: 'Partially Received' },
        { value: 'RECEIVED', label: 'Received' },
        { value: 'CANCELLED', label: 'Cancelled' },
      ],
    },
    {
      name: 'projectReference',
      label: 'Project/Site Reference',
      type: 'text',
      required: false,
      placeholder: 'e.g., Project-001',
    },
  ];

  // Tab 2: Supplier Information
  const supplierFields: FormField[] = [
    {
      name: 'supplierName',
      label: 'Supplier Name *',
      type: 'text',
      required: true,
      placeholder: 'e.g., ABC Construction Suppliers',
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
      placeholder: 'Complete supplier address...',
    },
    {
      name: 'supplierGSTIN',
      label: 'Supplier GSTIN',
      type: 'text',
      required: false,
      placeholder: 'e.g., 22AAAAA0000A1Z5',
    },
  ];

  // Tab 3: Pricing & Totals
  const pricingFields: FormField[] = [
    {
      name: 'subtotal',
      label: 'Subtotal (₹) *',
      type: 'number',
      required: true,
      placeholder: 'e.g., 100000',
    },
    {
      name: 'discountPercent',
      label: 'Discount (%)',
      type: 'number',
      required: false,
      placeholder: 'e.g., 5',
    },
    {
      name: 'discountAmount',
      label: 'Discount Amount (₹)',
      type: 'number',
      required: false,
      placeholder: 'e.g., 5000',
    },
    {
      name: 'taxAmount',
      label: 'Tax Amount (₹)',
      type: 'number',
      required: false,
      placeholder: 'e.g., 18000',
    },
    {
      name: 'shippingCost',
      label: 'Shipping Cost (₹)',
      type: 'number',
      required: false,
      placeholder: 'e.g., 2000',
    },
    {
      name: 'otherCharges',
      label: 'Other Charges (₹)',
      type: 'number',
      required: false,
      placeholder: 'e.g., 1000',
    },
    {
      name: 'totalAmount',
      label: 'Total Amount (₹) *',
      type: 'number',
      required: true,
      placeholder: 'e.g., 116000',
    },
  ];

  // Tab 4: Payment Information
  const paymentFields: FormField[] = [
    {
      name: 'paymentStatus',
      label: 'Payment Status *',
      type: 'select',
      required: true,
      options: [
        { value: 'UNPAID', label: 'Unpaid' },
        { value: 'PARTIALLY_PAID', label: 'Partially Paid' },
        { value: 'PAID', label: 'Paid' },
        { value: 'OVERDUE', label: 'Overdue' },
      ],
    },
    {
      name: 'paymentTerms',
      label: 'Payment Terms *',
      type: 'select',
      required: true,
      options: [
        { value: 'IMMEDIATE', label: 'Immediate' },
        { value: 'NET_7', label: 'Net 7 Days' },
        { value: 'NET_15', label: 'Net 15 Days' },
        { value: 'NET_30', label: 'Net 30 Days' },
        { value: 'NET_60', label: 'Net 60 Days' },
        { value: 'NET_90', label: 'Net 90 Days' },
        { value: 'ADVANCE_50', label: '50% Advance' },
        { value: 'ADVANCE_100', label: '100% Advance' },
      ],
    },
    {
      name: 'paymentDueDate',
      label: 'Payment Due Date',
      type: 'date',
      required: false,
    },
    {
      name: 'paidAmount',
      label: 'Paid Amount (₹)',
      type: 'number',
      required: false,
      placeholder: 'e.g., 50000',
    },
    {
      name: 'balanceAmount',
      label: 'Balance Amount (₹)',
      type: 'number',
      required: false,
      placeholder: 'e.g., 66000',
    },
  ];

  // Tab 5: Delivery Information
  const deliveryFields: FormField[] = [
    {
      name: 'expectedDeliveryDate',
      label: 'Expected Delivery Date',
      type: 'date',
      required: false,
    },
    {
      name: 'actualDeliveryDate',
      label: 'Actual Delivery Date',
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
      name: 'deliveryContact',
      label: 'Delivery Contact Person',
      type: 'text',
      required: false,
      placeholder: 'e.g., John Doe',
    },
    {
      name: 'deliveryPhone',
      label: 'Delivery Contact Phone',
      type: 'tel',
      required: false,
      placeholder: 'e.g., 9876543210',
    },
    {
      name: 'trackingNumber',
      label: 'Tracking Number',
      type: 'text',
      required: false,
      placeholder: 'e.g., TRK123456789',
    },
    {
      name: 'courierService',
      label: 'Courier Service',
      type: 'text',
      required: false,
      placeholder: 'e.g., Blue Dart, DHL',
    },
  ];

  // Tab 6: Invoice & Documents
  const invoiceFields: FormField[] = [
    {
      name: 'invoiceNumber',
      label: 'Invoice Number',
      type: 'text',
      required: false,
      placeholder: 'e.g., INV-2025-001',
    },
    {
      name: 'invoiceDate',
      label: 'Invoice Date',
      type: 'date',
      required: false,
    },
  ];

  // Tab 7: Approval Workflow
  const approvalFields: FormField[] = [
    {
      name: 'requestedByName',
      label: 'Requested By',
      type: 'text',
      required: false,
      placeholder: 'Name of person requesting',
    },
    {
      name: 'approvedByName',
      label: 'Approved By',
      type: 'text',
      required: false,
      placeholder: 'Name of approver',
    },
    {
      name: 'rejectedByName',
      label: 'Rejected By',
      type: 'text',
      required: false,
      placeholder: 'Name of person who rejected',
    },
    {
      name: 'rejectionReason',
      label: 'Rejection Reason',
      type: 'textarea',
      required: false,
      placeholder: 'Reason for rejection...',
    },
  ];

  // Tab 8: Receiving Status
  const receivingFields: FormField[] = [
    {
      name: 'totalItemsOrdered',
      label: 'Total Items Ordered',
      type: 'number',
      required: false,
      placeholder: 'e.g., 100',
    },
    {
      name: 'totalItemsReceived',
      label: 'Total Items Received',
      type: 'number',
      required: false,
      placeholder: 'e.g., 95',
    },
  ];

  // Tab 9: Notes & Terms
  const notesFields: FormField[] = [
    {
      name: 'notes',
      label: 'Internal Notes',
      type: 'textarea',
      required: false,
      placeholder: 'Internal notes about this purchase order...',
    },
    {
      name: 'termsAndConditions',
      label: 'Terms & Conditions',
      type: 'textarea',
      required: false,
      placeholder: 'Terms and conditions for this order...',
    },
  ];

  const tabs = [
    { id: 'basic', label: 'Basic Info', fields: basicFields },
    { id: 'supplier', label: 'Supplier', fields: supplierFields },
    { id: 'pricing', label: 'Pricing', fields: pricingFields },
    { id: 'payment', label: 'Payment', fields: paymentFields },
    { id: 'delivery', label: 'Delivery', fields: deliveryFields },
    { id: 'invoice', label: 'Invoice', fields: invoiceFields },
    { id: 'approval', label: 'Approval', fields: approvalFields },
    { id: 'receiving', label: 'Receiving', fields: receivingFields },
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
        submitLabel={initialData ? 'Update Order' : 'Create Order'}
        onCancel={onCancel}
      />
    </div>
  );
}
