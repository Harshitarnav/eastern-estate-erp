'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Redirects to the canonical User Management page
export default function UsersRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace('/settings/users'); }, [router]);
  return null;
}
