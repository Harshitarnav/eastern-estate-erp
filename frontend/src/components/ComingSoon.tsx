'use client';

import Link from 'next/link';
import { LucideIcon, Building2 } from 'lucide-react';

interface ComingSoonProps {
  title: string;
  description: string;
  features?: string[];
  icon: LucideIcon;
}

export function ComingSoon({ title, description, features, icon: Icon }: ComingSoonProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: '#F9FAFB' }}>
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
          <div className="flex justify-center mb-6">
            <div className="p-6 rounded-full" style={{ backgroundColor: '#FEF3E2' }}>
              <Icon className="h-16 w-16" style={{ color: '#A8211B' }} />
            </div>
          </div>
          
          <h1 className="text-4xl font-bold mb-4" style={{ color: '#7B1E12' }}>
            {title}
          </h1>
          
          <p className="text-xl text-gray-600 mb-8">
            Coming Soon
          </p>
          
          <div className="mb-8 p-6 rounded-lg" style={{ backgroundColor: '#FEF3E2' }}>
            <p className="text-gray-700 mb-4">
              {description}
            </p>
            {features && features.length > 0 && (
              <div className="text-sm text-gray-600 space-y-2">
                {features.map((feature, index) => (
                  <p key={index}>✅ {feature}</p>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/dashboard"
              className="px-6 py-3 rounded-lg font-medium transition-colors"
              style={{ backgroundColor: '#A8211B', color: 'white' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#7B1E12'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#A8211B'}
            >
              Back to Dashboard
            </Link>
            <Link
              href="/dashboard/properties"
              className="px-6 py-3 rounded-lg font-medium transition-colors border-2"
              style={{ borderColor: '#A8211B', color: '#A8211B' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#FEF3E2';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                <span>View Properties</span>
              </div>
            </Link>
          </div>
          
          <div className="mt-8 pt-8 border-t">
            <p className="text-sm text-gray-500">
              Eastern Estate ERP • Life Long Bonding
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
