'use client';

import { useRouter } from 'next/navigation';
import { 
  Users, 
  UserPlus, 
  Calendar, 
  ClipboardList, 
  DollarSign, 
  TrendingUp, 
  Award, 
  FileText,
  Clock,
  Target,
  Briefcase,
  GraduationCap
} from 'lucide-react';

export default function HRPage() {
  const router = useRouter();

  const hrModules = [
    {
      id: 'employees',
      title: 'Employee Login',
      description: 'Manage employee records, profiles, and employment details',
      icon: Users,
      status: 'active',
      color: '#10B981',
      href: '/employees',
    },
    {
      id: 'recruitment',
      title: 'Recruitment',
      description: 'Manage job postings, applications, and hiring pipeline',
      icon: UserPlus,
      status: 'coming-soon',
      color: '#3B82F6',
    },
    {
      id: 'attendance',
      title: 'Attendance & Leave',
      description: 'Track attendance, leave requests, and working hours',
      icon: Calendar,
      status: 'coming-soon',
      color: '#F59E0B',
    },
    {
      id: 'payroll',
      title: 'Payroll',
      description: 'Process salaries, deductions, and salary slips',
      icon: DollarSign,
      status: 'coming-soon',
      color: '#EF4444',
    },
    {
      id: 'performance',
      title: 'Performance',
      description: 'Manage appraisals, reviews, and performance metrics',
      icon: TrendingUp,
      status: 'coming-soon',
      color: '#8B5CF6',
    },
    {
      id: 'training',
      title: 'Training & Development',
      description: 'Organize training programs and skill development',
      icon: GraduationCap,
      status: 'coming-soon',
      color: '#06B6D4',
    },
    {
      id: 'benefits',
      title: 'Benefits & Compensation',
      description: 'Manage employee benefits, bonuses, and incentives',
      icon: Award,
      status: 'coming-soon',
      color: '#EC4899',
    },
    {
      id: 'policies',
      title: 'Policies & Documents',
      description: 'Store and manage HR policies and documents',
      icon: FileText,
      status: 'coming-soon',
      color: '#14B8A6',
    },
    {
      id: 'timesheet',
      title: 'Timesheet',
      description: 'Track project time, billable hours, and productivity',
      icon: Clock,
      status: 'coming-soon',
      color: '#F97316',
    },
    {
      id: 'goals',
      title: 'Goals & OKRs',
      description: 'Set and track employee goals and objectives',
      icon: Target,
      status: 'coming-soon',
      color: '#84CC16',
    },
    {
      id: 'succession',
      title: 'Succession Planning',
      description: 'Plan for leadership transitions and talent pipeline',
      icon: Briefcase,
      status: 'coming-soon',
      color: '#64748B',
    },
    {
      id: 'reports',
      title: 'HR Reports',
      description: 'Generate comprehensive HR analytics and reports',
      icon: ClipboardList,
      status: 'coming-soon',
      color: '#A855F7',
    },
  ];

  const activeModules = hrModules.filter(m => m.status === 'active');
  const comingSoonModules = hrModules.filter(m => m.status === 'coming-soon');

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold" style={{ color: '#7B1E12' }}>
          Human Resources
        </h1>
        <p className="text-gray-600 mt-2">
          Comprehensive HR management system for your organization
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4" style={{ borderColor: '#10B981' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Employees</p>
              <p className="text-2xl font-bold" style={{ color: '#7B1E12' }}>-</p>
            </div>
            <Users className="h-10 w-10" style={{ color: '#10B981', opacity: 0.3 }} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4" style={{ borderColor: '#3B82F6' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Active Today</p>
              <p className="text-2xl font-bold" style={{ color: '#7B1E12' }}>-</p>
            </div>
            <Calendar className="h-10 w-10" style={{ color: '#3B82F6', opacity: 0.3 }} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4" style={{ borderColor: '#F59E0B' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">On Leave</p>
              <p className="text-2xl font-bold" style={{ color: '#7B1E12' }}>-</p>
            </div>
            <Clock className="h-10 w-10" style={{ color: '#F59E0B', opacity: 0.3 }} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4" style={{ borderColor: '#EF4444' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Pending Actions</p>
              <p className="text-2xl font-bold" style={{ color: '#7B1E12' }}>-</p>
            </div>
            <ClipboardList className="h-10 w-10" style={{ color: '#EF4444', opacity: 0.3 }} />
          </div>
        </div>
      </div>

      {/* Active Modules */}
      {activeModules.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4" style={{ color: '#7B1E12' }}>
            Active Modules
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeModules.map((module) => {
              const Icon = module.icon;
              return (
                <button
                  key={module.id}
                  onClick={() => module.href && router.push(module.href)}
                  className="bg-white rounded-lg shadow-md p-6 text-left hover:shadow-lg transition-shadow border-l-4 group"
                  style={{ borderColor: module.color }}
                >
                  <div className="flex items-start gap-4">
                    <div 
                      className="p-3 rounded-lg flex-shrink-0"
                      style={{ backgroundColor: `${module.color}20` }}
                    >
                      <Icon className="h-6 w-6" style={{ color: module.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold mb-1 group-hover:text-[#A8211B] transition-colors">
                        {module.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {module.description}
                      </p>
                      <div className="mt-3">
                        <span 
                          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-white"
                          style={{ backgroundColor: module.color }}
                        >
                          Available
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Coming Soon Modules */}
      {comingSoonModules.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4" style={{ color: '#7B1E12' }}>
            Coming Soon
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {comingSoonModules.map((module) => {
              const Icon = module.icon;
              return (
                <div
                  key={module.id}
                  className="bg-white rounded-lg shadow-md p-6 text-left border-l-4 opacity-75 relative overflow-hidden"
                  style={{ borderColor: module.color }}
                >
                  <div className="flex items-start gap-4">
                    <div 
                      className="p-3 rounded-lg flex-shrink-0"
                      style={{ backgroundColor: `${module.color}20` }}
                    >
                      <Icon className="h-6 w-6" style={{ color: module.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold mb-1">
                        {module.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {module.description}
                      </p>
                      <div className="mt-3">
                        <span 
                          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-700"
                        >
                          Coming Soon
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* Overlay pattern */}
                  <div 
                    className="absolute inset-0 pointer-events-none opacity-5"
                    style={{
                      backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, currentColor 10px, currentColor 20px)',
                      color: module.color,
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Info Banner */}
      <div 
        className="bg-gradient-to-r from-[#A8211B] to-[#7B1E12] rounded-lg shadow-md p-6 text-white"
      >
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <Briefcase className="h-8 w-8" />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">
              Building a Complete HR Solution
            </h3>
            <p className="text-white/90">
              We're continuously expanding our HR module to provide you with all the tools you need 
              to manage your workforce effectively. Stay tuned for exciting new features!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
