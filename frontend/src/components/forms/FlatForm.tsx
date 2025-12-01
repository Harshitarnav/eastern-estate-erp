import React from 'react';
import { Form, FormSection } from './Form';
import { Home, Building2, DollarSign } from 'lucide-react';

interface FlatFormProps {
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
  properties?: any[];
  towers?: any[];
  customers?: any[];
  isEdit?: boolean;
}

export default function FlatForm({ 
  initialData, 
  onSubmit, 
  onCancel,
  loading = false,
  properties = [],
  towers = [],
  customers = [],
  isEdit = false,
}: FlatFormProps) {
  
  const sections: FormSection[] = [
    {
      title: 'Basic Information',
      description: 'Enter the basic details of the flat/unit',
      fields: [
        {
          name: 'propertyId',
          label: 'Property',
          type: 'select',
          required: true,
          options: properties.map(p => ({ value: p.id, label: p.name })),
          icon: <Building2 className="w-5 h-5" />,
        },
        {
          name: 'towerId',
          label: 'Tower/Block',
          type: 'select',
          required: true,
          options: towers.map(t => ({ value: t.id, label: t.name })),
          icon: <Building2 className="w-5 h-5" />,
        },
        {
          name: 'flatNumber',
          label: 'Flat Number',
          type: 'text',
          placeholder: 'T1-101',
          required: true,
          helperText: 'e.g., T1-101, A-501',
        },
        {
          name: 'name',
          label: 'Unit Name',
          type: 'text',
          placeholder: 'Luxury 2BHK',
          required: true,
        },
        {
          name: 'type',
          label: 'Unit Type',
          type: 'select',
          required: true,
          options: [
            { value: 'STUDIO', label: 'Studio' },
            { value: '1BHK', label: '1 BHK' },
            { value: '2BHK', label: '2 BHK' },
            { value: '3BHK', label: '3 BHK' },
            { value: '4BHK', label: '4 BHK' },
            { value: 'PENTHOUSE', label: 'Penthouse' },
            { value: 'DUPLEX', label: 'Duplex' },
            { value: 'VILLA', label: 'Villa' },
          ],
        },
        {
          name: 'floor',
          label: 'Floor Number',
          type: 'number',
          placeholder: '1',
          required: true,
          validation: { min: 0 },
        },
      ],
    },
    {
      title: 'Unit Specifications',
      description: 'Room configuration and features',
      fields: [
        {
          name: 'bedrooms',
          label: 'Bedrooms',
          type: 'number',
          placeholder: '2',
          required: true,
          validation: { min: 0 },
        },
        {
          name: 'bathrooms',
          label: 'Bathrooms',
          type: 'number',
          placeholder: '2',
          required: true,
          validation: { min: 0 },
        },
        {
          name: 'balconies',
          label: 'Balconies',
          type: 'number',
          placeholder: '1',
          required: true,
          validation: { min: 0 },
        },
        {
          name: 'servantRoom',
          label: 'Servant Room',
          type: 'checkbox',
        },
        {
          name: 'studyRoom',
          label: 'Study Room',
          type: 'checkbox',
        },
        {
          name: 'poojaRoom',
          label: 'Pooja Room',
          type: 'checkbox',
        },
      ],
    },
    {
      title: 'Area Details',
      description: 'Enter area measurements (in sq.ft)',
      fields: [
        {
          name: 'superBuiltUpArea',
          label: 'Super Built-up Area (sq.ft)',
          type: 'number',
          placeholder: '1200',
          required: true,
          validation: { min: 0 },
        },
        {
          name: 'builtUpArea',
          label: 'Built-up Area (sq.ft)',
          type: 'number',
          placeholder: '1050',
          required: true,
          validation: { min: 0 },
        },
        {
          name: 'carpetArea',
          label: 'Carpet Area (sq.ft)',
          type: 'number',
          placeholder: '900',
          required: true,
          validation: { min: 0 },
        },
        {
          name: 'balconyArea',
          label: 'Balcony Area (sq.ft)',
          type: 'number',
          placeholder: '80',
          validation: { min: 0 },
        },
      ],
    },
    {
      title: 'Pricing',
      description: 'Enter pricing details',
      fields: [
        {
          name: 'basePrice',
          label: 'Base Price',
          type: 'currency',
          placeholder: '2500000',
          required: true,
          prefix: '₹',
          validation: { min: 0 },
        },
        {
          name: 'pricePerSqft',
          label: 'Price per Sq.ft',
          type: 'currency',
          placeholder: '2800',
          prefix: '₹',
          validation: { min: 0 },
        },
        {
          name: 'registrationCharges',
          label: 'Registration Charges',
          type: 'currency',
          placeholder: '50000',
          prefix: '₹',
          validation: { min: 0 },
        },
        {
          name: 'maintenanceCharges',
          label: 'Maintenance Charges (monthly)',
          type: 'currency',
          placeholder: '2000',
          prefix: '₹',
          validation: { min: 0 },
        },
        {
          name: 'parkingCharges',
          label: 'Parking Charges',
          type: 'currency',
          placeholder: '100000',
          prefix: '₹',
          validation: { min: 0 },
        },
        {
          name: 'totalPrice',
          label: 'Total Price',
          type: 'currency',
          placeholder: '2800000',
          required: true,
          prefix: '₹',
          validation: { min: 0 },
          helperText: 'Base + Registration + Other charges',
        },
        {
          name: 'discountAmount',
          label: 'Discount Amount',
          type: 'currency',
          placeholder: '50000',
          prefix: '₹',
          validation: { min: 0 },
        },
        {
          name: 'finalPrice',
          label: 'Final Price',
          type: 'currency',
          placeholder: '2750000',
          required: true,
          prefix: '₹',
          validation: { min: 0 },
          helperText: 'Total - Discount',
        },
      ],
    },
    {
      title: 'Status & Availability',
      description: 'Unit status and availability',
      fields: [
        {
          name: 'status',
          label: 'Status',
          type: 'select',
          required: true,
          options: [
            { value: 'AVAILABLE', label: 'Available' },
            { value: 'BLOCKED', label: 'Blocked' },
            { value: 'BOOKED', label: 'Booked' },
            { value: 'SOLD', label: 'Sold' },
            { value: 'UNDER_CONSTRUCTION', label: 'Under Construction' },
          ],
        },
        {
          name: 'isAvailable',
          label: 'Available for Sale',
          type: 'checkbox',
        },
        {
          name: 'availableFrom',
          label: 'Available From',
          type: 'date',
        },
        {
          name: 'expectedPossession',
          label: 'Expected Possession',
          type: 'date',
        },
      ],
    },
    {
      title: 'Features',
      description: 'Unit features and specifications',
      fields: [
        {
          name: 'facing',
          label: 'Facing Direction',
          type: 'select',
          options: [
            { value: 'North', label: 'North' },
            { value: 'South', label: 'South' },
            { value: 'East', label: 'East' },
            { value: 'West', label: 'West' },
            { value: 'North-East', label: 'North-East' },
            { value: 'North-West', label: 'North-West' },
            { value: 'South-East', label: 'South-East' },
            { value: 'South-West', label: 'South-West' },
          ],
        },
        {
          name: 'vastuCompliant',
          label: 'Vastu Compliant',
          type: 'checkbox',
        },
        {
          name: 'cornerUnit',
          label: 'Corner Unit',
          type: 'checkbox',
        },
        {
          name: 'roadFacing',
          label: 'Road Facing',
          type: 'checkbox',
        },
        {
          name: 'parkFacing',
          label: 'Park Facing',
          type: 'checkbox',
        },
        {
          name: 'parkingSlots',
          label: 'Parking Slots',
          type: 'number',
          placeholder: '2',
          required: true,
          validation: { min: 0 },
        },
        {
          name: 'coveredParking',
          label: 'Covered Parking',
          type: 'checkbox',
        },
        {
          name: 'furnishingStatus',
          label: 'Furnishing Status',
          type: 'select',
          options: [
            { value: 'UNFURNISHED', label: 'Unfurnished' },
            { value: 'SEMI_FURNISHED', label: 'Semi-Furnished' },
            { value: 'FULLY_FURNISHED', label: 'Fully Furnished' },
          ],
        },
      ],
    },
    {
      title: 'Customer Assignment',
      description: 'Link this unit to a customer so sales and CRM stay in sync.',
      fields: [
        {
          name: 'customerId',
          label: 'Assign Existing Customer',
          type: 'select',
          options: [
            { value: '', label: 'None' },
            ...customers.map((customer) => ({
              value: customer.id,
              label: `${customer.firstName} ${customer.lastName} (${customer.email})`,
            })),
          ],
          helperText: 'Pick an existing customer or fill details below to create a new one.',
        },
        {
          name: 'customerFirstName',
          label: 'Customer First Name',
          type: 'text',
          helperText: 'Required if you are creating a new customer while saving this unit.',
        },
        {
          name: 'customerLastName',
          label: 'Customer Last Name',
          type: 'text',
        },
        {
          name: 'customerEmail',
          label: 'Customer Email',
          type: 'email',
        },
        {
          name: 'customerPhone',
          label: 'Customer Phone',
          type: 'tel',
        },
        {
          name: 'customerType',
          label: 'Customer Type',
          type: 'select',
          options: [
            { value: 'INDIVIDUAL', label: 'Individual' },
            { value: 'CORPORATE', label: 'Corporate' },
            { value: 'NRI', label: 'NRI' },
          ],
        },
        {
          name: 'customerNotes',
          label: 'Customer Notes',
          type: 'textarea',
          rows: 3,
        },
      ],
    },
    {
      title: 'Additional Details',
      fields: [
        {
          name: 'description',
          label: 'Description',
          type: 'textarea',
          placeholder: 'Detailed description of the unit...',
          rows: 4,
        },
        {
          name: 'amenities',
          label: 'Amenities',
          type: 'textarea',
          placeholder: 'AC, Modular Kitchen, Wardrobe',
          rows: 3,
          helperText: 'Separate multiple amenities with commas',
        },
        {
          name: 'specialFeatures',
          label: 'Special Features',
          type: 'textarea',
          placeholder: 'Premium flooring, High ceiling',
          rows: 2,
        },
        {
          name: 'remarks',
          label: 'Remarks',
          type: 'textarea',
          placeholder: 'Any additional notes...',
          rows: 2,
        },
      ],
    },
    {
      title: 'Display Settings',
      fields: [
        {
          name: 'displayOrder',
          label: 'Display Order',
          type: 'number',
          placeholder: '1',
          validation: { min: 0 },
          helperText: 'Order in which to display this unit',
        },
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
      title={initialData ? 'Edit Flat/Unit' : 'Add New Flat/Unit'}
      description={initialData ? 'Update flat details' : 'Add a new flat/unit to the tower'}
      sections={sections}
      initialValues={initialData}
      onSubmit={onSubmit}
      onCancel={onCancel}
      submitLabel={initialData ? 'Update Flat' : 'Create Flat'}
      cancelLabel="Cancel"
      loading={loading}
      columns={2}
    />
  );
}
