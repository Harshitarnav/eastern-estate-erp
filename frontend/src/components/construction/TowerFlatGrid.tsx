'use client';

import { useState, useEffect } from 'react';
import constructionService, { FlatProgress } from '@/services/construction.service';

interface TowerFlatGridProps {
  projectId: string;
  towerId: string;
  onFlatClick?: (flatId: string, flat: FlatProgress) => void;
}

const getProgressColor = (progress: number): string => {
  if (progress >= 75) return 'bg-green-500';
  if (progress >= 50) return 'bg-blue-500';
  if (progress >= 25) return 'bg-yellow-500';
  return 'bg-red-500';
};

const getProgressTextColor = (progress: number): string => {
  if (progress >= 75) return 'text-green-700';
  if (progress >= 50) return 'text-blue-700';
  if (progress >= 25) return 'text-yellow-700';
  return 'text-red-700';
};

export default function TowerFlatGrid({ projectId, towerId, onFlatClick }: TowerFlatGridProps) {
  const [flatsProgress, setFlatsProgress] = useState<FlatProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFlatsProgress = async () => {
      try {
        setLoading(true);
        const data = await constructionService.getFlatProgressByTower(projectId, towerId);
        setFlatsProgress(data);
      } catch (error) {
        console.error('Error fetching flats progress:', error);
      } finally {
        setLoading(false);
      }
    };

    if (projectId && towerId) {
      fetchFlatsProgress();
    }
  }, [projectId, towerId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (flatsProgress.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No flats found for this tower</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Flats Progress</h3>
        <span className="text-sm text-gray-500">{flatsProgress.length} flats</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {flatsProgress.map((flat) => {
          const progress = flat.overallProgress || 0;
          const flatNumber = flat.flat?.flatNumber || 'N/A';
          
          return (
            <div
              key={flat.id}
              className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-lg ${
                onFlatClick ? 'hover:scale-105' : ''
              }`}
              style={{ borderColor: getProgressColor(progress).replace('bg-', '#').replace('500', '500') }}
              onClick={() => onFlatClick?.(flat.flatId, flat)}
            >
              {/* Flat Number */}
              <div className="text-center mb-2">
                <span className="text-lg font-bold text-gray-900">{flatNumber}</span>
              </div>

              {/* Progress Circle */}
              <div className="flex items-center justify-center mb-2">
                <div className="relative w-16 h-16">
                  <svg className="w-16 h-16 transform -rotate-90">
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                      className="text-gray-200"
                    />
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 28}`}
                      strokeDashoffset={`${2 * Math.PI * 28 * (1 - progress / 100)}`}
                      className={getProgressColor(progress).replace('bg-', 'text-')}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-sm font-bold ${getProgressTextColor(progress)}`}>
                      {progress.toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div className="text-center">
                <span
                  className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                    flat.status === 'COMPLETED'
                      ? 'bg-green-100 text-green-800'
                      : flat.status === 'IN_PROGRESS'
                      ? 'bg-blue-100 text-blue-800'
                      : flat.status === 'ON_HOLD'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {flat.status?.replace('_', ' ') || 'N/A'}
                </span>
              </div>

              {/* Phase Indicator */}
              <div className="mt-2 text-center">
                <span className="text-xs text-gray-500">{flat.phase || 'Not Started'}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center space-x-6 mt-6 text-xs">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span>0-25%</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <span>25-50%</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span>50-75%</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span>75-100%</span>
        </div>
      </div>
    </div>
  );
}
