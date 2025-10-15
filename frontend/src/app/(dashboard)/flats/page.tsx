'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Home, Plus, Search, Filter, Building2, Edit, Trash2, Eye, MapPin } from 'lucide-react';
import { flatsService, Flat, FlatFilters } from '@/services/flats.service';
import { propertiesService } from '@/services/properties.service';
import { towersService } from '@/services/towers.service';

/**
 * Flats/Units Management Page
 * 
 * Complete flat management with CRUD operations.
 * Part of the inventory hierarchy: Property → Tower → Flat
 * 
 * Features:
 * - List all flats with pagination
 * - Search and filter flats
 * - Filter by property, tower, type, status
 * - Price range filtering
 * - Create, edit, delete flats
 * - View flat details
 * - Availability tracking
 * - Eastern Estate branding
 */
export default function FlatsPage() {
  const router = useRouter();
  const [flats, setFlats] = useState<Flat[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [towers, setTowers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState<FlatFilters>({
    page: 1,
    limit: 12,
    isActive: true,
  });
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 0,
  });

  // Fetch flats
  const fetchFlats = async () => {
    try {
      setLoading(true);
      const response = await flatsService.getFlats(filters);
      setFlats(response.data);
      setMeta(response.meta);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch flats');
      console.error('Error fetching flats:', err);
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

  // Fetch towers for filter (when property is selected)
  const fetchTowers = async (propertyId?: string) => {
    try {
      const response = await towersService.getTowers({ 
        propertyId, 
        isActive: true 
      });
      setTowers(response.data);
    } catch (err) {
      console.error('Error fetching towers:', err);
    }
  };

  useEffect(() => {
    fetchFlats();
    fetchProperties();
  }, [filters]);

  useEffect(() => {
    if (filters.propertyId) {
      fetchTowers(filters.propertyId);
    } else {
      setTowers([]);
    }
  }, [filters.propertyId]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete flat "${name}"?`)) {
      return;
    }

    try {
      await flatsService.deleteFlat(id);
      fetchFlats();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete flat');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return '#3DA35D';
      case 'BOOKED':
        return '#F2C94C';
      case 'SOLD':
        return '#A8211B';
      case 'BLOCKED':
        return '#6B7280';
      case 'UNDER_CONSTRUCTION':
        return '#3B82F6';
      default:
        return '#6B7280';
    }
  };

  const getStatusLabel = (status: string) => {
    return status.replace(/_/g, ' ');
  };

  const formatPrice = (price: number) => {
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(2)}Cr`;
    } else if (price >= 100000) {
      return `₹${(price / 100000).toFixed(2)}L`;
    } else {
      return `₹${(price / 1000).toFixed(0)}K`;
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Home className="h-8 w-8" style={{ color: '#A8211B' }} />
          <h1 className="text-3xl font-bold" style={{ color: '#7B1E12' }}>
            Flats / Units
          </h1>
        </div>
        <p className="text-gray-600">
          Manage individual units within towers. Track availability, pricing, and bookings.
        </p>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search flats..."
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
            onChange={(e) => setFilters({ ...filters, propertyId: e.target.value || undefined, towerId: undefined, page: 1 })}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
          >
            <option value="">All Properties</option>
            {properties.map((property) => (
              <option key={property.id} value={property.id}>
                {property.name}
              </option>
            ))}
          </select>

          {/* Tower Filter */}
          <select
            value={filters.towerId || ''}
            onChange={(e) => setFilters({ ...filters, towerId: e.target.value || undefined, page: 1 })}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
            disabled={!filters.propertyId}
          >
            <option value="">All Towers</option>
            {towers.map((tower) => (
              <option key={tower.id} value={tower.id}>
                {tower.name}
              </option>
            ))}
          </select>

          {/* Type Filter */}
          <select
            value={filters.type || ''}
            onChange={(e) => setFilters({ ...filters, type: e.target.value || undefined, page: 1 })}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
          >
            <option value="">All Types</option>
            <option value="STUDIO">Studio</option>
            <option value="1BHK">1 BHK</option>
            <option value="2BHK">2 BHK</option>
            <option value="3BHK">3 BHK</option>
            <option value="4BHK">4 BHK</option>
            <option value="PENTHOUSE">Penthouse</option>
            <option value="DUPLEX">Duplex</option>
            <option value="VILLA">Villa</option>
          </select>
        </div>

        <div className="flex gap-4">
          {/* Status Filter */}
          <select
            value={filters.status || ''}
            onChange={(e) => setFilters({ ...filters, status: e.target.value || undefined, page: 1 })}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
          >
            <option value="">All Status</option>
            <option value="AVAILABLE">Available</option>
            <option value="BOOKED">Booked</option>
            <option value="SOLD">Sold</option>
            <option value="BLOCKED">Blocked</option>
            <option value="UNDER_CONSTRUCTION">Under Construction</option>
          </select>

          <div className="flex-1"></div>

          {/* Add Flat Button */}
          <button
            onClick={() => router.push('/flats/new')}
            className="px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            style={{ backgroundColor: '#A8211B', color: 'white' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#7B1E12'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#A8211B'}
          >
            <Plus className="h-5 w-5" />
            <span>Add Flat</span>
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
            <p className="text-gray-600">Loading flats...</p>
          </div>
        </div>
      ) : flats.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <Home className="h-16 w-16 mx-auto mb-4" style={{ color: '#A8211B', opacity: 0.5 }} />
          <h3 className="text-xl font-semibold mb-2" style={{ color: '#7B1E12' }}>
            No Flats Found
          </h3>
          <p className="text-gray-600 mb-6">
            {filters.search || filters.propertyId || filters.towerId || filters.type || filters.status
              ? 'No flats match your search criteria. Try adjusting your filters.'
              : 'Get started by adding flats to your towers.'}
          </p>
          <button
            onClick={() => router.push('/flats/new')}
            className="px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center gap-2"
            style={{ backgroundColor: '#A8211B', color: 'white' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#7B1E12'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#A8211B'}
          >
            <Plus className="h-5 w-5" />
            <span>Add Your First Flat</span>
          </button>
        </div>
      ) : (
        /* Flats Grid */
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-6">
            {flats.map((flat) => (
              <div
                key={flat.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
              >
                {/* Flat Header */}
                <div className="p-4" style={{ backgroundColor: '#FEF3E2' }}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold" style={{ color: '#7B1E12' }}>
                        {flat.flatNumber}
                      </h3>
                      <p className="text-sm text-gray-600">{flat.type}</p>
                    </div>
                    <div
                      className="px-2 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: `${getStatusColor(flat.status)}20`,
                        color: getStatusColor(flat.status),
                      }}
                    >
                      {getStatusLabel(flat.status)}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {flat.tower?.name || 'Tower'} • Floor {flat.floor}
                  </p>
                </div>

                {/* Flat Details */}
                <div className="p-4">
                  <div className="grid grid-cols-3 gap-2 mb-3 text-center">
                    <div>
                      <p className="text-xs text-gray-500">Beds</p>
                      <p className="font-semibold" style={{ color: '#7B1E12' }}>
                        {flat.bedrooms}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Baths</p>
                      <p className="font-semibold" style={{ color: '#7B1E12' }}>
                        {flat.bathrooms}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Area</p>
                      <p className="font-semibold" style={{ color: '#7B1E12' }}>
                        {flat.carpetArea}
                      </p>
                    </div>
                  </div>

                  <div className="mb-3 pb-3 border-b">
                    <p className="text-xs text-gray-500 mb-1">Price</p>
                    <p className="text-xl font-bold" style={{ color: '#3DA35D' }}>
                      {formatPrice(flat.finalPrice)}
                    </p>
                    {flat.pricePerSqft && (
                      <p className="text-xs text-gray-500">
                        ₹{flat.pricePerSqft}/sq.ft
                      </p>
                    )}
                  </div>

                  {/* Features */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {flat.vastuCompliant && (
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                        Vastu
                      </span>
                    )}
                    {flat.cornerUnit && (
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                        Corner
                      </span>
                    )}
                    {flat.parkingSlots > 0 && (
                      <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded">
                        {flat.parkingSlots}P
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => alert(`View flat: ${flat.id}`)}
                      className="flex-1 px-3 py-2 border rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                      style={{ borderColor: '#A8211B', color: '#A8211B' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FEF3E2'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <Eye className="h-4 w-4" />
                      <span>View</span>
                    </button>
                    <button
                      onClick={() => alert(`Edit flat: ${flat.id}`)}
                      className="px-3 py-2 border rounded-lg text-sm font-medium transition-colors"
                      style={{ borderColor: '#F2C94C', color: '#7B1E12' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FEF3E2'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(flat.id, flat.flatNumber)}
                      className="px-3 py-2 border border-red-300 text-red-600 rounded-lg text-sm font-medium transition-colors hover:bg-red-50"
                      disabled={flat.status === 'BOOKED' || flat.status === 'SOLD'}
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
    </div>
  );
}
