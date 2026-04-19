'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Download, FileSpreadsheet, Loader2,
  RefreshCw, IndianRupee, TrendingUp,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { reportsService, CollectionRow, CollectionReport } from '@/services/reports.service';
import { propertiesService } from '@/services/properties.service';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { TableRowsSkeleton } from '@/components/Skeletons';

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmtINR = (n: number) =>
  '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

const fmtDate = (s: string) => {
  if (!s || s === '-') return '-';
  try { return new Date(s).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch { return s; }
};

const brandRed = '#A8211B';

const PAYMENT_METHODS = ['CASH', 'CHEQUE', 'BANK_TRANSFER', 'UPI', 'CARD', 'OTHER'];

// ── PDF export ────────────────────────────────────────────────────────────────
function exportPdf(report: CollectionReport, filters: { propertyLabel?: string; startDate?: string; endDate?: string }) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const PW = 297; const ML = 10;

  doc.setFillColor(brandRed);
  doc.rect(0, 0, PW, 22, 'F');
  doc.setFont('helvetica', 'bold'); doc.setFontSize(13); doc.setTextColor('#fff');
  doc.text('EASTERN ESTATE - COLLECTION REPORT', ML, 10);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(8);
  const parts = [
    filters.propertyLabel && `Property: ${filters.propertyLabel}`,
    filters.startDate && `From: ${fmtDate(filters.startDate)}`,
    filters.endDate && `To: ${fmtDate(filters.endDate)}`,
    `Generated: ${new Date().toLocaleDateString('en-IN')}`,
  ].filter(Boolean).join('   |   ');
  doc.text(parts, ML, 17);

  let y = 27;
  const s = report.summary;
  doc.setFontSize(8); doc.setFont('helvetica', 'bold'); doc.setTextColor('#333');
  doc.text(`Payments: ${s.totalPayments}   |   Total Collected: ${fmtINR(s.totalAmount)}`, ML, y);
  y += 6;

  autoTable(doc, {
    startY: y, margin: { left: ML, right: ML },
    head: [['#', 'Date', 'Property', 'Tower', 'Flat', 'Customer', 'Booking', 'Amount (₹)', 'Method', 'Type', 'Status', 'Receipt', 'Ref']],
    body: report.rows.map((r, i) => [
      i + 1, fmtDate(r.paymentDate),
      r.property, r.tower, r.flatNumber,
      r.customerName, r.bookingNumber,
      fmtINR(r.amount),
      r.paymentMethod.replace(/_/g, ' '), r.paymentType, r.status,
      r.receiptNumber, r.reference,
    ]),
    foot: [['', '', '', '', '', '', 'TOTAL', fmtINR(s.totalAmount), '', '', '', '', '']],
    headStyles: { fillColor: brandRed, textColor: '#fff', fontSize: 7, fontStyle: 'bold', cellPadding: 2 },
    bodyStyles: { fontSize: 7, cellPadding: 2 },
    footStyles: { fillColor: brandRed, textColor: '#fff', fontSize: 7, fontStyle: 'bold' },
    columnStyles: { 0: { cellWidth: 8, halign: 'center' }, 7: { halign: 'right', fontStyle: 'bold' } },
    theme: 'grid',
  });

  doc.save(`collection_report_${new Date().toISOString().slice(0, 10)}.pdf`);
}

