'use client';

import { useAuth } from '@/hooks/useAuth';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useAuth(false);
  return <>{children}</>;
}
