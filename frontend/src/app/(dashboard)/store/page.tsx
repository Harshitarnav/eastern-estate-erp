'use client';

import { ComingSoon } from '@/components/ComingSoon';
import { Package } from 'lucide-react';

export default function StorePage() {
  return (
    <ComingSoon
      title="Store/Inventory Management"
      description="Manage construction materials, supplies, and inventory."
      features={[
        'Inventory tracking',
        'Purchase orders',
        'Stock management',
        'Supplier management',
        'Material requests'
      ]}
      icon={Package}
    />
  );
}
