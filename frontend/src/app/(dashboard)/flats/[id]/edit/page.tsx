'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import FlatForm from '@/components/forms/FlatForm';
import { flatsService } from '@/services/flats.service';
import { propertiesService } from '@/services/properties.service';
import { towersService } from '@/services/towers.service';
import { customersService } from '@/services/customers.service';
import { mapFlatFormToPayload } from '@/utils/forms/flat';
import { FormSkeleton } from '@/components/Skeletons';
import { toast } from 'sonner';
import { showApiError } from '@/utils/error-handler';

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
        // Statuses & dates
        agreementDate: flat.agreementDate || '',
        registrationDate: flat.registrationDate || '',
        handoverDate: flat.handoverDate || '',
        loanStatus: flat.loanStatus || '',
        handoverStatus: flat.handoverStatus || '',
        verificationStatus: flat.verificationStatus || '',
        // Assignments & extras
        salespersonId: flat.salespersonId || '',
        serviceContactId: flat.serviceContactId || '',
        coBuyerName: flat.coBuyerName || '',
        coBuyerEmail: flat.coBuyerEmail || '',
        coBuyerPhone: flat.coBuyerPhone || '',
        parkingNumber: flat.parkingNumber || '',
        parkingType: flat.parkingType || '',
        storageId: flat.storageId || '',
        furnishingPack: flat.furnishingPack || '',
        appliancePack: flat.appliancePack || false,
      });
    } catch (error) {
      console.error('Error fetching flat:', error);
      toast.error('Failed to load flat data');
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
    /** Customer created in this submit only — rollback (soft-delete) if flat save fails */
    let createdCustomerIdForRollback: string | null = null;

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
          toast.error('Please provide first name, last name, email, and phone to create a customer.');
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
            propertyId: data.propertyId || undefined,
          });
          resolvedCustomerId = createdCustomer.id;
          createdCustomerIdForRollback = createdCustomer.id;
          await fetchCustomers();
        } catch (customerError: any) {
          console.error('Error creating customer:', customerError);
          showApiError(customerError, 'Failed to create customer');
          setLoading(false);
          return;
        }
      }

      const flatData: any = {
        ...mapFlatFormToPayload(data),
      };

      if (resolvedCustomerId) {
        flatData.customerId = resolvedCustomerId;
      }
      if (data.customerId) {
        flatData.customerId = data.customerId;
      }

      await flatsService.updateFlat(flatId, flatData);
      toast.success('Flat updated successfully');
      window.location.href = '/flats';
    } catch (error: any) {
      console.error('Error updating flat:', error);
      if (createdCustomerIdForRollback) {
        try {
          await customersService.deleteCustomer(createdCustomerIdForRollback);
        } catch (delErr) {
          console.error('Rollback customer failed:', delErr);
        }
        toast.message('Flat was not saved. The new customer record was removed.');
      }
      showApiError(error, 'Failed to update flat');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push(`/flats/${flatId}`);
  };

  if (initialLoading) {
    return <FormSkeleton fields={12} />;
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
