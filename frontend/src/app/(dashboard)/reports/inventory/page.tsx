'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Box, Building2, Download, FileSpreadsheet,
  Home, Loader2, RefreshCw, TrendingUp,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { reportsService, InventoryRow, InventoryReport } from '@/services/reports.service';
import { propertiesService } from '@/services/properties.service';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { TableRowsSkeleton } from '@/components/Skeletons';

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmtINR = (n: number | null) =>
  n == null ? '-' : '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

const brandRed = '#A8211B';

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  AVAILABLE:          { bg: '#d1fae5', text: '#065f46' },
  ON_HOLD:            { bg: '#fef3c7', text: '#92400e' },
  BLOCKED:            { bg: '#fee2e2', text: '#991b1b' },
  BOOKED:             { bg: '#dbeafe', text: '#1e40af' },
  SOLD:               { bg: '#ede9fe', text: '#4c1d95' },
  UNDER_CONSTRUCTION: { bg: '#f3f4f6', text: '#374151' },
};

const ALL_STATUSES = ['AVAILABLE', 'ON_HOLD', 'BLOCKED', 'BOOKED', 'SOLD', 'UNDER_CONSTRUCTION'];
const ALL_TYPES = ['STUDIO', '1BHK', '2BHK', '3BHK', '4BHK', 'PENTHOUSE', 'DUPLEX', 'VILLA'];

// ── PDF export ────────────────────────────────────────────────────────────────
function exportPdf(report: InventoryReport, filters: { propertyLabel?: string; towerLabel?: string; statusLabel?: string }) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const PW = 297; const ML = 10;

  doc.setFillColor(brandRed);
  doc.rect(0, 0, PW, 22, 'F');
  doc.setFont('helvetica', 'bold'); doc.setFontSize(13); doc.setTextColor('#fff');
  doc.text('EASTERN ESTATE - STOCK INVENTORY REPORT', ML, 10);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(8);
  const sub = [
    filters.propertyLabel && `Property: ${filters.propertyLabel}`,
    filters.towerLabel && `Tower: ${filters.towerLabel}`,
    filters.statusLabel && `Status: ${filters.statusLabel}`,
    `Generated: ${new Date().toLocaleDateString('en-IN')}`,
  ].filter(Boolean).join('   |   ');
  doc.text(sub, ML, 17);

  let y = 28;
  const s = report.summary;
  doc.setFontSize(8); doc.setTextColor('#333');
  const summaryItems = [
    `Total Units: ${s.total}`,
    `Available: ${s.byStatus['AVAILABLE'] ?? 0}  (${s.availablePercent}%)`,
    `Booked/Sold: ${(s.byStatus['BOOKED'] ?? 0) + (s.byStatus['SOLD'] ?? 0)}`,
    `Total Inventory Value: ${fmtINR(s.totalValue)}`,
    `Booked Value: ${fmtINR(s.bookedValue)}`,
  ];
  const colW = (PW - 2 * ML) / summaryItems.length;
  summaryItems.forEach((item, i) => {
    doc.text(item, ML + i * colW, y);
  });

  y += 10;

  autoTable(doc, {
    startY: y,
    head: [['Property', 'Tower', 'Unit #', 'Type', 'Floor', 'Area (sqft)', 'Price', 'Status', 'Customer', 'Booking #', 'Booked On']],
    body: report.rows.map((r) => [
      r.property,
      r.tower,
      r.flatNumber,
      r.flatType,
      r.floor ?? '-',
      r.carpetArea ? r.carpetArea.toLocaleString('en-IN') : '-',
      fmtINR(r.finalPrice),
      r.status.replace(/_/g, ' '),
      r.customerName ?? '-',
      r.bookingNumber ?? '-',
      r.bookingDate ?? '-',
    ]),
    styles: { fontSize: 7, cellPadding: 2 },
    headStyles: { fillColor: [168, 33, 27], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [252, 248, 244] },
    columnStyles: {
      6: { halign: 'right' },
      7: { fontStyle: 'bold' },
    },
    margin: { left: ML, right: ML },
  });

  doc.save(`inventory-report-${new Date().toISOString().split('T')[0]}.pdf`);
}

