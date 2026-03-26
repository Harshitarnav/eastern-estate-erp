'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Modal from './Modal';
import { api } from '@/services/api';
import { Camera, X, Upload, ImageIcon } from 'lucide-react';

interface AddProgressLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  propertyId: string;
}

const WEATHER_CONDITIONS = ['SUNNY', 'CLOUDY', 'RAINY', 'STORMY', 'FOGGY'];
const SHIFTS = ['DAY', 'NIGHT'];

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') ?? 'http://localhost:3001';

export default function AddProgressLogModal({ isOpen, onClose, onSuccess, propertyId }: AddProgressLogModalProps) {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Photo state
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      // api.get() returns response.data directly (not a full Axios response)
      // If propertyId is empty, load all projects instead of filtering by empty string
      const url = propertyId ? `/construction-projects?propertyId=${propertyId}` : '/construction-projects';
      const response = await api.get(url);
      const data = Array.isArray(response) ? response : (response?.data || []);
      setProjects((data || []).filter((p: any) => p.status === 'IN_PROGRESS' || p.status === 'PLANNING'));
    } catch (error) {
      console.error('Failed to load projects:', error);
      alert('Failed to load projects');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const allowed = files.filter(f => f.type.startsWith('image/'));
    const combined = [...selectedFiles, ...allowed].slice(0, 5); // max 5
    setSelectedFiles(combined);
    // Generate preview URLs
    const urls = combined.map(f => URL.createObjectURL(f));
    setPreviews(prev => { prev.forEach(u => URL.revokeObjectURL(u)); return urls; });
    // Reset input so the same file can be re-selected if removed
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removePreview = (idx: number) => {
    URL.revokeObjectURL(previews[idx]);
    setSelectedFiles(prev => prev.filter((_, i) => i !== idx));
    setPreviews(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.projectId || !formData.workCompleted || !formData.supervisorName) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const log = await api.post('/construction-progress-logs', {
        constructionProjectId: formData.projectId,
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

      // ── Upload photos if any ──────────────────────────────────────────────
      if (selectedFiles.length > 0 && log?.id) {
        setUploadingPhotos(true);
        try {
          const formPayload = new FormData();
          selectedFiles.forEach(f => formPayload.append('photos', f));
          const token = localStorage.getItem('token') ?? sessionStorage.getItem('token') ?? '';
          await fetch(
            `${API_BASE}/api/v1/construction-progress-logs/${log.id}/photos`,
            {
              method: 'POST',
              headers: { Authorization: `Bearer ${token}` },
              body: formPayload,
            },
          );
        } catch (photoErr) {
          console.warn('Photos upload failed (log was saved):', photoErr);
        } finally {
          setUploadingPhotos(false);
        }
      }

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
    previews.forEach(u => URL.revokeObjectURL(u));
    setSelectedFiles([]);
    setPreviews([]);
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
                {((projects || [])).map((project) => (
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
                {((SHIFTS || [])).map((shift) => (
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
                {((WEATHER_CONDITIONS || [])).map((weather) => (
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

        {/* Site Photos */}
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2" style={{ color: '#A8211B' }}>
            <Camera className="w-5 h-5" /> Site Photos
            <span className="text-sm font-normal text-gray-400">(up to 5 images, max 10 MB each)</span>
          </h3>

          {/* Drop zone / file picker */}
          <div
            className="relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors"
            style={{ borderColor: '#A8211B40' }}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileChange}
              disabled={selectedFiles.length >= 5}
            />
            <Upload className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm text-gray-500">
              {selectedFiles.length >= 5
                ? 'Maximum 5 photos selected'
                : 'Click to select photos — JPEG, PNG, WebP'}
            </p>
          </div>

          {/* Previews */}
          {previews.length > 0 && (
            <div className="flex gap-3 flex-wrap mt-3">
              {previews.map((url, idx) => (
                <div key={idx} className="relative group rounded-xl overflow-hidden border border-gray-200 shadow-sm" style={{ width: 88, height: 88 }}>
                  <Image
                    src={url}
                    alt={`preview-${idx}`}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <button
                    type="button"
                    onClick={() => removePreview(idx)}
                    className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 bg-black/40 text-white text-[10px] text-center py-0.5">
                    {(selectedFiles[idx]?.size / 1024).toFixed(0)} KB
                  </div>
                </div>
              ))}
              {selectedFiles.length < 5 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-[88px] h-[88px] rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors"
                >
                  <ImageIcon className="w-5 h-5 mb-1" />
                  <span className="text-[10px]">Add more</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex gap-3 pt-4 border-t">
          <button
            type="submit"
            disabled={loading || uploadingPhotos}
            className="flex-1 px-6 py-3 text-white rounded-lg font-medium disabled:opacity-50"
            style={{ backgroundColor: '#A8211B' }}
          >
            {uploadingPhotos ? 'Uploading photos…' : loading ? 'Saving…' : 'Save Progress Log'}
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
