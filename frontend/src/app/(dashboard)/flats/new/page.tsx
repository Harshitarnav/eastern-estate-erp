'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import FlatForm from '@/components/forms/FlatForm';
import { flatsService } from '@/services/flats.service';
import { propertiesService } from '@/services/properties.service';
import { towersService } from '@/services/towers.service';
import { customersService } from '@/services/customers.service';
import { mapFlatFormToPayload } from '@/utils/forms/flat';

export default function NewFlatPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState<any[]>([]);
  const [towers, setTowers] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);

  useEffect(() => {
    fetchProperties();
    // fetchTowers();
    fetchCustomers();
  }, []);

  const fetchTowersByProperty = async (propertyId: string) => {
    setTowers([]);
    const response = await towersService.getTowers({
      isActive: true,
      propertyId,
    });
    setTowers(response.data);
  };

  const fetchProperties = async () => {
    try {
      const response = await propertiesService.getProperties({ isActive: true });
      setProperties(response.data);
    } catch (error) {
      console.error('Error fetching properties:', error);
    }
  };

  const fetchTowers = async () => {
    try {
      const response = await towersService.getTowers({ isActive: true });
      setTowers(response.data);
    } catch (error) {
      console.error('Error fetching towers:', error);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await customersService.getCustomers({ isActive: true, limit: 100, page: 1 });
      setCustomers(response.data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const handleSubmit = async (data: any) => {
    setLoading(true);
    try {
      const {
        customerId: existingCustomerId,
        customerFirstName,
        customerLastName,
        customerEmail,
        customerPhone,
        customerType,
        customerNotes,
      } = data;

      const trimmedFirstName = customerFirstName?.trim();
      const trimmedLastName = customerLastName?.trim();
      const trimmedEmail = customerEmail?.trim();
      const trimmedPhone = customerPhone?.trim();
      const hasNewCustomerData =
        trimmedFirstName || trimmedLastName || trimmedEmail || trimmedPhone || customerNotes;

      let resolvedCustomerId = existingCustomerId;

      if (!resolvedCustomerId && hasNewCustomerData) {
        if (!trimmedFirstName || !trimmedLastName || !trimmedEmail || !trimmedPhone) {
          alert('Please provide first name, last name, email, and phone to create a customer.');
          setLoading(false);
          return;
        }

        try {
          const createdCustomer = await customersService.createCustomer({
            firstName: trimmedFirstName,
            lastName: trimmedLastName,
            email: trimmedEmail,
            phone: trimmedPhone,
            type: customerType || 'INDIVIDUAL',
            notes: customerNotes?.trim(),
            isActive: true,
          });
          resolvedCustomerId = createdCustomer.id;
          await fetchCustomers();
        } catch (customerError: any) {
          // If customer already exists (email/phone conflict), try to resolve to existing record instead of failing.
          const status = customerError?.response?.status;
          const message = customerError?.response?.data?.message;
          if (status === 409 || /exist/i.test(message || '')) {
            try {
              const searchTerm = trimmedEmail || trimmedPhone || '';
              const existing = await customersService.getCustomers({ search: searchTerm, limit: 1, page: 1 });
              const match = existing?.data?.[0];
              if (match?.id) {
                resolvedCustomerId = match.id;
              } else {
                alert(message || 'Customer already exists. Please select the existing customer.');
                setLoading(false);
                return;
              }
            } catch (resolveErr) {
              console.error('Error resolving existing customer:', resolveErr);
              alert(message || 'Customer already exists. Please select the existing customer.');
              setLoading(false);
              return;
            }
          } else {
            console.error('Error creating customer:', customerError);
            alert(message || 'Failed to create customer');
            setLoading(false);
            return;
          }
        }
      }

      const flatData = {
        ...mapFlatFormToPayload(data),
        customerId: resolvedCustomerId || data.customerId || undefined,
      };

      await flatsService.createFlat(flatData);
      alert('Flat created successfully!');
      window.location.href = '/flats';
    } catch (error: any) {
      console.error('Error creating flat:', error);
      alert(error.response?.data?.message || 'Failed to create flat');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/flats');
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <FlatForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={loading}
        properties={properties}
        towers={towers}
        customers={customers}
        onPropertyChange={fetchTowersByProperty}
      />
    </div>
  );
}
