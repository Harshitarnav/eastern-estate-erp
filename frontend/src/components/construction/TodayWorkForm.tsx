'use client';

import { useState } from 'react';
import constructionService from '@/services/construction.service';

interface TodayWorkFormProps {
  projectId: string;
  onSuccess?: () => void;
}

export default function TodayWorkForm({ projectId, onSuccess }: TodayWorkFormProps) {
  const [formData, setFormData] = useState({
    workCompleted: '',
    issuesFaced: '',
    materialRequirements: '',
    workersPresent: '',
    safetyNotes: '',
    qualityNotes: '',
  });
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setUploading(true);
    try {
      // TODO: Implement actual image upload to your storage service
      // For now, using placeholder URLs
      const uploadedUrls = Array.from(files).map(
        (file) => URL.createObjectURL(file)
      );
      setImages([...images, ...uploadedUrls]);
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.workCompleted.trim()) {
      alert('Please describe the work completed');
      return;
    }

    setSubmitting(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      
      await constructionService.createDevelopmentUpdate(projectId, {
        updateDate: new Date().toISOString(),
        updateTitle: `Daily Update - ${today}`,
        updateDescription: formData.workCompleted,
        feedbackNotes: formData.issuesFaced || undefined,
        images: images.length > 0 ? images : undefined,
        visibility: 'INTERNAL',
      });

      // Reset form
      setFormData({
        workCompleted: '',
        issuesFaced: '',
        materialRequirements: '',
        workersPresent: '',
        safetyNotes: '',
        qualityNotes: '',
      });
      setImages([]);

      alert('Daily update submitted successfully!');
      onSuccess?.();
    } catch (error) {
      console.error('Error submitting update:', error);
      alert('Failed to submit update');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Today's Work Log</h3>
          <span className="text-sm text-gray-500">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Work Completed */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Work Completed <span className="text-red-500">*</span>
            </label>
            <textarea
              name="workCompleted"
              value={formData.workCompleted}
              onChange={handleChange}
              rows={4}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Describe the work completed today..."
            />
          </div>

          {/* Issues Faced */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Issues/Challenges Faced
            </label>
            <textarea
              name="issuesFaced"
              value={formData.issuesFaced}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Any issues or challenges encountered..."
            />
          </div>

          {/* Material Requirements */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Material Requirements
            </label>
            <textarea
              name="materialRequirements"
              value={formData.materialRequirements}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Materials needed for upcoming work..."
            />
          </div>

          {/* Workers Present */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Workers Present
            </label>
            <input
              type="number"
              name="workersPresent"
              value={formData.workersPresent}
              onChange={handleChange}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Number of workers"
            />
          </div>

          {/* Safety Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Safety & Compliance Notes
            </label>
            <textarea
              name="safetyNotes"
              value={formData.safetyNotes}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Safety observations and compliance..."
            />
          </div>

          {/* Quality Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quality Control Notes
            </label>
            <textarea
              name="qualityNotes"
              value={formData.qualityNotes}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Quality checks and observations..."
            />
          </div>

          {/* Progress Photos */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Progress Photos
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="flex text-sm text-gray-600">
                  <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                    <span>Upload photos</span>
                    <input
                      type="file"
                      className="sr-only"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploading}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
              </div>
            </div>

            {/* Image Previews */}
            {images.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-4">
                {images.map((url, index) => (
                  <div key={index} className="relative">
                    <img
                      src={url}
                      alt={`Preview ${index + 1}`}
                      className="h-24 w-full object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={submitting || uploading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {submitting ? 'Submitting...' : 'Submit Daily Update'}
          </button>
        </div>
      </div>
    </form>
  );
}
