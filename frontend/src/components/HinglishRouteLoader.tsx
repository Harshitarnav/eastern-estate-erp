'use client';

import { HinglishLoaderBadge } from './HinglishLoaderBadge';
import { LoaderContext } from './HinglishLoader';
import { DashboardSkeleton, TableSkeleton, CardGridSkeleton, SectionSkeleton, DetailSkeleton } from './Skeletons';

type Variant = 'dashboard' | 'table' | 'grid' | 'section' | 'detail';

/**
 * One-stop route-level loader: a fast-perceiving skeleton + a warm Hinglish badge.
 */
export function HinglishRouteLoader({
  context = 'default',
  variant = 'table',
  rows = 8,
}: {
  context?: LoaderContext;
  variant?: Variant;
  rows?: number;
}) {
  let skeleton: React.ReactNode = null;
  switch (variant) {
    case 'dashboard':
      skeleton = <DashboardSkeleton />;
      break;
    case 'grid':
      skeleton = <CardGridSkeleton cards={rows} />;
      break;
    case 'section':
      skeleton = <SectionSkeleton />;
      break;
    case 'detail':
      skeleton = <DetailSkeleton />;
      break;
    case 'table':
    default:
      skeleton = <TableSkeleton rows={rows} />;
      break;
  }

  return (
    <div className="relative p-6">
      {skeleton}
      <HinglishLoaderBadge context={context} />
    </div>
  );
}

export default HinglishRouteLoader;
