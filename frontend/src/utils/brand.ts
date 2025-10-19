export const brandPalette = {
  primary: '#A8211B',
  secondary: '#7B1E12',
  accent: '#F2C94C',
  neutral: '#F3E3C1',
  success: '#3DA35D',
  background: '#F9F7F3',
  surface: '#FFFFFF',
};

export const brandGradient = `linear-gradient(135deg, ${brandPalette.primary} 0%, ${brandPalette.secondary} 100%)`;

export const brandHeroOverlay = 'radial-gradient(circle at top right, #F2C94C 0%, transparent 60%)';

export const brandShadow = '0px 20px 45px -22px rgba(168, 33, 27, 0.45)';

export const formatIndianNumber = (value: number) =>
  new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(value);

export const formatToCrore = (value?: number) => {
  if (!value || Number.isNaN(value)) return '—';
  return `${(value / 10000000).toFixed(1)} Cr`;
};
