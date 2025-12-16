'use client';

import { useState, useEffect } from 'react';
import { Form, FormField } from './Form';
import { propertiesService } from '@/services/properties.service';
import { flatsService } from '@/services/flats.service';
import { customersService } from '@/services/customers.service';

interface BookingFormProps {
  onSubmit: (data: any) => void;
  initialData?: any;
  onCancel?: () => void;
}

export default function BookingForm({ onSubmit, initialData, onCancel }: BookingFormProps) {
  const [properties, setProperties] = useState<any[]>([]);
  const [flats, setFlats] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedProperty, setSelectedProperty] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('basic');
  const [isHomeLoan, setIsHomeLoan] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedProperty) {
      fetchFlats(selectedProperty);
    }
  }, [selectedProperty]);

  const fetchData = async () => {
    try {
      const [propsRes, customersRes] = await Promise.all([
        propertiesService.getProperties({ limit: 100, isActive: true }),
        customersService.getCustomers({ limit: 100, isActive: true }),
      ]);
      setProperties(propsRes.data);
      setCustomers(customersRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFlats = async (propertyId: string) => {
    try {
      const res = await flatsService.getFlats({ propertyId, status: 'AVAILABLE', limit: 100 });
      setFlats(res.data);
    } catch (error) {
      console.error('Error fetching flats:', error);
    }
  };

  // Tab 1: Basic Information
  const basicFields: FormField[] = [
    {
      name: 'bookingNumber',
      label: 'Booking Number *',
      type: 'text',
      required: true,
      placeholder: 'e.g., BK-2025-001',
    },
    {
      name: 'bookingDate',
      label: 'Booking Date *',
      type: 'date',
      required: true,
    },
    {
      name: 'status',
      label: 'Booking Status *',
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
      label: 'Customer *',
      type: 'select',
      required: true,
      options: customers.map(c => ({ value: c.id, label: `${c.fullName} (${c.phoneNumber})` })),
    },
    {
      name: 'propertyId',
      label: 'Property *',
      type: 'select',
      required: true,
      options: properties.map(p => ({ value: p.id, label: `${p.name} - ${p.location}` })),
      onChange: (value) => {
        setSelectedProperty(String(value));
        setFlats([]);
        if (value) {
          fetchFlats(String(value));
        }
      },
    },
    {
      name: 'flatId',
      label: 'Flat/Unit *',
      type: 'select',
      required: true,
      options: flats.map(f => ({ value: f.id, label: `${f.flatNumber} - ${f.bhkType} (₹${(f.salePrice / 100000).toFixed(2)}L)` })),
      disabled: !selectedProperty,
    },
  ];

  // Tab 2: Financial Details
  const financialFields: FormField[] = [
    {
      name: 'totalAmount',
      label: 'Total Amount (₹) *',
      type: 'number',
      required: true,
      placeholder: 'e.g., 5000000',
    },
    {
      name: 'tokenAmount',
      label: 'Token Amount (₹) *',
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
      label: 'Agreement Amount (₹) *',
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

  // Tab 7: Notes & Additional Info
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
        submitLabel={initialData ? 'Update Booking' : 'Create Booking'}
        onCancel={onCancel}
      />
    </div>
  );
}
