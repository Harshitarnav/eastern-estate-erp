'use client';

import { useState, useEffect } from 'react';
import { Home, Plus, Search, Filter, Building2, Edit, Trash2, Eye } from 'lucide-react';
import { towersService, Tower, TowerFilters } from '@/services/towers.service';
import { propertiesService } from '@/services/properties.service';
import { TowerForm } from '@/components/forms/TowerForm';

/**
 * Towers Management Page
 * 
 * Complete tower management with CRUD operations.
 * Follows Eastern Estate brand guidelines and philosophy.
 * 
 * Features:
 * - List all towers with pagination
 * - Search and filter towers
 * - Create, edit, delete towers
 * - View tower details
 * - Group by property
 * - Construction status tracking
 */
export default function TowersPage() {
  const [towers, setTowers] = useState<Tower[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingTower, setEditingTower] = useState<Tower | null>(null);
  const [filters, setFilters] = useState<TowerFilters>({
    page: 1,
    limit: 10,
    isActive: true,
  });
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });

  // Fetch towers
  const fetchTowers = async () => {
    try {
      setLoading(true);
      const response = await towersService.getTowers(filters);
      setTowers(response.data);
      setMeta(response.meta);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch towers');
      console.error('Error fetching towers:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch properties for filter
  const fetchProperties = async () => {
    try {
      const response = await propertiesService.getProperties({ isActive: true });
      setProperties(response.data);
    } catch (err) {
      console.error('Error fetching properties:', err);
    }
  };

  useEffect(() => {
    fetchTowers();
    fetchProperties();
  }, [filters]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    fetchTowers();
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete tower "${name}"?`)) {
      return;
    }

    try {
      await towersService.deleteTower(id);
      fetchTowers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete tower');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
      case 'READY_TO_MOVE':
        return '#3DA35D';
      case 'UNDER_CONSTRUCTION':
        return '#F2C94C';
      case 'PLANNED':
        return '#A8211B';
      default:
        return '#6B7280';
    }
  };

  const getStatusLabel = (status: string) => {
    return status.replace(/_/g, ' ');
  };

  // Handle form submission (create or update)
  const handleSubmit = async (data: Partial<Tower>) => {
    try {
      if (editingTower) {
        await towersService.updateTower(editingTower.id, data);
      } else {
        await towersService.createTower(data);
      }
      setShowForm(false);
      setEditingTower(null);
      fetchTowers();
    } catch (err) {
      throw err; // Re-throw to let form handle the error
    }
  };

  // Handle opening add form
  const handleAdd = () => {
    setEditingTower(null);
    setShowForm(true);
  };

  // Handle opening edit form
  const handleEdit = (tower: Tower) => {
    setEditingTower(tower);
    setShowForm(true);
  };

  // Handle closing form
  const handleCloseForm = () => {
    setShowForm(false);
    setEditingTower(null);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Home className="h-8 w-8" style={{ color: '#A8211B' }} />
          <h1 className="text-3xl font-bold" style={{ color: '#7B1E12' }}>
            Towers Management
          </h1>
        </div>
        <p className="text-gray-600">
          Manage towers within your properties. Track construction, units, and more.
        </p>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search towers..."
                value={filters.search || ''}
                onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                style={{ focusRing: '#A8211B' }}
              />
            </div>
          </div>

          {/* Property Filter */}
          <select
            value={filters.propertyId || ''}
            onChange={(e) => setFilters({ ...filters, propertyId: e.target.value || undefined, page: 1 })}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
            style={{ minWidth: '200px' }}
          >
            <option value="">All Properties</option>
            {properties.map((property) => (
              <option key={property.id} value={property.id}>
                {property.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={filters.constructionStatus || ''}
            onChange={(e) => setFilters({ ...filters, constructionStatus: e.target.value || undefined, page: 1 })}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
          >
            <option value="">All Status</option>
            <option value="PLANNED">Planned</option>
            <option value="UNDER_CONSTRUCTION">Under Construction</option>
            <option value="COMPLETED">Completed</option>
            <option value="READY_TO_MOVE">Ready to Move</option>
          </select>

          {/* Add Tower Button */}
          <button
            onClick={handleAdd}
            className="px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            style={{ backgroundColor: '#A8211B', color: 'white' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#7B1E12'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#A8211B'}
          >
            <Plus className="h-5 w-5" />
            <span>Add Tower</span>
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#A8211B' }}></div>
            <p className="text-gray-600">Loading towers...</p>
          </div>
        </div>
      ) : towers.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <Home className="h-16 w-16 mx-auto mb-4" style={{ color: '#A8211B', opacity: 0.5 }} />
          <h3 className="text-xl font-semibold mb-2" style={{ color: '#7B1E12' }}>
            No Towers Found
          </h3>
          <p className="text-gray-600 mb-6">
            {filters.search || filters.propertyId || filters.constructionStatus
              ? 'No towers match your search criteria. Try adjusting your filters.'
              : 'Get started by adding your first tower to a property.'}
          </p>
          <button
            onClick={handleAdd}
            className="px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center gap-2"
            style={{ backgroundColor: '#A8211B', color: 'white' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#7B1E12'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#A8211B'}
          >
            <Plus className="h-5 w-5" />
            <span>Add Your First Tower</span>
          </button>
        </div>
      ) : (
        /* Towers Grid */
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {towers.map((tower) => (
              <div
                key={tower.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
              >
                {/* Tower Header */}
                <div className="p-4" style={{ backgroundColor: '#FEF3E2' }}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold mb-1" style={{ color: '#7B1E12' }}>
                        {tower.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {tower.property?.name || 'Property'}
                      </p>
                    </div>
                    <div
                      className="px-3 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: `${getStatusColor(tower.constructionStatus)}20`,
                        color: getStatusColor(tower.constructionStatus),
                      }}
                    >
                      {getStatusLabel(tower.constructionStatus)}
                    </div>
                  </div>
                </div>

                {/* Tower Details */}
                <div className="p-4">
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div>
                      <p className="text-xs text-gray-500">Tower Number</p>
                      <p className="font-semibold" style={{ color: '#7B1E12' }}>
                        {tower.towerNumber}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Total Floors</p>
                      <p className="font-semibold" style={{ color: '#7B1E12' }}>
                        {tower.totalFloors}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Total Units</p>
                      <p className="font-semibold" style={{ color: '#7B1E12' }}>
                        {tower.totalUnits}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Lifts</p>
                      <p className="font-semibold" style={{ color: '#7B1E12' }}>
                        {tower.numberOfLifts}
                      </p>
                    </div>
                  </div>

                  {tower.vastuCompliant && (
                    <div className="flex items-center gap-2 mb-4 text-sm" style={{ color: '#3DA35D' }}>
                      <span>✓</span>
                      <span>Vastu Compliant</span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => alert(`View tower: ${tower.id}`)}
                      className="flex-1 px-3 py-2 border rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                      style={{ borderColor: '#A8211B', color: '#A8211B' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FEF3E2'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <Eye className="h-4 w-4" />
                      <span>View</span>
                    </button>
                    <button
                      onClick={() => handleEdit(tower)}
                      className="px-3 py-2 border rounded-lg text-sm font-medium transition-colors"
                      style={{ borderColor: '#F2C94C', color: '#7B1E12' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FEF3E2'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(tower.id, tower.name)}
                      className="px-3 py-2 border border-red-300 text-red-600 rounded-lg text-sm font-medium transition-colors hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {meta.totalPages > 1 && (
            <div className="flex justify-center items-center gap-2">
              <button
                onClick={() => setFilters({ ...filters, page: Math.max(1, (filters.page || 1) - 1) })}
                disabled={(filters.page || 1) === 1}
                className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ borderColor: '#A8211B', color: '#A8211B' }}
              >
                Previous
              </button>
              <span className="text-gray-600">
                Page {meta.page} of {meta.totalPages}
              </span>
              <button
                onClick={() => setFilters({ ...filters, page: Math.min(meta.totalPages, (filters.page || 1) + 1) })}
                disabled={(filters.page || 1) === meta.totalPages}
                className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ borderColor: '#A8211B', color: '#A8211B' }}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Brand Footer */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          Eastern Estate ERP • Building Homes, Nurturing Bonds
        </p>
      </div>

      {/* Tower Form Modal */}
      {showForm && (
        <TowerForm
          tower={editingTower}
          onSubmit={handleSubmit}
          onCancel={handleCloseForm}
        />
      )}
    </div>
  );
}
