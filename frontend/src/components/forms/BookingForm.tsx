'use client';

import { useState, useEffect, useMemo } from 'react';
import { Form, FormField } from './Form';
import { propertiesService, propertyListFromResponse } from '@/services/properties.service';
import { flatsService } from '@/services/flats.service';
import { customersService, Customer } from '@/services/customers.service';
import { usePropertyStore } from '@/store/propertyStore';
import { filterBookableFlats } from '@/lib/property-scope';
import {
  User,
  Phone,
  Mail,
  MapPin,
  IdCard,
  Briefcase,
  IndianRupee,
  ShieldCheck,
  Loader2,
} from 'lucide-react';

interface BookingFormProps {
  onSubmit: (data: any) => void;
  initialData?: any;
  onCancel?: () => void;
}

const fmtINR = (n: any) =>
  n && Number(n) > 0 ? '₹' + Number(n).toLocaleString('en-IN') : null;

/**
 * Build a partial set of booking fields from a Customer record so users don't
 * re-type info already saved on the Customer module.
 *
 * Only emits values for fields where we have actual data — caller merges with
 * what the user has already typed so we never clobber their input.
 */
function customerPrefill(c: Customer | null): Record<string, any> {
  if (!c) return {};
  const out: Record<string, any> = {};
  if (c.needsHomeLoan != null) out.isHomeLoan = c.needsHomeLoan ? 'true' : 'false';
  if (c.bankName) out.bankName = c.bankName;
  if (c.approvedLoanAmount) out.loanAmount = c.approvedLoanAmount;
  return out;
}

