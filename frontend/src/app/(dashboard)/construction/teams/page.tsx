'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/services/api';
import CreateTeamModal from '@/components/modals/CreateTeamModal';
import AddWorkScheduleModal from '@/components/modals/AddWorkScheduleModal';

export default function TeamsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const propertyId = searchParams.get('propertyId');

  const [projects, setProjects] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  useEffect(() => {
    if (!propertyId) {
      router.push('/construction');
      return;
    }
    loadData();
  }, [propertyId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [projectsRes, employeesRes] = await Promise.all([
        api.get(`/construction-projects?propertyId=${propertyId}`),
        api.get('/employees')
      ]);
      
      const projectsData = Array.isArray(projectsRes.data) ? projectsRes.data : (projectsRes.data?.data || []);
      const employeesData = Array.isArray(employeesRes.data) ? employeesRes.data : (employeesRes.data?.data || []);
      
      setProjects(projectsData);
      setEmployees(employeesData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!propertyId) return null;

  return (
    <div className="p-6">
      {/* Eastern Estate Branded Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push('/construction')}
          className="text-gray-600 hover:text-gray-900 mb-4 flex items-center"
        >
          ← Back to Construction Hub
        </button>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl" style={{ backgroundColor: '#A8211B' }}>
            👥
          </div>
          <div>
            <h1 className="text-3xl font-bold" style={{ color: '#A8211B' }}>
              Teams & Work Schedule
            </h1>
            <p className="text-sm text-gray-500">Eastern Estate ERP System</p>
          </div>
        </div>
        <p className="text-gray-600">Manage construction teams and work schedules</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600 mb-1">Active Projects</p>
          <p className="text-2xl font-bold text-gray-900">
            {((projects || [])).filter(p => p.status === 'IN_PROGRESS').length}
          </p>
        </div>
        <div className="bg-blue-50 rounded-lg shadow p-4">
          <p className="text-sm text-blue-600 mb-1">Total Employees</p>
          <p className="text-2xl font-bold text-blue-700">{(employees || []).length}</p>
        </div>
        <div className="bg-green-50 rounded-lg shadow p-4">
          <p className="text-sm text-green-600 mb-1">Project Managers</p>
          <p className="text-2xl font-bold text-green-700">
            {((projects || [])).filter(p => p.projectManagerId).length}
          </p>
        </div>
        <div className="bg-purple-50 rounded-lg shadow p-4">
          <p className="text-sm text-purple-600 mb-1">Work Schedules</p>
          <p className="text-2xl font-bold text-purple-700">0</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-500 text-white rounded-lg shadow-lg p-4 hover:bg-blue-600 transition-all text-left"
        >
          <div className="flex items-center gap-3">
            <div className="text-3xl">👷</div>
            <div>
              <h3 className="font-bold">Create Team</h3>
              <p className="text-sm text-blue-100">Form a new construction team</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => setShowScheduleModal(true)}
          className="bg-green-500 text-white rounded-lg shadow-lg p-4 hover:bg-green-600 transition-all text-left"
        >
          <div className="flex items-center gap-3">
            <div className="text-3xl">📅</div>
            <div>
              <h3 className="font-bold">Add Schedule</h3>
              <p className="text-sm text-green-100">Create work schedule</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => router.push(`/employees`)}
          className="bg-orange-500 text-white rounded-lg shadow-lg p-4 hover:bg-orange-600 transition-all text-left"
        >
          <div className="flex items-center gap-3">
            <div className="text-3xl">👨‍💼</div>
            <div>
              <h3 className="font-bold">View Employees</h3>
              <p className="text-sm text-orange-100">Manage all employees</p>
            </div>
          </div>
        </button>
      </div>

      {/* Active Projects with Teams */}
      {(projects || []).length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4" style={{ color: '#A8211B' }}>
            Project Teams
          </h2>
          <div className="space-y-4">
            {((projects || [])).map((project) => (
              <div key={project.id} className="border-2 border-gray-200 rounded-lg p-4 hover:border-red-500 transition-all">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-gray-900">{project.projectName}</h3>
                    <p className="text-sm text-gray-600">
                      Started: {new Date(project.startDate).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded text-sm font-medium ${
                    project.status === 'IN_PROGRESS' ? 'bg-green-100 text-green-800' :
                    project.status === 'PLANNING' ? 'bg-blue-100 text-blue-800' :
                    project.status === 'ON_HOLD' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {project.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 text-sm">Project Manager:</span>
                    <span className="font-medium text-sm">
                      {project.projectManager?.firstName && project.projectManager?.lastName
                        ? `${project.projectManager.firstName} ${project.projectManager.lastName}`
                        : 'Not Assigned'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 text-sm">Progress:</span>
                    <span className="font-medium text-sm">{project.overallProgress}%</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2 ml-2">
                      <div
                        className="h-2 rounded-full"
                        style={{
                          width: `${project.overallProgress}%`,
                          backgroundColor: '#A8211B'
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => alert('Assign Team Members feature coming soon!')}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                  >
                    Assign Team
                  </button>
                  <button
                    onClick={() => alert('View Work Schedule feature coming soon!')}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                  >
                    View Schedule
                  </button>
                  <button
                    onClick={() => router.push(`/construction/progress?propertyId=${propertyId}`)}
                    className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm"
                  >
                    Progress Logs
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {loading ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading team data...</p>
        </div>
      ) : (projects || []).length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center mb-6">
          <p className="text-4xl mb-4">👥</p>
          <p className="text-gray-600 mb-2">No construction projects found for this property</p>
          <p className="text-sm text-gray-500 mb-4">
            Create construction projects first to manage teams and schedules
          </p>
        </div>
      ) : null}

      {/* How to Use Guide */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg shadow-lg p-6 border-2" style={{ borderColor: '#A8211B' }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl" style={{ backgroundColor: '#A8211B' }}>
            📖
          </div>
          <h3 className="text-xl font-bold" style={{ color: '#A8211B' }}>
            How to Use Teams & Work Schedule
          </h3>
        </div>
        <div className="space-y-4 text-gray-700">
          <div>
            <h4 className="font-semibold mb-2">What is this page for?</h4>
            <p className="text-sm">
              The Teams & Work Schedule page helps you organize construction workers into teams, assign them to projects, 
              and manage their work schedules. Optimize labor allocation, track team productivity, and ensure the right people 
              are working on the right projects at the right time.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Key Features:</h4>
            <ul className="list-disc list-inside text-sm space-y-1 ml-2">
              <li><strong>Team Formation:</strong> Create teams with specific roles and responsibilities</li>
              <li><strong>Member Assignment:</strong> Assign employees to teams and projects</li>
              <li><strong>Work Scheduling:</strong> Plan daily, weekly, and monthly work schedules</li>
              <li><strong>Role Management:</strong> Define team leaders, supervisors, and workers</li>
              <li><strong>Performance Tracking:</strong> Monitor team productivity and output</li>
              <li><strong>Attendance Integration:</strong> Link with daily progress logs for attendance</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">How to Use:</h4>
            <ol className="list-decimal list-inside text-sm space-y-1 ml-2">
              <li>Review existing project teams in the list above</li>
              <li>Click "Create Team" to form a new construction team</li>
              <li>Assign team members from your employee roster</li>
              <li>Designate team leader and define roles</li>
              <li>Create work schedules specifying dates and shifts</li>
              <li>Use "View Schedule" to see team's work calendar</li>
              <li>Link to Progress Logs to track daily attendance</li>
            </ol>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Best Practices:</h4>
            <ul className="list-disc list-inside text-sm space-y-1 ml-2">
              <li>Keep teams small (5-10 members) for better coordination</li>
              <li>Assign experienced team leaders to supervise work</li>
              <li>Create schedules at least one week in advance</li>
              <li>Balance workload across teams to avoid burnout</li>
              <li>Track attendance daily to manage labor costs</li>
              <li>Review team performance regularly and adjust assignments</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Modals */}
      <CreateTeamModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          setShowCreateModal(false);
          loadData();
        }}
        propertyId={propertyId}
      />

      <AddWorkScheduleModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        onSuccess={() => {
          setShowScheduleModal(false);
          loadData();
        }}
        propertyId={propertyId}
      />
    </div>
  );
}
