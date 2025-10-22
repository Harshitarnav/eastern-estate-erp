'use client';

import { useEffect, useState } from 'react';

export default function ConstructionTeamsPage() {
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/v1/construction-teams');
      const data = await response.json();
      setTeams(data.data || []);
    } catch (error) {
      console.error('Failed to load teams:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold" style={{ color: '#A8211B' }}>👥 Construction Teams</h1>
        <p className="text-gray-600">Manage construction team members and assignments</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h2 className="text-lg font-bold">Team Members</h2>
        </div>
        <div className="p-4">
          {loading ? (
            <p className="text-center py-8">Loading teams...</p>
          ) : teams.length === 0 ? (
            <p className="text-center py-8 text-gray-500">No team members found</p>
          ) : (
            <div className="space-y-3">
              {teams.map((team) => (
                <div key={team.id} className="flex justify-between items-center border rounded p-3">
                  <div>
                    <div className="font-medium">{team.employeeName || 'Team Member'}</div>
                    <div className="text-sm text-gray-600">{team.role}</div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {team.isActive ? '✅ Active' : '⏸️ Inactive'}
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
