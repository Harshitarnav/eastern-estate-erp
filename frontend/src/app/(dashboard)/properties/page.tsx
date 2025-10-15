// Properties List Page - Complete CRUD Implementation
// Save as: frontend/src/app/(dashboard)/properties/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DataTable from '@/components/tables/DataTable';
import { Modal, DeleteConfirmDialog, AlertDialog } from '@/components/modals/Modal';
import { Building2, Plus, Eye, MapPin, Calendar, TrendingUp, Home } from 'lucide-react';

// Types
interface Property {
  id: string;
  code: string;
  name: string;
  location: string;
  city: string;
  state: string;
  type: string;
  totalArea: number;
  areaUnit: string;
  towers: number;
  totalUnits: number;
  soldUnits: number;
  availableUnits: number;
  bhkTypes: string;
  reraNumber: string;
  status: 'Planning' | 'Under Construction' | 'Active' | 'Completed';
  launchDate: string;
  possessionDate: string;
  priceRange: string;
  revenue: number;
  createdAt: string;
  updatedAt: string;
}

export default function PropertiesPage() {
  const router = useRouter();
  
  // State
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Stats
  const stats = {
    totalProjects: properties.length,
    totalUnits: properties.reduce((sum, p) => sum + p.totalUnits, 0),
    soldUnits: properties.reduce((sum, p) => sum + p.soldUnits, 0),
    totalRevenue: properties.reduce((sum, p) => sum + p.revenue, 0),
  };

  // Fetch properties
  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/v1/properties', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch properties');

      const data = await response.json();
      setProperties(data);
    } catch (error) {
      console.error('Error fetching properties:', error);
      // Show mock data for demo
      setProperties(getMockProperties());
    } finally {
      setLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!selectedProperty) return;

    setDeleteLoading(true);
    try {
      const response = await fetch(`/api/v1/properties/${selectedProperty.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to delete property');

      // Remove from list
      setProperties(properties.filter(p => p.id !== selectedProperty.id));
      
      setShowDelete(false);
      setSuccessMessage('Property deleted successfully');
      setShowSuccess(true);
    } catch (error) {
      console.error('Error deleting property:', error);
      alert('Failed to delete property');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async (rows: Property[]) => {
    if (!confirm(`Delete ${rows.length} properties?`)) return;

    try {
      await Promise.all(
        rows.map(row =>
          fetch(`/api/v1/properties/${row.id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
          })
        )
      );

      // Remove from list
      const deletedIds = rows.map(r => r.id);
      setProperties(properties.filter(p => !deletedIds.includes(p.id)));

      setSuccessMessage(`${rows.length} properties deleted successfully`);
      setShowSuccess(true);
    } catch (error) {
      console.error('Error bulk deleting:', error);
      alert('Failed to delete properties');
    }
  };

  // Handle export
  const handleExport = (rows: Property[]) => {
    const csv = convertToCSV(rows);
    downloadCSV(csv, `properties-${Date.now()}.csv`);
  };

  // Table columns
  const columns = [
    {
      key: 'code',
      label: 'Project Code',
      width: '140px',
      render: (value: string) => (
        <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
          {value}
        </span>
      ),
    },
    {
      key: 'name',
      label: 'Project Name',
      width: '200px',
      render: (value: string, row: Property) => (
        <div>
          <div className="font-semibold text-gray-900">{value}</div>
          <div className="text-xs text-gray-500">{row.type}</div>
        </div>
      ),
    },
    {
      key: 'location',
      label: 'Location',
      width: '180px',
      render: (value: string, row: Property) => (
        <div>
          <div className="text-sm">{value}</div>
          <div className="text-xs text-gray-500">{row.city}, {row.state}</div>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      width: '150px',
      render: (value: string) => {
        const colors = {
          'Planning': 'bg-gray-100 text-gray-800',
          'Under Construction': 'bg-yellow-100 text-yellow-800',
          'Active': 'bg-green-100 text-green-800',
          'Completed': 'bg-blue-100 text-blue-800',
        };
        return (
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${colors[value as keyof typeof colors]}`}>
            {value}
          </span>
        );
      },
    },
    {
      key: 'totalUnits',
      label: 'Units',
      width: '120px',
      render: (value: number, row: Property) => (
        <div>
          <div className="font-semibold">{value}</div>
          <div className="text-xs text-gray-500">{row.bhkTypes}</div>
        </div>
      ),
    },
    {
      key: 'soldUnits',
      label: 'Sold / Available',
      width: '150px',
      render: (value: number, row: Property) => {
        const percent = Math.round((value / row.totalUnits) * 100);
        return (
          <div>
            <div className="text-sm font-medium">{value} / {row.availableUnits}</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
              <div
                className="bg-green-600 h-2 rounded-full transition-all"
                style={{ width: `${percent}%` }}
              />
            </div>
            <div className="text-xs text-gray-500 mt-1">{percent}% sold</div>
          </div>
        );
      },
    },
    {
      key: 'revenue',
      label: 'Revenue',
      width: '130px',
      render: (value: number) => (
        <div className="font-semibold text-green-700">
          ₹{(value / 10000000).toFixed(1)}Cr
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Building2 className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Properties</h1>
              <p className="text-gray-600 mt-1">Manage all your real estate projects</p>
            </div>
          </div>
        </div>
        <button
          onClick={() => router.push('/properties/new')}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add New Property
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Projects</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalProjects}</p>
            </div>
            <Building2 className="w-12 h-12 text-blue-600 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Units</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalUnits}</p>
            </div>
            <Home className="w-12 h-12 text-green-600 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Units Sold</p>
              <p className="text-3xl font-bold text-green-700 mt-2">{stats.soldUnits}</p>
              <p className="text-xs text-gray-500 mt-1">
                {Math.round((stats.soldUnits / stats.totalUnits) * 100)}% sold
              </p>
            </div>
            <TrendingUp className="w-12 h-12 text-green-600 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-3xl font-bold text-blue-700 mt-2">
                ₹{(stats.totalRevenue / 10000000).toFixed(1)}Cr
              </p>
            </div>
            <Calendar className="w-12 h-12 text-blue-600 opacity-20" />
          </div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        data={properties}
        columns={columns}
        loading={loading}
        onRowClick={(property) => {
          setSelectedProperty(property);
          setShowDetails(true);
        }}
        onEdit={(property) => router.push(`/properties/${property.id}/edit`)}
        onDelete={(property) => {
          setSelectedProperty(property);
          setShowDelete(true);
        }}
        onBulkDelete={handleBulkDelete}
        onExport={handleExport}
        searchable
        filterable
        exportable
        bulkActions
        mobileView
      />

      {/* Details Modal */}
      <Modal
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
        title={selectedProperty?.name}
        size="lg"
        footer={
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowDetails(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Close
            </button>
            <button
              onClick={() => {
                setShowDetails(false);
                router.push(`/properties/${selectedProperty?.id}/edit`);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Edit Property
            </button>
          </div>
        }
      >
        {selectedProperty && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Project Code</label>
                <p className="text-gray-900 mt-1">{selectedProperty.code}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Type</label>
                <p className="text-gray-900 mt-1">{selectedProperty.type}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Location</label>
                <p className="text-gray-900 mt-1">{selectedProperty.location}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">City, State</label>
                <p className="text-gray-900 mt-1">{selectedProperty.city}, {selectedProperty.state}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Total Area</label>
                <p className="text-gray-900 mt-1">{selectedProperty.totalArea} {selectedProperty.areaUnit}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Towers</label>
                <p className="text-gray-900 mt-1">{selectedProperty.towers}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Total Units</label>
                <p className="text-gray-900 mt-1">{selectedProperty.totalUnits}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Sold Units</label>
                <p className="text-gray-900 mt-1">{selectedProperty.soldUnits}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">BHK Types</label>
                <p className="text-gray-900 mt-1">{selectedProperty.bhkTypes}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Price Range</label>
                <p className="text-gray-900 mt-1">{selectedProperty.priceRange}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">RERA Number</label>
                <p className="text-gray-900 mt-1">{selectedProperty.reraNumber}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Status</label>
                <p className="text-gray-900 mt-1">{selectedProperty.status}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <DeleteConfirmDialog
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        itemName={selectedProperty?.name}
        loading={deleteLoading}
      />

      {/* Success Alert */}
      <AlertDialog
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        title="Success!"
        description={successMessage}
        type="success"
      />
    </div>
  );
}

// Helper functions
function getMockProperties(): Property[] {
  return [
    {
      id: '1',
      code: 'EECD-DC-001',
      name: 'Diamond City',
      location: 'Oyna, Ranchi',
      city: 'Ranchi',
      state: 'Jharkhand',
      type: 'Township',
      totalArea: 28,
      areaUnit: 'Acres',
      towers: 13,
      totalUnits: 732,
      soldUnits: 380,
      availableUnits: 352,
      bhkTypes: '2BHK, 3BHK',
      reraNumber: 'CNT Free',
      status: 'Active',
      launchDate: '2018-06-15',
      possessionDate: '2024-12-31',
      priceRange: '₹25L - ₹45L',
      revenue: 380000000,
      createdAt: '2018-01-01',
      updatedAt: '2024-01-01',
    },
    {
      id: '2',
      code: 'EECD-ESC-002',
      name: 'Eastern Satellite City',
      location: 'Muzaffarpur',
      city: 'Muzaffarpur',
      state: 'Bihar',
      type: 'Residential Township',
      totalArea: 15,
      areaUnit: 'Acres',
      towers: 0,
      totalUnits: 100,
      soldUnits: 45,
      availableUnits: 55,
      bhkTypes: 'Duplex Villas',
      reraNumber: 'BRERAP00080-1/19/R-150/2018',
      status: 'Under Construction',
      launchDate: '2019-03-20',
      possessionDate: '2025-06-30',
      priceRange: '₹45L - ₹85L',
      revenue: 202500000,
      createdAt: '2019-01-01',
      updatedAt: '2024-01-01',
    },
    {
      id: '3',
      code: 'EECD-GV-003',
      name: 'Green Valley Residency',
      location: 'Patna',
      city: 'Patna',
      state: 'Bihar',
      type: 'Residential Complex',
      totalArea: 8,
      areaUnit: 'Acres',
      towers: 6,
      totalUnits: 240,
      soldUnits: 180,
      availableUnits: 60,
      bhkTypes: '2BHK, 3BHK',
      reraNumber: 'BRERA-PAT-2020-456',
      status: 'Active',
      launchDate: '2020-01-10',
      possessionDate: '2023-12-31',
      priceRange: '₹30L - ₹55L',
      revenue: 324000000,
      createdAt: '2020-01-01',
      updatedAt: '2024-01-01',
    },
    {
      id: '4',
      code: 'EECD-RH-004',
      name: 'Royal Heights',
      location: 'Ranchi',
      city: 'Ranchi',
      state: 'Jharkhand',
      type: 'Premium Apartments',
      totalArea: 5,
      areaUnit: 'Acres',
      towers: 4,
      totalUnits: 160,
      soldUnits: 160,
      availableUnits: 0,
      bhkTypes: '3BHK, 4BHK',
      reraNumber: 'JRERA-RAN-2017-123',
      status: 'Completed',
      launchDate: '2017-08-15',
      possessionDate: '2021-03-31',
      priceRange: '₹55L - ₹95L',
      revenue: 1120000000,
      createdAt: '2017-01-01',
      updatedAt: '2024-01-01',
    },
  ];
}

function convertToCSV(data: Property[]): string {
  const headers = ['Code', 'Name', 'Location', 'City', 'Type', 'Total Units', 'Sold Units', 'Status', 'Revenue'];
  const rows = data.map(p => [
    p.code,
    p.name,
    p.location,
    p.city,
    p.type,
    p.totalUnits,
    p.soldUnits,
    p.status,
    p.revenue,
  ]);
  
  return [headers, ...rows].map(row => row.join(',')).join('\n');
}

function downloadCSV(csv: string, filename: string) {
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}