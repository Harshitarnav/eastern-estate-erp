'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PropertyForm from '@/components/forms/PropertyForm';
import { propertiesService } from '@/services/properties.service';

export default function NewPropertyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: any) => {
    setLoading(true);
    try {
      // Transform form data to match API expectations
      const propertyData = {
        name: data.projectName,
        propertyCode: data.projectCode,
        type: data.projectType,
        description: data.description,
        address: data.address,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        country: 'India',
        location: data.nearbyLandmarks,
        totalArea: data.totalArea,
        builtUpArea: data.totalArea,
        numberOfTowers: data.totalTowers,
        numberOfUnits: data.totalUnits,
        floorsPerTower: data.floorsPerTower,
        amenities: data.amenities ? data.amenities.split(',').map((a: string) => a.trim()) : [],
        reraNumber: data.reraNumber,
        launchDate: data.launchDate,
        expectedCompletionDate: data.possessionDate,
        status: data.status === 'active' ? 'AVAILABLE' : 
                data.status === 'under_construction' ? 'UNDER_CONSTRUCTION' :
                data.status === 'completed' ? 'COMPLETED' : 'PLANNING',
        priceMin: data.priceMin,
        priceMax: data.priceMax,
        isActive: data.isActive !== false,
      };

      await propertiesService.createProperty(propertyData);
      alert('Property created successfully!');
      router.push('/properties');
    } catch (error: any) {
      console.error('Error creating property:', error);
      alert(error.response?.data?.message || 'Failed to create property');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/properties');
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <PropertyForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={loading}
      />
    </div>
  );
}
