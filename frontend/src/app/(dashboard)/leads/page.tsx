'use client';

import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePropertyStore } from '@/store/propertyStore';
import { leadsService, Lead, LeadFilters } from '@/services/leads.service';
import { usersService } from '@/services/users.service';
import { propertiesService } from '@/services/properties.service';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  Plus,
  Phone,
  Mail,
  MessageCircle,
  User,
  Calendar,
  Clock,
  Filter,
  Download,
  Upload,
  Zap,
  TrendingUp,
  CheckCircle2,
  Circle,
  AlertCircle,
  Loader2,
  ChevronDown,
  X,
  Check,
  ArrowUpDown,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';

const PRIORITY_COLORS = {
  URGENT: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', dot: 'bg-red-500' },
  HIGH: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', dot: 'bg-orange-500' },
  MEDIUM: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', dot: 'bg-blue-500' },
  LOW: { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-600', dot: 'bg-gray-400' },
};

const STATUS_CONFIG = {
  NEW: { icon: Circle, color: 'text-blue-600', bg: 'bg-blue-50', label: 'New' },
  CONTACTED: { icon: Phone, color: 'text-purple-600', bg: 'bg-purple-50', label: 'Contacted' },
  QUALIFIED: { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50', label: 'Qualified' },
  NEGOTIATION: { icon: TrendingUp, color: 'text-yellow-600', bg: 'bg-yellow-50', label: 'Negotiation' },
  WON: { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', label: 'Won' },
  LOST: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50', label: 'Lost' },
  ON_HOLD: { icon: Clock, color: 'text-gray-600', bg: 'bg-gray-50', label: 'On Hold' },
};

// Compact Lead Row Component - Optimized for speed
function LeadRow({
  lead,
  isSelected,
  onToggleSelect,
  onQuickAction,
  isAdmin,
  users,
  properties,
}: {
  lead: Lead;
  isSelected: boolean;
  onToggleSelect: () => void;
  onQuickAction: (action: string, leadId: string, value?: any) => void;
  isAdmin: boolean;
  users: any[];
  properties: any[];
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [editingPhone, setEditingPhone] = useState(false);
  const [phoneValue, setPhoneValue] = useState(lead.phone);
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState(lead.followUpNotes || '');
  const priority = PRIORITY_COLORS[lead.priority as keyof typeof PRIORITY_COLORS] || PRIORITY_COLORS.MEDIUM;
  const statusConfig = STATUS_CONFIG[lead.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.NEW;
  const StatusIcon = statusConfig.icon;

  const isOverdue = lead.nextFollowUpDate && new Date(lead.nextFollowUpDate) < new Date();
  const isDueToday = lead.nextFollowUpDate && 
    new Date(lead.nextFollowUpDate).toDateString() === new Date().toDateString();

  return (
    <div
      className={`group relative border-l-4 ${priority.border} ${isSelected ? 'bg-blue-50 ring-2 ring-blue-300' : 'bg-white hover:bg-gray-50'} transition-all duration-150 rounded-r-lg mb-2 shadow-sm hover:shadow-md`}
    >
      <div className="flex items-center gap-3 p-3">
        {/* Checkbox */}
        {isAdmin && (
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onToggleSelect}
            className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
          />
        )}

        {/* Priority Dot */}
        <div className={`w-3 h-3 rounded-full ${priority.dot} flex-shrink-0`} />

        {/* Lead Info - Main Content */}
        <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Name & Contact */}
          <div className="md:col-span-3">
            <div className="font-semibold text-gray-900 truncate">
              {lead.firstName} {lead.lastName}
            </div>
            <div className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
              {editingPhone ? (
                <input
                  type="tel"
                  value={phoneValue}
                  onChange={(e) => setPhoneValue(e.target.value)}
                  onBlur={() => {
                    setEditingPhone(false);
                    if (phoneValue !== lead.phone) {
                      onQuickAction('phone', lead.id, phoneValue);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setEditingPhone(false);
                      if (phoneValue !== lead.phone) {
                        onQuickAction('phone', lead.id, phoneValue);
                      }
                    }
                    if (e.key === 'Escape') {
                      setPhoneValue(lead.phone);
                      setEditingPhone(false);
                    }
                  }}
                  autoFocus
                  className="w-32 px-2 py-0.5 border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              ) : (
                <span
                  className="truncate cursor-pointer hover:bg-blue-50 px-1 rounded"
                  onClick={() => setEditingPhone(true)}
                  title="Click to edit phone"
                >
                  {lead.phone}
                </span>
              )}
              {lead.email && (
                <>
                  <span className="text-gray-300">•</span>
                  <span className="truncate">{lead.email}</span>
                </>
              )}
            </div>
          </div>

          {/* Status */}
          <div className="md:col-span-2">
            <div className="relative">
              <button
                onClick={() => setShowStatusMenu(!showStatusMenu)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${statusConfig.bg} ${statusConfig.color} text-sm font-medium hover:opacity-80 transition-opacity`}
              >
                <StatusIcon className="h-3.5 w-3.5" />
                {statusConfig.label}
                <ChevronDown className="h-3 w-3 ml-1" />
              </button>
              
              {/* Status Dropdown */}
              {showStatusMenu && (
                <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 min-w-[160px]">
                  {Object.entries(STATUS_CONFIG).map(([key, config]) => {
                    const Icon = config.icon;
                    return (
                      <button
                        key={key}
                        onClick={() => {
                          onQuickAction('status', lead.id, key);
                          setShowStatusMenu(false);
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 ${config.color}`}
                      >
                        <Icon className="h-4 w-4" />
                        {config.label}
                        {lead.status === key && <Check className="h-4 w-4 ml-auto" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Property & Source */}
          <div className="md:col-span-2">
            {isAdmin ? (
              <Select
                value={lead.propertyId || 'none'}
                onValueChange={(value) => onQuickAction('property', lead.id, value === 'none' ? null : value)}
              >
                <SelectTrigger className="h-8 text-sm border-0 bg-transparent hover:bg-gray-100">
                  <SelectValue>
                    {lead.propertyId ? (
                      <span className="flex items-center gap-1.5">
                        🏢 {properties.find((p: any) => p.id === lead.propertyId)?.name || 'Unknown'}
                      </span>
                    ) : lead.interestedPropertyTypes ? (
                      <span className="text-gray-700">{lead.interestedPropertyTypes}</span>
                    ) : (
                      <span className="text-gray-400 italic">No property</span>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">
                    <span className="text-gray-500">No specific property</span>
                  </SelectItem>
                  {properties.map((p: any) => (
                    <SelectItem key={p.id} value={p.id}>
                      🏢 {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <>
                {lead.propertyId ? (
                  <div className="text-sm font-medium text-gray-900 truncate">
                    🏢 {properties.find((p: any) => p.id === lead.propertyId)?.name || 'Unknown Property'}
                  </div>
                ) : lead.interestedPropertyTypes ? (
                  <div className="text-sm font-medium text-gray-700 truncate">
                    {lead.interestedPropertyTypes}
                  </div>
                ) : (
                  <div className="text-sm text-gray-400 italic">No property specified</div>
                )}
              </>
            )}
            <div className="text-xs text-gray-500 mt-0.5">{lead.source.replace(/_/g, ' ')}</div>
          </div>

          {/* Assigned To */}
          <div className="md:col-span-2">
            {isAdmin ? (
              <Select
                value={lead.assignedTo || 'unassigned'}
                onValueChange={(value) => onQuickAction('assign', lead.id, value === 'unassigned' ? '' : value)}
              >
                <SelectTrigger className="h-8 text-sm border-0 bg-transparent hover:bg-gray-100">
                  <SelectValue>
                    {lead.assignedTo ? (
                      <span className="flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5" />
                        {users.find(u => u.id === lead.assignedTo)?.firstName || 'Unknown'}
                      </span>
                    ) : (
                      <span className="text-gray-400 flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5" />
                        Unassigned
                      </span>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">
                    <span className="text-gray-500">Unassigned</span>
                  </SelectItem>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.firstName} {u.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="text-sm text-gray-600 flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" />
                {lead.assignedTo ? users.find(u => u.id === lead.assignedTo)?.firstName || 'Unknown' : 'Unassigned'}
              </div>
            )}
          </div>

          {/* Next Follow-up */}
          <div className="md:col-span-2">
            {lead.nextFollowUpDate ? (
              <div className={`text-sm flex items-center gap-1.5 ${isOverdue ? 'text-red-600 font-medium' : isDueToday ? 'text-orange-600 font-medium' : 'text-gray-600'}`}>
                <Calendar className="h-3.5 w-3.5" />
                {new Date(lead.nextFollowUpDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                {isOverdue && <AlertCircle className="h-3.5 w-3.5" />}
              </div>
            ) : (
              <span className="text-xs text-gray-400 italic">No follow-up</span>
            )}
          </div>

          {/* Created */}
          <div className="md:col-span-1 hidden lg:block">
            <div className="text-xs text-gray-500">
              {new Date(lead.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => window.location.href = `tel:${lead.phone}`}
            className="p-2 hover:bg-green-50 rounded-lg transition-colors group"
            title="Call"
          >
            <Phone className="h-4 w-4 text-gray-400 group-hover:text-green-600" />
          </button>
          <button
            onClick={() => window.location.href = `https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`}
            className="p-2 hover:bg-green-50 rounded-lg transition-colors group"
            title="WhatsApp"
          >
            <MessageCircle className="h-4 w-4 text-gray-400 group-hover:text-green-600" />
          </button>
          <button
            onClick={() => window.location.href = `mailto:${lead.email}`}
            className="p-2 hover:bg-blue-50 rounded-lg transition-colors group"
            title="Email"
          >
            <Mail className="h-4 w-4 text-gray-400 group-hover:text-blue-600" />
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Details"
          >
            <Eye className="h-4 w-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t border-gray-100 bg-gray-50 p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-500 font-medium">Budget:</span>
              <div className="mt-1">
                {lead.budgetMin && lead.budgetMax ? (
                  `₹${lead.budgetMin.toLocaleString()} - ₹${lead.budgetMax.toLocaleString()}`
                ) : (
                  <span className="text-gray-400 italic">Not specified</span>
                )}
              </div>
            </div>
            <div>
              <span className="text-gray-500 font-medium">Location Preference:</span>
              <div className="mt-1">{lead.preferredLocation || <span className="text-gray-400 italic">None</span>}</div>
            </div>
            <div>
              <span className="text-gray-500 font-medium">Last Contact:</span>
              <div className="mt-1">
                {lead.lastContactedAt ? (
                  new Date(lead.lastContactedAt).toLocaleDateString('en-IN')
                ) : (
                  <span className="text-gray-400 italic">Never contacted</span>
                )}
              </div>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-200">
            <span className="text-gray-500 font-medium text-sm">Follow-up Notes:</span>
            {editingNotes ? (
              <textarea
                value={notesValue}
                onChange={(e) => setNotesValue(e.target.value)}
                onBlur={() => {
                  setEditingNotes(false);
                  if (notesValue !== (lead.followUpNotes || '')) {
                    onQuickAction('notes', lead.id, notesValue);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setNotesValue(lead.followUpNotes || '');
                    setEditingNotes(false);
                  }
                }}
                autoFocus
                rows={3}
                className="mt-1 w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="Add follow-up notes..."
              />
            ) : (
              <div
                onClick={() => setEditingNotes(true)}
                className="mt-1 text-sm text-gray-700 min-h-[60px] p-2 hover:bg-blue-50 rounded cursor-pointer border border-transparent hover:border-blue-200"
                title="Click to edit notes"
              >
                {lead.followUpNotes || <span className="text-gray-400 italic">Click to add notes...</span>}
              </div>
            )}
          </div>
          <div className="mt-3 flex gap-2">
            <Button asChild size="sm" variant="outline">
              <Link href={`/leads/${lead.id}/edit`}>
                <Edit className="h-3.5 w-3.5 mr-1.5" />
                Edit Full Details
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LeadsListPage() {
  const { user } = useAuth();
  const { selectedProperties } = usePropertyStore();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [filters, setFilters] = useState<LeadFilters>({
    page: 1,
    limit: 100,
    sortBy: 'createdAt',
    sortOrder: 'DESC',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState<string>('');
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Enhanced role check - handles roles array
  const isAdmin = useMemo(() => {
    if (!user?.roles || !Array.isArray(user.roles)) return false;
    
    // Check if user has any admin role
    return user.roles.some((role: any) => {
      const roleName = (role.name || role).toUpperCase().replace(/[-_\s]/g, '');
      return roleName === 'ADMIN' || roleName === 'SUPERADMIN' || roleName === 'SALESGM';
    });
  }, [user?.roles]);

  // Debug: Log user roles and admin status
  useEffect(() => {
    console.log('🔍 User Role Debug:', {
      roles: user?.roles,
      isAdmin,
      userName: user?.firstName + ' ' + user?.lastName,
    });
  }, [user, isAdmin]);

  useEffect(() => {
    loadLeads();
    loadUsers();
    loadProperties();
  }, [filters, selectedProperties]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== filters.search) {
        setFilters({ ...filters, search: searchTerm, page: 1 });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const loadLeads = async () => {
    try {
      setLoading(true);
      const response = await leadsService.getLeads({
        ...filters,
        propertyId: selectedProperties.length > 0 ? selectedProperties[0] : undefined,
      } as any);
      setLeads(response.data);
      setTotal(response.meta.total);
      setTotalPages(response.meta.totalPages);
    } catch (error) {
      console.error('Failed to load leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const data = await usersService.getUsers();
      setUsers(Array.isArray(data) ? data : data.data || []);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const loadProperties = async () => {
    try {
      const data = await propertiesService.getProperties();
      setProperties(Array.isArray(data) ? data : data.data || []);
    } catch (error) {
      console.error('Failed to load properties:', error);
    }
  };

  const handleQuickAction = async (action: string, leadId: string, value?: any) => {
    try {
      if (action === 'status') {
        await leadsService.updateLead(leadId, { status: value as any });
      } else if (action === 'assign') {
        await leadsService.assignLead(leadId, value);
      } else if (action === 'property') {
        await leadsService.updateLead(leadId, { propertyId: value });
      } else if (action === 'phone') {
        await leadsService.updateLead(leadId, { phone: value });
      } else if (action === 'notes') {
        await leadsService.updateLead(leadId, { followUpNotes: value });
      }
      await loadLeads();
    } catch (error) {
      console.error('Quick action failed:', error);
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedLeads.size === 0) return;

    try {
      const leadIds = Array.from(selectedLeads);
      
      if (bulkAction.startsWith('assign:')) {
        const userId = bulkAction.split(':')[1];
        await leadsService.bulkAssignLeads(leadIds, userId);
      } else if (bulkAction.startsWith('status:')) {
        const status = bulkAction.split(':')[1];
        await Promise.all(leadIds.map(id => leadsService.updateLead(id, { status: status as any })));
      }
      
      await loadLeads();
      setSelectedLeads(new Set());
      setBulkAction('');
    } catch (error) {
      console.error('Bulk action failed:', error);
    }
  };

  const handleSelectAll = () => {
    if (selectedLeads.size === leads.length) {
      setSelectedLeads(new Set());
    } else {
      setSelectedLeads(new Set(leads.map(l => l.id)));
    }
  };

  // Stats for quick view
  const stats = useMemo(() => ({
    total: leads.length,
    urgent: leads.filter(l => l.priority === 'URGENT').length,
    overdue: leads.filter(l => l.nextFollowUpDate && new Date(l.nextFollowUpDate) < new Date()).length,
    unassigned: leads.filter(l => !l.assignedTo).length,
    new: leads.filter(l => l.status === 'NEW').length,
  }), [leads]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Sticky Header */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-[1800px] mx-auto px-4 py-4">
          {/* Top Bar */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
              <p className="text-sm text-gray-600 mt-0.5">
                {total} total • {stats.urgent} urgent • {stats.overdue} overdue
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={loadLeads}>
                <Zap className="h-4 w-4 mr-1.5" />
                Refresh
              </Button>
              <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700">
                <Link href="/leads/new">
                  <Plus className="h-4 w-4 mr-1.5" />
                  New Lead
                </Link>
              </Button>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col lg:flex-row gap-3">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search leads by name, phone, email..."
                className="pl-10 h-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Quick Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0">
              <Button
                variant={!filters.status ? "default" : "outline"}
                size="sm"
                onClick={() => setFilters({ ...filters, status: undefined, page: 1 })}
              >
                All ({total})
              </Button>
              <Button
                variant={filters.status === 'NEW' ? "default" : "outline"}
                size="sm"
                onClick={() => setFilters({ ...filters, status: 'NEW', page: 1 })}
              >
                New ({stats.new})
              </Button>
              <Button
                variant={filters.priority === 'URGENT' ? "default" : "outline"}
                size="sm"
                onClick={() => setFilters({ ...filters, priority: filters.priority === 'URGENT' ? undefined : 'URGENT', page: 1 })}
              >
                🔴 Urgent ({stats.urgent})
              </Button>
              <Button
                variant={filters.assignedTo === 'unassigned' ? "default" : "outline"}
                size="sm"
                onClick={() => setFilters({ ...filters, assignedTo: filters.assignedTo === 'unassigned' ? undefined : 'unassigned', page: 1 })}
              >
                Unassigned ({stats.unassigned})
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-1.5" />
                {showFilters ? 'Hide' : 'More'} Filters
              </Button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-3 pt-3 border-t border-gray-200 grid grid-cols-2 md:grid-cols-4 gap-3">
              <Select
                value={filters.status || 'all'}
                onValueChange={(v) => setFilters({ ...filters, status: v === 'all' ? undefined : v, page: 1 })}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>{config.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filters.priority || 'all'}
                onValueChange={(v) => setFilters({ ...filters, priority: v === 'all' ? undefined : v, page: 1 })}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="URGENT">Urgent</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="LOW">Low</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.assignedTo || 'all'}
                onValueChange={(v) => setFilters({ ...filters, assignedTo: v === 'all' ? undefined : v, page: 1 })}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Assignee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Assignees</SelectItem>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.firstName} {u.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button variant="outline" size="sm" onClick={() => {
                setFilters({ page: 1, limit: 100 });
                setSearchTerm('');
              }}>
                Clear All
              </Button>
            </div>
          )}

          {/* Bulk Actions Bar */}
          {isAdmin && selectedLeads.size > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200 bg-blue-50 rounded-lg p-3">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-sm font-medium text-gray-700">
                  {selectedLeads.size} selected
                </span>
                <Select value={bulkAction} onValueChange={setBulkAction}>
                  <SelectTrigger className="h-9 w-[200px] bg-white">
                    <SelectValue placeholder="Bulk action..." />
                  </SelectTrigger>
                  <SelectContent>
                    <div className="px-2 py-1.5 text-xs font-semibold text-gray-500">Assign to Agent</div>
                    {users.map((u) => (
                      <SelectItem key={u.id} value={`assign:${u.id}`}>
                        Assign to {u.firstName} {u.lastName}
                      </SelectItem>
                    ))}
                    <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 mt-2">Change Status</div>
                    {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                      <SelectItem key={key} value={`status:${key}`}>
                        Set to {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={handleBulkAction} disabled={!bulkAction} size="sm">
                  Apply to {selectedLeads.size} leads
                </Button>
                <Button variant="outline" size="sm" onClick={() => setSelectedLeads(new Set())}>
                  Clear Selection
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1800px] mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : leads.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="text-gray-400 mb-4">
              <Search className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No leads found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filters.status || filters.priority
                ? 'Try adjusting your filters or search term'
                : 'Get started by adding your first lead'}
            </p>
            <Button asChild>
              <Link href="/leads/new">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Lead
              </Link>
            </Button>
          </Card>
        ) : (
          <>
            {/* Select All Checkbox */}
            {isAdmin && (
              <div className="flex items-center gap-3 mb-4 p-3 bg-white rounded-lg border border-gray-200">
                <input
                  type="checkbox"
                  checked={selectedLeads.size === leads.length && leads.length > 0}
                  onChange={handleSelectAll}
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span className="text-sm font-medium text-gray-700">
                  {selectedLeads.size === leads.length && leads.length > 0
                    ? 'Deselect all'
                    : 'Select all on this page'}
                </span>
                <span className="text-sm text-gray-500">
                  ({leads.length} leads)
                </span>
              </div>
            )}

            {/* Leads List */}
            <div className="space-y-0">
              {leads.map((lead) => (
                <LeadRow
                  key={lead.id}
                  lead={lead}
                  isSelected={selectedLeads.has(lead.id)}
                  onToggleSelect={() => {
                    const newSelected = new Set(selectedLeads);
                    if (newSelected.has(lead.id)) {
                      newSelected.delete(lead.id);
                    } else {
                      newSelected.add(lead.id);
                    }
                    setSelectedLeads(newSelected);
                  }}
                  onQuickAction={handleQuickAction}
                  isAdmin={isAdmin}
                  users={users}
                  properties={properties}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between bg-white rounded-lg border border-gray-200 p-4">
                <div className="text-sm text-gray-700">
                  Page {filters.page} of {totalPages} • Showing {leads.length} of {total} leads
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFilters({ ...filters, page: filters.page! - 1 })}
                    disabled={filters.page === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFilters({ ...filters, page: filters.page! + 1 })}
                    disabled={filters.page === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