// ── Excel export ──────────────────────────────────────────────────────────────
function exportExcel(report: CollectionReport) {
  const data = [
    ['#', 'Date', 'Property', 'Tower', 'Flat', 'Customer', 'Phone', 'Booking No',
     'Amount (₹)', 'Method', 'Type', 'Status', 'Receipt No', 'Reference'],
    ...report.rows.map((r, i) => [
      i + 1, r.paymentDate, r.property, r.tower, r.flatNumber,
      r.customerName, r.customerPhone, r.bookingNumber,
      r.amount, r.paymentMethod, r.paymentType, r.status,
      r.receiptNumber, r.reference,
    ]),
    [], ['', '', '', '', '', '', '', 'TOTAL', report.summary.totalAmount, '', '', '', '', ''],
  ];
  const ws = XLSX.utils.aoa_to_sheet(data);
  ws['!cols'] = [5, 14, 15, 12, 10, 20, 14, 14, 14, 14, 12, 12, 14, 18].map(w => ({ wch: w }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Collection');
  XLSX.writeFile(wb, `collection_report_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function CollectionReportPage() {
  const router = useRouter();
  const [report, setReport] = useState<CollectionReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState<{ id: string; name: string }[]>([]);

  // Filters
  const [propertyId, setPropertyId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await reportsService.getCollection({
        propertyId: propertyId || undefined,
        paymentMethod: paymentMethod || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      setReport(data);
    } catch {
      toast.error('Failed to load collection report');
    } finally {
      setLoading(false);
    }
  }, [propertyId, paymentMethod, startDate, endDate]);

  useEffect(() => {
    (async () => {
      try {
        const res = await propertiesService.getProperties({ limit: 200 });
        setProperties(res.data ?? []);
      } catch { /* ignore */ }
    })();
  }, []);

  useEffect(() => { load(); }, [load]);

  const propertyLabel = properties.find(p => p.id === propertyId)?.name;

  return (
    <div className="p-6 max-w-full">
      {/* Header */}
      <div className="mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <button onClick={() => router.push('/reports')}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-2">
            <ArrowLeft className="h-4 w-4" /> Reports
          </button>
          <h1 className="text-2xl font-bold text-[#7B1E12]">Collection Report</h1>
          <p className="text-sm text-gray-500 mt-0.5">All payments received, filterable by property, method & date range</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {report && (
            <>
              <Button variant="outline" size="sm"
                onClick={() => { exportExcel(report); toast.success('Excel downloaded'); }}>
                <FileSpreadsheet className="h-4 w-4 mr-1.5 text-green-600" /> Excel
              </Button>
              <Button size="sm" className="bg-[#A8211B] hover:bg-[#8b1a15] text-white"
                onClick={() => { exportPdf(report, { propertyLabel, startDate, endDate }); toast.success('PDF downloaded'); }}>
                <Download className="h-4 w-4 mr-1.5" /> PDF
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-5 flex-wrap items-end">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">Property</label>
          <select value={propertyId} onChange={e => setPropertyId(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#A8211B]">
            <option value="">All Properties</option>
            {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">Payment Method</label>
          <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#A8211B]">
            <option value="">All Methods</option>
            {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m.replace(/_/g, ' ')}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">From Date</label>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#A8211B]" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">To Date</label>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#A8211B]" />
        </div>
        {(propertyId || paymentMethod || startDate || endDate) && (
          <button onClick={() => { setPropertyId(''); setPaymentMethod(''); setStartDate(''); setEndDate(''); }}
            className="text-xs text-gray-400 hover:text-gray-600 underline mt-4">
            Clear filters
          </button>
        )}
      </div>

      {/* Summary cards */}
      {report && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          <Card><CardContent className="p-3">
            <p className="text-xs text-gray-400 uppercase">Total Payments</p>
            <p className="text-lg font-bold text-gray-800 mt-0.5">{report.summary.totalPayments}</p>
          </CardContent></Card>
          <Card><CardContent className="p-3">
            <p className="text-xs text-gray-400 uppercase">Total Collected</p>
            <p className="text-lg font-bold text-green-700 mt-0.5">{fmtINR(report.summary.totalAmount)}</p>
          </CardContent></Card>
          <Card><CardContent className="p-3">
            <p className="text-xs text-gray-400 uppercase mb-1">By Method</p>
            <div className="flex flex-wrap gap-1">
              {Object.entries(report.summary.byMethod).map(([m, v]) => (
                <span key={m} className="text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">
                  {m.replace(/_/g, ' ')}: {fmtINR(v)}
                </span>
              ))}
            </div>
          </CardContent></Card>
          <Card><CardContent className="p-3">
            <p className="text-xs text-gray-400 uppercase mb-1">By Status</p>
            <div className="flex flex-wrap gap-1">
              {Object.entries(report.summary.byStatus).map(([s, v]) => (
                <span key={s} className="text-xs bg-green-50 text-green-700 px-1.5 py-0.5 rounded">
                  {s}: {fmtINR(v)}
                </span>
              ))}
            </div>
          </CardContent></Card>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <TableRowsSkeleton rows={7} cols={6} />
      ) : !report || report.rows.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <TrendingUp className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No payments found for the selected filters.</p>
        </div>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 text-xs">
                  <TableHead className="w-8">#</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Property / Tower / Flat</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Booking</TableHead>
                  <TableHead className="text-right text-green-700 font-semibold">Amount (₹)</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Receipt</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead className="w-20">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {report.rows.map((row: CollectionRow, idx: number) => (
                  <TableRow key={row.paymentId} className="hover:bg-green-50/20">
                    <TableCell className="text-xs text-gray-400">{idx + 1}</TableCell>
                    <TableCell className="text-xs whitespace-nowrap">{fmtDate(row.paymentDate)}</TableCell>
                    <TableCell>
                      <p className="font-medium text-sm">{row.flatNumber}</p>
                      <p className="text-xs text-gray-400">{[row.property, row.tower].filter(b => b && b !== '-').join(' › ')}</p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{row.customerName}</p>
                      {row.customerPhone !== '-' && (
                        <p className="text-xs text-gray-400">{row.customerPhone}</p>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-gray-500">{row.bookingNumber}</TableCell>
                    <TableCell className="text-right font-bold text-green-700">
                      {fmtINR(row.amount)}
                    </TableCell>
                    <TableCell>
                      <span className="text-xs px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700">
                        {row.paymentMethod.replace(/_/g, ' ')}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                        row.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                        row.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {row.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-gray-500">{row.receiptNumber !== '-' ? row.receiptNumber : '-'}</TableCell>
                    <TableCell className="text-xs text-gray-400">{row.reference !== '-' ? row.reference : '-'}</TableCell>
                    <TableCell>
                      <button onClick={() => router.push(`/payments/${row.paymentId}`)}
                        className="text-xs text-blue-600 hover:underline">
                        View
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex justify-end px-4 py-3 border-t bg-gray-50 text-sm font-semibold">
            <span>Total Collected: <span className="text-green-700">{fmtINR(report.summary.totalAmount)}</span></span>
          </div>
        </Card>
      )}
    </div>
  );
}
