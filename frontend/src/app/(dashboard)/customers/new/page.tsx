'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import CustomerForm from '@/components/forms/CustomerForm';
import { customersService } from '@/services/customers.service';

export default function NewCustomerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: any) => {
    setLoading(true);
    try {
      const customerData = {
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
        bankName: data.bankName,
        notes: data.notes,
        isActive: data.isActive !== false,
        isVIP: data.isVIP || false,
      };

      await customersService.createCustomer(customerData);
      alert('Customer created successfully!');
      router.push('/customers');
    } catch (error: any) {
      console.error('Error creating customer:', error);
      alert(error.response?.data?.message || 'Failed to create customer');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/customers');
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <CustomerForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={loading}
      />
    </div>
  );
}
