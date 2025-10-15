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

export function BookingForm({ onSubmit, initialData, onCancel }: BookingFormProps) {
  const [properties, setProperties] = useState<any[]>([]);
  const [flats, setFlats] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedProperty, setSelectedProperty] = useState('');
  const [loading, setLoading] = useState(true);

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
      const res = await flatsService.getFlats({ propertyId, flatStatus: 'AVAILABLE', limit: 100 });
      setFlats(res.data);
    } catch (error) {
      console.error('Error fetching flats:', error);
    }
  };

  const fields: FormField[] = [
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
      name: 'customerId',
      label: 'Customer',
      type: 'select',
      required: true,
      options: customers.map(c => ({ value: c.id, label: `${c.fullName} (${c.phoneNumber})` })),
    },
    {
      name: 'propertyId',
      label: 'Property',
      type: 'select',
      required: true,
      options: properties.map(p => ({ value: p.id, label: `${p.name} - ${p.location}` })),
      onChange: (value) => setSelectedProperty(value),
    },
    {
      name: 'flatId',
      label: 'Flat/Unit',
      type: 'select',
      required: true,
      options: flats.map(f => ({ value: f.id, label: `${f.flatNumber} - ${f.bhkType} (₹${(f.salePrice / 100000).toFixed(2)}L)` })),
      disabled: !selectedProperty,
    },
    {
      name: 'bookingAmount',
      label: 'Booking Amount (₹)',
      type: 'number',
      required: true,
      placeholder: 'e.g., 500000',
    },
    {
      name: 'totalAmount',
      label: 'Total Amount (₹)',
      type: 'number',
      required: true,
      placeholder: 'e.g., 5000000',
    },
    {
      name: 'paymentPlan',
      label: 'Payment Plan',
      type: 'select',
      required: true,
      options: [
        { value: 'FULL_PAYMENT', label: 'Full Payment' },
        { value: 'INSTALLMENT', label: 'Installment Plan' },
        { value: 'CONSTRUCTION_LINKED', label: 'Construction Linked' },
        { value: 'POSSESSION_LINKED', label: 'Possession Linked' },
        { value: 'CUSTOM', label: 'Custom Plan' },
      ],
    },
    {
      name: 'loanRequired',
      label: 'Loan Required?',
      type: 'select',
      required: true,
      options: [
        { value: 'true', label: 'Yes' },
        { value: 'false', label: 'No' },
      ],
    },
    {
      name: 'agreementDate',
      label: 'Agreement Date',
      type: 'date',
      required: false,
    },
    {
      name: 'registryDate',
      label: 'Registry Date',
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
      submitLabel={initialData ? 'Update Booking' : 'Create Booking'}
      onCancel={onCancel}
    />
  );
}

