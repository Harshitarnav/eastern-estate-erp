'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import materialsService, { Material } from '@/services/materials.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Package, AlertTriangle } from 'lucide-react';

export default function MaterialsPage() {
  const router = useRouter();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetchMaterials();
    fetchStats();
  }, []);

  const fetchMaterials = async () => {
    try {
      const data = await materialsService.getAllMaterials();
      setMaterials(data);
    } catch (error) {
      console.error('Error fetching materials:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await materialsService.getStatistics();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const filteredMaterials = materials.filter(material =>
    material.materialName.toLowerCase().includes(search.toLowerCase()) ||
    material.materialCode.toLowerCase().includes(search.toLowerCase())
  );

  const getStockStatus = (material: Material) => {
    if (material.currentStock <= material.minimumStockLevel) {
      return { label: 'Low Stock', color: 'destructive' };
    }
    if (material.currentStock <= material.minimumStockLevel * 1.5) {
      return { label: 'Medium Stock', color: 'warning' };
    }
    return { label: 'Good Stock', color: 'success' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading materials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Materials Management</h1>
          <p className="text-muted-foreground">Manage construction materials inventory</p>
        </div>
        <Button onClick={() => router.push('/construction/materials/new')}>
          <Plus className="mr-2 h-4 w-4" />
          Add Material
        </Button>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Materials</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalMaterials || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.lowStockCount || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{(stats.totalValue || 0).toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Materials</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeCount || 0}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search materials..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Materials Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">Code</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Category</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Stock</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Unit Price</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredMaterials.map((material) => {
                  const stockStatus = getStockStatus(material);
                  return (
                    <tr key={material.id} className="hover:bg-muted/50">
                      <td className="px-4 py-3 text-sm">{material.materialCode}</td>
                      <td className="px-4 py-3 text-sm font-medium">{material.materialName}</td>
                      <td className="px-4 py-3 text-sm">
                        <Badge variant="outline">{material.category}</Badge>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {material.currentStock} {material.unit}
                        <span className="text-muted-foreground text-xs block">
                          Min: {material.minimumStockLevel}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">₹{material.unitPrice.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm">
                        <Badge variant={stockStatus.color as any}>
                          {stockStatus.label}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/construction/materials/${material.id}`)}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {filteredMaterials.length === 0 && (
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-4 text-lg font-medium">No materials found</p>
          <p className="text-muted-foreground">Get started by adding your first material</p>
        </div>
      )}
    </div>
  );
}
