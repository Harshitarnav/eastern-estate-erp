'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Tower } from '@/services/towers.service';
import { propertiesService } from '@/services/properties.service';

interface TowerFormProps {
  tower?: Tower | null;
  onSubmit: (data: Partial<Tower>) => Promise<void>;
  onCancel: () => void;
}

/**
 * Tower Form Component
 * 
 * Universal form for creating and editing towers.
 * Follows Eastern Estate brand guidelines.
 * 
 * Features:
 * - Create new towers
 * - Edit existing towers
 * - Comprehensive validation
 * - Property selection
 * - Construction status tracking
 * - Vastu compliance
 * - Eastern Estate branding
 */
export function TowerForm({ tower, onSubmit, onCancel }: TowerFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [properties, setProperties] = useState<any[]>([]);
  const [formData, setFormData] = useState<Partial<Tower>>({
    name: tower?.name || '',
    towerNumber: tower?.towerNumber || '',
    description: tower?.description || '',
    propertyId: tower?.propertyId || '',
    totalFloors: tower?.totalFloors || 0,
    totalUnits: tower?.totalUnits || 0,
    basementLevels: tower?.basementLevels || 0,
    unitsPerFloor: tower?.unitsPerFloor || '',
    constructionStatus: tower?.constructionStatus || 'PLANNED',
    constructionStartDate: tower?.constructionStartDate?.split('T')[0] || '',
    completionDate: tower?.completionDate?.split('T')[0] || '',
    reraNumber: tower?.reraNumber || '',
    builtUpArea: tower?.builtUpArea || undefined,
    carpetArea: tower?.carpetArea || undefined,
    ceilingHeight: tower?.ceilingHeight || undefined,
    numberOfLifts: tower?.numberOfLifts || 0,
    vastuCompliant: tower?.vastuCompliant ?? true,
    facing: tower?.facing || '',
    specialFeatures: tower?.specialFeatures || '',
    displayOrder: tower?.displayOrder || 1,
  });

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const response = await propertiesService.getProperties({ isActive: true });
      setProperties(response.data);
    } catch (err) {
      console.error('Error fetching properties:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.towerNumber || !formData.propertyId) {
      setError('Please fill in all required fields');
      return;
    }

    if (!formData.totalFloors || formData.totalFloors < 1) {
      setError('Total floors must be at least 1');
      return;
    }

    if (!formData.totalUnits || formData.totalUnits < 1) {
      setError('Total units must be at least 1');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await onSubmit(formData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save tower');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      setFormData({
        ...formData,
        [name]: (e.target as HTMLInputElement).checked,
      });
    } else if (type === 'number') {
      setFormData({
        ...formData,
        [name]: value === '' ? undefined : parseFloat(value),
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b" style={{ backgroundColor: '#FEF3E2' }}>
          <h2 className="text-2xl font-bold" style={{ color: '#7B1E12' }}>
            {tower ? 'Edit Tower' : 'Add New Tower'}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-white rounded-lg transition-colors"
          >
            <X className="h-6 w-6" style={{ color: '#A8211B' }} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold mb-4" style={{ color: '#7B1E12' }}>
                Basic Information
              </h3>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Tower Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                style={{ focusRing: '#A8211B' }}
                placeholder="Diamond Tower A"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Tower Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="towerNumber"
                value={formData.towerNumber}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                placeholder="T1"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">
                Property <span className="text-red-500">*</span>
              </label>
              <select
                name="propertyId"
                value={formData.propertyId}
                onChange={handleChange}
                required
                disabled={!!tower}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 disabled:bg-gray-100"
              >
                <option value="">Select Property</option>
                {properties.map((property) => (
                  <option key={property.id} value={property.id}>
                    {property.name} - {property.city}
                  </option>
                ))}
              </select>
              {tower && (
                <p className="text-sm text-gray-500 mt-1">
                  Property cannot be changed after tower creation
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                placeholder="Premium residential tower with 2BHK and 3BHK apartments"
              />
            </div>

            {/* Tower Specifications */}
            <div className="md:col-span-2 mt-4">
              <h3 className="text-lg font-semibold mb-4" style={{ color: '#7B1E12' }}>
                Tower Specifications
              </h3>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Total Floors <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="totalFloors"
                value={formData.totalFloors}
                onChange={handleChange}
                required
                min="1"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Total Units <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="totalUnits"
                value={formData.totalUnits}
                onChange={handleChange}
                required
                min="1"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Basement Levels</label>
              <input
                type="number"
                name="basementLevels"
                value={formData.basementLevels}
                onChange={handleChange}
                min="0"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Number of Lifts <span className="text-red-500">*</span></label>
              <input
                type="number"
                name="numberOfLifts"
                value={formData.numberOfLifts}
                onChange={handleChange}
                required
                min="0"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Units Per Floor</label>
              <input
                type="text"
                name="unitsPerFloor"
                value={formData.unitsPerFloor}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                placeholder="4 units per floor (2BHK + 3BHK)"
              />
            </div>

            {/* Construction Details */}
            <div className="md:col-span-2 mt-4">
              <h3 className="text-lg font-semibold mb-4" style={{ color: '#7B1E12' }}>
                Construction Details
              </h3>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Construction Status</label>
              <select
                name="constructionStatus"
                value={formData.constructionStatus}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
              >
                <option value="PLANNED">Planned</option>
                <option value="UNDER_CONSTRUCTION">Under Construction</option>
                <option value="COMPLETED">Completed</option>
                <option value="READY_TO_MOVE">Ready to Move</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">RERA Number</label>
              <input
                type="text"
                name="reraNumber"
                value={formData.reraNumber}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                placeholder="RERA/OR/2024/12345"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Construction Start Date</label>
              <input
                type="date"
                name="constructionStartDate"
                value={formData.constructionStartDate}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Completion Date</label>
              <input
                type="date"
                name="completionDate"
                value={formData.completionDate}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
              />
            </div>

            {/* Additional Details */}
            <div className="md:col-span-2 mt-4">
              <h3 className="text-lg font-semibold mb-4" style={{ color: '#7B1E12' }}>
                Additional Details
              </h3>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Built-up Area (sq.ft)</label>
              <input
                type="number"
                name="builtUpArea"
                value={formData.builtUpArea || ''}
                onChange={handleChange}
                min="0"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Carpet Area (sq.ft)</label>
              <input
                type="number"
                name="carpetArea"
                value={formData.carpetArea || ''}
                onChange={handleChange}
                min="0"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Ceiling Height (ft)</label>
              <input
                type="number"
                name="ceilingHeight"
                value={formData.ceilingHeight || ''}
                onChange={handleChange}
                min="0"
                step="0.1"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Facing Direction</label>
              <select
                name="facing"
                value={formData.facing}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
              >
                <option value="">Select Direction</option>
                <option value="North">North</option>
                <option value="South">South</option>
                <option value="East">East</option>
                <option value="West">West</option>
                <option value="North-East">North-East</option>
                <option value="North-West">North-West</option>
                <option value="South-East">South-East</option>
                <option value="South-West">South-West</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Display Order</label>
              <input
                type="number"
                name="displayOrder"
                value={formData.displayOrder}
                onChange={handleChange}
                min="1"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="vastuCompliant"
                checked={formData.vastuCompliant}
                onChange={handleChange}
                className="w-5 h-5 rounded"
                style={{ accentColor: '#A8211B' }}
              />
              <label className="text-sm font-medium">Vastu Compliant</label>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Special Features</label>
              <textarea
                name="specialFeatures"
                value={formData.specialFeatures}
                onChange={handleChange}
                rows={2}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                placeholder="Premium corner units with city views"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 mt-8 pt-6 border-t">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-6 py-3 border rounded-lg font-medium transition-colors"
              style={{ borderColor: '#A8211B', color: '#A8211B' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
              style={{ backgroundColor: '#A8211B', color: 'white' }}
            >
              {loading ? 'Saving...' : tower ? 'Update Tower' : 'Create Tower'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
