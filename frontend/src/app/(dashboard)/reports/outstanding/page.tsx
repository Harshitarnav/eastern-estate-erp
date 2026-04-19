'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertTriangle,
  ArrowLeft,
  Download,
  FileSpreadsheet,
  Loader2,
  RefreshCw,
  IndianRupee,
  Users,
  TrendingDown,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { reportsService, OutstandingRow, OutstandingReport } from '@/services/reports.service';
import { propertiesService } from '@/services/properties.service';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { TableRowsSkeleton } from '@/components/Skeletons';

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmtINR = (n: number) =>
  '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

const brandRed = '#A8211B';

// ── PDF export ────────────────────────────────────────────────────────────────
function exportPdf(report: OutstandingReport, filters: { propertyLabel?: string; towerLabel?: string }) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const PW = 297; const ML = 10;

  doc.setFillColor(brandRed);
  doc.rect(0, 0, PW, 22, 'F');
  doc.setFont('helvetica', 'bold'); doc.setFontSize(13); doc.setTextColor('#fff');
  doc.text('EASTERN ESTATE - OUTSTANDING REPORT', ML, 10);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(8);
  const sub = [
    filters.propertyLabel && `Property: ${filters.propertyLabel}`,
    filters.towerLabel && `Tower: ${filters.towerLabel}`,
    `Generated: ${new Date().toLocaleDateString('en-IN')}`,
  ].filter(Boolean).join('   |   ');
  doc.text(sub, ML, 17);

  // summary row
  let y = 28;
  const s = report.summary;
  doc.setFontSize(8); doc.setTextColor('#333');
  const summaryItems = [
    `Units: ${s.totalUnits}`,
    `Agreement Value: ${fmtINR(s.totalAgreementValue)}`,
    `Total Demanded: ${fmtINR(s.totalDemanded)}`,
    `Total Paid: ${fmtINR(s.totalPaid)}`,
    `Outstanding: ${fmtINR(s.totalOutstanding)}`,
    `Units w/ Overdue: ${s.unitsWithOverdue}`,
  ];
  doc.setFont('helvetica', 'bold');
  doc.text(summaryItems.join('   |   '), ML, y);
  y += 6;

  autoTable(doc, {
    startY: y,
    margin: { left: ML, right: ML },
    head: [['#', 'Property', 'Tower', 'Flat', 'Type', 'Customer', 'Phone',
            'Agreement (₹)', 'Demanded (₹)', 'Paid (₹)', 'Outstanding (₹)', 'Overdue', 'Status']],
    body: report.rows.map((r, i) => [
      i + 1,
      r.property, r.tower, r.flatNumber, r.flatType,
      r.customerName, r.customerPhone,
      fmtINR(r.totalAmount),
      fmtINR(r.totalDemanded),
      fmtINR(r.totalPaid),
      fmtINR(r.outstanding),
      r.overdueMilestones > 0 ? `${r.overdueMilestones} (${r.oldestOverdueDays ?? '?'}d)` : '-',
      r.planStatus,
    ]),
    foot: [['', '', '', '', '', '', 'TOTAL',
      fmtINR(s.totalAgreementValue),
      fmtINR(s.totalDemanded),
      fmtINR(s.totalPaid),
      fmtINR(s.totalOutstanding),
      '', '']],
    headStyles: { fillColor: brandRed, textColor: '#fff', fontSize: 7, fontStyle: 'bold', cellPadding: 2 },
    bodyStyles: { fontSize: 7, cellPadding: 2 },
    footStyles: { fillColor: brandRed, textColor: '#fff', fontSize: 7, fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      7: { halign: 'right' }, 8: { halign: 'right' },
      9: { halign: 'right' }, 10: { halign: 'right', fontStyle: 'bold' },
    },
    didParseCell: (data: any) => {
      if (data.section === 'body') {
        const row: OutstandingRow = report.rows[data.row.index];
        if (row?.overdueMilestones > 0 && data.column.index === 10) {
          data.cell.styles.textColor = '#B91C1C';
          data.cell.styles.fontStyle = 'bold';
        }
      }
    },
    theme: 'grid',
  });

  doc.save(`outstanding_report_${new Date().toISOString().slice(0, 10)}.pdf`);
}

