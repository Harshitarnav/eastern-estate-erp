'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Checkbox,
} from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Shield, Building2, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { apiService } from '@/services/api';
import { propertiesService } from '@/services/properties.service';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { isAdminRole } from '@/lib/roles';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: any[];
  isActive: boolean;
}

interface Property {
  id: string;
  name: string;
  location: string;
  propertyCode: string;
}

interface PropertyAccess {
  id: string;
  propertyId: string;
  property: Property;
  role: string;
  isActive: boolean;
  assignedAt: string;
}

export default function PropertyAccessManagement() {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userPropertyAccess, setUserPropertyAccess] = useState<PropertyAccess[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);
  const [accessRole, setAccessRole] = useState('PROPERTY_VIEWER');
  const [saving, setSaving] = useState(false);

  // Check if current user is admin
  const userRoles = currentUser?.roles?.map((r: any) => typeof r === 'string' ? r : r.name) || [];
  const isAdmin = isAdminRole(userRoles);

  useEffect(() => {
    if (!isAdmin) {
      router.push('/');
      toast.error('You do not have permission to access this page');
      return;
    }
    loadData();
  }, [isAdmin]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersData, propertiesData] = await Promise.all([
        apiService.get('/users'),
        propertiesService.getProperties(),
      ]);
      
      setUsers(usersData.data || []);
      setProperties(propertiesData.data || []);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load users and properties');
    } finally {
      setLoading(false);
    }
  };

  const loadUserPropertyAccess = async (userId: string) => {
    try {
      const response = await apiService.get(`/users/${userId}/property-access`);
      setUserPropertyAccess(response || []);
      
      // Pre-select currently assigned properties
      const assignedPropertyIds = response
        .filter((access: PropertyAccess) => access.isActive)
        .map((access: PropertyAccess) => access.propertyId);
      setSelectedProperties(assignedPropertyIds);
    } catch (error) {
      console.error('Failed to load property access:', error);
      setUserPropertyAccess([]);
      setSelectedProperties([]);
    }
  };

  const handleManageAccess = async (user: User) => {
    setSelectedUser(user);
    await loadUserPropertyAccess(user.id);
    setDialogOpen(true);
  };

  const handleSaveAccess = async () => {
    if (!selectedUser) return;

    try {
      setSaving(true);
      
      // Get current assignments
      const currentAssignments = userPropertyAccess
        .filter(access => access.isActive)
        .map(access => access.propertyId);

      // Find properties to add
      const toAdd = selectedProperties.filter(id => !currentAssignments.includes(id));
      
      // Find properties to remove
      const toRemove = currentAssignments.filter(id => !selectedProperties.includes(id));

      // Grant access to new properties
      for (const propertyId of toAdd) {
        await apiService.post('/users/property-access/grant', {
          userId: selectedUser.id,
          propertyId,
          role: accessRole,
        });
      }

      // Revoke access from removed properties
      for (const propertyId of toRemove) {
        await apiService.post('/users/property-access/revoke', {
          userId: selectedUser.id,
          propertyId,
        });
      }

      toast.success('Property access updated successfully');
      setDialogOpen(false);
      await loadData();
    } catch (error: any) {
      console.error('Failed to save property access:', error);
      toast.error(error.response?.data?.message || 'Failed to save property access');
    } finally {
      setSaving(false);
    }
  };

  const toggleProperty = (propertyId: string) => {
    setSelectedProperties(prev =>
      prev.includes(propertyId)
        ? prev.filter(id => id !== propertyId)
        : [...prev, propertyId]
    );
  };

  const selectAllProperties = () => {
    if (selectedProperties.length === properties.length) {
      setSelectedProperties([]);
    } else {
      setSelectedProperties(properties.map(p => p.id));
    }
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getUserPropertyCount = (userId: string) => {
    // This would need to be loaded from API
    return 0; // Placeholder
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Property Access Management</h1>
          <p className="text-muted-foreground">
            Manage user access to properties across the organization
          </p>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>Select a user to manage their property access</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead>Properties</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.firstName} {user.lastName}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {user.roles?.map((role: any, idx: number) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {typeof role === 'string' ? role : role.displayName || role.name}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{getUserPropertyCount(user.id)} properties</Badge>
                  </TableCell>
                  <TableCell>
                    {user.isActive ? (
                      <Badge className="bg-green-500">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        <XCircle className="h-3 w-3 mr-1" />
                        Inactive
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleManageAccess(user)}
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      Manage Access
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Property Access Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Manage Property Access for {selectedUser?.firstName} {selectedUser?.lastName}
            </DialogTitle>
            <DialogDescription>
              Select properties this user can access. Changes will take effect immediately.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Access Role Selection */}
            <div className="space-y-2">
              <Label>Access Role</Label>
              <Select value={accessRole} onValueChange={setAccessRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PROPERTY_ADMIN">Property Admin (Full Access)</SelectItem>
                  <SelectItem value="PROPERTY_MANAGER">Property Manager (Edit Access)</SelectItem>
                  <SelectItem value="PROPERTY_VIEWER">Property Viewer (Read Only)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Select All */}
            <div className="flex items-center justify-between border-b pb-3">
              <Label>Properties</Label>
              <Button variant="outline" size="sm" onClick={selectAllProperties}>
                {selectedProperties.length === properties.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>

            {/* Property List */}
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {properties.map((property) => (
                <div
                  key={property.id}
                  className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => toggleProperty(property.id)}
                >
                  <Checkbox
                    checked={selectedProperties.includes(property.id)}
                    onCheckedChange={() => toggleProperty(property.id)}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">{property.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {property.propertyCode}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{property.location}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-900">
                <strong>{selectedProperties.length}</strong> of <strong>{properties.length}</strong> properties selected
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSaveAccess} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
