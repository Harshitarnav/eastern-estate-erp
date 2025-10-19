'use client';

import { useState, useEffect } from 'react';
import { rolesService, type CreateRoleDto, type UpdateRoleDto } from '@/services/roles.service';
import { type Role, type Permission } from '@/services/users.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
      resetForm();
      loadData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error saving role');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      permissionIds: [],
    });
    setEditingRole(null);
  };

  const handleEdit = (role: Role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      description: role.description || '',
      permissionIds: role.permissions?.map(p => p.id) || [],
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (role: Role) => {
    if (confirm(`Delete role "${role.name}"? This cannot be undone and may affect users with this role.`)) {
      try {
        await rolesService.deleteRole(role.id);
        loadData();
      } catch (error: any) {
        alert(error.response?.data?.message || 'Error deleting role');
      }
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Role Management</h1>
          <p className="text-gray-600 mt-1">Manage system roles and their permissions</p>
        </div>
        <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
          Add Role
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="grid gap-4">
          {roles.map((role) => (
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
                  {role.permissions && role.permissions.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.map(permission => (
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

          {roles.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No roles found. Create your first role to get started.
            </div>
          )}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
              <Label>Assign Permissions</Label>
              <p className="text-sm text-gray-500 mb-3">
                Select the permissions that users with this role should have
              </p>
              <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto p-2 border rounded">
                {permissions.map((permission) => (
                  <div key={permission.id} className="flex items-start space-x-2">
                    <Checkbox
                      checked={formData.permissionIds?.includes(permission.id)}
                      onCheckedChange={(checked) => {
                        setFormData({
                          ...formData,
                          permissionIds: checked
                            ? [...(formData.permissionIds || []), permission.id]
                            : (formData.permissionIds || []).filter(id => id !== permission.id)
                        });
                      }}
                    />
                    <div className="flex-1">
                      <label className="text-sm font-medium">{permission.name}</label>
                      {permission.description && (
                        <p className="text-xs text-gray-500">{permission.description}</p>
                      )}
                    </div>
                  </div>
                ))}
                {permissions.length === 0 && (
                  <p className="text-sm text-gray-500 col-span-2 text-center py-4">
                    No permissions available
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
