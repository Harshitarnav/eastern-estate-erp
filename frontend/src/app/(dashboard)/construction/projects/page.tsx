'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ConstructionProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/v1/construction-projects');
      const data = await response.json();
      setProjects(data.data || []);
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold" style={{ color: '#A8211B' }}>📊 Construction Projects</h1>
        <p className="text-gray-600">Manage all construction projects</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b flex justify-between">
          <h2 className="text-lg font-bold">All Projects</h2>
          <button
            onClick={() => router.push('/construction/projects/new')}
            className="px-4 py-2 text-white rounded"
            style={{ backgroundColor: '#A8211B' }}
          >
            + New Project
          </button>
        </div>
        <div className="p-4">
          {loading ? (
            <p className="text-center py-8">Loading projects...</p>
          ) : projects.length === 0 ? (
            <p className="text-center py-8 text-gray-500">No projects found. Create your first project!</p>
          ) : (
            <div className="space-y-4">
              {projects.map((project) => (
                <div key={project.id} className="border rounded p-4 hover:bg-gray-50">
                  <h3 className="font-bold text-lg">{project.projectName}</h3>
                  <p className="text-sm text-gray-600">{project.projectCode}</p>
                  <div className="mt-2">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                      {project.status || 'Active'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
