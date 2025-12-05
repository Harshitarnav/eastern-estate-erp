/**
 * @file sales/page.tsx
 * @description Sales Person Dashboard - Main view for sales team members
 */

'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { salesDashboardService } from '@/services/sales-dashboard.service';
import { leadsService, Lead } from '@/services/leads.service';
import { usersService, User } from '@/services/users.service';
import { propertiesService } from '@/services/properties.service';
import { usePropertyStore } from '@/store/propertyStore';
import { MobileFAB } from '@/components/mobile/FloatingActionButton';
import { DashboardMetrics } from '@/types/sales-crm.types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  TrendingUp,
  Target,
  Calendar,
  CheckCircle,
  AlertCircle,
  Users,
  PhoneCall,
  Phone,
  MapPin,
  DollarSign,
  Activity,
  Clock,
  BarChart3,
  Star,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  brandGradient,
  brandHeroOverlay,
  brandPalette,
  brandShadow,
  formatIndianNumber,
  formatToCrore,
} from '@/utils/brand';

export default function SalesDashboard() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const {
    selectedProperties,
    setSelectedProperties,
    properties,
    setMultiSelectMode,
    setProperties,
  } = usePropertyStore();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [focusLeads, setFocusLeads] = useState<Lead[]>([]);
  const [assignedLeads, setAssignedLeads] = useState<Lead[]>([]);
  const [focusLoading, setFocusLoading] = useState(false);
  const [focusError, setFocusError] = useState<string | null>(null);
  const [assignedLoading, setAssignedLoading] = useState(false);
  const [assignedError, setAssignedError] = useState<string | null>(null);
  const [priorityTasks, setPriorityTasks] = useState<any[]>([]);
  const [smartTips, setSmartTips] = useState<string[]>([]);
  const [priorityLoading, setPriorityLoading] = useState(false);
  const [agentOptions, setAgentOptions] = useState<User[]>([]);
  const [filters, setFilters] = useState<{
    agentId?: string;
    propertyId?: string;
    towerId?: string;
    flatId?: string;
    dateFrom?: string;
    dateTo?: string;
  }>({});

  const isManager = useMemo(() => {
    const roles = user?.roles || [];
    return roles.some((r) =>
      ['super_admin', 'admin', 'sales_manager', 'sales_gm'].includes(r),
    );
  }, [user]);

  useEffect(() => {
    setMultiSelectMode(isManager);
    if (user?.id) {
      const propertyId = selectedProperties[0];
      const agentId = isManager ? undefined : user.id;
      setFilters((prev) => ({ ...prev, propertyId, agentId }));
      loadDashboard({ propertyId, agentId });
    } else if (!authLoading && !user) {
      setLoading(false);
      setError('User not authenticated. Please log in.');
    }
  }, [user, authLoading, isManager, selectedProperties, setMultiSelectMode]);

  useEffect(() => {
    // Load properties for the selector if not already loaded
    if (properties.length === 0) {
      (async () => {
        try {
          const res = await propertiesService.getProperties({ limit: 200, isActive: true });
          setProperties(res.data || []);
        } catch (err) {
          console.error('Failed to load properties', err);
        }
      })();
    }
  }, [properties.length, setProperties]);

  useEffect(() => {
    if (isManager) {
      (async () => {
        try {
          const res = await usersService.getUsers({ role: 'sales_agent', limit: 100 }, { forceRefresh: true });
          setAgentOptions(res.data || []);
        } catch (err) {
          console.error('Failed to load agents', err);
        }
      })();
    }
  }, [isManager]);

  const loadDashboard = async (override?: Partial<typeof filters>) => {
    try {
      setLoading(true);
      setError(null);
      const mergedFilters = { ...filters, ...override };
      const data = await salesDashboardService.getDashboardMetrics(user!.id, mergedFilters);
      if (!data) {
        setError('No dashboard data available yet. Please try again later.');
        setMetrics(null);
        return;
      }
      setMetrics(data);
      setFilters(mergedFilters);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadFocusLeads = async () => {
    if (!user?.id) return;

    try {
      setFocusLoading(true);
      setFocusError(null);
      const data = await leadsService.getDueFollowUps(user.id);
      setFocusLeads(Array.isArray(data) ? data.slice(0, 6) : []);
    } catch (err) {
      console.error('Focus leads error:', err);
      setFocusError(err instanceof Error ? err.message : 'Failed to load focus leads');
    } finally {
      setFocusLoading(false);
    }
  };

  const loadAssignedLeads = async () => {
    if (!user?.id) return;

    try {
      setAssignedLoading(true);
      setAssignedError(null);
      const data = await leadsService.getMyLeads(user.id);
      setAssignedLeads(Array.isArray(data) ? data.slice(0, 6) : []);
    } catch (err) {
      console.error('Assigned leads error:', err);
      setAssignedError(err instanceof Error ? err.message : 'Failed to load assigned leads');
    } finally {
      setAssignedLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      loadFocusLeads();
      loadAssignedLeads();
      loadPriorityData();
    }
  }, [user?.id]);

  const loadPriorityData = async () => {
    if (!user?.id) return;

    try {
      setPriorityLoading(true);
      const [tasks, tips] = await Promise.all([
        leadsService.getTodaysTasks(user.id),
        leadsService.getSmartTips(user.id),
      ]);
      
      setPriorityTasks(Array.isArray(tasks) ? tasks : []);
      setSmartTips(Array.isArray(tips.tips) ? tips.tips : []);
    } catch (err) {
      console.error('Priority data error:', err);
    } finally {
      setPriorityLoading(false);
    }
  };

  const handleFiltersApply = () => {
    loadDashboard();
  };

  const handleResetFilters = () => {
    const base = { agentId: isManager ? undefined : user?.id, propertyId: undefined, towerId: undefined, flatId: undefined, dateFrom: undefined, dateTo: undefined };
    setSelectedProperties([]);
    setFilters(base);
    loadDashboard(base);
  };

  const handleQuickAction = (action: any) => {
    if (action.action.startsWith('tel:')) {
      window.location.href = action.action;
    } else if (action.action === 'complete') {
      // Mark as complete - refresh data
      loadPriorityData();
    } else if (action.action === 'reschedule') {
      // Open reschedule modal
      router.push('/sales/follow-ups');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-red-600">Error Loading Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={loadDashboard}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>No Dashboard Data</CardTitle>
            <CardDescription>
              We could not load any sales metrics. Please try again.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={loadDashboard} className="w-full">
              Reload Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getPriorityBadge = (priority: string) => {
    const colors = {
      URGENT: 'bg-red-100 text-red-800',
      HIGH: 'bg-orange-100 text-orange-800',
      MEDIUM: 'bg-blue-100 text-blue-800',
      LOW: 'bg-gray-100 text-gray-800',
    };
    return colors[priority as keyof typeof colors] || colors.MEDIUM;
  };

  const toDisplayDate = (value?: Date | string | null) => {
    if (!value) return 'Date TBC';
    const parsed = typeof value === 'string' ? new Date(value) : value;
    if (Number.isNaN(parsed.getTime())) return 'Date TBC';
    return parsed.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
  };

  const toDisplayDateTime = (value?: Date | string | null) => {
    if (!value) return 'Date TBC';
    const parsed = typeof value === 'string' ? new Date(value) : value;
    if (Number.isNaN(parsed.getTime())) return 'Date TBC';
    return parsed.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const currentTarget = metrics.performance.currentTarget;
  const achievementPct = Math.round(metrics.performance.achievementPercentage ?? 0);
  const daysRemaining = metrics.performance.daysRemaining ?? 0;
  const incentiveShortfall = metrics.performance.missedBy ?? 0;
  const incentiveMessage =
    incentiveShortfall > 0
        ? `You missed your incentive by ${incentiveShortfall} sale${
            incentiveShortfall > 1 ? 's' : ''
          }. One more push will unlock it.`
        : 'Incentive track is green. Keep compounding the Eastern trust!';
  const currentMonthLabel = new Date().toLocaleString('default', { month: 'short' });

  return (
    <div className="space-y-6 p-6 md:p-8" style={{ backgroundColor: brandPalette.background }}>
      {/* Filters */}
      <div className="grid gap-3 rounded-2xl bg-white p-4 shadow-sm md:grid-cols-3">
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-gray-700">Property</Label>
          <Select
            value={filters.propertyId || selectedProperties[0] || 'all'}
            onValueChange={(v) => {
              if (v === 'all') {
                setSelectedProperties([]);
                setFilters((prev) => ({ ...prev, propertyId: undefined }));
              } else {
                setSelectedProperties([v]);
                setFilters((prev) => ({ ...prev, propertyId: v }));
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="All properties" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All properties</SelectItem>
              {properties.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700">Date from</Label>
            <Input
              type="date"
              value={filters.dateFrom || ''}
              onChange={(e) => setFilters((prev) => ({ ...prev, dateFrom: e.target.value || undefined }))}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700">Date to</Label>
            <Input
              type="date"
              value={filters.dateTo || ''}
              onChange={(e) => setFilters((prev) => ({ ...prev, dateTo: e.target.value || undefined }))}
            />
          </div>
        </div>

        {isManager && (
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700">Agent</Label>
            <Select
              value={filters.agentId || 'all'}
              onValueChange={(v) =>
                setFilters((prev) => ({ ...prev, agentId: v === 'all' ? undefined : v }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All agents" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All agents</SelectItem>
                {agentOptions.map((agent) => (
                  <SelectItem key={agent.id} value={agent.id}>
                    {agent.firstName} {agent.lastName || ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex items-end gap-2 md:col-span-3">
          <Button onClick={handleFiltersApply} className="px-5" style={{ background: brandGradient }}>
            Apply Filters
          </Button>
          <Button variant="outline" onClick={handleResetFilters}>
            Reset
          </Button>
        </div>
      </div>

      {/* Hero */}
      <div
        className="relative overflow-hidden rounded-3xl p-6 md:p-10 text-white shadow-lg"
        style={{ background: brandGradient, boxShadow: brandShadow }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{ background: brandHeroOverlay }}
        />
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-5 max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1 text-xs uppercase tracking-[0.3em]">
              <Star className="h-3 w-3 text-yellow-200" />
              Eastern Estate Sales Console
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-bold leading-tight">
                Welcome back, {user?.firstName}!{' '}
                <span className="text-[#F2C94C]">
                  Let’s delight one more family this week.
                </span>
              </h1>
              <p className="text-base md:text-lg text-white/80">
                {metrics.performance.motivationalMessage}
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-white/70">
                <span>Achievement</span>
                <span>{achievementPct.toFixed(1)}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/25">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(achievementPct, 120)}%`,
                    backgroundColor: brandPalette.accent,
                  }}
                />
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm text-white/85">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1">
                  <TrendingUp className="h-4 w-4" />
                  <span>{achievementPct.toFixed(1)}% to goal</span>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1">
                  <Clock className="h-4 w-4" />
                  <span>{daysRemaining} days left in period</span>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1">
                  <Target className="h-4 w-4" />
                  <span>
                    {metrics.performance.currentTarget?.achievedBookings ?? 0}/
                    {metrics.performance.currentTarget?.targetBookings ?? 0} bookings
                  </span>
                </div>
              </div>
              <div className="mt-2 inline-flex items-center gap-2 rounded-2xl bg-black/20 px-4 py-2 text-sm font-medium shadow-sm">
                <AlertCircle className="h-4 w-4 text-[#F2C94C]" />
                <span>{incentiveMessage}</span>
              </div>
            </div>
          </div>

          <div className="grid w-full gap-3 sm:grid-cols-2 lg:w-auto">
            <div className="rounded-2xl bg-white/12 p-4 shadow-inner backdrop-blur">
              <p className="text-xs uppercase tracking-wide text-white/70">Self Target</p>
              <p className="mt-2 text-xl font-semibold">
                {currentTarget?.selfTargetBookings ?? '—'} bookings
              </p>
              <p className="text-sm text-white/70">
                ₹{formatIndianNumber(currentTarget?.selfTargetRevenue ?? 0)}
              </p>
            </div>
            <div className="rounded-2xl bg-white/12 p-4 shadow-inner backdrop-blur">
              <p className="text-xs uppercase tracking-wide text-white/70">Earned Incentive</p>
              <p className="mt-2 text-xl font-semibold">
                ₹{formatIndianNumber(currentTarget?.earnedIncentive ?? 0)}
              </p>
              <p className="text-sm text-white/70">
                Target ₹{formatIndianNumber(currentTarget?.totalIncentive ?? 0)}
              </p>
            </div>
            <div className="rounded-2xl bg-white/12 p-4 shadow-inner backdrop-blur">
              <p className="text-xs uppercase tracking-wide text-white/70">Revenue Pace</p>
              <p className="mt-2 text-xl font-semibold">
                {formatToCrore(currentTarget?.achievedRevenue)}
              </p>
              <p className="text-sm text-white/70">
                Goal {formatToCrore(currentTarget?.targetRevenue)}
              </p>
            </div>
            <div className="rounded-2xl bg-white/12 p-4 shadow-inner backdrop-blur">
              <p className="text-xs uppercase tracking-wide text-white/70">Site Visits</p>
              <p className="mt-2 text-xl font-semibold">
                {currentTarget?.achievedSiteVisits ?? 0}/{currentTarget?.targetSiteVisits ?? 0}
              </p>
              <p className="text-sm text-white/70">Keep the Eastern experience warm</p>
            </div>
          </div>
        </div>
      </div>

      {/* Smart Tips Section */}
      {smartTips.length > 0 && (
        <div className="relative overflow-hidden rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-5 shadow-sm">
          <div className="absolute right-0 top-0 h-32 w-32 opacity-10">
            <div className="h-full w-full rounded-full bg-blue-400" />
          </div>
          <div className="relative z-10">
            <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-blue-900">
              💡 Smart Tips for You
            </h3>
            <ul className="space-y-2">
              {smartTips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-blue-800">
                  <span className="mt-1 font-bold">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Priority Tasks Section */}
      {priorityTasks.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
              <Clock className="h-6 w-6 text-red-600" />
              Today's Priority Tasks ({priorityTasks.length})
            </h2>
            {priorityLoading && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Refreshing
              </div>
            )}
          </div>
          
          <div className="space-y-3">
            {priorityTasks.map((task) => (
              <div
                key={task.id}
                className="transform rounded-2xl border-l-4 bg-white p-5 shadow-md transition-all hover:scale-[1.01] hover:shadow-lg"
                style={{ borderColor: task.priority.color }}
              >
                {/* Header */}
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{task.priority.emoji}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className="rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide text-white shadow-sm"
                          style={{ backgroundColor: task.priority.color }}
                        >
                          {task.priority.urgency}
                        </span>
                        <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
                          {task.type.replace('_', ' ')}
                        </span>
                      </div>
                      <h3 className="mt-1 text-lg font-bold text-gray-900">{task.action}</h3>
                    </div>
                  </div>
                  
                  <div className="text-right text-sm">
                    <div className="font-semibold text-gray-700">
                      {new Date(task.dueDate).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                    <div className="text-xs text-gray-500">Due time</div>
                  </div>
                </div>

                {/* Lead Info Card */}
                <div className="mb-3 rounded-xl bg-gray-50 p-3">
                  <div className="grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
                    <div>
                      <span className="font-semibold text-gray-700">Lead:</span>
                      <span className="ml-2 text-gray-900">
                        {task.lead.firstName} {task.lead.lastName}
                      </span>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700">Phone:</span>
                      <a
                        href={`tel:${task.lead.phone}`}
                        className="ml-2 font-medium text-blue-600 hover:underline"
                      >
                        {task.lead.phone}
                      </a>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700">Status:</span>
                      <span className="ml-2 text-gray-900">{task.lead.status}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700">Priority:</span>
                      <span className="ml-2 text-gray-900">{task.lead.priority}</span>
                    </div>
                  </div>
                </div>

                {/* Priority Reasons */}
                {task.priority.reasons && task.priority.reasons.length > 0 && (
                  <div className="mb-4 rounded-lg bg-yellow-50 p-3">
                    <p className="mb-2 text-xs font-bold uppercase tracking-wide text-yellow-900">
                      Why this is priority:
                    </p>
                    <ul className="space-y-1 text-sm text-yellow-800">
                      {task.priority.reasons.map((reason: string, i: number) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="mt-0.5">⚠️</span>
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="flex flex-wrap gap-2">
                  {task.quickActions.map((action: any, i: number) => (
                    <button
                      key={i}
                      onClick={() => handleQuickAction(action)}
                      className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md active:scale-95"
                    >
                      <span className="text-base">{action.icon}</span>
                      <span>{action.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {priorityTasks.length === 0 && !priorityLoading && (
        <div className="rounded-2xl border-2 border-dashed border-green-200 bg-green-50 p-8 text-center">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="mb-2 text-xl font-bold text-green-900">All Caught Up!</h3>
          <p className="text-green-700">No urgent tasks for today. Great work!</p>
        </div>
      )}

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-gray-600">
          Personal console powered by Eastern Estate brand warmth and discipline.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            asChild
            variant="outline"
            className="border-none px-5"
            style={{ backgroundColor: brandPalette.surface, color: brandPalette.primary }}
          >
            <Link href="/sales/tasks">
              <Clock className="mr-2 h-4 w-4" />
              Schedule Task
            </Link>
          </Button>
          <Button
            asChild
            className="px-5"
            style={{ background: brandGradient, boxShadow: brandShadow }}
          >
            <Link href="/sales/follow-ups">
              <PhoneCall className="mr-2 h-4 w-4" />
              Log Follow-up
            </Link>
          </Button>
        </div>
      </div>

      {/* Quick actions for mobile first users */}
      <div className="grid gap-2 sm:grid-cols-3">
        <Button
          asChild
          className="w-full justify-start rounded-2xl px-4 py-5 text-left text-base font-semibold shadow-sm"
          style={{ backgroundColor: brandPalette.surface, border: '1px solid rgba(168,33,27,0.08)' }}
        >
          <Link href="/leads/new">
            <Users className="mr-3 h-5 w-5 text-[#A8211B]" />
            Add Lead
          </Link>
        </Button>
        <Button
          asChild
          variant="outline"
          className="w-full justify-start rounded-2xl px-4 py-5 text-left text-base font-semibold"
        >
          <Link href="/sales/follow-ups">
            <PhoneCall className="mr-3 h-5 w-5 text-[#A8211B]" />
            Log Follow-up
          </Link>
        </Button>
        <Button
          asChild
          className="w-full justify-start rounded-2xl px-4 py-5 text-left text-base font-semibold text-white"
          style={{ background: brandGradient, boxShadow: brandShadow }}
        >
          <Link href="/sales/tasks/new">
            <Clock className="mr-3 h-5 w-5 text-white" />
            Create Task
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 rounded-2xl bg-white p-1 shadow-sm overflow-x-auto">
          <TabsTrigger
            value="overview"
            className="rounded-xl data-[state=active]:bg-[rgba(168,33,27,0.08)] data-[state=active]:text-[#A8211B]"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="tasks"
            className="rounded-xl data-[state=active]:bg-[rgba(168,33,27,0.08)] data-[state=active]:text-[#A8211B]"
          >
            Tasks
          </TabsTrigger>
          <TabsTrigger
            value="followups"
            className="rounded-xl data-[state=active]:bg-[rgba(168,33,27,0.08)] data-[state=active]:text-[#A8211B]"
          >
            Follow-ups
          </TabsTrigger>
          <TabsTrigger
            value="activities"
            className="rounded-xl data-[state=active]:bg-[rgba(168,33,27,0.08)] data-[state=active]:text-[#A8211B]"
          >
            Recent Activity
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Leads Card */}
            <Card
              style={{
                backgroundColor: brandPalette.surface,
                border: '1px solid rgba(168,33,27,0.08)',
                boxShadow: '0 12px 32px -24px rgba(168,33,27,0.55)',
              }}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                  Total Leads
                </CardTitle>
                <Users className="h-4 w-4" style={{ color: brandPalette.primary }} />
              </CardHeader>
              <CardContent>
                <div
                  className="text-3xl font-bold leading-none"
                  style={{ color: brandPalette.primary }}
                >
                  {formatIndianNumber(metrics.leads.total)}
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  <span style={{ color: brandPalette.success, fontWeight: 600 }}>
                    {formatIndianNumber(metrics.leads.new)}
                  </span>{' '}
                  new this month
                </p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
                  <span className="inline-flex items-center gap-1 rounded-full bg-[rgba(168,33,27,0.12)] px-3 py-1 text-[#A8211B]">
                    🔥 {formatIndianNumber(metrics.leads.hot)} hot
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[rgba(242,201,76,0.2)] px-3 py-1 text-[#7B1E12]">
                    {metrics.leads.conversionRate.toFixed(1)}% conversion
                  </span>
                </div>
              </CardContent>
              <CardFooter className="pt-1">
                <Button asChild variant="ghost" size="sm" className="justify-start px-0 text-[#A8211B]">
                  <Link href="/leads">Open Leads</Link>
                </Button>
              </CardFooter>
            </Card>

            {/* Site Visits Card */}
            <Card
              style={{
                backgroundColor: brandPalette.surface,
                border: '1px solid rgba(123,30,18,0.08)',
              }}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                  Site Visits
                </CardTitle>
                <MapPin className="h-4 w-4" style={{ color: brandPalette.secondary }} />
              </CardHeader>
              <CardContent>
                <div
                  className="text-3xl font-bold leading-none"
                  style={{ color: brandPalette.secondary }}
                >
                  {formatIndianNumber(metrics.siteVisits.completedThisMonth)}
                </div>
                <p className="mt-1 text-xs uppercase tracking-wide text-gray-500">
                  Completed this month
                </p>
                <div className="mt-3 space-y-1 text-xs">
                  <div className="flex items-center justify-between font-semibold">
                    <span className="text-orange-600">
                      {formatIndianNumber(metrics.siteVisits.pendingThisWeek)} pending
                    </span>
                    <span className="text-gray-500">
                      ⭐ {metrics.siteVisits.avgRating.toFixed(1)} avg rating
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-gray-500">
                    <span>{formatIndianNumber(metrics.siteVisits.scheduledUpcoming)} scheduled</span>
                    <span>Next 7 days</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-1">
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="justify-start px-0 text-[#7B1E12]"
                >
                  <Link href="/leads">View Site Visits</Link>
                </Button>
              </CardFooter>
            </Card>

            {/* Follow-ups Card */}
            <Card
              style={{
                backgroundColor: brandPalette.surface,
                border: '1px solid rgba(168,33,27,0.08)',
              }}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                  Follow-ups
                </CardTitle>
                <PhoneCall className="h-4 w-4" style={{ color: brandPalette.primary }} />
              </CardHeader>
              <CardContent>
                <div
                  className="text-3xl font-bold leading-none"
                  style={{ color: brandPalette.primary }}
                >
                  {formatIndianNumber(metrics.followups.dueToday)}
                </div>
                <p className="mt-1 text-xs uppercase tracking-wide text-gray-500">
                  Due today
                </p>
                <div className="mt-3 space-y-1 text-xs">
                  <div className="flex items-center justify-between font-semibold">
                    <span style={{ color: brandPalette.secondary }}>
                      {formatIndianNumber(metrics.followups.dueThisWeek)} this week
                    </span>
                    {metrics.followups.overdue > 0 && (
                      <span className="text-red-600">
                        {formatIndianNumber(metrics.followups.overdue)} overdue
                      </span>
                    )}
                  </div>
                  <p className="text-gray-500">
                    {metrics.followups.completedThisMonth} completed in {currentMonthLabel}
                  </p>
                </div>
              </CardContent>
              <CardFooter className="pt-1">
                <Button asChild variant="ghost" size="sm" className="justify-start px-0 text-[#A8211B]">
                  <Link href="/sales/follow-ups">Manage Follow-ups</Link>
                </Button>
              </CardFooter>
            </Card>

            {/* Revenue Card */}
            <Card
              style={{
                backgroundColor: brandPalette.surface,
                border: '1px solid rgba(168,33,27,0.08)',
              }}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                  Revenue
                </CardTitle>
                <DollarSign className="h-4 w-4" style={{ color: brandPalette.primary }} />
              </CardHeader>
              <CardContent>
                <div
                  className="text-3xl font-bold leading-none"
                  style={{ color: brandPalette.primary }}
                >
                  {formatToCrore(metrics.revenue.thisMonth)}
                </div>
                <p className="mt-1 text-xs uppercase tracking-wide text-gray-500">
                  This month
                </p>
                <div className="mt-3 space-y-1 text-xs text-gray-500">
                  <p>Avg deal size: ₹{formatIndianNumber(metrics.revenue.avgDealSize)}</p>
                  <p>Projected: {formatToCrore(metrics.revenue.projectedMonthEnd)}</p>
                </div>
              </CardContent>
              <CardFooter className="pt-1">
                <Button asChild variant="ghost" size="sm" className="justify-start px-0 text-[#A8211B]">
                  <Link href="/reports">Revenue Reports</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>

          <Card
            style={{
              backgroundColor: brandPalette.surface,
              border: '1px solid rgba(168,33,27,0.08)',
            }}
          >
            <CardHeader className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle className="text-base font-semibold text-gray-800">
                  Focus Leads • 24 hr touchpoints
                </CardTitle>
                <CardDescription>
                  Leads with site visits pending or follow-ups due in the next 48 hours.
                </CardDescription>
              </div>
              {focusLoading && (
                <div className="inline-flex items-center gap-2 text-sm text-gray-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Refreshing
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              {focusError && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                  {focusError}
                </div>
              )}

              {!focusLoading && !focusError && (focusLeads || []).length === 0 && (
                <div className="rounded-2xl bg-[rgba(168,33,27,0.05)] p-6 text-center text-sm text-gray-600">
                  All caught up. No pending follow-ups for the next 48 hours.
                </div>
              )}

              {((focusLeads || [])).map((lead) => {
                const requirement =
                  lead.requirements?.[0] ??
                  lead.interestedPropertyTypes?.[0] ??
                  'Requirement not captured';
                const budget =
                  lead.budgetMin && lead.budgetMax
                    ? `₹${formatIndianNumber(lead.budgetMin)} - ₹${formatIndianNumber(lead.budgetMax)}`
                    : lead.budgetMin
                    ? `₹${formatIndianNumber(lead.budgetMin)}+`
                    : 'Budget on discovery';
                const siteVisitLabel = lead.hasSiteVisit ? 'Site visit done' : 'Site visit pending';

                return (
                  <div
                    key={lead.id}
                    className="rounded-2xl border border-[rgba(168,33,27,0.12)] bg-white p-4 shadow-sm"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-gray-800">
                          {lead.firstName} {lead.lastName}
                        </p>
                        <p className="text-xs uppercase tracking-wide text-gray-500">
                          Source: {lead.source.replace(/_/g, ' ')} • Next follow-up {toDisplayDate(lead.nextFollowUpDate)}
                        </p>
                        <p className="text-xs text-gray-600">
                          Requirement: {requirement} • {budget}
                        </p>
                        <div className="text-xs text-gray-500">
                          {siteVisitLabel} • Last contact {toDisplayDate(lead.lastContactedAt)}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge className={getPriorityBadge(lead.priority)}>{lead.priority}</Badge>
                        <span className="text-xs text-gray-500">Status: {lead.status}</span>
                        <a
                          href={`tel:${lead.phone}`}
                          className="text-xs font-semibold text-[#A8211B] hover:underline"
                        >
                          Call now
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
            <CardFooter className="pt-1">
              <Button asChild variant="ghost" size="sm" className="justify-start px-0 text-[#A8211B]">
                <Link href="/leads">Open Leads Board</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card
            style={{
              backgroundColor: brandPalette.surface,
              border: '1px solid rgba(168,33,27,0.08)',
            }}
          >
            <CardHeader className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle className="text-base font-semibold text-gray-800">
                  My assigned leads
                </CardTitle>
                <CardDescription>
                  Quick glance at who is waiting on you right now.
                </CardDescription>
              </div>
              {assignedLoading && (
                <div className="inline-flex items-center gap-2 text-xs text-gray-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Updating
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              {assignedError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
                  {assignedError}
                </div>
              )}

              {!assignedLoading && !assignedError && (assignedLeads || []).length === 0 && (
                <div className="rounded-2xl border border-dashed border-[#A8211B]/20 bg-white/80 px-4 py-6 text-center text-sm text-gray-500">
                  Leads are yet to be assigned to you. Speak to your Sales GM for allocations.
                </div>
              )}

              {((assignedLeads || [])).map((lead) => (
                <div
                  key={lead.id}
                  className="rounded-xl border border-[rgba(168,33,27,0.12)] bg-white px-4 py-3 shadow-sm"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        {lead.firstName} {lead.lastName}{' '}
                        <span className="text-xs text-gray-500">
                          ({lead.source.replace(/_/g, ' ')})
                        </span>
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                        <Badge className="bg-[rgba(168,33,27,0.12)] text-[#7B1E12]">
                          {lead.status.replace(/_/g, ' ')}
                        </Badge>
                        {lead.nextFollowUpDate && (
                          <span>
                            Next follow-up: {toDisplayDate(lead.nextFollowUpDate)}
                          </span>
                        )}
                        {lead.followUpNotes && (
                          <span>Note: {lead.followUpNotes}</span>
                        )}
                      </div>
                      <p className="mt-2 text-xs text-gray-500">
                        Last contacted: {toDisplayDate(lead.lastContactedAt)} · Budget{' '}
                        {lead.budgetMin
                          ? `₹${formatIndianNumber(lead.budgetMin)}+`
                          : 'Not shared yet'}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {lead.phone && (
                        <Button asChild size="sm">
                          <a href={`tel:${lead.phone}`}>
                            <Phone className="mr-2 h-4 w-4" />
                            Call
                          </a>
                        </Button>
                      )}
                      <Button
                        asChild
                        size="sm"
                        variant="outline"
                        className="border-[#A8211B] text-[#A8211B]"
                      >
                        <Link href={`/leads/${lead.id}`}>View lead</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Tasks & Upcoming Events */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Today's Tasks */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Today's Tasks ({metrics.tasks.dueToday})
                </CardTitle>
                {metrics.tasks.overdue > 0 && (
                  <CardDescription className="text-red-600">
                    {metrics.tasks.overdue} overdue tasks need attention!
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {metrics.upcomingEvents.tasks.slice(0, 5).map((task, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 border rounded hover:bg-gray-50"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium">{task.title}</p>
                        <p className="text-xs text-gray-500">
                          {task.time || 'No time set'} • {task.taskType}
                        </p>
                      </div>
                      <Badge className={getPriorityBadge(task.priority)}>
                        {task.priority}
                      </Badge>
                    </div>
                  ))}
                  {(metrics.upcomingEvents.tasks || []).length === 0 && (
                    <p className="text-center text-gray-500 py-4">No tasks for today</p>
                  )}
                </div>
                <Link href="/sales/tasks">
                  <Button variant="outline" className="w-full mt-4">
                    View All Tasks
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Upcoming Site Visits */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Upcoming Site Visits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {(metrics.upcomingEvents.siteVisits || []).map((visit, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 border rounded hover:bg-gray-50"
                    >
                      <div>
                        <p className="text-sm font-medium">
                          {visit.leadName || 'Lead confirmation pending'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {toDisplayDate(visit.date)} {visit.time && `· ${visit.time}`}
                        </p>
                        {visit.property && (
                          <p className="text-xs text-blue-600">{visit.property}</p>
                        )}
                      </div>
                    </div>
                  ))}
                  {(metrics.upcomingEvents.siteVisits || []).length === 0 && (
                    <p className="text-center text-gray-500 py-4">No upcoming site visits</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lead Sources Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Lead Sources
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(metrics.leads.bySource).map(([source, count]) => (
                  <div key={source} className="text-center p-3 border rounded">
                    <p className="text-2xl font-bold text-blue-600">{count}</p>
                    <p className="text-xs text-gray-600 mt-1">{source}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Task Management</CardTitle>
              <CardDescription>
                Completion Rate: {metrics.tasks.completionRate.toFixed(1)}%
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-4 mb-4">
                <div className="text-center p-3 border rounded">
                  <p className="text-2xl font-bold">{metrics.tasks.dueToday}</p>
                  <p className="text-xs text-gray-600">Today</p>
                </div>
                <div className="text-center p-3 border rounded">
                  <p className="text-2xl font-bold">{metrics.tasks.dueThisWeek}</p>
                  <p className="text-xs text-gray-600">This Week</p>
                </div>
                <div className="text-center p-3 border rounded">
                  <p className="text-2xl font-bold text-red-600">{metrics.tasks.overdue}</p>
                  <p className="text-xs text-gray-600">Overdue</p>
                </div>
                <div className="text-center p-3 border rounded">
                  <p className="text-2xl font-bold text-green-600">{metrics.tasks.completedToday}</p>
                  <p className="text-xs text-gray-600">Done Today</p>
                </div>
                <div className="text-center p-3 border rounded">
                  <p className="text-2xl font-bold">{metrics.tasks.completionRate.toFixed(0)}%</p>
                  <p className="text-xs text-gray-600">Completion</p>
                </div>
              </div>
              <Link href="/sales/tasks">
                <Button className="w-full">Manage All Tasks</Button>
              </Link>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Follow-ups Tab */}
        <TabsContent value="followups" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Follow-up Schedule</CardTitle>
              <CardDescription>
                {metrics.followups.completedThisMonth} follow-ups completed this month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {metrics.upcomingEvents.followups.slice(0, 10).map((followup, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 border rounded hover:bg-gray-50"
                  >
                    <div>
                      <p className="font-medium">{followup.leadName}</p>
                      <p className="text-sm text-gray-500">
                        {toDisplayDate(followup.date)}
                      </p>
                      {followup.plan && (
                        <p className="text-xs text-blue-600 mt-1">{followup.plan}</p>
                      )}
                    </div>
                    <Link href="/sales/follow-ups">
                      <Button size="sm" variant="outline">
                        <PhoneCall className="h-4 w-4 mr-1" />
                        Call
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
              <Link href="/sales/follow-ups">
                <Button className="w-full mt-4">Manage All Follow-ups</Button>
              </Link>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activities Tab */}
        <TabsContent value="activities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {metrics.recentActivities.slice(0, 15).map((activity, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-2 border-b last:border-0">
                    <div className="mt-1">
                      {activity.type === 'followup' ? (
                        <PhoneCall className="h-4 w-4 text-blue-600" />
                      ) : (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.title}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.date).toLocaleString()}
                      </p>
                      {activity.feedback && (
                        <p className="text-xs text-gray-600 mt-1">{activity.feedback}</p>
                      )}
                    </div>
                    {activity.outcome && (
                      <Badge variant="outline" className="text-xs">
                        {activity.outcome}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Mobile Floating Action Button */}
      <MobileFAB />
    </div>
  );
}
