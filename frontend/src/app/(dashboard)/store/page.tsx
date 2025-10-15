'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function StorePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to inventory page as Store is now managed through Inventory
    router.replace('/inventory');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" style={{ color: '#A8211B' }} />
        <p className="text-gray-600">Redirecting to Inventory Management...</p>
      </div>
    </div>
  );
}
