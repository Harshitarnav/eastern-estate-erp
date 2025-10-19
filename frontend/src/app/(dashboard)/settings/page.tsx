'use client';

import { ComingSoon } from '@/components/ComingSoon';
import { Settings } from 'lucide-react';

export default function SettingsPage() {
  return (
    <ComingSoon
      title="Settings"
      description="Configure system settings, user preferences, and application parameters."
      features={[
        'User management',
        'Role permissions',
        'System configuration',
        'Email templates',
        'Notification settings'
      ]}
      icon={Settings}
    />
  );
}
