'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import {
  Building2, Search, Plus, Trash2, Loader2, ArrowLeft,
  CheckCircle2, XCircle, ChevronRight, RefreshCw, Users, Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { apiService } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import { isAdminRole } from '@/lib/roles';
import { TableRowsSkeleton, FormSkeleton } from '@/components/Skeletons';
import { brandPalette } from '@/utils/brand';

// ── Constants ────────────────────────────────────────────────────────────────

const ROLE_COLORS: Record<string, string> = {
  super_admin: 'bg-red-100 text-red-800',
  admin:       'bg-orange-100 text-orange-800',
  hr:          'bg-purple-100 text-purple-800',
  accounts:    'bg-blue-100 text-blue-800',
  sales_team:  'bg-green-100 text-green-800',
  staff:       'bg-gray-100 text-gray-700',
};

const fmtDate = (s: string) =>
  s ? new Date(s).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';

// ── Types ────────────────────────────────────────────────────────────────────

interface AppUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  emailDomain?: string;
  roles: any[];
  isActive: boolean;
}

interface PropertyAccess {
  id: string;
  propertyId: string;
  role: string;
  isActive: boolean;
  assignedAt: string;
  property: { id: string; name: string; propertyCode?: string };
}

interface Property {
  id: string;
  name: string;
  propertyCode?: string;
}

// ── Main component ────────────────────────────────────────────────────────────

function ProjectAccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user: currentUser } = useAuth();

  const userRoles = currentUser?.roles?.map((r: any) => typeof r === 'string' ? r : r.name) || [];
  const isAdmin = isAdminRole(userRoles);

  const [users, setUsers]           = useState<AppUser[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [search, setSearch]         = useState('');
  const [loadingUsers, setLoadingUsers] = useState(true);

  // Selected user panel
  const [selectedUser, setSelectedUser]     = useState<AppUser | null>(null);
  const [userAccess, setUserAccess]         = useState<PropertyAccess[]>([]);
  const [loadingAccess, setLoadingAccess]   = useState(false);

  // Grant dialog
  const [grantOpen, setGrantOpen]           = useState(false);
  const [grantProperty, setGrantProperty]   = useState('');
  const [saving, setSaving]                 = useState(false);

  // ── Access guard ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (currentUser && !isAdmin) {
      router.replace('/');
      toast.error('You do not have permission to access this page');
    }
  }, [currentUser, isAdmin, router]);

  // ── Load users + properties ───────────────────────────────────────────────
  const loadUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const [usersRes, propsRes] = await Promise.all([
        apiService.get('/users?limit=500&isActive=true'),
        apiService.get('/properties'),
      ]);
      setUsers(usersRes.data || usersRes || []);
      const pd = propsRes.data || propsRes || [];
      setProperties(Array.isArray(pd) ? pd : []);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  // ── Auto-select user from URL param (e.g. from /users page button) ────────
  useEffect(() => {
    const uid = searchParams.get('userId');
    if (uid && users.length > 0) {
      const u = users.find(u => u.id === uid);
      if (u) selectUser(u);
    }
  }, [searchParams, users]);

  // ── Load access for selected user ─────────────────────────────────────────
  const selectUser = async (u: AppUser) => {
    setSelectedUser(u);
    setLoadingAccess(true);
    setUserAccess([]);
    try {
      const data = await apiService.get(`/users/${u.id}/property-access`);
      setUserAccess(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Failed to load property access');
      setUserAccess([]);
    } finally {
      setLoadingAccess(false);
    }
  };

  const refreshAccess = async () => {
    if (!selectedUser) return;
    await selectUser(selectedUser);
  };

  // ── Grant access ──────────────────────────────────────────────────────────
  const handleGrant = async () => {
    if (!selectedUser || !grantProperty) {
      toast.error('Select a project'); return;
    }
    setSaving(true);
    try {
      await apiService.post(`/users/${selectedUser.id}/property-access`, {
        propertyId: grantProperty,
      });
      toast.success('Access granted');
      setGrantOpen(false);
      setGrantProperty('');
      await refreshAccess();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to grant access');
    } finally {
      setSaving(false);
    }
  };

  // ── Revoke access ─────────────────────────────────────────────────────────
  const handleRevoke = async (access: PropertyAccess) => {
    if (!confirm(`Remove access to "${access.property?.name}" for ${selectedUser?.firstName}?`)) return;
    setSaving(true);
    try {
      await apiService.delete(`/users/${selectedUser!.id}/property-access/${access.propertyId}?role=${access.role}`);
      toast.success('Access revoked');
      await refreshAccess();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to revoke access');
    } finally {
      setSaving(false);
    }
  };

  // ── Derived ───────────────────────────────────────────────────────────────
  const filteredUsers = users.filter(u => {
    const q = search.toLowerCase();
    return !q ||
      u.firstName?.toLowerCase().includes(q) ||
      u.lastName?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.username?.toLowerCase().includes(q);
  });

  const activeAccess = userAccess.filter(a => a.isActive);

  const availableProperties = properties.filter(
    p => !activeAccess.some(a => a.propertyId === p.id),
  );

  if (!isAdmin) return null;

  return (
    <div className="p-6 md:p-8 space-y-6 min-h-full" style={{ backgroundColor: brandPalette.background }}>

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="w-6 h-6" style={{ color: brandPalette.primary }} />
            Project Access Management
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Control which projects each user can see and interact with.
          </p>
        </div>
        <button
          onClick={loadUsers}
          className="p-2 rounded-xl border hover:bg-white transition-colors"
          style={{ borderColor: `${brandPalette.neutral}80` }}
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-5">

        {/* ── Left: User list ─────────────────────────────────────────────── */}
        <div className="lg:w-80 shrink-0 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              className="pl-9"
              placeholder="Search users…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="bg-white rounded-2xl border overflow-hidden shadow-sm" style={{ borderColor: `${brandPalette.neutral}60` }}>
            {loadingUsers ? (
              <div className="p-4"><TableRowsSkeleton rows={6} cols={1} /></div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-sm">
                <Users className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                No users found
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredUsers.map((u, idx) => (
                  <button
                    key={u.id}
                    onClick={() => selectUser(u)}
                    className={`w-full text-left px-4 py-3.5 flex items-center gap-3 transition-colors hover:bg-gray-50 ${
                      selectedUser?.id === u.id ? 'bg-red-50 border-l-2 border-l-[#A8211B]' : ''
                    }`}
                  >
                    {/* Avatar */}
                    <div
                      className="h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                      style={{ backgroundColor: `hsl(${(idx * 47) % 360}, 55%, 50%)` }}
                    >
                      {u.firstName?.[0]?.toUpperCase()}{u.lastName?.[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {u.firstName} {u.lastName}
                      </p>
                      <p className="text-xs text-gray-400 truncate">{u.email}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Right: Detail panel ─────────────────────────────────────────── */}
        <div className="flex-1 min-w-0">
          {!selectedUser ? (
            <div className="bg-white rounded-2xl border shadow-sm h-64 flex flex-col items-center justify-center text-center gap-3"
              style={{ borderColor: `${brandPalette.neutral}60` }}>
              <Building2 className="w-10 h-10 text-gray-200" />
              <p className="text-sm text-gray-500">Select a user to manage their project access</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* User header */}
              <div className="bg-white rounded-2xl border shadow-sm p-5" style={{ borderColor: `${brandPalette.neutral}60` }}>
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-10 w-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                      style={{ backgroundColor: brandPalette.primary }}
                    >
                      {selectedUser.firstName?.[0]?.toUpperCase()}{selectedUser.lastName?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <h2 className="font-semibold text-gray-900">
                        {selectedUser.firstName} {selectedUser.lastName}
                      </h2>
                      <p className="text-xs text-gray-500">{selectedUser.email}</p>
                    </div>
                    <div className="flex flex-wrap gap-1 ml-2">
                      {(selectedUser.roles || []).map((r: any, i: number) => {
                        const rn = typeof r === 'string' ? r : r.name;
                        return (
                          <span key={i} className={`text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_COLORS[rn] ?? 'bg-gray-100 text-gray-700'}`}>
                            {typeof r === 'string' ? r : (r.displayName ?? r.name)}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">
                      {activeAccess.length} project{activeAccess.length !== 1 ? 's' : ''} assigned
                    </span>
                    <Button
                      size="sm"
                      onClick={() => setGrantOpen(true)}
                      className="bg-[#A8211B] hover:bg-[#7B1E12] text-white"
                      disabled={availableProperties.length === 0}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Assign Project
                    </Button>
                  </div>
                </div>
              </div>

              {/* Summary stats */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Projects Assigned', value: activeAccess.length },
                  { label: 'Total Projects', value: properties.length },
                  { label: 'Unassigned', value: properties.length - activeAccess.length },
                ].map(c => (
                  <div key={c.label} className="bg-white rounded-xl border shadow-sm p-3 text-center" style={{ borderColor: `${brandPalette.neutral}60` }}>
                    <p className="text-xl font-bold text-gray-900">{c.value}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{c.label}</p>
                  </div>
                ))}
              </div>

              {/* Access table */}
              <div className="bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: `${brandPalette.neutral}60` }}>
                <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: `${brandPalette.neutral}40` }}>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4" style={{ color: brandPalette.primary }} />
                    <h3 className="font-semibold text-gray-800">Assigned Projects</h3>
                  </div>
                  {loadingAccess && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
                </div>

                {loadingAccess ? (
                  <div className="p-4"><TableRowsSkeleton rows={4} cols={4} /></div>
                ) : activeAccess.length === 0 ? (
                  <div className="p-12 text-center">
                    <Building2 className="w-10 h-10 mx-auto mb-3 text-gray-200" />
                    <p className="text-sm text-gray-500 mb-3">No projects assigned yet.</p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setGrantOpen(true)}
                      disabled={availableProperties.length === 0}
                    >
                      <Plus className="h-4 w-4 mr-1" /> Assign First Project
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-gray-50" style={{ borderColor: `${brandPalette.neutral}40` }}>
                          {['Property', 'Code', 'Assigned On', 'Actions'].map(h => (
                            <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {activeAccess.map(access => (
                          <tr key={access.id} className="border-b hover:bg-gray-50" style={{ borderColor: `${brandPalette.neutral}30` }}>
                            <td className="px-4 py-3 font-medium text-gray-900">
                              {access.property?.name || 'Unknown'}
                            </td>
                            <td className="px-4 py-3 font-mono text-xs text-gray-500">
                              {access.property?.propertyCode || '-'}
                            </td>
                            <td className="px-4 py-3 text-gray-500 text-xs">{fmtDate(access.assignedAt)}</td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => handleRevoke(access)}
                                disabled={saving}
                                className="flex items-center gap-1 text-xs font-medium text-red-500 hover:text-red-700 disabled:opacity-40"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Revoke
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Unassigned properties hint */}
                {!loadingAccess && availableProperties.length > 0 && activeAccess.length > 0 && (
                  <div className="px-5 py-3 border-t bg-gray-50 text-xs text-gray-500" style={{ borderColor: `${brandPalette.neutral}40` }}>
                    {availableProperties.length} project{availableProperties.length !== 1 ? 's' : ''} not yet assigned -{' '}
                    <button onClick={() => setGrantOpen(true)} className="underline font-medium" style={{ color: brandPalette.primary }}>
                      assign now
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Grant Access Dialog ──────────────────────────────────────────────── */}
      <Dialog open={grantOpen} onOpenChange={v => { setGrantOpen(v); if (!v) setGrantProperty(''); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Project Access</DialogTitle>
            <DialogDescription>
              Give {selectedUser?.firstName} {selectedUser?.lastName} access to a project. Their existing system role controls what they can do within it.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Project</Label>
              <Select value={grantProperty} onValueChange={setGrantProperty}>
                <SelectTrigger>
                  <SelectValue placeholder="Select project…" />
                </SelectTrigger>
                <SelectContent>
                  {availableProperties.length === 0 ? (
                    <div className="p-2 text-sm text-gray-500">All projects already assigned</div>
                  ) : availableProperties.map(p => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}{p.propertyCode ? ` (${p.propertyCode})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setGrantOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button
              onClick={handleGrant}
              disabled={saving || !grantProperty}
              className="bg-[#A8211B] hover:bg-[#7B1E12] text-white"
            >
              {saving
                ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Assigning…</>
                : <><CheckCircle2 className="mr-2 h-4 w-4" /> Assign Access</>
              }
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function ProjectAccessPage() {
  return (
    <Suspense fallback={<div className="p-8"><FormSkeleton fields={6} /></div>}>
      <ProjectAccessContent />
    </Suspense>
  );
}
