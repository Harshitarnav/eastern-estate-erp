'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { leadsService } from '@/services/leads.service';
import { propertiesService } from '@/services/properties.service';
import { usersService } from '@/services/users.service';
import { Button } from '@/components/ui/button';

export default function LeadEditPage() {
  const router = useRouter();
  const params = useParams();
  const leadId = Array.isArray(params.id) ? params.id[0] : params.id;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [properties, setProperties] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    source: 'WEBSITE',
    status: 'NEW',
    priority: 'MEDIUM',
    propertyId: '',
    interestedPropertyTypes: '',
    budgetMin: '',
    budgetMax: '',
    preferredLocation: '',
    assignedTo: '',
    followUpNotes: '',
    nextFollowUpDate: '',
    leadScore: 0,
  });

  useEffect(() => {
    if (leadId) {
      fetchLead();
      fetchProperties();
      fetchUsers();
    }
  }, [leadId]);

  const fetchLead = async () => {
    if (!leadId) return;
    try {
      setLoading(true);
      const lead = await leadsService.getLead(leadId);
      const fullName = (lead.fullName || '').trim();
      let derivedFirstName = lead.firstName || '';
      let derivedLastName = lead.lastName || '';
      if (!derivedFirstName && fullName) {
        const parts = fullName.split(' ');
        derivedFirstName = parts.shift() || '';
        derivedLastName = parts.join(' ').trim();
      }
      const propertyTypes = Array.isArray(lead.interestedPropertyTypes)
        ? lead.interestedPropertyTypes.join(', ')
        : lead.interestedPropertyTypes || '';
      setFormData({
        firstName: derivedFirstName,
        lastName: derivedLastName,
        email: lead.email || '',
        phone: lead.phone || '',
        source: lead.source || 'WEBSITE',
        status: lead.status || 'NEW',
        priority: lead.priority || 'MEDIUM',
        propertyId: lead.propertyId || '',
        interestedPropertyTypes: propertyTypes,
        budgetMin: lead.budgetMin?.toString() || '',
        budgetMax: lead.budgetMax?.toString() || '',
        preferredLocation: lead.preferredLocation || '',
        assignedTo: (typeof lead.assignedTo === 'string' ? lead.assignedTo : '') || '',
        followUpNotes: lead.followUpNotes || '',
        nextFollowUpDate: lead.nextFollowUpDate ? new Date(lead.nextFollowUpDate).toISOString().split('T')[0] : '',
        leadScore: lead.leadScore || 0,
      });
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch lead');
    } finally {
      setLoading(false);
    }
  };

  const fetchProperties = async () => {
    try {
      const data = await propertiesService.getProperties();
      setProperties(Array.isArray(data) ? data : data.data || []);
    } catch (error) {
      console.error('Failed to load properties:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await usersService.getUsers();
      setUsers(Array.isArray(data) ? data : data.data || []);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError('');
      
      const updateData: any = {
        ...formData,
        budgetMin: formData.budgetMin ? parseFloat(formData.budgetMin) : undefined,
        budgetMax: formData.budgetMax ? parseFloat(formData.budgetMax) : undefined,
        propertyId: formData.propertyId || null,
        assignedTo: formData.assignedTo || null,
        nextFollowUpDate: formData.nextFollowUpDate || null,
      };
      
      if (!leadId) return;
      await leadsService.updateLead(leadId, updateData);
      alert('Lead updated successfully!');
      window.location.href = '/leads';
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update lead');
      alert('Failed to update lead. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.push(`/leads`)}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Edit Lead</h1>
      </div>

      {error && <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl border p-6">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">First Name *</label>
              <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required className="w-full px-4 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Last Name *</label>
              <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required className="w-full px-4 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Phone *</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required className="w-full px-4 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Source</label>
              <select name="source" value={formData.source} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg">
                <option value="WEBSITE">Website</option>
                <option value="WALK_IN">Walk In</option>
                <option value="REFERRAL">Referral</option>
                <option value="PHONE_CALL">Phone Call</option>
                <option value="EMAIL">Email</option>
                <option value="SOCIAL_MEDIA">Social Media</option>
                <option value="99ACRES">99Acres</option>
                <option value="MAGICBRICKS">MagicBricks</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select name="status" value={formData.status} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg">
                <option value="NEW">New</option>
                <option value="CONTACTED">Contacted</option>
                <option value="QUALIFIED">Qualified</option>
                <option value="NEGOTIATION">Negotiation</option>
                <option value="WON">Won</option>
                <option value="LOST">Lost</option>
                <option value="ON_HOLD">On Hold</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Priority</label>
              <select name="priority" value={formData.priority} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg">
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Lead Score</label>
              <input type="number" name="leadScore" value={formData.leadScore} onChange={handleChange} min="0" max="100" className="w-full px-4 py-2 border rounded-lg" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border p-6">
          <h2 className="text-xl font-semibold mb-4">Property Interest</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-2">Property</label>
              <select name="propertyId" value={formData.propertyId} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg">
                <option value="">No specific property</option>
                {properties.map((p: any) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-2">Interested Property Types</label>
              <input type="text" name="interestedPropertyTypes" value={formData.interestedPropertyTypes} onChange={handleChange} placeholder="e.g., 2BHK, 3BHK" className="w-full px-4 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Budget Min</label>
              <input type="number" name="budgetMin" value={formData.budgetMin} onChange={handleChange} placeholder="Min budget" className="w-full px-4 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Budget Max</label>
              <input type="number" name="budgetMax" value={formData.budgetMax} onChange={handleChange} placeholder="Max budget" className="w-full px-4 py-2 border rounded-lg" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-2">Preferred Location</label>
              <input type="text" name="preferredLocation" value={formData.preferredLocation} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border p-6">
          <h2 className="text-xl font-semibold mb-4">Assignment & Follow-up</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-2">Assigned To</label>
              <select name="assignedTo" value={formData.assignedTo} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg">
                <option value="">Unassigned</option>
                {users.map((u: any) => (
                  <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-2">Next Follow-up Date</label>
              <input type="date" name="nextFollowUpDate" value={formData.nextFollowUpDate} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-2">Follow-up Notes</label>
              <textarea name="followUpNotes" value={formData.followUpNotes} onChange={handleChange} rows={4} className="w-full px-4 py-2 border rounded-lg" placeholder="Add follow-up notes..." />
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700">
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.push(`/leads`)}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
