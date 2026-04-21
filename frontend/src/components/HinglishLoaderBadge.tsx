'use client';

import { useEffect, useMemo, useState } from 'react';
import { HinglishLoader, LoaderContext } from './HinglishLoader';
import { brandPalette } from '@/utils/brand';

/**
 * HinglishLoaderBadge — a small floating pill that appears a short while
 * into a page load, so quick navigations don't get cluttered, but slower
 * ones feel warm & branded.
 *
 * Place inside a route-level `loading.tsx` alongside a layout skeleton.
 */
/**
 * NOTE on delay:
 * Most dashboard routes render their skeleton in <300ms, so if the badge appeared
 * right away the user would perceive *two* loaders stacked on top of each other
 * (skeleton + floating pill). We delay it long enough that quick navigations only
 * show the skeleton, and the warm Hinglish badge only kicks in for genuinely slow
 * loads where the extra reassurance is actually useful.
 */
export function HinglishLoaderBadge({
  context = 'default',
  delayMs = 1500,
}: {
  context?: LoaderContext;
  delayMs?: number;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delayMs);
    return () => clearTimeout(t);
  }, [delayMs]);

  if (!visible) return null;

  return (
    <>
      <style>{`
        @keyframes ee-badge-slide-up {
          from { opacity: 0; transform: translate(-50%, 24px); }
          to   { opacity: 1; transform: translate(-50%, 0); }
        }
        .ee-badge {
          animation: ee-badge-slide-up 0.35s ease-out;
        }
      `}</style>
      <div
        className="ee-badge fixed left-1/2 bottom-6 z-40 -translate-x-1/2 rounded-full border shadow-lg backdrop-blur-sm px-4 py-2.5 flex items-center gap-3"
        style={{
          background: `${brandPalette.surface}F0`,
          borderColor: `${brandPalette.primary}25`,
          boxShadow: '0 10px 30px -12px rgba(168, 33, 27, 0.3)',
        }}
      >
        <HinglishLoader context={context} compact />
      </div>
    </>
  );
}

export default HinglishLoaderBadge;
