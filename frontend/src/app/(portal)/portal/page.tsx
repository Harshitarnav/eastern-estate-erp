'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiService } from '@/services/api';
import {
  Building2, CreditCard, TrendingUp, ChevronRight,
  CheckCircle2, Clock, AlertCircle,
} from 'lucide-react';

function fmt(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);
}

const STATUS_MAP: Record<string, { label: string; color: string; dot: string }> = {
  TOKEN_PAID:        { label: 'Token Paid',       color: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-400' },
  AGREEMENT_PENDING: { label: 'Agreement Pending', color: 'bg-orange-100 text-orange-700', dot: 'bg-orange-400' },
  AGREEMENT_SIGNED:  { label: 'Agreement Signed',  color: 'bg-blue-100 text-blue-700',    dot: 'bg-blue-400'   },
  CONFIRMED:         { label: 'Confirmed',          color: 'bg-green-100 text-green-700',  dot: 'bg-green-500'  },
  COMPLETED:         { label: 'Completed',          color: 'bg-gray-100 text-gray-600',    dot: 'bg-gray-400'   },
};

function SkeletonDashboard() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="h-7 w-48 bg-gray-200 rounded-lg" />
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[1,2,3].map(i => <div key={i} className="h-24 bg-gray-200 rounded-2xl" />)}
      </div>
      <div className="h-5 w-28 bg-gray-200 rounded" />
      {[1,2].map(i => <div key={i} className="h-40 bg-gray-200 rounded-2xl" />)}
    </div>
  );
}

export default function PortalDashboard() {
  const [data, setData] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiService.get('/customer-portal/me'),
      apiService.get('/customer-portal/bookings'),
    ]).then(([me, bk]) => {
      setData(me);
      setBookings(Array.isArray(bk) ? bk : []);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <SkeletonDashboard />;

  const customer = data?.customer;
  const stats = data?.stats;

  return (
    <div className="space-y-6">

      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-black text-gray-900">
          Hello, {customer?.fullName?.split(' ')[0] || 'there'} 👋
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">Here's a summary of your property journey</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-1.5 text-gray-400 text-xs font-semibold uppercase tracking-wide mb-3">
            <Building2 className="w-4 h-4 text-[#A8211B]" /> Units
          </div>
          <p className="text-3xl font-black text-gray-900">{stats?.bookingCount ?? '–'}</p>
          <p className="text-xs text-gray-400 mt-1">booked</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-1.5 text-gray-400 text-xs font-semibold uppercase tracking-wide mb-3">
            <CreditCard className="w-4 h-4 text-green-500" /> Paid
          </div>
          <p className="text-xl font-black text-gray-900 break-all">{fmt(stats?.totalPaid ?? 0)}</p>
          <p className="text-xs text-gray-400 mt-1">total amount</p>
        </div>
        <div className="col-span-2 md:col-span-1 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-1.5 text-gray-400 text-xs font-semibold uppercase tracking-wide mb-3">
            <TrendingUp className="w-4 h-4 text-blue-500" /> Transactions
          </div>
          <p className="text-3xl font-black text-gray-900">{stats?.paymentCount ?? '–'}</p>
          <p className="text-xs text-gray-400 mt-1">payments made</p>
        </div>
      </div>

      {/* Units */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-gray-800">Your Units</h2>
          {bookings.length > 2 && (
            <Link href="/portal/bookings"
              className="text-xs text-[#A8211B] font-semibold flex items-center gap-0.5 hover:underline">
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          )}
        </div>

        {bookings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
            <Building2 className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No bookings found</p>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {bookings.slice(0, 4).map((b: any) => {
              const s = STATUS_MAP[b.status] || { label: b.status, color: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' };
              const paidPct = b.totalAmount > 0 ? Math.round((b.paidAmount / b.totalAmount) * 100) : 0;

              return (
                <Link key={b.id} href={`/portal/bookings/${b.id}`}
                  className="block bg-white rounded-2xl border border-gray-100 p-5 hover:border-[#A8211B]/30 hover:shadow-md transition-all group">

                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="min-w-0">
                      <p className="text-xs text-gray-400 font-medium truncate">{b.property?.name}</p>
                      <h3 className="text-lg font-black text-gray-900 leading-tight">Flat {b.flat?.flatNumber}</h3>
                      {b.flat?.tower?.name && (
                        <p className="text-xs text-gray-500">{b.flat.tower.name}</p>
                      )}
                    </div>
                    <span className={`shrink-0 text-xs font-bold px-2.5 py-1 rounded-full ${s.color}`}>
                      {s.label}
                    </span>
                  </div>

                  {/* Financials */}
                  <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                    <div className="bg-gray-50 rounded-xl px-3 py-2">
                      <p className="text-gray-400">Paid</p>
                      <p className="font-bold text-green-700 mt-0.5">{fmt(b.paidAmount)}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl px-3 py-2">
                      <p className="text-gray-400">Balance</p>
                      <p className="font-bold text-orange-700 mt-0.5">{fmt(b.balanceAmount)}</p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div>
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>Payment progress</span>
                      <span className="font-semibold text-[#A8211B]">{paidPct}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A8211B] rounded-full transition-all duration-500"
                        style={{ width: `${paidPct}%` }} />
                    </div>
                  </div>

                  <div className="flex justify-end mt-3">
                    <span className="text-xs text-[#A8211B] font-semibold flex items-center gap-0.5 group-hover:gap-1.5 transition-all">
                      View details <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
