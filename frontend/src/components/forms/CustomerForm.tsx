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
          placeholder: 'Enter first name',
          validation: {
            minLength: 2,
            maxLength: 50,
            pattern: /^[A-Za-z ]+$/,
          },
        },
        {
          name: 'lastName',
          label: 'Last Name',
          type: 'text',
          required: true,
          placeholder: 'Enter last name',
          validation: {
            minLength: 2,
            maxLength: 50,
            pattern: /^[A-Za-z ]+$/,
          },
        },
        {
          name: 'email',
          label: 'Email',
          type: 'email',
          required: true,
          icon: <Mail className="w-5 h-5" />,
          placeholder: 'Enter email address',
          validation: {
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
          },
        },
        {
          name: 'phone',
          label: 'Phone',
          type: 'tel',
          required: true,
          icon: <Phone className="w-5 h-5" />,
          placeholder: 'Enter phone number',
          validation: {
            pattern: /^[6-9]\d{9}$/,
          },
          helperText: '10-digit mobile number',
        },
        {
          name: 'alternatePhone',
          label: 'Alternate Phone',
          type: 'tel',
          placeholder: 'Enter phone number',
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
          placeholder: 'Enter correspondence address',
        },
        {
          name: 'city',
          label: 'City',
          type: 'text',
          placeholder: 'Enter city'
        },
        {
          name: 'state',
          label: 'State',
          type: 'text',
          placeholder: 'Enter state'
        },
        {
          name: 'pincode',
          label: 'Pincode',
          type: 'text',
          placeholder: 'Enter pincode',
          validation: {
            pattern: /^\d{6}$/,
          },
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
          placeholder: 'Enter occupation',
        },
        {
          name: 'annualIncome',
          label: 'Annual Income',
          type: 'currency',
          prefix: '₹',
          placeholder: 'Enter annual income',
          validation: { min: 0 },
        },
        {
          name: 'company',
          label: 'Company',
          type: 'text',
          placeholder: 'Enter company name',
          validation: {
            maxLength: 100,
          },
        },
        {
          name: 'designation',
          label: 'Designation',
          type: 'text',
          placeholder: 'Enter designation',
          validation: {
            maxLength: 100,
          },
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
          placeholder: 'Enter PAN number',
          validation: {
            pattern: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
          },
          helperText: 'Format: ABCDE1234F (Capital letters only)',
        },
        {
          name: 'aadharNumber',
          label: 'Aadhar Number',
          type: 'text',
          placeholder: 'Enter Aadhar number',
          validation: {
            pattern: /^\d{12}$/,
          },
          helperText: '12-digit Aadhar number',
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
          placeholder: 'Enter bank name',
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
          placeholder: 'Enter any additional notes about the customer',
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