// ── Excel export ──────────────────────────────────────────────────────────────
function exportExcel(report: OutstandingReport) {
  const data = [
    ['#', 'Property', 'Tower', 'Flat', 'Type', 'Customer', 'Phone', 'Booking No',
     'Agreement (₹)', 'Demanded (₹)', 'Paid (₹)', 'Outstanding (₹)', 'Overdue Milestones', 'Oldest Overdue (days)', 'Status'],
    ...report.rows.map((r, i) => [
      i + 1, r.property, r.tower, r.flatNumber, r.flatType, r.customerName, r.customerPhone, r.bookingNumber,
      r.totalAmount, r.totalDemanded, r.totalPaid, r.outstanding,
      r.overdueMilestones, r.oldestOverdueDays ?? '', r.planStatus,
    ]),
    [],
    ['', '', '', '', '', '', '', 'TOTAL',
     report.summary.totalAgreementValue, report.summary.totalDemanded,
     report.summary.totalPaid, report.summary.totalOutstanding, '', '', ''],
  ];

  const ws = XLSX.utils.aoa_to_sheet(data);
  ws['!cols'] = [5, 15, 12, 10, 8, 20, 14, 14, 14, 14, 14, 14, 10, 10, 10].map(w => ({ wch: w }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Outstanding');
  XLSX.writeFile(wb, `outstanding_report_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function OutstandingReportPage() {
  const router = useRouter();
  const [report, setReport] = useState<OutstandingReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState<{ id: string; name: string }[]>([]);

  const [propertyId, setPropertyId] = useState('');
  const [status, setStatus] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await reportsService.getOutstanding({
        propertyId: propertyId || undefined,
        status: status || undefined,
      });
      setReport(data);
    } catch {
      toast.error('Failed to load outstanding report');
    } finally {
      setLoading(false);
    }
  }, [propertyId, status]);

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
          <h1 className="text-2xl font-bold text-[#7B1E12]">Outstanding Report</h1>
          <p className="text-sm text-gray-500 mt-0.5">Unit-wise breakdown of amounts demanded vs paid</p>
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
                onClick={() => { exportPdf(report, { propertyLabel }); toast.success('PDF downloaded'); }}>
                <Download className="h-4 w-4 mr-1.5" /> PDF
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <select value={propertyId} onChange={e => setPropertyId(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#A8211B]">
          <option value="">All Properties</option>
          {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <select value={status} onChange={e => setStatus(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#A8211B]">
          <option value="">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </div>

      {/* Summary cards */}
      {report && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-5">
          {[
            { label: 'Total Units', value: report.summary.totalUnits.toString(), icon: <Users className="h-4 w-4" />, color: 'text-gray-700' },
            { label: 'Agreement Value', value: fmtINR(report.summary.totalAgreementValue), icon: <IndianRupee className="h-4 w-4" />, color: 'text-gray-700' },
            { label: 'Total Demanded', value: fmtINR(report.summary.totalDemanded), icon: <TrendingDown className="h-4 w-4" />, color: 'text-amber-700' },
            { label: 'Total Paid', value: fmtINR(report.summary.totalPaid), icon: <IndianRupee className="h-4 w-4" />, color: 'text-green-700' },
            { label: 'Outstanding', value: fmtINR(report.summary.totalOutstanding), icon: <AlertTriangle className="h-4 w-4" />, color: 'text-red-700' },
            { label: 'Units w/ Overdue', value: report.summary.unitsWithOverdue.toString(), icon: <AlertTriangle className="h-4 w-4" />, color: report.summary.unitsWithOverdue > 0 ? 'text-red-700' : 'text-gray-500' },
          ].map(c => (
            <Card key={c.label}>
              <CardContent className="p-3">
                <p className="text-xs text-gray-400 uppercase tracking-wide">{c.label}</p>
                <p className={`text-base font-bold mt-0.5 ${c.color}`}>{c.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Table */}
      {loading ? (
        <TableRowsSkeleton rows={7} cols={6} />
      ) : !report || report.rows.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <IndianRupee className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No data found for the selected filters.</p>
        </div>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 text-xs">
                  <TableHead className="w-8">#</TableHead>
                  <TableHead>Property / Tower / Flat</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Booking</TableHead>
                  <TableHead className="text-right">Agreement</TableHead>
                  <TableHead className="text-right text-amber-700">Demanded</TableHead>
                  <TableHead className="text-right text-green-700">Paid</TableHead>
                  <TableHead className="text-right text-red-700 font-semibold">Outstanding</TableHead>
                  <TableHead className="text-center">Overdue</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-20">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {report.rows.map((row, idx) => (
                  <TableRow key={row.planId}
                    className={row.overdueMilestones > 0 ? 'bg-red-50/30' : ''}>
                    <TableCell className="text-xs text-gray-400">{idx + 1}</TableCell>
                    <TableCell>
                      <p className="font-medium text-sm">{row.flatNumber}</p>
                      <p className="text-xs text-gray-400">{[row.property, row.tower].filter(Boolean).join(' › ')}</p>
                      {row.flatType !== '-' && <p className="text-xs text-gray-400">{row.flatType}</p>}
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{row.customerName}</p>
                      {row.customerPhone !== '-' && (
                        <p className="text-xs text-gray-400">{row.customerPhone}</p>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-gray-500">{row.bookingNumber}</TableCell>
                    <TableCell className="text-right text-sm">{fmtINR(row.totalAmount)}</TableCell>
                    <TableCell className="text-right text-sm text-amber-700">{fmtINR(row.totalDemanded)}</TableCell>
                    <TableCell className="text-right text-sm text-green-700">{fmtINR(row.totalPaid)}</TableCell>
                    <TableCell className="text-right font-bold">
                      <span className={row.outstanding > 0 ? 'text-red-700' : 'text-green-700'}>
                        {fmtINR(row.outstanding)}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      {row.overdueMilestones > 0 ? (
                        <span className="inline-flex flex-col items-center">
                          <span className="text-xs font-bold text-red-700">{row.overdueMilestones}</span>
                          {row.oldestOverdueDays != null && (
                            <span className="text-xs text-red-400">{row.oldestOverdueDays}d ago</span>
                          )}
                        </span>
                      ) : <span className="text-gray-300 text-xs">-</span>}
                    </TableCell>
                    <TableCell>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                        row.planStatus === 'ACTIVE' ? 'bg-blue-100 text-blue-700' :
                        row.planStatus === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {row.planStatus}
                      </span>
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() => router.push(`/ledger/${row.bookingId}`)}
                        className="text-xs text-blue-600 hover:underline">
                        Ledger
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {/* Footer totals */}
          <div className="flex justify-end gap-6 px-4 py-3 border-t bg-gray-50 text-sm font-semibold">
            <span>Demanded: <span className="text-amber-700">{fmtINR(report.summary.totalDemanded)}</span></span>
            <span>Paid: <span className="text-green-700">{fmtINR(report.summary.totalPaid)}</span></span>
            <span>Outstanding: <span className="text-red-700">{fmtINR(report.summary.totalOutstanding)}</span></span>
          </div>
        </Card>
      )}
    </div>
  );
}
