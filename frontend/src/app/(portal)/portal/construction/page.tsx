'use client';

import { useEffect, useMemo, useState } from 'react';
import { apiService } from '@/services/api';
import {
  HardHat,
  Camera,
  TrendingUp,
  Building2,
  Home,
  Layers,
  Palette,
  Sparkles,
  Calendar,
} from 'lucide-react';

const PHASE_ORDER = [
  'FOUNDATION',
  'STRUCTURE',
  'FINISHING',
  'HANDOVER',
] as const;

const PHASE_LABEL: Record<string, string> = {
  FOUNDATION: 'Foundation',
  STRUCTURE: 'Structure',
  FINISHING: 'Finishing',
  HANDOVER: 'Handover',
  SUPERSTRUCTURE: 'Super-structure',
  INTERIOR: 'Interior',
  EXTERIOR: 'Exterior',
  MEP: 'MEP',
  PLANNING: 'Planning',
};

const CATEGORY_LABEL: Record<string, string> = {
  BEAUTIFICATION: 'Beautification',
  LIFT: 'Lift',
  HALLWAY_LOBBY: 'Hallway / Lobby',
  LANDSCAPING: 'Landscaping',
  FACADE_PAINT: 'Façade & Paint',
  AMENITY: 'Amenity',
  SECURITY_GATES: 'Security & Gates',
  UTILITIES_EXTERNAL: 'External utilities',
  SIGNAGE: 'Signage',
  CLEANING: 'Cleaning',
  SAFETY: 'Safety',
  OTHER: 'Other',
};

const SCOPE_LABEL: Record<string, string> = {
  PROPERTY: 'Property-wide',
  TOWER: 'Tower',
  COMMON_AREA: 'Common area',
};

