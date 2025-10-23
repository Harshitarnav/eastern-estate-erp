'use client';

import { useState } from 'react';
import Modal from './Modal';

interface DuplicateLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingLead: {
    id: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    status: string;
    source: string;
    assignedTo?: string;
    createdAt: string;
  };
  onViewLead: (leadId: string) => void;
  onContinueAnyway: () => void;
}

export default function DuplicateLeadModal({
  isOpen,
  onClose,
  existingLead,
  onViewLead,
  onContinueAnyway,
}: DuplicateLeadModalProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      NEW: 'bg-blue-100 text-blue-800',
      CONTACTED: 'bg-purple-100 text-purple-800',
      QUALIFIED: 'bg-green-100 text-green-800',
      NEGOTIATION: 'bg-yellow-100 text-yellow-800',
      WON: 'bg-emerald-100 text-emerald-800',
      LOST: 'bg-red-100 text-red-800',
      ON_HOLD: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Duplicate Lead Detected"
      size="md"
    >
      <div className="space-y-4">
        {/* Warning Message */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                A lead with similar contact information already exists in the system.
              </p>
            </div>
          </div>
        </div>

        {/* Existing Lead Details */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
          <h4 className="font-semibold text-gray-900">Existing Lead Details:</h4>
          
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-500">Name:</span>
              <p className="font-medium text-gray-900">{existingLead.fullName}</p>
            </div>
            
            <div>
              <span className="text-gray-500">Status:</span>
              <p>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(existingLead.status)}`}>
                  {existingLead.status}
                </span>
              </p>
            </div>
            
            <div>
              <span className="text-gray-500">Email:</span>
              <p className="font-medium text-gray-900">{existingLead.email}</p>
            </div>
            
            <div>
              <span className="text-gray-500">Phone:</span>
              <p className="font-medium text-gray-900">{existingLead.phoneNumber}</p>
            </div>
            
            <div>
              <span className="text-gray-500">Source:</span>
              <p className="font-medium text-gray-900">{existingLead.source}</p>
            </div>
            
            <div>
              <span className="text-gray-500">Created:</span>
              <p className="font-medium text-gray-900">{formatDate(existingLead.createdAt)}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => onViewLead(existingLead.id)}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            View Full Lead
          </button>
          
          <button
            onClick={onContinueAnyway}
            className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium"
          >
            Continue Anyway
          </button>
          
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
}
