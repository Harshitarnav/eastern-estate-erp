import { ComingSoon } from '@/components/ComingSoon';
import { Users } from 'lucide-react';

export default function HRPage() {
  return (
    <ComingSoon
      title="HR Management"
      description="Manage employees, attendance, payroll, and HR operations."
      features={[
        'Employee management',
        'Attendance tracking',
        'Payroll processing',
        'Leave management',
        'Performance reviews'
      ]}
      icon={Users}
    />
  );
}
