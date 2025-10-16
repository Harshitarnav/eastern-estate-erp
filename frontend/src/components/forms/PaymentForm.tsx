'use client';

import { useState, useEffect } from 'react';
import { Form, FormField } from './Form';
import { bookingsService } from '@/services/bookings.service';
import { customersService } from '@/services/customers.service';

interface PaymentFormProps {
  onSubmit: (data: any) => void;
  initialData?: any;
  onCancel?: () => void;
}

export default function PaymentForm({ onSubmit, initialData, onCancel }: PaymentFormProps) {
  const [bookings, setBookings] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('basic');
  const [paymentMode, setPaymentMode] = useState('');
  const [paymentType, setPaymentType] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [bookingsRes, customersRes] = await Promise.all([
        bookingsService.getBookings({ limit: 100, isActive: true }),
        customersService.getCustomers({ limit: 100, isActive: true }),
      ]);
      setBookings(bookingsRes.data);
      setCustomers(customersRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Tab 1: Basic Information
  const basicFields: FormField[] = [
    {
      name: 'paymentNumber',
      label: 'Payment Number *',
      type: 'text',
      required: true,
      placeholder: 'e.g., PAY-2025-001',
    },
    {
      name: 'receiptNumber',
      label: 'Receipt Number',
      type: 'text',
      required: false,
      placeholder: 'e.g., RCP-001',
    },
    {
      name: 'paymentDate',
      label: 'Payment Date *',
      type: 'date',
      required: true,
    },
    {
      name: 'bookingId',
      label: 'Booking *',
      type: 'select',
      required: true,
      options: bookings.map(b => ({ 
        value: b.id, 
        label: `${b.bookingNumber} - ${b.customer?.fullName || 'N/A'}` 
      })),
    },
    {
      name: 'customerId',
      label: 'Customer *',
      type: 'select',
      required: true,
      options: customers.map(c => ({ 
        value: c.id, 
        label: `${c.fullName} (${c.phoneNumber})` 
      })),
    },
    {
      name: 'paymentType',
      label: 'Payment Type *',
      type: 'select',
      required: true,
      options: [
        { value: 'TOKEN', label: 'Token' },
        { value: 'AGREEMENT', label: 'Agreement' },
        { value: 'INSTALLMENT', label: 'Installment' },
        { value: 'FINAL', label: 'Final Payment' },
        { value: 'ADVANCE', label: 'Advance' },
        { value: 'REFUND', label: 'Refund' },
        { value: 'OTHER', label: 'Other' },
      ],
    },
    {
      name: 'status',
      label: 'Payment Status *',
      type: 'select',
      required: true,
      options: [
        { value: 'PENDING', label: 'Pending' },
        { value: 'RECEIVED', label: 'Received' },
        { value: 'CLEARED', label: 'Cleared' },
        { value: 'BOUNCED', label: 'Bounced' },
        { value: 'CANCELLED', label: 'Cancelled' },
        { value: 'REFUNDED', label: 'Refunded' },
      ],
    },
  ];

  // Tab 2: Amount Details
  const amountFields: FormField[] = [
    {
      name: 'amount',
      label: 'Payment Amount (₹) *',
      type: 'number',
      required: true,
      placeholder: 'e.g., 500000',
    },
    {
      name: 'tdsPercentage',
      label: 'TDS Percentage (%)',
      type: 'number',
      required: false,
      placeholder: 'e.g., 1',
    },
    {
      name: 'tdsAmount',
      label: 'TDS Amount (₹)',
      type: 'number',
      required: false,
      placeholder: 'e.g., 5000',
    },
    {
      name: 'gstPercentage',
      label: 'GST Percentage (%)',
      type: 'number',
      required: false,
      placeholder: 'e.g., 5',
    },
    {
      name: 'gstAmount',
      label: 'GST Amount (₹)',
      type: 'number',
      required: false,
      placeholder: 'e.g., 25000',
    },
    {
      name: 'netAmount',
      label: 'Net Amount (₹) *',
      type: 'number',
      required: true,
      placeholder: 'e.g., 470000',
    },
  ];

  // Tab 3: Payment Mode & Transaction Details
  const modeFields: FormField[] = [
    {
      name: 'paymentMode',
      label: 'Payment Mode *',
      type: 'select',
      required: true,
      options: [
        { value: 'CASH', label: 'Cash' },
        { value: 'CHEQUE', label: 'Cheque' },
        { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
        { value: 'UPI', label: 'UPI' },
        { value: 'CARD', label: 'Debit/Credit Card' },
        { value: 'RTGS', label: 'RTGS' },
        { value: 'NEFT', label: 'NEFT' },
        { value: 'IMPS', label: 'IMPS' },
        { value: 'DD', label: 'Demand Draft' },
        { value: 'ONLINE', label: 'Online Payment' },
      ],
    },
    {
      name: 'transactionId',
      label: 'Transaction ID / Reference Number',
      type: 'text',
      required: false,
      placeholder: 'e.g., TXN123456789',
    },
    {
      name: 'bankName',
      label: 'Bank Name',
      type: 'text',
      required: false,
      placeholder: 'e.g., HDFC Bank',
      disabled: paymentMode === 'CASH',
    },
    {
      name: 'branchName',
      label: 'Branch Name',
      type: 'text',
      required: false,
      placeholder: 'e.g., Mumbai Main Branch',
      disabled: paymentMode === 'CASH',
    },
    {
      name: 'chequeNumber',
      label: 'Cheque Number',
      type: 'text',
      required: false,
      placeholder: 'e.g., 123456',
      disabled: paymentMode !== 'CHEQUE' && paymentMode !== 'DD',
    },
    {
      name: 'chequeDate',
      label: 'Cheque Date',
      type: 'date',
      required: false,
      disabled: paymentMode !== 'CHEQUE' && paymentMode !== 'DD',
    },
    {
      name: 'clearanceDate',
      label: 'Clearance Date',
      type: 'date',
      required: false,
      disabled: paymentMode === 'CASH' || paymentMode === 'UPI',
    },
    {
      name: 'upiId',
      label: 'UPI ID',
      type: 'text',
      required: false,
      placeholder: 'e.g., customer@upi',
      disabled: paymentMode !== 'UPI',
    },
    {
      name: 'onlinePaymentId',
      label: 'Online Payment ID',
      type: 'text',
      required: false,
      placeholder: 'e.g., pay_ABC123XYZ',
      disabled: paymentMode !== 'ONLINE',
    },
  ];

  // Tab 4: Installment Details
  const installmentFields: FormField[] = [
    {
      name: 'installmentNumber',
      label: 'Installment Number',
      type: 'number',
      required: false,
      placeholder: 'e.g., 1, 2, 3...',
      disabled: paymentType !== 'INSTALLMENT',
    },
    {
      name: 'dueDate',
      label: 'Due Date',
      type: 'date',
      required: false,
      disabled: paymentType !== 'INSTALLMENT',
    },
    {
      name: 'lateFee',
      label: 'Late Fee (₹)',
      type: 'number',
      required: false,
      placeholder: 'e.g., 5000',
      disabled: paymentType !== 'INSTALLMENT',
    },
  ];

  // Tab 5: Receipt & Verification
  const receiptFields: FormField[] = [
    {
      name: 'receiptGenerated',
      label: 'Receipt Generated?',
      type: 'select',
      required: false,
      options: [
        { value: 'false', label: 'No' },
        { value: 'true', label: 'Yes' },
      ],
    },
    {
      name: 'receiptDate',
      label: 'Receipt Date',
      type: 'date',
      required: false,
    },
    {
      name: 'isVerified',
      label: 'Payment Verified?',
      type: 'select',
      required: false,
      options: [
        { value: 'false', label: 'Not Verified' },
        { value: 'true', label: 'Verified' },
      ],
    },
  ];

  // Tab 6: Bounced/Cancellation Details
  const issueFields: FormField[] = [
    {
      name: 'bouncedDate',
      label: 'Bounced Date',
      type: 'date',
      required: false,
    },
    {
      name: 'bounceReason',
      label: 'Bounce Reason',
      type: 'textarea',
      required: false,
      placeholder: 'Reason why payment bounced...',
    },
    {
      name: 'cancellationDate',
      label: 'Cancellation Date',
      type: 'date',
      required: false,
    },
    {
      name: 'cancellationReason',
      label: 'Cancellation Reason',
      type: 'textarea',
      required: false,
      placeholder: 'Reason for cancellation...',
    },
  ];

  // Tab 7: Refund Details
  const refundFields: FormField[] = [
    {
      name: 'isRefund',
      label: 'Is This a Refund?',
      type: 'select',
      required: false,
      options: [
        { value: 'false', label: 'No' },
        { value: 'true', label: 'Yes' },
      ],
    },
    {
      name: 'refundDate',
      label: 'Refund Date',
      type: 'date',
      required: false,
    },
  ];

  // Tab 8: Notes
  const notesFields: FormField[] = [
    {
      name: 'notes',
      label: 'Public Notes',
      type: 'textarea',
      required: false,
      placeholder: 'Notes visible to customer...',
    },
    {
      name: 'internalNotes',
      label: 'Internal Notes',
      type: 'textarea',
      required: false,
      placeholder: 'Internal notes (not visible to customer)...',
    },
  ];

  const tabs = [
    { id: 'basic', label: 'Basic Info', fields: basicFields },
    { id: 'amount', label: 'Amount', fields: amountFields },
    { id: 'mode', label: 'Payment Mode', fields: modeFields },
    { id: 'installment', label: 'Installment', fields: installmentFields },
    { id: 'receipt', label: 'Receipt', fields: receiptFields },
    { id: 'issues', label: 'Issues', fields: issueFields },
    { id: 'refund', label: 'Refund', fields: refundFields },
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
        submitLabel={initialData ? 'Update Payment' : 'Record Payment'}
        onCancel={onCancel}
      />
    </div>
  );
}
