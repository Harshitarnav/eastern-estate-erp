'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { api } from '@/services/api';

export default function ProjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (projectId) {
      loadProject();
    }
  }, [projectId]);

  const loadProject = async () => {
    try {
      const response = await api.get(`/construction-projects/${projectId}`);
      setProject(response.data);
    } catch (error) {
      console.error('Failed to load project:', error);
      alert('Failed to load project details');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/construction-projects/${projectId}`);
      alert('Project deleted successfully');
      router.push('/construction/projects');
    } catch (error) {
      console.error('Failed to delete project:', error);
      alert('Failed to delete project');
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

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading project details...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-gray-600">Project not found</p>
          <button
            onClick={() => router.push('/construction/projects')}
            className="mt-4 px-4 py-2 text-white rounded-lg"
            style={{ backgroundColor: '#A8211B' }}
          >
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push('/construction/projects')}
          className="text-gray-600 hover:text-gray-900 mb-4 flex items-center"
        >
          ← Back to Projects
        </button>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: '#A8211B' }}>
              {project.projectName}
            </h1>
            <p className="text-gray-600 mt-1">
              {project.property?.name} {project.tower ? `- ${project.tower.name}` : ''} 
              {project.flat ? `- Flat ${project.flat.flatNumber}` : ''}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => router.push(`/construction/projects/${projectId}/edit`)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              ✏️ Edit
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              🗑️ Delete
            </button>
          </div>
        </div>
      </div>

      {/* Status Card */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-1">Status</p>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
              {project.status.replace('_', ' ')}
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Progress</p>
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
            <p className="text-sm text-gray-600 mb-1">Budget Allocated</p>
            <p className="text-lg font-bold text-gray-900">
              {formatCurrency(project.budgetAllocated)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Budget Spent</p>
            <p className="text-lg font-bold text-gray-900">
              {formatCurrency(project.budgetSpent)}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-lg">
        <div className="border-b">
          <div className="flex gap-4 px-6">
            {[
              { id: 'overview', label: 'Overview', icon: '📋' },
              { id: 'progress', label: 'Progress Logs', icon: '📊' },
              { id: 'materials', label: 'Materials', icon: '🧱' },
              { id: 'team', label: 'Team', icon: '👥' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 border-b-2 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'border-red-600 text-red-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-bold mb-4" style={{ color: '#A8211B' }}>
                    Project Details
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Start Date</p>
                      <p className="font-medium">{formatDate(project.startDate)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Expected Completion</p>
                      <p className="font-medium">{formatDate(project.expectedCompletionDate)}</p>
                    </div>
                    {project.actualCompletionDate && (
                      <div>
                        <p className="text-sm text-gray-600">Actual Completion</p>
                        <p className="font-medium">{formatDate(project.actualCompletionDate)}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-gray-600">Project Manager</p>
                      <p className="font-medium">
                        {project.projectManager
                          ? `${project.projectManager.firstName} ${project.projectManager.lastName}`
                          : 'Not Assigned'}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold mb-4" style={{ color: '#A8211B' }}>
                    Budget Overview
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-600">Budget Utilization</span>
                        <span className="text-sm font-medium">
                          {((project.budgetSpent / project.budgetAllocated) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-green-600 h-3 rounded-full"
                          style={{
                            width: `${Math.min((project.budgetSpent / project.budgetAllocated) * 100, 100)}%`
                          }}
                        />
                      </div>
                    </div>
                    <div className="pt-2">
                      <p className="text-sm text-gray-600">Remaining Budget</p>
                      <p className="text-lg font-bold text-green-600">
                        {formatCurrency(project.budgetAllocated - project.budgetSpent)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-bold mb-4" style={{ color: '#A8211B' }}>
                  Quick Actions
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <button
                    onClick={() => router.push(`/construction/progress/new?projectId=${projectId}`)}
                    className="p-4 border-2 border-gray-200 rounded-lg hover:border-red-600 hover:bg-red-50 transition-all"
                  >
                    <div className="text-2xl mb-2">📝</div>
                    <div className="text-sm font-medium">Add Progress Log</div>
                  </button>
                  <button
                    onClick={() => router.push(`/construction/materials?projectId=${projectId}`)}
                    className="p-4 border-2 border-gray-200 rounded-lg hover:border-red-600 hover:bg-red-50 transition-all"
                  >
                    <div className="text-2xl mb-2">🧱</div>
                    <div className="text-sm font-medium">Request Materials</div>
                  </button>
                  <button
                    onClick={() => router.push(`/construction/purchase-orders/new?projectId=${projectId}`)}
                    className="p-4 border-2 border-gray-200 rounded-lg hover:border-red-600 hover:bg-red-50 transition-all"
                  >
                    <div className="text-2xl mb-2">🛒</div>
                    <div className="text-sm font-medium">Create PO</div>
                  </button>
                  <button
                    onClick={() => router.push(`/construction/teams?projectId=${projectId}`)}
                    className="p-4 border-2 border-gray-200 rounded-lg hover:border-red-600 hover:bg-red-50 transition-all"
                  >
                    <div className="text-2xl mb-2">👥</div>
                    <div className="text-sm font-medium">Manage Team</div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'progress' && (
            <div className="text-center py-12 text-gray-600">
              <p className="text-4xl mb-4">📊</p>
              <p>Progress logs will be displayed here</p>
              <button
                onClick={() => router.push(`/construction/progress/new?projectId=${projectId}`)}
                className="mt-4 px-6 py-2 text-white rounded-lg"
                style={{ backgroundColor: '#A8211B' }}
              >
                Add First Progress Log
              </button>
            </div>
          )}

          {activeTab === 'materials' && (
            <div className="text-center py-12 text-gray-600">
              <p className="text-4xl mb-4">🧱</p>
              <p>Material usage will be tracked here</p>
              <button
                onClick={() => router.push('/construction/materials')}
                className="mt-4 px-6 py-2 text-white rounded-lg"
                style={{ backgroundColor: '#A8211B' }}
              >
                Go to Materials
              </button>
            </div>
          )}

          {activeTab === 'team' && (
            <div className="text-center py-12 text-gray-600">
              <p className="text-4xl mb-4">👥</p>
              <p>Team members will be listed here</p>
              <button
                onClick={() => router.push('/construction/teams')}
                className="mt-4 px-6 py-2 text-white rounded-lg"
                style={{ backgroundColor: '#A8211B' }}
              >
                Manage Teams
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this project? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
