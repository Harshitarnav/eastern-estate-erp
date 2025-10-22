'use client';

import { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function Modal({ isOpen, onClose, title, children, size = 'md', footer }: ModalProps & { footer?: ReactNode }) {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className={`relative bg-white rounded-lg shadow-xl ${sizeClasses[size]} w-full max-h-[90vh] overflow-y-auto`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
            <h2 className="text-xl font-bold" style={{ color: '#A8211B' }}>
              {title}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              ×
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-4">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="sticky bottom-0 bg-white border-t px-6 py-4">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function DeleteConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  loading = false,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName?: string;
  loading?: boolean;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="relative bg-white rounded-lg shadow-xl max-w-md w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete {itemName ? `"${itemName}"` : 'this item'}? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={loading}
                className="px-4 py-2 rounded-lg text-white disabled:opacity-50"
                style={{ backgroundColor: '#A8211B' }}
              >
                {loading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AlertDialog({
  isOpen,
  onClose,
  title,
  description,
  type = 'info',
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  type?: 'success' | 'error' | 'warning' | 'info';
}) {
  if (!isOpen) return null;

  const typeStyles = {
    success: { bg: 'bg-green-50', text: 'text-green-800', icon: '✓' },
    error: { bg: 'bg-red-50', text: 'text-red-800', icon: '✕' },
    warning: { bg: 'bg-yellow-50', text: 'text-yellow-800', icon: '⚠' },
    info: { bg: 'bg-blue-50', text: 'text-blue-800', icon: 'ℹ' },
  };

  const style = typeStyles[type];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="relative bg-white rounded-lg shadow-xl max-w-md w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <div className={`w-12 h-12 rounded-full ${style.bg} flex items-center justify-center mb-4`}>
              <span className={`text-2xl ${style.text}`}>{style.icon}</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-600 mb-6">{description}</p>
            <button
              onClick={onClose}
              className="w-full px-4 py-2 rounded-lg text-white"
              style={{ backgroundColor: '#A8211B' }}
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export { Modal };
