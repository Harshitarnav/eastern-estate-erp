'use client';

/**
 * Day Book ("रोजनामचा")
 *
 * The single view a Tally/Excel accountant wants at start of day:
 *   "show me every transaction I posted between these dates, chronologically."
 *
 * Renders journal entries grouped by date with per-day Dr/Cr totals and a
 * grand total. Two presentations of the same data:
 *   - Desktop (md+): a compact nested table, optimised for density.
 *   - Mobile (< md): stacked cards with tap-to-expand, optimised for thumb.
 *
 * Exports to Excel for upload into Tally / email to CA.
 */

import { useEffect, useMemo, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  FileSpreadsheet,
  Filter,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { TableRowsSkeleton } from '@/components/Skeletons';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';
import {
  journalEntriesService,
  type JournalEntry,
  type JournalEntryLine,
} from '@/services/accounting.service';
import { usePropertyStore } from '@/store/propertyStore';

const fmtINR = (n: number) =>
  '₹' +
  Number(n || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

const todayStr = () => format(new Date(), 'yyyy-MM-dd');
const firstOfMonthStr = () => {
  const d = new Date();
  return format(new Date(d.getFullYear(), d.getMonth(), 1), 'yyyy-MM-dd');
};

type StatusFilter = 'ALL' | 'POSTED' | 'DRAFT';

interface DayGroup {
  date: string; // yyyy-MM-dd
  entries: JournalEntry[];
  totalDebit: number;
  totalCredit: number;
}

export default function DayBookPage() {
  const { selectedProperties, properties } = usePropertyStore();

  const [startDate, setStartDate] = useState<string>(firstOfMonthStr());
  const [endDate, setEndDate] = useState<string>(todayStr());
  const [status, setStatus] = useState<StatusFilter>('POSTED');
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params: { startDate: string; endDate: string; status?: string } = {
        startDate,
        endDate,
      };
      if (status !== 'ALL') params.status = status;
      const data = await journalEntriesService.getAll(params);
      setEntries(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to load day book');
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, status]);

  useEffect(() => {
    load();
  }, [load]);

  /** Filter by selected properties if the user has picked specific ones. */
  const scopedEntries = useMemo(() => {
    if (!selectedProperties.length) return entries;
    const allowed = new Set(selectedProperties);
    return entries.filter((e) => {
      // Include entries explicitly tagged to a selected property.
      // Also include untagged (company-wide) entries by default so they don't vanish.
      if (!e.propertyId) return true;
      return allowed.has(e.propertyId);
    });
  }, [entries, selectedProperties]);

  /** Group entries by entryDate (yyyy-MM-dd). */
  const groups: DayGroup[] = useMemo(() => {
    const byDate = new Map<string, JournalEntry[]>();
    for (const e of scopedEntries) {
      const key = e.entryDate.slice(0, 10);
      const arr = byDate.get(key) ?? [];
      arr.push(e);
      byDate.set(key, arr);
    }
    const out: DayGroup[] = [];
    for (const [date, dayEntries] of byDate) {
      const sorted = dayEntries
        .slice()
        .sort((a, b) => a.entryNumber.localeCompare(b.entryNumber));
      out.push({
        date,
        entries: sorted,
        totalDebit: sorted.reduce((s, e) => s + Number(e.totalDebit || 0), 0),
        totalCredit: sorted.reduce((s, e) => s + Number(e.totalCredit || 0), 0),
      });
    }
    out.sort((a, b) => b.date.localeCompare(a.date));
    return out;
  }, [scopedEntries]);

  const grandDebit = groups.reduce((s, g) => s + g.totalDebit, 0);
  const grandCredit = groups.reduce((s, g) => s + g.totalCredit, 0);
  const totalEntries = scopedEntries.length;

  const propertyNameById = useMemo(() => {
    const m = new Map<string, string>();
    for (const p of properties) m.set(p.id, p.name);
    return m;
  }, [properties]);

  /**
   * Export to Excel. One row per journal entry line so the sheet can be
   * pivoted or dropped into Tally's excel import.
   */
  const handleExport = () => {
    const rows: Array<Record<string, string | number>> = [];
    for (const g of groups) {
      for (const e of g.entries) {
        if (!e.lines?.length) {
          rows.push({
            Date: format(new Date(e.entryDate), 'dd-MMM-yyyy'),
            'Voucher No': e.entryNumber,
            Narration: e.description,
            'Ref Type': e.referenceType || '',
            Project: e.propertyId
              ? propertyNameById.get(e.propertyId) || e.property?.name || ''
              : '',
            Status: e.status,
            'Account Code': '',
            'Account Name': '',
            'Line Narration': '',
            'Debit (₹)': Number(e.totalDebit || 0),
            'Credit (₹)': Number(e.totalCredit || 0),
          });
          continue;
        }
        for (const l of e.lines) {
          rows.push({
            Date: format(new Date(e.entryDate), 'dd-MMM-yyyy'),
            'Voucher No': e.entryNumber,
            Narration: e.description,
            'Ref Type': e.referenceType || '',
            Project: e.propertyId
              ? propertyNameById.get(e.propertyId) || e.property?.name || ''
              : '',
            Status: e.status,
            'Account Code': l.account?.accountCode || '',
            'Account Name': l.account?.accountName || '',
            'Line Narration': l.description || '',
            'Debit (₹)': Number(l.debitAmount || 0),
            'Credit (₹)': Number(l.creditAmount || 0),
          });
        }
      }
    }
    rows.push({
      Date: '',
      'Voucher No': '',
      Narration: 'TOTAL',
      'Ref Type': '',
      Project: '',
      Status: '',
      'Account Code': '',
      'Account Name': '',
      'Line Narration': '',
      'Debit (₹)': grandDebit,
      'Credit (₹)': grandCredit,
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);
    ws['!cols'] = [
      { wch: 12 },
      { wch: 14 },
      { wch: 40 },
      { wch: 12 },
      { wch: 20 },
      { wch: 10 },
      { wch: 12 },
      { wch: 28 },
      { wch: 30 },
      { wch: 14 },
      { wch: 14 },
    ];
    XLSX.utils.book_append_sheet(wb, ws, 'Day Book');
    XLSX.writeFile(wb, `day-book_${startDate}_to_${endDate}.xlsx`);
  };

  const setRange = (
    preset: 'today' | 'week' | 'month' | 'prev-month' | 'fy',
  ) => {
    const now = new Date();
    if (preset === 'today') {
      const s = format(now, 'yyyy-MM-dd');
      setStartDate(s);
      setEndDate(s);
      return;
    }
    if (preset === 'week') {
      const first = new Date(now);
      first.setDate(now.getDate() - 6);
      setStartDate(format(first, 'yyyy-MM-dd'));
      setEndDate(format(now, 'yyyy-MM-dd'));
      return;
    }
    if (preset === 'month') {
      setStartDate(
        format(new Date(now.getFullYear(), now.getMonth(), 1), 'yyyy-MM-dd'),
      );
      setEndDate(format(now, 'yyyy-MM-dd'));
      return;
    }
    if (preset === 'prev-month') {
      const first = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const last = new Date(now.getFullYear(), now.getMonth(), 0);
      setStartDate(format(first, 'yyyy-MM-dd'));
      setEndDate(format(last, 'yyyy-MM-dd'));
      return;
    }
    if (preset === 'fy') {
      // Indian FY: Apr 1 to Mar 31.
      const y = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
      setStartDate(`${y}-04-01`);
      setEndDate(format(now, 'yyyy-MM-dd'));
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Header: compact, wraps cleanly on mobile */}
      <div className="flex flex-wrap items-start md:items-center gap-2 md:gap-3">
        <Link href="/accounting" className="inline-flex">
          <Button variant="ghost" size="sm" className="px-2">
            <ArrowLeft className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Back</span>
          </Button>
        </Link>
        <CalendarDays
          className="h-5 w-5 md:h-6 md:w-6"
          style={{ color: '#A8211B' }}
        />
        <div className="flex-1 min-w-0">
          <h1 className="text-xl md:text-2xl font-bold leading-tight">
            Day Book
          </h1>
          <p className="text-xs md:text-sm text-gray-500 hidden sm:block">
            Every voucher posted, grouped by date - the first thing to check
            every morning.
          </p>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={load}
            disabled={loading}
            title="Reload from server"
            className="h-9"
          >
            <RefreshCw
              className={`h-4 w-4 ${loading ? 'animate-spin' : ''} sm:mr-1`}
            />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Button
            size="sm"
            onClick={handleExport}
            disabled={!groups.length}
            style={{ backgroundColor: '#A8211B', color: 'white' }}
            className="h-9"
          >
            <FileSpreadsheet className="h-4 w-4 sm:mr-1" />
            <span className="hidden sm:inline">Export Excel</span>
            <span className="sm:hidden sr-only">Export Excel</span>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-2 md:pb-3">
          <CardTitle className="text-sm md:text-base flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" /> Date range &amp;
            filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 md:space-y-4">
          {/* Preset chips: horizontal scroll on mobile */}
          <div className="-mx-1 overflow-x-auto">
            <div className="flex gap-2 px-1 pb-1 whitespace-nowrap">
              {[
                { k: 'today' as const, label: 'Today' },
                { k: 'week' as const, label: 'Last 7 days' },
                { k: 'month' as const, label: 'This month' },
                { k: 'prev-month' as const, label: 'Prev month' },
                { k: 'fy' as const, label: 'This FY' },
              ].map((p) => (
                <Button
                  key={p.k}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs flex-shrink-0"
                  onClick={() => setRange(p.k)}
                >
                  {p.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Date / status row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
            <div>
              <label className="block text-[11px] md:text-xs font-medium text-gray-600 mb-1">
                From
              </label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-9"
              />
            </div>
            <div>
              <label className="block text-[11px] md:text-xs font-medium text-gray-600 mb-1">
                To
              </label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-9"
              />
            </div>
            <div className="col-span-2 md:col-span-1">
              <label className="block text-[11px] md:text-xs font-medium text-gray-600 mb-1">
                Status
              </label>
              <select
                className="border rounded-md px-2 w-full text-sm h-9 bg-white"
                value={status}
                onChange={(e) => setStatus(e.target.value as StatusFilter)}
              >
                <option value="POSTED">Posted only</option>
                <option value="DRAFT">Drafts only</option>
                <option value="ALL">All</option>
              </select>
            </div>
            <div className="col-span-2 md:col-span-1 flex md:items-end">
              {selectedProperties.length > 0 && (
                <p className="text-[11px] md:text-xs text-gray-500 leading-snug">
                  Scoped to {selectedProperties.length} project
                  {selectedProperties.length > 1 ? 's' : ''}
                  <span className="hidden md:inline">
                    {' '}
                    (company-wide entries always shown)
                  </span>
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
        <SummaryCard label="Vouchers" value={String(totalEntries)} />
        <SummaryCard label="Days" value={String(groups.length)} />
        <SummaryCard
          label="Debit"
          value={fmtINR(grandDebit)}
          valueClass="text-blue-700"
        />
        <SummaryCard
          label="Credit"
          value={fmtINR(grandCredit)}
          valueClass="text-emerald-700"
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Day-grouped ledger */}
      {loading ? (
        <Card>
          <CardContent className="p-4 md:p-6">
            <TableRowsSkeleton rows={6} cols={5} />
          </CardContent>
        </Card>
      ) : groups.length === 0 ? (
        <Card>
          <CardContent className="p-8 md:p-12 text-center text-gray-400">
            <CalendarDays className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm">
              No vouchers in this range. Try widening the date filter or
              switching Status to "All".
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3 md:space-y-4">
          {groups.map((g) => (
            <DayGroupCard
              key={g.date}
              group={g}
              propertyNameById={propertyNameById}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <Card>
      <CardContent className="p-3 md:p-4">
        <p className="text-[10px] md:text-xs text-gray-500 font-medium uppercase tracking-wide">
          {label}
        </p>
        <p className={`text-lg md:text-xl font-bold ${valueClass || ''}`}>
          {value}
        </p>
      </CardContent>
    </Card>
  );
}

function DayGroupCard({
  group,
  propertyNameById,
}: {
  group: DayGroup;
  propertyNameById: Map<string, string>;
}) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3 border-b px-3 md:px-6 py-3 md:py-4 bg-gray-50/60">
        <div className="flex flex-wrap items-center justify-between gap-2 md:gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <CalendarDays className="h-4 w-4 text-gray-500 shrink-0" />
            <CardTitle className="text-sm md:text-base truncate">
              {format(new Date(group.date), 'EEE, dd MMM yyyy')}
            </CardTitle>
            <Badge variant="secondary" className="text-[10px] md:text-xs">
              {group.entries.length}
            </Badge>
          </div>
          <div className="flex gap-3 md:gap-4 text-[11px] md:text-xs text-gray-500 ml-auto">
            <span className="flex items-baseline gap-1">
              <span className="uppercase tracking-wide">Dr</span>
              <span className="font-semibold text-blue-700 text-sm md:text-xs tabular-nums">
                {fmtINR(group.totalDebit)}
              </span>
            </span>
            <span className="flex items-baseline gap-1">
              <span className="uppercase tracking-wide">Cr</span>
              <span className="font-semibold text-emerald-700 text-sm md:text-xs tabular-nums">
                {fmtINR(group.totalCredit)}
              </span>
            </span>
          </div>
        </div>
      </CardHeader>

      {/* Desktop table (md+). Mobile uses stacked cards below. */}
      <CardContent className="p-0 hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-[11px] uppercase tracking-wide text-gray-500">
                <th className="px-3 py-2 w-28 font-medium">Voucher</th>
                <th className="px-3 py-2 font-medium">Narration</th>
                <th className="px-3 py-2 w-40 font-medium">Project</th>
                <th className="px-3 py-2 text-right w-32 font-medium">
                  Debit
                </th>
                <th className="px-3 py-2 text-right w-32 font-medium">
                  Credit
                </th>
                <th className="px-3 py-2 w-20 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {group.entries.map((e, idx) => (
                <EntryRowsDesktop
                  key={e.id}
                  entry={e}
                  propertyNameById={propertyNameById}
                  isFirst={idx === 0}
                />
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50 border-t-2 border-gray-300 font-semibold text-[11px] uppercase tracking-wide text-gray-700">
                <td className="px-3 py-2">Day total</td>
                <td className="px-3 py-2" />
                <td className="px-3 py-2" />
                <td className="px-3 py-2 text-right text-blue-700 normal-case tracking-normal text-sm tabular-nums">
                  {fmtINR(group.totalDebit)}
                </td>
                <td className="px-3 py-2 text-right text-emerald-700 normal-case tracking-normal text-sm tabular-nums">
                  {fmtINR(group.totalCredit)}
                </td>
                <td className="px-3 py-2" />
              </tr>
            </tfoot>
          </table>
        </div>
      </CardContent>

      {/* Mobile card stack (< md) */}
      <CardContent className="p-0 md:hidden">
        <ul className="divide-y divide-gray-100">
          {group.entries.map((e) => (
            <EntryCardMobile
              key={e.id}
              entry={e}
              propertyNameById={propertyNameById}
            />
          ))}
        </ul>
        {/* Mobile day total footer */}
        <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-t-2 border-gray-200 text-[11px] uppercase tracking-wide text-gray-600 font-semibold">
          <span>Day total</span>
          <span className="flex gap-3">
            <span className="text-blue-700 tabular-nums normal-case">
              {fmtINR(group.totalDebit)}
            </span>
            <span className="text-emerald-700 tabular-nums normal-case">
              {fmtINR(group.totalCredit)}
            </span>
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function EntryRowsDesktop({
  entry,
  propertyNameById,
  isFirst,
}: {
  entry: JournalEntry;
  propertyNameById: Map<string, string>;
  isFirst?: boolean;
}) {
  const projectLabel = entry.propertyId
    ? propertyNameById.get(entry.propertyId) || entry.property?.name || '-'
    : 'Company-wide';

  const statusColor =
    entry.status === 'POSTED'
      ? 'bg-emerald-100 text-emerald-700'
      : entry.status === 'DRAFT'
      ? 'bg-amber-100 text-amber-700'
      : 'bg-gray-100 text-gray-600';

  const topBorder = isFirst ? '' : 'border-t border-gray-200';

  return (
    <>
      <tr className={`${topBorder} bg-white hover:bg-gray-50/60 transition-colors`}>
        <td className="px-3 py-2 font-mono text-xs text-gray-700 align-top">
          <Link
            href={`/accounting/journal-entries`}
            className="hover:underline text-gray-800"
            title="Open journal entries"
          >
            {entry.entryNumber}
          </Link>
        </td>
        <td className="px-3 py-2 align-top">
          <p className="text-sm text-gray-800 leading-snug">
            {entry.description}
          </p>
          {entry.referenceType && (
            <span className="text-[10px] uppercase tracking-wide text-gray-400">
              {entry.referenceType}
            </span>
          )}
        </td>
        <td className="px-3 py-2 align-top text-xs text-gray-600 truncate">
          {projectLabel}
        </td>
        <td className="px-3 py-2 align-top text-right font-medium text-blue-700 tabular-nums">
          {fmtINR(Number(entry.totalDebit || 0))}
        </td>
        <td className="px-3 py-2 align-top text-right font-medium text-emerald-700 tabular-nums">
          {fmtINR(Number(entry.totalCredit || 0))}
        </td>
        <td className="px-3 py-2 align-top">
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded font-semibold uppercase ${statusColor}`}
          >
            {entry.status}
          </span>
        </td>
      </tr>
      {(entry.lines || []).map((l: JournalEntryLine) => (
        <tr key={l.id} className="bg-gray-50/40 text-xs">
          <td className="px-3 py-1.5" />
          <td className="px-3 py-1.5 pl-6 text-gray-600">
            <span className="font-mono text-gray-500 mr-2">
              {l.account?.accountCode || '-'}
            </span>
            <span className="text-gray-800">
              {l.account?.accountName || 'Unknown account'}
            </span>
            {l.description && (
              <span className="text-gray-400"> · {l.description}</span>
            )}
          </td>
          <td className="px-3 py-1.5" />
          <td className="px-3 py-1.5 text-right text-blue-700 tabular-nums">
            {Number(l.debitAmount) > 0 ? fmtINR(Number(l.debitAmount)) : ''}
          </td>
          <td className="px-3 py-1.5 text-right text-emerald-700 tabular-nums">
            {Number(l.creditAmount) > 0 ? fmtINR(Number(l.creditAmount)) : ''}
          </td>
          <td className="px-3 py-1.5" />
        </tr>
      ))}
    </>
  );
}

/**
 * Mobile-first card for a single voucher. Always shows narration + totals;
 * account lines expand on tap. Keeps the key info (amount, status, project)
 * above the fold so accountants can scan without expanding.
 */
function EntryCardMobile({
  entry,
  propertyNameById,
}: {
  entry: JournalEntry;
  propertyNameById: Map<string, string>;
}) {
  const [open, setOpen] = useState(false);
  const hasLines = Array.isArray(entry.lines) && entry.lines.length > 0;

  const projectLabel = entry.propertyId
    ? propertyNameById.get(entry.propertyId) || entry.property?.name || '-'
    : 'Company-wide';

  const statusColor =
    entry.status === 'POSTED'
      ? 'bg-emerald-100 text-emerald-700'
      : entry.status === 'DRAFT'
      ? 'bg-amber-100 text-amber-700'
      : 'bg-gray-100 text-gray-600';

  return (
    <li className="bg-white">
      <button
        type="button"
        onClick={() => hasLines && setOpen((v) => !v)}
        className="w-full text-left px-3 py-3 flex items-start gap-2 active:bg-gray-50 transition-colors"
      >
        <div className="pt-0.5">
          {hasLines ? (
            open ? (
              <ChevronDown className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-400" />
            )
          ) : (
            <span className="inline-block w-4" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <span className="font-mono text-[11px] text-gray-500">
              {entry.entryNumber}
            </span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded font-semibold uppercase ${statusColor}`}
            >
              {entry.status}
            </span>
          </div>
          <p className="text-sm text-gray-900 leading-snug line-clamp-2">
            {entry.description}
          </p>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1 text-[11px] text-gray-500">
            <span className="truncate max-w-[60%]">{projectLabel}</span>
            {entry.referenceType && (
              <>
                <span className="text-gray-300">·</span>
                <span className="uppercase tracking-wide">
                  {entry.referenceType}
                </span>
              </>
            )}
          </div>
          <div className="flex items-center gap-4 mt-1.5">
            <span className="text-xs">
              <span className="text-gray-400 uppercase tracking-wide">
                Dr{' '}
              </span>
              <span className="font-semibold text-blue-700 tabular-nums">
                {fmtINR(Number(entry.totalDebit || 0))}
              </span>
            </span>
            <span className="text-xs">
              <span className="text-gray-400 uppercase tracking-wide">
                Cr{' '}
              </span>
              <span className="font-semibold text-emerald-700 tabular-nums">
                {fmtINR(Number(entry.totalCredit || 0))}
              </span>
            </span>
          </div>
        </div>
      </button>

      {open && hasLines && (
        <div className="bg-gray-50/80 border-t border-gray-100 px-3 py-2 space-y-1.5">
          {(entry.lines || []).map((l: JournalEntryLine) => (
            <div key={l.id} className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs text-gray-800 leading-tight truncate">
                  <span className="font-mono text-gray-500 mr-1.5">
                    {l.account?.accountCode || '-'}
                  </span>
                  {l.account?.accountName || 'Unknown account'}
                </p>
                {l.description && (
                  <p className="text-[11px] text-gray-500 truncate">
                    {l.description}
                  </p>
                )}
              </div>
              <div className="text-right shrink-0">
                {Number(l.debitAmount) > 0 && (
                  <p className="text-xs text-blue-700 tabular-nums font-medium">
                    {fmtINR(Number(l.debitAmount))}
                  </p>
                )}
                {Number(l.creditAmount) > 0 && (
                  <p className="text-xs text-emerald-700 tabular-nums font-medium">
                    {fmtINR(Number(l.creditAmount))}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </li>
  );
}
