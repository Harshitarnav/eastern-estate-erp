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

export function PaymentForm({ onSubmit, initialData, onCancel }: PaymentFormProps) {
  const [bookings, setBookings] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  const fields: FormField[] = [
    {
      name: 'paymentNumber',
      label: 'Payment Number',
      type: 'text',
      required: true,
      placeholder: 'e.g., PAY-2025-001',
    },
    {
      name: 'paymentDate',
      label: 'Payment Date',
      type: 'date',
      required: true,
    },
    {
      name: 'bookingId',
      label: 'Booking',
      type: 'select',
      required: true,
      options: bookings.map(b => ({ 
        value: b.id, 
        label: `${b.bookingNumber} - ${b.customerName || 'Customer'} (Balance: ₹${((b.totalAmount || 0) - (b.paidAmount || 0)).toLocaleString()})` 
      })),
    },
    {
      name: 'customerId',
      label: 'Customer',
      type: 'select',
      required: true,
      options: customers.map(c => ({ value: c.id, label: `${c.fullName} (${c.phoneNumber})` })),
    },
    {
      name: 'amount',
      label: 'Payment Amount (₹)',
      type: 'number',
      required: true,
      placeholder: 'e.g., 100000',
    },
    {
      name: 'paymentType',
      label: 'Payment Type',
      type: 'select',
      required: true,
      options: [
        { value: 'BOOKING_AMOUNT', label: 'Booking Amount' },
        { value: 'INSTALLMENT', label: 'Installment' },
        { value: 'DOWN_PAYMENT', label: 'Down Payment' },
        { value: 'FINAL_PAYMENT', label: 'Final Payment' },
        { value: 'REGISTRATION_FEE', label: 'Registration Fee' },
        { value: 'STAMP_DUTY', label: 'Stamp Duty' },
        { value: 'OTHER', label: 'Other' },
      ],
    },
    {
      name: 'paymentMode',
      label: 'Payment Mode',
      type: 'select',
      required: true,
      options: [
        { value: 'CASH', label: 'Cash' },
        { value: 'CHEQUE', label: 'Cheque' },
        { value: 'DD', label: 'Demand Draft' },
        { value: 'NEFT', label: 'NEFT' },
        { value: 'RTGS', label: 'RTGS' },
        { value: 'IMPS', label: 'IMPS' },
        { value: 'UPI', label: 'UPI' },
        { value: 'CARD', label: 'Card' },
        { value: 'ONLINE', label: 'Online Banking' },
      ],
    },
    {
      name: 'transactionNumber',
      label: 'Transaction Number',
      type: 'text',
      required: false,
      placeholder: 'e.g., UTR/Cheque/Transaction Number',
    },
    {
      name: 'bankName',
      label: 'Bank Name',
      type: 'text',
      required: false,
      placeholder: 'e.g., HDFC Bank',
    },
    {
      name: 'chequeNumber',
      label: 'Cheque Number',
      type: 'text',
      required: false,
      placeholder: 'For cheque payments',
    },
    {
      name: 'chequeDate',
      label: 'Cheque Date',
      type: 'date',
      required: false,
    },
    {
      name: 'tdsAmount',
      label: 'TDS Amount (₹)',
      type: 'number',
      required: false,
      placeholder: 'e.g., 10000',
    },
    {
      name: 'tdsPercent',
      label: 'TDS Percentage',
      type: 'number',
      required: false,
      placeholder: 'e.g., 1',
    },
    {
      name: 'gstAmount',
      label: 'GST Amount (₹)',
      type: 'number',
      required: false,
      placeholder: 'e.g., 18000',
    },
    {
      name: 'gstPercent',
      label: 'GST Percentage',
      type: 'number',
      required: false,
      placeholder: 'e.g., 18',
    },
    {
      name: 'receiptNumber',
      label: 'Receipt Number',
      type: 'text',
      required: false,
      placeholder: 'e.g., RCP-2025-001',
    },
    {
      name: 'notes',
      label: 'Notes',
      type: 'textarea',
      required: false,
      placeholder: 'Any additional notes...',
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: '#A8211B' }}></div>
      </div>
    );
  }

  return (
    <Form
      fields={fields}
      onSubmit={onSubmit}
      initialData={initialData}
      submitLabel={initialData ? 'Update Payment' : 'Record Payment'}
      onCancel={onCancel}
    />
  );
}
export default PaymentForm;
