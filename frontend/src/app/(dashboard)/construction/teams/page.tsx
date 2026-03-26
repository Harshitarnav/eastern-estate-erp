'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/services/api';
import { CardGridSkeleton } from '@/components/Skeletons';
import { BrandHero, BrandPrimaryButton } from '@/components/layout/BrandHero';
import { BrandStatCard } from '@/components/layout/BrandStatCard';
import { brandPalette, formatIndianNumber } from '@/utils/brand';
import {
  Users, Plus, Search, Phone, Mail, Wrench,
  HardHat, Building2, Calendar, Edit, Trash2, X,
} from 'lucide-react';

const TEAM_TYPE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  CONTRACTOR: { label: 'Contractor', color: 'text-blue-700',   bg: 'bg-blue-50' },
  IN_HOUSE:   { label: 'In-House',   color: 'text-green-700',  bg: 'bg-green-50' },
  LABOR:      { label: 'Labour',     color: 'text-orange-700', bg: 'bg-orange-50' },
};

const EMPTY_FORM = {
  teamName: '', teamCode: '', teamType: 'CONTRACTOR',
  constructionProjectId: '', leaderName: '', contactNumber: '',
  email: '', totalMembers: '', specialization: '',
  contractStartDate: '', contractEndDate: '', dailyRate: '',
};

