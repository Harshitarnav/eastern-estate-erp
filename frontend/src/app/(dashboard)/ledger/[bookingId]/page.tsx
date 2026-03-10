'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Download,
  Loader2,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  IndianRupee,
  Eye,
  Phone,
  Mail,
  MessageSquare,
  Copy,
  Check,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { paymentPlansService, LedgerResponse, LedgerRow } from '@/services/payment-plans.service';
import { generateLedgerPdf } from '@/lib/generate-ledger-pdf';
import { toast } from 'sonner';

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmtINR = (n: number) =>
  '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fmtDate = (s: string | null | undefined) => {
  if (!s) return '—';
  try {
    return new Date(s).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch { return s; }
};

const statusBadge = (status: string | undefined) => {
  if (!status) return null;
  const map: Record<string, string> = {
    PENDING:   'bg-gray-100 text-gray-600',
    TRIGGERED: 'bg-yellow-100 text-yellow-700',
    OVERDUE:   'bg-red-100 text-red-700',
    PAID:      'bg-green-100 text-green-700',
    COMPLETED: 'bg-green-100 text-green-700',
    FAILED:    'bg-red-100 text-red-700',
    CANCELLED: 'bg-gray-100 text-gray-500',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${map[status] ?? 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  );
};

// ── Summary card ──────────────────────────────────────────────────────────────
function SummaryCard({
  label,
  value,
  sub,
  colorClass,
  icon,
}: {
  label: string;
  value: string;
  sub?: string;
  colorClass: string;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{label}</p>
            <p className={`text-xl font-bold ${colorClass}`}>{value}</p>
            {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
          </div>
          <div className={`p-2 rounded-lg bg-opacity-10 ${colorClass}`}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Share Panel ───────────────────────────────────────────────────────────────
function SharePanel({ ledger, onExport, exporting }: {
  ledger: LedgerResponse;
  onExport: () => void;
  exporting: boolean;
}) {
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const phone   = ledger.customer?.phone ?? '';
  const email   = ledger.customer?.email ?? '';
  const name    = ledger.customer?.fullName ?? 'Customer';
  const unit    = [ledger.flat?.property, ledger.flat?.tower, ledger.flat?.flatNumber].filter(Boolean).join(' › ');
  const balance = ledger.summary?.balance ?? 0;

  const copy = (text: string, setCopied: (v: boolean) => void) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const waText = encodeURIComponent(
    `Dear ${name},\n\nPlease find your payment statement for Unit ${unit}.\n\n` +
    `Outstanding Balance: ₹${Number(balance).toLocaleString('en-IN')}\n\n` +
    `Please download the attached ledger PDF shared by our accounts team.\n\nThank you,\nEastern Estate`,
  );
  const waLink = phone
    ? `https://wa.me/91${phone.replace(/\D/g, '').slice(-10)}?text=${waText}`
    : null;

  return (
    <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 flex-wrap">
      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Share with customer</span>
      {/* Phone */}
      {phone && (
        <div className="flex items-center gap-1.5">
          <Phone className="h-3.5 w-3.5 text-gray-400" />
          <span className="text-sm text-gray-700">{phone}</span>
          <button
            onClick={() => copy(phone, setCopiedPhone)}
            className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-700"
            title="Copy phone"
          >
            {copiedPhone ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
        </div>
      )}
      {/* Email */}
      {email && (
        <div className="flex items-center gap-1.5">
          <Mail className="h-3.5 w-3.5 text-gray-400" />
          <span className="text-sm text-gray-700">{email}</span>
          <button
            onClick={() => copy(email, setCopiedEmail)}
            className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-700"
            title="Copy email"
          >
            {copiedEmail ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
        </div>
      )}
      {/* WhatsApp */}
      {waLink && (
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#25D366] hover:bg-[#1ebe5d] text-white text-xs font-medium transition-colors"
        >
          <MessageSquare className="h-3.5 w-3.5" />
          WhatsApp
        </a>
      )}
      {/* Download PDF */}
      <Button
        size="sm"
        onClick={onExport}
        disabled={exporting}
        variant="outline"
        className="ml-auto border-[#A8211B] text-[#A8211B] hover:bg-[#A8211B] hover:text-white"
      >
        {exporting ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Download className="h-4 w-4 mr-1.5" />}
        Download PDF
      </Button>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function LedgerPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params?.bookingId as string;

  const [ledger, setLedger] = useState<LedgerResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (!bookingId) return;
    (async () => {
      try {
        const data = await paymentPlansService.getLedger(bookingId);
        setLedger(data);
      } catch (err: any) {
        const msg =
          err?.response?.data?.message ?? err?.message ?? 'Failed to load ledger';
        setError(Array.isArray(msg) ? msg.join(', ') : msg);
      } finally {
        setLoading(false);
      }
    })();
  }, [bookingId]);

  const handleExportPdf = () => {
    if (!ledger) return;
    setExporting(true);
    try {
      generateLedgerPdf(ledger);
      toast.success('Ledger PDF downloaded!');
    } catch {
      toast.error('Failed to generate PDF');
    } finally {
      setExporting(false);
    }
  };

  // ── Loading / error states ──────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-[#A8211B]" />
      </div>
    );
  }

  if (error || !ledger) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
          <AlertTriangle className="h-10 w-10 text-red-500 mx-auto mb-3" />
          <p className="text-lg font-semibold text-red-700">Ledger not available</p>
          <p className="text-sm text-red-500 mt-1">{error ?? 'No payment plan found for this booking.'}</p>
          <Button variant="outline" className="mt-4" onClick={() => router.back()}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const { summary, customer, flat, booking, plan, rows } = ledger;
  const unitLabel = [flat?.property, flat?.tower, flat?.flatNumber].filter(Boolean).join(' › ');

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* ── Header ── */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#7B1E12]">Unit-wise Ledger</h1>
            <p className="text-gray-500 mt-0.5 text-sm">
              {unitLabel || 'Unit'} — {customer?.fullName ?? 'Customer'}
            </p>
            {booking?.bookingNumber && (
              <p className="text-xs text-gray-400">Booking: {booking.bookingNumber}</p>
            )}
          </div>
          <div className="flex gap-2">
            {plan?.id && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/payment-plans/${plan.id}`)}
              >
                <Eye className="h-4 w-4 mr-1.5" /> Payment Plan
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* ── Summary cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <SummaryCard
          label="Agreement Value"
          value={fmtINR(plan.totalAmount)}
          colorClass="text-gray-800"
          icon={<IndianRupee className="h-5 w-5 text-gray-500" />}
        />
        <SummaryCard
          label="Total Demanded"
          value={fmtINR(summary.totalDemanded)}
          sub={`${rows.filter(r => r.type === 'DEMAND').length} demand(s)`}
          colorClass="text-amber-700"
          icon={<TrendingDown className="h-5 w-5 text-amber-600" />}
        />
        <SummaryCard
          label="Total Paid"
          value={fmtINR(summary.totalPaid)}
          sub={`${rows.filter(r => r.type === 'PAYMENT').length} payment(s)`}
          colorClass="text-green-700"
          icon={<TrendingUp className="h-5 w-5 text-green-600" />}
        />
        <SummaryCard
          label="Outstanding Balance"
          value={fmtINR(summary.balance)}
          sub={summary.overdueCount > 0 ? `${summary.overdueCount} overdue` : undefined}
          colorClass={summary.balance > 0 ? 'text-red-700' : 'text-green-700'}
          icon={
            summary.balance > 0
              ? <AlertTriangle className="h-5 w-5 text-red-500" />
              : <CheckCircle2 className="h-5 w-5 text-green-500" />
          }
        />
      </div>

      {/* ── Share Panel ── */}
      <SharePanel ledger={ledger} onExport={handleExportPdf} exporting={exporting} />

      {/* ── Flags ── */}
      {(summary.overdueCount > 0 || summary.pendingMilestones > 0) && (
        <div className="flex gap-3 mb-4 flex-wrap">
          {summary.overdueCount > 0 && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-700">
              <AlertTriangle className="h-4 w-4" />
              {summary.overdueCount} overdue milestone{summary.overdueCount > 1 ? 's' : ''}
            </div>
          )}
          {summary.pendingMilestones > 0 && (
            <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-sm text-blue-700">
              <Clock className="h-4 w-4" />
              {summary.pendingMilestones} upcoming milestone{summary.pendingMilestones > 1 ? 's' : ''} (not yet due)
            </div>
          )}
        </div>
      )}

      {/* ── Ledger Table ── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Transaction Statement</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {rows.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <IndianRupee className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No demands or payments recorded yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="w-[110px]">Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right w-[140px] text-amber-700">
                      Demanded (₹)
                    </TableHead>
                    <TableHead className="text-right w-[130px] text-green-700">
                      Paid (₹)
                    </TableHead>
                    <TableHead className="text-right w-[140px] font-semibold">
                      Balance (₹)
                    </TableHead>
                    <TableHead className="w-[110px]">Status</TableHead>
                    <TableHead className="w-[80px]">Link</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row: LedgerRow, idx: number) => {
                    const isDemand = row.type === 'DEMAND';
                    return (
                      <TableRow
                        key={idx}
                        className={
                          isDemand
                            ? 'bg-amber-50/40 hover:bg-amber-50'
                            : 'bg-green-50/30 hover:bg-green-50'
                        }
                      >
                        <TableCell className="text-xs text-gray-500 whitespace-nowrap">
                          {fmtDate(row.date)}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className={`text-sm font-medium ${isDemand ? 'text-amber-800' : 'text-green-800'}`}>
                              {row.description}
                            </p>
                            {row.reference && (
                              <p className="text-xs text-gray-400">Ref: {row.reference}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {isDemand ? (
                            <span className="font-medium text-amber-700">
                              {fmtINR(row.debit)}
                            </span>
                          ) : (
                            <span className="text-gray-300 text-xs">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {!isDemand ? (
                            <span className="font-medium text-green-700">
                              {fmtINR(row.credit)}
                            </span>
                          ) : (
                            <span className="text-gray-300 text-xs">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          <span className={row.balance > 0 ? 'text-red-700' : 'text-green-700'}>
                            {fmtINR(row.balance)}
                          </span>
                        </TableCell>
                        <TableCell>{statusBadge(row.status)}</TableCell>
                        <TableCell>
                          {isDemand && row.demandDraftId && (
                            <button
                              onClick={() => router.push(`/demand-drafts/${row.demandDraftId}`)}
                              className="text-xs text-blue-600 hover:underline"
                            >
                              View Draft
                            </button>
                          )}
                          {!isDemand && row.paymentId && (
                            <button
                              onClick={() => router.push(`/payments/${row.paymentId}`)}
                              className="text-xs text-blue-600 hover:underline"
                            >
                              View Receipt
                            </button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}

                  {/* Closing balance row */}
                  <TableRow className="bg-gray-100 font-bold border-t-2">
                    <TableCell colSpan={2} className="text-sm font-bold text-gray-700">
                      Closing Balance
                    </TableCell>
                    <TableCell className="text-right text-amber-700 font-bold">
                      {fmtINR(summary.totalDemanded)}
                    </TableCell>
                    <TableCell className="text-right text-green-700 font-bold">
                      {fmtINR(summary.totalPaid)}
                    </TableCell>
                    <TableCell
                      className={`text-right font-bold text-lg ${
                        summary.balance > 0 ? 'text-red-700' : 'text-green-700'
                      }`}
                    >
                      {fmtINR(summary.balance)}
                    </TableCell>
                    <TableCell colSpan={2} />
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Footer note ── */}
      <p className="text-xs text-gray-400 text-center mt-4">
        Amber rows = Demand notices issued &nbsp;|&nbsp; Green rows = Payments received
      </p>
    </div>
  );
}
