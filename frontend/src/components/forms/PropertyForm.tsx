// PropertyForm.tsx - Example usage of Form component for Eastern Estate
// Save as: frontend/src/components/forms/PropertyForm.tsx

import React from 'react';
import { Form, FormSection } from './Form';
import { Building2, MapPin } from 'lucide-react';

interface PropertyFormProps {
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
}

export default function PropertyForm({ 
  initialData, 
  onSubmit, 
  onCancel,
  loading = false 
}: PropertyFormProps) {
  
  const sections: FormSection[] = [
    {
      title: 'Basic Information',
      description: 'Enter the basic details of the property',
      fields: [
        {
          name: 'projectCode',
          label: 'Project Code',
          type: 'text',
          placeholder: 'EECD-XXX-001',
          required: true,
          icon: <Building2 className="w-5 h-5" />,
          validation: {
            pattern: /^EECD-[A-Z]+-\d{3}$/,
          },
          helperText: 'Format: EECD-XXX-001',
        },
        {
          name: 'projectName',
          label: 'Project Name',
          type: 'text',
          placeholder: 'Diamond City',
          required: true,
          icon: <Building2 className="w-5 h-5" />,
        },
        {
          name: 'projectType',
          label: 'Project Type',
          type: 'select',
          required: true,
          options: [
            { value: 'township', label: 'Township' },
            { value: 'residential', label: 'Residential Complex' },
            { value: 'commercial', label: 'Commercial Complex' },
            { value: 'villa', label: 'Villa/Bungalow' },
            { value: 'apartment', label: 'Apartments' },
          ],
        },
        {
          name: 'status',
          label: 'Status',
          type: 'select',
          required: true,
          options: [
            { value: 'planning', label: 'Planning' },
            { value: 'under_construction', label: 'Under Construction' },
            { value: 'active', label: 'Active' },
            { value: 'completed', label: 'Completed' },
          ],
        },
      ],
    },
    {
      title: 'Location Details',
      description: 'Specify the location and address',
      fields: [
        {
          name: 'address',
          label: 'Address',
          type: 'textarea',
          placeholder: 'Enter complete address',
          required: true,
          rows: 3,
        },
        {
          name: 'city',
          label: 'City',
          type: 'text',
          placeholder: 'Ranchi',
          required: true,
          icon: <MapPin className="w-5 h-5" />,
        },
        {
          name: 'state',
          label: 'State',
          type: 'select',
          required: true,
          options: [
            { value: 'jharkhand', label: 'Jharkhand' },
            { value: 'bihar', label: 'Bihar' },
            { value: 'west_bengal', label: 'West Bengal' },
            { value: 'odisha', label: 'Odisha' },
            { value: 'uttar_pradesh', label: 'Uttar Pradesh' },
            { value: 'madhya_pradesh', label: 'Madhya Pradesh' },
          ],
        },
        {
          name: 'pincode',
          label: 'Pincode',
          type: 'text',
          placeholder: '834001',
          required: true,
          validation: {
            pattern: /^\d{6}$/,
          },
          helperText: 'Enter 6-digit pincode',
        },
        {
          name: 'nearbyLandmarks',
          label: 'Nearby Landmarks',
          type: 'textarea',
          placeholder: '3km from NH-33, Behind Apollo Hospital',
          rows: 2,
        },
      ],
    },
    {
      title: 'Project Specifications',
      description: 'Technical details and specifications',
      fields: [
        {
          name: 'totalArea',
          label: 'Total Area',
          type: 'number',
          placeholder: '28',
          required: true,
          validation: { min: 0 },
        },
        {
          name: 'areaUnit',
          label: 'Area Unit',
          type: 'select',
          required: true,
          options: [
            { value: 'acres', label: 'Acres' },
            { value: 'sqft', label: 'Square Feet' },
            { value: 'sqm', label: 'Square Meters' },
          ],
        },
        {
          name: 'totalTowers',
          label: 'Number of Towers/Blocks',
          type: 'number',
          placeholder: '13',
          validation: { min: 0 },
        },
        {
          name: 'floorsPerTower',
          label: 'Floors per Tower',
          type: 'text',
          placeholder: 'G+9',
          helperText: 'e.g., G+9, G+11',
        },
        {
          name: 'totalUnits',
          label: 'Total Units',
          type: 'number',
          placeholder: '732',
          required: true,
          validation: { min: 1 },
        },
        {
          name: 'bhkTypes',
          label: 'BHK Types Available',
          type: 'text',
          placeholder: '2BHK, 3BHK, 4BHK',
          required: true,
          helperText: 'Separate multiple types with commas',
        },
      ],
    },
    {
      title: 'Legal & Compliance',
      description: 'Registration and compliance details',
      fields: [
        {
          name: 'reraNumber',
          label: 'RERA Registration Number',
          type: 'text',
          placeholder: 'JRERA-RAN-2024-XXX',
          helperText: 'Leave blank if not applicable or CNT Free',
        },
        {
          name: 'reraStatus',
          label: 'RERA Status',
          type: 'select',
          options: [
            { value: 'registered', label: 'RERA Registered' },
            { value: 'cnt_free', label: 'CNT Free' },
            { value: 'pending', label: 'Registration Pending' },
            { value: 'not_applicable', label: 'Not Applicable' },
          ],
        },
      ],
    },
    {
      title: 'Financial Details',
      description: 'Pricing and financial information',
      fields: [
        {
          name: 'priceMin',
          label: 'Minimum Price',
          type: 'currency',
          placeholder: '2500000',
          required: true,
          prefix: '₹',
          validation: { min: 0 },
          helperText: 'Minimum unit price',
        },
        {
          name: 'priceMax',
          label: 'Maximum Price',
          type: 'currency',
          placeholder: '4500000',
          required: true,
          prefix: '₹',
          validation: { min: 0 },
          helperText: 'Maximum unit price',
        },
        {
          name: 'expectedRevenue',
          label: 'Expected Total Revenue',
          type: 'currency',
          placeholder: '380000000',
          prefix: '₹',
          validation: { min: 0 },
        },
      ],
    },
    {
      title: 'Timeline',
      description: 'Important project dates',
      fields: [
        {
          name: 'launchDate',
          label: 'Launch Date',
          type: 'date',
          required: true,
        },
        {
          name: 'possessionDate',
          label: 'Expected Possession Date',
          type: 'date',
          required: true,
        },
        {
          name: 'completionDate',
          label: 'Actual Completion Date',
          type: 'date',
          helperText: 'Leave blank if not completed',
        },
      ],
    },
    {
      title: 'Additional Information',
      fields: [
        {
          name: 'description',
          label: 'Project Description',
          type: 'textarea',
          placeholder: 'Detailed description of the project...',
          rows: 5,
        },
        {
          name: 'amenities',
          label: 'Amenities',
          type: 'textarea',
          placeholder: 'Swimming Pool, Gym, Club House, Children Play Area, 70% Open Space',
          rows: 4,
          helperText: 'List all amenities, separate with commas',
        },
        {
          name: 'brochure',
          label: 'Project Brochure',
          type: 'file',
          accept: '.pdf,.doc,.docx',
          helperText: 'Upload project brochure (PDF, DOC)',
        },
        {
          name: 'images',
          label: 'Project Images',
          type: 'file',
          accept: 'image/*',
          multiple: true,
          helperText: 'Upload multiple project images',
        },
        {
          name: 'layoutPlan',
          label: 'Layout Plan',
          type: 'file',
          accept: 'image/*,.pdf',
          helperText: 'Upload layout/master plan',
        },
      ],
    },
    {
      title: 'Status',
      fields: [
        {
          name: 'isActive',
          label: 'Mark as Active (visible to customers)',
          type: 'checkbox',
        },
        {
          name: 'isFeatured',
          label: 'Mark as Featured Project',
          type: 'checkbox',
        },
      ],
    },
  ];

  return (
    <Form
      title={initialData ? 'Edit Project' : 'Add New Project'}
      description={initialData ? 'Update project details' : 'Create a new property project for Eastern Estate'}
      sections={sections}
      initialValues={initialData}
      onSubmit={onSubmit}
      onCancel={onCancel}
      submitLabel={initialData ? 'Update Project' : 'Create Project'}
      cancelLabel="Cancel"
      loading={loading}
      columns={2}
    />
  );
}
