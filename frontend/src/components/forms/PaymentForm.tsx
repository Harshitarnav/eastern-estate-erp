'use client';

import { useState, useEffect } from 'react';
import { Form, FormField } from './Form';
import { bookingsService } from '@/services/bookings.service';
import { customersService } from '@/services/customers.service';
import { toast } from 'sonner';
import CategoryLineItemEditor, { LineItem } from './CategoryLineItemEditor';

interface PaymentFormProps {
  onSubmit: (data: any) => void;
  initialData?: any;
  onCancel?: () => void;
}

const numeric = (v: any): number => {
  const n = parseFloat(String(v ?? '').replace(/[, ]/g, ''));
  return Number.isFinite(n) ? n : 0;
};

const round2 = (n: number): number => Math.round(n * 100) / 100;

export default function PaymentForm({ onSubmit, initialData, onCancel }: PaymentFormProps) {
  const [bookings, setBookings] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('basic');
  const [paymentMode, setPaymentMode] = useState('');

  // Tagged line-items for the Misc / Tax buckets.
  const [miscItems, setMiscItems] = useState<LineItem[]>(initialData?.miscBreakdown ?? []);
  const [taxItems, setTaxItems]   = useState<LineItem[]>(initialData?.taxBreakdown ?? []);
  // When true, tax is deferred to registry → tax bucket is locked to ₹0.
  const [deferTax, setDeferTax] = useState<boolean>(
    initialData?.taxDeferralDisposition === 'DEFER_TO_REGISTRY',
  );

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [bookingsRes, customerRows] = await Promise.all([
        bookingsService.getBookings({ limit: 100, isActive: true }),
        customersService.getCustomersForSelect({ isActive: true }),
      ]);
      setBookings(bookingsRes.data);
      setCustomers(customerRows);
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
        { value: 'REGISTRY', label: 'Registry (Tax Settlement)' },
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
  //
  // GST / TDS auto-calculation:
  //   gstAmount = round(amount × gstPercentage / 100, 2)
  //   tdsAmount = round(amount × tdsPercentage / 100, 2)
  //   netAmount = amount + gstAmount − tdsAmount
  //
  // Driven by the shared Form's `dependsOn` / `compute` hooks — typing the
  // percentage now updates the amount in the same render (accounting team
  // ask: "if we put gst or tds percentage the amount should be calculated
  // automatically").
  const amountFields: FormField[] = [
    {
      name: 'amount',
      label: 'Payment Amount (₹) *',
      type: 'number',
      required: true,
      placeholder: 'e.g., 500000',
      helperText: 'Gross amount before tax. GST / TDS below auto-fill from percentages.',
    },
    {
      name: 'tdsPercentage',
      label: 'TDS Percentage (%)',
      type: 'number',
      required: false,
      placeholder: 'e.g., 1',
      step: '0.01',
    },
    {
      name: 'tdsAmount',
      label: 'TDS Amount (₹)',
      type: 'number',
      required: false,
      placeholder: 'auto from %',
      dependsOn: ['amount', 'tdsPercentage'],
      compute: (v) => round2(numeric(v.amount) * numeric(v.tdsPercentage) / 100),
      helperText: 'Informational calculator only (not saved). The amount actually recorded is the category split below.',
    },
    {
      name: 'gstPercentage',
      label: 'GST Percentage (%)',
      type: 'number',
      required: false,
      placeholder: 'e.g., 5',
      step: '0.01',
    },
    {
      name: 'gstAmount',
      label: 'GST Amount (₹)',
      type: 'number',
      required: false,
      placeholder: 'auto from %',
      dependsOn: ['amount', 'gstPercentage'],
      compute: (v) => round2(numeric(v.amount) * numeric(v.gstPercentage) / 100),
      helperText: 'Informational calculator only (not saved). Record GST as a Tax line-item below.',
    },
    {
      name: 'netAmount',
      label: 'Net Amount (₹)',
      type: 'number',
      required: false,
      placeholder: 'auto = amount + gst − tds',
      dependsOn: ['amount', 'gstAmount', 'tdsAmount'],
      compute: (v) =>
        round2(numeric(v.amount) + numeric(v.gstAmount) - numeric(v.tdsAmount)),
      helperText: 'Informational only (not saved) — Payment Amount + GST − TDS.',
    },
    // ── Category split (this is what is actually saved) ──────────────────
    // Primary is a plain number; Misc & Tax are tagged line-item editors
    // rendered below the form (see the Amount tab block in the JSX).
    {
      name: '_categoryHeading',
      label: 'Payment Category Split — what is actually recorded',
      type: 'heading',
      required: false,
      helperText: 'Primary + Misc + Tax must equal the Payment Amount above.',
    },
    {
      name: 'primaryAmount',
      label: 'Primary / Construction (₹)',
      type: 'number',
      required: false,
      placeholder: 'e.g., 500000',
      helperText: 'Base / construction cost portion of this payment.',
    },
  ];

  // Tab 3: Payment Mode & Transaction Details
  const modeFields: FormField[] = [
    {
      name: 'paymentMode',
      label: 'Payment Mode *',
      type: 'select',
      required: true,
      onChange: (v: string) => setPaymentMode(v),  // ← keeps cheque/UPI/bank fields unlocked
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
  // All fields here are optional - no need to lock them behind payment type selection.
  // Users who are recording an installment payment will simply fill these in; others leave them blank.
  const installmentFields: FormField[] = [
    {
      name: 'installmentNumber',
      label: 'Installment Number',
      type: 'number',
      required: false,
      placeholder: 'e.g., 1, 2, 3...',
    },
    {
      name: 'dueDate',
      label: 'Due Date',
      type: 'date',
      required: false,
    },
    {
      name: 'lateFee',
      label: 'Late Fee (₹)',
      type: 'number',
      required: false,
      placeholder: 'e.g., 5000',
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

      {/* Misc / Tax tagged line-item editors — shown on the Amount tab */}
      {activeTab === 'amount' && (
        <div className="space-y-3">
          <CategoryLineItemEditor
            title="Miscellaneous"
            hint="Parking, lift, amenities, maintenance deposit, PLC, club membership…"
            items={miscItems}
            onChange={setMiscItems}
            suggestions={['Covered parking', 'Club membership', 'Maintenance deposit', 'Floor-rise PLC']}
          />
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <label className="flex items-center gap-2 text-sm text-gray-700 mb-3 cursor-pointer">
              <input
                type="checkbox"
                checked={deferTax}
                onChange={(e) => { setDeferTax(e.target.checked); if (e.target.checked) setTaxItems([]); }}
                className="h-4 w-4 accent-[var(--eastern-red)]"
              />
              Defer tax to registry (customer pays GST/stamp duty at registration)
            </label>
            <CategoryLineItemEditor
              title="Tax"
              hint="GST, stamp duty, registration charges…"
              items={taxItems}
              onChange={setTaxItems}
              disabled={deferTax}
              disabledNote="Tax deferred to registry — this payment records ₹0 tax. The outstanding tax stays tracked and will be collected as a Registry payment."
              suggestions={['GST on construction', 'Stamp duty', 'Registration charges']}
            />
          </div>
        </div>
      )}

      {/* Form */}
      <Form
        fields={currentFields}
        onSubmit={(data) => {
          const primary = numeric(data.primaryAmount);
          const misc    = miscItems.reduce((s, i) => s + numeric(i.amount), 0);
          const tax     = deferTax ? 0 : taxItems.reduce((s, i) => s + numeric(i.amount), 0);
          const total   = numeric(data.amount);
          const catSum  = primary + misc + tax;

          // Require a complete split (we now always have the editors visible).
          if (Math.abs(catSum - total) > 0.01) {
            toast.error(
              `Category split must equal the total amount. ` +
              `Primary ₹${primary.toLocaleString('en-IN')} + Misc ₹${misc.toLocaleString('en-IN')} + Tax ₹${tax.toLocaleString('en-IN')} ` +
              `= ₹${catSum.toLocaleString('en-IN')}, but Amount = ₹${total.toLocaleString('en-IN')}.`,
              { duration: 6000 }
            );
            return; // block submission
          }

          // Reject blank labels on filled line-items.
          const blankLabel = [...miscItems, ...(deferTax ? [] : taxItems)]
            .some((i) => numeric(i.amount) > 0 && !i.label.trim());
          if (blankLabel) {
            toast.error('Every line-item with an amount needs a label describing what it is.');
            return;
          }

          onSubmit({
            ...data,
            primaryAmount: primary,
            miscAmount: misc,
            taxAmount: tax,
            miscBreakdown: miscItems.filter((i) => numeric(i.amount) > 0),
            taxBreakdown: deferTax ? [] : taxItems.filter((i) => numeric(i.amount) > 0),
            taxDeferralDisposition: deferTax ? 'DEFER_TO_REGISTRY' : (data.taxDeferralDisposition || ''),
          });
        }}
        submitLabel={initialData ? 'Update Payment' : 'Record Payment'}
        onCancel={onCancel}
      />
    </div>
  );
}
