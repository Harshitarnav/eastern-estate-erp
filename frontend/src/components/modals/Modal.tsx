// Modal.tsx - Reusable Modal/Dialog Component for Eastern Estate ERP
// Save as: frontend/src/components/modals/Modal.tsx

import React, { useEffect, useRef } from 'react';
import { X, AlertCircle, CheckCircle, Info, AlertTriangle, Trash2 } from 'lucide-react';

// Types
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  footer?: React.ReactNode;
  className?: string;
}

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'danger' | 'warning' | 'success' | 'info';
  loading?: boolean;
}

export interface AlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  closeLabel?: string;
}

// Base Modal Component
export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  footer,
  className = '',
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle ESC key
  useEffect(() => {
    if (!closeOnEscape || !isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Focus trap
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;

    const focusableElements = modalRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement?.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement?.focus();
          e.preventDefault();
        }
      }
    };

    document.addEventListener('keydown', handleTab);
    firstElement?.focus();

    return () => document.removeEventListener('keydown', handleTab);
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-7xl',
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={closeOnOverlayClick ? onClose : undefined}
      />

      {/* Modal Container */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          ref={modalRef}
          className={`relative bg-white rounded-lg shadow-xl transform transition-all w-full ${sizeClasses[size]} ${className}`}
        >
          {/* Header */}
          {(title || description || showCloseButton) && (
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {title && (
                    <h3 id="modal-title" className="text-xl font-semibold text-gray-900">
                      {title}
                    </h3>
                  )}
                  {description && (
                    <p className="mt-1 text-sm text-gray-600">{description}</p>
                  )}
                </div>
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className="ml-4 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Close modal"
                  >
                    <X className="w-6 h-6" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Body */}
          <div className="px-6 py-4">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Confirm Dialog Component
export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  loading = false,
}: ConfirmDialogProps) {
  const handleConfirm = async () => {
    await onConfirm();
    if (!loading) onClose();
  };

  const variantStyles = {
    default: {
      icon: <Info className="w-6 h-6 text-blue-600" />,
      bgColor: 'bg-blue-50',
      buttonColor: 'bg-blue-600 hover:bg-blue-700',
    },
    danger: {
      icon: <AlertCircle className="w-6 h-6 text-red-600" />,
      bgColor: 'bg-red-50',
      buttonColor: 'bg-red-600 hover:bg-red-700',
    },
    warning: {
      icon: <AlertTriangle className="w-6 h-6 text-yellow-600" />,
      bgColor: 'bg-yellow-50',
      buttonColor: 'bg-yellow-600 hover:bg-yellow-700',
    },
    success: {
      icon: <CheckCircle className="w-6 h-6 text-green-600" />,
      bgColor: 'bg-green-50',
      buttonColor: 'bg-green-600 hover:bg-green-700',
    },
    info: {
      icon: <Info className="w-6 h-6 text-blue-600" />,
      bgColor: 'bg-blue-50',
      buttonColor: 'bg-blue-600 hover:bg-blue-700',
    },
  };

  const style = variantStyles[variant];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      showCloseButton={false}
    >
      <div className="text-center">
        <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full ${style.bgColor} mb-4`}>
          {style.icon}
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        {description && <p className="text-sm text-gray-600 mb-6">{description}</p>}

        <div className="flex gap-3 justify-center">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className={`px-6 py-2 text-white rounded-lg transition-colors disabled:opacity-50 ${style.buttonColor}`}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Processing...
              </div>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// Delete Confirmation Dialog
export function DeleteConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  itemName,
  loading = false,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title?: string;
  description?: string;
  itemName?: string;
  loading?: boolean;
}) {
  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title={title || 'Delete Confirmation'}
      description={
        description || 
        (itemName 
          ? `Are you sure you want to delete "${itemName}"? This action cannot be undone.`
          : 'Are you sure you want to delete this item? This action cannot be undone.'
        )
      }
      confirmLabel="Delete"
      cancelLabel="Cancel"
      variant="danger"
      loading={loading}
    />
  );
}

// Alert Dialog Component
export function AlertDialog({
  isOpen,
  onClose,
  title,
  description,
  type = 'info',
  closeLabel = 'OK',
}: AlertDialogProps) {
  const typeStyles = {
    success: {
      icon: <CheckCircle className="w-6 h-6 text-green-600" />,
      bgColor: 'bg-green-50',
    },
    error: {
      icon: <AlertCircle className="w-6 h-6 text-red-600" />,
      bgColor: 'bg-red-50',
    },
    warning: {
      icon: <AlertTriangle className="w-6 h-6 text-yellow-600" />,
      bgColor: 'bg-yellow-50',
    },
    info: {
      icon: <Info className="w-6 h-6 text-blue-600" />,
      bgColor: 'bg-blue-50',
    },
  };

  const style = typeStyles[type];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      showCloseButton={false}
    >
      <div className="text-center">
        <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full ${style.bgColor} mb-4`}>
          {style.icon}
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        {description && <p className="text-sm text-gray-600 mb-6">{description}</p>}

        <button
          onClick={onClose}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {closeLabel}
        </button>
      </div>
    </Modal>
  );
}

export default Modal;