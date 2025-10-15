'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Plus, Search, Phone, Mail, Calendar, TrendingUp, Edit, Trash2, Eye, UserCheck } from 'lucide-react';
import { leadsService, Lead, LeadFilters } from '@/services/leads.service';
import { propertiesService } from '@/services/properties.service';

/**
 * Leads Management Page
 * 
 * Manage sales leads and track the sales pipeline.
 * 
 * Features:
 * - List all leads with pagination
 * - Search and filter leads
 * - Status-based filtering (New, Contacted, Qualified, etc.)
 * - Priority and source filtering
 * - Lead scoring display
 * - Quick actions (Call, Email, Assign)
 * - Eastern Estate branding
 */
export default function LeadsPage() {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState<LeadFilters>({
    page: 1,
    limit: 12,
    isActive: true,
  });
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 0,
  });

  // Fetch leads
  const fetchLeads = async () => {
    try {
      setLoading(true);
      const response = await leadsService.getLeads(filters);
      setLeads(response.data);
      setMeta(response.meta);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch leads');
      console.error('Error fetching leads:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch properties for filter
  const fetchProperties = async () => {
    try {
      const response = await propertiesService.getProperties({ isActive: true });
      setProperties(response.data);
    } catch (err) {
      console.error('Error fetching properties:', err);
    }
  };

  useEffect(() => {
    fetchLeads();
    fetchProperties();
  }, [filters]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete lead "${name}"?`)) {
      return;
    }

    try {
      await leadsService.deleteLead(id);
      fetchLeads();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete lead');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NEW':
        return '#3B82F6';
      case 'CONTACTED':
        return '#8B5CF6';
      case 'QUALIFIED':
        return '#F2C94C';
      case 'NEGOTIATION':
        return '#F97316';
      case 'WON':
        return '#3DA35D';
      case 'LOST':
        return '#EF4444';
      case 'ON_HOLD':
        return '#6B7280';
      default:
        return '#6B7280';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return '#EF4444';
      case 'HIGH':
        return '#F97316';
      case 'MEDIUM':
        return '#F2C94C';
      case 'LOW':
        return '#6B7280';
      default:
        return '#6B7280';
    }
  };

  const getStatusLabel = (status: string) => {
    return status.replace(/_/g, ' ');
  };

  const formatBudget = (min?: number, max?: number) => {
    if (!min && !max) return 'Not specified';
    const formatAmount = (amount: number) => {
      if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
      if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
      return `₹${(amount / 1000).toFixed(0)}K`;
    };
    if (min && max) return `${formatAmount(min)} - ${formatAmount(max)}`;
    if (min) return `From ${formatAmount(min)}`;
    if (max) return `Up to ${formatAmount(max)}`;
    return '';
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Users className="h-8 w-8" style={{ color: '#A8211B' }} />
          <h1 className="text-3xl font-bold" style={{ color: '#7B1E12' }}>
            Leads
          </h1>
        </div>
        <p className="text-gray-600">
          Manage sales leads and track your pipeline from first contact to conversion.
        </p>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search leads..."
                value={filters.search || ''}
                onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                style={{ focusRing: '#A8211B' }}
              />
            </div>
          </div>

          {/* Status Filter */}
          <select
            value={filters.status || ''}
            onChange={(e) => setFilters({ ...filters, status: e.target.value || undefined, page: 1 })}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
          >
            <option value="">All Status</option>
            <option value="NEW">New</option>
            <option value="CONTACTED">Contacted</option>
            <option value="QUALIFIED">Qualified</option>
            <option value="NEGOTIATION">Negotiation</option>
            <option value="WON">Won</option>
            <option value="LOST">Lost</option>
            <option value="ON_HOLD">On Hold</option>
          </select>

          {/* Priority Filter */}
          <select
            value={filters.priority || ''}
            onChange={(e) => setFilters({ ...filters, priority: e.target.value || undefined, page: 1 })}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
          >
            <option value="">All Priority</option>
            <option value="URGENT">Urgent</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          {/* Source Filter */}
          <select
            value={filters.source || ''}
            onChange={(e) => setFilters({ ...filters, source: e.target.value || undefined, page: 1 })}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
          >
            <option value="">All Sources</option>
            <option value="WEBSITE">Website</option>
            <option value="WALK_IN">Walk-in</option>
            <option value="REFERRAL">Referral</option>
            <option value="SOCIAL_MEDIA">Social Media</option>
            <option value="PHONE">Phone</option>
            <option value="EMAIL">Email</option>
            <option value="ADVERTISEMENT">Advertisement</option>
            <option value="BROKER">Broker</option>
          </select>
        </div>

        <div className="flex gap-4">
          {/* Property Filter */}
          <select
            value={filters.propertyId || ''}
            onChange={(e) => setFilters({ ...filters, propertyId: e.target.value || undefined, page: 1 })}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
          >
            <option value="">All Properties</option>
            {properties.map((property) => (
              <option key={property.id} value={property.id}>
                {property.name}
              </option>
            ))}
          </select>

          <div className="flex-1"></div>

          {/* Add Lead Button */}
          <button
            onClick={() => router.push('/leads/new')}
            className="px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            style={{ backgroundColor: '#A8211B', color: 'white' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#7B1E12'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#A8211B'}
          >
            <Plus className="h-5 w-5" />
            <span>Add Lead</span>
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#A8211B' }}></div>
            <p className="text-gray-600">Loading leads...</p>
          </div>
        </div>
      ) : leads.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <Users className="h-16 w-16 mx-auto mb-4" style={{ color: '#A8211B', opacity: 0.5 }} />
          <h3 className="text-xl font-semibold mb-2" style={{ color: '#7B1E12' }}>
            No Leads Found
          </h3>
          <p className="text-gray-600 mb-6">
            {filters.search || filters.status || filters.priority || filters.source
              ? 'No leads match your search criteria. Try adjusting your filters.'
              : 'Start growing your sales pipeline by adding your first lead.'}
          </p>
          <button
            onClick={() => router.push('/leads/new')}
            className="px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center gap-2"
            style={{ backgroundColor: '#A8211B', color: 'white' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#7B1E12'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#A8211B'}
          >
            <Plus className="h-5 w-5" />
            <span>Add Your First Lead</span>
          </button>
        </div>
      ) : (
        /* Leads Grid */
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-6">
            {leads.map((lead) => (
              <div
                key={lead.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
              >
                {/* Lead Header */}
                <div className="p-4" style={{ backgroundColor: '#FEF3E2' }}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold" style={{ color: '#7B1E12' }}>
                        {lead.firstName} {lead.lastName}
                      </h3>
                      <p className="text-sm text-gray-600">{lead.source.replace(/_/g, ' ')}</p>
                    </div>
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: getPriorityColor(lead.priority) }}
                      title={lead.priority}
                    />
                  </div>
                  <div
                    className="inline-block px-2 py-1 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: `${getStatusColor(lead.status)}20`,
                      color: getStatusColor(lead.status),
                    }}
                  >
                    {getStatusLabel(lead.status)}
                  </div>
                </div>

                {/* Lead Details */}
                <div className="p-4">
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="h-4 w-4" />
                      <span>{lead.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="h-4 w-4" />
                      <span className="truncate">{lead.email}</span>
                    </div>
                    {lead.nextFollowUpDate && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>Follow-up: {new Date(lead.nextFollowUpDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  <div className="mb-3 pb-3 border-b">
                    <p className="text-xs text-gray-500 mb-1">Budget</p>
                    <p className="text-sm font-semibold" style={{ color: '#7B1E12' }}>
                      {formatBudget(lead.budgetMin, lead.budgetMax)}
                    </p>
                  </div>

                  {/* Lead Score */}
                  {lead.leadScore > 0 && (
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-500">Lead Score</span>
                        <span className="text-xs font-semibold">{lead.leadScore}/100</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all"
                          style={{
                            width: `${lead.leadScore}%`,
                            backgroundColor: '#A8211B',
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Features */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {lead.isQualified && (
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                        Qualified
                      </span>
                    )}
                    {lead.hasSiteVisit && (
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                        Site Visit
                      </span>
                    )}
                    {lead.needsHomeLoan && (
                      <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded">
                        Loan
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => alert(`View lead: ${lead.id}`)}
                      className="flex-1 px-3 py-2 border rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                      style={{ borderColor: '#A8211B', color: '#A8211B' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FEF3E2'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <Eye className="h-4 w-4" />
                      <span>View</span>
                    </button>
                    <button
                      onClick={() => alert(`Edit lead: ${lead.id}`)}
                      className="px-3 py-2 border rounded-lg text-sm font-medium transition-colors"
                      style={{ borderColor: '#F2C94C', color: '#7B1E12' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FEF3E2'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(lead.id, `${lead.firstName} ${lead.lastName}`)}
                      className="px-3 py-2 border border-red-300 text-red-600 rounded-lg text-sm font-medium transition-colors hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
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
