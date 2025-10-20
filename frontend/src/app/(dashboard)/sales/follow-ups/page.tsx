/**
 * @file sales/follow-ups/page.tsx
 * @description Follow-ups Management - Track all lead interactions and follow-ups
 */

'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { followupsService } from '@/services/followups.service';
import { FollowUp, FollowUpOutcome } from '@/types/sales-crm.types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Phone, 
  Mail, 
  Video, 
  MessageSquare, 
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  Filter,
  Plus,
  Users
} from 'lucide-react';
import { format } from 'date-fns';
import { brandPalette } from '@/utils/brand';

export default function FollowUpsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'today' | 'upcoming' | 'completed'>('all');

  useEffect(() => {
    if (user?.id) {
      loadFollowUps();
    }
  }, [user?.id]);

  const loadFollowUps = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await followupsService.findBySalesPerson(user.id);
      const sorted = Array.isArray(data)
        ? [...data].sort(
            (a, b) =>
              new Date(b.followUpDate).getTime() - new Date(a.followUpDate).getTime()
          )
        : [];
      setFollowUps(sorted);
    } catch (err) {
      console.error('Error loading follow-ups:', err);
      setError(err instanceof Error ? err.message : 'Failed to load follow-ups');
    } finally {
      setLoading(false);
    }
  };

  const getFollowUpIcon = (type: string) => {
    switch (type) {
      case 'CALL': return <Phone className="h-4 w-4" />;
      case 'EMAIL': return <Mail className="h-4 w-4" />;
      case 'MEETING': return <Video className="h-4 w-4" />;
      case 'WHATSAPP': return <MessageSquare className="h-4 w-4" />;
      case 'SITE_VISIT': return <Calendar className="h-4 w-4" />;
      default: return <Phone className="h-4 w-4" />;
    }
  };

  const getOutcomeColor = (outcome: FollowUpOutcome | string) => {
    switch (outcome) {
      case FollowUpOutcome.CONVERTED:
      case FollowUpOutcome.INTERESTED:
        return 'bg-green-100 text-green-800';
      case FollowUpOutcome.SITE_VISIT_SCHEDULED:
      case FollowUpOutcome.DOCUMENTATION_REQUESTED:
      case FollowUpOutcome.PRICE_NEGOTIATION:
      case FollowUpOutcome.NEEDS_TIME:
      case FollowUpOutcome.CALLBACK_REQUESTED:
        return 'bg-blue-100 text-blue-800';
      case FollowUpOutcome.NOT_INTERESTED:
      case FollowUpOutcome.LOST:
        return 'bg-red-100 text-red-800';
      case FollowUpOutcome.NOT_REACHABLE:
      case FollowUpOutcome.WRONG_NUMBER:
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredFollowUps = followUps.filter(followUp => {
    const followUpDate = new Date(followUp.followUpDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (filter) {
      case 'today':
        return followUpDate.toDateString() === today.toDateString();
      case 'upcoming':
        return followUp.nextFollowUpDate && new Date(followUp.nextFollowUpDate) > today;
      case 'completed':
        return [
          FollowUpOutcome.CONVERTED,
          FollowUpOutcome.NOT_INTERESTED,
          FollowUpOutcome.LOST,
        ].includes(followUp.outcome as FollowUpOutcome);
      default:
        return true;
    }
  });

  const stats = useMemo(() => {
    const today = new Date().toDateString();
    return {
      total: followUps.length,
      today: followUps.filter(f => new Date(f.followUpDate).toDateString() === today).length,
      successful: followUps.filter(f =>
        [FollowUpOutcome.CONVERTED, FollowUpOutcome.INTERESTED].includes(
          f.outcome as FollowUpOutcome
        )
      ).length,
      pending: followUps.filter(f => f.nextFollowUpDate && new Date(f.nextFollowUpDate) > new Date()).length,
    };
  }, [followUps]);

  const formatDisplayDate = (value?: Date | string | null, withTime = false) => {
    if (!value) return 'Not scheduled';
    const parsed = typeof value === 'string' ? new Date(value) : value;
    if (Number.isNaN(parsed.getTime())) return 'Not scheduled';
    return withTime
      ? format(parsed, 'dd MMM, p')
      : format(parsed, 'dd MMM yyyy');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading follow-ups...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={loadFollowUps}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 md:p-8" style={{ backgroundColor: brandPalette.background }}>
      {/* Hero */}
      <div
        className="rounded-3xl px-6 py-8 text-white shadow-lg"
        style={{ background: 'linear-gradient(135deg, #A8211B 0%, #7B1E12 100%)', boxShadow: '0 24px 55px -32px rgba(168,33,27,0.6)' }}
      >
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3 max-w-2xl">
            <h1 className="text-3xl md:text-4xl font-semibold leading-tight">
              Keep every promise, nurture every relationship.
            </h1>
            <p className="text-white/75 text-sm md:text-base">
              Log calls, meetings, and site visits in under a minute. Colour-coded statuses and due dates help you stay ahead of every customer expectation.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => router.push('/sales/follow-ups/new')}
                className="rounded-2xl bg-[#F2C94C] px-5 py-3 text-sm font-semibold text-[#7B1E12] hover:bg-[#f5d461]"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Follow-up
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/leads')}
                className="rounded-2xl border-white/40 bg-white/15 px-5 py-3 text-sm font-semibold text-white hover:bg-white/20"
              >
                <Users className="mr-2 h-4 w-4" />
                View Leads
              </Button>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:w-80">
            <div className="rounded-2xl bg-white/15 p-4 text-sm">
              <p className="uppercase tracking-wide text-white/60">Due today</p>
              <p className="text-3xl font-semibold">{stats.today}</p>
              <p className="text-white/65 text-xs mt-1">Make contact before 7 PM</p>
            </div>
            <div className="rounded-2xl bg-white/15 p-4 text-sm">
              <p className="uppercase tracking-wide text-white/60">Pending follow-ups</p>
              <p className="text-3xl font-semibold">{stats.pending}</p>
              <p className="text-white/65 text-xs mt-1">Keep interest warm with timely reminders</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Follow-ups</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Phone className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today's Follow-ups</p>
                <p className="text-2xl font-bold">{stats.today}</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Successful</p>
                <p className="text-2xl font-bold text-green-600">{stats.successful}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-500" />
            <div className="flex gap-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                All
              </Button>
              <Button
                variant={filter === 'today' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('today')}
              >
                Today
              </Button>
              <Button
                variant={filter === 'upcoming' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('upcoming')}
              >
                Upcoming
              </Button>
              <Button
                variant={filter === 'completed' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('completed')}
              >
                Completed
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Follow-ups List */}
      <div className="space-y-4">
        {filteredFollowUps.length === 0 ? (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <Phone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No follow-ups found</p>
              <p className="text-gray-500 text-sm mt-2">
                {filter !== 'all' ? 'Try adjusting your filters' : 'Start by adding your first follow-up'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredFollowUps.map((followUp) => {
            const leadName =
              followUp.lead?.firstName || followUp.lead?.lastName
                ? `${followUp.lead?.firstName ?? ''} ${followUp.lead?.lastName ?? ''}`.trim()
                : 'Lead';
            const leadStatus = followUp.lead?.status?.replace(/_/g, ' ') ?? 'Stage pending';
            const leadFeedback =
              followUp.lead?.lastFollowUpFeedback ||
              followUp.lead?.followUpNotes ||
              'No feedback captured yet.';

            return (
              <Card key={followUp.id} className="hover:shadow-lg transition-shadow border border-[rgba(168,33,27,0.08)]">
                <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex gap-4 flex-1">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        {getFollowUpIcon(followUp.followUpType)}
                      </div>
                    </div>
                    
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-lg">
                          {followUp.followUpType.replace(/_/g, ' ')} with{' '}
                          <span className="text-[#A8211B]">{leadName}</span>
                        </h3>
                        <Badge className={getOutcomeColor(followUp.outcome)}>
                          {followUp.outcome.replace(/_/g, ' ')}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {format(new Date(followUp.followUpDate), 'MMM dd, yyyy')}
                        </span>
                      </div>

                      <div className="rounded-xl border border-dashed border-[rgba(168,33,27,0.18)] bg-[#F9F7F3] p-3">
                        <p className="text-xs uppercase tracking-wide text-gray-500">Summary</p>
                        <p className="text-sm text-gray-700 mt-1">
                          {followUp.feedback || 'No notes recorded for this interaction.'}
                        </p>
                      </div>

                      {followUp.customerResponse && (
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm font-medium text-gray-700">Customer Response:</p>
                          <p className="text-sm text-gray-600 mt-1">{followUp.customerResponse}</p>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-4 text-sm">
                        {followUp.interestLevel && (
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-600">
                              Interest: <span className="font-medium">{followUp.interestLevel}</span>
                            </span>
                          </div>
                        )}
                        {followUp.durationMinutes && (
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-600">
                              {followUp.durationMinutes} min
                            </span>
                          </div>
                        )}
                        {followUp.leadStatusAfter && (
                          <div>
                            <span className="text-gray-600">
                              Status: <span className="font-medium">{followUp.leadStatusAfter}</span>
                            </span>
                          </div>
                        )}
                      </div>

                      {followUp.nextFollowUpDate && (
                        <div className="bg-blue-50 p-3 rounded-lg flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-blue-600" />
                          <span className="text-sm text-blue-800">
                            Next follow-up: {formatDisplayDate(followUp.nextFollowUpDate)}
                            {followUp.nextFollowUpPlan && ` — ${followUp.nextFollowUpPlan}`}
                          </span>
                        </div>
                      )}

                      <div className="rounded-xl border p-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="text-xs uppercase tracking-wide text-gray-500">
                            Lead Stage
                          </p>
                          <p className="text-sm font-semibold text-gray-700">{leadStatus}</p>
                          <p className="text-xs text-gray-500 mt-1">Latest feedback: {leadFeedback}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            asChild
                            size="sm"
                            variant="outline"
                            className="border-[#A8211B] text-[#A8211B]"
                          >
                            <Link href={`/leads/${followUp.leadId}`}>View Lead</Link>
                          </Button>
                          {followUp.lead?.phone && (
                            <Button asChild size="sm">
                              <a href={`tel:${followUp.lead.phone}`}>
                                <Phone className="mr-2 h-4 w-4" />
                                Call now
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
