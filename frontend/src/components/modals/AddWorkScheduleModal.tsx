'use client';

import { useState, useEffect } from 'react';
import Modal from './Modal';
import { api } from '@/services/api';

interface AddWorkScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  propertyId: string;
}

export default function AddWorkScheduleModal({ isOpen, onClose, onSuccess, propertyId }: AddWorkScheduleModalProps) {
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    teamId: '',
    scheduleDate: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '17:00',
    workLocation: '',
    taskAssignment: '',
    expectedCompletion: '',
    breakStartTime: '13:00',
    breakEndTime: '14:00',
    specialInstructions: '',
    equipmentRequired: '',
    remarks: '',
  });

  useEffect(() => {
    if (isOpen) {
      loadTeams();
    }
  }, [isOpen]);

  const loadTeams = async () => {
    try {
      const response = await api.get('/construction-teams');
      const data = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      setTeams(d((ata || [])).filter((t: any) => t.isActive));
    } catch (error) {
      console.error('Failed to load teams:', error);
      alert('Failed to load teams');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.teamId || !formData.workLocation || !formData.taskAssignment) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      await api.post('/work-schedules', {
        teamId: formData.teamId,
        scheduleDate: formData.scheduleDate,
        startTime: formData.startTime,
        endTime: formData.endTime,
        workLocation: formData.workLocation,
        taskAssignment: formData.taskAssignment,
        expectedCompletion: formData.expectedCompletion || null,
        breakStartTime: formData.breakStartTime,
        breakEndTime: formData.breakEndTime,
        specialInstructions: formData.specialInstructions || null,
        equipmentRequired: formData.equipmentRequired || null,
        status: 'SCHEDULED',
        remarks: formData.remarks || null,
      });

      alert('Work schedule added successfully!');
      onSuccess();
      handleClose();
    } catch (error: any) {
      console.error('Failed to add work schedule:', error);
      alert(error.response?.data?.message || 'Failed to add work schedule');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      teamId: '',
      scheduleDate: new Date().toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '17:00',
      workLocation: '',
      taskAssignment: '',
      expectedCompletion: '',
      breakStartTime: '13:00',
      breakEndTime: '14:00',
      specialInstructions: '',
      equipmentRequired: '',
      remarks: '',
    });
    onClose();
  };

  const calculateWorkHours = () => {
    const start = new Date(`2000-01-01T${formData.startTime}`);
    const end = new Date(`2000-01-01T${formData.endTime}`);
    const breakStart = new Date(`2000-01-01T${formData.breakStartTime}`);
    const breakEnd = new Date(`2000-01-01T${formData.breakEndTime}`);
    
    const totalMs = end.getTime() - start.getTime();
    const breakMs = breakEnd.getTime() - breakStart.getTime();
    const workMs = totalMs - breakMs;
    
    return (workMs / (1000 * 60 * 60)).toFixed(1);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add Work Schedule" size="xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-3" style={{ color: '#A8211B' }}>Schedule Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Team <span className="text-red-600">*</span>
              </label>
              <select
                value={formData.teamId}
                onChange={(e) => setFormData({ ...formData, teamId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                required
              >
                <option value="">Select Team</option>
                {((teams || [])).map((team) => (
                  <option key={team.id} value={team.id}>{team.teamName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date <span className="text-red-600">*</span>
              </label>
              <input
                type="date"
                value={formData.scheduleDate}
                onChange={(e) => setFormData({ ...formData, scheduleDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3" style={{ color: '#A8211B' }}>Work Details</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Work Location <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={formData.workLocation}
                onChange={(e) => setFormData({ ...formData, workLocation: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                placeholder="e.g., Building A, Floor 3"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Task Assignment <span className="text-red-600">*</span>
              </label>
              <textarea
                value={formData.taskAssignment}
                onChange={(e) => setFormData({ ...formData, taskAssignment: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                rows={2}
                placeholder="Describe the tasks to be completed..."
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expected Completion Date</label>
              <input
                type="date"
                value={formData.expectedCompletion}
                onChange={(e) => setFormData({ ...formData, expectedCompletion: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3" style={{ color: '#A8211B' }}>Break Time</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Break Start</label>
              <input
                type="time"
                value={formData.breakStartTime}
                onChange={(e) => setFormData({ ...formData, breakStartTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Break End</label>
              <input
                type="time"
                value={formData.breakEndTime}
                onChange={(e) => setFormData({ ...formData, breakEndTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-blue-900">Total Work Hours:</span>
            <span className="text-2xl font-bold text-blue-700">{calculateWorkHours()}h</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Equipment Required</label>
          <textarea
            value={formData.equipmentRequired}
            onChange={(e) => setFormData({ ...formData, equipmentRequired: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
            rows={2}
            placeholder="List required equipment and tools..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Special Instructions</label>
          <textarea
            value={formData.specialInstructions}
            onChange={(e) => setFormData({ ...formData, specialInstructions: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
            rows={2}
            placeholder="Any special instructions or safety notes..."
          />
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-3 text-white rounded-lg font-medium disabled:opacity-50"
            style={{ backgroundColor: '#A8211B' }}
          >
            {loading ? 'Saving...' : 'Save Schedule'}
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
