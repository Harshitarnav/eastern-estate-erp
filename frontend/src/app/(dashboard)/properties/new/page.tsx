'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PropertyForm from '@/components/forms/PropertyForm';
import { propertiesService, CreatePropertyDto } from '@/services/properties.service';
import { projectsService, Project, CreateProjectDto } from '@/services/projects.service';

export default function NewPropertyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [projectsError, setProjectsError] = useState<string | null>(null);
  const [projectForm, setProjectForm] = useState({
    name: '',
    projectCode: '',
    status: 'Active',
    city: '',
    state: '',
  });
  const [createProjectLoading, setCreateProjectLoading] = useState(false);
  const [createProjectError, setCreateProjectError] = useState<string | null>(null);
  const [createProjectSuccess, setCreateProjectSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setProjectsLoading(true);
        const response = await projectsService.getProjects({ limit: 100 });
        setProjects(response.data ?? []);
      } catch (error) {
        console.error('Error loading projects:', error);
        setProjectsError('Unable to load projects. Please create a project first.');
      } finally {
        setProjectsLoading(false);
      }
    };

    fetchProjects();
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
    if (!data.projectId) {
      alert('Please select a project before creating the property.');
      return;
    }

    setLoading(true);
    try {
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

  const handleCreateProject = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!projectForm.name.trim() || !projectForm.projectCode.trim()) {
      setCreateProjectError('Project name and code are required.');
      return;
    }

    const payload: CreateProjectDto = {
      projectCode: projectForm.projectCode.trim(),
      name: projectForm.name.trim(),
      status: projectForm.status || 'Active',
      city: projectForm.city.trim() || undefined,
      state: projectForm.state.trim() || undefined,
      country: 'India',
      isActive: true,
    };

    setCreateProjectLoading(true);
    setCreateProjectError(null);
    setCreateProjectSuccess(null);

    try {
      const newProject = await projectsService.createProject(payload);
      setProjects((prev) => [...prev, newProject]);
      setCreateProjectSuccess(`Project "${newProject.name}" created successfully.`);
      setProjectForm({
        name: '',
        projectCode: '',
        status: 'Active',
        city: '',
        state: '',
      });
    } catch (error: any) {
      console.error('Error creating project:', error);
      const message =
        error?.response?.data?.message ??
        (Array.isArray(error?.response?.data?.errors)
          ? error.response.data.errors.join(', ')
          : 'Failed to create project. Please try again.');
      setCreateProjectError(message);
    } finally {
      setCreateProjectLoading(false);
    }
  };

  if (projectsLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-600">Loading projects...</p>
      </div>
    );
  }

  if ((projects || []).length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 space-y-8">
        <div className="text-center space-y-3">
          <h1 className="text-2xl font-semibold text-gray-900">
            Let&apos;s create your first project
          </h1>
          <p className="text-gray-600">
            Properties live inside projects. Create one quick project to get started, then you can add properties instantly.
          </p>
          {projectsError && (
            <p className="text-sm text-red-600">{projectsError}</p>
          )}
        </div>

        <form
          onSubmit={handleCreateProject}
          className="bg-white shadow-sm rounded-2xl border p-6 space-y-5"
        >
          <div className="grid grid-cols-1 gap-4">
            <label className="text-left">
              <span className="text-sm font-medium text-gray-700">Project Name</span>
              <input
                type="text"
                value={projectForm.name}
                onChange={(event) =>
                  setProjectForm((prev) => ({ ...prev, name: event.target.value }))
                }
                className="mt-1 w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Sunrise Residency"
                required
              />
            </label>

            <label className="text-left">
              <span className="text-sm font-medium text-gray-700">Project Code</span>
              <input
                type="text"
                value={projectForm.projectCode}
                onChange={(event) =>
                  setProjectForm((prev) => ({ ...prev, projectCode: event.target.value }))
                }
                className="mt-1 w-full rounded-lg border px-3 py-2 uppercase tracking-wide focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="EE-PROJ-001"
                required
              />
            </label>

            <label className="text-left">
              <span className="text-sm font-medium text-gray-700">Status</span>
              <select
                value={projectForm.status}
                onChange={(event) =>
                  setProjectForm((prev) => ({ ...prev, status: event.target.value }))
                }
                className="mt-1 w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Active">Active</option>
                <option value="Planning">Planning</option>
                <option value="Under Construction">Under Construction</option>
                <option value="Completed">Completed</option>
              </select>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="text-left">
                <span className="text-sm font-medium text-gray-700">City</span>
                <input
                  type="text"
                  value={projectForm.city}
                  onChange={(event) =>
                    setProjectForm((prev) => ({ ...prev, city: event.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ranchi"
                />
              </label>

              <label className="text-left">
                <span className="text-sm font-medium text-gray-700">State</span>
                <input
                  type="text"
                  value={projectForm.state}
                  onChange={(event) =>
                    setProjectForm((prev) => ({ ...prev, state: event.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Jharkhand"
                />
              </label>
            </div>
          </div>

          {createProjectError && (
            <p className="text-sm text-red-600">{createProjectError}</p>
          )}
          {createProjectSuccess && (
            <p className="text-sm text-green-600">{createProjectSuccess}</p>
          )}

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => router.push('/properties')}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Back to properties
            </button>
            <button
              type="submit"
              disabled={createProjectLoading}
              className="inline-flex items-center px-4 py-2 rounded-full bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-60"
            >
              {createProjectLoading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    );
  }

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
