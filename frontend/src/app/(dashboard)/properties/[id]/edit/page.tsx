'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import PropertyForm from '@/components/forms/PropertyForm';
import { propertiesService, Property } from '@/services/properties.service';
import { projectsService, Project } from '@/services/projects.service';
import { mapPropertyFormToPayload } from '@/utils/forms/property';

export default function EditPropertyPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const propertyId = params?.id;

  const [projects, setProjects] = useState<Project[]>([]);
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!propertyId) {
        setError('Invalid property identifier provided.');
        setInitialLoading(false);
        return;
      }

      try {
        setInitialLoading(true);
        const [projectsResponse, propertyResponse] = await Promise.all([
          projectsService.getProjects({ limit: 100 }),
          propertiesService.getPropertyById(propertyId),
        ]);

        setProjects(projectsResponse.data ?? []);
        setProperty(propertyResponse);
      } catch (err) {
        console.error('Error loading property details:', err);
        setError('Unable to load property details. Please try again later.');
      } finally {
        setInitialLoading(false);
      }
    };

    loadData();
  }, [propertyId]);

  const handleSubmit = async (data: any) => {
    if (!propertyId) {
      alert('Invalid property identifier.');
      return;
    }

    setLoading(true);
    try {
      const payloadData = {
        ...data,
        projectId: data.projectId || property?.projectId || undefined,
      };
      await propertiesService.updateProperty(propertyId, mapPropertyFormToPayload(payloadData));
      alert('Property updated successfully!');
      window.location.href = '/properties';
    } catch (err: any) {
      console.error('Error updating property:', err);
      alert(err.response?.data?.message || 'Failed to update property');
    } finally {
      setLoading(false);
    }
  };

  const projectOptions = useMemo(() => {
    if (!property?.projectId) {
      return projects;
    }

    const exists = ((projects || [])).some((project) => project.id === property.projectId);
    if (exists) {
      return projects;
    }

    return [
      ...projects,
      {
        id: property.projectId,
        name: property.projectName ?? 'Current Project',
        projectCode: property.projectCode ?? property.projectId.slice(0, 8),
        isActive: true,
        createdAt: property.createdAt,
        updatedAt: property.updatedAt,
      } as Project,
    ];
  }, [projects, property]);

  const handleCancel = () => {
    router.push('/properties');
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-600">Loading property details...</p>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-4">
        <p className="text-lg font-semibold text-red-600">{error ?? 'Property not found.'}</p>
        <button
          onClick={() => router.push('/properties')}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700"
        >
          Back to Properties
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <PropertyForm
        initialData={property}
        projects={projectOptions}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={loading}
      />
    </div>
  );
}