function fmtDate(d: string | Date | null | undefined) {
  if (!d) return '–';
  return new Date(d).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function ProgressBar({ value, small = false }: { value: number; small?: boolean }) {
  const pct = Math.min(100, Math.max(0, Number(value) || 0));
  return (
    <div className="w-full">
      {!small && (
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Progress</span>
          <span className="font-bold text-[#A8211B]">{pct.toFixed(0)}%</span>
        </div>
      )}
      <div className={`w-full ${small ? 'h-1.5' : 'h-2'} bg-gray-100 rounded-full overflow-hidden`}>
        <div
          className="h-full bg-gradient-to-r from-[#A8211B] to-[#e05a53] rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function PhotoGrid({ photos }: { photos: string[] }) {
  if (!photos.length) return null;
  return (
    <div className="grid grid-cols-3 gap-2">
      {photos.slice(0, 6).map((url, i) =>
        url ? (
          <a key={i} href={url} target="_blank" rel="noopener noreferrer">
            <img
              src={url}
              alt={`Site photo ${i + 1}`}
              className="w-full h-20 object-cover rounded-lg border border-gray-100 hover:opacity-90 transition"
            />
          </a>
        ) : null,
      )}
    </div>
  );
}

export default function PortalConstructionPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiService
      .get('/customer-portal/construction')
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const byFlat = useMemo(() => {
    const rows: any[] = data?.flatProgress || [];
    const bookings: any[] = data?.bookings || [];
    const map = new Map<string, { booking: any; rows: any[] }>();
    bookings.forEach((b) => {
      if (b.flatId) map.set(b.flatId, { booking: b, rows: [] });
    });
    rows.forEach((r) => {
      if (!r.flatId) return;
      const entry = map.get(r.flatId);
      if (entry) entry.rows.push(r);
    });
    return Array.from(map.values());
  }, [data]);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-6 w-48 bg-gray-200 rounded" />
        <div className="h-28 bg-gray-200 rounded-2xl" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-gray-200 rounded-xl" />
        ))}
      </div>
    );
  }

  const {
    projects = [],
    updates = [], // legacy daily logs
    developmentUpdates = [],
  } = data || {};

  const anyContent =
    projects.length ||
    updates.length ||
    developmentUpdates.length ||
    byFlat.some((f) => f.rows.length);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-gray-900">Construction Updates</h1>

      {!anyContent && (
        <div className="text-center py-16 text-gray-400">
          <HardHat className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">
            Construction updates will appear here once work starts on your property
          </p>
        </div>
      )}

      {/* ── YOUR UNIT(s) ─ per-flat phase progress ──────────────── */}
      {byFlat.length > 0 && byFlat.some((f) => f.rows.length) && (
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-gray-600 uppercase tracking-wide">
            Your Unit Progress
          </h2>
          {byFlat.map(({ booking, rows }) => {
            if (!rows.length) return null;
            const latest = rows[0];
            const latestPhotos: string[] = Array.isArray(latest?.photos)
              ? latest.photos.filter(Boolean)
              : [];
            // Best row per phase (highest progress).
            const bestByPhase = new Map<string, any>();
            rows.forEach((r: any) => {
              const p = r.phase;
              const prev = bestByPhase.get(p);
              const prevPct = Number(prev?.phaseProgress || 0);
              const curPct = Number(r?.phaseProgress || 0);
              if (!prev || curPct > prevPct) bestByPhase.set(p, r);
            });
            const phaseList = PHASE_ORDER.filter((p) => bestByPhase.has(p)).length
              ? PHASE_ORDER.filter((p) => bestByPhase.has(p))
              : Array.from(bestByPhase.keys());
            return (
              <div
                key={booking.id}
                className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#A8211B]/10 flex items-center justify-center shrink-0">
                    <Home className="w-5 h-5 text-[#A8211B]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900">
                      Flat {booking.flat?.flatNumber || '–'}
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {booking.flat?.tower?.name
                        ? `Tower ${booking.flat.tower.name} · `
                        : ''}
                      {booking.property?.name || ''}
                    </p>
                  </div>
                  {latest?.overallProgress != null && (
                    <span className="text-xs font-bold bg-[#A8211B]/10 text-[#A8211B] px-2 py-1 rounded-lg shrink-0">
                      {Number(latest.overallProgress).toFixed(0)}%
                    </span>
                  )}
                </div>

                {/* Phase breakdown */}
                <div className="space-y-2">
                  {phaseList.map((phase) => {
                    const row = bestByPhase.get(phase);
                    const pct = Number(row?.phaseProgress || 0);
                    return (
                      <div key={phase}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-600 font-medium">
                            {PHASE_LABEL[phase] || phase.replace(/_/g, ' ')}
                          </span>
                          <span className="text-gray-500 font-semibold">
                            {pct.toFixed(0)}%
                          </span>
                        </div>
                        <ProgressBar value={pct} small />
                      </div>
                    );
                  })}
                </div>

                {latest?.notes && (
                  <div className="bg-gray-50 rounded-xl px-3 py-2 text-xs text-gray-600 leading-relaxed">
                    <span className="font-semibold text-gray-700">
                      Latest note · {fmtDate(latest.updatedAt || latest.createdAt)}:
                    </span>{' '}
                    {latest.notes}
                  </div>
                )}

                {latestPhotos.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1 text-xs text-gray-400 mb-2">
                      <Camera className="w-3 h-3" /> {latestPhotos.length} photo
                      {latestPhotos.length > 1 ? 's' : ''} from latest update
                    </div>
                    <PhotoGrid photos={latestPhotos} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── PROJECTS ─────────────────────────────────────── */}
      {projects.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-gray-600 uppercase tracking-wide">
            Projects
          </h2>
          {projects.map((proj: any) => (
            <div
              key={proj.id}
              className="bg-white rounded-2xl border border-gray-100 p-5"
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#A8211B]/10 flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5 text-[#A8211B]" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900">
                    {proj.projectName || proj.name}
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Status:{' '}
                    <span className="font-medium text-gray-600">
                      {proj.status?.replace(/_/g, ' ')}
                    </span>
                    {proj.expectedCompletionDate && (
                      <> · Expected: {fmtDate(proj.expectedCompletionDate)}</>
                    )}
                  </p>
                </div>
              </div>
              {proj.overallProgress != null && <ProgressBar value={proj.overallProgress} />}
            </div>
          ))}
        </div>
      )}

      {/* ── DEVELOPMENT UPDATES (beautification, lifts, landscaping) ── */}
      {developmentUpdates.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-gray-600 uppercase tracking-wide">
            Property & Amenity Updates
          </h2>
          {developmentUpdates.map((u: any) => {
            const imgs: string[] = Array.isArray(u.images)
              ? u.images.filter(Boolean)
              : [];
            return (
              <div
                key={u.id}
                className="bg-white rounded-xl border border-gray-100 overflow-hidden"
              >
                <div className="p-4">
                  <div className="flex items-start gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
                      <Sparkles className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {u.updateTitle}
                      </p>
                      <div className="flex items-center flex-wrap gap-1.5 mt-0.5">
                        <span className="text-xs text-gray-400 inline-flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {fmtDate(u.updateDate)}
                        </span>
                        {u.category && (
                          <span className="text-[10px] font-semibold bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full">
                            {CATEGORY_LABEL[u.category] || u.category}
                          </span>
                        )}
                        {u.scopeType && (
                          <span className="text-[10px] font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                            {u.scopeType === 'TOWER' ? (
                              <Layers className="w-3 h-3" />
                            ) : u.scopeType === 'COMMON_AREA' ? (
                              <Palette className="w-3 h-3" />
                            ) : (
                              <Building2 className="w-3 h-3" />
                            )}
                            {SCOPE_LABEL[u.scopeType] || u.scopeType}
                            {u.commonAreaLabel ? ` · ${u.commonAreaLabel}` : ''}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {u.updateDescription && (
                    <p className="text-sm text-gray-600 leading-relaxed mt-2">
                      {u.updateDescription}
                    </p>
                  )}
                </div>

                {imgs.length > 0 && (
                  <div className="px-4 pb-4">
                    <div className="flex items-center gap-1 text-xs text-gray-400 mb-2">
                      <Camera className="w-3 h-3" /> {imgs.length} photo
                      {imgs.length > 1 ? 's' : ''}
                    </div>
                    <PhotoGrid photos={imgs} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── LEGACY DAILY PROGRESS LOGS (if any remain) ─────────── */}
      {updates.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-gray-600 uppercase tracking-wide">
            Recent Site Updates
          </h2>
          {updates.map((log: any) => {
            const photos: any[] = Array.isArray(log.photos) ? log.photos : [];
            return (
              <div
                key={log.id}
                className="bg-white rounded-xl border border-gray-100 overflow-hidden"
              >
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        {log.workType?.replace(/_/g, ' ') || 'Site Update'}
                      </p>
                      <p className="text-xs text-gray-400">{fmtDate(log.logDate)}</p>
                    </div>
                    {log.progressPercentage != null && (
                      <span className="text-xs font-bold bg-[#A8211B]/10 text-[#A8211B] px-2 py-1 rounded-lg shrink-0">
                        {Number(log.progressPercentage).toFixed(0)}%
                      </span>
                    )}
                  </div>
                  {log.description && (
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {log.description}
                    </p>
                  )}
                </div>

                {photos.length > 0 && (
                  <div className="px-4 pb-4">
                    <div className="flex items-center gap-1 text-xs text-gray-400 mb-2">
                      <Camera className="w-3 h-3" /> {photos.length} photo
                      {photos.length > 1 ? 's' : ''}
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {photos.slice(0, 6).map((photo: any, i: number) => {
                        const url = typeof photo === 'string' ? photo : photo?.url;
                        return url ? (
                          <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                            <img
                              src={url}
                              alt={`Site photo ${i + 1}`}
                              className="w-full h-20 object-cover rounded-lg border border-gray-100 hover:opacity-90 transition"
                            />
                          </a>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {projects.length > 0 &&
        !updates.length &&
        !developmentUpdates.length &&
        !byFlat.some((f) => f.rows.length) && (
          <div className="text-center py-8 text-gray-400">
            <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No progress logs yet for your property</p>
          </div>
        )}
    </div>
  );
}
