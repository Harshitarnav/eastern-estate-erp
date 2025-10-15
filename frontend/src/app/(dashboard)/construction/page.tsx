'use client';

import { useState, useEffect } from 'react';
import { Building2, Plus, Search, TrendingUp, AlertTriangle, CheckCircle, Clock, Users } from 'lucide-react';
import { constructionService, ConstructionProject, ConstructionFilters } from '@/services/construction.service';

export default function ConstructionPage() {
  const [projects, setProjects] = useState<ConstructionProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState<ConstructionFilters>({
    page: 1,
    limit: 12,
    isActive: true,
  });
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 0,
  });

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await constructionService.getProjects(filters);
      setProjects(response.data);
      setMeta(response.meta);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch construction projects');
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [filters]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete project "${name}"?`)) {
      return;
    }

    try {
      await constructionService.deleteProject(id);
      fetchProjects();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete project');
    }
  };

  const handleUpdateProgress = async (id: string, projectName: string) => {
    const phase = prompt('Enter phase (e.g., FOUNDATION, STRUCTURE, FINISHING):');
    if (!phase) return;

    const progressStr = prompt(`Enter progress for ${phase} (0-100):`);
    if (!progressStr) return;

    const progress = parseFloat(progressStr);
    if (isNaN(progress) || progress < 0 || progress > 100) {
      alert('Please enter a valid progress (0-100)');
      return;
    }

    try {
      await constructionService.updateProgress(id, phase.toUpperCase(), progress);
      fetchProjects();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update progress');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return '#10B981';
      case 'IN_PROGRESS':
        return '#3B82F6';
      case 'DELAYED':
        return '#EF4444';
      case 'ON_HOLD':
        return '#F2C94C';
      case 'NOT_STARTED':
        return '#6B7280';
      default:
        return '#6B7280';
    }
  };

  const getPhaseEmoji = (phase: string) => {
    const emojiMap: Record<string, string> = {
      PLANNING: '📋',
      SITE_PREPARATION: '🏗️',
      FOUNDATION: '⚒️',
      STRUCTURE: '🏢',
      MASONRY: '🧱',
      ROOFING: '🏠',
      PLUMBING: '🚰',
      ELECTRICAL: '⚡',
      PLASTERING: '🎨',
      FLOORING: '📏',
      PAINTING: '🖌️',
      FINISHING: '✨',
      LANDSCAPING: '🌳',
      HANDOVER: '🤝',
      COMPLETED: '✅',
    };
    return emojiMap[phase] || '🏗️';
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ');
  };

  const formatPhase = (phase: string) => {
    return phase.replace(/_/g, ' ');
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`;
    return `₹${(amount / 1000).toFixed(0)}K`;
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Building2 className="h-8 w-8" style={{ color: '#A8211B' }} />
          <h1 className="text-3xl font-bold" style={{ color: '#7B1E12' }}>
            Construction Projects
          </h1>
        </div>
        <p className="text-gray-600">
          Track construction progress, milestones, and manage contractors.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search projects..."
                value={filters.search || ''}
                onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
              />
            </div>
          </div>

          <select
            value={filters.projectStatus || ''}
            onChange={(e) => setFilters({ ...filters, projectStatus: e.target.value || undefined, page: 1 })}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
          >
            <option value="">All Status</option>
            <option value="NOT_STARTED">Not Started</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="ON_HOLD">On Hold</option>
            <option value="DELAYED">Delayed</option>
            <option value="COMPLETED">Completed</option>
          </select>

          <select
            value={filters.projectPhase || ''}
            onChange={(e) => setFilters({ ...filters, projectPhase: e.target.value || undefined, page: 1 })}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
          >
            <option value="">All Phases</option>
            <option value="PLANNING">Planning</option>
            <option value="FOUNDATION">Foundation</option>
            <option value="STRUCTURE">Structure</option>
            <option value="FINISHING">Finishing</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>

        <div className="flex gap-4">
          <div className="flex-1"></div>
          <button
            onClick={() => alert('Add Project form - Coming soon')}
            className="px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            style={{ backgroundColor: '#A8211B', color: 'white' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#7B1E12'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#A8211B'}
          >
            <Plus className="h-5 w-5" />
            <span>New Project</span>
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#A8211B' }}></div>
            <p className="text-gray-600">Loading projects...</p>
          </div>
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <Building2 className="h-16 w-16 mx-auto mb-4" style={{ color: '#A8211B', opacity: 0.5 }} />
          <h3 className="text-xl font-semibold mb-2" style={{ color: '#7B1E12' }}>
            No Projects Found
          </h3>
          <p className="text-gray-600 mb-6">
            {filters.search || filters.projectStatus || filters.projectPhase
              ? 'No projects match your search criteria.'
              : 'Start by creating your first construction project.'}
          </p>
          <button
            onClick={() => alert('Add Project form - Coming soon')}
            className="px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center gap-2"
            style={{ backgroundColor: '#A8211B', color: 'white' }}
          >
            <Plus className="h-5 w-5" />
            <span>Create First Project</span>
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
              >
                <div className="p-4" style={{ backgroundColor: '#FEF3E2' }}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">{getPhaseEmoji(project.projectPhase)}</span>
                        <h3 className="text-lg font-bold" style={{ color: '#7B1E12' }}>
                          {project.projectName}
                        </h3>
                      </div>
                      <p className="text-sm text-gray-600">{project.projectCode}</p>
                    </div>
                    <div
                      className="px-3 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: `${getStatusColor(project.projectStatus)}20`,
                        color: getStatusColor(project.projectStatus),
                      }}
                    >
                      {formatStatus(project.projectStatus)}
                    </div>
                  </div>
                  <div className="text-xs text-gray-600">
                    {formatPhase(project.projectPhase)}
                  </div>
                </div>

                <div className="p-4">
                  {/* Overall Progress */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                      <span className="text-xl font-bold" style={{ color: '#A8211B' }}>
                        {project.overallProgress.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="h-3 rounded-full transition-all"
                        style={{
                          width: `${project.overallProgress}%`,
                          backgroundColor: '#A8211B',
                        }}
                      />
                    </div>
                  </div>

                  {/* Key Metrics Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-4 pb-4 border-b">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Budget</div>
                      <div className="text-sm font-semibold" style={{ color: '#3DA35D' }}>
                        {formatCurrency(project.estimatedBudget)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Actual Cost</div>
                      <div className="text-sm font-semibold" style={{ 
                        color: project.actualCost > project.estimatedBudget ? '#EF4444' : '#3DA35D' 
                      }}>
                        {formatCurrency(project.actualCost)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Workers</div>
                      <div className="text-sm font-semibold flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {project.workersCount}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Inspections</div>
                      <div className="text-sm font-semibold">
                        {project.passedInspections}/{project.totalInspections}
                      </div>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="mb-4 text-xs text-gray-600 space-y-1">
                    <div className="flex justify-between">
                      <span>Start Date:</span>
                      <span className="font-medium">
                        {new Date(project.plannedStartDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>End Date:</span>
                      <span className="font-medium">
                        {new Date(project.plannedEndDate).toLocaleDateString()}
                      </span>
                    </div>
                    {project.delayDays > 0 && (
                      <div className="flex justify-between text-red-600">
                        <span>Delay:</span>
                        <span className="font-medium flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          {project.delayDays} days
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Contractor Info */}
                  {project.mainContractorName && (
                    <div className="mb-4 text-xs text-gray-600">
                      <strong>Contractor:</strong> {project.mainContractorName}
                    </div>
                  )}

                  {/* Safety & Permits Status */}
                  <div className="flex gap-2 mb-4">
                    <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${
                      project.safetyCompliant ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {project.safetyCompliant ? <CheckCircle className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                      <span>Safety</span>
                    </div>
                    <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${
                      project.allPermitsObtained ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {project.allPermitsObtained ? <CheckCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                      <span>Permits</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdateProgress(project.id, project.projectName)}
                      className="flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                      style={{ backgroundColor: '#3DA35D', color: 'white' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2D8A4A'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3DA35D'}
                    >
                      <TrendingUp className="h-4 w-4" />
                      <span>Update Progress</span>
                    </button>
                    <button
                      onClick={() => alert(`View project: ${project.id}`)}
                      className="flex-1 px-3 py-2 border rounded-lg text-sm font-medium transition-colors"
                      style={{ borderColor: '#A8211B', color: '#A8211B' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FEF3E2'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {meta.totalPages > 1 && (
            <div className="flex justify-center items-center gap-2">
              <button
                onClick={() => setFilters({ ...filters, page: Math.max(1, (filters.page || 1) - 1) })}
                disabled={(filters.page || 1) === 1}
                className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ borderColor: '#A8211B', color: '#A8211B' }}
              >
                Previous
              </button>
              <span className="text-gray-600">
                Page {meta.page} of {meta.totalPages}
              </span>
              <button
                onClick={() => setFilters({ ...filters, page: Math.min(meta.totalPages, (filters.page || 1) + 1) })}
                disabled={(filters.page || 1) === meta.totalPages}
                className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ borderColor: '#A8211B', color: '#A8211B' }}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Brand Footer */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          Eastern Estate ERP • Building Homes, Nurturing Bonds
        </p>
      </div>
    </div>
  );
}
