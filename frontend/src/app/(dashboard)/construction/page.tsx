'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import constructionService from '@/services/construction.service';
import purchaseOrdersService from '@/services/purchase-orders.service';
import { propertiesService } from '@/services/properties.service';

export default function ConstructionOverviewPage() {
  const router = useRouter();
  const [properties, setProperties] = useState<any[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<string>('');
  const [projects, setProjects] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [progressLogs, setProgressLogs] = useState<any[]>([]);
  const [pos, setPOs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Load properties on mount
  useEffect(() => {
    loadProperties();
  }, []);

  // Load data when property is selected
  useEffect(() => {
    if (selectedProperty) {
      loadPropertyData();
    }
  }, [selectedProperty]);

  const loadProperties = async () => {
    try {
      const response = await propertiesService.getProperties({ limit: 100 });
      setProperties(response.data || []);
    } catch (error) {
      console.error('Failed to load properties:', error);
      setProperties([]);
    }
  };

  const loadPropertyData = async () => {
    try {
      setLoading(true);
      
      // Load construction projects for this property
      const projectsRes = await constructionService.getAllProjects({ 
        propertyId: selectedProperty 
      });
      setProjects(projectsRes.data || []);

      // Load POs for this property
      const posRes = await purchaseOrdersService.getAll({ 
        propertyId: selectedProperty,
        limit: 5
      });
      setPOs(posRes.data?.data || []);

      // If we have projects, load teams and progress
      if (projectsRes.data?.length > 0) {
        // Load teams and progress for first project (or all)
        // You can enhance this to show all projects
      }
    } catch (error) {
      console.error('Failed to load property data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">🏗️ Construction Overview</h1>
        <p className="text-gray-600">Select a property to view all construction activities, progress, teams, and materials</p>
      </div>

      {/* Property Selector */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Property
        </label>
        <select
          value={selectedProperty}
          onChange={(e) => setSelectedProperty(e.target.value)}
          className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">-- Choose a property --</option>
          {properties.map((prop) => (
            <option key={prop.id} value={prop.id}>
              {prop.name}
            </option>
          ))}
        </select>
      </div>

      {/* Show data only when property is selected */}
      {selectedProperty && (
        loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading construction data...</p>
          </div>
        ) : (
          <>
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm text-gray-600 mb-1">Active Projects</div>
                <div className="text-3xl font-bold text-blue-600">{projects.length}</div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm text-gray-600 mb-1">Team Members</div>
                <div className="text-3xl font-bold text-green-600">{teams.length}</div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm text-gray-600 mb-1">Recent Progress Logs</div>
                <div className="text-3xl font-bold text-purple-600">{progressLogs.length}</div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm text-gray-600 mb-1">Purchase Orders</div>
                <div className="text-3xl font-bold text-orange-600">{pos.length}</div>
              </div>
            </div>

            {/* Construction Projects */}
            <div className="bg-white rounded-lg shadow mb-6">
              <div className="p-4 border-b flex justify-between items-center">
                <h2 className="text-lg font-bold">📊 Construction Projects</h2>
                <button
                  onClick={() => router.push('/construction/projects/new')}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  + Add Project
                </button>
              </div>
              <div className="p-4">
                {projects.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No projects found for this property</p>
                ) : (
                  <div className="space-y-4">
                    {projects.map((project) => (
                      <div key={project.id} className="border rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-bold text-lg">{project.projectName}</h3>
                            <p className="text-sm text-gray-600">{project.projectCode}</p>
                          </div>
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                            {project.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Start:</span>
                            <p className="font-medium">{new Date(project.startDate).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Expected End:</span>
                            <p className="font-medium">{new Date(project.estimatedEndDate).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Progress:</span>
                            <p className="font-bold text-blue-600">{project.progress}%</p>
                          </div>
                        </div>
                        <button
                          onClick={() => router.push(`/construction/projects/${project.id}`)}
                          className="mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          View Details →
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <button
                onClick={() => router.push('/construction/projects')}
                className="bg-white rounded-lg shadow p-4 hover:bg-blue-50 text-left"
              >
                <div className="text-2xl mb-2">📊</div>
                <div className="font-medium">View All Projects</div>
              </button>
              <button
                onClick={() => router.push('/construction/teams')}
                className="bg-white rounded-lg shadow p-4 hover:bg-green-50 text-left"
              >
                <div className="text-2xl mb-2">👥</div>
                <div className="font-medium">Manage Teams</div>
              </button>
              <button
                onClick={() => router.push('/construction/progress')}
                className="bg-white rounded-lg shadow p-4 hover:bg-purple-50 text-left"
              >
                <div className="text-2xl mb-2">📝</div>
                <div className="font-medium">Log Progress</div>
              </button>
              <button
                onClick={() => router.push('/construction/purchase-orders')}
                className="bg-white rounded-lg shadow p-4 hover:bg-orange-50 text-left"
              >
                <div className="text-2xl mb-2">📋</div>
                <div className="font-medium">Purchase Orders</div>
              </button>
              <button
                onClick={() => router.push('/construction/materials')}
                className="bg-white rounded-lg shadow p-4 hover:bg-yellow-50 text-left"
              >
                <div className="text-2xl mb-2">📦</div>
                <div className="font-medium">Materials Inventory</div>
              </button>
              <button
                onClick={() => router.push('/construction/vendors')}
                className="bg-white rounded-lg shadow p-4 hover:bg-red-50 text-left"
              >
                <div className="text-2xl mb-2">🏪</div>
                <div className="font-medium">Vendors</div>
              </button>
            </div>

            {/* Recent Purchase Orders */}
            {pos.length > 0 && (
              <div className="bg-white rounded-lg shadow">
                <div className="p-4 border-b">
                  <h2 className="text-lg font-bold">📋 Recent Purchase Orders</h2>
                </div>
                <div className="p-4">
                  <div className="space-y-2">
                    {pos.map((po) => (
                      <div key={po.id} className="flex justify-between items-center p-3 border rounded hover:bg-gray-50">
                        <div>
                          <div className="font-medium">{po.poNumber}</div>
                          <div className="text-sm text-gray-600">{po.vendorName}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">₹{po.totalAmount.toLocaleString()}</div>
                          <div className="text-sm text-gray-600">{po.status}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )
      )}

      {/* No Property Selected State */}
      {!selectedProperty && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-6xl mb-4">🏗️</div>
          <h3 className="text-xl font-bold mb-2">Select a Property</h3>
          <p className="text-gray-600">
            Choose a property above to view all construction activities, teams, progress updates, and purchase orders
          </p>
        </div>
      )}
    </div>
  );
}
