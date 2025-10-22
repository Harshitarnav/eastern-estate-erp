'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/services/api';
import { ChevronDown, ChevronRight, Building2, Home, Package, ClipboardList } from 'lucide-react';
import MaterialEntryModal from '@/components/modals/MaterialEntryModal';
import MaterialExitModal from '@/components/modals/MaterialExitModal';

interface Flat {
  id: string;
  flatNumber: string;
  tower: any;
  status: string;
  bhkType: string;
}

interface Tower {
  id: string;
  name: string;
  towerNumber: string;
  property: any;
  flats?: Flat[];
}

interface Property {
  id: string;
  name: string;
  propertyCode: string;
  location: string;
  towers?: Tower[];
}

export default function ConstructionInventoryPage() {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [towers, setTowers] = useState<Tower[]>([]);
  const [flats, setFlats] = useState<Flat[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedProperties, setExpandedProperties] = useState<Set<string>>(new Set());
  const [expandedTowers, setExpandedTowers] = useState<Set<string>>(new Set());
  
  // Modal states
  const [showMaterialEntry, setShowMaterialEntry] = useState(false);
  const [showMaterialExit, setShowMaterialExit] = useState(false);
  const [selectedContext, setSelectedContext] = useState<{
    type: 'tower' | 'flat';
    id: string;
    name: string;
  } | null>(null);

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    setLoading(true);
    try {
      const [propsRes, towersRes, flatsRes] = await Promise.all([
        api.get('/properties').catch(() => ({ data: [] })),
        api.get('/towers').catch(() => ({ data: [] })),
        api.get('/flats').catch(() => ({ data: [] }))
      ]);

      const propsData = Array.isArray(propsRes.data) ? propsRes.data : (propsRes.data?.data || []);
      const towersData = Array.isArray(towersRes.data) ? towersRes.data : (towersRes.data?.data || []);
      const flatsData = Array.isArray(flatsRes.data) ? flatsRes.data : (flatsRes.data?.data || []);

      setProperties(propsData);
      setTowers(towersData);
      setFlats(flatsData);
    } catch (error) {
      console.error('Error loading inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleProperty = (propertyId: string) => {
    const newExpanded = new Set(expandedProperties);
    if (newExpanded.has(propertyId)) {
      newExpanded.delete(propertyId);
    } else {
      newExpanded.add(propertyId);
    }
    setExpandedProperties(newExpanded);
  };

  const toggleTower = (towerId: string) => {
    const newExpanded = new Set(expandedTowers);
    if (newExpanded.has(towerId)) {
      newExpanded.delete(towerId);
    } else {
      newExpanded.add(towerId);
    }
    setExpandedTowers(newExpanded);
  };

  const getTowersByProperty = (propertyId: string) => {
    return ((towers || [])).filter(t => t.property?.id === propertyId);
  };

  const getFlatsByTower = (towerId: string) => {
    return ((flats || [])).filter(f => f.tower?.id === towerId);
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">Loading Site Inventory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-14 h-14 rounded-lg flex items-center justify-center text-3xl" style={{ backgroundColor: '#A8211B' }}>
            🏗️
          </div>
          <div>
            <h1 className="text-4xl font-bold" style={{ color: '#A8211B' }}>
              Site Inventory
            </h1>
            <p className="text-sm text-gray-500">Properties, Towers & Flats - Complete Construction Hierarchy</p>
          </div>
        </div>
        <p className="text-gray-600 text-lg">
          Navigate through your property structure to log materials and track construction progress
        </p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg shadow-lg p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium">Total Properties</p>
            <Building2 className="w-6 h-6" />
          </div>
          <p className="text-3xl font-bold">{(properties || []).length}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg shadow-lg p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium">Total Towers</p>
            <Building2 className="w-6 h-6" />
          </div>
          <p className="text-3xl font-bold">{(towers || []).length}</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg shadow-lg p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium">Total Units</p>
            <Home className="w-6 h-6" />
          </div>
          <p className="text-3xl font-bold">{(flats || []).length}</p>
        </div>
      </div>

      {/* Inventory Hierarchy */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6" style={{ color: '#A8211B' }}>
          Construction Hierarchy
        </h2>

        {(properties || []).length === 0 ? (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">🏗️</p>
            <p className="text-gray-600">No properties found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {((properties || [])).map((property) => {
              const propertyTowers = getTowersByProperty(property.id);
              const isExpanded = expandedProperties.has(property.id);

              return (
                <div key={property.id} className="border-2 border-gray-200 rounded-lg overflow-hidden">
                  {/* Property Header */}
                  <div
                    className="bg-blue-50 p-4 cursor-pointer hover:bg-blue-100 transition-colors"
                    onClick={() => toggleProperty(property.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {isExpanded ? (
                          <ChevronDown className="w-5 h-5 text-blue-600" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-blue-600" />
                        )}
                        <Building2 className="w-6 h-6 text-blue-600" />
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{property.name}</h3>
                          <p className="text-sm text-gray-600">
                            {property.propertyCode} • {property.location} • {(propertyTowers || []).length} Tower(s)
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/properties/${property.id}`);
                          }}
                          className="px-3 py-1 text-xs rounded-lg text-white"
                          style={{ backgroundColor: '#A8211B' }}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Towers */}
                  {isExpanded && (
                    <div className="bg-white">
                      {(propertyTowers || []).length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                          No towers defined for this property
                        </div>
                      ) : (
                        <div className="space-y-2 p-2">
                          {((propertyTowers || [])).map((tower) => {
                            const towerFlats = getFlatsByTower(tower.id);
                            const isTowerExpanded = expandedTowers.has(tower.id);

                            return (
                              <div key={tower.id} className="border border-gray-300 rounded-lg overflow-hidden ml-8">
                                {/* Tower Header */}
                                <div
                                  className="bg-purple-50 p-3 cursor-pointer hover:bg-purple-100 transition-colors"
                                  onClick={() => toggleTower(tower.id)}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      {isTowerExpanded ? (
                                        <ChevronDown className="w-4 h-4 text-purple-600" />
                                      ) : (
                                        <ChevronRight className="w-4 h-4 text-purple-600" />
                                      )}
                                      <Building2 className="w-5 h-5 text-purple-600" />
                                      <div>
                                        <h4 className="font-bold text-gray-900">{tower.name}</h4>
                                        <p className="text-xs text-gray-600">
                                          Tower {tower.towerNumber} • {(towerFlats || []).length} Unit(s)
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex gap-2">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedContext({ type: 'tower', id: tower.id, name: tower.name });
                                          setShowMaterialEntry(true);
                                        }}
                                        className="px-3 py-1 text-xs rounded-lg bg-orange-500 text-white hover:bg-orange-600"
                                      >
                                        <Package className="w-3 h-3 inline mr-1" />
                                        Log Materials
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          router.push(`/construction/progress?tower=${tower.id}`);
                                        }}
                                        className="px-3 py-1 text-xs rounded-lg bg-green-500 text-white hover:bg-green-600"
                                      >
                                        <ClipboardList className="w-3 h-3 inline mr-1" />
                                        Log Progress
                                      </button>
                                    </div>
                                  </div>
                                </div>

                                {/* Flats */}
                                {isTowerExpanded && (
                                  <div className="bg-white p-2">
                                    {(towerFlats || []).length === 0 ? (
                                      <div className="p-3 text-center text-gray-500 text-sm">
                                        No units defined for this tower
                                      </div>
                                    ) : (
                                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                        {((towerFlats || [])).map((flat) => (
                                          <div
                                            key={flat.id}
                                            className="border border-gray-200 rounded-lg p-3 hover:border-green-500 hover:bg-green-50 transition-all"
                                          >
                                            <div className="flex items-start justify-between mb-2">
                                              <div className="flex items-center gap-2">
                                                <Home className="w-4 h-4 text-green-600" />
                                                <div>
                                                  <p className="font-bold text-sm">{flat.flatNumber}</p>
                                                  <p className="text-xs text-gray-500">{flat.bhkType}</p>
                                                </div>
                                              </div>
                                              <span className={`text-xs px-2 py-1 rounded-full ${
                                                flat.status === 'AVAILABLE' ? 'bg-green-100 text-green-800' :
                                                flat.status === 'SOLD' ? 'bg-blue-100 text-blue-800' :
                                                flat.status === 'BOOKED' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-gray-100 text-gray-800'
                                              }`}>
                                                {flat.status}
                                              </span>
                                            </div>
                                            <div className="flex gap-1 mt-2">
                                              <button
                                                onClick={() => {
                                                  setSelectedContext({ type: 'flat', id: flat.id, name: `${tower.name} - ${flat.flatNumber}` });
                                                  setShowMaterialEntry(true);
                                                }}
                                                className="flex-1 px-2 py-1 text-xs rounded bg-orange-100 text-orange-700 hover:bg-orange-200"
                                              >
                                                Materials
                                              </button>
                                              <button
                                                onClick={() => router.push(`/construction/progress?flat=${flat.id}`)}
                                                className="flex-1 px-2 py-1 text-xs rounded bg-green-100 text-green-700 hover:bg-green-200"
                                              >
                                                Progress
                                              </button>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Help Section */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mt-6">
        <h3 className="text-lg font-bold text-blue-900 mb-3">📝 How to Use Site Inventory</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-semibold text-blue-800 mb-2">Navigation:</h4>
            <ul className="list-disc list-inside text-blue-700 space-y-1">
              <li>Click on properties to expand/collapse towers</li>
              <li>Click on towers to expand/collapse flats</li>
              <li>Use "View Details" to see full property information</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-blue-800 mb-2">Actions:</h4>
            <ul className="list-disc list-inside text-blue-700 space-y-1">
              <li><strong>Log Materials:</strong> Record material usage for tower/flat</li>
              <li><strong>Log Progress:</strong> Update construction progress</li>
              <li>Track completion at tower or individual unit level</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Material Entry Modal */}
      {showMaterialEntry && selectedContext && (
        <MaterialEntryModal
          isOpen={showMaterialEntry}
          onClose={() => {
            setShowMaterialEntry(false);
            setSelectedContext(null);
            loadInventory(); // Refresh data
          }}
          onSuccess={() => {
            setShowMaterialEntry(false);
            setSelectedContext(null);
            loadInventory();
          }}
        />
      )}

      {/* Material Exit Modal */}
      {showMaterialExit && selectedContext && (
        <MaterialExitModal
          isOpen={showMaterialExit}
          onClose={() => {
            setShowMaterialExit(false);
            setSelectedContext(null);
            loadInventory();
          }}
          onSuccess={() => {
            setShowMaterialExit(false);
            setSelectedContext(null);
            loadInventory();
          }}
        />
      )}
    </div>
  );
}
