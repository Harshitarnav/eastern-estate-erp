'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiService } from '@/services/api';
import {
  Building2, CreditCard, TrendingUp, Calendar,
  ChevronRight, CheckCircle2, Clock, AlertCircle,
} from 'lucide-react';

function fmt(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string }> = {
    TOKEN_PAID:       { label: 'Token Paid',      color: 'bg-yellow-100 text-yellow-700' },
    AGREEMENT_PENDING:{ label: 'Agreement Pending',color: 'bg-orange-100 text-orange-700' },
    AGREEMENT_SIGNED: { label: 'Agreement Signed', color: 'bg-blue-100 text-blue-700' },
    CONFIRMED:        { label: 'Confirmed',        color: 'bg-green-100 text-green-700' },
    COMPLETED:        { label: 'Completed',        color: 'bg-gray-100 text-gray-600' },
  };
  const s = map[status] || { label: status, color: 'bg-gray-100 text-gray-600' };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${s.color}`}>
      {s.label}
    </span>
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

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-6 w-40 bg-gray-200 rounded" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="h-24 bg-gray-200 rounded-2xl" />)}
        </div>
        <div className="h-48 bg-gray-200 rounded-2xl" />
      </div>
    );
  }

  const customer = data?.customer;
  const stats = data?.stats;

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-black text-gray-900">
          Welcome, {customer?.fullName?.split(' ')[0] || 'there'} 👋
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">Here's a summary of your property journey</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 text-gray-500 text-xs font-semibold uppercase tracking-wide mb-2">
            <Building2 className="w-4 h-4 text-[#A8211B]" /> Units Booked
          </div>
          <p className="text-3xl font-black text-gray-900">{stats?.bookingCount ?? '–'}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 text-gray-500 text-xs font-semibold uppercase tracking-wide mb-2">
            <CreditCard className="w-4 h-4 text-green-600" /> Amount Paid
          </div>
          <p className="text-2xl font-black text-gray-900">{fmt(stats?.totalPaid ?? 0)}</p>
        </div>
        <div className="col-span-2 md:col-span-1 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 text-gray-500 text-xs font-semibold uppercase tracking-wide mb-2">
            <TrendingUp className="w-4 h-4 text-blue-600" /> Payments Made
          </div>
          <p className="text-3xl font-black text-gray-900">{stats?.paymentCount ?? '–'}</p>
        </div>
      </div>

      {/* Bookings */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-gray-800">Your Units</h2>
          <Link href="/portal/bookings" className="text-xs text-[#A8211B] font-semibold flex items-center gap-0.5 hover:underline">
            View all <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        {bookings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
            <Building2 className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">No bookings found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.map((b: any) => (
              <Link key={b.id} href={`/portal/bookings/${b.id}`}
                className="block bg-white rounded-2xl border border-gray-100 p-5 hover:border-[#A8211B]/30 hover:shadow-md transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-gray-900">
                        {b.property?.name || 'Property'} — Flat {b.flat?.flatNumber}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 space-y-0.5">
                      {b.flat?.tower?.name && <p>Tower: {b.flat.tower.name}</p>}
                      <p>Booking #{b.bookingNumber}</p>
                      <p>Total: <span className="font-semibold text-gray-700">{fmt(b.totalAmount)}</span>
                        &nbsp;·&nbsp; Paid: <span className="font-semibold text-green-700">{fmt(b.paidAmount)}</span></p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <StatusBadge status={b.status} />
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
