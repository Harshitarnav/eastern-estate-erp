const NON_BOOKABLE_FLAT = new Set(['BOOKED', 'SOLD', 'BLOCKED']);

/**
 * Units that can be chosen on a new booking. Many inventories default status to
 * UNDER_CONSTRUCTION while still being saleable — strict `status=AVAILABLE` alone hid everything.
 */
export function filterBookableFlats<T extends { status?: string }>(rows: T[]): T[] {
  if (!rows?.length) return [];
  return rows.filter(
    (f) => f && !NON_BOOKABLE_FLAT.has(String(f.status || '').toUpperCase()),
  );
}
