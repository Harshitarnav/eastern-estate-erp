'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Edit, Trash2, Megaphone, FileText, Paperclip, Download, Calendar, DollarSign } from 'lucide-react';
import { marketingService, Campaign } from '@/services/marketing.service';

export default function CampaignDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

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
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch campaign');
      console.error('Error fetching campaign:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await marketingService.deleteCampaign(id);
      router.push('/marketing');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete campaign');
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': case 'Active': return '#10B981';
      case 'COMPLETED': case 'Completed': return '#3B82F6';
      case 'PAUSED': case 'Paused': return '#F59E0B';
      case 'CANCELLED': case 'Cancelled': return '#EF4444';
      case 'DRAFT': case 'Draft': return '#6B7280';
      case 'PLANNED': case 'Planned': case 'Planning': return '#8B5CF6';
      default: return '#6B7280';
    }
  };

  const getTypeColor = (type: string) => {
    const colors: any = {
      DIGITAL: '#3B82F6',
      'Social Media': '#8B5CF6',
      EMAIL: '#10B981',
      Email: '#10B981',
      SMS: '#F59E0B',
      PRINT: '#6B7280',
      TV: '#EF4444',
      RADIO: '#F97316',
      OUTDOOR: '#14B8A6',
      EVENT: '#EC4899',
      Event: '#EC4899',
      REFERRAL: '#06B6D4',
    };
    return colors[type] || '#6B7280';
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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

  if (error && !campaign) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {error}
        </div>
        <button
          onClick={() => router.push('/marketing')}
          className="mt-4 px-4 py-2 border rounded-lg"
          style={{ borderColor: '#A8211B', color: '#A8211B' }}
        >
          Back to Campaigns
        </button>
      </div>
    );
  }

  if (!campaign) return null;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push('/marketing')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Campaigns</span>
        </button>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Megaphone className="h-8 w-8" style={{ color: '#A8211B' }} />
            <div>
              <h1 className="text-3xl font-bold" style={{ color: '#7B1E12' }}>
                {campaign.name}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <div
                  className="px-3 py-1 rounded-full text-sm font-medium"
                  style={{
                    backgroundColor: `${getStatusColor(campaign.status)}20`,
                    color: getStatusColor(campaign.status),
                  }}
                >
                  {campaign.status}
                </div>
                <div
                  className="px-3 py-1 rounded-lg text-sm font-medium"
                  style={{
                    backgroundColor: `${getTypeColor(campaign.type)}20`,
                    color: getTypeColor(campaign.type),
                  }}
                >
                  {campaign.type}
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => router.push(`/marketing/${id}/edit`)}
              className="px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
              style={{ backgroundColor: '#A8211B', color: 'white' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#7B1E12'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#A8211B'}
            >
              <Edit className="h-5 w-5" />
              <span>Edit</span>
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 border border-red-500 text-red-500 rounded-lg font-medium hover:bg-red-50 transition-colors flex items-center gap-2"
            >
              <Trash2 className="h-5 w-5" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          {campaign.description && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4" style={{ color: '#7B1E12' }}>
                Description
              </h2>
              <p className="text-gray-700 whitespace-pre-wrap">{campaign.description}</p>
            </div>
          )}

          {/* Notes */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5" style={{ color: '#A8211B' }} />
              <h2 className="text-xl font-semibold" style={{ color: '#7B1E12' }}>
                Notes
              </h2>
            </div>
            {campaign.notes ? (
              <p className="text-gray-700 whitespace-pre-wrap">{campaign.notes}</p>
            ) : (
              <p className="text-gray-400 italic">No notes added yet</p>
            )}
          </div>

          {/* Attachments */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-2 mb-4">
              <Paperclip className="h-5 w-5" style={{ color: '#A8211B' }} />
              <h2 className="text-xl font-semibold" style={{ color: '#7B1E12' }}>
                Attachments
              </h2>
            </div>
            {campaign.attachments && (campaign.attachments || []).length > 0 ? (
              <div className="space-y-2">
                {(campaign.attachments || []).map((file: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <Paperclip className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-800">{file.filename}</p>
                        <p className="text-xs text-gray-500">
                          {file.type} • {(file.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    </div>
                    <a
                      href={file.url}
                      download={file.filename}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Download"
                    >
                      <Download className="h-5 w-5" style={{ color: '#A8211B' }} />
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 italic">No attachments</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Budget */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="h-5 w-5" style={{ color: '#A8211B' }} />
              <h3 className="font-semibold" style={{ color: '#7B1E12' }}>Budget</h3>
            </div>
            <p className="text-3xl font-bold" style={{ color: '#A8211B' }}>
              {formatCurrency(campaign.budget || 0)}
            </p>
          </div>

          {/* Dates */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="h-5 w-5" style={{ color: '#A8211B' }} />
              <h3 className="font-semibold" style={{ color: '#7B1E12' }}>Timeline</h3>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Start Date</p>
                <p className="font-medium">{formatDate(campaign.startDate)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">End Date</p>
                <p className="font-medium">{formatDate(campaign.endDate)}</p>
              </div>
            </div>
          </div>

          {/* Metadata */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="font-semibold mb-3" style={{ color: '#7B1E12' }}>Information</h3>
            <div className="space-y-2 text-sm">
              <div>
                <p className="text-gray-600">Created</p>
                <p className="font-medium">{formatDate(campaign.createdAt)}</p>
              </div>
              <div>
                <p className="text-gray-600">Last Updated</p>
                <p className="font-medium">{formatDate(campaign.updatedAt)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4" style={{ color: '#7B1E12' }}>
              Confirm Delete
            </h3>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete "{campaign.name}"? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
