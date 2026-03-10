'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Users, Plus, Search, Edit2, Power, Trash2, X,
  Loader2, ShieldCheck, Eye, EyeOff, RefreshCw, Lock,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  usersService,
  User,
  Role,
  CreateUserDto,
} from '@/services/users.service';
import { useAuthStore } from '@/store/authStore';

// ── helpers ──────────────────────────────────────────────────────────────────

const ROLE_COLORS: Record<string, string> = {
  super_admin:   'bg-red-100 text-red-800',
  admin:         'bg-orange-100 text-orange-800',
  hr:            'bg-purple-100 text-purple-800',
  accounts:      'bg-blue-100 text-blue-800',
  sales_team:    'bg-green-100 text-green-800',
  staff:         'bg-gray-100 text-gray-700',
};
const roleBadge = (r: Role) => (
  <span
    key={r.id}
    className={`px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[r.name] ?? 'bg-gray-100 text-gray-700'}`}
  >
    {r.displayName ?? r.name}
  </span>
);

const fmtDate = (s?: string) =>
  s ? new Date(s).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

// ── UserModal (create / edit) ────────────────────────────────────────────────

type ModalMode = 'create' | 'edit' | 'reset';

function UserModal({
  mode,
  user,
  roles,
  onClose,
  onSaved,
}: {
  mode: ModalMode;
  user?: User;
  roles: Role[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const isCreate = mode === 'create';
  const isReset  = mode === 'reset';

  const [form, setForm] = useState({
    firstName:  user?.firstName  ?? '',
    lastName:   user?.lastName   ?? '',
    email:      user?.email      ?? '',
    username:   user?.username   ?? '',
    phone:      user?.phone      ?? '',
    password:   '',
    confirmPwd: '',
    roleIds:    user?.roles?.map(r => r.id) ?? [] as string[],
  });
  const [showPwd, setShowPwd] = useState(false);
  const [saving, setSaving]   = useState(false);

  const set = (k: keyof typeof form) => (v: string) =>
    setForm(p => ({ ...p, [k]: v }));

  const toggleRole = (id: string) =>
    setForm(p => ({
      ...p,
      roleIds: p.roleIds.includes(id)
        ? p.roleIds.filter(r => r !== id)
        : [...p.roleIds, id],
    }));

  const handleSubmit = async () => {
    if (isReset) {
      if (!form.password || form.password.length < 8) {
        toast.error('Password must be at least 8 characters'); return;
      }
      if (form.password !== form.confirmPwd) {
        toast.error('Passwords do not match'); return;
      }
      setSaving(true);
      try {
        await usersService.resetPassword(user!.id, form.password);
        toast.success('Password reset successfully');
        onSaved();
      } catch (e: any) {
        toast.error(e?.message ?? 'Failed to reset password');
      } finally { setSaving(false); }
      return;
    }

    if (isCreate && (!form.password || form.password.length < 8)) {
      toast.error('Password must be at least 8 characters'); return;
    }
    if (isCreate && form.password !== form.confirmPwd) {
      toast.error('Passwords do not match'); return;
    }
    if (!form.firstName || !form.lastName || !form.email) {
      toast.error('First name, last name and email are required'); return;
    }

    setSaving(true);
    try {
      if (isCreate) {
        const dto: CreateUserDto = {
          firstName: form.firstName,
          lastName:  form.lastName,
          email:     form.email,
          username:  form.username || form.email.split('@')[0],
          password:  form.password,
          phone:     form.phone || undefined,
          roleIds:   form.roleIds,
        };
        await usersService.createUser(dto);
        toast.success('User created successfully');
      } else {
        await usersService.updateUser(user!.id, {
          firstName: form.firstName,
          lastName:  form.lastName,
          phone:     form.phone || undefined,
          roleIds:   form.roleIds,
        });
        toast.success('User updated successfully');
      }
      onSaved();
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? e?.message ?? 'Failed to save user';
      toast.error(Array.isArray(msg) ? msg.join(' • ') : msg);
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold">
            {isCreate ? 'Create New User' : isReset ? 'Reset Password' : `Edit — ${user?.firstName} ${user?.lastName}`}
          </h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Password reset only */}
          {isReset && (
            <>
              <p className="text-sm text-muted-foreground">
                Set a new password for <strong>{user?.firstName} {user?.lastName}</strong>.
                They will need to use this password on their next login.
              </p>
              <div className="space-y-1.5">
                <Label>New Password</Label>
                <div className="relative">
                  <Input
                    type={showPwd ? 'text' : 'password'}
                    value={form.password}
                    onChange={e => set('password')(e.target.value)}
                    placeholder="Minimum 8 characters"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    onClick={() => setShowPwd(v => !v)}
                  >
                    {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Confirm Password</Label>
                <Input
                  type="password"
                  value={form.confirmPwd}
                  onChange={e => set('confirmPwd')(e.target.value)}
                  placeholder="Repeat password"
                  autoComplete="new-password"
                />
              </div>
            </>
          )}

          {/* Create / Edit fields */}
          {!isReset && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>First Name *</Label>
                  <Input value={form.firstName} onChange={e => set('firstName')(e.target.value)} placeholder="Arnav" />
                </div>
                <div className="space-y-1.5">
                  <Label>Last Name *</Label>
                  <Input value={form.lastName} onChange={e => set('lastName')(e.target.value)} placeholder="Sharma" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={e => set('email')(e.target.value)}
                  placeholder="arnav@easternestate.in"
                  disabled={!isCreate}
                  autoComplete="off"
                />
                {!isCreate && <p className="text-xs text-muted-foreground">Email cannot be changed after creation.</p>}
              </div>
              {isCreate && (
                <div className="space-y-1.5">
                  <Label>Username</Label>
                  <Input
                    value={form.username}
                    onChange={e => set('username')(e.target.value)}
                    placeholder="Auto-generated from email if left blank"
                    autoComplete="off"
                  />
                </div>
              )}
              <div className="space-y-1.5">
                <Label>Phone</Label>
                <Input value={form.phone} onChange={e => set('phone')(e.target.value)} placeholder="+91 9876543210" />
              </div>
              {isCreate && (
                <>
                  <div className="space-y-1.5">
                    <Label>Password *</Label>
                    <div className="relative">
                      <Input
                        type={showPwd ? 'text' : 'password'}
                        value={form.password}
                        onChange={e => set('password')(e.target.value)}
                        placeholder="Minimum 8 characters"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                        onClick={() => setShowPwd(v => !v)}
                      >
                        {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Confirm Password *</Label>
                    <Input
                      type="password"
                      value={form.confirmPwd}
                      onChange={e => set('confirmPwd')(e.target.value)}
                      placeholder="Repeat password"
                      autoComplete="new-password"
                    />
                  </div>
                </>
              )}

              {/* Roles */}
              <div className="space-y-2">
                <Label>Roles</Label>
                <div className="flex flex-wrap gap-2 p-3 border rounded-lg min-h-[48px]">
                  {roles.map(r => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => toggleRole(r.id)}
                      className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                        form.roleIds.includes(r.id)
                          ? 'bg-[#A8211B] text-white border-[#A8211B]'
                          : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {r.displayName ?? r.name}
                    </button>
                  ))}
                  {roles.length === 0 && (
                    <p className="text-xs text-muted-foreground self-center">No roles available</p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50 rounded-b-2xl">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            disabled={saving}
            className="bg-[#A8211B] hover:bg-[#7B1E12] text-white"
          >
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {isCreate ? 'Create User' : isReset ? 'Reset Password' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function UserManagementPage() {
  const router = useRouter();
  const { user: currentUser } = useAuthStore();

  // ── Access guard — Super Admin only ────────────────────────────────────────
  const isSuperAdmin = currentUser?.roles?.some(
    (r: any) => (typeof r === 'string' ? r : r.name) === 'super_admin',
  );

  const [users, setUsers]         = useState<User[]>([]);
  const [roles, setRoles]         = useState<Role[]>([]);
  const [total, setTotal]         = useState(0);
  const [page, setPage]           = useState(1);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [roleFilter, setRole]     = useState('');
  const [statusFilter, setStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [modal, setModal]         = useState<
    { mode: ModalMode; user?: User } | null
  >(null);

  // Block non-super-admins before rendering anything
  if (currentUser && !isSuperAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
        <div className="rounded-full bg-red-100 p-4">
          <Lock className="h-8 w-8 text-[#A8211B]" />
        </div>
        <h2 className="text-xl font-semibold text-gray-800">Access Restricted</h2>
        <p className="text-sm text-muted-foreground max-w-xs">
          User Management is only accessible to Super Admins. Contact your Super Admin to manage user accounts.
        </p>
        <Button variant="outline" onClick={() => router.push('/settings')}>
          Back to Settings
        </Button>
      </div>
    );
  }

  const LIMIT = 20;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await usersService.getUsers(
        {
          page,
          limit: LIMIT,
          search: search || undefined,
          role: roleFilter || undefined,
          isActive:
            statusFilter === 'active'   ? true  :
            statusFilter === 'inactive' ? false : undefined,
        },
        { forceRefresh: true },
      );
      setUsers(res.data);
      setTotal(res.meta.total);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter, statusFilter]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    usersService.getRoles()
      .then(setRoles)
      .catch(() => { /* non-fatal */ });
  }, []);

  const handleToggleActive = async (u: User) => {
    try {
      await usersService.toggleUserActive(u.id);
      toast.success(`${u.firstName} ${u.isActive ? 'deactivated' : 'activated'} successfully`);
      load();
    } catch {
      toast.error('Failed to update user status');
    }
  };

  const handleDelete = async (u: User) => {
    if (!confirm(`Permanently delete ${u.firstName} ${u.lastName}? This cannot be undone.`)) return;
    try {
      await usersService.deleteUser(u.id);
      toast.success('User deleted');
      load();
    } catch {
      toast.error('Failed to delete user');
    }
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">

      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Users className="h-6 w-6 text-[#A8211B]" />
            User Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create and manage staff accounts. Assign roles to control what each person can access.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load} title="Refresh">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => setModal({ mode: 'create' })}
            className="bg-[#A8211B] hover:bg-[#7B1E12] text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            New User
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            className="pl-9"
            placeholder="Search name, email, username…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <select
          value={roleFilter}
          onChange={e => { setRole(e.target.value); setPage(1); }}
          className="border rounded-lg px-3 py-2 text-sm bg-white"
        >
          <option value="">All Roles</option>
          {roles.map(r => (
            <option key={r.id} value={r.name}>{r.displayName ?? r.name}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={e => { setStatus(e.target.value as typeof statusFilter); setPage(1); }}
          className="border rounded-lg px-3 py-2 text-sm bg-white"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <p className="text-sm text-muted-foreground ml-auto">{total} user{total !== 1 ? 's' : ''}</p>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-[#A8211B]" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Users className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No users found</p>
              <p className="text-sm">Try adjusting the filters or create a new user.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Name</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Email</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Roles</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Last Login</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Joined</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, idx) => (
                    <tr
                      key={u.id}
                      className={`border-b last:border-0 hover:bg-gray-50/60 transition-colors ${
                        !u.isActive ? 'opacity-50' : ''
                      }`}
                    >
                      {/* Name */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                            style={{ backgroundColor: `hsl(${(idx * 47) % 360}, 55%, 50%)` }}
                          >
                            {u.firstName?.[0]?.toUpperCase()}{u.lastName?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{u.firstName} {u.lastName}</p>
                            <p className="text-xs text-gray-400">@{u.username}</p>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-4 py-3 text-gray-600">{u.email}</td>

                      {/* Roles */}
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {u.roles?.length ? u.roles.map(roleBadge) : (
                            <span className="text-xs text-gray-400">No role</span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <Badge
                          className={u.isActive
                            ? 'bg-green-100 text-green-700 border-green-200'
                            : 'bg-gray-100 text-gray-500 border-gray-200'}
                          variant="outline"
                        >
                          {u.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>

                      {/* Last Login */}
                      <td className="px-4 py-3 text-gray-500 text-xs">{fmtDate((u as any).lastLoginAt)}</td>

                      {/* Joined */}
                      <td className="px-4 py-3 text-gray-500 text-xs">{fmtDate(u.createdAt)}</td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {/* Edit */}
                          <button
                            onClick={() => setModal({ mode: 'edit', user: u })}
                            className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-800"
                            title="Edit user"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          {/* Reset password */}
                          <button
                            onClick={() => setModal({ mode: 'reset', user: u })}
                            className="p-1.5 rounded hover:bg-blue-50 text-gray-500 hover:text-blue-600"
                            title="Reset password"
                          >
                            <ShieldCheck className="h-4 w-4" />
                          </button>
                          {/* Toggle active */}
                          <button
                            onClick={() => handleToggleActive(u)}
                            className={`p-1.5 rounded transition-colors ${
                              u.isActive
                                ? 'hover:bg-amber-50 text-gray-400 hover:text-amber-600'
                                : 'hover:bg-green-50 text-gray-400 hover:text-green-600'
                            }`}
                            title={u.isActive ? 'Deactivate user' : 'Activate user'}
                          >
                            <Power className="h-4 w-4" />
                          </button>
                          {/* Delete */}
                          <button
                            onClick={() => handleDelete(u)}
                            className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600"
                            title="Delete user"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline" size="sm"
            disabled={page <= 1}
            onClick={() => setPage(p => p - 1)}
          >Previous</Button>
          <span className="text-sm text-muted-foreground px-2">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline" size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage(p => p + 1)}
          >Next</Button>
        </div>
      )}

      {/* Role legend */}
      <div className="rounded-xl border bg-gray-50 p-4">
        <p className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1">
          <ShieldCheck className="h-3.5 w-3.5" /> Role Guide
        </p>
        <div className="flex flex-wrap gap-2">
          {[
            { name: 'super_admin', label: 'Super Admin — full access' },
            { name: 'admin',       label: 'Admin — all except user management' },
            { name: 'hr',          label: 'HR — employees + payroll' },
            { name: 'accounts',    label: 'Accounts — payments + reports' },
            { name: 'sales_team',  label: 'Sales — customers + bookings + CRM' },
            { name: 'staff',       label: 'Staff — dashboard read-only' },
          ].map(({ name, label }) => (
            <span
              key={name}
              className={`px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[name] ?? 'bg-gray-100 text-gray-700'}`}
            >
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <UserModal
          mode={modal.mode}
          user={modal.user}
          roles={roles}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); load(); }}
        />
      )}
    </div>
  );
}
