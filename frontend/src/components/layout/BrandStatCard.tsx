import React from 'react';
import { brandPalette } from '@/utils/brand';

interface BrandStatCardProps {
  title: string;
  primary: string;
  subLabel: string;
  icon: React.ReactNode;
  accentColor?: string;
}

export function BrandStatCard({
  title,
  primary,
  subLabel,
  icon,
  accentColor,
}: BrandStatCardProps) {
  const accent = accentColor || `${brandPalette.accent}33`;

  return (
    <div
      className="rounded-2xl border bg-white px-5 py-6 shadow-sm space-y-3"
      style={{ borderColor: `${accent}80` }}
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center text-white"
        style={{ backgroundColor: accent }}
      >
        {icon}
      </div>
      <div>
        <p className="text-xs uppercase tracking-widest text-gray-500">{title}</p>
        <p className="mt-2 text-2xl font-bold text-gray-900">{primary}</p>
        <p className="text-xs text-gray-500 mt-1">{subLabel}</p>
      </div>
    </div>
  );
}
