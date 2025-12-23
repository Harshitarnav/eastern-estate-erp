'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PropertyForm from '@/components/forms/PropertyForm';
import { propertiesService } from '@/services/properties.service';
import { projectsService, Project } from '@/services/projects.service';
import { mapPropertyFormToPayload } from '@/utils/forms/property';

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

  const handleSubmit = async (data: any) => {
    setLoading(true);
    try {
      await propertiesService.createProperty(mapPropertyFormToPayload(data));
      alert('Property created successfully!');
      window.location.href = '/properties';
    } catch (error: any) {
      console.error('Error creating property:', error);
      alert(error.response?.data?.message || 'Failed to create property');
      throw error; // throw the error to let the form handle it if needed
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
