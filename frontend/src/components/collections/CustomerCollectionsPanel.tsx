'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AlertTriangle,
  ArrowRight,
  Loader2,
  PauseCircle,
  ShieldAlert,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  CollectionsRow,
  TIER_COLORS,
  TIER_LABELS,
  collectionsService,
} from '@/services/collections.service';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { HinglishLoader } from '@/components/HinglishLoader';

interface Props {
  customerId: string;
  brandPrimary?: string;
  brandSecondary?: string;
  brandNeutral?: string;
  maxRows?: number;
}

/**
 * Read-only collections view scoped to a single customer.
 *
 * Shows aggregate overdue exposure + the top N open demand drafts with
 * tier badges. Links into the main Collections workstation for actions
 * like Pause / Send / Log contact, keeping this panel side-effect-free.
 */
export function CustomerCollectionsPanel({
  customerId,
  brandPrimary = '#B91C1C',
  brandSecondary = '#1F2937',
  brandNeutral = '#E5E7EB',
  maxRows = 10,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<CollectionsRow[]>([]);
  const [pauseOpen, setPauseOpen] = useState(false);
  const [pausedUntilAt, setPausedUntilAt] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!customerId) return;
    let cancelled = false;
    setLoading(true);
    collectionsService
      .list({ customerId, limit: 100, offset: 0 })
      .then((res) => {
        if (cancelled) return;
        setRows(res.rows ?? []);
      })
      .catch((err: any) => {
        if (cancelled) return;
        toast.error(
          err?.response?.data?.message || 'Failed to load collections for customer',
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [customerId, reloadKey]);

  const agg = useMemo(() => {
    let overdueAmount = 0;
    let overdueCount = 0;
    let pendingAmount = 0;
    let remindersSent = 0;
    let warningsIssued = 0;
    let atRisk = 0;
    let maxOverdueDays = 0;
    for (const r of rows) {
      const amt = Number(r.amount) || 0;
      if (r.status !== 'SENT' && r.status !== 'FAILED') pendingAmount += amt;
      if (r.daysOverdue > 0) {
        overdueAmount += amt;
        overdueCount += 1;
        if (r.daysOverdue > maxOverdueDays) maxOverdueDays = r.daysOverdue;
      }
      remindersSent += Number(r.reminderCount) || 0;
      if (r.cancellationWarningIssuedAt) warningsIssued += 1;
      if (r.tier === 'AT_RISK') atRisk += 1;
    }
    return {
      overdueAmount,
      overdueCount,
      pendingAmount,
      remindersSent,
      warningsIssued,
      atRisk,
      maxOverdueDays,
      total: rows.length,
    };
  }, [rows]);

  // Sort by overdue (desc) then by amount (desc) so the worst-offenders
  // sit at the top of the table.
  const sortedTop = useMemo(() => {
    return [...rows]
      .sort((a, b) => {
        const ao = a.daysOverdue || 0;
        const bo = b.daysOverdue || 0;
        if (ao !== bo) return bo - ao;
        return (Number(b.amount) || 0) - (Number(a.amount) || 0);
      })
      .slice(0, maxRows);
  }, [rows, maxRows]);

  if (loading) {
    return (
      <div
        className="bg-white rounded-2xl border p-6"
        style={{ borderColor: `${brandNeutral}60` }}
      >
        <HinglishLoader context="finance" compact label="Collections la rahe hain…" />
      </div>
    );
  }

  if (!rows.length) {
    return (
      <div
        className="bg-white rounded-2xl border p-6"
        style={{ borderColor: `${brandNeutral}60` }}
      >
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-lg font-semibold" style={{ color: brandSecondary }}>
            Collections
          </h2>
        </div>
        <p className="text-sm text-gray-500">
          No demand drafts yet — nothing pending from this customer.
        </p>
      </div>
    );
  }

  return (
    <div
      className="bg-white rounded-2xl border p-6"
      style={{ borderColor: `${brandNeutral}60` }}
    >
      <div className="flex items-start justify-between mb-4 gap-3 flex-wrap">
        <div>
          <h2 className="text-lg font-semibold" style={{ color: brandSecondary }}>
            Collections
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Demand drafts, reminders, and overdue exposure for this customer.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setPauseOpen(true)}
            className="h-8"
          >
            <PauseCircle className="h-3.5 w-3.5 mr-1.5" />
            Pause reminders
          </Button>
          <button
            type="button"
            onClick={() => router.push(`/collections?customerId=${customerId}`)}
            className="text-xs font-semibold hover:underline inline-flex items-center gap-1"
            style={{ color: brandPrimary }}
          >
            Open workstation
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {pausedUntilAt && (
        <div className="mb-3 rounded-lg border border-blue-200 bg-blue-50 text-blue-900 px-3 py-2 text-xs flex items-center gap-2">
          <PauseCircle className="h-4 w-4" />
          Reminders paused account-wide until{' '}
          <span className="font-semibold">{formatDate(pausedUntilAt)}</span>
        </div>
      )}

      <CustomerPauseDialog
        open={pauseOpen}
        onClose={() => setPauseOpen(false)}
        onConfirm={async (days, note) => {
          setPauseOpen(false);
          try {
            const res = await collectionsService.pauseCustomer(customerId, {
              days,
              note,
            });
            setPausedUntilAt(res.pausedUntil);
            toast.success(
              res.affectedDds > 0
                ? `Paused for ${days} day${days === 1 ? '' : 's'} · ${res.affectedDds} draft${res.affectedDds === 1 ? '' : 's'} stamped`
                : `Reminders paused for ${days} day${days === 1 ? '' : 's'}`,
            );
            setReloadKey((k) => k + 1);
          } catch (err: any) {
            toast.error(
              err?.response?.data?.message || 'Failed to pause reminders',
            );
          }
        }}
      />

      {/* Aggregate tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <Tile
          label="Pending"
          value={formatINR(agg.pendingAmount)}
          sub={`${agg.total} DD${agg.total === 1 ? '' : 's'}`}
          tone="muted"
        />
        <Tile
          label="Overdue"
          value={formatINR(agg.overdueAmount)}
          sub={`${agg.overdueCount} overdue`}
          tone={agg.overdueAmount > 0 ? 'danger' : 'muted'}
        />
        <Tile
          label="Max days late"
          value={agg.maxOverdueDays > 0 ? `${agg.maxOverdueDays}d` : '—'}
          sub={agg.remindersSent > 0 ? `${agg.remindersSent} reminders` : 'no reminders'}
          tone={agg.maxOverdueDays > 30 ? 'danger' : agg.maxOverdueDays > 0 ? 'warning' : 'muted'}
        />
        <Tile
          label="Escalations"
          value={String(agg.atRisk + agg.warningsIssued)}
          sub={
            agg.warningsIssued > 0
              ? `${agg.warningsIssued} warning${agg.warningsIssued === 1 ? '' : 's'}`
              : 'healthy'
          }
          tone={agg.atRisk > 0 ? 'danger' : agg.warningsIssued > 0 ? 'warning' : 'muted'}
        />
      </div>

      {/* Top rows */}
      <div className="overflow-x-auto -mx-2">
        <table className="w-full text-sm">
          <thead className="text-xs uppercase tracking-wide text-gray-500 border-b">
            <tr>
              <th className="text-left py-2 px-2">Draft</th>
              <th className="text-right py-2 px-2">Amount</th>
              <th className="text-left py-2 px-2">Due</th>
              <th className="text-left py-2 px-2">Overdue</th>
              <th className="text-left py-2 px-2">Tier</th>
              <th className="text-left py-2 px-2">Flags</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {sortedTop.map((r) => {
              const paused =
                r.pauseRemindersUntil &&
                new Date(r.pauseRemindersUntil) > new Date();
              return (
                <tr
                  key={r.id}
                  className="border-b last:border-b-0 hover:bg-gray-50"
                >
                  <td className="py-2 px-2 align-top">
                    <div className="font-medium text-gray-900 line-clamp-1">
                      {r.title || 'Demand draft'}
                    </div>
                    <div className="text-[11px] text-gray-500">
                      {r.flatCode || '—'}
                      {r.bookingCode ? ` · ${r.bookingCode}` : ''}
                    </div>
                  </td>
                  <td className="py-2 px-2 align-top text-right font-semibold text-gray-900">
                    {formatINR(Number(r.amount) || 0)}
                  </td>
                  <td className="py-2 px-2 align-top text-gray-700">
                    {formatDate(r.dueDate)}
                  </td>
                  <td className="py-2 px-2 align-top">
                    {r.daysOverdue > 0 ? (
                      <span
                        className={`text-xs font-semibold ${
                          r.daysOverdue > 30 ? 'text-red-700' : 'text-amber-700'
                        }`}
                      >
                        {r.daysOverdue}d
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">on time</span>
                    )}
                  </td>
                  <td className="py-2 px-2 align-top">
                    <span
                      className={`inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-full border ${TIER_COLORS[r.tier]}`}
                    >
                      {TIER_LABELS[r.tier]}
                    </span>
                  </td>
                  <td className="py-2 px-2 align-top">
                    <div className="flex flex-wrap gap-1">
                      {r.isLegacyImport && (
                        <span className="inline-flex items-center text-[10px] rounded bg-slate-100 text-slate-700 px-1.5 py-0.5">
                          Legacy
                        </span>
                      )}
                      {paused && (
                        <span className="inline-flex items-center text-[10px] rounded bg-blue-50 text-blue-700 px-1.5 py-0.5">
                          <PauseCircle className="h-3 w-3 mr-0.5" />
                          Paused
                        </span>
                      )}
                      {r.tier === 'AT_RISK' && (
                        <span className="inline-flex items-center text-[10px] rounded bg-red-100 text-red-800 px-1.5 py-0.5">
                          <ShieldAlert className="h-3 w-3 mr-0.5" />
                          At Risk
                        </span>
                      )}
                      {r.cancellationWarningIssuedAt && (
                        <span className="inline-flex items-center text-[10px] rounded bg-red-50 text-red-700 px-1.5 py-0.5">
                          <AlertTriangle className="h-3 w-3 mr-0.5" />
                          Warning
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-2 px-2 align-top text-right">
                    <Link
                      href={`/collections/${r.id}`}
                      className="text-xs font-semibold hover:underline"
                      style={{ color: brandPrimary }}
                    >
                      Open →
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {rows.length > sortedTop.length && (
        <div className="mt-3 text-right">
          <Link
            href={`/collections?customerId=${customerId}`}
            className="text-xs font-semibold hover:underline"
            style={{ color: brandPrimary }}
          >
            +{rows.length - sortedTop.length} more in workstation →
          </Link>
        </div>
      )}
    </div>
  );
}

function Tile({
  label,
  value,
  sub,
  tone = 'muted',
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: 'muted' | 'warning' | 'danger';
}) {
  const toneClass =
    tone === 'danger'
      ? 'bg-red-50 border-red-200 text-red-900'
      : tone === 'warning'
        ? 'bg-amber-50 border-amber-200 text-amber-900'
        : 'bg-gray-50 border-gray-200 text-gray-800';
  return (
    <div className={`rounded-xl border px-3 py-2.5 ${toneClass}`}>
      <div className="text-[10px] uppercase tracking-wide opacity-70">{label}</div>
      <div className="text-lg font-bold leading-tight mt-0.5">{value}</div>
      {sub && <div className="text-[11px] opacity-70 mt-0.5">{sub}</div>}
    </div>
  );
}

function formatINR(n: number): string {
  if (!Number.isFinite(n)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(n);
}

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function CustomerPauseDialog({
  open,
  onClose,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (days: number, note?: string) => Promise<void> | void;
}) {
  const [days, setDays] = useState('14');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) {
      setDays('14');
      setNote('');
      setBusy(false);
    }
  }, [open]);

  const submit = async () => {
    const d = Number(days);
    if (!Number.isFinite(d) || d < 1 || d > 365) {
      toast.error('Days must be between 1 and 365');
      return;
    }
    setBusy(true);
    try {
      await onConfirm(d, note.trim() || undefined);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Pause all reminders for this customer</DialogTitle>
          <DialogDescription>
            Applies to every open demand draft for this customer, and any DDs
            generated during the pause window will also respect it.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
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
              placeholder="e.g. registration pending, awaiting bank loan approval"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={busy}>
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              `Pause for ${days || '?'} day${days === '1' ? '' : 's'}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default CustomerCollectionsPanel;
