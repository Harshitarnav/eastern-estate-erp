'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import FlatForm from '@/components/forms/FlatForm';
import { flatsService } from '@/services/flats.service';
import { propertiesService } from '@/services/properties.service';
import { towersService } from '@/services/towers.service';
import { customersService } from '@/services/customers.service';

export default function EditFlatPage() {
  const router = useRouter();
  const params = useParams();
  const flatId = params.id as string;
  
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [properties, setProperties] = useState<any[]>([]);
  const [towers, setTowers] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [initialData, setInitialData] = useState<any>(null);

  useEffect(() => {
    fetchProperties();
    fetchTowers();
    fetchCustomers();
    fetchFlat();
  }, [flatId]);

  const fetchFlat = async () => {
    try {
      const flat = await flatsService.getFlat(flatId);
      
      // Transform flat data to match form structure
      setInitialData({
        propertyId: flat.propertyId,
        towerId: flat.towerId,
        flatNumber: flat.flatNumber,
        name: flat.name || '',
        description: flat.description || '',
        type: flat.type,
        floor: flat.floor,
        bedrooms: flat.bedrooms || 0,
        bathrooms: flat.bathrooms || 0,
        balconies: flat.balconies || 0,
        servantRoom: flat.servantRoom || false,
        studyRoom: flat.studyRoom || false,
        poojaRoom: flat.poojaRoom || false,
        superBuiltUpArea: flat.superBuiltUpArea,
        builtUpArea: flat.builtUpArea,
        carpetArea: flat.carpetArea,
        balconyArea: flat.balconyArea || 0,
        basePrice: flat.basePrice,
        pricePerSqft: flat.pricePerSqft || 0,
        registrationCharges: flat.registrationCharges || 0,
        maintenanceCharges: flat.maintenanceCharges || 0,
        parkingCharges: flat.parkingCharges || 0,
        totalPrice: flat.totalPrice || flat.basePrice,
        discountAmount: flat.discountAmount || 0,
        finalPrice: flat.finalPrice,
        status: flat.status,
        isAvailable: flat.isAvailable !== false,
        availableFrom: flat.availableFrom || '',
        expectedPossession: flat.expectedPossession || '',
        facing: flat.facing || '',
        vastuCompliant: flat.vastuCompliant || false,
        cornerUnit: flat.cornerUnit || false,
        roadFacing: flat.roadFacing || false,
        parkFacing: flat.parkFacing || false,
        parkingSlots: flat.parkingSlots || 0,
        coveredParking: flat.coveredParking || false,
        furnishingStatus: flat.furnishingStatus || 'UNFURNISHED',
        amenities: Array.isArray(flat.amenities) ? flat.amenities.join(', ') : '',
        specialFeatures: flat.specialFeatures || '',
        floorPlanUrl: flat.floorPlanUrl || '',
        images: Array.isArray(flat.images) ? flat.images.join(', ') : '',
        virtualTourUrl: flat.virtualTourUrl || '',
        bookingDate: flat.bookingDate || '',
        soldDate: flat.soldDate || '',
        tokenAmount: flat.tokenAmount || 0,
        paymentPlan: flat.paymentPlan || '',
        remarks: flat.remarks || '',
        isActive: flat.isActive !== false,
        displayOrder: flat.displayOrder || 0,
        customerId: flat.customerId || '',
      });
    } catch (error) {
      console.error('Error fetching flat:', error);
      alert('Failed to load flat data');
    } finally {
      setInitialLoading(false);
    }
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
          console.error('Error creating customer:', customerError);
          alert(customerError.response?.data?.message || 'Failed to create customer');
          setLoading(false);
          return;
        }
      }

      // Transform form data to match API expectations
      const flatData: any = {
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
        vastuCompliant: data.vastuCompliant || false,
        cornerUnit: data.cornerUnit || false,
        roadFacing: data.roadFacing || false,
        parkFacing: data.parkFacing || false,
        parkingSlots: data.parkingSlots || 0,
        coveredParking: data.coveredParking || false,
        furnishingStatus: data.furnishingStatus,
        amenities: data.amenities ? data.amenities.split(',').map((a: string) => a.trim()).filter(Boolean) : [],
        specialFeatures: data.specialFeatures,
        remarks: data.remarks,
        isActive: data.isActive !== false,
        displayOrder: data.displayOrder || 0,
      };

      // Only include dates if they have values
      if (data.availableFrom) flatData.availableFrom = data.availableFrom;
      if (data.expectedPossession) flatData.expectedPossession = data.expectedPossession;
      if (data.facing) flatData.facing = data.facing;
      if (data.floorPlanUrl) flatData.floorPlanUrl = data.floorPlanUrl;
      if (data.virtualTourUrl) flatData.virtualTourUrl = data.virtualTourUrl;
      if (data.bookingDate) flatData.bookingDate = data.bookingDate;
      if (data.soldDate) flatData.soldDate = data.soldDate;
      if (data.tokenAmount) flatData.tokenAmount = data.tokenAmount;
      if (data.paymentPlan) flatData.paymentPlan = data.paymentPlan;
      
      // Handle images array
      if (data.images) {
        const imageArray = data.images.split(',').map((img: string) => img.trim()).filter(Boolean);
        if (imageArray.length > 0) flatData.images = imageArray;
      }

      if (resolvedCustomerId) {
        flatData.customerId = resolvedCustomerId;
      }

      await flatsService.updateFlat(flatId, flatData);
      alert('Flat updated successfully!');
      router.push(`/flats/${flatId}`);
    } catch (error: any) {
      console.error('Error updating flat:', error);
      alert(error.response?.data?.message || 'Failed to update flat');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push(`/flats/${flatId}`);
  };

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <FlatForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={loading}
        properties={properties}
        towers={towers}
        customers={customers}
        initialData={initialData}
        isEdit={true}
      />
    </div>
  );
}
