'use client';

import { useEffect, useState } from 'react';
import { apiService } from '@/services/api';
import { CreditCard, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

function fmt(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);
}
function fmtDate(d: string | null) {
  if (!d) return '–';
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function PortalPaymentsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'history' | 'upcoming'>('history');

  useEffect(() => {
    apiService.get('/customer-portal/payments')
      .then(setData).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-6 w-40 bg-gray-200 rounded" />
        <div className="h-12 bg-gray-200 rounded-xl" />
        {[1,2,3,4].map(i => <div key={i} className="h-16 bg-gray-200 rounded-xl" />)}
      </div>
    );
  }

  const payments: any[] = data?.payments || [];
  const upcoming: any[] = data?.upcomingMilestones || [];

  const totalPaid = payments.reduce((s, p) => s + Number(p.amount), 0);
  const totalDue = upcoming.reduce((s, m) => s + Number(m.amount), 0);

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-black text-gray-900">Payments</h1>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-green-50 border border-green-100 rounded-2xl p-4">
          <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-1">Total Paid</p>
          <p className="text-xl font-black text-green-800">{fmt(totalPaid)}</p>
          <p className="text-xs text-green-600 mt-0.5">{payments.length} payment{payments.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4">
          <p className="text-xs font-semibold text-orange-700 uppercase tracking-wide mb-1">Upcoming Due</p>
          <p className="text-xl font-black text-orange-800">{fmt(totalDue)}</p>
          <p className="text-xs text-orange-600 mt-0.5">{upcoming.length} milestone{upcoming.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 text-sm">
        {(['history', 'upcoming'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-lg font-semibold capitalize transition ${
              tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}>{t === 'history' ? 'Payment History' : 'Upcoming'}
          </button>
        ))}
      </div>

      {/* History */}
      {tab === 'history' && (
        <div className="space-y-2">
          {payments.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <CreditCard className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No payments recorded yet</p>
            </div>
          ) : (
            payments.map((p: any) => (
              <div key={p.id} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800">
                    {p.paymentMethod || 'Payment'}
                    {p.bankName && <span className="text-gray-400 font-normal"> · {p.bankName}</span>}
                  </p>
                  <p className="text-xs text-gray-400">{fmtDate(p.paymentDate)}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-base font-bold text-green-700">{fmt(p.amount)}</p>
                  <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">{p.status || 'Completed'}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Upcoming */}
      {tab === 'upcoming' && (
        <div className="space-y-2">
          {upcoming.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Clock className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No upcoming milestones</p>
            </div>
          ) : (
            upcoming.map((m: any, i: number) => {
              const isOverdue = m.status === 'OVERDUE';
              return (
                <div key={i} className={`rounded-xl border p-4 flex items-center gap-3 ${
                  isOverdue ? 'bg-red-50 border-red-100' : 'bg-white border-gray-100'
                }`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    isOverdue ? 'bg-red-100' : 'bg-orange-50'
                  }`}>
                    {isOverdue
                      ? <AlertCircle className="w-5 h-5 text-red-500" />
                      : <Clock className="w-5 h-5 text-orange-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800">{m.name || `Milestone ${m.sequence}`}</p>
                    <p className="text-xs text-gray-400">
                      Flat {m.flatNumber}
                      {m.dueDate && <> · Due {fmtDate(m.dueDate)}</>}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-base font-bold text-gray-900">{fmt(m.amount)}</p>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      isOverdue ? 'text-red-700 bg-red-100' : 'text-orange-700 bg-orange-100'
                    }`}>{m.status}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
