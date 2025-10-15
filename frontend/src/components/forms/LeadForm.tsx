import React from 'react';
import { Form, FormSection } from './Form';
import { Users, Phone, Mail } from 'lucide-react';

interface LeadFormProps {
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
  properties?: any[];
}

export default function LeadForm({ 
  initialData, 
  onSubmit, 
  onCancel,
  loading = false,
  properties = []
}: LeadFormProps) {
  
  const sections: FormSection[] = [
    {
      title: 'Basic Information',
      fields: [
        {
          name: 'firstName',
          label: 'First Name',
          type: 'text',
          required: true,
          icon: <Users className="w-5 h-5" />,
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
      ],
    },
    {
      title: 'Lead Details',
      fields: [
        {
          name: 'status',
          label: 'Status',
          type: 'select',
          required: true,
          options: [
            { value: 'NEW', label: 'New' },
            { value: 'CONTACTED', label: 'Contacted' },
            { value: 'QUALIFIED', label: 'Qualified' },
            { value: 'NEGOTIATION', label: 'Negotiation' },
            { value: 'WON', label: 'Won' },
            { value: 'LOST', label: 'Lost' },
            { value: 'ON_HOLD', label: 'On Hold' },
          ],
        },
        {
          name: 'source',
          label: 'Source',
          type: 'select',
          required: true,
          options: [
            { value: 'WEBSITE', label: 'Website' },
            { value: 'WALK_IN', label: 'Walk-in' },
            { value: 'REFERRAL', label: 'Referral' },
            { value: 'SOCIAL_MEDIA', label: 'Social Media' },
            { value: 'EMAIL', label: 'Email' },
            { value: 'PHONE', label: 'Phone' },
            { value: 'ADVERTISEMENT', label: 'Advertisement' },
            { value: 'BROKER', label: 'Broker' },
          ],
        },
        {
          name: 'priority',
          label: 'Priority',
          type: 'select',
          required: true,
          options: [
            { value: 'LOW', label: 'Low' },
            { value: 'MEDIUM', label: 'Medium' },
            { value: 'HIGH', label: 'High' },
            { value: 'URGENT', label: 'Urgent' },
          ],
        },
        {
          name: 'propertyId',
          label: 'Interested Property',
          type: 'select',
          options: properties.map(p => ({ value: p.id, label: p.name })),
        },
      ],
    },
    {
      title: 'Budget & Requirements',
      fields: [
        {
          name: 'budgetMin',
          label: 'Minimum Budget',
          type: 'currency',
          prefix: '₹',
          validation: { min: 0 },
        },
        {
          name: 'budgetMax',
          label: 'Maximum Budget',
          type: 'currency',
          prefix: '₹',
          validation: { min: 0 },
        },
        {
          name: 'preferredLocation',
          label: 'Preferred Location',
          type: 'text',
        },
        {
          name: 'needsHomeLoan',
          label: 'Needs Home Loan',
          type: 'checkbox',
        },
        {
          name: 'isFirstTimeBuyer',
          label: 'First Time Buyer',
          type: 'checkbox',
        },
      ],
    },
    {
      title: 'Follow-up',
      fields: [
        {
          name: 'nextFollowUpDate',
          label: 'Next Follow-up Date',
          type: 'date',
        },
        {
          name: 'followUpNotes',
          label: 'Follow-up Notes',
          type: 'textarea',
          rows: 3,
        },
        {
          name: 'notes',
          label: 'Additional Notes',
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
      ],
    },
  ];

  return (
    <Form
      title={initialData ? 'Edit Lead' : 'Add New Lead'}
      description={initialData ? 'Update lead details' : 'Add a new sales lead'}
      sections={sections}
      initialValues={initialData}
      onSubmit={onSubmit}
      onCancel={onCancel}
      submitLabel={initialData ? 'Update Lead' : 'Create Lead'}
      cancelLabel="Cancel"
      loading={loading}
      columns={2}
    />
  );
}