function TeamsContent() {
  const router = useRouter();
  const [teams, setTeams] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPanel, setShowPanel] = useState(false);
  const [editTeam, setEditTeam] = useState<any | null>(null);
  const [filterProject, setFilterProject] = useState('');
  const [filterType, setFilterType] = useState('');
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadAll(); }, []);
  useEffect(() => { loadTeams(); }, [filterProject]);

  const loadAll = async () => {
    try {
      const data = await api.get('/construction-projects');
      setProjects(Array.isArray(data) ? data : (data?.data || []));
    } catch (e) { console.error(e); }
    await loadTeams();
  };

  const loadTeams = async () => {
    setLoading(true);
    try {
      const url = filterProject
        ? `/construction-teams?constructionProjectId=${filterProject}`
        : '/construction-teams';
      const data = await api.get(url);
      setTeams(Array.isArray(data) ? data : (data?.data || []));
    } catch (e) { setTeams([]); }
    finally { setLoading(false); }
  };

  const openCreate = () => {
    setEditTeam(null);
    setForm({ ...EMPTY_FORM, constructionProjectId: filterProject });
    setShowPanel(true);
  };

  const openEdit = (team: any) => {
    setEditTeam(team);
    setForm({
      teamName: team.teamName || '', teamCode: team.teamCode || '',
      teamType: team.teamType || 'CONTRACTOR',
      constructionProjectId: team.constructionProjectId || '',
      leaderName: team.leaderName || '', contactNumber: team.contactNumber || '',
      email: team.email || '', totalMembers: String(team.totalMembers || ''),
      specialization: team.specialization || '',
      contractStartDate: team.contractStartDate?.split('T')[0] || '',
      contractEndDate: team.contractEndDate?.split('T')[0] || '',
      dailyRate: String(team.dailyRate || ''),
    });
    setShowPanel(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.teamName || !form.leaderName || !form.contactNumber) {
      alert('Team Name, Leader Name and Contact are required');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        totalMembers: parseInt(form.totalMembers) || 0,
        dailyRate: parseFloat(form.dailyRate) || null,
        contractStartDate: form.contractStartDate || null,
        contractEndDate: form.contractEndDate || null,
        constructionProjectId: form.constructionProjectId || null,
      };
      if (editTeam) {
        await api.patch(`/construction-teams/${editTeam.id}`, payload);
      } else {
        await api.post('/construction-teams', payload);
      }
      setShowPanel(false);
      loadTeams();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save team');
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (id: string, name: string) => {
    if (!confirm(`Remove team "${name}"? They won't appear in active lists.`)) return;
    try {
      await api.delete(`/construction-teams/${id}`);
      setTeams(prev => prev.filter(t => t.id !== id));
    } catch { alert('Failed to remove team'); }
  };

  const filteredTeams = teams.filter(t => {
    if (filterType && t.teamType !== filterType) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        t.teamName?.toLowerCase().includes(q) ||
        t.leaderName?.toLowerCase().includes(q) ||
        t.specialization?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalWorkers = teams.reduce((s, t) => s + (t.activeMembers || t.totalMembers || 0), 0);
  const contractorCount = teams.filter(t => t.teamType === 'CONTRACTOR').length;
  const laborCount = teams.filter(t => t.teamType === 'LABOR').length;
  const inHouseCount = teams.filter(t => t.teamType === 'IN_HOUSE').length;

  const fmt = (d?: string) =>
    d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  return (
    <div className="p-6 md:p-8 space-y-8 min-h-full" style={{ backgroundColor: brandPalette.background }}>

      {/* Hero */}
      <BrandHero
        eyebrow="Construction Teams"
        title={<>Manage every team, <span style={{ color: brandPalette.accent }}>on every site</span></>}
        description="Track contractors, labour gangs and in-house teams. Assign teams to projects, monitor manpower, and manage contracts and daily rates."
        actions={
          <BrandPrimaryButton onClick={openCreate}>
            <Plus className="w-4 h-4" /> Add Team
          </BrandPrimaryButton>
        }
      />

      {/* Stats */}
      <section className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <BrandStatCard
          title="Total Teams"
          primary={formatIndianNumber(teams.length)}
          subLabel={`${totalWorkers} total workers`}
          icon={<Users className="w-7 h-7" />}
          accentColor={brandPalette.primary}
        />
        <BrandStatCard
          title="Contractors"
          primary={formatIndianNumber(contractorCount)}
          subLabel="External firms"
          icon={<Building2 className="w-7 h-7" />}
          accentColor="rgba(37,99,235,0.2)"
        />
        <BrandStatCard
          title="Labour Gangs"
          primary={formatIndianNumber(laborCount)}
          subLabel="Daily wage teams"
          icon={<HardHat className="w-7 h-7" />}
          accentColor="rgba(234,88,12,0.2)"
        />
        <BrandStatCard
          title="In-House"
          primary={formatIndianNumber(inHouseCount)}
          subLabel="Own employees"
          icon={<Wrench className="w-7 h-7" />}
          accentColor="rgba(22,163,74,0.2)"
        />
      </section>

      {/* Filters */}
      <div
        className="rounded-2xl border bg-white/90 backdrop-blur-sm shadow-sm p-5 space-y-4"
        style={{ borderColor: `${brandPalette.neutral}80` }}
      >
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by team name, leader, or specialization…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#A8211B]"
            />
          </div>
          <select
            value={filterProject}
            onChange={e => setFilterProject(e.target.value)}
            className="px-4 py-2.5 border rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#A8211B] bg-white"
          >
            <option value="">All Projects</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.projectName}</option>)}
          </select>
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="px-4 py-2.5 border rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#A8211B] bg-white"
          >
            <option value="">All Types</option>
            <option value="CONTRACTOR">Contractor</option>
            <option value="IN_HOUSE">In-House</option>
            <option value="LABOR">Labour</option>
          </select>
          {(search || filterType || filterProject) && (
            <button
              onClick={() => { setSearch(''); setFilterType(''); setFilterProject(''); }}
              className="px-4 py-2.5 text-sm border rounded-xl hover:bg-gray-50"
              style={{ borderColor: brandPalette.neutral, color: brandPalette.secondary }}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Team Cards */}
      {loading ? (
        <CardGridSkeleton cards={6} />
      ) : filteredTeams.length === 0 ? (
        <div className="bg-white rounded-3xl border p-12 text-center shadow-sm" style={{ borderColor: `${brandPalette.neutral}60` }}>
          <Users className="w-16 h-16 mx-auto mb-4" style={{ color: brandPalette.primary, opacity: 0.45 }} />
          <h3 className="text-xl font-semibold mb-2" style={{ color: brandPalette.secondary }}>
            {teams.length === 0 ? 'No Teams Yet' : 'No Teams Match'}
          </h3>
          <p className="text-gray-500 text-sm mb-6">
            {teams.length === 0 ? 'Add your first construction team to get started.' : 'Try adjusting your filters.'}
          </p>
          {teams.length === 0 && (
            <BrandPrimaryButton onClick={openCreate}>
              <Plus className="w-4 h-4" /> Add First Team
            </BrandPrimaryButton>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredTeams.map(team => {
            const typeCfg = TEAM_TYPE_CONFIG[team.teamType] || TEAM_TYPE_CONFIG.LABOR;
            const project = projects.find(p => p.id === team.constructionProjectId);
            const expiring = team.contractEndDate &&
              new Date(team.contractEndDate) <= new Date(Date.now() + 30 * 86400000);

            return (
              <div
                key={team.id}
                className="bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all overflow-hidden"
                style={{ borderColor: `${brandPalette.neutral}60` }}
              >
                {/* Type colour strip */}
                <div className="h-1.5 w-full" style={{
                  backgroundColor: team.teamType === 'CONTRACTOR' ? '#2563EB'
                    : team.teamType === 'IN_HOUSE' ? '#16A34A' : '#EA580C'
                }} />

                <div className="p-5">
                  {/* Header row */}
                  <div className="flex items-start justify-between gap-2 mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 text-lg line-clamp-1">{team.teamName}</h3>
                      {team.teamCode && <p className="text-xs text-gray-400 font-mono mt-0.5">#{team.teamCode}</p>}
                    </div>
                    <span className={`shrink-0 text-xs px-2.5 py-1 rounded-full font-semibold ${typeCfg.bg} ${typeCfg.color}`}>
                      {typeCfg.label}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="space-y-1.5 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span className="font-medium">{team.leaderName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <a href={`tel:${team.contactNumber}`} className="text-blue-600 hover:underline">{team.contactNumber}</a>
                    </div>
                    {team.email && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span className="truncate">{team.email}</span>
                      </div>
                    )}
                    {team.specialization && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Wrench className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span className="truncate">{team.specialization}</span>
                      </div>
                    )}
                    {project && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Building2 className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span className="truncate">{project.projectName}</span>
                      </div>
                    )}
                  </div>

                  {/* Stats row */}
                  <div className="flex items-center justify-between py-3 border-y border-gray-100 mb-4">
                    <div className="text-center">
                      <p className="text-lg font-bold text-gray-900">{team.activeMembers || team.totalMembers || 0}</p>
                      <p className="text-xs text-gray-400">Workers</p>
                    </div>
                    {team.dailyRate && (
                      <div className="text-center">
                        <p className="text-lg font-bold text-gray-900">
                          ₹{Number(team.dailyRate).toLocaleString('en-IN')}
                        </p>
                        <p className="text-xs text-gray-400">Daily Rate</p>
                      </div>
                    )}
                    {team.contractEndDate && (
                      <div className="text-center">
                        <p className={`text-sm font-semibold ${expiring ? 'text-orange-600' : 'text-gray-700'}`}>
                          {fmt(team.contractEndDate)}
                        </p>
                        <p className="text-xs text-gray-400">
                          {expiring ? '⚠ Expiring' : 'Contract End'}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEdit(team)}
                      className="flex-1 py-2 border rounded-xl text-sm font-medium flex items-center justify-center gap-1.5 transition-colors hover:bg-[#FEF3E2]"
                      style={{ borderColor: brandPalette.accent, color: brandPalette.secondary }}
                    >
                      <Edit className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => handleDeactivate(team.id, team.teamName)}
                      className="px-4 py-2 border rounded-xl text-sm font-medium transition-colors hover:bg-red-50"
                      style={{ borderColor: '#FCA5A5', color: '#B91C1C' }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer */}
      <div className="pt-4 text-center text-sm text-gray-400">
        Eastern Estate ERP • Building Homes, Nurturing Bonds
      </div>

      {/* ── Create / Edit Slide-in Panel ── */}
      {showPanel && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/40" onClick={() => setShowPanel(false)} />
          <div className="w-full max-w-lg bg-white shadow-2xl overflow-y-auto flex flex-col">
            <div className="px-6 py-5 border-b flex items-center justify-between" style={{ backgroundColor: brandPalette.primary }}>
              <div>
                <h2 className="text-xl font-bold text-white">{editTeam ? 'Edit Team' : 'Add New Team'}</h2>
                <p className="text-red-200 text-sm mt-0.5">
                  {editTeam ? 'Update team details' : 'Register a new construction team'}
                </p>
              </div>
              <button onClick={() => setShowPanel(false)} className="text-red-200 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex-1 p-6 space-y-5">
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase mb-3">Team Identity</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Team Name <span className="text-red-500">*</span></label>
                    <input type="text" value={form.teamName} onChange={e => setForm({ ...form, teamName: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#A8211B] focus:border-transparent"
                      placeholder="e.g. Ramesh Masonry Team" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Team Code</label>
                    <input type="text" value={form.teamCode} onChange={e => setForm({ ...form, teamCode: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#A8211B] focus:border-transparent"
                      placeholder="T001" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Team Type <span className="text-red-500">*</span></label>
                    <select value={form.teamType} onChange={e => setForm({ ...form, teamType: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#A8211B] focus:border-transparent bg-white">
                      <option value="CONTRACTOR">Contractor (Firm)</option>
                      <option value="IN_HOUSE">In-House (Own Employees)</option>
                      <option value="LABOR">Labour Gang (Daily Wage)</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Project</label>
                    <select value={form.constructionProjectId} onChange={e => setForm({ ...form, constructionProjectId: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#A8211B] focus:border-transparent bg-white">
                      <option value="">Not assigned</option>
                      {projects.map(p => <option key={p.id} value={p.id}>{p.projectName}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase mb-3">Contact</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Leader Name <span className="text-red-500">*</span></label>
                    <input type="text" value={form.leaderName} onChange={e => setForm({ ...form, leaderName: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#A8211B] focus:border-transparent"
                      placeholder="Supervisor / foreman name" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone <span className="text-red-500">*</span></label>
                    <input type="tel" value={form.contactNumber} onChange={e => setForm({ ...form, contactNumber: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#A8211B] focus:border-transparent"
                      placeholder="10-digit number" required />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#A8211B] focus:border-transparent"
                      placeholder="optional" />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase mb-3">Work Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Workers</label>
                    <input type="number" value={form.totalMembers} onChange={e => setForm({ ...form, totalMembers: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#A8211B] focus:border-transparent"
                      placeholder="0" min="0" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Daily Rate (₹)</label>
                    <input type="number" value={form.dailyRate} onChange={e => setForm({ ...form, dailyRate: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#A8211B] focus:border-transparent"
                      placeholder="Per day cost" min="0" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                    <input type="text" value={form.specialization} onChange={e => setForm({ ...form, specialization: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#A8211B] focus:border-transparent"
                      placeholder="e.g. RCC Work, Masonry, Plumbing" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contract Start</label>
                    <input type="date" value={form.contractStartDate} onChange={e => setForm({ ...form, contractStartDate: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#A8211B] focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contract End</label>
                    <input type="date" value={form.contractEndDate} onChange={e => setForm({ ...form, contractEndDate: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#A8211B] focus:border-transparent" />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2 border-t">
                <button type="submit" disabled={saving}
                  className="flex-1 py-3 text-white rounded-xl font-semibold disabled:opacity-50"
                  style={{ backgroundColor: brandPalette.primary }}>
                  {saving ? 'Saving…' : editTeam ? 'Update Team' : 'Add Team'}
                </button>
                <button type="button" onClick={() => setShowPanel(false)}
                  className="px-5 py-3 border-2 rounded-xl font-medium text-gray-700 hover:bg-gray-50"
                  style={{ borderColor: brandPalette.neutral }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TeamsPage() {
  return (
    <Suspense fallback={<CardGridSkeleton cards={6} />}>
      <TeamsContent />
    </Suspense>
  );
}
