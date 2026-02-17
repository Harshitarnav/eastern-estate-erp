'use client';

import NoPropertyAccess from '@/components/NoPropertyAccess';

/**
 * No Access Page
 * 
 * Shown when a user has logged in but doesn't have property access assigned.
 * This provides a beautiful UI with contact options and clear instructions.
 */
export default function NoAccessPage() {
  return <NoPropertyAccess />;
}
