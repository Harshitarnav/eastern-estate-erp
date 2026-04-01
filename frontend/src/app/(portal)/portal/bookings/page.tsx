'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiService } from '@/services/api';
import { Building2, ChevronRight } from 'lucide-react';

function fmt(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  TOKEN_PAID:        { label: 'Token Paid',       color: 'bg-yellow-100 text-yellow-700' },
  AGREEMENT_PENDING: { label: 'Agreement Pending', color: 'bg-orange-100 text-orange-700' },
  AGREEMENT_SIGNED:  { label: 'Agreement Signed',  color: 'bg-blue-100 text-blue-700' },
  CONFIRMED:         { label: 'Confirmed',          color: 'bg-green-100 text-green-700' },
  COMPLETED:         { label: 'Completed',          color: 'bg-gray-100 text-gray-600' },
};

export default function PortalBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiService.get('/customer-portal/bookings')
      .then((r: any) => setBookings(Array.isArray(r) ? r : []))
      .catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-6 w-32 bg-gray-200 rounded" />
        {[1,2].map(i => <div key={i} className="h-36 bg-gray-200 rounded-2xl" />)}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-black text-gray-900">My Units</h1>

      {bookings.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Building2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No bookings found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((b: any) => {
            const s = STATUS_MAP[b.status] || { label: b.status, color: 'bg-gray-100 text-gray-600' };
            const paidPct = b.totalAmount > 0 ? Math.round((b.paidAmount / b.totalAmount) * 100) : 0;
            return (
              <Link key={b.id} href={`/portal/bookings/${b.id}`}
                className="block bg-white rounded-2xl border border-gray-100 p-5 hover:border-[#A8211B]/30 hover:shadow-md transition-all">
                {/* Property + flat */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <p className="text-xs text-gray-400 font-medium">{b.property?.name}</p>
                    <h3 className="text-lg font-black text-gray-900 mt-0.5">Flat {b.flat?.flatNumber}</h3>
                    {b.flat?.tower?.name && <p className="text-xs text-gray-500">{b.flat.tower.name}</p>}
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full shrink-0 ${s.color}`}>{s.label}</span>
                </div>

                {/* Amount summary */}
                <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                  <div className="bg-gray-50 rounded-xl p-2">
                    <p className="text-xs text-gray-400">Total</p>
                    <p className="text-xs font-bold text-gray-800 mt-0.5">{fmt(b.totalAmount)}</p>
                  </div>
                  <div className="bg-green-50 rounded-xl p-2">
                    <p className="text-xs text-green-600">Paid</p>
                    <p className="text-xs font-bold text-green-800 mt-0.5">{fmt(b.paidAmount)}</p>
                  </div>
                  <div className="bg-orange-50 rounded-xl p-2">
                    <p className="text-xs text-orange-600">Balance</p>
                    <p className="text-xs font-bold text-orange-800 mt-0.5">{fmt(b.balanceAmount)}</p>
                  </div>
                </div>

                {/* Progress */}
                <div>
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Payment progress</span><span className="font-semibold text-[#A8211B]">{paidPct}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#A8211B] rounded-full" style={{ width: `${paidPct}%` }} />
                  </div>
                </div>

                <div className="flex justify-end mt-3">
                  <span className="text-xs text-[#A8211B] font-semibold flex items-center gap-0.5">
                    View details <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
