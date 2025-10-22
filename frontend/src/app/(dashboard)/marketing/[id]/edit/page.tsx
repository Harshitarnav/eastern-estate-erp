'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, Upload, X, Paperclip, Loader } from 'lucide-react';
import { marketingService, Campaign } from '@/services/marketing.service';
import ErrorModal from '@/components/modals/ErrorModal';

export default function EditCampaignPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [errorModal, setErrorModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    details: string[];
  }>({
    isOpen: false,
    title: '',
    message: '',
    details: []
  });
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: '',
    status: '',
    budget: 0,
    startDate: '',
    endDate: '',
    notes: '',
  });
  const [attachments, setAttachments] = useState<any[]>([]);

  // Helper function to parse error and show modal
  const showErrorModal = (err: any, defaultMessage: string) => {
    const message = err.response?.data?.message || defaultMessage;
    const details: string[] = [];
    
    // Parse validation errors if present
    if (err.response?.data?.errors) {
      const errors = err.response.data.errors;
      if (Array.isArray(errors)) {
        details.push(...errors);
      } else if (typeof errors === 'object') {
        Object.entries(errors).forEach(([field, msgs]) => {
          if (Array.isArray(msgs)) {
            msgs.forEach(msg => details.push(`${field}: ${msg}`));
          } else {
            details.push(`${field}: ${msgs}`);
          }
        });
      }
    }
    
    setErrorModal({
      isOpen: true,
      title: 'Operation Failed',
      message,
      details
    });
    
    console.error('Error:', err);
  };

  useEffect(() => {
    if (id) {
      fetchCampaign();
    }
  }, [id]);

  const fetchCampaign = async () => {
    try {
      setLoading(true);
      const data = await marketingService.getCampaign(id);
      setCampaign(data);
      setFormData({
        name: data.name || '',
        description: data.description || '',
        type: data.type || '',
        status: data.status || '',
        budget: data.budget || 0,
        startDate: data.startDate ? new Date(data.startDate).toISOString().split('T')[0] : '',
        endDate: data.endDate ? new Date(data.endDate).toISOString().split('T')[0] : '',
        notes: data.notes || '',
      });
      setAttachments(data.attachments || []);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch campaign');
      console.error('Error fetching campaign:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'budget' ? parseFloat(value) || 0 : value
    }));
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || (files || []).length === 0) return;

    setUploading(true);
    setError('');

    try {
      for (let i = 0; i < (files || []).length; i++) {
        const file = files[i];
        const { url, filename } = await marketingService.uploadFile(file);
        
        const newAttachment = {
          filename: filename || file.name,
          url,
          type: file.type,
          size: file.size,
          uploadedAt: new Date().toISOString()
        };

        setAttachments(prev => [...prev, newAttachment]);
      }
    } catch (err: any) {
      showErrorModal(err, 'Failed to upload file. Please check the file and try again.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleFileSelect(e.dataTransfer.files);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => ((prev || [])).filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.type || !formData.status) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setSaving(true);
      setError('');

      await marketingService.updateCampaign(id, {
        ...formData,
        attachments
      });

      router.push(`/marketing/${id}`);
    } catch (err: any) {
      showErrorModal(err, 'Failed to update campaign. Please check your inputs and try again.');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#A8211B' }}></div>
            <p className="text-gray-600">Loading campaign...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          Campaign not found
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Error Modal */}
      <ErrorModal
        isOpen={errorModal.isOpen}
        onClose={() => setErrorModal(prev => ({ ...prev, isOpen: false }))}
        title={errorModal.title}
        message={errorModal.message}
        details={errorModal.details}
      />

      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push(`/marketing/${id}`)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Campaign</span>
        </button>

        <h1 className="text-3xl font-bold" style={{ color: '#7B1E12' }}>
          Edit Campaign
        </h1>
        <p className="text-gray-600 mt-1">Update campaign details, notes, and attachments</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4" style={{ color: '#7B1E12' }}>
                Basic Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Campaign Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                    style={{ focusRing: '#A8211B' }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                    >
                      <option value="">Select Type</option>
                      <option value="Digital">Digital</option>
                      <option value="Social Media">Social Media</option>
                      <option value="Email">Email</option>
                      <option value="SMS">SMS</option>
                      <option value="Print">Print</option>
                      <option value="TV">TV</option>
                      <option value="Radio">Radio</option>
                      <option value="Outdoor">Outdoor</option>
                      <option value="Event">Event</option>
                      <option value="Referral">Referral</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                    >
                      <option value="">Select Status</option>
                      <option value="Draft">Draft</option>
                      <option value="Planning">Planning</option>
                      <option value="Active">Active</option>
                      <option value="Paused">Paused</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Budget (₹)
                  </label>
                  <input
                    type="number"
                    name="budget"
                    value={formData.budget}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4" style={{ color: '#7B1E12' }}>
                Notes
              </h2>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={6}
                placeholder="Add campaign notes, observations, or important details..."
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
              />
            </div>

            {/* Attachments */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4" style={{ color: '#7B1E12' }}>
                Attachments
              </h2>

              {/* Upload Area */}
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="border-2 border-dashed rounded-lg p-8 text-center mb-4 hover:bg-gray-50 transition-colors"
                style={{ borderColor: uploading ? '#A8211B' : '#D1D5DB' }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={(e) => handleFileSelect(e.target.files)}
                  className="hidden"
                  id="file-upload"
                />
                {uploading ? (
                  <div className="flex flex-col items-center">
                    <Loader className="h-12 w-12 animate-spin mb-3" style={{ color: '#A8211B' }} />
                    <p className="text-gray-600">Uploading files...</p>
                  </div>
                ) : (
                  <>
                    <Upload className="h-12 w-12 mx-auto mb-3" style={{ color: '#A8211B' }} />
                    <p className="text-gray-700 font-medium mb-1">
                      Drop files here or click to upload
                    </p>
                    <p className="text-sm text-gray-500">
                      Support for images, documents, and more
                    </p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-4 px-4 py-2 rounded-lg font-medium transition-colors"
                      style={{ backgroundColor: '#A8211B', color: 'white' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#7B1E12'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#A8211B'}
                    >
                      Select Files
                    </button>
                  </>
                )}
              </div>

              {/* Attachments List */}
              {(attachments || []).length > 0 && (
                <div className="space-y-2">
                  {((attachments || [])).map((file: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <Paperclip className="h-5 w-5 text-gray-400" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-800 truncate">{file.filename}</p>
                          <p className="text-xs text-gray-500">
                            {file.type} • {(file.size / 1024).toFixed(2)} KB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAttachment(index)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-500"
                        title="Remove"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons - Sidebar */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-md p-6">
              <button
                type="submit"
                disabled={saving}
                className="w-full px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                style={{ backgroundColor: '#A8211B', color: 'white' }}
                onMouseEnter={(e) => !saving && (e.currentTarget.style.backgroundColor = '#7B1E12')}
                onMouseLeave={(e) => !saving && (e.currentTarget.style.backgroundColor = '#A8211B')}
              >
                {saving ? (
                  <>
                    <Loader className="h-5 w-5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => router.push(`/marketing/${id}`)}
                disabled={saving}
                className="w-full mt-3 px-4 py-3 border rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Tip:</strong> You can drag and drop multiple files at once to upload them quickly.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
