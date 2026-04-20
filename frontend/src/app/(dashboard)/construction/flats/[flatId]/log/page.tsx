'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  Hammer,
  Loader2,
  Save,
  X,
  Zap,
  History,
  Coins,
  AlertTriangle,
  FileText,
  Lock,
  Banknote,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { flatsService, type Flat } from '@/services/flats.service';
import { apiService } from '@/services/api';
import { HinglishLoader } from '@/components/HinglishLoader';

type PhaseValue = 'FOUNDATION' | 'STRUCTURE' | 'MEP' | 'FINISHING' | 'HANDOVER';
type StatusValue = 'NOT_STARTED' | 'IN_PROGRESS' | 'ON_HOLD' | 'COMPLETED';

const PHASES: { value: PhaseValue; label: string; short: string }[] = [
  { value: 'FOUNDATION', label: 'Foundation', short: 'Foundation' },
  { value: 'STRUCTURE', label: 'Structure', short: 'Structure' },
  { value: 'MEP', label: 'MEP', short: 'MEP' },
  { value: 'FINISHING', label: 'Finishing', short: 'Finishing' },
  { value: 'HANDOVER', label: 'Handover', short: 'Handover' },
];

const STATUSES: { value: StatusValue; label: string }[] = [
  { value: 'NOT_STARTED', label: 'Not started' },
  { value: 'IN_PROGRESS', label: 'In progress' },
  { value: 'ON_HOLD', label: 'On hold' },
  { value: 'COMPLETED', label: 'Completed' },
];

interface FlatProgressRow {
  id: string;
  phase: string;
  phaseProgress: number;
  overallProgress: number;
  status: string;
  notes?: string | null;
  photos?: string[] | null;
  updatedAt?: string;
}

interface PaymentPlanMilestone {
  sequence: number;
  name: string;
  constructionPhase:
    | 'FOUNDATION'
    | 'STRUCTURE'
    | 'MEP'
    | 'FINISHING'
    | 'HANDOVER'
    | null;
  phasePercentage: number | null;
  amount: number;
  status: 'PENDING' | 'TRIGGERED' | 'PAID' | 'OVERDUE';
  demandDraftId: string | null;
  paymentId: string | null;
  description?: string;
  dueDate?: string | null;
  completedAt?: string | null;
}

interface PaymentPlan {
  id: string;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  status: string;
  milestones: PaymentPlanMilestone[];
}

const fmtINR = (n: number) => {
  if (!Number.isFinite(n)) return '—';
  return `₹${Number(n).toLocaleString('en-IN')}`;
};

const STATUS_STYLES: Record<
  PaymentPlanMilestone['status'],
  { label: string; cls: string }
> = {
  PENDING: { label: 'Pending', cls: 'bg-gray-100 text-gray-600' },
  TRIGGERED: { label: 'DD raised', cls: 'bg-amber-100 text-amber-800' },
  PAID: { label: 'Paid', cls: 'bg-emerald-100 text-emerald-800' },
  OVERDUE: { label: 'Overdue', cls: 'bg-red-100 text-red-700' },
};

