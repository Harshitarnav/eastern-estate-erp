'use client';

import React, { useState } from 'react';
import { Phone, Plus, Search, X } from 'lucide-react';

interface FABAction {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  color: string;
}

interface FloatingActionButtonProps {
  actions?: FABAction[];
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
}

export default function FloatingActionButton({
  actions,
  position = 'bottom-right',
}: FloatingActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const defaultActions: FABAction[] = [
    {
      icon: <Phone className="w-5 h-5" />,
      label: 'Quick Call',
      onClick: () => console.log('Quick call'),
      color: 'bg-green-500 hover:bg-green-600',
    },
    {
      icon: <Plus className="w-5 h-5" />,
      label: 'Add Lead',
      onClick: () => {
        window.location.href = '/leads/new';
      },
      color: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      icon: <Search className="w-5 h-5" />,
      label: 'Search',
      onClick: () => console.log('Search'),
      color: 'bg-purple-500 hover:bg-purple-600',
    },
  ];

  const finalActions = actions || defaultActions;

  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'bottom-center': 'bottom-6 left-1/2 -translate-x-1/2',
  };

  return (
    <div className={`fixed ${positionClasses[position]} z-50`}>
      {/* Action Buttons */}
      <div className="flex flex-col-reverse items-center gap-3 mb-3">
        {isOpen &&
          finalActions.map((action, index) => (
            <div
              key={index}
              className="flex items-center gap-3 animate-in slide-in-from-bottom duration-200"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Label */}
              <div className="bg-gray-900 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap shadow-lg">
                {action.label}
              </div>

              {/* Action Button */}
              <button
                onClick={() => {
                  action.onClick();
                  setIsOpen(false);
                }}
                className={`${action.color} text-white w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all transform hover:scale-110 active:scale-95`}
                aria-label={action.label}
              >
                {action.icon}
              </button>
            </div>
          ))}
      </div>

      {/* Main FAB Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all transform ${
          isOpen
            ? 'bg-red-500 hover:bg-red-600 rotate-45'
            : 'bg-indigo-600 hover:bg-indigo-700'
        } text-white hover:scale-110 active:scale-95`}
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-20 -z-10"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}

// Mobile-optimized variant with larger touch targets
export function MobileFAB({
  actions,
  position = 'bottom-right',
}: FloatingActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const mobileActions: FABAction[] = actions || [
    {
      icon: <Phone className="w-6 h-6" />,
      label: 'Quick Call',
      onClick: () => {
        const phoneNumber = prompt('Enter phone number:');
        if (phoneNumber) {
          window.location.href = `tel:${phoneNumber}`;
        }
      },
      color: 'bg-green-500',
    },
    {
      icon: <Plus className="w-6 h-6" />,
      label: 'Add Lead',
      onClick: () => {
        window.location.href = '/leads/new';
      },
      color: 'bg-blue-500',
    },
    {
      icon: <Search className="w-6 h-6" />,
      label: 'Search Leads',
      onClick: () => {
        const searchTerm = prompt('Search for:');
        if (searchTerm) {
          window.location.href = `/leads?search=${encodeURIComponent(searchTerm)}`;
        }
      },
      color: 'bg-purple-500',
    },
  ];

  return (
    <>
      {/* Show only on mobile */}
      <div className="md:hidden">
        <FloatingActionButton actions={mobileActions} position={position} />
      </div>
    </>
  );
}