export default function BookingForm({ onSubmit, initialData, onCancel }: BookingFormProps) {
  const headerPropertyId = usePropertyStore((s) => s.selectedProperties[0] ?? '');
  const [properties, setProperties] = useState<any[]>([]);
  const [flats, setFlats] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedProperty, setSelectedProperty] = useState('');
  const [selectedFlatId, setSelectedFlatId] = useState<string>(initialData?.flatId ?? '');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('basic');
  const [isHomeLoan, setIsHomeLoan] = useState(false);

  // Customer auto-populate: track the picked customer + their full record so
  // we can show a "Customer Information" preview and prefill home-loan fields.
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(
    initialData?.customerId ?? '',
  );
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [loadingCustomer, setLoadingCustomer] = useState(false);

  // Snapshot of live form values; used so the prefill remount preserves
  // anything the user already typed.
  const [formSnapshot, setFormSnapshot] = useState<Record<string, any>>({});
  // Bumped whenever we change initialValues (customer/property selection) so
  // the inner Form remounts with merged values.
  const [formVersion, setFormVersion] = useState(0);

  // Align with global project filter + single-assigned preselect
  useEffect(() => {
    if (initialData?.propertyId) {
      setSelectedProperty(initialData.propertyId);
      return;
    }
    if (properties.length === 1) {
      setSelectedProperty(properties[0].id);
      return;
    }
    if (headerPropertyId && properties.some((p) => p.id === headerPropertyId)) {
      setSelectedProperty(headerPropertyId);
    }
  }, [initialData?.propertyId, properties, headerPropertyId]);

  useEffect(() => {
    fetchData(initialData);
  }, [initialData]);

  useEffect(() => {
    if (selectedProperty) {
      fetchFlats(selectedProperty);
    } else {
      setFlats([]);
    }
  }, [selectedProperty]);

  // Whenever the chosen customer changes, fetch the full record so the preview
  // panel + home-loan prefills are accurate (list endpoint may be trimmed).
  useEffect(() => {
    if (!selectedCustomerId) {
      setSelectedCustomer(null);
      return;
    }
    let cancelled = false;
    setLoadingCustomer(true);
    customersService
      .getCustomer(selectedCustomerId)
      .then((c) => {
        if (cancelled) return;
        setSelectedCustomer(c);
        // Sync the home-loan toggle that drives field disabled state.
        if (c?.needsHomeLoan != null) setIsHomeLoan(!!c.needsHomeLoan);
        // Remount Form so the prefilled home-loan / co-applicant fields pick up
        // the customer's values — merged with whatever the user already typed.
        setFormVersion((v) => v + 1);
      })
      .catch(() => {
        if (!cancelled) setSelectedCustomer(null);
      })
      .finally(() => {
        if (!cancelled) setLoadingCustomer(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedCustomerId]);

  // When a flat is picked, prefill the booking's financial fields from the
  // flat's pricing breakdown. base_price → Primary, parking_charges → Misc
  // sum, registration_charges → Tax sum. Only fills fields the user has not
  // already entered, so it never clobbers manual edits.
  useEffect(() => {
    if (!selectedFlatId || initialData?.flatId) return; // don't auto-fill in edit mode
    const flat = flats.find((f) => f.id === selectedFlatId);
    if (!flat) return;
    const n = (v: any) => (Number.isFinite(Number(v)) && Number(v) > 0 ? Number(v) : undefined);
    setFormSnapshot((prev) => {
      const next = { ...prev };
      const fill = (k: string, v?: number) => {
        if (v == null) return;
        const cur = next[k];
        if (cur === undefined || cur === '' || Number(cur) === 0) next[k] = v;
      };
      fill('totalAmount', n(flat.finalPrice ?? flat.totalPrice));
      fill('agreementAmount', n(flat.finalPrice ?? flat.totalPrice));
      fill('parkingCharges', n(flat.parkingCharges));
      fill('registrationCharges', n(flat.registrationCharges));
      fill('discountAmount', n(flat.discountAmount));
      return next;
    });
    setFormVersion((v) => v + 1);
  }, [selectedFlatId, flats, initialData?.flatId]);

  const fetchData = async (initial?: any) => {
    try {
      const [propsRes, customerRows] = await Promise.all([
        propertiesService.getProperties({ limit: 100 }),
        customersService.getCustomersForSelect({ isActive: true }),
      ]);
      setProperties(propertyListFromResponse(propsRes));
      setCustomers(customerRows);
      if (initial?.propertyId) {
        setSelectedProperty(initial.propertyId);
        setIsHomeLoan(!!initial.isHomeLoan);
        await fetchFlats(initial.propertyId);
      }
      // Edit mode: kick off customer fetch so the info card is populated.
      if (initial?.customerId) {
        setSelectedCustomerId(initial.customerId);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFlats = async (propertyId: string) => {
    try {
      const isEditing = !!initialData?.flatId;
      const query: Record<string, unknown> = {
        propertyId,
        limit: 500,
        sortBy: 'flatNumber',
        sortOrder: 'ASC',
        isActive: true,
      };
      if (isEditing) {
        // Editing: include every unit so the booked flat stays in the list
      } else {
        // New booking: load saleable inventory; do not require status=AVAILABLE only
        // (many rows default to UNDER_CONSTRUCTION but are still bookable).
      }
      const res = await flatsService.getFlats(query);
      const rows = res.data ?? [];
      setFlats(isEditing ? rows : filterBookableFlats(rows));
    } catch (error) {
      console.error('Error fetching flats:', error);
      setFlats([]);
    }
  };

  const mergedInitialValues = useMemo(
    () => ({
      // 1. backend record (edit mode)
      ...initialData,
      // 2. customer-derived defaults (only for empty/missing fields)
      ...customerPrefill(selectedCustomer),
      // 3. anything the user has already typed in the current session — wins
      //    over the prefill so we never clobber their edits.
      ...formSnapshot,
      // 4. always-controlled fields (top-bar driven property + picked customer)
      propertyId: selectedProperty || formSnapshot.propertyId || initialData?.propertyId || '',
      customerId: selectedCustomerId || formSnapshot.customerId || initialData?.customerId || '',
    }),
    [initialData, selectedProperty, selectedCustomerId, selectedCustomer, formSnapshot],
  );

  // Tab 1: Basic Information
  const basicFields: FormField[] = [
    {
      name: 'bookingNumber',
      label: 'Booking Number',
      type: 'text',
      required: true,
      placeholder: 'e.g., BK-2025-001',
    },
    {
      name: 'bookingDate',
      label: 'Booking Date',
      type: 'date',
      required: true,
    },
    {
      name: 'status',
      label: 'Booking Status',
      type: 'select',
      required: true,
      options: [
        { value: 'TOKEN_PAID', label: 'Token Paid' },
        { value: 'AGREEMENT_PENDING', label: 'Agreement Pending' },
        { value: 'AGREEMENT_SIGNED', label: 'Agreement Signed' },
        { value: 'CONFIRMED', label: 'Confirmed' },
        { value: 'CANCELLED', label: 'Cancelled' },
        { value: 'TRANSFERRED', label: 'Transferred' },
        { value: 'COMPLETED', label: 'Completed' },
      ],
    },
    {
      name: 'customerId',
      label: 'Customer',
      type: 'select',
      required: true,
      onChange: (value) => {
        setSelectedCustomerId(String(value || ''));
      },
      options: customers.map((c) => {
        const name =
          c.fullName || [c.firstName, c.lastName].filter(Boolean).join(' ') || 'Unnamed';
        const phone = c.phoneNumber || c.phone || '';
        return {
          value: c.id,
          label: phone ? `${name} (${phone})` : name,
        };
      }),
      helperText: customers.length
        ? `${customers.length} customer(s) — KYC and home-loan details load when you pick one.`
        : 'No active customers found. Create one under Customers first.',
    },
    {
      name: 'propertyId',
      label: 'Property',
      type: 'select',
      required: true,
      clearsFields: ['flatId'],
      options: properties.map(p => ({ value: p.id, label: `${p.name} - ${p.location}` })),
      onChange: (value) => {
        setSelectedProperty(String(value));
      },
    },
    {
      name: 'flatId',
      label: 'Flat/Unit',
      type: 'select',
      required: true,
      onChange: (value) => setSelectedFlatId(String(value || '')),
      options: flats.map(f => {
        const price = Number(f.finalPrice || f.totalPrice || f.salePrice || 0);
        const typology = f.type || f.bhkType || f.flatType || '';
        return {
          value: f.id,
          label: `${f.flatNumber} - ${typology} (${price ? `₹${price.toLocaleString('en-IN')}` : 'Price N/A'})`,
        };
      }),
      disabled: !selectedProperty,
      helperText:
        selectedProperty && flats.length === 0
          ? 'No bookable units for this project yet (inventory may be UNDER_CONSTRUCTION, BLOCKED, or all sold).'
          : undefined,
    },
  ];

  // Tab 2: Financial Details
  const financialFields: FormField[] = [
    {
      name: 'totalAmount',
      label: 'Total Amount (₹)',
      type: 'number',
      required: true,
      placeholder: 'e.g., 5000000',
    },
    {
      name: 'tokenAmount',
      label: 'Token Amount (₹)',
      type: 'number',
      required: true,
      placeholder: 'e.g., 100000',
    },
    {
      name: 'tokenPaidDate',
      label: 'Token Paid Date',
      type: 'date',
      required: false,
    },
    {
      name: 'tokenReceiptNumber',
      label: 'Token Receipt Number',
      type: 'text',
      required: false,
      placeholder: 'e.g., TKN-001',
    },
    {
      name: 'tokenPaymentMode',
      label: 'Token Payment Mode',
      type: 'select',
      required: false,
      options: [
        { value: 'CASH', label: 'Cash' },
        { value: 'CHEQUE', label: 'Cheque' },
        { value: 'NEFT', label: 'NEFT' },
        { value: 'RTGS', label: 'RTGS' },
        { value: 'UPI', label: 'UPI' },
        { value: 'CARD', label: 'Debit/Credit Card' },
      ],
    },
    {
      name: 'agreementAmount',
      label: 'Agreement Amount (₹)',
      type: 'number',
      required: true,
      placeholder: 'e.g., 1000000',
    },
    {
      name: 'discountAmount',
      label: 'Discount Amount (₹)',
      type: 'number',
      required: false,
      placeholder: 'e.g., 50000',
    },
    {
      name: 'discountReason',
      label: 'Discount Reason',
      type: 'text',
      required: false,
      placeholder: 'e.g., Early bird offer',
    },
  ];

  // Tab 3: Charges & Deposits
  const chargesFields: FormField[] = [
    {
      name: 'gstAmount',
      label: 'GST Amount (₹)',
      type: 'number',
      required: false,
      placeholder: 'e.g., 250000',
    },
    {
      name: 'stampDuty',
      label: 'Stamp Duty (₹)',
      type: 'number',
      required: false,
      placeholder: 'e.g., 300000',
    },
    {
      name: 'registrationCharges',
      label: 'Registration Charges (₹)',
      type: 'number',
      required: false,
      placeholder: 'e.g., 50000',
    },
    {
      name: 'maintenanceDeposit',
      label: 'Maintenance Deposit (₹)',
      type: 'number',
      required: false,
      placeholder: 'e.g., 100000',
    },
    {
      name: 'parkingCharges',
      label: 'Parking Charges (₹)',
      type: 'number',
      required: false,
      placeholder: 'e.g., 200000',
    },
    {
      name: 'otherCharges',
      label: 'Other Charges (₹)',
      type: 'number',
      required: false,
      placeholder: 'e.g., 50000',
    },
  ];

  // Tab 4: Agreement Details
  const agreementFields: FormField[] = [
    {
      name: 'agreementNumber',
      label: 'Agreement Number',
      type: 'text',
      required: false,
      placeholder: 'e.g., AGR-2025-001',
    },
    {
      name: 'agreementDate',
      label: 'Agreement Date',
      type: 'date',
      required: false,
    },
    {
      name: 'agreementSignedDate',
      label: 'Agreement Signed Date',
      type: 'date',
      required: false,
    },
    {
      name: 'expectedPossessionDate',
      label: 'Expected Possession Date',
      type: 'date',
      required: false,
    },
    {
      name: 'actualPossessionDate',
      label: 'Actual Possession Date',
      type: 'date',
      required: false,
    },
    {
      name: 'registrationDate',
      label: 'Registration Date',
      type: 'date',
      required: false,
    },
  ];

  // Tab 5: Home Loan Details
  const loanFields: FormField[] = [
    {
      name: 'isHomeLoan',
      label: 'Home Loan Required?',
      type: 'select',
      required: false,
      onChange: (v: string) => setIsHomeLoan(v === 'true'),  // ← unlocks loan fields below
      options: [
        { value: 'false', label: 'No' },
        { value: 'true', label: 'Yes' },
      ],
    },
    {
      name: 'bankName',
      label: 'Bank Name',
      type: 'text',
      required: false,
      placeholder: 'e.g., HDFC Bank',
      disabled: !isHomeLoan,
    },
    {
      name: 'loanAmount',
      label: 'Loan Amount (₹)',
      type: 'number',
      required: false,
      placeholder: 'e.g., 3500000',
      disabled: !isHomeLoan,
    },
    {
      name: 'loanApplicationNumber',
      label: 'Loan Application Number',
      type: 'text',
      required: false,
      placeholder: 'e.g., LA-12345',
      disabled: !isHomeLoan,
    },
    {
      name: 'loanApprovalDate',
      label: 'Loan Approval Date',
      type: 'date',
      required: false,
      disabled: !isHomeLoan,
    },
    {
      name: 'loanDisbursementDate',
      label: 'Loan Disbursement Date',
      type: 'date',
      required: false,
      disabled: !isHomeLoan,
    },
  ];

  // Tab 6: Nominees & Co-Applicants
  const nomineeFields: FormField[] = [
    {
      name: 'nominee1Name',
      label: 'Nominee 1 Name',
      type: 'text',
      required: false,
      placeholder: 'e.g., John Doe',
    },
    {
      name: 'nominee1Relation',
      label: 'Nominee 1 Relation',
      type: 'select',
      required: false,
      options: [
        { value: 'SPOUSE', label: 'Spouse' },
        { value: 'SON', label: 'Son' },
        { value: 'DAUGHTER', label: 'Daughter' },
        { value: 'FATHER', label: 'Father' },
        { value: 'MOTHER', label: 'Mother' },
        { value: 'BROTHER', label: 'Brother' },
        { value: 'SISTER', label: 'Sister' },
        { value: 'OTHER', label: 'Other' },
      ],
    },
    {
      name: 'nominee2Name',
      label: 'Nominee 2 Name',
      type: 'text',
      required: false,
      placeholder: 'e.g., Jane Doe',
    },
    {
      name: 'nominee2Relation',
      label: 'Nominee 2 Relation',
      type: 'select',
      required: false,
      options: [
        { value: 'SPOUSE', label: 'Spouse' },
        { value: 'SON', label: 'Son' },
        { value: 'DAUGHTER', label: 'Daughter' },
        { value: 'FATHER', label: 'Father' },
        { value: 'MOTHER', label: 'Mother' },
        { value: 'BROTHER', label: 'Brother' },
        { value: 'SISTER', label: 'Sister' },
        { value: 'OTHER', label: 'Other' },
      ],
    },
    {
      name: 'coApplicantName',
      label: 'Co-Applicant Name',
      type: 'text',
      required: false,
      placeholder: 'e.g., Jane Smith',
    },
    {
      name: 'coApplicantEmail',
      label: 'Co-Applicant Email',
      type: 'email',
      required: false,
      placeholder: 'e.g., jane@example.com',
    },
    {
      name: 'coApplicantPhone',
      label: 'Co-Applicant Phone',
      type: 'tel',
      required: false,
      placeholder: 'e.g., 9876543210',
    },
    {
      name: 'coApplicantRelation',
      label: 'Co-Applicant Relation',
      type: 'select',
      required: false,
      options: [
        { value: 'SPOUSE', label: 'Spouse' },
        { value: 'SON', label: 'Son' },
        { value: 'DAUGHTER', label: 'Daughter' },
        { value: 'FATHER', label: 'Father' },
        { value: 'MOTHER', label: 'Mother' },
        { value: 'BROTHER', label: 'Brother' },
        { value: 'SISTER', label: 'Sister' },
        { value: 'PARTNER', label: 'Business Partner' },
        { value: 'OTHER', label: 'Other' },
      ],
    },
  ];

  // Tab 7: Payment Reference Details
  const paymentRefFields: FormField[] = [
    {
      name: 'chequeNumber',
      label: 'Cheque Number',
      type: 'text',
      required: false,
      placeholder: 'e.g., 123456',
    },
    {
      name: 'chequeDate',
      label: 'Cheque Date',
      type: 'date',
      required: false,
    },
    {
      name: 'rtgsNumber',
      label: 'RTGS Reference Number',
      type: 'text',
      required: false,
      placeholder: 'e.g., RTGS123456',
    },
    {
      name: 'utrNumber',
      label: 'UTR Number',
      type: 'text',
      required: false,
      placeholder: 'e.g., UTR123456789',
    },
    {
      name: 'paymentBank',
      label: 'Payment Bank',
      type: 'text',
      required: false,
      placeholder: 'e.g., HDFC Bank',
    },
    {
      name: 'paymentBranch',
      label: 'Payment Branch',
      type: 'text',
      required: false,
      placeholder: 'e.g., Connaught Place, New Delhi',
    },
  ];

  // Tab 8: Notes & Additional Info
  const notesFields: FormField[] = [
    {
      name: 'notes',
      label: 'Notes',
      type: 'textarea',
      required: false,
      placeholder: 'Any additional notes about this booking...',
    },
    {
      name: 'specialTerms',
      label: 'Special Terms & Conditions',
      type: 'textarea',
      required: false,
      placeholder: 'Any special terms or conditions...',
    },
  ];

  const tabs = [
    { id: 'basic', label: 'Basic Info', fields: basicFields },
    { id: 'financial', label: 'Financial', fields: financialFields },
    { id: 'charges', label: 'Charges', fields: chargesFields },
    { id: 'agreement', label: 'Agreement', fields: agreementFields },
    { id: 'loan', label: 'Home Loan', fields: loanFields },
    { id: 'nominees', label: 'Nominees', fields: nomineeFields },
    { id: 'paymentRef', label: 'Payment Ref', fields: paymentRefFields },
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
      {/* Customer Information preview — visible across all tabs once a customer
          is picked, so users don't have to flip back to the Customer module. */}
      {selectedCustomerId && (
        <CustomerInfoCard
          customer={selectedCustomer}
          loading={loadingCustomer}
        />
      )}

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
        key={`${initialData?.id ?? 'new-booking'}-${selectedProperty}-${properties.length}-${formVersion}`}
        fields={currentFields}
        initialValues={mergedInitialValues}
        onValuesChange={setFormSnapshot}
        onSubmit={onSubmit}
        submitLabel={initialData ? 'Update Booking' : 'Create Booking'}
        onCancel={onCancel}
      />
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// Customer Information preview panel
//
// Shown above the tabs when a customer is selected. Surfaces every field the
// CRM lead said was missing (PAN, Aadhaar, address, KYC, home-loan info, etc.)
// so booking staff don't have to re-type or open another page to verify.
// ───────────────────────────────────────────────────────────────────────────
function CustomerInfoCard({
  customer,
  loading,
}: {
  customer: Customer | null;
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading customer details…
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        Could not load that customer's saved details. The booking can still be
        created, but please double-check the customer record.
      </div>
    );
  }

  const fullName =
    customer.fullName ||
    [customer.firstName, customer.lastName].filter(Boolean).join(' ') ||
    'Customer';
  const phone = customer.phoneNumber || customer.phone || '';
  const address = [
    customer.address || customer.addressLine1,
    customer.addressLine2,
    customer.city,
    customer.state,
    customer.pincode,
  ]
    .filter(Boolean)
    .join(', ');

  const kycBadgeColor =
    customer.kycStatus === 'VERIFIED'
      ? 'bg-green-100 text-green-700 border-green-200'
      : customer.kycStatus === 'REJECTED'
      ? 'bg-red-100 text-red-700 border-red-200'
      : 'bg-amber-100 text-amber-700 border-amber-200';

  return (
    <div className="rounded-lg border border-[#F3E3C1] bg-[#FEF9F0] p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#7B1E12]">
            <User className="h-3.5 w-3.5" />
            Customer Information (saved record)
          </div>
          <h3 className="mt-1 text-lg font-bold text-gray-900">{fullName}</h3>
          {customer.customerCode && (
            <p className="text-xs text-gray-500">Customer Code: {customer.customerCode}</p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${kycBadgeColor}`}
          >
            <ShieldCheck className="h-3 w-3" />
            KYC: {customer.kycStatus || 'PENDING'}
          </span>
          {customer.type && (
            <span className="inline-flex rounded-full border border-gray-200 bg-white px-2.5 py-0.5 text-xs font-medium text-gray-700">
              {customer.type}
            </span>
          )}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-2 text-sm md:grid-cols-2">
        {phone && (
          <InfoRow icon={<Phone className="h-3.5 w-3.5" />} label="Phone" value={phone} />
        )}
        {customer.alternatePhone && (
          <InfoRow
            icon={<Phone className="h-3.5 w-3.5" />}
            label="Alternate Phone"
            value={customer.alternatePhone}
          />
        )}
        {customer.email && (
          <InfoRow icon={<Mail className="h-3.5 w-3.5" />} label="Email" value={customer.email} />
        )}
        {customer.panNumber && (
          <InfoRow
            icon={<IdCard className="h-3.5 w-3.5" />}
            label="PAN"
            value={customer.panNumber}
          />
        )}
        {customer.aadharNumber && (
          <InfoRow
            icon={<IdCard className="h-3.5 w-3.5" />}
            label="Aadhaar"
            value={customer.aadharNumber}
          />
        )}
        {customer.occupation && (
          <InfoRow
            icon={<Briefcase className="h-3.5 w-3.5" />}
            label="Occupation"
            value={customer.occupation}
          />
        )}
        {customer.companyName || customer.company ? (
          <InfoRow
            icon={<Briefcase className="h-3.5 w-3.5" />}
            label="Company"
            value={customer.companyName || customer.company || ''}
          />
        ) : null}
        {customer.annualIncome ? (
          <InfoRow
            icon={<IndianRupee className="h-3.5 w-3.5" />}
            label="Annual Income"
            value={fmtINR(customer.annualIncome) || '-'}
          />
        ) : null}
        {address && (
          <InfoRow
            icon={<MapPin className="h-3.5 w-3.5" />}
            label="Address"
            value={address}
            wide
          />
        )}
      </div>

      {(customer.needsHomeLoan || customer.hasApprovedLoan) && (
        <div className="mt-4 rounded-md border border-[#F3E3C1] bg-white px-3 py-2 text-xs text-gray-700">
          <span className="font-semibold text-[#7B1E12]">Home Loan: </span>
          {customer.needsHomeLoan ? 'Required' : 'Not required'}
          {customer.bankName && ` · ${customer.bankName}`}
          {customer.approvedLoanAmount
            ? ` · Approved ${fmtINR(customer.approvedLoanAmount)}`
            : customer.hasApprovedLoan
            ? ' · Approved'
            : ''}
          <span className="ml-1 text-gray-500">
            (auto-filled in the Home Loan tab — change there if needed)
          </span>
        </div>
      )}
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
  wide,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  wide?: boolean;
}) {
  return (
    <div className={wide ? 'md:col-span-2' : ''}>
      <div className="flex items-start gap-2 text-gray-700">
        <span className="mt-0.5 text-gray-400">{icon}</span>
        <div>
          <div className="text-xs uppercase tracking-wide text-gray-500">{label}</div>
          <div className="font-medium text-gray-900 break-words">{value}</div>
        </div>
      </div>
    </div>
  );
}
