import React from 'react';
import { Form, FormSection } from './Form';
import { UserCheck, Phone, Mail, Shield } from 'lucide-react';

interface CustomerFormProps {
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
  propertyOptions?: { value: string; label: string }[];
}

export default function CustomerForm({ 
  initialData, 
  onSubmit, 
  onCancel,
  loading = false,
  propertyOptions = [],
}: CustomerFormProps) {
  
  const sections: FormSection[] = [
    {
      title: 'Basic Information',
      fields: [
        {
          name: 'firstName',
          label: 'First Name',
          type: 'text',
          required: true,
          icon: <UserCheck className="w-5 h-5" />,
        },
        {
          name: 'lastName',
          label: 'Last Name',
          type: 'text',
          required: true,
        },
        {
          name: 'email',
          label: 'Email',
          type: 'email',
          required: true,
          icon: <Mail className="w-5 h-5" />,
        },
        {
          name: 'phone',
          label: 'Phone',
          type: 'tel',
          required: true,
          icon: <Phone className="w-5 h-5" />,
        },
        {
          name: 'alternatePhone',
          label: 'Alternate Phone',
          type: 'tel',
        },
        {
          name: 'dateOfBirth',
          label: 'Date of Birth',
          type: 'date',
        },
        {
          name: 'gender',
          label: 'Gender',
          type: 'select',
          options: [
            { value: 'MALE', label: 'Male' },
            { value: 'FEMALE', label: 'Female' },
            { value: 'OTHER', label: 'Other' },
          ],
        },
      ],
    },
    {
      title: 'Address',
      fields: [
        {
          name: 'address',
          label: 'Address',
          type: 'textarea',
          rows: 3,
        },
        {
          name: 'city',
          label: 'City',
          type: 'text',
        },
        {
          name: 'state',
          label: 'State',
          type: 'text',
        },
        {
          name: 'pincode',
          label: 'Pincode',
          type: 'text',
          validation: {
            pattern: /^\d{6}$/,
          },
          helperText: '6-digit pincode',
        },
      ],
    },
    ...(propertyOptions.length > 0
      ? [
          {
            title: 'Property Association',
            fields: [
              {
                name: 'propertyId',
                label: 'Property',
                type: 'select',
                required: false,
                options: [{ value: '', label: 'Not linked to a property' }, ...propertyOptions],
              },
            ],
          } as FormSection,
        ]
      : []),
    {
      title: 'Customer Classification',
      fields: [
        {
          name: 'type',
          label: 'Customer Type',
          type: 'select',
          required: true,
          options: [
            { value: 'INDIVIDUAL', label: 'Individual' },
            { value: 'CORPORATE', label: 'Corporate' },
            { value: 'NRI', label: 'NRI' },
          ],
        },
        {
          name: 'occupation',
          label: 'Occupation',
          type: 'text',
        },
        {
          name: 'annualIncome',
          label: 'Annual Income',
          type: 'currency',
          prefix: '₹',
          validation: { min: 0 },
        },
        {
          name: 'company',
          label: 'Company',
          type: 'text',
        },
        {
          name: 'designation',
          label: 'Designation',
          type: 'text',
        },
      ],
    },
    {
      title: 'KYC Information',
      description: 'Know Your Customer documentation',
      fields: [
        {
          name: 'panNumber',
          label: 'PAN Number',
          type: 'text',
          icon: <Shield className="w-5 h-5" />,
        },
        {
          name: 'aadharNumber',
          label: 'Aadhar Number',
          type: 'text',
        },
      ],
    },
    {
      title: 'Financial Details',
      fields: [
        {
          name: 'needsHomeLoan',
          label: 'Needs Home Loan',
          type: 'checkbox',
        },
        {
          name: 'bankName',
          label: 'Bank Name',
          type: 'text',
        },
      ],
    },
    {
      title: 'Additional Information',
      fields: [
        {
          name: 'notes',
          label: 'Notes',
          type: 'textarea',
          rows: 4,
        },
      ],
    },
    {
      title: 'Status',
      fields: [
        {
          name: 'isActive',
          label: 'Mark as Active',
          type: 'checkbox',
        },
        {
          name: 'isVIP',
          label: 'Mark as VIP Customer',
          type: 'checkbox',
        },
      ],
    },
  ];

  return (
    <Form
      title={initialData ? 'Edit Customer' : 'Add New Customer'}
      description={initialData ? 'Update customer details' : 'Add a verified customer to the system'}
      sections={sections}
      initialValues={initialData}
      onSubmit={onSubmit}
      onCancel={onCancel}
      submitLabel={initialData ? 'Update Customer' : 'Create Customer'}
      cancelLabel="Cancel"
      loading={loading}
      columns={2}
    />
  );
}
