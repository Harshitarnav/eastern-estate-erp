'use client';

import { useState, useEffect } from 'react';
import { usersService, type User } from '@/services/users.service';
import { rolesService, type Role } from '@/services/roles.service';
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
import { Checkbox } from '@/components/ui/checkbox';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    gender: '',
    roleIds: [] as string[],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersData, rolesData] = await Promise.all([
        usersService.getUsers({ search }),
        rolesService.getRoles(),
      ]);
      setUsers(usersData.data);
      setRoles(rolesData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const normalizedGender = (['Male', 'Female', 'Other'] as const).includes(
        formData.gender as any,
      )
        ? (formData.gender as 'Male' | 'Female' | 'Other')
        : 'Other';

      if (editingUser) {
        await usersService.updateUser(editingUser.id, {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          gender: normalizedGender,
          roleIds: formData.roleIds,
        });
      } else {
        await usersService.createUser({
          ...formData,
          gender: normalizedGender,
        });
      }
      setIsDialogOpen(false);
      resetForm();
      loadData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error saving user');
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      username: '',
      password: '',
      firstName: '',
      lastName: '',
      phone: '',
      gender: '',
      roleIds: [],
    });
    setEditingUser(null);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      username: user.username,
      password: '',
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone || '',
      gender: user.gender || '',
      roleIds: user.roles.map(r => r.id),
    });
    setIsDialogOpen(true);
  };

  const handleToggleActive = async (user: User) => {
    if (confirm(`${user.isActive ? 'Deactivate' : 'Activate'} user ${user.firstName} ${user.lastName}?`)) {
      try {
        await usersService.toggleUserActive(user.id);
        loadData();
      } catch (error: any) {
        alert(error.response?.data?.message || 'Error toggling user status');
      }
    }
  };

  const handleDelete = async (user: User) => {
    if (confirm(`Delete user ${user.firstName} ${user.lastName}? This cannot be undone.`)) {
      try {
        await usersService.deleteUser(user.id);
        loadData();
      } catch (error: any) {
        alert(error.response?.data?.message || 'Error deleting user');
      }
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>
        <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
          Add User
        </Button>
      </div>

      <div className="mb-4">
        <Input
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && loadData()}
          className="max-w-sm"
        />
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Roles</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.firstName} {user.lastName}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.phone || '-'}</TableCell>
                <TableCell>
                  {user.roles.map(role => (
                    <Badge key={role.id} variant="secondary" className="mr-1">
                      {role.name}
                    </Badge>
                  ))}
                </TableCell>
                <TableCell>
                  <Badge variant={user.isActive ? 'default' : 'destructive'}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleEdit(user)}>Edit</Button>
                    <Button size="sm" variant="outline" onClick={() => handleToggleActive(user)}>
                      {user.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(user)}>
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingUser ? 'Edit User' : 'Create User'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled={!!editingUser}
                />
              </div>
              <div>
                <Label>Username *</Label>
                <Input
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                  disabled={!!editingUser}
                />
              </div>
            </div>

            {!editingUser && (
              <div>
                <Label>Password *</Label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={8}
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>First Name *</Label>
                <Input
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Last Name *</Label>
                <Input
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Phone</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div>
                <Label>Gender</Label>
                <select
                  className="w-full border rounded px-3 py-2"
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                >
                  <option value="">Select...</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <Label>Assign Roles</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {roles.map((role) => (
                  <div key={role.id} className="flex items-center space-x-2">
                    <Checkbox
                      checked={formData.roleIds.includes(role.id)}
                      onCheckedChange={(checked) => {
                        setFormData({
                          ...formData,
                          roleIds: checked
                            ? [...formData.roleIds, role.id]
                            : formData.roleIds.filter(id => id !== role.id)
                        });
                      }}
                    />
                    <label className="text-sm">{role.name}</label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingUser ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
