'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

// Redirects to the unified Project Access page, pre-selecting this user
export default function UserPropertyAccessRedirect() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  useEffect(() => {
    if (id) router.replace(`/property-access?userId=${id}`);
  }, [id, router]);
  return null;
}
