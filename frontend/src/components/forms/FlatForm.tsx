import React, { useEffect, useState } from 'react';
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
  onPropertyChange?: (propertyId: string) => void;
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
  onPropertyChange,
}: FlatFormProps) {

  const [selectedPropertyId, setSelectedPropertyId] = useState<string>(
    initialData?.propertyId || ''
  );

  useEffect(() => {
    if (!selectedPropertyId) return;
    onPropertyChange?.(selectedPropertyId);
  }, [selectedPropertyId]);

  const handleSubmit = async (values: any) => {
    const num = (val: any) => (val === '' || val === undefined || val === null ? undefined : Number(val));
    const list = (val: any) =>
      typeof val === 'string'
        ? val.split(',').map((x) => x.trim()).filter(Boolean)
        : Array.isArray(val)
        ? val
        : undefined;

    const payload = {
      ...values,
      type: values.type || '2BHK',
      status: values.status || 'UNDER_CONSTRUCTION',
      isAvailable: values.isAvailable !== false,
      servantRoom: values.servantRoom ?? false,
      studyRoom: values.studyRoom ?? false,
      poojaRoom: values.poojaRoom ?? false,
      vastuCompliant: values.vastuCompliant ?? true,
      cornerUnit: values.cornerUnit ?? false,
      roadFacing: values.roadFacing ?? false,
      parkFacing: values.parkFacing ?? false,
      coveredParking: values.coveredParking ?? false,
      parkingSlots: num(values.parkingSlots) ?? 0,
      floor: num(values.floor) ?? 0,
      bedrooms: num(values.bedrooms) ?? 0,
      bathrooms: num(values.bathrooms) ?? 0,
      balconies: num(values.balconies) ?? 0,
      superBuiltUpArea: num(values.superBuiltUpArea) ?? 0,
      builtUpArea: num(values.builtUpArea) ?? 0,
      carpetArea: num(values.carpetArea) ?? 0,
      balconyArea: num(values.balconyArea),
      basePrice: num(values.basePrice) ?? 0,
      pricePerSqft: num(values.pricePerSqft),
      registrationCharges: num(values.registrationCharges),
      maintenanceCharges: num(values.maintenanceCharges),
      parkingCharges: num(values.parkingCharges),
      totalPrice: num(values.totalPrice) ?? 0,
      discountAmount: num(values.discountAmount),
      finalPrice: num(values.finalPrice) ?? 0,
      tokenAmount: num(values.tokenAmount),
      displayOrder: num(values.displayOrder) ?? 1,
      amenities: list(values.amenities),
      registrationReceiptUrls: list(values.registrationReceiptUrls),
      paymentReceiptUrls: list(values.paymentReceiptUrls),
      demandLetterUrls: list(values.demandLetterUrls),
      kycDocsUrls: list(values.kycDocsUrls),
      otherDocuments: list(values.otherDocuments),
    };

    await onSubmit(payload);
  };

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
          disabled: !selectedPropertyId || towers.length === 0,
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
    {
      title: 'Documents & Compliance',
      description: 'Upload key documents and compliance artifacts',
      fields: [
        { name: 'saleAgreementUrl', label: 'Sale Agreement URL', type: 'text' },
        { name: 'allotmentLetterUrl', label: 'Allotment Letter URL', type: 'text' },
        { name: 'possessionLetterUrl', label: 'Possession Letter URL', type: 'text' },
        { name: 'paymentPlanUrl', label: 'Payment Plan URL', type: 'text' },
        { name: 'registrationReceiptUrls', label: 'Registration Receipt URLs (comma-separated)', type: 'textarea', helperText: 'Paste multiple URLs separated by commas' },
        { name: 'paymentReceiptUrls', label: 'Payment Receipt URLs (comma-separated)', type: 'textarea', helperText: 'Paste multiple URLs separated by commas' },
        { name: 'demandLetterUrls', label: 'Demand Letter URLs (comma-separated)', type: 'textarea', helperText: 'Paste multiple URLs separated by commas' },
        { name: 'nocUrl', label: 'NOC / No Dues URL', type: 'text' },
        { name: 'reraCertificateUrl', label: 'RERA Certificate URL', type: 'text' },
        { name: 'kycDocsUrls', label: 'KYC Docs URLs (comma-separated)', type: 'textarea', helperText: 'Paste multiple URLs separated by commas' },
        { name: 'snagListUrl', label: 'Snag / Defect List URL', type: 'text' },
        { name: 'handoverChecklistUrl', label: 'Handover Checklist URL', type: 'text' },
        { name: 'otherDocuments', label: 'Other Document URLs (comma-separated)', type: 'textarea', helperText: 'Paste multiple URLs separated by commas' },
      ],
    },
    {
      title: 'Statuses & Dates',
      fields: [
        { name: 'agreementDate', label: 'Agreement Date', type: 'date' },
        { name: 'registrationDate', label: 'Registration Date', type: 'date' },
        { name: 'handoverDate', label: 'Handover Date', type: 'date' },
        {
          name: 'loanStatus',
          label: 'Loan Status',
          type: 'select',
          options: [
            { value: 'NONE', label: 'None' },
            { value: 'APPLIED', label: 'Applied' },
            { value: 'SANCTIONED', label: 'Sanctioned' },
            { value: 'DISBURSED', label: 'Disbursed' },
          ],
        },
        {
          name: 'handoverStatus',
          label: 'Handover Status',
          type: 'select',
          options: [
            { value: 'PENDING', label: 'Pending' },
            { value: 'READY', label: 'Ready' },
            { value: 'HANDED_OVER', label: 'Handed Over' },
          ],
        },
        {
          name: 'verificationStatus',
          label: 'Verification Status',
          type: 'select',
          options: [
            { value: 'PENDING', label: 'Pending' },
            { value: 'VERIFIED', label: 'Verified' },
          ],
        },
      ],
    },
    {
      title: 'Assignments & Extras',
      fields: [
        { name: 'salespersonId', label: 'Salesperson ID', type: 'text' },
        { name: 'serviceContactId', label: 'Service Contact ID', type: 'text' },
        { name: 'coBuyerName', label: 'Co-buyer Name', type: 'text' },
        { name: 'coBuyerEmail', label: 'Co-buyer Email', type: 'text' },
        { name: 'coBuyerPhone', label: 'Co-buyer Phone', type: 'text' },
        { name: 'parkingNumber', label: 'Parking Number', type: 'text' },
        { name: 'parkingType', label: 'Parking Type', type: 'text' },
        { name: 'storageId', label: 'Storage/Locker ID', type: 'text' },
        {
          name: 'furnishingPack',
          label: 'Furnishing Pack',
          type: 'select',
          options: [
            { value: '', label: 'None' },
            { value: 'BASIC', label: 'Basic' },
            { value: 'PREMIUM', label: 'Premium' },
          ],
        },
        { name: 'appliancePack', label: 'Appliance Pack Applied', type: 'checkbox' },
      ],
    },
  ];

  return (
    <Form
      title={initialData ? 'Edit Flat/Unit' : 'Add New Flat/Unit'}
      description={initialData ? 'Update flat details' : 'Add a new flat/unit to the tower'}
      sections={sections}
      initialValues={initialData}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      submitLabel={initialData ? 'Update Flat' : 'Create Flat'}
      cancelLabel="Cancel"
      loading={loading}
      columns={2}
      onValuesChange={(values) => {
        if (values.propertyId !== selectedPropertyId) {
          setSelectedPropertyId(values.propertyId);
        }
      }}
    />
  );
}
