'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  Plus,
  Search,
  Phone,
  Mail,
  Calendar,
  TrendingUp,
  Edit,
  Trash2,
  Eye,
  Loader2,
} from 'lucide-react';
import { leadsService, Lead, LeadFilters } from '@/services/leads.service';
import { propertiesService } from '@/services/properties.service';
import { BrandHero, BrandPrimaryButton, BrandSecondaryButton } from '@/components/layout/BrandHero';
import { BrandStatCard } from '@/components/layout/BrandStatCard';
import { brandPalette, formatIndianNumber } from '@/utils/brand';

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

  const stats = useMemo(() => {
    const total = meta.total || leads.length;
    const active = leads.filter((lead) => lead.status !== 'LOST').length;
    const won = leads.filter((lead) => lead.status === 'WON').length;
    const hot = leads.filter((lead) => lead.priority === 'URGENT' || lead.priority === 'HIGH').length;
    const siteVisits = leads.filter((lead) => lead.hasSiteVisit).length;

    return {
      total,
      active,
      won,
      hot,
      siteVisits,
      conversionRate: total > 0 ? (won / total) * 100 : 0,
    };
  }, [leads, meta.total]);

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
        return brandPalette.accent;
      case 'NEGOTIATION':
        return '#F97316';
      case 'WON':
        return brandPalette.success;
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
        return brandPalette.accent;
      case 'LOW':
        return '#6B7280';
      default:
        return '#6B7280';
    }
  };

  const getStatusLabel = (status: string) => status.replace(/_/g, ' ');

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
    <div
      className="p-6 md:p-8 space-y-8 min-h-full"
      style={{ backgroundColor: brandPalette.background, borderRadius: '24px' }}
    >
      <BrandHero
        eyebrow="Sales Pipeline"
        title={
          <>
            Nurture leads into{' '}
            <span style={{ color: brandPalette.accent }}>lifelong residents</span>
          </>
        }
        description="Prioritise follow-ups, track conversion progress, and keep your sales funnel healthy with a unified lead workspace."
        actions={
          <>
            <BrandPrimaryButton onClick={() => router.push('/leads/new')}>
              <Plus className="w-4 h-4" />
              Add Lead
            </BrandPrimaryButton>
            <BrandSecondaryButton onClick={() => router.push('/customers')}>
              View Customers
            </BrandSecondaryButton>
          </>
        }
      />

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <BrandStatCard
          title="Total Leads"
          primary={formatIndianNumber(stats.total)}
          subLabel={`${formatIndianNumber(stats.active)} active in pipeline`}
          icon={<Users className="w-8 h-8" />}
          accentColor={brandPalette.accent}
        />
        <BrandStatCard
          title="Hot Leads"
          primary={formatIndianNumber(stats.hot)}
          subLabel={`${formatIndianNumber(stats.siteVisits)} site visits booked`}
          icon={<TrendingUp className="w-8 h-8" />}
          accentColor="rgba(61, 163, 93, 0.25)"
        />
        <BrandStatCard
          title="Deals Won"
          primary={formatIndianNumber(stats.won)}
          subLabel={`${stats.conversionRate.toFixed(1)}% conversion rate`}
          icon={<Calendar className="w-8 h-8" />}
          accentColor="rgba(168, 33, 27, 0.18)"
        />
        <BrandStatCard
          title="Follow-ups Due"
          primary={formatIndianNumber(
            leads.filter((lead) => lead.nextFollowUpDate && new Date(lead.nextFollowUpDate) <= new Date()).length,
          )}
          subLabel="Plan your day with confidence"
          icon={<Phone className="w-8 h-8" />}
          accentColor={brandPalette.neutral}
        />
      </section>

      <div
        className="rounded-2xl border bg-white/90 backdrop-blur-sm shadow-sm p-5 space-y-4"
        style={{ borderColor: `${brandPalette.neutral}80` }}
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, phone or notes..."
              value={filters.search || ''}
              onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A8211B]"
            />
          </div>
          <div className="flex gap-3">
            <BrandPrimaryButton onClick={() => router.push('/leads/new')}>
              <Plus className="w-4 h-4" />
              New Lead
            </BrandPrimaryButton>
            <BrandSecondaryButton onClick={() => router.push('/marketing')}>
              Campaign Insights
            </BrandSecondaryButton>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <select
            value={filters.propertyId || ''}
            onChange={(e) =>
              setFilters({ ...filters, propertyId: e.target.value || undefined, page: 1 })
            }
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A8211B]"
          >
            <option value="">All Properties</option>
            {properties.map((property) => (
              <option key={property.id} value={property.id}>
                {property.name}
              </option>
            ))}
          </select>

          <select
            value={filters.status || ''}
            onChange={(e) => setFilters({ ...filters, status: e.target.value || undefined, page: 1 })}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A8211B]"
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

          <select
            value={filters.priority || ''}
            onChange={(e) => setFilters({ ...filters, priority: e.target.value || undefined, page: 1 })}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A8211B]"
          >
            <option value="">All Priority</option>
            <option value="URGENT">Urgent</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          <select
            value={filters.source || ''}
            onChange={(e) => setFilters({ ...filters, source: e.target.value || undefined, page: 1 })}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A8211B]"
          >
            <option value="">All Sources</option>
            <option value="WEBSITE">Website</option>
            <option value="REFERRAL">Referral</option>
            <option value="SOCIAL_MEDIA">Social Media</option>
            <option value="BROKER">Broker</option>
            <option value="ADVERTISEMENT">Advertisement</option>
            <option value="WALK_IN">Walk-in</option>
            <option value="PHONE">Phone</option>
            <option value="EMAIL">Email</option>
            <option value="EXHIBITION">Exhibition</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
      </div>

      {error && (
        <div
          className="rounded-2xl border px-4 py-3 text-sm"
          style={{
            borderColor: 'rgba(168, 33, 27, 0.25)',
            backgroundColor: 'rgba(168, 33, 27, 0.08)',
            color: brandPalette.primary,
          }}
        >
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-16">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin" style={{ color: brandPalette.primary }} />
            <p className="text-gray-600 text-sm">Loading leads...</p>
          </div>
        </div>
      ) : leads.length === 0 ? (
        <div className="bg-white/90 rounded-3xl border p-12 text-center shadow-sm">
          <Users className="h-16 w-16 mx-auto mb-4" style={{ color: brandPalette.primary, opacity: 0.55 }} />
          <h3 className="text-xl font-semibold mb-2" style={{ color: brandPalette.secondary }}>
            No Leads Found
          </h3>
          <p className="text-gray-600 mb-6">
            {filters.search ||
            filters.propertyId ||
            filters.status ||
            filters.priority ||
            filters.source
              ? 'No leads match your search criteria. Try adjusting your filters.'
              : 'Start by capturing new enquiries to build your pipeline.'}
          </p>
          <BrandPrimaryButton onClick={() => router.push('/leads/new')}>
            <Plus className="w-4 h-4" />
            Add Your First Lead
          </BrandPrimaryButton>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {leads.map((lead) => (
              <div
                key={lead.id}
                className="bg-white rounded-2xl border shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                style={{ borderColor: `${brandPalette.neutral}60` }}
              >
                <div
                  className="p-4 flex items-center justify-between"
                  style={{ backgroundColor: `${brandPalette.neutral}80` }}
                >
                  <div>
                    <h3 className="text-lg font-semibold" style={{ color: brandPalette.secondary }}>
                      {lead.firstName} {lead.lastName}
                    </h3>
                    <p className="text-xs uppercase tracking-wide text-gray-600">
                      {lead.source.replace(/_/g, ' ')}
                    </p>
                  </div>
                  <span
                    className="px-2 py-1 text-xs font-medium rounded-full"
                    style={{
                      backgroundColor: `${getPriorityColor(lead.priority)}15`,
                      color: getPriorityColor(lead.priority),
                    }}
                  >
                    {lead.priority}
                  </span>
                </div>

                <div className="p-4 space-y-4">
                  <div className="flex flex-col gap-2 text-sm text-gray-600">
                    <span className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      {lead.phone}
                    </span>
                    <span className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      {lead.email}
                    </span>
                  </div>

                  <div className="border rounded-xl p-3 bg-gray-50 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500">Budget</p>
                      <p className="text-sm font-semibold" style={{ color: brandPalette.secondary }}>
                        {formatBudget(lead.budgetMin, lead.budgetMax)}
                      </p>
                    </div>
                    <span
                      className="px-2 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: `${getStatusColor(lead.status)}15`,
                        color: getStatusColor(lead.status),
                      }}
                    >
                      {getStatusLabel(lead.status)}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-xs text-gray-500">Calls</p>
                      <p className="font-semibold" style={{ color: brandPalette.secondary }}>
                        {lead.totalCalls}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Emails</p>
                      <p className="font-semibold" style={{ color: brandPalette.secondary }}>
                        {lead.totalEmails}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Site Visits</p>
                      <p className="font-semibold" style={{ color: brandPalette.secondary }}>
                        {lead.totalSiteVisits}
                      </p>
                    </div>
                  </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => router.push(`/leads/${lead.id}`)}
                        className="flex-1 px-3 py-2 border rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 hover:bg-[#F9F7F3]"
                        style={{ borderColor: brandPalette.primary, color: brandPalette.primary }}
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </button>
                      <button
                        onClick={() => router.push(`/leads/${lead.id}/edit`)}
                        className="px-3 py-2 border rounded-lg text-sm font-medium transition-colors hover:bg-[#FEF3E2]"
                        style={{ borderColor: brandPalette.accent, color: brandPalette.secondary }}
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    <button
                      onClick={() =>
                        handleDelete(lead.id, `${lead.firstName} ${lead.lastName}`)
                      }
                      className="px-3 py-2 border rounded-lg text-sm font-medium transition-colors hover:bg-red-50"
                      style={{ borderColor: '#FCA5A5', color: '#B91C1C' }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {meta.totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 pt-4">
              <button
                onClick={() => setFilters({ ...filters, page: Math.max(1, (filters.page || 1) - 1) })}
                disabled={(filters.page || 1) === 1}
                className="px-4 py-2 border rounded-full text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ borderColor: brandPalette.primary, color: brandPalette.primary }}
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {meta.page} of {meta.totalPages}
              </span>
              <button
                onClick={() =>
                  setFilters({ ...filters, page: Math.min(meta.totalPages, (filters.page || 1) + 1) })
                }
                disabled={(filters.page || 1) === meta.totalPages}
                className="px-4 py-2 border rounded-full text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ borderColor: brandPalette.primary, color: brandPalette.primary }}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      <div className="pt-6 text-center text-sm text-gray-500">
        Eastern Estate ERP • Building Homes, Nurturing Bonds
      </div>
    </div>
  );
}
