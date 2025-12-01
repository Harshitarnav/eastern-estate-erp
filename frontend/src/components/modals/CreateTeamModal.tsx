'use client';

import { useState, useEffect } from 'react';
import Modal from './Modal';
import { api } from '@/services/api';

interface CreateTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  propertyId: string;
}

const SPECIALIZATIONS = [
  'MASONRY',
  'CARPENTRY',
  'PLUMBING',
  'ELECTRICAL',
  'PAINTING',
  'STEEL_WORK',
  'GENERAL_LABOR',
  'OTHER'
];

export default function CreateTeamModal({ isOpen, onClose, onSuccess, propertyId }: CreateTeamModalProps) {
  const [employees, setEmployees] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    teamName: '',
    teamCode: '',
    teamLeaderId: '',
    specialization: 'GENERAL_LABOR',
    projectId: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    shiftPreference: 'DAY',
    contactNumber: '',
    remarks: '',
  });

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    try {
      const [employeesRes, projectsRes] = await Promise.all([
        api.get('/employees'),
        api.get(`/construction-projects?propertyId=${propertyId}`)
      ]);
      
      const employeesData = Array.isArray(employeesRes.data) ? employeesRes.data : (employeesRes.data?.data || []);
      const projectsData = Array.isArray(projectsRes.data) ? projectsRes.data : (projectsRes.data?.data || []);
      
      setEmployees((employeesData || []).filter((e: any) => e.status === 'ACTIVE'));
      setProjects((projectsData || []).filter((p: any) => p.status === 'IN_PROGRESS' || p.status === 'PLANNING'));
    } catch (error) {
      console.error('Failed to load data:', error);
      alert('Failed to load employees and projects');
    }
  };

  const toggleMember = (employeeId: string) => {
    setSelectedMembers(prev =>
      prev.includes(employeeId)
        ? ((prev || [])).filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.teamName || !formData.teamLeaderId) {
      alert('Please fill in all required fields');
      return;
    }

    if (selectedMembers.length === 0) {
      alert('Please select at least one team member');
      return;
    }

    setLoading(true);
    try {
      await api.post('/construction-teams', {
        teamName: formData.teamName,
        teamCode: formData.teamCode || `TEAM-${Date.now()}`,
        teamLeaderId: formData.teamLeaderId,
        specialization: formData.specialization,
        projectId: formData.projectId || null,
        members: selectedMembers,
        startDate: formData.startDate,
        endDate: formData.endDate || null,
        shiftPreference: formData.shiftPreference,
        contactNumber: formData.contactNumber || null,
        isActive: true,
        remarks: formData.remarks || null,
      });

      alert('Team created successfully!');
      onSuccess();
      handleClose();
    } catch (error: any) {
      console.error('Failed to create team:', error);
      alert(error.response?.data?.message || 'Failed to create team');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      teamName: '',
      teamCode: '',
      teamLeaderId: '',
      specialization: 'GENERAL_LABOR',
      projectId: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      shiftPreference: 'DAY',
      contactNumber: '',
      remarks: '',
    });
    setSelectedMembers([]);
    onClose();
  };

  const availableMembers = ((employees || [])).filter(e => e.id !== formData.teamLeaderId);

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create Construction Team" size="xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div>
          <h3 className="text-lg font-semibold mb-3" style={{ color: '#A8211B' }}>
            Team Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Team Name <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={formData.teamName}
                onChange={(e) => setFormData({ ...formData, teamName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="e.g., Alpha Team"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Team Code
              </label>
              <input
                type="text"
                value={formData.teamCode}
                onChange={(e) => setFormData({ ...formData, teamCode: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Auto-generated if empty"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Team Leader <span className="text-red-600">*</span>
              </label>
              <select
                value={formData.teamLeaderId}
                onChange={(e) => setFormData({ ...formData, teamLeaderId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              >
                <option value="">Select Team Leader</option>
                {((employees || [])).map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.firstName} {employee.lastName} - {employee.designation}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Specialization
              </label>
              <select
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                {((SPECIALIZATIONS || [])).map((spec) => (
                  <option key={spec} value={spec}>
                    {spec.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project Assignment
              </label>
              <select
                value={formData.projectId}
                onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="">No Project (Available)</option>
                {((projects || [])).map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.projectName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Shift Preference
              </label>
              <select
                value={formData.shiftPreference}
                onChange={(e) => setFormData({ ...formData, shiftPreference: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="DAY">Day Shift</option>
                <option value="NIGHT">Night Shift</option>
                <option value="FLEXIBLE">Flexible</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date <span className="text-red-600">*</span>
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date (Optional)
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Number
              </label>
              <input
                type="tel"
                value={formData.contactNumber}
                onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Team contact number"
              />
            </div>
          </div>
        </div>

        {/* Team Members Selection */}
        <div>
          <h3 className="text-lg font-semibold mb-3" style={{ color: '#A8211B' }}>
            Team Members <span className="text-red-600">*</span>
          </h3>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 max-h-64 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {availableMembers.length === 0 ? (
                <p className="text-gray-500 text-sm col-span-2">
                  No available employees. Please select a team leader first or add employees.
                </p>
              ) : (
                ((availableMembers || [])).map((employee) => (
                  <label
                    key={employee.id}
                    className="flex items-center space-x-3 p-3 bg-white rounded border hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedMembers.includes(employee.id)}
                      onChange={() => toggleMember(employee.id)}
                      className="rounded text-red-600 focus:ring-red-500"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-sm">
                        {employee.firstName} {employee.lastName}
                      </div>
                      <div className="text-xs text-gray-500">
                        {employee.designation} | {employee.employeeCode}
                      </div>
                    </div>
                  </label>
                ))
              )}
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Selected Members: {selectedMembers.length}
            {formData.teamLeaderId && ' + 1 Leader'}
          </p>
        </div>

        {/* Remarks */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Remarks
          </label>
          <textarea
            value={formData.remarks}
            onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            rows={2}
            placeholder="Any special notes about this team..."
          />
        </div>

        {/* Team Summary */}
        <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-2">Team Summary</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-blue-700">Total Members:</span>
              <span className="font-bold ml-2">
                {selectedMembers.length + (formData.teamLeaderId ? 1 : 0)}
              </span>
            </div>
            <div>
              <span className="text-blue-700">Specialization:</span>
              <span className="font-bold ml-2">{formData.specialization.replace('_', ' ')}</span>
            </div>
            <div>
              <span className="text-blue-700">Shift:</span>
              <span className="font-bold ml-2">{formData.shiftPreference}</span>
            </div>
            <div>
              <span className="text-blue-700">Status:</span>
              <span className="font-bold ml-2 text-green-600">Active</span>
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
            {loading ? 'Creating...' : 'Create Team'}
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
