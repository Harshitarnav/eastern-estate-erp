import React from 'react';
import { brandGradient, brandHeroOverlay, brandPalette } from '@/utils/brand';

interface BrandHeroProps {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  badge?: React.ReactNode;
}

export function BrandHero({ eyebrow, title, description, actions, badge }: BrandHeroProps) {
  return (
    <section
      className="relative overflow-hidden rounded-3xl px-6 py-8 md:px-10 md:py-12 text-white shadow-lg"
      style={{ background: brandGradient }}
    >
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: brandHeroOverlay }} />
      <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-4 max-w-2xl">
          {eyebrow && (
            <span className="uppercase tracking-[0.4em] text-xs" style={{ color: '#FDE2A9' }}>
              {eyebrow}
            </span>
          )}
          <h1 className="text-3xl md:text-4xl font-bold leading-tight">{title}</h1>
          {description && (
            <p className="text-sm md:text-base text-white/80 max-w-xl leading-relaxed">{description}</p>
          )}
          {badge}
        </div>
        {actions && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">{actions}</div>
        )}
      </div>
    </section>
  );
}

type BrandButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
};

export function BrandPrimaryButton({ children, className, ...props }: BrandButtonProps) {
  return (
    <button
      {...props}
      className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold shadow-lg transition-transform hover:-translate-y-0.5 ${className ?? ''}`}
      style={{ backgroundColor: brandPalette.accent, color: brandPalette.secondary }}
    >
      {children}
    </button>
  );
}

export function BrandSecondaryButton({ children, className, ...props }: BrandButtonProps) {
  return (
    <button
      {...props}
      className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold border transition-transform hover:-translate-y-0.5 ${className ?? ''}`}
      style={{
        backgroundColor: 'transparent',
        borderColor: 'rgba(255,255,255,0.35)',
        color: brandPalette.surface,
      }}
    >
      {children}
    </button>
  );
}
