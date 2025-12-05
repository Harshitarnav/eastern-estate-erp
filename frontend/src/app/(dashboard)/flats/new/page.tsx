'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import FlatForm from '@/components/forms/FlatForm';
import { flatsService } from '@/services/flats.service';
import { propertiesService } from '@/services/properties.service';
import { towersService } from '@/services/towers.service';
import { customersService } from '@/services/customers.service';

export default function NewFlatPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState<any[]>([]);
  const [towers, setTowers] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);

  useEffect(() => {
    fetchProperties();
    fetchTowers();
    fetchCustomers();
  }, []);

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
          console.error('Error creating customer:', customerError);
          alert(customerError.response?.data?.message || 'Failed to create customer');
          setLoading(false);
          return;
        }
      }

      // Transform form data to match API expectations
      const flatData = {
        propertyId: data.propertyId,
        towerId: data.towerId,
        flatNumber: data.flatNumber,
        name: data.name,
        description: data.description,
        type: data.type,
        floor: data.floor,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        balconies: data.balconies,
        servantRoom: data.servantRoom || false,
        studyRoom: data.studyRoom || false,
        poojaRoom: data.poojaRoom || false,
        superBuiltUpArea: data.superBuiltUpArea,
        builtUpArea: data.builtUpArea,
        carpetArea: data.carpetArea,
        balconyArea: data.balconyArea || 0,
        basePrice: data.basePrice,
        pricePerSqft: data.pricePerSqft || 0,
        registrationCharges: data.registrationCharges || 0,
        maintenanceCharges: data.maintenanceCharges || 0,
        parkingCharges: data.parkingCharges || 0,
        totalPrice: data.totalPrice,
        discountAmount: data.discountAmount || 0,
        finalPrice: data.finalPrice,
        status: data.status || 'AVAILABLE',
        isAvailable: data.isAvailable !== false,
        availableFrom: data.availableFrom,
        expectedPossession: data.expectedPossession,
        facing: data.facing,
        vastuCompliant: data.vastuCompliant || false,
        cornerUnit: data.cornerUnit || false,
        roadFacing: data.roadFacing || false,
        parkFacing: data.parkFacing || false,
        parkingSlots: data.parkingSlots || 0,
        coveredParking: data.coveredParking || false,
        furnishingStatus: data.furnishingStatus,
        amenities: Array.isArray(data.amenities)
          ? data.amenities
          : typeof data.amenities === 'string'
            ? data.amenities.split(',').map((a: string) => a.trim()).filter(Boolean)
            : [],
        specialFeatures: data.specialFeatures,
        floorPlanUrl: data.floorPlanUrl,
        images: data.images ? data.images.split(',').map((img: string) => img.trim()) : [],
        virtualTourUrl: data.virtualTourUrl,
        bookingDate: data.bookingDate,
        soldDate: data.soldDate,
        tokenAmount: data.tokenAmount,
        paymentPlan: data.paymentPlan,
        remarks: data.remarks,
        isActive: data.isActive !== false,
        displayOrder: data.displayOrder || 0,
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
      />
    </div>
  );
}
