'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Building2,
  Loader2,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { apiService } from '@/services/api';

interface Property {
  id: string;
  name: string;
  propertyCode?: string;
}

interface UserPropertyAccess {
  id: string;
  propertyId: string;
  role: string;
  isActive: boolean;
  assignedAt: string;
  property: Property;
}

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  emailDomain?: string;
}

const PROPERTY_ROLES = [
  { value: 'PROPERTY_ADMIN', label: 'Property Admin', description: 'Full access to property' },
  { value: 'GM_SALES', label: 'GM Sales', description: 'Sales management for property' },
  { value: 'GM_MARKETING', label: 'GM Marketing', description: 'Marketing management for property' },
  { value: 'GM_CONSTRUCTION', label: 'GM Construction', description: 'Construction management for property' },
  { value: 'PROPERTY_VIEWER', label: 'Property Viewer', description: 'Read-only access' },
];

export default function UserPropertyAccessPage() {
  const router = useRouter();
  const params = useParams();
  const userId = typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params.id[0] : '';

  const [user, setUser] = useState<User | null>(null);
  const [userAccess, setUserAccess] = useState<UserPropertyAccess[]>([]);
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Add access dialog state
  const [selectedProperty, setSelectedProperty] = useState('');
  const [selectedRole, setSelectedRole] = useState('');

  useEffect(() => {
    if (userId) {
      loadData();
    }
  }, [userId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [userData, accessData, propertiesData] = await Promise.all([
        apiService.get(`/users/${userId}`),
        apiService.get(`/users/${userId}/property-access`),
        apiService.get('/properties'),
      ]);
      
      setUser(userData);
      setUserAccess(Array.isArray(accessData) ? accessData : []);
      setAllProperties(Array.isArray(propertiesData.data) ? propertiesData.data : Array.isArray(propertiesData) ? propertiesData : []);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to load data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleGrantAccess = async () => {
    if (!selectedProperty || !selectedRole) {
      toast.error('Please select both property and role');
      return;
    }

    try {
      setSaving(true);
      await apiService.post(`/users/${userId}/property-access`, {
        propertyId: selectedProperty,
        role: selectedRole,
      });
      
      toast.success('Property access granted successfully');
      setDialogOpen(false);
      setSelectedProperty('');
      setSelectedRole('');
      await loadData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to grant access');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleRevokeAccess = async (propertyId: string, role: string) => {
    if (!confirm('Are you sure you want to revoke this access?')) {
      return;
    }

    try {
      setSaving(true);
      await apiService.delete(`/users/${userId}/property-access/${propertyId}?role=${role}`);
      toast.success('Property access revoked successfully');
      await loadData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to revoke access');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const getAvailableProperties = () => {
    const assignedPropertyIds = userAccess
      .filter(a => a.isActive)
      .map(a => a.propertyId);
    
    return allProperties.filter(p => !assignedPropertyIds.includes(p.id));
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'PROPERTY_ADMIN':
        return 'bg-red-500';
      case 'GM_SALES':
        return 'bg-blue-500';
      case 'GM_MARKETING':
        return 'bg-purple-500';
      case 'GM_CONSTRUCTION':
        return 'bg-orange-500';
      case 'PROPERTY_VIEWER':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <div className="text-lg ml-2">Loading property access...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6 text-center text-red-500">
        <p>User not found</p>
        <Button onClick={() => router.back()} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
      </div>
    );
  }

  const availableProperties = getAvailableProperties();

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Property Access Management
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Managing access for {user.firstName} {user.lastName} ({user.email})
            </p>
          </div>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Grant Access
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Grant Property Access</DialogTitle>
              <DialogDescription>
                Assign a property and role to {user.firstName}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="property">Property</Label>
                <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                  <SelectTrigger id="property">
                    <SelectValue placeholder="Select property" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableProperties.length === 0 ? (
                      <div className="p-2 text-sm text-muted-foreground">
                        No available properties
                      </div>
                    ) : (
                      availableProperties.map((property) => (
                        <SelectItem key={property.id} value={property.id}>
                          {property.name} {property.propertyCode && `(${property.propertyCode})`}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROPERTY_ROLES.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        <div>
                          <div className="font-medium">{role.label}</div>
                          <div className="text-xs text-muted-foreground">
                            {role.description}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setDialogOpen(false);
                  setSelectedProperty('');
                  setSelectedRole('');
                }}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button onClick={handleGrantAccess} disabled={saving || !selectedProperty || !selectedRole}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Granting...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Grant Access
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>Access Summary</CardTitle>
          <CardDescription>
            Overview of property access for this user
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-2xl font-bold">{userAccess.filter(a => a.isActive).length}</div>
              <div className="text-sm text-muted-foreground">Properties Assigned</div>
            </div>
            <div>
              <div className="text-2xl font-bold">
                {new Set(userAccess.filter(a => a.isActive).map(a => a.role)).size}
              </div>
              <div className="text-sm text-muted-foreground">Different Roles</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{allProperties.length}</div>
              <div className="text-sm text-muted-foreground">Total Properties</div>
            </div>
            <div>
              <div className="text-2xl font-bold">
                {user.emailDomain === 'eecd.in' ? (
                  <Badge className="bg-green-500">Verified</Badge>
                ) : (
                  <Badge className="bg-yellow-500">Unverified</Badge>
                )}
              </div>
              <div className="text-sm text-muted-foreground">Domain Status</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Property Access Table */}
      <Card>
        <CardHeader>
          <CardTitle>Property Access Details</CardTitle>
          <CardDescription>
            List of all properties this user can access and their roles
          </CardDescription>
        </CardHeader>
        <CardContent>
          {userAccess.filter(a => a.isActive).length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No property access assigned</p>
              <p className="text-sm mt-2">Click "Grant Access" to assign properties</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Property</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Assigned At</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userAccess
                  .filter((access) => access.isActive)
                  .map((access) => (
                    <TableRow key={access.id}>
                      <TableCell className="font-medium">
                        {access.property?.name || 'Unknown Property'}
                      </TableCell>
                      <TableCell>
                        {access.property?.propertyCode || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge className={getRoleBadgeColor(access.role)}>
                          {PROPERTY_ROLES.find(r => r.value === access.role)?.label || access.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(access.assignedAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </TableCell>
                      <TableCell>
                        {access.isActive ? (
                          <Badge className="bg-green-500">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-500">
                            <XCircle className="h-3 w-3 mr-1" />
                            Inactive
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRevokeAccess(access.propertyId, access.role)}
                          disabled={saving}
                        >
                          {saving ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <Trash2 className="h-4 w-4 mr-1" />
                              Revoke
                            </>
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
