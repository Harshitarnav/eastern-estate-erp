'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/services/api';
import AddProgressLogModal from '@/components/modals/AddProgressLogModal';

export default function ProgressLogsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const propertyId = searchParams.get('propertyId') ?? '';

  const [progressLogs, setProgressLogs] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    loadData();
  }, [propertyId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const projectsUrl = propertyId 
        ? `/construction-projects?propertyId=${propertyId}` 
        : '/construction-projects';
      
      const [projectsRes] = await Promise.all([
        api.get(projectsUrl)
      ]);
      
      const projectsData = Array.isArray(projectsRes.data) ? projectsRes.data : (projectsRes.data?.data || []);
      setProjects(projectsData);
      setProgressLogs([]);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

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
            📊
          </div>
          <div>
            <h1 className="text-3xl font-bold" style={{ color: '#A8211B' }}>
              Daily Progress Logs
            </h1>
            <p className="text-sm text-gray-500">Eastern Estate ERP System</p>
          </div>
        </div>
        <p className="text-gray-600">Track daily construction progress and work updates</p>
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
          <p className="text-sm text-blue-600 mb-1">Total Logs</p>
          <p className="text-2xl font-bold text-blue-700">{(progressLogs || []).length}</p>
        </div>
        <div className="bg-green-50 rounded-lg shadow p-4">
          <p className="text-sm text-green-600 mb-1">This Week</p>
          <p className="text-2xl font-bold text-green-700">0</p>
        </div>
        <div className="bg-purple-50 rounded-lg shadow p-4">
          <p className="text-sm text-purple-600 mb-1">Today</p>
          <p className="text-2xl font-bold text-purple-700">0</p>
        </div>
      </div>

      {/* Active Projects */}
      {(projects || []).length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4" style={{ color: '#A8211B' }}>
            Active Construction Projects
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects
              .filter(p => p.status === 'IN_PROGRESS')
              .map((project) => (
                <div
                  key={project.id}
                  className="border-2 border-gray-200 rounded-lg p-4 hover:border-red-500 hover:shadow-lg transition-all cursor-pointer"
                  onClick={() => alert(`View progress logs for ${project.projectName}`)}
                >
                  <h3 className="font-bold text-gray-900 mb-2">{project.projectName}</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Progress:</span>
                      <span className="font-medium">{project.overallProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full"
                        style={{
                          width: `${project.overallProgress}%`,
                          backgroundColor: '#A8211B'
                        }}
                      />
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Started:</span>
                      <span>{new Date(project.startDate).toLocaleDateString('en-IN')}</span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowAddModal(true);
                    }}
                    className="mt-4 w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                  >
                    + Add Daily Log
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Progress Logs List */}
      <div className="bg-white rounded-lg shadow mb-6">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading progress logs...</p>
          </div>
        ) : (progressLogs || []).length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-4xl mb-4">📊</p>
            <p className="text-gray-600 mb-2">No progress logs found for this property</p>
            <p className="text-sm text-gray-500 mb-4">
              Start tracking daily construction progress by adding your first log
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-2 text-white rounded-lg"
              style={{ backgroundColor: '#A8211B' }}
            >
              Add Progress Log
            </button>
          </div>
        ) : (
          <div className="p-6">
            <h3 className="text-lg font-bold mb-4">Recent Progress Logs</h3>
            <div className="space-y-4">
              {((progressLogs || [])).map((log) => (
                <div key={log.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold">{log.project?.projectName}</h4>
                      <p className="text-sm text-gray-600">
                        {new Date(log.reportDate).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                    <span className="text-sm font-medium text-green-600">
                      {log.progressPercentage}% Progress
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{log.workCompleted}</p>
                  <div className="mt-2 flex gap-4 text-xs text-gray-600">
                    <span>Workers: {log.workersPresent} present, {log.workersAbsent} absent</span>
                    {log.weatherConditions && <span>Weather: {log.weatherConditions}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* How to Use Guide */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg shadow-lg p-6 border-2" style={{ borderColor: '#A8211B' }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl" style={{ backgroundColor: '#A8211B' }}>
            📖
          </div>
          <h3 className="text-xl font-bold" style={{ color: '#A8211B' }}>
            How to Use Daily Progress Logs
          </h3>
        </div>
        <div className="space-y-4 text-gray-700">
          <div>
            <h4 className="font-semibold mb-2">What is this page for?</h4>
            <p className="text-sm">
              The Daily Progress Logs page tracks day-to-day construction activities, work completed, worker attendance, and site conditions. 
              Maintain accurate records of construction progress to monitor timelines, identify delays, and ensure project accountability.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Key Features:</h4>
            <ul className="list-disc list-inside text-sm space-y-1 ml-2">
              <li><strong>Daily Logs:</strong> Record work completed each day on site</li>
              <li><strong>Worker Attendance:</strong> Track team members present and absent</li>
              <li><strong>Progress Tracking:</strong> Monitor completion percentage for each project</li>
              <li><strong>Weather Conditions:</strong> Document weather impact on work</li>
              <li><strong>Photo Documentation:</strong> Attach photos showing site progress</li>
              <li><strong>Issue Reporting:</strong> Note any problems or delays encountered</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">How to Use:</h4>
            <ol className="list-decimal list-inside text-sm space-y-1 ml-2">
              <li>Select an active construction project from the cards above</li>
              <li>Click "+ Add Daily Log" to create today's entry</li>
              <li>Record work completed, progress made, and activities</li>
              <li>Note worker attendance (present/absent counts)</li>
              <li>Document weather conditions if relevant</li>
              <li>Upload photos showing site progress (optional)</li>
              <li>Submit the log to create permanent record</li>
            </ol>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Best Practices:</h4>
            <ul className="list-disc list-inside text-sm space-y-1 ml-2">
              <li>Create logs daily, even if no work was done (note reason)</li>
              <li>Be specific about work completed for accurate tracking</li>
              <li>Take photos regularly to document visual progress</li>
              <li>Note any delays or issues immediately</li>
              <li>Track attendance to monitor labor costs and efficiency</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Modal */}
      <AddProgressLogModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          setShowAddModal(false);
          loadData();
        }}
        propertyId={propertyId}
      />
    </div>
  );
}
