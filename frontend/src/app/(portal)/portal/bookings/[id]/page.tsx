'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { apiService } from '@/services/api';
import {
  ArrowLeft, Building2, CreditCard, CheckCircle2, Clock,
  AlertCircle, FileText, Calendar, HardHat, Camera,
} from 'lucide-react';

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

function fmt(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);
}
function fmtDate(d: string | null) {
  if (!d) return '–';
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function MilestoneIcon({ status }: { status: string }) {
  if (status === 'PAID') return <CheckCircle2 className="w-4 h-4 text-green-500" />;
  if (status === 'OVERDUE') return <AlertCircle className="w-4 h-4 text-red-500" />;
  if (status === 'TRIGGERED') return <Clock className="w-4 h-4 text-orange-500" />;
  return <Clock className="w-4 h-4 text-gray-300" />;
}

function statusColor(s: string) {
  if (s === 'PAID') return 'text-green-700 bg-green-50';
  if (s === 'OVERDUE') return 'text-red-700 bg-red-50';
  if (s === 'TRIGGERED') return 'text-orange-700 bg-orange-50';
  return 'text-gray-500 bg-gray-50';
}

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<'network' | 'notfound' | null>(null);
  const [tab, setTab] = useState<'overview' | 'milestones' | 'payments' | 'drafts'>('overview');

  useEffect(() => {
    apiService.get(`/customer-portal/bookings/${id}`)
      .then(setData)
      .catch((e) => {
        console.error(e);
        setFetchError(e?.response?.status === 404 ? 'notfound' : 'network');
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-5 w-32 bg-gray-200 rounded" />
        <div className="h-40 bg-gray-200 rounded-2xl" />
        <div className="h-60 bg-gray-200 rounded-2xl" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-16">
        {fetchError === 'notfound' ? (
          <>
            <p className="font-semibold text-gray-600">Booking not found</p>
            <p className="text-sm text-gray-400 mt-1">This booking may no longer exist.</p>
          </>
        ) : (
          <>
            <AlertCircle className="w-10 h-10 text-red-300 mx-auto mb-3" />
            <p className="font-semibold text-gray-600">Couldn't load booking details</p>
            <p className="text-sm text-gray-400 mt-1">Please check your connection and try again.</p>
          </>
        )}
        <Link href="/portal/bookings" className="text-[#A8211B] text-sm mt-4 inline-block font-semibold">← Back to all units</Link>
      </div>
    );
  }

  const { booking, paymentPlan, payments, demandDrafts, flatProgress = [] } = data;
  const milestones: any[] = paymentPlan?.milestones || [];
  const paid = milestones.filter(m => m.status === 'PAID').length;
  const pct = milestones.length ? Math.round((paid / milestones.length) * 100) : 0;

  const latestProgress = Array.isArray(flatProgress) && flatProgress.length > 0 ? flatProgress[0] : null;
  const latestPhotos: string[] = Array.isArray(latestProgress?.photos)
    ? latestProgress.photos.filter(Boolean)
    : [];

  return (
    <div className="space-y-5">
      {/* Back */}
      <Link href="/portal/bookings" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#A8211B] transition">
        <ArrowLeft className="w-4 h-4" /> All units
      </Link>

      {/* Header card */}
      <div className="bg-gradient-to-br from-[#A8211B] to-[#7B1E12] rounded-2xl p-6 text-white">
        <p className="text-xs text-white/60 uppercase tracking-widest font-semibold mb-1">{booking.property?.name}</p>
        <h1 className="text-2xl font-black mb-1">Flat {booking.flat?.flatNumber}</h1>
        {booking.flat?.tower?.name && <p className="text-sm text-white/70">{booking.flat.tower.name}</p>}

        <div className="grid grid-cols-3 gap-3 mt-5">
          <div className="bg-white/10 rounded-xl p-3">
            <p className="text-xs text-white/60 mb-0.5">Total Value</p>
            <p className="font-bold text-sm">{fmt(booking.totalAmount)}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3">
            <p className="text-xs text-white/60 mb-0.5">Paid</p>
            <p className="font-bold text-sm text-green-300">{fmt(booking.paidAmount)}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3">
            <p className="text-xs text-white/60 mb-0.5">Balance</p>
            <p className="font-bold text-sm text-orange-300">{fmt(booking.balanceAmount)}</p>
          </div>
        </div>
      </div>

      {/* Payment plan progress */}
      {paymentPlan && milestones.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm font-bold text-gray-700">Payment Plan Progress</p>
            <p className="text-sm font-bold text-[#A8211B]">{pct}%</p>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-[#A8211B] rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>
          <p className="text-xs text-gray-400 mt-1">{paid} of {milestones.length} milestones paid</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 text-sm overflow-x-auto no-scrollbar">
        {([
          { key: 'overview',    label: 'Overview'   },
          { key: 'milestones',  label: 'Milestones' },
          { key: 'payments',    label: 'Payments'   },
          { key: 'drafts',      label: 'Drafts'     },
        ] as const).map(({ key, label }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex-shrink-0 flex-1 min-w-[72px] py-2 px-3 rounded-lg font-semibold transition whitespace-nowrap ${
              tab === key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}>{label}
          </button>
        ))}
      </div>

      {/* Tab: Overview */}
      {tab === 'overview' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
            {[
              ['Booking #', booking.bookingNumber],
              ['Booking Date', fmtDate(booking.bookingDate)],
              ['Status', booking.status?.replace(/_/g, ' ')],
              ['Token Amount', fmt(booking.tokenAmount)],
              ['Expected Possession', fmtDate(booking.expectedPossessionDate)],
              ['Agreement #', booking.agreementNumber || '–'],
              ['Agreement Date', fmtDate(booking.agreementDate)],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                <span className="text-xs text-gray-500 font-medium">{k}</span>
                <span className="text-sm font-semibold text-gray-800">{v}</span>
              </div>
            ))}
          </div>

          {/* Construction snapshot for this flat */}
          {latestProgress && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-[#A8211B]/10 flex items-center justify-center">
                    <HardHat className="w-4 h-4 text-[#A8211B]" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">Construction snapshot</p>
                    <p className="text-xs text-gray-400">
                      Updated {fmtDate(latestProgress.updatedAt || latestProgress.createdAt)}
                    </p>
                  </div>
                </div>
                <Link
                  href="/portal/construction"
                  className="text-xs font-semibold text-[#A8211B] hover:underline whitespace-nowrap"
                >
                  See all updates
                </Link>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 font-medium">
                  Current phase:{' '}
                  <span className="text-gray-800 font-semibold">
                    {PHASE_LABEL[latestProgress.phase] ||
                      latestProgress.phase?.replace(/_/g, ' ') ||
                      '–'}
                  </span>
                </span>
                <span className="text-xs font-bold bg-[#A8211B]/10 text-[#A8211B] px-2 py-1 rounded-lg">
                  {Number(latestProgress.overallProgress || latestProgress.phaseProgress || 0).toFixed(0)}% overall
                </span>
              </div>

              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#A8211B] to-[#e05a53] rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, Math.max(0, Number(latestProgress.overallProgress || latestProgress.phaseProgress || 0)))}%`,
                  }}
                />
              </div>

              {latestProgress.notes && (
                <div className="bg-gray-50 rounded-xl px-3 py-2 text-xs text-gray-600 leading-relaxed">
                  {latestProgress.notes}
                </div>
              )}

              {latestPhotos.length > 0 && (
                <div>
                  <div className="flex items-center gap-1 text-xs text-gray-400 mb-2">
                    <Camera className="w-3 h-3" /> {latestPhotos.length} photo
                    {latestPhotos.length > 1 ? 's' : ''} from site
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {latestPhotos.slice(0, 3).map((url: string, i: number) =>
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
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab: Milestones */}
      {tab === 'milestones' && (
        <div className="space-y-2">
          {milestones.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No payment plan milestones found</p>
          ) : (
            milestones.map((m: any, i: number) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
                <MilestoneIcon status={m.status} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{m.name || `Milestone ${m.sequence}`}</p>
                  {m.dueDate && <p className="text-xs text-gray-400">Due: {fmtDate(m.dueDate)}</p>}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-gray-900">{fmt(m.amount)}</p>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusColor(m.status)}`}>
                    {m.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab: Payments */}
      {tab === 'payments' && (
        <div className="space-y-2">
          {payments.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No payments recorded yet</p>
          ) : (
            payments.map((p: any) => (
              <div key={p.id} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                  <CreditCard className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800">{p.paymentMethod || 'Payment'}</p>
                  <p className="text-xs text-gray-400">{fmtDate(p.paymentDate)}</p>
                </div>
                <p className="text-sm font-bold text-green-700 shrink-0">{fmt(p.amount)}</p>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab: Demand Drafts */}
      {tab === 'drafts' && (
        <div className="space-y-2">
          {demandDrafts.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No demand drafts issued yet</p>
          ) : (
            demandDrafts.map((d: any) => (
              <div key={d.id} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800">{d.title || 'Demand Draft'}</p>
                  <p className="text-xs text-gray-400">{fmtDate(d.dueDate || d.createdAt)} · {d.status}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-gray-900">{fmt(d.amount)}</p>
                  {d.fileUrl && (
                    <a href={d.fileUrl} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-[#A8211B] hover:underline">View PDF</a>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
