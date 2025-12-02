'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/services/api';

export default function NewConstructionProjectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState<any[]>([]);
  const [towers, setTowers] = useState<any[]>([]);
  const [flats, setFlats] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    propertyId: '',
    towerId: '',
    flatId: '',
    projectName: '',
    startDate: '',
    expectedCompletionDate: '',
    status: 'PLANNING',
    budgetAllocated: '',
    projectManagerId: '',
  });

  useEffect(() => {
    loadProperties();
    loadEmployees();
  }, []);

  useEffect(() => {
    if (formData.propertyId) {
      loadTowers(formData.propertyId);
    }
  }, [formData.propertyId]);

  useEffect(() => {
    if (formData.towerId) {
      loadFlats(formData.towerId);
    }
  }, [formData.towerId]);

  const loadProperties = async () => {
    try {
      const response = await api.get('/properties');
      setProperties(response.data || []);
    } catch (error) {
      console.error('Failed to load properties:', error);
    }
  };

  const loadTowers = async (propertyId: string) => {
    try {
      const response = await api.get(`/towers?propertyId=${propertyId}`);
      setTowers(response.data || []);
    } catch (error) {
      console.error('Failed to load towers:', error);
    }
  };

  const loadFlats = async (towerId: string) => {
    try {
      const response = await api.get(`/flats?towerId=${towerId}`);
      setFlats(response.data || []);
    } catch (error) {
      console.error('Failed to load flats:', error);
    }
  };

  const loadEmployees = async () => {
    try {
      const response = await api.get('/employees');
      setEmployees(response.data || []);
    } catch (error) {
      console.error('Failed to load employees:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        propertyId: formData.propertyId || undefined,
        towerId: formData.towerId || null,
        flatId: formData.flatId || null,
        projectManagerId: formData.projectManagerId || null,
        budgetAllocated: parseFloat(formData.budgetAllocated) || 0,
      };

      console.log('Submitting construction project:', submitData);
      const response = await api.post('/construction-projects', submitData);
      console.log('Project created successfully:', response.data);
      alert('Construction project created successfully!');
      // Force a hard reload to ensure data is refreshed
      window.location.href = '/construction/projects';
    } catch (error: any) {
      console.error('Failed to create project:', error);
      console.error('Error details:', error.response?.data);
      const errorMessage = error.response?.data?.message 
        || (Array.isArray(error.response?.data?.message) 
          ? error.response.data.message.join(', ') 
          : 'Failed to create project');
      alert(`Error: ${errorMessage}`);
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold" style={{ color: '#A8211B' }}>
          🏗️ Create New Construction Project
        </h1>
        <p className="text-gray-600">Fill in the details to create a new construction project</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6 max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Property Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Property (optional)
            </label>
            <select
              name="propertyId"
              value={formData.propertyId}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="">No property yet</option>
              {((properties || [])).map(property => (
                <option key={property.id} value={property.id}>
                  {property.name}
                </option>
              ))}
            </select>
          </div>

          {/* Tower Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tower (Optional)
            </label>
            <select
              name="towerId"
              value={formData.towerId}
              onChange={handleChange}
              disabled={!formData.propertyId}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:bg-gray-100"
            >
              <option value="">Select Tower</option>
              {((towers || [])).map(tower => (
                <option key={tower.id} value={tower.id}>
                  {tower.name}
                </option>
              ))}
            </select>
          </div>

          {/* Flat Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Flat (Optional)
            </label>
            <select
              name="flatId"
              value={formData.flatId}
              onChange={handleChange}
              disabled={!formData.towerId}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:bg-gray-100"
            >
              <option value="">Select Flat</option>
              {((flats || [])).map(flat => (
                <option key={flat.id} value={flat.id}>
                  {flat.flatNumber} - {flat.bhkType}
                </option>
              ))}
            </select>
          </div>

          {/* Project Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="projectName"
              value={formData.projectName}
              onChange={handleChange}
              required
              placeholder="e.g., Tower A Construction"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          {/* Expected Completion Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expected Completion Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="expectedCompletionDate"
              value={formData.expectedCompletionDate}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="PLANNING">Planning</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="ON_HOLD">On Hold</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          {/* Budget Allocated */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Budget Allocated (₹)
            </label>
            <input
              type="number"
              name="budgetAllocated"
              value={formData.budgetAllocated}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          {/* Project Manager */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Manager
            </label>
            <select
              name="projectManagerId"
              value={formData.projectManagerId}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="">Select Project Manager</option>
              {((employees || [])).map(employee => (
                <option key={employee.id} value={employee.id}>
                  {employee.firstName} {employee.lastName} - {employee.position}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 mt-8">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 text-white rounded-lg hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: '#A8211B' }}
          >
            {loading ? 'Creating...' : 'Create Project'}
          </button>
        </div>
      </form>
    </div>
  );
}
