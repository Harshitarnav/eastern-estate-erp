'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { leadsService, Lead, LeadFilters } from '@/services/leads.service';
import { followupsService } from '@/services/followups.service';
import { usersService } from '@/services/users.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  RefreshCw,
  History,
  X,
  Save,
  Edit2,
  Phone,
  Mail,
  User,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Calendar,
  MapPin,
  DollarSign,
  Home,
  Building,
} from 'lucide-react';
import Link from 'next/link';

// Excel-like editable cell component - enhanced for mobile
interface EditableCellProps {
  value: any;
  onSave: (value: any) => Promise<void>;
  type?: 'text' | 'select' | 'date' | 'number' | 'textarea';
  options?: { label: string; value: string }[];
  disabled?: boolean;
  label?: string;
  fullWidth?: boolean;
}

function EditableCell({ 
  value, 
  onSave, 
  type = 'text', 
  options = [], 
  disabled = false,
  label,
  fullWidth = false 
}: EditableCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (editValue === value) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      await onSave(editValue);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save:', error);
      setEditValue(value);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  if (disabled) {
    return <span className="text-sm text-gray-700">{value || '—'}</span>;
  }

  if (!isEditing) {
    return (
      <div className={`flex items-center justify-between gap-2 ${fullWidth ? 'w-full' : ''}`}>
        <div className="flex-1 min-w-0">
          {label && <span className="text-xs text-gray-500 block mb-1">{label}</span>}
          <span className="text-sm text-gray-900 block truncate">{value || 'Not set'}</span>
        </div>
        <button
          onClick={() => setIsEditing(true)}
          className="flex-shrink-0 p-2 hover:bg-blue-50 rounded-lg transition-colors"
          title="Edit"
        >
          <Edit2 className="h-4 w-4 text-blue-600" />
        </button>
      </div>
    );
  }

  if (type === 'select' && options.length > 0) {
    return (
      <div className="flex flex-col gap-2 w-full">
        {label && <span className="text-xs text-gray-500">{label}</span>}
        <div className="flex items-center gap-2">
          <Select value={editValue} onValueChange={setEditValue}>
            <SelectTrigger className="h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="sm" onClick={handleSave} disabled={isSaving} className="h-10">
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          </Button>
          <Button size="sm" variant="outline" onClick={handleCancel} className="h-10">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  if (type === 'textarea') {
    return (
      <div className="flex flex-col gap-2 w-full">
        {label && <span className="text-xs text-gray-500">{label}</span>}
        <textarea
          value={editValue || ''}
          onChange={(e) => setEditValue(e.target.value)}
          className="text-sm border rounded-lg px-3 py-2 w-full min-h-[80px] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          autoFocus
          placeholder="Enter notes..."
        />
        <div className="flex gap-2">
          <Button size="sm" onClick={handleSave} disabled={isSaving} className="flex-1">
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
          </Button>
          <Button size="sm" variant="outline" onClick={handleCancel} className="flex-1">
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 w-full">
      {label && <span className="text-xs text-gray-500">{label}</span>}
      <div className="flex items-center gap-2">
        <Input
          type={type}
          value={editValue || ''}
          onChange={(e) => setEditValue(e.target.value)}
          className="h-10"
          autoFocus
          placeholder={label || ''}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave();
            if (e.key === 'Escape') handleCancel();
          }}
        />
        <Button size="sm" onClick={handleSave} disabled={isSaving} className="h-10">
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        </Button>
        <Button size="sm" variant="outline" onClick={handleCancel} className="h-10">
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// Mobile Lead Card Component
interface LeadCardProps {
  lead: Lead;
  users: any[];
  onUpdate: (leadId: string, field: string, value: any) => Promise<void>;
  onAssign: (leadId: string, userId: string) => Promise<void>;
  onViewHistory: (lead: Lead) => void;
  isAdmin: boolean;
  statusOptions: { label: string; value: string }[];
  priorityOptions: { label: string; value: string }[];
  getStatusColor: (status: string) => string;
  getPriorityColor: (priority: string) => string;
  getAssignedUserName: (assignedTo?: string) => string;
  getTeamAssignmentsWithTasks: (lead: Lead) => Array<{ name: string; task: string }>;
}

function LeadCard({
  lead,
  users,
  onUpdate,
  onAssign,
  onViewHistory,
  isAdmin,
  statusOptions,
  priorityOptions,
  getStatusColor,
  getPriorityColor,
  getAssignedUserName,
  getTeamAssignmentsWithTasks,
}: LeadCardProps) {
  const priorityColors = {
    URGENT: 'from-red-500 to-red-600',
    HIGH: 'from-orange-500 to-orange-600',
    MEDIUM: 'from-blue-500 to-blue-600',
    LOW: 'from-gray-400 to-gray-500',
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border-l-4" 
      style={{ borderLeftColor: lead.priority === 'URGENT' ? '#ef4444' : lead.priority === 'HIGH' ? '#f97316' : '#3b82f6' }}>
      {/* Card Header with Gradient */}
      <div className={`bg-gradient-to-r ${priorityColors[lead.priority as keyof typeof priorityColors] || priorityColors.MEDIUM} p-4 text-white`}>
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3 className="font-bold text-lg">{lead.firstName} {lead.lastName}</h3>
            <p className="text-sm opacity-90">{lead.source.replace(/_/g, ' ')}</p>
          </div>
          <Badge className="bg-white/20 text-white border-white/30">
            {lead.priority}
          </Badge>
        </div>
        
        {/* Contact Info */}
        <div className="flex flex-wrap gap-3 mt-3">
          <a href={`tel:${lead.phone}`} className="flex items-center gap-1.5 text-sm bg-white/20 hover:bg-white/30 rounded-full px-3 py-1.5 transition-colors">
            <Phone className="h-3.5 w-3.5" />
            {lead.phone}
          </a>
          <a href={`mailto:${lead.email}`} className="flex items-center gap-1.5 text-sm bg-white/20 hover:bg-white/30 rounded-full px-3 py-1.5 transition-colors">
            <Mail className="h-3.5 w-3.5" />
            Email
          </a>
        </div>
      </div>

      <CardContent className="p-4 space-y-4">
        {/* Status Badge */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Status</span>
          <Badge className={`${getStatusColor(lead.status)} border`}>
            {lead.status}
          </Badge>
        </div>

        {/* Contact Details - Editable */}
        <div className="bg-amber-50 rounded-lg p-3 space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <User className="h-4 w-4 text-amber-600" />
            <span className="text-sm font-semibold text-amber-900">Contact Information</span>
          </div>
          
          <EditableCell
            label="Full Name"
            value={`${lead.firstName} ${lead.lastName}`.trim()}
            type="text"
            onSave={(value) => onUpdate(lead.id, 'fullName', value)}
            fullWidth
          />
          
          <EditableCell
            label="Email"
            value={lead.email}
            type="text"
            onSave={(value) => onUpdate(lead.id, 'email', value)}
            fullWidth
          />
          
          <div className="grid grid-cols-2 gap-2">
            <EditableCell
              label="Phone"
              value={lead.phone}
              type="text"
              onSave={(value) => onUpdate(lead.id, 'phone', value)}
              fullWidth
            />
            <EditableCell
              label="Alt. Phone"
              value={lead.alternatePhone || ''}
              type="text"
              onSave={(value) => onUpdate(lead.id, 'alternatePhone', value)}
              fullWidth
            />
          </div>

          <EditableCell
            label="Address"
            value={lead.address || ''}
            type="text"
            onSave={(value) => onUpdate(lead.id, 'address', value)}
            fullWidth
          />

          <div className="grid grid-cols-2 gap-2">
            <EditableCell
              label="City"
              value={lead.city || ''}
              type="text"
              onSave={(value) => onUpdate(lead.id, 'city', value)}
              fullWidth
            />
            <EditableCell
              label="State"
              value={lead.state || ''}
              type="text"
              onSave={(value) => onUpdate(lead.id, 'state', value)}
              fullWidth
            />
          </div>
        </div>

        {/* Property Interest */}
        <div className="bg-gray-50 rounded-lg p-3 space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <Home className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-semibold text-gray-700">Property Interest</span>
          </div>
          
          <EditableCell
            label="Property Type"
            value={lead.interestedPropertyTypes || 'Not specified'}
            type="text"
            onSave={(value) => onUpdate(lead.id, 'interestedPropertyTypes', value)}
            fullWidth
          />
          
          <div className="grid grid-cols-2 gap-2">
            <EditableCell
              label="Min Budget (₹)"
              value={lead.budgetMin || ''}
              type="number"
              onSave={(value) => onUpdate(lead.id, 'budgetMin', parseFloat(value) || 0)}
              fullWidth
            />
            <EditableCell
              label="Max Budget (₹)"
              value={lead.budgetMax || ''}
              type="number"
              onSave={(value) => onUpdate(lead.id, 'budgetMax', parseFloat(value) || 0)}
              fullWidth
            />
          </div>

          {lead.preferredLocation && (
            <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
              <MapPin className="h-4 w-4" />
              <span>{lead.preferredLocation}</span>
            </div>
          )}
        </div>

        {/* Assignment Section */}
        <div className="space-y-2">
          {isAdmin ? (
            <div className="bg-blue-50 rounded-lg p-3 space-y-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-semibold text-blue-900">Team Assignments</span>
              </div>
              {getTeamAssignmentsWithTasks(lead).length > 0 ? (
                <div className="space-y-1.5">
                  {getTeamAssignmentsWithTasks(lead).map((assignment, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-white rounded px-3 py-2">
                      <span className="text-xs font-medium text-blue-900">{assignment.task}:</span>
                      <span className="text-xs text-gray-700 font-semibold">{assignment.name}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500 italic">No team assigned</p>
              )}
              <p className="text-[10px] text-gray-500 italic">💡 Add tasks in notes: "call - Name, site visit - Name"</p>
            </div>
          ) : (
            <EditableCell
              label="Assigned To"
              value={lead.assignedTo || 'unassigned'}
              type="select"
              options={[
                { label: 'Unassigned', value: 'unassigned' },
                ...users.map((u) => ({ label: `${u.firstName} ${u.lastName}`, value: u.id })),
              ]}
              onSave={(value) => onAssign(lead.id, value === 'unassigned' ? '' : value)}
              fullWidth
            />
          )}
        </div>

        {/* Next Follow-up */}
        <EditableCell
          label="Next Follow-up"
          value={lead.nextFollowUpDate || ''}
          type="date"
          onSave={(value) => onUpdate(lead.id, 'nextFollowUpDate', value)}
          fullWidth
        />

        {/* Notes */}
        <EditableCell
          label="Feedback / Notes"
          value={lead.followUpNotes || lead.notes || ''}
          type="textarea"
          onSave={(value) => onUpdate(lead.id, 'followUpNotes', value)}
          fullWidth
        />

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewHistory(lead)}
            className="flex-1"
          >
            <History className="h-4 w-4 mr-2" />
            View History
          </Button>
          <EditableCell
            value={lead.status}
            type="select"
            options={statusOptions}
            onSave={(value) => onUpdate(lead.id, 'status', value)}
          />
          <EditableCell
            value={lead.priority}
            type="select"
            options={priorityOptions}
            onSave={(value) => onUpdate(lead.id, 'priority', value)}
          />
        </div>

        {/* Footer Info */}
        <div className="text-xs text-gray-500 pt-2 border-t flex justify-between">
          <span>Created: {new Date(lead.createdAt).toLocaleDateString()}</span>
          <span>ID: {lead.id.slice(0, 8)}</span>
        </div>
      </CardContent>
    </Card>
  );
}

// History Modal Component (same as before)
interface LeadHistoryModalProps {
  lead: Lead;
  onClose: () => void;
}

function LeadHistoryModal({ lead, onClose }: LeadHistoryModalProps) {
  const [followups, setFollowups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, [lead.id]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const data = await followupsService.getFollowupsByLead(lead.id);
      setFollowups(data || []);
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between border-b">
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Lead History: {lead.firstName} {lead.lastName}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Lead Basic Info */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4">
                <h3 className="font-semibold mb-3">Lead Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div><span className="text-gray-500">Status:</span> <Badge>{lead.status}</Badge></div>
                  <div><span className="text-gray-500">Priority:</span> <Badge variant="outline">{lead.priority}</Badge></div>
                  <div><span className="text-gray-500">Source:</span> {lead.source}</div>
                  <div><span className="text-gray-500">Total Interactions:</span> {lead.totalCalls + lead.totalEmails + lead.totalMeetings}</div>
                  <div><span className="text-gray-500">Site Visits:</span> {lead.totalSiteVisits}</div>
                  <div><span className="text-gray-500">Created:</span> {new Date(lead.createdAt).toLocaleDateString()}</div>
                </div>
              </div>

              {/* Follow-up History */}
              <div>
                <h3 className="font-semibold mb-3">Follow-up History ({followups.length})</h3>
                {followups.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No follow-ups recorded yet</p>
                ) : (
                  <div className="space-y-3">
                    {followups.map((followup) => (
                      <div key={followup.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline">{followup.followUpType}</Badge>
                            <Badge>{followup.outcome}</Badge>
                            <span className="text-xs text-gray-500">
                              {new Date(followup.followUpDate).toLocaleString()}
                            </span>
                          </div>
                          {followup.durationMinutes > 0 && (
                            <span className="text-xs text-gray-500">{followup.durationMinutes} mins</span>
                          )}
                        </div>
                        {followup.feedback && (
                          <div className="mb-2">
                            <p className="text-sm font-medium text-gray-700">Feedback:</p>
                            <p className="text-sm text-gray-600">{followup.feedback}</p>
                          </div>
                        )}
                        {followup.customerResponse && (
                          <div className="mb-2">
                            <p className="text-sm font-medium text-gray-700">Customer Response:</p>
                            <p className="text-sm text-gray-600">{followup.customerResponse}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function LeadsListPage() {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [filters, setFilters] = useState<LeadFilters>({
    page: 1,
    limit: 50,
    sortBy: 'createdAt',
    sortOrder: 'DESC',
  });
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    loadLeads();
    loadUsers();
  }, [filters]);

  const loadLeads = async () => {
    try {
      setLoading(true);
      const response = await leadsService.getLeads(filters);
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

  const handleUpdateLead = async (leadId: string, field: string, value: any) => {
    try {
      await leadsService.updateLead(leadId, { [field]: value });
      await loadLeads();
    } catch (error) {
      console.error('Failed to update lead:', error);
      throw error;
    }
  };

  const handleAssignLead = async (leadId: string, userId: string) => {
    try {
      await leadsService.assignLead(leadId, userId);
      await loadLeads();
    } catch (error) {
      console.error('Failed to assign lead:', error);
      throw error;
    }
  };

  const handleViewHistory = (lead: Lead) => {
    setSelectedLead(lead);
    setShowHistory(true);
  };

  const statusOptions = [
    { label: 'New', value: 'NEW' },
    { label: 'Contacted', value: 'CONTACTED' },
    { label: 'Qualified', value: 'QUALIFIED' },
    { label: 'Negotiation', value: 'NEGOTIATION' },
    { label: 'Won', value: 'WON' },
    { label: 'Lost', value: 'LOST' },
    { label: 'On Hold', value: 'ON_HOLD' },
  ];

  const priorityOptions = [
    { label: 'Low', value: 'LOW' },
    { label: 'Medium', value: 'MEDIUM' },
    { label: 'High', value: 'HIGH' },
    { label: 'Urgent', value: 'URGENT' },
  ];

  const getStatusColor = (status: string) => {
    const colors = {
      NEW: 'bg-blue-100 text-blue-800 border-blue-200',
      CONTACTED: 'bg-purple-100 text-purple-800 border-purple-200',
      QUALIFIED: 'bg-green-100 text-green-800 border-green-200',
      NEGOTIATION: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      WON: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      LOST: 'bg-red-100 text-red-800 border-red-200',
      ON_HOLD: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return colors[status as keyof typeof colors] || colors.NEW;
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      URGENT: 'bg-red-100 text-red-800 border-red-300',
      HIGH: 'bg-orange-100 text-orange-800 border-orange-300',
      MEDIUM: 'bg-blue-100 text-blue-800 border-blue-300',
      LOW: 'bg-gray-100 text-gray-700 border-gray-300',
    };
    return colors[priority as keyof typeof colors] || colors.MEDIUM;
  };

  const getAssignedUserName = (assignedTo?: string) => {
    if (!assignedTo) return 'Unassigned';
    const foundUser = users.find(u => u.id === assignedTo);
    return foundUser ? `${foundUser.firstName} ${foundUser.lastName}` : 'Unknown User';
  };

  const getTeamAssignmentsWithTasks = (lead: Lead) => {
    const assignments: Array<{ name: string; task: string }> = [];
    
    const assigneeIds = lead.assignedTo?.includes(',') 
      ? lead.assignedTo.split(',').map(id => id.trim())
      : lead.assignedTo ? [lead.assignedTo] : [];
    
    assigneeIds.forEach(id => {
      const foundUser = users.find(u => u.id === id);
      if (foundUser) {
        assignments.push({
          name: `${foundUser.firstName} ${foundUser.lastName}`,
          task: 'Primary Contact'
        });
      }
    });

    const notesText = lead.followUpNotes || lead.notes || '';
    const taskPattern = /(\w+[\s\w]*)\s*-\s*([A-Za-z\s]+?)(?:,|$)/g;
    let match;
    
    while ((match = taskPattern.exec(notesText)) !== null) {
      const task = match[1].trim();
      const userName = match[2].trim();
      
      const matchedUser = users.find(u => 
        `${u.firstName} ${u.lastName}`.toLowerCase().includes(userName.toLowerCase()) ||
        u.firstName.toLowerCase() === userName.toLowerCase() ||
        u.lastName.toLowerCase() === userName.toLowerCase()
      );
      
      if (matchedUser && !assignments.find(a => a.name === `${matchedUser.firstName} ${matchedUser.lastName}` && a.task === task)) {
        assignments.push({
          name: `${matchedUser.firstName} ${matchedUser.lastName}`,
          task: task.charAt(0).toUpperCase() + task.slice(1)
        });
      }
    }

    return assignments;
  };

  const isAdminUser = () => {
    return user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile-optimized header */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="p-4 md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Leads Management</h1>
              <p className="text-sm text-gray-600 mt-1">
                {total} total leads
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={loadLeads} size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button asChild size="sm">
                <Link href="/leads/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Lead
                </Link>
              </Button>
            </div>
          </div>

          {/* Mobile-optimized filters */}
          <div className="mt-4 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search leads..."
                className="pl-10"
                value={filters.search || ''}
                onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <Select
                value={filters.status || 'all'}
                onValueChange={(value) =>
                  setFilters({ ...filters, status: value === 'all' ? undefined : value, page: 1 })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {statusOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filters.priority || 'all'}
                onValueChange={(value) =>
                  setFilters({ ...filters, priority: value === 'all' ? undefined : value, page: 1 })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  {priorityOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filters.assignedTo || 'all'}
                onValueChange={(value) =>
                  setFilters({ ...filters, assignedTo: value === 'all' ? undefined : value, page: 1 })
                }
              >
                <SelectTrigger>
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

              <Button variant="outline" size="sm" onClick={() => setFilters({ page: 1, limit: 50 })}>
                Clear
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-4 md:p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : leads.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-gray-500">No leads found. Try adjusting your filters or add a new lead.</p>
            <Button asChild className="mt-4">
              <Link href="/leads/new">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Lead
              </Link>
            </Button>
          </Card>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {leads.map((lead) => (
                <LeadCard
                  key={lead.id}
                  lead={lead}
                  users={users}
                  onUpdate={handleUpdateLead}
                  onAssign={handleAssignLead}
                  onViewHistory={handleViewHistory}
                  isAdmin={isAdminUser()}
                  statusOptions={statusOptions}
                  priorityOptions={priorityOptions}
                  getStatusColor={getStatusColor}
                  getPriorityColor={getPriorityColor}
                  getAssignedUserName={getAssignedUserName}
                  getTeamAssignmentsWithTasks={getTeamAssignmentsWithTasks}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Page {filters.page} of {totalPages}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFilters({ ...filters, page: filters.page! - 1 })}
                    disabled={filters.page === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFilters({ ...filters, page: filters.page! + 1 })}
                    disabled={filters.page === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* History Modal */}
      {showHistory && selectedLead && (
        <LeadHistoryModal lead={selectedLead} onClose={() => setShowHistory(false)} />
      )}
    </div>
  );
}