// ── Excel export ──────────────────────────────────────────────────────────────
function exportExcel(report: InventoryReport) {
  const data = report.rows.map((r) => ({
    Property: r.property,
    Tower: r.tower,
    'Unit #': r.flatNumber,
    Type: r.flatType,
    Floor: r.floor ?? '',
    'Carpet Area (sqft)': r.carpetArea ?? '',
    'Built-up Area (sqft)': r.builtUpArea ?? '',
    'Base Price': r.basePrice ?? '',
    'Final Price': r.finalPrice ?? '',
    Status: r.status,
    Customer: r.customerName ?? '',
    'Customer Phone': r.customerPhone ?? '',
    'Booking #': r.bookingNumber ?? '',
    'Booking Date': r.bookingDate ?? '',
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  ws['!cols'] = [
    { wch: 20 }, { wch: 12 }, { wch: 10 }, { wch: 8 }, { wch: 6 },
    { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 18 },
    { wch: 22 }, { wch: 14 }, { wch: 16 }, { wch: 14 },
  ];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Inventory');
  XLSX.writeFile(wb, `inventory-report-${new Date().toISOString().split('T')[0]}.xlsx`);
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function InventoryReportPage() {
  const router = useRouter();

  const [report, setReport] = useState<InventoryReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState<{ id: string; name: string }[]>([]);

  // filters
  const [propertyId, setPropertyId] = useState('');
  const [towerId, setTowerId] = useState('');
  const [status, setStatus] = useState('');
  const [flatType, setFlatType] = useState('');
  const [towers, setTowers] = useState<{ id: string; name: string }[]>([]);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const data = await reportsService.getInventory({
        propertyId: propertyId || undefined,
        towerId: towerId || undefined,
        status: status || undefined,
        flatType: flatType || undefined,
      });
      setReport(data);
    } catch {
      toast.error('Failed to load inventory report');
    } finally {
      setLoading(false);
    }
  }, [propertyId, towerId, status, flatType]);

  useEffect(() => {
    propertiesService.getProperties().then((p) => {
      const list = Array.isArray(p) ? p : ((p as any).data ?? []);
      setProperties(list.map((x: any) => ({ id: x.id, name: x.name })));
    });
    fetchReport();
  }, []);  // eslint-disable-line

  // When property changes, load its towers
  useEffect(() => {
    if (!propertyId) { setTowers([]); setTowerId(''); return; }
    propertiesService.getPropertyById(propertyId).then((p: any) => {
      setTowers((p?.towers ?? []).map((t: any) => ({ id: t.id, name: t.name })));
      setTowerId('');
    }).catch(() => setTowers([]));
  }, [propertyId]);

  const s = report?.summary;

  const STAT_CARDS = [
    { label: 'Total Units',  value: s?.total ?? 0,                       icon: <Building2 className="h-5 w-5" />,  color: 'text-gray-700' },
    { label: 'Available',    value: s?.byStatus['AVAILABLE'] ?? 0,        icon: <Home className="h-5 w-5" />,       color: 'text-emerald-600' },
    { label: 'Booked',       value: s?.byStatus['BOOKED'] ?? 0,           icon: <Box className="h-5 w-5" />,        color: 'text-blue-600' },
    { label: 'Sold',         value: s?.byStatus['SOLD'] ?? 0,             icon: <TrendingUp className="h-5 w-5" />, color: 'text-purple-600' },
    { label: 'On Hold',      value: s?.byStatus['ON_HOLD'] ?? 0,          icon: <Box className="h-5 w-5" />,        color: 'text-amber-600' },
    { label: 'Available %',  value: `${s?.availablePercent ?? 0}%`,       icon: <TrendingUp className="h-5 w-5" />, color: 'text-teal-600' },
  ];

  const propertyLabel = properties.find((p) => p.id === propertyId)?.name;
  const towerLabel = towers.find((t) => t.id === towerId)?.name;

  return (
    <div className="space-y-6 p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => router.push('/reports')}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Reports
          </Button>
          <div>
            <h1 className="text-xl font-bold" style={{ color: brandRed }}>Stock Inventory Report</h1>
            <p className="text-sm text-gray-500">Property / tower-wise flat availability</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchReport} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {report && (
            <>
              <Button variant="outline" size="sm"
                onClick={() => exportPdf(report, { propertyLabel, towerLabel, statusLabel: status || undefined })}>
                <Download className="h-4 w-4 mr-1" /> PDF
              </Button>
              <Button variant="outline" size="sm" onClick={() => exportExcel(report)}>
                <FileSpreadsheet className="h-4 w-4 mr-1" /> Excel
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            <select
              value={propertyId}
              onChange={(e) => setPropertyId(e.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
            >
              <option value="">All Properties</option>
              {properties.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>

            <select
              value={towerId}
              onChange={(e) => setTowerId(e.target.value)}
              disabled={!propertyId || towers.length === 0}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 disabled:opacity-50"
            >
              <option value="">All Towers</option>
              {towers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
            >
              <option value="">All Statuses</option>
              {ALL_STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
            </select>

            <select
              value={flatType}
              onChange={(e) => setFlatType(e.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
            >
              <option value="">All Types</option>
              {ALL_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>

            <Button size="sm" onClick={fetchReport} disabled={loading}
              style={{ backgroundColor: brandRed, color: '#fff' }}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {STAT_CARDS.map((c) => (
          <Card key={c.label}>
            <CardContent className="p-4">
              <div className={`flex items-center gap-2 ${c.color} mb-1`}>{c.icon}<span className="text-xs font-semibold uppercase tracking-wide">{c.label}</span></div>
              <p className={`text-2xl font-bold ${c.color}`}>{c.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Status breakdown strip */}
      {s && s.total > 0 && (
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">Status Breakdown</p>
            <div className="flex flex-wrap gap-3">
              {Object.entries(s.byStatus).map(([st, count]) => {
                const col = STATUS_COLORS[st] ?? { bg: '#f3f4f6', text: '#374151' };
                return (
                  <div key={st} className="flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold"
                    style={{ backgroundColor: col.bg, color: col.text }}>
                    <span>{st.replace(/_/g, ' ')}</span>
                    <span className="rounded-full bg-white/60 px-1.5 py-0.5 text-xs">{count}</span>
                  </div>
                );
              })}
            </div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3 mt-4">By BHK Type</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(s.byType).map(([type, count]) => (
                <span key={type} className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-700">
                  {type}: {count}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Value summary */}
      {s && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Total Inventory Value</p>
              <p className="text-2xl font-bold mt-1" style={{ color: brandRed }}>{fmtINR(s.totalValue)}</p>
              <p className="text-xs text-gray-400 mt-1">Sum of final price of all {s.total} units</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Booked / Sold Value</p>
              <p className="text-2xl font-bold mt-1 text-purple-700">{fmtINR(s.bookedValue)}</p>
              <p className="text-xs text-gray-400 mt-1">
                {s.total > 0 ? `${Math.round((s.bookedValue / s.totalValue) * 100)}% of total inventory` : '-'}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <TableRowsSkeleton rows={7} cols={6} />
          ) : !report || report.rows.length === 0 ? (
            <div className="py-16 text-center text-sm text-gray-400">No units match the current filters.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead>Property</TableHead>
                    <TableHead>Tower</TableHead>
                    <TableHead>Unit #</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-center">Floor</TableHead>
                    <TableHead className="text-right">Carpet (sqft)</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Booking #</TableHead>
                    <TableHead>Booked On</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {report.rows.map((row) => {
                    const col = STATUS_COLORS[row.status] ?? { bg: '#f3f4f6', text: '#374151' };
                    return (
                      <TableRow
                        key={row.flatId}
                        className="cursor-pointer hover:bg-gray-50/60"
                        onClick={() => router.push(`/flats/${row.flatId}`)}
                      >
                        <TableCell className="font-medium text-sm">{row.property}</TableCell>
                        <TableCell className="text-sm text-gray-600">{row.tower}</TableCell>
                        <TableCell className="font-mono text-sm">{row.flatNumber}</TableCell>
                        <TableCell className="text-sm">
                          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-700">
                            {row.flatType}
                          </span>
                        </TableCell>
                        <TableCell className="text-center text-sm text-gray-600">{row.floor ?? '-'}</TableCell>
                        <TableCell className="text-right text-sm tabular-nums">
                          {row.carpetArea ? row.carpetArea.toLocaleString('en-IN') : '-'}
                        </TableCell>
                        <TableCell className="text-right font-semibold text-sm tabular-nums" style={{ color: brandRed }}>
                          {fmtINR(row.finalPrice)}
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="rounded-full px-2.5 py-1 text-xs font-semibold"
                            style={{ backgroundColor: col.bg, color: col.text }}>
                            {row.status.replace(/_/g, ' ')}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm">
                          {row.customerName ? (
                            <div>
                              <div className="font-medium">{row.customerName}</div>
                              {row.customerPhone && <div className="text-xs text-gray-400">{row.customerPhone}</div>}
                            </div>
                          ) : (
                            <span className="text-gray-400 text-xs">Unoccupied</span>
                          )}
                        </TableCell>
                        <TableCell className="font-mono text-sm text-gray-600">{row.bookingNumber ?? '-'}</TableCell>
                        <TableCell className="text-sm text-gray-500">{row.bookingDate ?? '-'}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {report && (
        <p className="text-xs text-gray-400 text-right">
          {report.rows.length} unit{report.rows.length === 1 ? '' : 's'} shown · Click any row to open the flat detail
        </p>
      )}
    </div>
  );
}
