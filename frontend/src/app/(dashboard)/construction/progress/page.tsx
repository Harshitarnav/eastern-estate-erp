'use client';

import { useEffect, useState } from 'react';

export default function ConstructionProgressPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgressLogs();
  }, []);

  const loadProgressLogs = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/v1/construction-progress-logs');
      const data = await response.json();
      setLogs(data.data || []);
    } catch (error) {
      console.error('Failed to load progress logs:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold" style={{ color: '#A8211B' }}>📝 Progress Tracking</h1>
        <p className="text-gray-600">Daily construction progress logs and updates</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h2 className="text-lg font-bold">Progress Logs</h2>
        </div>
        <div className="p-4">
          {loading ? (
            <p className="text-center py-8">Loading progress logs...</p>
          ) : logs.length === 0 ? (
            <p className="text-center py-8 text-gray-500">No progress logs found</p>
          ) : (
            <div className="space-y-4">
              {logs.map((log) => (
                <div key={log.id} className="border rounded p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-medium text-lg">{log.workDescription}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(log.logDate).toLocaleDateString()}
                    </div>
                  </div>
                  {log.overallProgress && (
                    <div className="mt-2">
                      <div className="text-sm text-gray-600 mb-1">Overall Progress</div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full"
                          style={{
                            width: `${log.overallProgress}%`,
                            backgroundColor: '#3DA35D'
                          }}
                        />
                      </div>
                      <div className="text-right text-sm font-medium mt-1" style={{ color: '#3DA35D' }}>
                        {log.overallProgress}%
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
