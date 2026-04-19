'use client';

/**
 * Legacy route preserved for backwards-compatibility.
 *
 * The old `/demand-drafts/[id]` page has been merged into the
 * Collections workstation at `/collections/[id]`, which now owns:
 *   - inline editing of title / amount / due date / HTML content
 *   - send / approve / warning actions
 *   - PDF invoice generation
 *   - HTML download and delete
 *
 * Many parts of the app still route here (construction milestones,
 * ledger, payment plans, progress logs), so we transparently forward
 * to the new canonical URL instead of breaking those links.
 */

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function DemandDraftLegacyRedirect() {
  const params = useParams();
  const router = useRouter();
  const id =
    typeof params?.id === 'string'
      ? params.id
      : Array.isArray(params?.id)
        ? params.id[0]
        : '';

  useEffect(() => {
    if (!id) {
      router.replace('/collections');
      return;
    }
    router.replace(`/collections/${id}`);
  }, [id, router]);

  return (
    <div className="p-6 flex items-center gap-2 text-sm text-gray-500">
      <Loader2 className="h-4 w-4 animate-spin" />
      Redirecting to Collections…
    </div>
  );
}
