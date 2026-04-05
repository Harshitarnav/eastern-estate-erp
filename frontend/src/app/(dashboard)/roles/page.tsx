'use client';

import { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { rolesService, type CreateRoleDto, type UpdateRoleDto } from '@/services/roles.service';
import { type Role, type Permission } from '@/services/users.service';
import { TableRowsSkeleton } from '@/components/Skeletons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronRight } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';

function permissionGroupKey(p: Permission): string {
  if (p.module) return p.module;
  const n = p.name || '';
  const dot = n.indexOf('.');
  if (dot >= 0) return n.slice(0, dot);
  const colon = n.indexOf(':');
  if (colon >= 0) return n.slice(0, colon);
  return 'other';
}

function permissionDisplayName(p: Permission): string {
  if (p.module && p.action) {
    return p.resource
      ? `${p.module} · ${p.action} · ${p.resource}`
      : `${p.module} · ${p.action}`;
  }
  return p.name;
}

function formatGroupTitle(key: string): string {
  if (key === 'other') return 'Other';
  return key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState<CreateRoleDto>({
    name: '',
    description: '',
    permissionIds: [],
  });
  const [permSearch, setPermSearch] = useState('');
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const filteredPermissions = useMemo(() => {
    const list = permissions || [];
    const q = permSearch.trim().toLowerCase();
    if (!q) return list;
    return list.filter((p) => {
      const label = permissionDisplayName(p).toLowerCase();
      const desc = (p.description || '').toLowerCase();
      const mod = (p.module || '').toLowerCase();
      const act = (p.action || '').toLowerCase();
      return (
        label.includes(q) ||
        desc.includes(q) ||
        mod.includes(q) ||
        act.includes(q)
      );
    });
  }, [permissions, permSearch]);

  const groupedPermissions = useMemo(() => {
    const m = new Map<string, Permission[]>();
    for (const p of filteredPermissions) {
      const k = permissionGroupKey(p);
      if (!m.has(k)) m.set(k, []);
      m.get(k)!.push(p);
    }
    for (const [, arr] of m) {
      arr.sort((a, b) =>
        permissionDisplayName(a).localeCompare(permissionDisplayName(b)),
      );
    }
    return [...m.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [filteredPermissions]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [rolesData, permissionsData] = await Promise.all([
        rolesService.getRoles(),
        rolesService.getPermissions(),
      ]);
      setRoles(rolesData);
      setPermissions(permissionsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingRole) {
        await rolesService.updateRole(editingRole.id, formData as UpdateRoleDto);
      } else {
        await rolesService.createRole(formData);
      }
      setIsDialogOpen(false);
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error saving role');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      permissionIds: [],
    });
    setEditingRole(null);
    setPermSearch('');
    setCollapsedGroups({});
  };

  const setGroupSelection = (perms: Permission[], select: boolean) => {
    const idSet = new Set(perms.map((p) => p.id));
    setFormData((prev) => ({
      ...prev,
      permissionIds: select
        ? [...new Set([...(prev.permissionIds || []), ...perms.map((p) => p.id)])]
        : (prev.permissionIds || []).filter((id) => !idSet.has(id)),
    }));
  };

  const selectAllFiltered = () => {
    setFormData((prev) => ({
      ...prev,
      permissionIds: [
        ...new Set([
          ...(prev.permissionIds || []),
          ...filteredPermissions.map((p) => p.id),
        ]),
      ],
    }));
  };

  const clearAllFiltered = () => {
    const idSet = new Set(filteredPermissions.map((p) => p.id));
    setFormData((prev) => ({
      ...prev,
      permissionIds: (prev.permissionIds || []).filter((id) => !idSet.has(id)),
    }));
  };

  const toggleGroupCollapsed = (key: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleEdit = (role: Role) => {
    setEditingRole(role);
    setPermSearch('');
    setCollapsedGroups({});
    setFormData({
      name: role.name,
      description: role.description || '',
      permissionIds: role.permissions?.map(p => p.id) || [],
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (role: Role) => {
    if (!window.confirm(`Delete role "${role.name}"? This cannot be undone and may affect users with this role.`)) return;
    try {
      await rolesService.deleteRole(role.id);
      toast.success(`Role "${role.name}" deleted`);
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error deleting role');
    }
  };

  return (
    <div className="p-4 sm:p-6 min-w-0 max-w-full">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-6 min-w-0">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold">Role Management</h1>
          <p className="text-gray-600 mt-1">Manage system roles and their permissions</p>
        </div>
        <Button className="shrink-0 w-full sm:w-auto" onClick={() => { resetForm(); setIsDialogOpen(true); }}>
          Add Role
        </Button>
      </div>

      {loading ? (
        <TableRowsSkeleton rows={5} cols={3} />
      ) : (
        <div className="grid gap-4">
          {((roles || [])).map((role) => (
            <div key={role.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold">{role.name}</h3>
                    <Badge variant="outline">{role.permissions?.length || 0} permissions</Badge>
                  </div>
                  {role.description && (
                    <p className="text-gray-600 mb-3">{role.description}</p>
                  )}
                  {role.permissions && (role.permissions || []).length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {(role.permissions || []).map(permission => (
                        <Badge key={permission.id} variant="secondary" className="text-xs">
                          {permission.name}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-2 ml-4">
                  <Button size="sm" onClick={() => handleEdit(role)}>
                    Edit
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(role)}>
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {(roles || []).length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No roles found. Create your first role to get started.
            </div>
          )}
        </div>
      )}

      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto overflow-x-hidden min-w-0 w-[calc(100vw-1.5rem)] sm:w-full p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>{editingRole ? 'Edit Role' : 'Create Role'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Role Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., sales_manager"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Use lowercase with underscores (e.g., sales_manager, admin, hr_manager)
              </p>
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe this role's responsibilities..."
                rows={3}
              />
            </div>

            <div>
              <Label>Assign permissions</Label>
              <p className="text-sm text-gray-500 mt-1 mb-3">
                Search, expand a module, then pick individual rights or use All / None for that module.
              </p>
              <Input
                placeholder="Search by module or keyword…"
                value={permSearch}
                onChange={(e) => setPermSearch(e.target.value)}
                className="mb-2"
              />
              <div className="flex flex-wrap gap-2 mb-3">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={selectAllFiltered}
                  disabled={filteredPermissions.length === 0}
                >
                  Select all matching
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={clearAllFiltered}
                  disabled={filteredPermissions.length === 0}
                >
                  Clear matching
                </Button>
              </div>
              <div className="border rounded-lg divide-y max-h-[min(50vh,440px)] overflow-y-auto bg-background">
                {groupedPermissions.map(([groupKey, perms]) => {
                  const collapsed = !!collapsedGroups[groupKey];
                  const selectedInGroup = perms.filter((p) =>
                    formData.permissionIds?.includes(p.id),
                  ).length;
                  return (
                    <div key={groupKey}>
                      <div className="flex flex-wrap items-center gap-2 px-3 py-2 bg-muted/50">
                        <button
                          type="button"
                          className="flex items-center gap-1 text-sm font-medium min-w-0 flex-1 text-left"
                          onClick={() => toggleGroupCollapsed(groupKey)}
                        >
                          {collapsed ? (
                            <ChevronRight className="h-4 w-4 shrink-0 opacity-70" />
                          ) : (
                            <ChevronDown className="h-4 w-4 shrink-0 opacity-70" />
                          )}
                          <span className="truncate">{formatGroupTitle(groupKey)}</span>
                          <span className="text-xs font-normal text-muted-foreground shrink-0">
                            ({selectedInGroup}/{perms.length})
                          </span>
                        </button>
                        <div className="flex gap-1 shrink-0">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs px-2"
                            onClick={() => setGroupSelection(perms, true)}
                          >
                            All
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs px-2"
                            onClick={() => setGroupSelection(perms, false)}
                          >
                            None
                          </Button>
                        </div>
                      </div>
                      {!collapsed && (
                        <ul className="px-3 py-2 space-y-2.5">
                          {perms.map((permission) => (
                            <li key={permission.id} className="flex items-start gap-2">
                              <Checkbox
                                id={`perm-${permission.id}`}
                                className="mt-0.5"
                                checked={formData.permissionIds?.includes(permission.id)}
                                onCheckedChange={(checked) => {
                                  setFormData((prev) => ({
                                    ...prev,
                                    permissionIds: checked
                                      ? [...(prev.permissionIds || []), permission.id]
                                      : (prev.permissionIds || []).filter(
                                          (id) => id !== permission.id,
                                        ),
                                  }));
                                }}
                              />
                              <label
                                htmlFor={`perm-${permission.id}`}
                                className="text-sm leading-snug cursor-pointer flex-1"
                              >
                                <span className="font-medium">
                                  {permissionDisplayName(permission)}
                                </span>
                                {permission.description && (
                                  <span className="block text-xs text-muted-foreground mt-0.5">
                                    {permission.description}
                                  </span>
                                )}
                              </label>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  );
                })}
                {(permissions || []).length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8 px-3">
                    No permissions available
                  </p>
                )}
                {(permissions || []).length > 0 && groupedPermissions.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8 px-3">
                    No permissions match your search
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingRole ? 'Update Role' : 'Create Role'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
