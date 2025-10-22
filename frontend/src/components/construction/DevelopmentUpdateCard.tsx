'use client';

import { DevelopmentUpdate } from '@/services/construction.service';
import { useState } from 'react';

interface DevelopmentUpdateCardProps {
  update: DevelopmentUpdate;
  onEdit?: (update: DevelopmentUpdate) => void;
  onDelete?: (id: string) => void;
  onImageClick?: (imageUrl: string) => void;
}

export default function DevelopmentUpdateCard({
  update,
  onEdit,
  onDelete,
  onImageClick,
}: DevelopmentUpdateCardProps) {
  const [showFullDescription, setShowFullDescription] = useState(false);
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getVisibilityBadge = (visibility: string) => {
    const styles = {
      ALL: 'bg-green-100 text-green-800',
      INTERNAL: 'bg-blue-100 text-blue-800',
      MANAGEMENT_ONLY: 'bg-purple-100 text-purple-800',
    };
    return styles[visibility as keyof typeof styles] || styles.ALL;
  };

  const descriptionPreview = update.updateDescription.length > 150
    ? update.updateDescription.substring(0, 150) + '...'
    : update.updateDescription;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="text-lg font-semibold text-gray-900">{update.updateTitle}</h3>
            <span className={`text-xs px-2 py-1 rounded-full ${getVisibilityBadge(update.visibility)}`}>
              {update.visibility.replace('_', ' ')}
            </span>
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span>{formatDate(update.updateDate)}</span>
            {update.creator && (
              <span>• By {update.creator.name || 'Unknown'}</span>
            )}
          </div>
        </div>

        {/* Actions */}
        {(onEdit || onDelete) && (
          <div className="flex items-center space-x-2">
            {onEdit && (
              <button
                onClick={() => onEdit(update)}
                className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                title="Edit"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(update.id)}
                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                title="Delete"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Description */}
      <div className="mb-4">
        <p className="text-gray-700 whitespace-pre-wrap">
          {showFullDescription ? update.updateDescription : descriptionPreview}
        </p>
        {update.updateDescription.length > 150 && (
          <button
            onClick={() => setShowFullDescription(!showFullDescription)}
            className="text-blue-600 hover:text-blue-700 text-sm mt-1 font-medium"
          >
            {showFullDescription ? 'Show less' : 'Show more'}
          </button>
        )}
      </div>

      {/* Feedback Notes */}
      {update.feedbackNotes && (
        <div className="mb-4 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
          <p className="text-sm font-medium text-yellow-800 mb-1">Feedback:</p>
          <p className="text-sm text-yellow-700">{update.feedbackNotes}</p>
        </div>
      )}

      {/* Images */}
      {update.images && update.images.length > 0 && (
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">
            Images ({update.images.length})
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {update.images.map((imageUrl, index) => (
              <div
                key={index}
                className="relative aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => onImageClick?.(imageUrl)}
              >
                <img
                  src={imageUrl}
                  alt={`Update image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Attachments */}
      {update.attachments && update.attachments.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">
            Attachments ({update.attachments.length})
          </p>
          <div className="space-y-1">
            {update.attachments.map((attachmentUrl, index) => (
              <a
                key={index}
                href={attachmentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
                <span>Attachment {index + 1}</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
