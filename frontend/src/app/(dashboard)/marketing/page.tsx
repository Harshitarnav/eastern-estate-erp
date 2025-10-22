'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Megaphone, Plus, Search, TrendingUp, DollarSign, Users as UsersIcon, Target } from 'lucide-react';
import { marketingService, Campaign, CampaignFilters } from '@/services/marketing.service';

export default function MarketingPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState<CampaignFilters>({
    page: 1,
    limit: 12,
  });
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 0,
  });

  useEffect(() => {
    fetchCampaigns();
  }, [filters]);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const response = await marketingService.getCampaigns(filters);
      setCampaigns(response.data);
      setMeta(response.meta);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch campaigns');
      console.error('Error fetching campaigns:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return '#10B981';
      case 'COMPLETED': return '#3B82F6';
      case 'PAUSED': return '#F59E0B';
      case 'CANCELLED': return '#EF4444';
      case 'DRAFT': return '#6B7280';
      case 'PLANNED': return '#8B5CF6';
      default: return '#6B7280';
    }
  };

  const getTypeColor = (type: string) => {
    const colors: any = {
      DIGITAL: '#3B82F6',
      SOCIAL_MEDIA: '#8B5CF6',
      EMAIL: '#10B981',
      SMS: '#F59E0B',
      PRINT: '#6B7280',
      TV: '#EF4444',
      RADIO: '#F97316',
      OUTDOOR: '#14B8A6',
      EVENT: '#EC4899',
      REFERRAL: '#06B6D4',
    };
    return colors[type] || '#6B7280';
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`;
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}K`;
    return `₹${amount.toFixed(0)}`;
  };

  const formatStatus = (status: string) => {
    return status ? status.replace(/_/g, ' ') : '';
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Megaphone className="h-8 w-8" style={{ color: '#A8211B' }} />
          <h1 className="text-3xl font-bold" style={{ color: '#7B1E12' }}>
            Marketing Campaigns
          </h1>
        </div>
        <p className="text-gray-600">
          Track campaign performance, ROI, and lead generation across all channels.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search campaigns..."
                value={filters.search || ''}
                onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
              />
            </div>
          </div>

          <select
            value={filters.type || ''}
            onChange={(e) => setFilters({ ...filters, type: e.target.value || undefined, page: 1 })}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
          >
            <option value="">All Types</option>
            <option value="DIGITAL">Digital</option>
            <option value="SOCIAL_MEDIA">Social Media</option>
            <option value="EMAIL">Email</option>
            <option value="SMS">SMS</option>
            <option value="PRINT">Print</option>
            <option value="TV">TV</option>
            <option value="RADIO">Radio</option>
            <option value="OUTDOOR">Outdoor</option>
            <option value="EVENT">Event</option>
            <option value="REFERRAL">Referral</option>
          </select>

          <select
            value={filters.status || ''}
            onChange={(e) => setFilters({ ...filters, status: e.target.value || undefined, page: 1 })}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
          >
            <option value="">All Status</option>
            <option value="DRAFT">Draft</option>
            <option value="PLANNED">Planned</option>
            <option value="ACTIVE">Active</option>
            <option value="PAUSED">Paused</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <button
            onClick={() => router.push('/marketing/new')}
            className="px-6 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            style={{ backgroundColor: '#A8211B', color: 'white' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#7B1E12'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#A8211B'}
          >
            <Plus className="h-5 w-5" />
            <span>New Campaign</span>
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#A8211B' }}></div>
            <p className="text-gray-600">Loading campaigns...</p>
          </div>
        </div>
      ) : (campaigns || []).length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <Megaphone className="h-16 w-16 mx-auto mb-4" style={{ color: '#A8211B', opacity: 0.5 }} />
          <h3 className="text-xl font-semibold mb-2" style={{ color: '#7B1E12' }}>
            No Campaigns Found
          </h3>
          <p className="text-gray-600 mb-6">
            {filters.search || filters.type || filters.status
              ? 'No campaigns match your search criteria.'
              : 'Start by creating your first marketing campaign.'}
          </p>
          <button
            onClick={() => router.push('/marketing/new')}
            className="px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center gap-2"
            style={{ backgroundColor: '#A8211B', color: 'white' }}
          >
            <Plus className="h-5 w-5" />
            <span>Create First Campaign</span>
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {((campaigns || [])).map((campaign) => (
              <div
                key={campaign.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
              >
                <div className="p-4" style={{ backgroundColor: '#FEF3E2' }}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold mb-1" style={{ color: '#7B1E12' }}>
                        {campaign.name}
                      </h3>
                      <p className="text-sm text-gray-600">{campaign.type || ''}</p>
                    </div>
                    <div
                      className="px-3 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: `${getStatusColor(campaign.status)}20`,
                        color: getStatusColor(campaign.status),
                      }}
                    >
                      {formatStatus(campaign.status)}
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex gap-2 mb-4">
                    <div
                      className="px-3 py-1 rounded-lg text-xs font-medium"
                      style={{
                        backgroundColor: `${getTypeColor(campaign.type)}20`,
                        color: getTypeColor(campaign.type),
                      }}
                    >
                      {formatStatus(campaign.type)}
                    </div>
                  </div>

                  {campaign.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {campaign.description}
                    </p>
                  )}

                  {/* Budget */}
                  <div className="mb-4 pb-4 border-b">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600">Budget</span>
                      <span className="font-bold text-gray-800">
                        {formatCurrency(campaign.budget || 0)}
                      </span>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="text-xs text-gray-500 mb-4">
                    {campaign.startDate && <p>Start: {new Date(campaign.startDate).toLocaleDateString()}</p>}
                    {campaign.endDate && <p>End: {new Date(campaign.endDate).toLocaleDateString()}</p>}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => router.push(`/marketing/${campaign.id}`)}
                      className="flex-1 px-3 py-2 border rounded-lg text-sm font-medium transition-colors"
                      style={{ borderColor: '#A8211B', color: '#A8211B' }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#FEF3E2')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {meta.totalPages > 1 && (
            <div className="flex justify-center items-center gap-2">
              <button
                onClick={() => setFilters({ ...filters, page: Math.max(1, (filters.page || 1) - 1) })}
                disabled={(filters.page || 1) === 1}
                className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ borderColor: '#A8211B', color: '#A8211B' }}
              >
                Previous
              </button>
              <span className="text-gray-600">
                Page {meta.page} of {meta.totalPages}
              </span>
              <button
                onClick={() => setFilters({ ...filters, page: Math.min(meta.totalPages, (filters.page || 1) + 1) })}
                disabled={(filters.page || 1) === meta.totalPages}
                className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ borderColor: '#A8211B', color: '#A8211B' }}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Brand Footer */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          Eastern Estate ERP • Building Homes, Nurturing Bonds
        </p>
      </div>
    </div>
  );
}
