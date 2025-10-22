'use client';

import { useState, useEffect } from 'react';
import Modal from './Modal';
import { api } from '@/services/api';

interface AddProgressLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  propertyId: string;
}

const WEATHER_CONDITIONS = ['SUNNY', 'CLOUDY', 'RAINY', 'STORMY', 'FOGGY'];
const SHIFTS = ['DAY', 'NIGHT'];

export default function AddProgressLogModal({ isOpen, onClose, onSuccess, propertyId }: AddProgressLogModalProps) {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    projectId: '',
    logDate: new Date().toISOString().split('T')[0],
    shift: 'DAY',
    workCompleted: '',
    workersPresent: '',
    workersAbsent: '',
    weatherCondition: 'SUNNY',
    progressPercentage: '0',
    materialsUsed: '',
    issuesDelays: '',
    supervisorName: '',
    nextDayPlan: '',
    remarks: '',
  });

  useEffect(() => {
    if (isOpen) {
      loadProjects();
    }
  }, [isOpen]);

  const loadProjects = async () => {
    try {
      const response = await api.get(`/construction-projects?propertyId=${propertyId}`);
      const data = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      setProjects(data.filter((p: any) => p.status === 'IN_PROGRESS' || p.status === 'PLANNING'));
    } catch (error) {
      console.error('Failed to load projects:', error);
      alert('Failed to load projects');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.projectId || !formData.workCompleted || !formData.supervisorName) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      await api.post('/construction-progress-logs', {
        projectId: formData.projectId,
        logDate: formData.logDate,
        shift: formData.shift,
        workCompleted: formData.workCompleted,
        workersPresent: parseInt(formData.workersPresent) || 0,
        workersAbsent: parseInt(formData.workersAbsent) || 0,
        weatherCondition: formData.weatherCondition,
        progressPercentage: parseFloat(formData.progressPercentage),
        materialsUsed: formData.materialsUsed || null,
        issuesDelays: formData.issuesDelays || null,
        supervisorName: formData.supervisorName,
        nextDayPlan: formData.nextDayPlan || null,
        remarks: formData.remarks || null,
      });

      alert('Progress log added successfully!');
      onSuccess();
      handleClose();
    } catch (error: any) {
      console.error('Failed to add progress log:', error);
      alert(error.response?.data?.message || 'Failed to add progress log');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      projectId: '',
      logDate: new Date().toISOString().split('T')[0],
      shift: 'DAY',
      workCompleted: '',
      workersPresent: '',
      workersAbsent: '',
      weatherCondition: 'SUNNY',
      progressPercentage: '0',
      materialsUsed: '',
      issuesDelays: '',
      supervisorName: '',
      nextDayPlan: '',
      remarks: '',
    });
    onClose();
  };

  const totalWorkers = (parseInt(formData.workersPresent) || 0) + (parseInt(formData.workersAbsent) || 0);

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add Daily Progress Log" size="xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div>
          <h3 className="text-lg font-semibold mb-3" style={{ color: '#A8211B' }}>
            Log Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project <span className="text-red-600">*</span>
              </label>
              <select
                value={formData.projectId}
                onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              >
                <option value="">Select Project</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.projectName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date <span className="text-red-600">*</span>
              </label>
              <input
                type="date"
                value={formData.logDate}
                onChange={(e) => setFormData({ ...formData, logDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Shift <span className="text-red-600">*</span>
              </label>
              <select
                value={formData.shift}
                onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              >
                {SHIFTS.map((shift) => (
                  <option key={shift} value={shift}>
                    {shift}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Weather Condition
              </label>
              <select
                value={formData.weatherCondition}
                onChange={(e) => setFormData({ ...formData, weatherCondition: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                {WEATHER_CONDITIONS.map((weather) => (
                  <option key={weather} value={weather}>
                    {weather}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Work Progress */}
        <div>
          <h3 className="text-lg font-semibold mb-3" style={{ color: '#A8211B' }}>
            Work Progress
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Work Completed Today <span className="text-red-600">*</span>
              </label>
              <textarea
                value={formData.workCompleted}
                onChange={(e) => setFormData({ ...formData, workCompleted: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                rows={3}
                placeholder="Describe the work completed today..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Progress Percentage: {formData.progressPercentage}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={formData.progressPercentage}
                onChange={(e) => setFormData({ ...formData, progressPercentage: e.target.value })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #A8211B 0%, #A8211B ${formData.progressPercentage}%, #e5e7eb ${formData.progressPercentage}%, #e5e7eb 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Workforce */}
        <div>
          <h3 className="text-lg font-semibold mb-3" style={{ color: '#A8211B' }}>
            Workforce Attendance
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Workers Present
              </label>
              <input
                type="number"
                value={formData.workersPresent}
                onChange={(e) => setFormData({ ...formData, workersPresent: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Workers Absent
              </label>
              <input
                type="number"
                value={formData.workersAbsent}
                onChange={(e) => setFormData({ ...formData, workersAbsent: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="0"
              />
            </div>

            <div className="flex items-end">
              <div className="w-full bg-blue-50 rounded-lg p-3 border border-blue-200">
                <p className="text-xs text-blue-600 font-medium">Total Workforce</p>
                <p className="text-2xl font-bold text-blue-700">{totalWorkers}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Materials & Issues */}
        <div>
          <h3 className="text-lg font-semibold mb-3" style={{ color: '#A8211B' }}>
            Materials & Issues
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Materials Used Today
              </label>
              <textarea
                value={formData.materialsUsed}
                onChange={(e) => setFormData({ ...formData, materialsUsed: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                rows={2}
                placeholder="List materials consumed (e.g., 10 bags cement, 2 tons steel...)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Issues / Delays (if any)
              </label>
              <textarea
                value={formData.issuesDelays}
                onChange={(e) => setFormData({ ...formData, issuesDelays: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                rows={2}
                placeholder="Report any issues, delays, or concerns..."
              />
            </div>
          </div>
        </div>

        {/* Supervisor & Planning */}
        <div>
          <h3 className="text-lg font-semibold mb-3" style={{ color: '#A8211B' }}>
            Supervisor & Next Day Plan
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Supervisor Name <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={formData.supervisorName}
                onChange={(e) => setFormData({ ...formData, supervisorName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Name of supervisor"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Next Day Plan
              </label>
              <textarea
                value={formData.nextDayPlan}
                onChange={(e) => setFormData({ ...formData, nextDayPlan: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                rows={2}
                placeholder="Plan for tomorrow's work..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Additional Remarks
              </label>
              <textarea
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                rows={2}
                placeholder="Any other notes or observations..."
              />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex gap-3 pt-4 border-t">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-3 text-white rounded-lg font-medium disabled:opacity-50"
            style={{ backgroundColor: '#A8211B' }}
          >
            {loading ? 'Saving...' : 'Save Progress Log'}
          </button>
          <button
            type="button"
            onClick={handleClose}
            className="px-6 py-3 border-2 border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}
