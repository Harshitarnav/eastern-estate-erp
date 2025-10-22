'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/services/api';

export default function ConstructionProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterProperty, setFilterProperty] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [projectsRes, propertiesRes] = await Promise.all([
        api.get('/construction-projects'),
        api.get('/properties')
      ]);
      setProjects(projectsRes.data || []);
      setProperties(propertiesRes.data || []);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: any = {
      'PLANNING': 'bg-blue-100 text-blue-800',
      'IN_PROGRESS': 'bg-green-100 text-green-800',
      'ON_HOLD': 'bg-yellow-100 text-yellow-800',
      'COMPLETED': 'bg-purple-100 text-purple-800',
      'CANCELLED': 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: string) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const filteredProjects = projects.filter(project => {
    const matchesProperty = !filterProperty || project.propertyId === filterProperty;
    const matchesStatus = !filterStatus || project.status === filterStatus;
    const matchesSearch = !searchTerm || 
      project.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.property?.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesProperty && matchesStatus && matchesSearch;
  });

  const stats = {
    total: projects.length,
    planning: projects.filter(p => p.status === 'PLANNING').length,
    inProgress: projects.filter(p => p.status === 'IN_PROGRESS').length,
    onHold: projects.filter(p => p.status === 'ON_HOLD').length,
    completed: projects.filter(p => p.status === 'COMPLETED').length,
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: '#A8211B' }}>
              🏗️ Construction Projects
            </h1>
            <p className="text-gray-600">Manage all construction projects and track progress</p>
          </div>
          <button
            onClick={() => router.push('/construction/projects/new')}
            className="px-6 py-3 text-white rounded-lg font-medium hover:opacity-90 flex items-center gap-2"
            style={{ backgroundColor: '#A8211B' }}
          >
            <span className="text-xl">+</span> New Project
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600 mb-1">Total Projects</p>
            <p className="text-2xl font-bold" style={{ color: '#A8211B' }}>{stats.total}</p>
          </div>
          <div className="bg-blue-50 rounded-lg shadow p-4">
            <p className="text-sm text-blue-600 mb-1">Planning</p>
            <p className="text-2xl font-bold text-blue-700">{stats.planning}</p>
          </div>
          <div className="bg-green-50 rounded-lg shadow p-4">
            <p className="text-sm text-green-600 mb-1">In Progress</p>
            <p className="text-2xl font-bold text-green-700">{stats.inProgress}</p>
          </div>
          <div className="bg-yellow-50 rounded-lg shadow p-4">
            <p className="text-sm text-yellow-600 mb-1">On Hold</p>
            <p className="text-2xl font-bold text-yellow-700">{stats.onHold}</p>
          </div>
          <div className="bg-purple-50 rounded-lg shadow p-4">
            <p className="text-sm text-purple-600 mb-1">Completed</p>
            <p className="text-2xl font-bold text-purple-700">{stats.completed}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Projects
              </label>
              <input
                type="text"
                placeholder="Search by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Property
              </label>
              <select
                value={filterProperty}
                onChange={(e) => setFilterProperty(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="">All Properties</option>
                {properties.map(property => (
                  <option key={property.id} value={property.id}>
                    {property.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="">All Statuses</option>
                <option value="PLANNING">Planning</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="ON_HOLD">On Hold</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Projects List */}
      <div className="bg-white rounded-lg shadow">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading projects...</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-4xl mb-4">🏗️</p>
            <p className="text-gray-600 mb-4">
              {projects.length === 0 
                ? "No projects found. Create your first project!" 
                : "No projects match your filters."}
            </p>
            {projects.length === 0 && (
              <button
                onClick={() => router.push('/construction/projects/new')}
                className="px-6 py-2 text-white rounded-lg"
                style={{ backgroundColor: '#A8211B' }}
              >
                Create First Project
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                onClick={() => router.push(`/construction/projects/${project.id}`)}
                className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      {project.projectName}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {project.property?.name}
                      {project.tower && ` - ${project.tower.name}`}
                      {project.flat && ` - Flat ${project.flat.flatNumber}`}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
                    {project.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Progress</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full"
                          style={{
                            width: `${project.overallProgress}%`,
                            backgroundColor: '#A8211B'
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium">{project.overallProgress}%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Start Date</p>
                    <p className="text-sm font-medium">{formatDate(project.startDate)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Expected Completion</p>
                    <p className="text-sm font-medium">{formatDate(project.expectedCompletionDate)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Budget Status</p>
                    <p className="text-sm font-medium">
                      {formatCurrency(project.budgetSpent)} / {formatCurrency(project.budgetAllocated)}
                    </p>
                  </div>
                </div>

                {project.projectManager && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs text-gray-500">
                      Project Manager: <span className="font-medium text-gray-700">
                        {project.projectManager.firstName} {project.projectManager.lastName}
                      </span>
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
