'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import FlatForm from '@/components/forms/FlatForm';
import { flatsService } from '@/services/flats.service';
import { propertiesService } from '@/services/properties.service';
import { towersService } from '@/services/towers.service';

export default function NewFlatPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState<any[]>([]);
  const [towers, setTowers] = useState<any[]>([]);

  useEffect(() => {
    fetchProperties();
    fetchTowers();
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

  const handleSubmit = async (data: any) => {
    setLoading(true);
    try {
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
        amenities: data.amenities ? data.amenities.split(',').map((a: string) => a.trim()) : [],
        specialFeatures: data.specialFeatures,
        remarks: data.remarks,
        isActive: data.isActive !== false,
        displayOrder: data.displayOrder || 0,
      };

      await flatsService.createFlat(flatData);
      alert('Flat created successfully!');
      router.push('/flats');
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
      />
    </div>
  );
}
