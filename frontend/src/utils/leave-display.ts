/**
 * Display helpers for leave days stored as decimals (0.5 = half-day).
 */

/** Full-day count and half-day count (0 or 1) for totals in 0.5 increments */
export function countFullAndHalfLeaves(total: number): { full: number; half: number } {
  const n = Number(total);
  if (!Number.isFinite(n) || n <= 0) {
    return { full: 0, half: 0 };
  }
  const halfSteps = Math.round(n * 2);
  const full = Math.floor(halfSteps / 2);
  const half = halfSteps % 2;
  return { full, half };
}

/** @deprecated Prefer countFullAndHalfLeaves — kept for any older imports */
export function splitFullAndHalfDays(total: number): { fullDays: number; halfDays: number } {
  const { full, half } = countFullAndHalfLeaves(total);
  return { fullDays: full, halfDays: half };
}

/** e.g. "2 full days, 1 half-day" or "1 half-day" or "0" */
export function describeLeaveDays(total: number): string {
  const { full, half } = countFullAndHalfLeaves(total);
  if (full === 0 && half === 0) return '0 day units';
  const parts: string[] = [];
  if (full > 0) {
    parts.push(`${full} full day${full === 1 ? '' : 's'}`);
  }
  if (half > 0) {
    parts.push(`${half} half-day${half === 1 ? '' : 's'}`);
  }
  return parts.join(', ');
}

export function formatLeaveNumeric(total: number): string {
  const n = Number(total);
  if (!Number.isFinite(n)) return '0';
  return Number.isInteger(n) ? String(n) : n.toFixed(1).replace(/\.0$/, '');
}
