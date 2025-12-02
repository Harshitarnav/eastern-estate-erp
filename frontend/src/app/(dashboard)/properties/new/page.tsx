'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PropertyForm from '@/components/forms/PropertyForm';
import { propertiesService, CreatePropertyDto } from '@/services/properties.service';
import { projectsService, Project } from '@/services/projects.service';

export default function NewPropertyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const response = await projectsService.getProjects({ limit: 100 });
        setProjects(response.data ?? []);
      } catch (error) {
        console.error('Error loading projects (optional):', error);
        setProjects([]);
      }
    })();
  }, []);

  const toNumber = (value: any): number | undefined => {
    if (value === null || value === undefined || value === '') {
      return undefined;
    }
    const parsed = Number(value);
    return Number.isNaN(parsed) ? undefined : parsed;
  };

  const toArray = (value: any): string[] => {
    if (!value) {
      return [];
    }
    if (Array.isArray(value)) {
      return value;
    }
    return String(value)
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  };

  const handleSubmit = async (data: any) => {
    setLoading(true);
    try {
      const propertyData: CreatePropertyDto = {
        projectId: data.projectId || undefined,
        propertyCode: data.propertyCode,
        name: data.name,
        description: data.description,
        country: data.country || 'India',
        address: data.address,
        location: data.location,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        nearbyLandmarks: data.nearbyLandmarks,
        projectType: data.projectType,
        propertyType: data.projectType,
        status: data.status || 'Active',
        amenities: toArray(data.amenities),
        bhkTypes: toArray(data.bhkTypes),
        totalArea: toNumber(data.totalArea),
        builtUpArea: toNumber(data.builtUpArea ?? data.totalArea),
        areaUnit: data.areaUnit,
        numberOfTowers: toNumber(data.numberOfTowers),
        numberOfUnits: toNumber(data.numberOfUnits),
        floorsPerTower: data.floorsPerTower,
        reraNumber: data.reraNumber,
        reraStatus: data.reraStatus,
        launchDate: data.launchDate || undefined,
        expectedCompletionDate: data.expectedCompletionDate || undefined,
        actualCompletionDate: data.actualCompletionDate || undefined,
        priceMin: toNumber(data.priceMin),
        priceMax: toNumber(data.priceMax),
        expectedRevenue: toNumber(data.expectedRevenue),
        isActive: data.isActive !== false,
        isFeatured: data.isFeatured === true,
      };

      await propertiesService.createProperty(propertyData);
      alert('Property created successfully!');
      window.location.href = '/properties';
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
        projects={projects}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={loading}
      />
    </div>
  );
}
