'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  AlertTriangle,
  Building2,
  CheckCircle2,
  Clock,
  Download,
  FileUp,
  Filter,
  Loader2,
  PauseCircle,
  Phone,
  RefreshCw,
  Search,
  Send,
  Settings as SettingsIcon,
  TrendingDown,
  UserCheck,
  Users,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  CollectionsRow,
  CollectionsStats,
  CollectionTier,
  CollectorSummary,
  collectionsService,
  TIER_COLORS,
  TIER_LABELS,
} from '@/services/collections.service';
import { CompanySettings, settingsService } from '@/services/settings.service';
import { usersService } from '@/services/users.service';
import { useAuth } from '@/hooks/useAuth';
import { usePropertyStore } from '@/store/propertyStore';

// Minimal shape we need for the Assign dropdown. We don't pull the full
// user profile, just what labels the option.
interface AssignableUser {
  id: string;
  name: string;
  email: string;
}

const TIER_ORDER: Array<CollectionTier | 'ALL'> = [
  'ALL',
  'AT_RISK',
  'WARNING',
  'POST_WARNING',
  'REMINDER_4',
  'REMINDER_3',
  'REMINDER_2',
  'REMINDER_1',
  'OVERDUE',
  'ON_TRACK',
];

function formatINR(n: number): string {
  if (!Number.isFinite(n)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(n);
}

function formatDate(iso: string | null): string {
  if (!iso) return '-';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

/**
 * Translate the queue picker value (`'ALL' | 'MINE' | 'UNASSIGNED' |
 * <userId>`) into the service-level filter slice so callers don't have
 * to branch on the magic values repeatedly.
 */
function resolveQueueFilter(queue: string): { assigneeId?: string; mine?: boolean } {
  if (!queue || queue === 'ALL') return {};
  if (queue === 'MINE') return { mine: true };
  if (queue === 'UNASSIGNED') return { assigneeId: 'unassigned' };
  return { assigneeId: queue };
}

export default function CollectionsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const currentUserId = (user as any)?.id ?? null;

  // Global top-bar property selector. Follows the same convention as
  // accounting/expenses etc: take the first selected id as the active
  // property. Empty array = "All properties" (no filter applied).
  const { selectedProperties, properties } = usePropertyStore();
  const selectedPropertyId = selectedProperties[0] ?? undefined;
  const selectedPropertyName = selectedPropertyId
    ? properties.find((p) => p.id === selectedPropertyId)?.name
    : undefined;

  // ── Filters ───────────────────────────────
  const [tier, setTier] = useState<CollectionTier | 'ALL'>('ALL');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [legacyOnly, setLegacyOnly] = useState(false);
  // Queue filter: 'ALL' | 'MINE' | 'UNASSIGNED' | <userId>
  const [queue, setQueue] = useState<string>('ALL');
  const [limit] = useState(50);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  // ── Data ───────────────────────────────
  const [rows, setRows] = useState<CollectionsRow[]>([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<CollectionsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [scanRunning, setScanRunning] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkPauseOpen, setBulkPauseOpen] = useState(false);
  const [bulkContactOpen, setBulkContactOpen] = useState(false);
  const [bulkAssignOpen, setBulkAssignOpen] = useState(false);
  const [bulkSending, setBulkSending] = useState(false);
  const [assignees, setAssignees] = useState<CollectorSummary[]>([]);
  const [assignableUsers, setAssignableUsers] = useState<AssignableUser[]>([]);
  const abortRef = useRef<AbortController | null>(null);

  const loadList = useCallback(async () => {
    setLoading(true);
    try {
      const [listRes, statsRes] = await Promise.all([
        collectionsService.list({
          tier: tier === 'ALL' ? undefined : tier,
          search: debouncedSearch || undefined,
          includeLegacyOnly: legacyOnly,
          propertyId: selectedPropertyId,
          ...resolveQueueFilter(queue),
          limit,
          offset,
        }),
        collectionsService.stats({ propertyId: selectedPropertyId }),
      ]);
      setRows(listRes.rows ?? []);
      setTotal(listRes.total ?? 0);
      setStats(statsRes);
    } catch (err: any) {
      console.error('collections load failed', err);
      toast.error(err?.response?.data?.message || 'Failed to load collections');
    } finally {
      setLoading(false);
    }
  }, [
    tier,
    debouncedSearch,
    legacyOnly,
    queue,
    limit,
    offset,
    selectedPropertyId,
  ]);

  // When the top-bar property switches, reset pagination so the user
  // doesn't land on an empty page 3 of a different project.
  useEffect(() => {
    setOffset(0);
  }, [selectedPropertyId]);

  useEffect(() => {
    loadList();
    return () => {
      abortRef.current?.abort();
    };
  }, [loadList]);

  // Load the list of collectors (for queue picker) + full user list (for
  // assign dialog). Collectors are scoped to the active property because
  // different projects have different AR teams; the assignable users
  // dropdown stays global (anyone can be given a DD from any project).
  const loadAssignees = useCallback(async () => {
    try {
      const res = await collectionsService.assignees({
        propertyId: selectedPropertyId,
      });
      setAssignees(res);
      // If the currently-selected queue points at a collector who
      // doesn't work on this property, drop back to "All" so the view
      // isn't silently empty.
      if (
        queue !== 'ALL' &&
        queue !== 'MINE' &&
        queue !== 'UNASSIGNED' &&
        !res.find((a) => a.userId === queue)
      ) {
        setQueue('ALL');
      }
    } catch (err) {
      console.error('failed to load collectors', err);
    }
  }, [selectedPropertyId, queue]);

  useEffect(() => {
    loadAssignees();
  }, [loadAssignees, rows.length]);

  useEffect(() => {
    (async () => {
      try {
        const res = await usersService.getUsers(
          { isActive: true, limit: 200 },
          { forceRefresh: false },
        );
        const items = res?.data ?? [];
        setAssignableUsers(
          items.map((u) => ({
            id: u.id,
            name:
              `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() ||
              u.username ||
              u.email,
            email: u.email,
          })),
        );
      } catch (err) {
        console.error('failed to load assignable users', err);
      }
    })();
  }, []);

  // When the visible page changes (filter/pagination), drop any
  // previously-selected rows that are no longer visible so the bulk
  // bar can't act on an off-screen selection the user can't see.
  useEffect(() => {
    if (!selectedIds.size) return;
    const visibleIds = new Set(rows.map((r) => r.id));
    setSelectedIds((prev) => {
      const next = new Set<string>();
      for (const id of prev) if (visibleIds.has(id)) next.add(id);
      return next;
    });
  }, [rows]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleRow = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };
  const toggleAll = (checked: boolean) => {
    if (!checked) {
      setSelectedIds(new Set());
      return;
    }
    setSelectedIds(new Set(rows.map((r) => r.id)));
  };
  const clearSelection = () => setSelectedIds(new Set());

  const selectedRows = useMemo(
    () => rows.filter((r) => selectedIds.has(r.id)),
    [rows, selectedIds],
  );
  const selectedSendableCount = useMemo(
    () =>
      selectedRows.filter(
        (r) => r.tone !== 'CANCELLATION_WARNING' && r.status !== 'SENT',
      ).length,
    [selectedRows],
  );
  const allVisibleSelected =
    rows.length > 0 && rows.every((r) => selectedIds.has(r.id));
  const someVisibleSelected =
    !allVisibleSelected && rows.some((r) => selectedIds.has(r.id));

  const bulkSend = async () => {
    const ids = selectedRows
      .filter((r) => r.tone !== 'CANCELLATION_WARNING' && r.status !== 'SENT')
      .map((r) => r.id);
    if (!ids.length) {
      toast.info('Nothing to send in the current selection.');
      return;
    }
    if (
      !confirm(
        `Approve (if needed) and send ${ids.length} demand draft${
          ids.length === 1 ? '' : 's'
        } right now? Email + in-app notifications will fire for each.`,
      )
    )
      return;
    setBulkSending(true);
    try {
      const res = await collectionsService.bulkSend(ids);
      const parts: string[] = [];
      if (res.sent.length) parts.push(`${res.sent.length} sent`);
      if (res.skipped.length) parts.push(`${res.skipped.length} skipped`);
      if (res.failed.length) parts.push(`${res.failed.length} failed`);
      const msg = parts.join(', ') || 'No changes';
      if (res.failed.length) toast.error(`Bulk send: ${msg}`);
      else if (res.skipped.length) toast.warning(`Bulk send: ${msg}`);
      else toast.success(`Bulk send: ${msg}`);
      clearSelection();
      loadList();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Bulk send failed');
    } finally {
      setBulkSending(false);
    }
  };

  // ── Actions ───────────────────────────────
  const exportCsv = async () => {
    try {
      // Pull the entire current filter (not just the current page) so the
      // CSV matches what finance sees, and in one request - 10k safety cap.
      const res = await collectionsService.list({
        tier: tier === 'ALL' ? undefined : tier,
        search: debouncedSearch || undefined,
        includeLegacyOnly: legacyOnly,
        propertyId: selectedPropertyId,
        ...resolveQueueFilter(queue),
        limit: 10000,
        offset: 0,
      });
      const all = res.rows || [];
      if (!all.length) {
        toast.info('No rows to export for the current filter.');
        return;
      }
      const cols: Array<[string, (r: CollectionsRow) => string | number]> = [
        ['Title', (r) => r.title || ''],
        ['Customer', (r) => r.customerName || ''],
        ['Phone', (r) => r.customerPhone || ''],
        ['Email', (r) => r.customerEmail || ''],
        ['Property', (r) => r.propertyName || ''],
        ['Unit', (r) => r.flatCode || ''],
        ['Booking', (r) => r.bookingCode || ''],
        ['Tier', (r) => TIER_LABELS[r.tier] || r.tier],
        ['Tone', (r) => r.tone],
        ['Status', (r) => r.status],
        ['Amount (INR)', (r) => Number(r.amount) || 0],
        ['Due Date', (r) => (r.dueDate ? r.dueDate.slice(0, 10) : '')],
        ['Days Overdue', (r) => Number(r.daysOverdue) || 0],
        ['Reminders Sent', (r) => Number(r.reminderCount) || 0],
        ['Last Reminder', (r) => r.lastReminderAt || ''],
        ['Next Reminder Due', (r) => r.nextReminderDueAt || ''],
        ['Warning Issued At', (r) => r.cancellationWarningIssuedAt || ''],
        ['Paused Until', (r) => r.pauseRemindersUntil || ''],
        ['Legacy Import', (r) => (r.isLegacyImport ? 'yes' : 'no')],
        ['Assignee', (r) => r.collectorName || ''],
        ['Assigned At', (r) => r.assignedAt || ''],
        ['DD ID', (r) => r.id],
      ];
      const escape = (val: string | number) => {
        const s = String(val ?? '');
        if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
        return s;
      };
      const header = cols.map(([h]) => escape(h)).join(',');
      const lines = all.map((r) =>
        cols.map(([, fn]) => escape(fn(r))).join(','),
      );
      const csv = [header, ...lines].join('\n');
      const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const ts = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
      const tierSlug = tier === 'ALL' ? 'all' : tier.toLowerCase();
      const propSlug = selectedPropertyName
        ? `-${selectedPropertyName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`
        : '';
      a.href = url;
      a.download = `collections${propSlug}-${tierSlug}-${ts}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(`Exported ${all.length} row${all.length === 1 ? '' : 's'}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Export failed');
    }
  };

  const runScan = async () => {
    setScanRunning(true);
    try {
      const res = await collectionsService.scanNow();
      toast.success(
        `Scan done: ${res.remindersSent} reminders, ${res.warningsPrepared} warnings prepared, ${res.bookingsFlaggedAtRisk} bookings flagged`,
      );
      loadList();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Scan failed');
    } finally {
      setScanRunning(false);
    }
  };

  // Tier filter chips with live counts from stats
  const tierChips = useMemo(() => {
    return TIER_ORDER.map((t) => {
      if (t === 'ALL') {
        return { key: t as 'ALL', label: 'All', count: stats?.ddCount ?? 0 };
      }
      const s = stats?.byTier?.[t as CollectionTier];
      return { key: t as CollectionTier, label: TIER_LABELS[t as CollectionTier], count: s?.count ?? 0 };
    });
  }, [stats]);

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold text-gray-900">Collections Workstation</h1>
            {selectedPropertyName ? (
              <Badge
                variant="outline"
                className="border-red-200 bg-red-50 text-red-800 text-xs"
                title="Scoped by the property picker in the top bar"
              >
                <Building2 className="h-3 w-3 mr-1" />
                {selectedPropertyName}
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="border-slate-200 bg-slate-50 text-slate-600 text-xs"
              >
                <Building2 className="h-3 w-3 mr-1" />
                All properties
              </Badge>
            )}
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {selectedPropertyName
              ? `Demand drafts, reminders, and overdue exposure for ${selectedPropertyName}. Switch the project in the top bar to view another team's queue.`
              : 'Centralised view of every payment that needs a nudge, a warning, or an escalation. Pick a project in the top bar to scope this view to a single collection team.'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/collections/legacy-import">
            <Button variant="outline" size="sm">
              <FileUp className="h-4 w-4 mr-2" />
              Legacy Import
            </Button>
          </Link>
          <Button onClick={exportCsv} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button
            onClick={() => setSettingsOpen(true)}
            variant="outline"
            size="sm"
          >
            <SettingsIcon className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button
            onClick={runScan}
            disabled={scanRunning}
            variant="outline"
            size="sm"
          >
            {scanRunning ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Run Scanner Now
          </Button>
        </div>
      </div>

      <CollectionsSettingsDialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />

      {/* Stats */}
      <StatsRow stats={stats} loading={loading && !stats} />

      {/* Aging buckets */}
      {stats && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Overdue Aging</CardTitle>
            <CardDescription className="text-xs">
              Amount pending by how many days overdue (across the whole portfolio).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
              <AgingCell label="0-7d" bucket={stats.agingBuckets.d_0_7} tone="amber" />
              <AgingCell label="8-30d" bucket={stats.agingBuckets.d_8_30} tone="amber" />
              <AgingCell label="31-90d" bucket={stats.agingBuckets.d_31_90} tone="orange" />
              <AgingCell label="91-180d" bucket={stats.agingBuckets.d_91_180} tone="red" />
              <AgingCell label="181-365d" bucket={stats.agingBuckets.d_181_365} tone="red" />
              <AgingCell label="365d+" bucket={stats.agingBuckets.d_365_plus} tone="red" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filter bar */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            {tierChips.map((c) => {
              const active = tier === c.key;
              return (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => {
                    setTier(c.key);
                    setOffset(0);
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    active
                      ? 'bg-red-600 text-white border-red-700'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {c.label}
                  <span className={`ml-1.5 text-[10px] ${active ? 'text-red-100' : 'text-gray-400'}`}>
                    {c.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Queue / assignee quick switcher */}
          <div className="flex flex-wrap items-center gap-1 border-t pt-3">
            <QueueChip
              label="All"
              active={queue === 'ALL'}
              onClick={() => {
                setQueue('ALL');
                setOffset(0);
              }}
            />
            {currentUserId && (
              <QueueChip
                label="My Queue"
                active={queue === 'MINE'}
                onClick={() => {
                  setQueue('MINE');
                  setOffset(0);
                }}
                hint={(() => {
                  const me = assignees.find((a) => a.userId === currentUserId);
                  return me ? me.assignedCount : 0;
                })()}
              />
            )}
            <QueueChip
              label="Unassigned"
              active={queue === 'UNASSIGNED'}
              onClick={() => {
                setQueue('UNASSIGNED');
                setOffset(0);
              }}
            />
            <div className="mx-1 h-4 w-px bg-gray-200" />
            <Select
              value={queue.startsWith('user:') ? queue.slice(5) : (
                queue !== 'ALL' && queue !== 'MINE' && queue !== 'UNASSIGNED' ? queue : ''
              )}
              onValueChange={(v) => {
                if (!v) return;
                setQueue(v);
                setOffset(0);
              }}
            >
              <SelectTrigger className="h-8 w-[220px] text-xs">
                <SelectValue placeholder="Pick a collector…" />
              </SelectTrigger>
              <SelectContent>
                {assignees.length === 0 && (
                  <div className="px-2 py-1.5 text-xs text-gray-400">
                    No active collectors
                  </div>
                )}
                {assignees.map((a) => (
                  <SelectItem key={a.userId} value={a.userId}>
                    {a.name}
                    <span className="ml-2 text-[10px] text-gray-500">
                      {a.assignedCount} open
                      {a.overdueCount > 0 && ` · ${a.overdueCount} overdue`}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                className="pl-9"
                placeholder="Search customer, booking, unit, phone, email..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setOffset(0);
                }}
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={legacyOnly}
                onChange={(e) => {
                  setLegacyOnly(e.target.checked);
                  setOffset(0);
                }}
                className="h-4 w-4"
              />
              Legacy imports only
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Bulk-action bar */}
      {selectedIds.size > 0 && (
        <div className="sticky top-2 z-20">
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 shadow-sm">
            <div className="text-sm text-red-900">
              <span className="font-semibold">{selectedIds.size}</span>{' '}
              selected
              {selectedSendableCount !== selectedIds.size && (
                <span className="ml-2 text-xs text-red-700">
                  ({selectedSendableCount} eligible to send)
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setBulkPauseOpen(true)}
              >
                <PauseCircle className="h-4 w-4 mr-2" />
                Pause Reminders
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setBulkContactOpen(true)}
              >
                <Phone className="h-4 w-4 mr-2" />
                Log Contact
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setBulkAssignOpen(true)}
              >
                <UserCheck className="h-4 w-4 mr-2" />
                Assign
              </Button>
              <Button
                size="sm"
                onClick={bulkSend}
                disabled={bulkSending || selectedSendableCount === 0}
              >
                {bulkSending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Send {selectedSendableCount || ''}
              </Button>
              <Button size="sm" variant="ghost" onClick={clearSelection}>
                Clear
              </Button>
            </div>
          </div>
        </div>
      )}

      <BulkPauseDialog
        open={bulkPauseOpen}
        onClose={() => setBulkPauseOpen(false)}
        count={selectedIds.size}
        onConfirm={async (days, scope, note) => {
          setBulkPauseOpen(false);
          try {
            const res = await collectionsService.bulkPause({
              ids: Array.from(selectedIds),
              days,
              scope,
              note,
            });
            const failed = res.failed?.length ?? 0;
            const ok = res.ok?.length ?? 0;
            if (failed) {
              toast.error(`Paused ${ok}, ${failed} failed`);
            } else {
              toast.success(
                `Paused reminders on ${ok} row${ok === 1 ? '' : 's'} for ${days} day${days === 1 ? '' : 's'}`,
              );
            }
            clearSelection();
            loadList();
          } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Bulk pause failed');
          }
        }}
      />

      <BulkContactDialog
        open={bulkContactOpen}
        onClose={() => setBulkContactOpen(false)}
        count={selectedIds.size}
        onConfirm={async (channel, note) => {
          setBulkContactOpen(false);
          try {
            const res = await collectionsService.bulkContact({
              ids: Array.from(selectedIds),
              channel,
              note,
            });
            const failed = res.failed?.length ?? 0;
            const ok = res.ok?.length ?? 0;
            if (failed) {
              toast.error(`Logged ${ok} contact${ok === 1 ? '' : 's'}, ${failed} failed`);
            } else {
              toast.success(
                `Logged ${channel} contact on ${ok} row${ok === 1 ? '' : 's'}`,
              );
            }
            clearSelection();
            loadList();
          } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Bulk contact failed');
          }
        }}
      />

      <BulkAssignDialog
        open={bulkAssignOpen}
        onClose={() => setBulkAssignOpen(false)}
        count={selectedIds.size}
        users={assignableUsers}
        currentUserId={currentUserId}
        onConfirm={async (assigneeId) => {
          setBulkAssignOpen(false);
          try {
            const res = await collectionsService.bulkAssign({
              ids: Array.from(selectedIds),
              assigneeId,
            });
            const label = assigneeId
              ? assignableUsers.find((u) => u.id === assigneeId)?.name ||
                'collector'
              : 'nobody (unassigned)';
            toast.success(
              `Assigned ${res.updated} row${res.updated === 1 ? '' : 's'} to ${label}`,
            );
            clearSelection();
            loadList();
            loadAssignees();
          } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Bulk assign failed');
          }
        }}
      />

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : rows.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto mb-3" />
              <p className="text-sm">No demand drafts match these filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="py-3 px-4 w-8">
                      <input
                        type="checkbox"
                        className="h-4 w-4"
                        aria-label="Select all visible rows"
                        checked={allVisibleSelected}
                        ref={(el) => {
                          if (el) el.indeterminate = someVisibleSelected;
                        }}
                        onChange={(e) => toggleAll(e.target.checked)}
                      />
                    </th>
                    <th className="text-left py-3 px-4">Customer / Unit</th>
                    <th className="text-right py-3 px-4">Amount</th>
                    <th className="text-left py-3 px-4">Due</th>
                    <th className="text-left py-3 px-4">Overdue</th>
                    <th className="text-left py-3 px-4">Tier</th>
                    <th className="text-left py-3 px-4">Assignee</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Flags</th>
                    <th className="text-right py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <Row
                      key={r.id}
                      row={r}
                      selected={selectedIds.has(r.id)}
                      onSelectChange={(v) => toggleRow(r.id, v)}
                      onChanged={loadList}
                      onOpen={() => router.push(`/collections/${r.id}`)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {total > limit && (
            <div className="flex items-center justify-between px-4 py-3 border-t text-sm text-gray-600">
              <span>
                {offset + 1}-{Math.min(offset + limit, total)} of {total}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={offset === 0}
                  onClick={() => setOffset(Math.max(0, offset - limit))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={offset + limit >= total}
                  onClick={() => setOffset(offset + limit)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─────────────────────────── components ───────────────────────────

function StatsRow({
  stats,
  loading,
}: {
  stats: CollectionsStats | null;
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="h-5 bg-gray-100 rounded w-1/2 mb-2" />
              <div className="h-7 bg-gray-100 rounded w-3/4" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  if (!stats) return null;

  const tiles: Array<{ label: string; value: string; icon: any; tone: string; hint?: string }> = [
    {
      label: 'Overdue AR',
      value: formatINR(stats.totalOverdueAmount),
      icon: TrendingDown,
      tone: 'text-red-600',
      hint: `${stats.overdueCount} DDs past due`,
    },
    {
      label: 'Total Pending',
      value: formatINR(stats.totalPendingAmount),
      icon: Clock,
      tone: 'text-amber-600',
      hint: `${stats.ddCount} DDs outstanding`,
    },
    {
      label: 'At-Risk Bookings',
      value: String(stats.atRiskBookingCount),
      icon: AlertTriangle,
      tone: 'text-red-700',
      hint: 'Flagged for cancellation review',
    },
    {
      label: 'Warnings Pending Send',
      value: String(stats.draftWarningsPending),
      icon: Send,
      tone: 'text-orange-600',
      hint: 'DRAFT cancellation letters awaiting review',
    },
    {
      label: 'Legacy Overdue',
      value: formatINR(stats.legacyOverdueAmount),
      icon: Building2,
      tone: 'text-slate-600',
      hint: 'From imported historical data',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {tiles.map((t) => {
        const Icon = t.icon;
        return (
          <Card key={t.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  {t.label}
                </span>
                <Icon className={`h-4 w-4 ${t.tone}`} />
              </div>
              <div className={`text-xl font-bold ${t.tone}`}>{t.value}</div>
              {t.hint && <div className="text-[11px] text-gray-500 mt-1">{t.hint}</div>}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function AgingCell({
  label,
  bucket,
  tone,
}: {
  label: string;
  bucket: { count: number; amount: number };
  tone: 'amber' | 'orange' | 'red';
}) {
  const classMap: Record<string, string> = {
    amber: 'bg-amber-50 border-amber-200 text-amber-900',
    orange: 'bg-orange-50 border-orange-200 text-orange-900',
    red: 'bg-red-50 border-red-200 text-red-900',
  };
  return (
    <div className={`rounded-lg border p-3 ${classMap[tone]}`}>
      <div className="text-[11px] font-semibold uppercase tracking-wide opacity-70">{label}</div>
      <div className="text-lg font-bold mt-0.5">{formatINR(bucket.amount)}</div>
      <div className="text-[11px] opacity-70">{bucket.count} DDs</div>
    </div>
  );
}

function Row({
  row,
  onChanged,
  onOpen,
  selected,
  onSelectChange,
}: {
  row: CollectionsRow;
  onChanged: () => void;
  onOpen: () => void;
  selected: boolean;
  onSelectChange: (checked: boolean) => void;
}) {
  const [pauseOpen, setPauseOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const tierClass = TIER_COLORS[row.tier];
  const isDraftWarning = row.status === 'DRAFT' && row.tone === 'CANCELLATION_WARNING';

  const sendWarning = async () => {
    if (!confirm('Send this cancellation warning letter to the customer now? This action is final.'))
      return;
    setBusy(true);
    try {
      await collectionsService.sendWarning(row.id);
      toast.success('Cancellation warning sent');
      onChanged();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to send warning');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <tr className={`border-b hover:bg-gray-50 ${selected ? 'bg-red-50/40' : ''}`}>
        <td className="py-3 px-4 align-top w-8">
          <input
            type="checkbox"
            className="h-4 w-4"
            aria-label={`Select ${row.customerName || 'row'}`}
            checked={selected}
            onChange={(e) => onSelectChange(e.target.checked)}
          />
        </td>
        <td className="py-3 px-4 align-top">
          <button
            type="button"
            onClick={onOpen}
            className="text-left hover:underline font-medium text-gray-900"
          >
            {row.customerName || 'Unnamed customer'}
          </button>
          <div className="text-xs text-gray-500 mt-0.5">
            {row.flatCode || '-'}
            {row.bookingCode ? <span className="ml-1 text-gray-400">· {row.bookingCode}</span> : null}
          </div>
          {row.customerPhone && (
            <div className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-1">
              <Phone className="h-3 w-3" />
              {row.customerPhone}
            </div>
          )}
        </td>
        <td className="py-3 px-4 align-top text-right font-semibold text-gray-900">
          {formatINR(row.amount)}
        </td>
        <td className="py-3 px-4 align-top text-gray-700">
          {formatDate(row.dueDate)}
        </td>
        <td className="py-3 px-4 align-top">
          {row.daysOverdue > 0 ? (
            <span
              className={`text-sm font-semibold ${
                row.daysOverdue > 30 ? 'text-red-700' : 'text-amber-700'
              }`}
            >
              {row.daysOverdue}d
            </span>
          ) : (
            <span className="text-xs text-gray-400">on time</span>
          )}
        </td>
        <td className="py-3 px-4 align-top">
          <Badge variant="outline" className={`${tierClass} border`}>
            {TIER_LABELS[row.tier]}
          </Badge>
        </td>
        <td className="py-3 px-4 align-top text-xs">
          {row.collectorName ? (
            <span className="inline-flex items-center gap-1 text-gray-700">
              <UserCheck className="h-3 w-3 text-emerald-600" />
              {row.collectorName}
            </span>
          ) : (
            <span className="text-[11px] italic text-gray-400">Unassigned</span>
          )}
        </td>
        <td className="py-3 px-4 align-top text-xs text-gray-600">
          <div>{row.status}</div>
          {row.reminderCount > 0 && (
            <div className="text-[10px] text-gray-400 mt-0.5">{row.reminderCount} reminders sent</div>
          )}
        </td>
        <td className="py-3 px-4 align-top">
          <div className="flex flex-wrap gap-1">
            {row.isLegacyImport && (
              <span className="inline-flex items-center text-[10px] rounded bg-slate-100 text-slate-700 px-1.5 py-0.5">
                Legacy
              </span>
            )}
            {row.pauseRemindersUntil && new Date(row.pauseRemindersUntil) > new Date() && (
              <span className="inline-flex items-center text-[10px] rounded bg-blue-50 text-blue-700 px-1.5 py-0.5">
                <PauseCircle className="h-3 w-3 mr-0.5" />
                Paused
              </span>
            )}
            {isDraftWarning && (
              <span className="inline-flex items-center text-[10px] rounded bg-red-100 text-red-800 px-1.5 py-0.5">
                <AlertCircle className="h-3 w-3 mr-0.5" />
                Awaiting send
              </span>
            )}
          </div>
        </td>
        <td className="py-3 px-4 align-top text-right">
          <div className="inline-flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={onOpen}>
              Open
            </Button>
            <Button
              variant="ghost"
              size="sm"
              title="Log contact attempt"
              onClick={() => setContactOpen(true)}
            >
              <Phone className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              title="Pause reminders"
              onClick={() => setPauseOpen(true)}
            >
              <PauseCircle className="h-4 w-4" />
            </Button>
            {isDraftWarning && (
              <Button
                size="sm"
                variant="destructive"
                disabled={busy}
                onClick={sendWarning}
              >
                {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Send Warning'}
              </Button>
            )}
          </div>
        </td>
      </tr>

      <PauseDialog
        open={pauseOpen}
        onClose={() => setPauseOpen(false)}
        row={row}
        onDone={() => {
          setPauseOpen(false);
          onChanged();
        }}
      />
      <ContactDialog
        open={contactOpen}
        onClose={() => setContactOpen(false)}
        row={row}
        onDone={() => {
          setContactOpen(false);
          onChanged();
        }}
      />
    </>
  );
}

function PauseDialog({
  open,
  onClose,
  row,
  onDone,
}: {
  open: boolean;
  onClose: () => void;
  row: CollectionsRow;
  onDone: () => void;
}) {
  const [days, setDays] = useState('14');
  const [scope, setScope] = useState<'plan' | 'customer'>('plan');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    const d = Number(days);
    if (!Number.isFinite(d) || d < 1) {
      toast.error('Days must be a positive number');
      return;
    }
    setBusy(true);
    try {
      await collectionsService.pause(row.id, { days: d, scope, note: note.trim() || undefined });
      toast.success(`Reminders paused for ${d} days`);
      onDone();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to pause reminders');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Pause reminders</DialogTitle>
          <DialogDescription>
            {row.customerName || 'this customer'} · {row.flatCode || 'no unit'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Scope</Label>
            <Select value={scope} onValueChange={(v) => setScope(v as 'plan' | 'customer')}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="plan">This booking only</SelectItem>
                <SelectItem value="customer">Entire customer (all bookings)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Pause for (days)</Label>
            <Input
              type="number"
              min={1}
              max={365}
              value={days}
              onChange={(e) => setDays(e.target.value)}
            />
          </div>
          <div>
            <Label>Reason / note (optional)</Label>
            <Textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. customer on travel till end of month"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={busy}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Pause reminders'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ContactDialog({
  open,
  onClose,
  row,
  onDone,
}: {
  open: boolean;
  onClose: () => void;
  row: CollectionsRow;
  onDone: () => void;
}) {
  const [channel, setChannel] = useState<'phone' | 'email' | 'sms' | 'visit' | 'other'>('phone');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!note.trim()) {
      toast.error('Please add a short note');
      return;
    }
    setBusy(true);
    try {
      await collectionsService.recordContact(row.id, { channel, note: note.trim() });
      toast.success('Contact logged');
      setNote('');
      onDone();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to log contact');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Log contact attempt</DialogTitle>
          <DialogDescription>
            {row.customerName || 'Customer'} · {formatINR(row.amount)}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Channel</Label>
            <Select value={channel} onValueChange={(v) => setChannel(v as any)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="phone">Phone</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="sms">SMS / WhatsApp</SelectItem>
                <SelectItem value="visit">Site visit</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Note</Label>
            <Textarea
              rows={4}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. spoke to customer, promised payment by Friday"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={busy}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Log contact'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CollectionsSettingsDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    settingsService
      .getCompanySettings()
      .then((s) => setSettings(s))
      .catch((err) => toast.error(err?.response?.data?.message || 'Failed to load settings'))
      .finally(() => setLoading(false));
  }, [open]);

  const patch = (patch: Partial<CompanySettings>) =>
    setSettings((s) => (s ? ({ ...s, ...patch } as CompanySettings) : s));

  const save = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      await settingsService.updateCompanySettings({
        overdueReminderIntervalDays: Number(settings.overdueReminderIntervalDays ?? 7),
        cancellationWarningThresholdDays: Number(
          settings.cancellationWarningThresholdDays ?? 30,
        ),
        legacyAutoRemindMaxAgeDays: Number(settings.legacyAutoRemindMaxAgeDays ?? 180),
        overdueReminderDailyCap: Number(settings.overdueReminderDailyCap ?? 50),
        enableSmsReminders: !!settings.enableSmsReminders,
        autoSendMilestoneDemandDrafts: !!settings.autoSendMilestoneDemandDrafts,
      });
      toast.success('Collections settings saved');
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Collections Settings</DialogTitle>
          <DialogDescription>
            Tune how the 09:00 IST overdue scanner escalates unpaid demand drafts.
          </DialogDescription>
        </DialogHeader>
        {loading || !settings ? (
          <div className="py-6 flex items-center gap-2 text-sm text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading current settings…
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
            <Field
              label="Reminder interval (days)"
              hint="Gap between consecutive automated reminders."
            >
              <Input
                type="number"
                min={1}
                max={60}
                value={settings.overdueReminderIntervalDays ?? 7}
                onChange={(e) =>
                  patch({ overdueReminderIntervalDays: Number(e.target.value) })
                }
              />
            </Field>
            <Field
              label="Warning threshold (days)"
              hint="Days overdue that trigger the cancellation warning letter."
            >
              <Input
                type="number"
                min={7}
                max={180}
                value={settings.cancellationWarningThresholdDays ?? 30}
                onChange={(e) =>
                  patch({
                    cancellationWarningThresholdDays: Number(e.target.value),
                  })
                }
              />
            </Field>
            <Field
              label="Legacy auto-remind cutoff (days)"
              hint="Legacy plans with overdues older than this stay silent until a human enables reminders."
            >
              <Input
                type="number"
                min={30}
                max={3650}
                value={settings.legacyAutoRemindMaxAgeDays ?? 180}
                onChange={(e) =>
                  patch({ legacyAutoRemindMaxAgeDays: Number(e.target.value) })
                }
              />
            </Field>
            <Field
              label="Daily send cap"
              hint="Max reminders/warnings the scanner may send per run."
            >
              <Input
                type="number"
                min={5}
                max={1000}
                value={settings.overdueReminderDailyCap ?? 50}
                onChange={(e) =>
                  patch({ overdueReminderDailyCap: Number(e.target.value) })
                }
              />
            </Field>
            <Field
              label="SMS reminders"
              hint="Send SMS in addition to email + in-app (requires provider)."
              className="sm:col-span-2"
            >
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={!!settings.enableSmsReminders}
                  onChange={(e) => patch({ enableSmsReminders: e.target.checked })}
                />
                Enable SMS delivery
              </label>
            </Field>
            <Field
              label="Auto-send milestone DDs"
              hint="Company-wide default. Individual projects and customers can override this on their edit pages."
              className="sm:col-span-2"
            >
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={!!settings.autoSendMilestoneDemandDrafts}
                  onChange={(e) =>
                    patch({ autoSendMilestoneDemandDrafts: e.target.checked })
                  }
                />
                Auto-send new demand drafts (skip review)
              </label>
              <p className="text-[11px] text-gray-500 mt-1">
                When ON, every milestone-triggered DD is created as SENT and
                emailed immediately. When OFF (default), DDs land in the
                Workstation as DRAFT for a human to click Send Now.
              </p>
            </Field>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={save} disabled={saving || loading || !settings}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save settings'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  hint,
  className,
  children,
}: {
  label: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <Label className="text-xs uppercase tracking-wide text-gray-500">{label}</Label>
      <div className="mt-1">{children}</div>
      {hint && <p className="text-[11px] text-gray-500 mt-1">{hint}</p>}
    </div>
  );
}

function BulkPauseDialog({
  open,
  onClose,
  count,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  count: number;
  onConfirm: (days: number, scope: 'plan' | 'customer', note?: string) => Promise<void> | void;
}) {
  const [days, setDays] = useState('14');
  const [scope, setScope] = useState<'plan' | 'customer'>('plan');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) {
      setDays('14');
      setScope('plan');
      setNote('');
      setBusy(false);
    }
  }, [open]);

  const submit = async () => {
    const d = Number(days);
    if (!Number.isFinite(d) || d < 1) {
      toast.error('Days must be a positive number');
      return;
    }
    setBusy(true);
    try {
      await onConfirm(d, scope, note.trim() || undefined);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Pause reminders on {count} row{count === 1 ? '' : 's'}</DialogTitle>
          <DialogDescription>
            Applies the same pause to every selected demand draft. Customer-scope also
            pauses every other booking of that customer.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Scope</Label>
            <Select value={scope} onValueChange={(v) => setScope(v as 'plan' | 'customer')}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="plan">Per booking (only the selected DD)</SelectItem>
                <SelectItem value="customer">Per customer (all their bookings)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Pause for (days)</Label>
            <Input
              type="number"
              min={1}
              max={365}
              value={days}
              onChange={(e) => setDays(e.target.value)}
            />
          </div>
          <div>
            <Label>Reason / note (optional)</Label>
            <Textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. festive season freeze, registration pending"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={busy || count === 0}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : `Pause ${count} row${count === 1 ? '' : 's'}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function BulkContactDialog({
  open,
  onClose,
  count,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  count: number;
  onConfirm: (
    channel: 'phone' | 'email' | 'sms' | 'visit' | 'other',
    note: string,
  ) => Promise<void> | void;
}) {
  const [channel, setChannel] = useState<'phone' | 'email' | 'sms' | 'visit' | 'other'>('phone');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) {
      setChannel('phone');
      setNote('');
      setBusy(false);
    }
  }, [open]);

  const submit = async () => {
    if (!note.trim()) {
      toast.error('Please add a short note describing the conversation');
      return;
    }
    setBusy(true);
    try {
      await onConfirm(channel, note.trim());
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Log contact on {count} row{count === 1 ? '' : 's'}
          </DialogTitle>
          <DialogDescription>
            Records the same contact attempt on every selected demand draft.
            Useful when one conversation covered several overdue drafts.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Channel</Label>
            <Select
              value={channel}
              onValueChange={(v) =>
                setChannel(v as 'phone' | 'email' | 'sms' | 'visit' | 'other')
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="phone">Phone call</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="sms">SMS / WhatsApp</SelectItem>
                <SelectItem value="visit">Site / office visit</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Note</Label>
            <Textarea
              rows={4}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Spoke with customer, will clear dues by 20th Apr"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={busy || count === 0}>
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              `Log on ${count} row${count === 1 ? '' : 's'}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Small pill-shaped button for the queue quick-switcher (All / My Queue
 * / Unassigned). Kept lightweight so the filter bar doesn't grow tall.
 */
function QueueChip({
  label,
  active,
  onClick,
  hint,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  hint?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
        active
          ? 'bg-slate-900 text-white border-slate-900'
          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
      }`}
    >
      {label}
      {typeof hint === 'number' && hint > 0 && (
        <span
          className={`ml-1.5 text-[10px] ${
            active ? 'text-slate-300' : 'text-gray-400'
          }`}
        >
          {hint}
        </span>
      )}
    </button>
  );
}

/**
 * Bulk-assignment dialog. Lets the user pick any active user (plus
 * "Assign to me" and "Unassign") and applies it in one call. We also
 * include users who already have assignments in the top section of the
 * dropdown for quick re-assignment.
 */
function BulkAssignDialog({
  open,
  onClose,
  count,
  users,
  currentUserId,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  count: number;
  users: AssignableUser[];
  currentUserId: string | null;
  onConfirm: (assigneeId: string | null) => Promise<void> | void;
}) {
  const [value, setValue] = useState<string>('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) {
      setValue('');
      setBusy(false);
    }
  }, [open]);

  const submit = async () => {
    if (!value) {
      toast.error('Pick a collector, or choose Unassign');
      return;
    }
    const assigneeId =
      value === 'UNASSIGN' ? null : value === 'ME' ? currentUserId : value;
    if (value === 'ME' && !currentUserId) {
      toast.error('Could not determine your user id; please sign in again.');
      return;
    }
    setBusy(true);
    try {
      await onConfirm(assigneeId);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Assign {count} row{count === 1 ? '' : 's'}
          </DialogTitle>
          <DialogDescription>
            Route these demand drafts to a collector. They will show up in
            that collector&apos;s &ldquo;My Queue&rdquo; tab immediately.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Assign to</Label>
            <Select value={value} onValueChange={setValue}>
              <SelectTrigger>
                <SelectValue placeholder="Pick a user…" />
              </SelectTrigger>
              <SelectContent>
                {currentUserId && (
                  <SelectItem value="ME">Assign to me</SelectItem>
                )}
                <SelectItem value="UNASSIGN">
                  Unassign (remove collector)
                </SelectItem>
                {users.length > 0 && (
                  <div className="px-2 py-1 text-[10px] uppercase tracking-wide text-gray-400">
                    Team
                  </div>
                )}
                {users
                  .filter((u) => u.id !== currentUserId)
                  .map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name}
                      <span className="ml-2 text-[10px] text-gray-500">
                        {u.email}
                      </span>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={busy || count === 0 || !value}>
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : value === 'UNASSIGN' ? (
              `Unassign ${count} row${count === 1 ? '' : 's'}`
            ) : (
              `Assign ${count} row${count === 1 ? '' : 's'}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
