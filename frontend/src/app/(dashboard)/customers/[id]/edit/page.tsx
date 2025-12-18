'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import CustomerForm from '@/components/forms/CustomerForm';
import { customersService } from '@/services/customers.service';
import { propertiesService } from '@/services/properties.service';

export default function CustomerEditPage() {
  const router = useRouter();
  const params = useParams();
  const customerId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [initialData, setInitialData] = useState<any>(null);
  const [propertyOptions, setPropertyOptions] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    if (customerId) {
      fetchCustomer();
    }
    (async () => {
      try {
        const res = await propertiesService.getProperties({ limit: 200, isActive: true });
        const options = res.data?.map((p: any) => ({ value: p.id, label: p.name })) || [];
        setPropertyOptions(options);
      } catch (err) {
        console.error('Failed to load properties for customer form', err);
      }
    })();
  }, [customerId]);

  const fetchCustomer = async () => {
    try {
      setLoading(true);
      const customer = await customersService.getCustomer(customerId);
      setInitialData({
        firstName: customer.firstName || '',
        lastName: customer.lastName || '',
        email: customer.email || '',
        phone: customer.phone || customer.phoneNumber || '',
        alternatePhone: customer.alternatePhone || '',
        dateOfBirth: customer.dateOfBirth ? new Date(customer.dateOfBirth).toISOString().split('T')[0] : '',
        gender: customer.gender || '',
        address: customer.address || customer.addressLine1 || '',
        city: customer.city || '',
        state: customer.state || '',
        pincode: customer.pincode || '',
        type: customer.type || 'INDIVIDUAL',
        occupation: customer.occupation || '',
        company: customer.company || customer.companyName || '',
        designation: (customer as any).designation || '',
        panNumber: customer.panNumber || '',
        aadharNumber: customer.aadharNumber || '',
        needsHomeLoan: (customer as any).needsHomeLoan || false,
        hasApprovedLoan: (customer as any).hasApprovedLoan || false,
        bankName: (customer as any).bankName || '',
        notes: customer.notes || '',
        isActive: customer.isActive !== false,
        isVIP: customer.isVIP || false,
        propertyId: (customer as any).propertyId || '',
        kycStatus: customer.kycStatus || 'PENDING',
      });
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch customer');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      await customersService.updateCustomer(customerId, {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        alternatePhone: data.alternatePhone,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
        address: data.address,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        type: data.type || 'INDIVIDUAL',
        occupation: data.occupation,
        annualIncome: data.annualIncome,
        company: data.company,
        designation: data.designation,
        panNumber: data.panNumber,
        aadharNumber: data.aadharNumber,
        needsHomeLoan: data.needsHomeLoan || false,
        hasApprovedLoan: data.hasApprovedLoan || false,
        bankName: data.bankName,
        notes: data.notes,
        isActive: data.isActive !== false,
        isVIP: data.isVIP || false,
        propertyId: data.propertyId || undefined,
        kycStatus: data.kycStatus || 'PENDING',
      });
      alert('Customer updated successfully!');
      window.location.href = '/customers';
    } catch (error: any) {
      console.error('Error updating customer:', error);
      alert(error.response?.data?.message || 'Failed to update customer');
    }
  };

  const handleCancel = () => {
    router.push('/customers');
  };

  if (loading) {
    return (
      <div className="container mx-auto py-16 px-4 text-center text-gray-600">
        Loading customer...
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-16 px-4 text-center text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <CustomerForm
        initialData={initialData}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={loading}
        propertyOptions={propertyOptions}
      />
    </div>
  );
}
