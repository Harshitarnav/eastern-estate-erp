/**
 * Audit entries for a single demand draft (Collections detail timeline).
 * Stored on demand_drafts.metadata.collectionsActivities (append-only).
 */

export type CollectionsDdActivityEntry = {
  at: string;
  kind: string;
  label: string;
  detail?: string | null;
  by?: string | null;
};

export function appendCollectionsActivityPayload(
  metadata: Record<string, unknown> | null | undefined,
  entry: Omit<CollectionsDdActivityEntry, 'at'> & { at?: string },
): Record<string, unknown> {
  const prev = (metadata?.collectionsActivities as CollectionsDdActivityEntry[]) || [];
  const activities = [...prev];
  activities.push({
    at: entry.at ?? new Date().toISOString(),
    kind: entry.kind,
    label: entry.label,
    detail: entry.detail ?? null,
    by: entry.by ?? null,
  });
  return { ...(metadata || {}), collectionsActivities: activities };
}
