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

export default function FlatLogPage() {
  const params = useParams<{ flatId: string }>();
  const router = useRouter();
  const flatId = params?.flatId as string;

  const [flat, setFlat] = useState<Flat | null>(null);
  const [loadingFlat, setLoadingFlat] = useState(true);
  const [history, setHistory] = useState<FlatProgressRow[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

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

  useEffect(() => {
    loadFlat();
    loadHistory();
  }, [loadFlat, loadHistory]);

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

  const willTriggerDD = useMemo(() => {
    // Heuristic hint: if the phase is one of the DD-linked phases and phasePct
    // will increase from what we already have, we *may* trigger a milestone.
    const previous = summary.byPhase[phase] ?? 0;
    return phasePct > previous;
  }, [phase, phasePct, summary]);

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

      toast.success('Progress saved', {
        description: `${PHASES.find((p) => p.value === phase)?.label} · ${phasePct}%`,
      });

      const generated: any[] = res?.workflow?.generatedDemandDrafts ?? [];
      if (generated.length > 0) {
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
      } else if (res?.workflow?.milestonesTriggered === 0) {
        toast.message('No milestone threshold hit yet for this phase.');
      }

      // Reset note/photos, refresh history
      setNotes('');
      setPhotos([]);
      await loadHistory();
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
              style={{ background: '#FEF7EC', borderColor: '#F4D590', color: '#7B1E12' }}
            >
              <Zap className="h-4 w-4 mt-0.5 shrink-0" />
              <div>
                Saving may trigger a <strong>Demand Draft</strong> automatically if this %
                crosses a milestone in the active payment plan.
              </div>
            </div>
          )}

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