export default function FlatLogPage() {
  const params = useParams<{ flatId: string }>();
  const router = useRouter();
  const flatId = params?.flatId as string;

  const [flat, setFlat] = useState<Flat | null>(null);
  const [loadingFlat, setLoadingFlat] = useState(true);
  const [history, setHistory] = useState<FlatProgressRow[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [plan, setPlan] = useState<PaymentPlan | null>(null);
  const [loadingPlan, setLoadingPlan] = useState(false);

  const [phase, setPhase] = useState<PhaseValue>('STRUCTURE');
  const [phasePct, setPhasePct] = useState<number>(0);
  const [overallPct, setOverallPct] = useState<number>(0);
  const [status, setStatus] = useState<StatusValue>('IN_PROGRESS');
  const [notes, setNotes] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadFlat = useCallback(async () => {
    if (!flatId) return;
    try {
      setLoadingFlat(true);
      const data = await flatsService.getFlat(flatId, { forceRefresh: true });
      setFlat(data);
    } finally {
      setLoadingFlat(false);
    }
  }, [flatId]);

  const loadHistory = useCallback(async () => {
    if (!flatId) return;
    try {
      setLoadingHistory(true);
      const rows = await apiService.get<FlatProgressRow[]>(
        `/construction/flat-progress/flat/${flatId}`,
      );
      setHistory(Array.isArray(rows) ? rows : []);
    } catch {
      setHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  }, [flatId]);

  const loadPlan = useCallback(async () => {
    if (!flatId) return;
    try {
      setLoadingPlan(true);
      const data = await apiService.get<PaymentPlan | null>(
        `/flat-payment-plans/flat/${flatId}`,
      );
      setPlan(data && (data as any).id ? (data as PaymentPlan) : null);
    } catch {
      setPlan(null);
    } finally {
      setLoadingPlan(false);
    }
  }, [flatId]);

  useEffect(() => {
    loadFlat();
    loadHistory();
    loadPlan();
  }, [loadFlat, loadHistory, loadPlan]);

  // When phase changes, seed form with the latest known values for that phase
  useEffect(() => {
    const row = history.find((h) => h.phase === phase);
    if (row) {
      setPhasePct(Number(row.phaseProgress) || 0);
      setOverallPct(Number(row.overallProgress) || 0);
      setStatus((row.status as StatusValue) || 'IN_PROGRESS');
    } else {
      setPhasePct(0);
      setStatus('IN_PROGRESS');
    }
    setNotes('');
    setPhotos([]);
  }, [phase, history]);

  const summary = useMemo(() => {
    if (!history.length) return { overall: 0, byPhase: {} as Record<string, number> };
    const byPhase: Record<string, number> = {};
    history.forEach((h) => {
      byPhase[h.phase] = Number(h.phaseProgress) || 0;
    });
    const phasesCount = PHASES.length;
    const overall =
      PHASES.reduce((acc, p) => acc + (byPhase[p.value] || 0), 0) / phasesCount;
    return { overall: Math.round(overall * 10) / 10, byPhase };
  }, [history]);

  const handleUpload = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const fd = new FormData();
    Array.from(files).slice(0, 5).forEach((f) => fd.append('photos', f));
    try {
      setUploading(true);
      const res = await apiService.post<{ urls: string[] }>(
        '/construction/flat-progress/upload/photos',
        fd,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      );
      setPhotos((prev) => [...prev, ...(res?.urls || [])]);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Could not upload photos');
    } finally {
      setUploading(false);
    }
  }, []);

  const removePhoto = (url: string) => setPhotos((prev) => prev.filter((u) => u !== url));

  // Milestones in the active payment plan whose threshold will be crossed by
  // this save. A milestone triggers iff:
  //   - status === 'PENDING'
  //   - constructionPhase matches the phase being logged (token/down-payment
  //     rows carry constructionPhase=null and are manual-only)
  //   - phasePct >= milestone.phasePercentage (defaults to 100 if missing)
  // The backend uses the identical rule in ConstructionWorkflowService.check-
  // AndUpdateMilestones, so this preview stays in sync with what actually
  // fires when you click Save.
  const liveMatches = useMemo<PaymentPlanMilestone[]>(() => {
    if (!plan?.milestones?.length) return [];
    return plan.milestones.filter((m) => {
      if (m.status !== 'PENDING') return false;
      if (!m.constructionPhase) return false;
      if (m.constructionPhase !== phase) return false;
      const threshold = m.phasePercentage ?? 100;
      return phasePct >= threshold;
    });
  }, [plan, phase, phasePct]);

  // Sum-per-phase so the panel can show "Foundation: 15L of 15L" at a glance.
  const planPhaseTotals = useMemo(() => {
    const totals: Record<string, { total: number; triggered: number; paid: number }> = {};
    (plan?.milestones || []).forEach((m) => {
      if (!m.constructionPhase) return;
      const key = m.constructionPhase;
      totals[key] = totals[key] || { total: 0, triggered: 0, paid: 0 };
      totals[key].total += Number(m.amount) || 0;
      if (m.status === 'PAID') totals[key].paid += Number(m.amount) || 0;
      if (m.status === 'TRIGGERED' || m.status === 'OVERDUE')
        totals[key].triggered += Number(m.amount) || 0;
    });
    return totals;
  }, [plan]);

  const willTriggerDD = liveMatches.length > 0;

  // Summarise what the payment plan looks like for the currently-selected
  // phase so the pre-save hint under the slider can say exactly why a DD
  // will / will not fire. All buckets are computed once per render.
  const phaseSummary = useMemo(() => {
    if (!plan) {
      return {
        has: false,
        pendingAhead: [] as PaymentPlanMilestone[],
        alreadyResolvedAtOrBelow: [] as PaymentPlanMilestone[],
      };
    }
    const forPhase = (plan.milestones || []).filter(
      (m) => m.constructionPhase === phase,
    );
    const pendingAhead = forPhase
      .filter(
        (m) => m.status === 'PENDING' && (m.phasePercentage ?? 100) > phasePct,
      )
      .sort((a, b) => (a.phasePercentage ?? 100) - (b.phasePercentage ?? 100));
    // Milestones whose threshold the current % already meets but that are no
    // longer PENDING (they were raised on an earlier log). These are the
    // reason a user can see "nothing will fire" and still be correct.
    const alreadyResolvedAtOrBelow = forPhase
      .filter(
        (m) =>
          m.status !== 'PENDING' &&
          (m.phasePercentage ?? 100) <= phasePct,
      )
      .sort((a, b) => (a.phasePercentage ?? 100) - (b.phasePercentage ?? 100));
    return { has: forPhase.length > 0, pendingAhead, alreadyResolvedAtOrBelow };
  }, [plan, phase, phasePct]);

  const handleSave = async () => {
    if (!flatId) return;
    if (phasePct < 0 || phasePct > 100) {
      toast.error('Phase progress must be between 0 and 100');
      return;
    }
    try {
      setSaving(true);
      const payload = {
        flatId,
        phase,
        phaseProgress: phasePct,
        overallProgress: overallPct || summary.overall,
        status,
        notes: notes || undefined,
        photos: photos.length ? photos : undefined,
      };
      const res: any = await apiService.post('/construction/flat-progress', payload);

      const phaseLabel = PHASES.find((p) => p.value === phase)?.label || phase;

      toast.success('Progress saved', {
        description: `${phaseLabel} · ${phasePct}%`,
      });

      const generated: any[] = res?.workflow?.generatedDemandDrafts ?? [];
      if (generated.length > 0) {
        // Happy path: backend raised one or more DDs. Toast each so the user
        // can jump straight to the DD detail page.
        generated.forEach((dd) => {
          const unit = [dd.flatNumber, dd.towerName].filter(Boolean).join(' · ');
          const fmtAmt =
            typeof dd.amount === 'number' && Number.isFinite(dd.amount)
              ? `Rs ${Number(dd.amount).toLocaleString('en-IN')}`
              : '';
          toast.success(`Demand draft raised${dd.refNumber ? ` (${dd.refNumber})` : ''}`, {
            description: [dd.milestoneName, dd.customerName, unit, fmtAmt]
              .filter(Boolean)
              .join(' · '),
            duration: 10000,
            action: {
              label: 'View',
              onClick: () => router.push(`/demand-drafts/${dd.id}`),
            },
          });
        });
      } else if (liveMatches.length > 0) {
        // User's pre-save preview said N DDs should fire, but the backend
        // returned zero. That's the "already raised" branch: the DD row
        // exists from a previous log or cron sweep, and the workflow
        // recognised it and skipped creating a duplicate.
        toast.message(
          `${liveMatches.length === 1 ? 'This milestone was' : 'These milestones were'} already raised earlier`,
          {
            description: liveMatches
              .map((m) => `#${m.sequence} ${m.name}`)
              .join(', '),
          },
        );
      } else if (!plan) {
        toast.message('No active payment plan linked to this flat', {
          description: 'Logs saved. DDs won\u2019t auto-generate until a plan is set up.',
        });
      } else if (!phaseSummary.has) {
        toast.message(
          `No payment milestones linked to ${phaseLabel}`,
          { description: 'Log saved — this phase has no DD triggers configured.' },
        );
      } else if (
        phaseSummary.pendingAhead.length === 0 &&
        phaseSummary.alreadyResolvedAtOrBelow.length > 0
      ) {
        toast.message(`All ${phaseLabel} milestones are already raised`, {
          description: 'No more DDs will auto-fire for this phase.',
        });
      } else if (phaseSummary.pendingAhead.length > 0) {
        const next = phaseSummary.pendingAhead[0];
        toast.message(`No DD fires at ${phasePct}% of ${phaseLabel}`, {
          description: `Next target: ${next.phasePercentage ?? 100}% \u2192 ${next.name}`,
        });
      }

      // Reset note/photos, refresh history + payment plan (so milestone
      // rows flip from PENDING → TRIGGERED and the panel stays accurate).
      setNotes('');
      setPhotos([]);
      await Promise.all([loadHistory(), loadPlan()]);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to save progress');
    } finally {
      setSaving(false);
    }
  };

  if (loadingFlat && !flat) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <HinglishLoader context="construction" label="Flat ki details la rahe hain" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-4 p-4 md:p-6">
      <header className="space-y-2">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="-ml-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
        </div>
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-xl md:text-2xl font-bold truncate">
              {flat?.flatNumber ? `Flat ${flat.flatNumber}` : 'Flat'}
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground truncate">
              {[flat?.type?.replace('_', ' '), flat?.floor ? `Floor ${flat.floor}` : '', flat?.status]
                .filter(Boolean)
                .join(' · ')}
            </p>
          </div>
          <div className="text-right shrink-0">
            <div className="text-xs text-muted-foreground">Overall</div>
            <div className="text-lg font-bold" style={{ color: '#A8211B' }}>
              {Math.round(summary.overall)}%
            </div>
          </div>
        </div>
      </header>

      {/* ── Payment Plan (top of page, drives DD auto-generation) ── */}
      <Card>
        <CardContent className="p-4 md:p-5 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <div className="h-8 w-8 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                <Coins className="h-4 w-4 text-[#A8211B]" />
              </div>
              <div className="min-w-0">
                <h2 className="font-semibold text-sm md:text-base">
                  Payment Plan
                </h2>
                <p className="text-[11px] text-muted-foreground">
                  Milestones drive when demand drafts auto-generate.
                </p>
              </div>
            </div>
            {plan && (
              <div className="text-right shrink-0 text-xs">
                <div className="text-muted-foreground">Total</div>
                <div className="font-bold tabular-nums">
                  {fmtINR(Number(plan.totalAmount) || 0)}
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  Paid {fmtINR(Number(plan.paidAmount) || 0)} · Bal{' '}
                  {fmtINR(Number(plan.balanceAmount) || 0)}
                </div>
              </div>
            )}
          </div>

          {loadingPlan && !plan && (
            <div className="text-xs text-muted-foreground flex items-center gap-2">
              <Loader2 className="h-3 w-3 animate-spin" /> Loading plan…
            </div>
          )}

          {!loadingPlan && !plan && (
            <div
              className="rounded-md border px-3 py-2 text-xs flex items-start gap-2"
              style={{
                background: '#FEF7EC',
                borderColor: '#F4D590',
                color: '#7B1E12',
              }}
            >
              <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
              <div>
                No active payment plan linked to this flat. Logs will be saved,
                but <strong>demand drafts won't auto-generate</strong>. Set up a
                plan from the Payment Plans screen to enable this.
              </div>
            </div>
          )}

          {plan && plan.milestones?.length > 0 && (
            <div className="rounded-md border overflow-hidden">
              <div className="grid grid-cols-[auto_1fr_auto_auto] gap-x-3 gap-y-0 text-[11px] uppercase tracking-wide text-muted-foreground px-3 py-1.5 border-b bg-gray-50">
                <div>#</div>
                <div>Milestone</div>
                <div className="text-right">Amount</div>
                <div className="text-right">Status</div>
              </div>
              <ul className="divide-y">
                {plan.milestones
                  .slice()
                  .sort((a, b) => a.sequence - b.sequence)
                  .map((m) => {
                    const isManual = !m.constructionPhase;
                    const threshold = m.phasePercentage ?? 100;
                    const isLiveMatch = liveMatches.some(
                      (x) => x.sequence === m.sequence,
                    );
                    const statusStyle =
                      STATUS_STYLES[m.status] || STATUS_STYLES.PENDING;
                    const phaseLabel = m.constructionPhase
                      ? `${m.constructionPhase.charAt(0)}${m.constructionPhase.slice(1).toLowerCase()}`
                      : 'Manual';

                    return (
                      <li
                        key={m.sequence}
                        className={`grid grid-cols-[auto_1fr_auto_auto] gap-x-3 gap-y-0.5 items-center px-3 py-2 text-xs ${
                          isLiveMatch
                            ? 'bg-amber-50'
                            : isManual
                              ? 'bg-gray-50/50 text-gray-500'
                              : ''
                        }`}
                      >
                        <div className="tabular-nums text-[11px] text-muted-foreground">
                          {m.sequence}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium truncate flex items-center gap-1.5">
                            {isManual && (
                              <Lock className="h-3 w-3 text-muted-foreground" />
                            )}
                            <span className="truncate">{m.name}</span>
                            {isLiveMatch && (
                              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-800 bg-amber-200/70 px-1.5 py-0.5 rounded">
                                <Zap className="h-2.5 w-2.5" />
                                Fires on save
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-muted-foreground truncate">
                            {isManual
                              ? 'Token / Down-payment · manual trigger'
                              : `${phaseLabel} · threshold ${threshold}%`}
                            {m.demandDraftId && (
                              <>
                                {' · '}
                                <Link
                                  href={`/demand-drafts/${m.demandDraftId}`}
                                  className="underline hover:text-[#A8211B]"
                                >
                                  View DD
                                </Link>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="tabular-nums font-semibold text-right">
                          {fmtINR(Number(m.amount) || 0)}
                        </div>
                        <div className="text-right">
                          <span
                            className={`inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${statusStyle.cls}`}
                          >
                            {statusStyle.label}
                          </span>
                        </div>
                      </li>
                    );
                  })}
              </ul>

              {Object.keys(planPhaseTotals).length > 0 && (
                <div className="px-3 py-2 border-t bg-gray-50 text-[10px] text-muted-foreground flex flex-wrap gap-x-3 gap-y-1">
                  <span className="inline-flex items-center gap-1">
                    <Banknote className="h-3 w-3" /> Per phase:
                  </span>
                  {PHASES.filter((p) => planPhaseTotals[p.value]).map((p) => {
                    const t = planPhaseTotals[p.value];
                    return (
                      <span key={p.value} className="tabular-nums">
                        <strong className="text-gray-700">{p.short}</strong>{' '}
                        {fmtINR(t.paid)}/{fmtINR(t.total)}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Phase summary chips */}
      <Card>
        <CardContent className="p-3 md:p-4">
          <div className="grid grid-cols-5 gap-1.5 md:gap-2">
            {PHASES.map((p) => {
              const val = Math.round(summary.byPhase[p.value] || 0);
              const active = p.value === phase;
              return (
                <button
                  key={p.value}
                  onClick={() => setPhase(p.value)}
                  className={`rounded-lg border p-2 text-center transition-all ${
                    active
                      ? 'bg-red-50 border-red-300 ring-1 ring-red-300'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div
                    className="text-[10px] md:text-xs font-medium truncate"
                    style={{ color: active ? '#7B1E12' : undefined }}
                  >
                    {p.short}
                  </div>
                  <div
                    className="text-sm md:text-base font-bold mt-0.5"
                    style={{ color: active ? '#A8211B' : undefined }}
                  >
                    {val}%
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Log form */}
      <Card>
        <CardContent className="space-y-4 p-4 md:p-6">
          <div className="space-y-1.5">
            <Label>Phase</Label>
            <Select value={phase} onValueChange={(v) => setPhase(v as PhaseValue)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PHASES.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Phase progress</Label>
              <span
                className="text-lg font-bold tabular-nums"
                style={{ color: '#A8211B' }}
              >
                {phasePct}%
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={phasePct}
              onChange={(e) => setPhasePct(Number(e.target.value))}
              className="w-full accent-red-700"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0%</span>
              <span>25%</span>
              <span>50%</span>
              <span>75%</span>
              <span>100%</span>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Overall flat %</Label>
              <input
                type="number"
                min={0}
                max={100}
                value={overallPct}
                onChange={(e) => setOverallPct(Number(e.target.value))}
                className="w-full h-10 rounded-md border px-3 text-sm"
                placeholder="Auto"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as StatusValue)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Notes (optional)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Eg. slab poured on east side, curing started today..."
              rows={3}
            />
          </div>

          {/* Photo uploader */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Photos</Label>
              <span className="text-xs text-muted-foreground">Up to 5 per save</span>
            </div>

            <label
              className={`flex items-center justify-center gap-2 rounded-md border-2 border-dashed h-24 cursor-pointer hover:bg-gray-50 transition ${
                uploading ? 'opacity-60 pointer-events-none' : ''
              }`}
            >
              {uploading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" /> Uploading...
                </>
              ) : (
                <>
                  <Camera className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Tap to add site photos</span>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleUpload(e.target.files)}
              />
            </label>

            {photos.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {photos.map((url) => (
                  <div key={url} className="relative group aspect-square">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt=""
                      className="h-full w-full object-cover rounded-md border"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(url)}
                      className="absolute top-1 right-1 h-6 w-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {willTriggerDD && (
            <div
              className="rounded-md border px-3 py-2 text-sm flex items-start gap-2"
              style={{
                background: '#FEF7EC',
                borderColor: '#F4D590',
                color: '#7B1E12',
              }}
            >
              <Zap className="h-4 w-4 mt-0.5 shrink-0" />
              <div className="min-w-0 space-y-1">
                <div>
                  Saving will raise{' '}
                  <strong>
                    {liveMatches.length === 1
                      ? '1 Demand Draft'
                      : `${liveMatches.length} Demand Drafts`}
                  </strong>
                  :
                </div>
                <ul className="space-y-0.5">
                  {liveMatches.map((m) => (
                    <li key={m.sequence} className="flex items-center gap-2">
                      <FileText className="h-3 w-3 shrink-0" />
                      <span className="truncate">
                        <strong>#{m.sequence} {m.name}</strong> · {fmtINR(Number(m.amount) || 0)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {!willTriggerDD && plan && phasePct > 0 && (() => {
            const phaseLabel =
              PHASES.find((p) => p.value === phase)?.label || phase;
            // Prioritised messaging:
            //   1. Phase has no milestones in the plan → nothing to expect
            //   2. All milestones for this phase already raised/paid → explain
            //   3. Pending milestones exist above current % → show next target
            //   4. Fallback (shouldn't normally happen) → neutral copy
            if (!phaseSummary.has) {
              return (
                <div className="rounded-md border px-3 py-2 text-xs text-muted-foreground">
                  <strong>{phaseLabel}</strong> has no payment milestones in
                  the active plan — logging will save progress only.
                </div>
              );
            }
            if (
              phaseSummary.pendingAhead.length === 0 &&
              phaseSummary.alreadyResolvedAtOrBelow.length > 0
            ) {
              return (
                <div className="rounded-md border px-3 py-2 text-xs text-muted-foreground">
                  All payment milestones for <strong>{phaseLabel}</strong> are
                  already{' '}
                  {phaseSummary.alreadyResolvedAtOrBelow.every(
                    (m) => m.status === 'PAID',
                  )
                    ? 'paid'
                    : 'raised'}{' '}
                  — no new DD will fire on save.
                </div>
              );
            }
            if (phaseSummary.pendingAhead.length > 0) {
              const next = phaseSummary.pendingAhead[0];
              return (
                <div className="rounded-md border px-3 py-2 text-xs text-muted-foreground">
                  Saving at <strong>{phasePct}%</strong> won't raise a DD.
                  Next target for <strong>{phaseLabel}</strong>:{' '}
                  <strong>{next.phasePercentage ?? 100}%</strong> →{' '}
                  {next.name} ({fmtINR(Number(next.amount) || 0)}).
                </div>
              );
            }
            return (
              <div className="rounded-md border px-3 py-2 text-xs text-muted-foreground">
                No DD will fire on save.
              </div>
            );
          })()}

          <Button
            className="w-full h-11"
            onClick={handleSave}
            disabled={saving}
            style={{ background: '#A8211B', color: 'white' }}
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" /> Log update
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Recent history */}
      <Card>
        <CardContent className="p-4 md:p-6 space-y-3">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-muted-foreground" />
            <h2 className="font-semibold">Recent entries for this flat</h2>
          </div>
          {loadingHistory ? (
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading...
            </div>
          ) : history.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No progress logged yet. Use the form above to log the first entry.
            </div>
          ) : (
            <ul className="divide-y">
              {history
                .slice()
                .sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''))
                .map((row) => (
                  <li key={row.id} className="py-2">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-medium truncate">
                          {PHASES.find((p) => p.value === row.phase)?.label || row.phase}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {row.status.replace('_', ' ')} · {new Date(row.updatedAt || Date.now()).toLocaleString('en-IN')}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-sm font-semibold tabular-nums">
                          {Math.round(Number(row.phaseProgress) || 0)}%
                        </div>
                        {Array.isArray(row.photos) && row.photos.length > 0 && (
                          <div className="text-[10px] text-muted-foreground flex items-center gap-1 justify-end">
                            <Camera className="h-3 w-3" /> {row.photos.length}
                          </div>
                        )}
                      </div>
                    </div>
                    {row.notes && (
                      <div className="text-xs text-gray-600 mt-1 line-clamp-2">{row.notes}</div>
                    )}
                  </li>
                ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        <Link
          href={`/flats/${flatId}`}
          className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
        >
          <Hammer className="h-3 w-3" /> Open flat detail
        </Link>
        <span className="text-muted-foreground text-xs">·</span>
        <Link
          href="/construction/log"
          className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
        >
          <CheckCircle2 className="h-3 w-3" /> Log for a different flat
        </Link>
      </div>
    </div>
  );
}
