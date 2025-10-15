'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function HRPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to employees page as HR is now managed through Employees
    router.replace('/employees');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" style={{ color: '#A8211B' }} />
        <p className="text-gray-600">Redirecting to HR/Employee Management...</p>
      </div>
    </div>
  );
}
