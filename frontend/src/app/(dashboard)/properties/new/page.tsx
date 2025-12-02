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
        console.error('Error loading projects:', error);
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
      if (!data.projectId) {
        alert('Please select a project before creating the property.');
        setLoading(false);
        return;
      }

      const propertyData: CreatePropertyDto = {
        projectId: data.projectId,
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
      {projects.length === 0 ? (
        <div className="max-w-2xl mx-auto bg-white shadow rounded-2xl border p-8 space-y-4 text-center">
          <h1 className="text-2xl font-semibold text-gray-900">Create a project first</h1>
          <p className="text-gray-600">
            Properties must belong to a project. Please create a project, then add a property.
          </p>
          <div className="flex justify-center gap-3 pt-4">
            <button
              onClick={() => window.location.href = '/construction/projects/new'}
              className="px-4 py-2 rounded-full bg-blue-600 text-white font-medium hover:bg-blue-700"
            >
              Go to Projects
            </button>
            <button
              onClick={() => window.location.href = '/properties'}
              className="px-4 py-2 rounded-full border text-gray-700 hover:bg-gray-50"
            >
              Back to Properties
            </button>
          </div>
        </div>
      ) : (
        <PropertyForm
          projects={projects}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={loading}
        />
      )}
    </div>
  );
}
