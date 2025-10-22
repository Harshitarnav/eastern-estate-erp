'use client';

import { useState, useEffect } from 'react';
import constructionService, { UpdateTimeline } from '@/services/construction.service';
import DevelopmentUpdateCard from './DevelopmentUpdateCard';

interface DevelopmentUpdateTimelineProps {
  projectId: string;
  onEdit?: (update: any) => void;
  onDelete?: (id: string) => void;
}

export default function DevelopmentUpdateTimeline({
  projectId,
  onEdit,
  onDelete,
}: DevelopmentUpdateTimelineProps) {
  const [timeline, setTimeline] = useState<UpdateTimeline[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchTimeline = async () => {
      try {
        setLoading(true);
        const data = await constructionService.getUpdatesTimeline(projectId);
        setTimeline(data);
      } catch (error) {
        console.error('Error fetching timeline:', error);
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchTimeline();
    }
  }, [projectId]);

  const handleDelete = async (id: string) => {
    if (onDelete) {
      onDelete(id);
    } else {
      try {
        await constructionService.deleteDevelopmentUpdate(id);
        // Refresh timeline
        const data = await constructionService.getUpdatesTimeline(projectId);
        setTimeline(data);
      } catch (error) {
        console.error('Error deleting update:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (timeline.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <p className="mt-2 text-gray-500">No development updates yet</p>
        <p className="text-sm text-gray-400">Start by creating your first update</p>
      </div>
    );
  }

  return (
    <>
      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>

        {/* Timeline Items */}
        <div className="space-y-8">
          {timeline.map((monthGroup, groupIndex) => (
            <div key={groupIndex} className="relative">
              {/* Month Header */}
              <div className="flex items-center mb-6">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 border-4 border-white shadow-md z-10">
                  <svg
                    className="w-8 h-8 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-bold text-gray-900">{monthGroup.month}</h3>
                  <p className="text-sm text-gray-500">{monthGroup.count} updates</p>
                </div>
              </div>

              {/* Updates for this month */}
              <div className="ml-24 space-y-6">
                {monthGroup.updates.map((update) => (
                  <div key={update.id} className="relative">
                    {/* Timeline Dot */}
                    <div className="absolute -left-[4.5rem] top-6 w-4 h-4 rounded-full bg-blue-500 border-4 border-white shadow"></div>
                    
                    {/* Update Card */}
                    <DevelopmentUpdateCard
                      update={update}
                      onEdit={onEdit}
                      onDelete={handleDelete}
                      onImageClick={(imageUrl) => setSelectedImage(imageUrl)}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Image Modal/Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-7xl max-h-full">
            <button
              className="absolute top-4 right-4 text-white hover:text-gray-300"
              onClick={() => setSelectedImage(null)}
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <img
              src={selectedImage}
              alt="Full size"
              className="max-w-full max-h-[90vh] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </>
  );
}
