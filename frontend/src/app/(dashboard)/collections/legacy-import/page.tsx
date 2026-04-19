'use client';

import React, { useCallback, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Loader2,
  Play,
  Send,
  Upload,
  X,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  LegacyBookingInput,
  LegacyCustomerInput,
  LegacyImportPayload,
  LegacyImportPreview,
  LegacyImportResult,
  LegacyMilestoneInput,
  LegacyPaymentInput,
  legacyImportService,
} from '@/services/legacy-import.service';

// ────────────────────────────────────────────────────────────────────────
// Template specification
// ────────────────────────────────────────────────────────────────────────
const SHEET_SPEC = [
  {
    sheet: 'customers',
    columns: [
      'rowId',
      'existingCustomerId',
      'fullName',
      'email',
      'phoneNumber',
      'panNumber',
      'aadharNumber',
      'addressLine1',
      'city',
      'state',
      'pincode',
      'notes',
    ],
  },
  {
    sheet: 'bookings',
    columns: [
      'rowId',
      'customerRowId',
      'existingCustomerId',
      'flatId',
      'bookingNumber',
      'bookingDate',
      'totalAmount',
      'tokenAmount',
      'initialEscalationLevel',
      'remindersEnabled',
    ],
  },
  {
    sheet: 'milestones',
    columns: [
      'bookingRowId',
      'sequence',
      'name',
      'description',
      'amount',
      'paymentPercentage',
      'dueDate',
      'constructionPhase',
      'phasePercentage',
      'status',
    ],
  },
  {
    sheet: 'payments',
    columns: [
      'bookingRowId',
      'milestoneSequence',
      'amount',
      'paymentDate',
      'paymentMode',
      'referenceNumber',
      'notes',
    ],
  },
];

function downloadTemplate() {
  const wb = XLSX.utils.book_new();
  for (const s of SHEET_SPEC) {
    const ws = XLSX.utils.aoa_to_sheet([s.columns]);
    XLSX.utils.book_append_sheet(wb, ws, s.sheet);
  }
  XLSX.writeFile(wb, 'legacy-import-template.xlsx');
}

// Parse cell value robustly into the shape the API expects.
function coerceNumber(v: any): number | undefined {
  if (v === undefined || v === null || v === '') return undefined;
  const n = typeof v === 'number' ? v : Number(String(v).replace(/[,\s]/g, ''));
  return Number.isFinite(n) ? n : undefined;
}

function coerceDateISO(v: any): string | undefined {
  if (!v && v !== 0) return undefined;
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  // Excel stores dates as numbers (serial). xlsx returns them as Dates when cellDates=true.
  if (typeof v === 'number' && v > 20000) {
    const d = XLSX.SSF ? XLSX.SSF.parse_date_code?.(v) : null;
    if (d) {
      const mm = String(d.m).padStart(2, '0');
      const dd = String(d.d).padStart(2, '0');
      return `${d.y}-${mm}-${dd}`;
    }
  }
  const s = String(v).trim();
  if (!s) return undefined;
  const parsed = new Date(s);
  if (Number.isNaN(parsed.getTime())) return s;
  return parsed.toISOString().slice(0, 10);
}

function coerceBool(v: any): boolean | undefined {
  if (v === undefined || v === null || v === '') return undefined;
  const s = String(v).trim().toLowerCase();
  if (['true', 'yes', 'y', '1'].includes(s)) return true;
  if (['false', 'no', 'n', '0'].includes(s)) return false;
  return undefined;
}

function pickString(v: any): string | undefined {
  if (v === undefined || v === null) return undefined;
  const s = String(v).trim();
  return s ? s : undefined;
}

function parseWorkbook(buf: ArrayBuffer): LegacyImportPayload | { error: string } {
  try {
    const wb = XLSX.read(buf, { type: 'array', cellDates: true });

    function readSheet(name: string): any[] {
      const ws = wb.Sheets[name];
      if (!ws) return [];
      return XLSX.utils.sheet_to_json<any>(ws, { defval: '', raw: false });
    }

    const customersRaw = readSheet('customers');
    const bookingsRaw = readSheet('bookings');
    const milestonesRaw = readSheet('milestones');
    const paymentsRaw = readSheet('payments');

    const customers: LegacyCustomerInput[] = customersRaw
      .filter((r) => pickString(r.rowId))
      .map((r) => ({
        rowId: String(r.rowId).trim(),
        existingCustomerId: pickString(r.existingCustomerId),
        fullName: pickString(r.fullName),
        email: pickString(r.email),
        phoneNumber: pickString(r.phoneNumber),
        panNumber: pickString(r.panNumber),
        aadharNumber: pickString(r.aadharNumber),
        addressLine1: pickString(r.addressLine1),
        city: pickString(r.city),
        state: pickString(r.state),
        pincode: pickString(r.pincode),
        notes: pickString(r.notes),
      }));

    const bookings: LegacyBookingInput[] = bookingsRaw
      .filter((r) => pickString(r.rowId))
      .map((r) => ({
        rowId: String(r.rowId).trim(),
        customerRowId: pickString(r.customerRowId),
        existingCustomerId: pickString(r.existingCustomerId),
        flatId: pickString(r.flatId) ?? '',
        bookingNumber: pickString(r.bookingNumber),
        bookingDate: coerceDateISO(r.bookingDate) ?? '',
        totalAmount: coerceNumber(r.totalAmount) ?? 0,
        tokenAmount: coerceNumber(r.tokenAmount),
        initialEscalationLevel: (coerceNumber(r.initialEscalationLevel) as any) ?? 0,
        remindersEnabled: coerceBool(r.remindersEnabled),
      }));

    const milestones: LegacyMilestoneInput[] = milestonesRaw
      .filter((r) => pickString(r.bookingRowId))
      .map((r) => ({
        bookingRowId: String(r.bookingRowId).trim(),
        sequence: coerceNumber(r.sequence) ?? 0,
        name: pickString(r.name) ?? '',
        description: pickString(r.description),
        amount: coerceNumber(r.amount) ?? 0,
        paymentPercentage: coerceNumber(r.paymentPercentage),
        dueDate: coerceDateISO(r.dueDate),
        constructionPhase: pickString(r.constructionPhase),
        phasePercentage: coerceNumber(r.phasePercentage),
        status: pickString(r.status) as any,
      }));

    const payments: LegacyPaymentInput[] = paymentsRaw
      .filter((r) => pickString(r.bookingRowId))
      .map((r) => ({
        bookingRowId: String(r.bookingRowId).trim(),
        milestoneSequence: coerceNumber(r.milestoneSequence),
        amount: coerceNumber(r.amount) ?? 0,
        paymentDate: coerceDateISO(r.paymentDate) ?? '',
        paymentMode: pickString(r.paymentMode) ?? 'OTHER',
        referenceNumber: pickString(r.referenceNumber),
        notes: pickString(r.notes),
      }));

    return { customers, bookings, milestones, payments };
  } catch (err: any) {
    return { error: err?.message || 'Failed to parse workbook' };
  }
}

function formatINR(n: number): string {
  if (!Number.isFinite(n)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(n);
}

export default function LegacyImportPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState('');
  const [payload, setPayload] = useState<LegacyImportPayload | null>(null);
  const [parseError, setParseError] = useState('');
  const [preview, setPreview] = useState<LegacyImportPreview | null>(null);
  const [result, setResult] = useState<LegacyImportResult | null>(null);
  const [loading, setLoading] = useState<'parsing' | 'preview' | 'commit' | null>(null);

  const onFileChosen = async (file: File) => {
    setFileName(file.name);
    setPayload(null);
    setPreview(null);
    setResult(null);
    setParseError('');
    setLoading('parsing');
    try {
      const buf = await file.arrayBuffer();
      const parsed = parseWorkbook(buf);
      if ('error' in parsed) {
        setParseError(parsed.error);
        setLoading(null);
        return;
      }
      setPayload(parsed);
      toast.success(
        `Parsed ${parsed.customers.length} customers · ${parsed.bookings.length} bookings · ${parsed.milestones.length} milestones · ${parsed.payments?.length ?? 0} payments`,
      );
    } catch (err: any) {
      setParseError(err?.message || 'Failed to read file');
    } finally {
      setLoading(null);
    }
  };

  const runPreview = async () => {
    if (!payload) return;
    setLoading('preview');
    setPreview(null);
    try {
      const pv = await legacyImportService.preview(payload);
      setPreview(pv);
      if (pv.errors.length > 0) toast.error(`${pv.errors.length} validation errors`);
      else toast.success('Preview clean – ready to commit');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Preview failed');
    } finally {
      setLoading(null);
    }
  };

  const runCommit = async () => {
    if (!payload || !preview || preview.errors.length > 0) return;
    if (!confirm(
      `Import ${preview.summary.bookings} bookings, ${preview.summary.milestones} milestones, ${preview.summary.payments} payments?\nThis will also materialize ~${preview.summary.estimatedOverdueMilestones} DRAFT demand drafts for overdue milestones.\n\nImports are wrapped in a transaction but are hard to fully undo – proceed?`,
    )) return;
    setLoading('commit');
    setResult(null);
    try {
      const withBatch: LegacyImportPayload = {
        ...payload,
        importBatchId: preview.importBatchId,
      };
      const r = await legacyImportService.commit(withBatch);
      setResult(r);
      toast.success('Legacy import committed');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Commit failed');
    } finally {
      setLoading(null);
    }
  };

  const runScan = async () => {
    setLoading('preview');
    try {
      const r = await legacyImportService.scanNow();
      toast.success(
        `Scanner: ${r.remindersSent ?? 0} reminders, ${r.warningsPrepared ?? 0} warnings prepared`,
      );
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Scanner failed');
    } finally {
      setLoading(null);
    }
  };

  const canPreview = !!payload && !loading;
  const canCommit = !!preview && preview.errors.length === 0 && !loading;

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            href="/collections"
            className="text-sm text-gray-500 hover:underline inline-flex items-center gap-1 mb-1"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Collections
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Legacy Bulk Import</h1>
          <p className="text-sm text-gray-500 mt-1 max-w-2xl">
            Upload an Excel file containing historical customers, bookings, payment milestones
            and past payments. Preview validates the file without writing to the database. Commit
            writes everything in a single transaction and materializes overdue milestones as
            DRAFT demand drafts for human review in the Collections workstation.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={downloadTemplate}>
            <Download className="h-4 w-4 mr-2" />
            Download Template
          </Button>
          <Button variant="outline" onClick={runScan} disabled={loading !== null}>
            {loading === 'preview' ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Play className="h-4 w-4 mr-2" />
            )}
            Run Scanner
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Step 1: upload */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <span className="h-6 w-6 rounded-full bg-red-100 text-red-900 text-xs font-bold flex items-center justify-center">
                1
              </span>
              Upload workbook
            </CardTitle>
            <CardDescription className="text-xs">
              Required sheets: <code>customers</code>, <code>bookings</code>,{' '}
              <code>milestones</code>. Optional: <code>payments</code>. Headers must match the
              template exactly.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-red-400 hover:bg-red-50/40 transition"
              onClick={() => fileInputRef.current?.click()}
              onDrop={(e) => {
                e.preventDefault();
                const f = e.dataTransfer.files?.[0];
                if (f) onFileChosen(f);
              }}
              onDragOver={(e) => e.preventDefault()}
            >
              <FileSpreadsheet className="h-10 w-10 mx-auto text-gray-400" />
              <div className="mt-3 text-sm text-gray-700 font-medium">
                {fileName ? fileName : 'Drag & drop or click to choose .xlsx / .xls / .csv'}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Max ~2,000 bookings per file recommended.
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) onFileChosen(f);
                }}
              />
            </div>
            {parseError && (
              <div className="mt-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded p-2">
                {parseError}
              </div>
            )}
            {payload && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                <StatTile label="Customers" value={payload.customers.length} />
                <StatTile label="Bookings" value={payload.bookings.length} />
                <StatTile label="Milestones" value={payload.milestones.length} />
                <StatTile label="Payments" value={payload.payments?.length ?? 0} />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Step 2 & 3: preview + commit */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <span className="h-6 w-6 rounded-full bg-red-100 text-red-900 text-xs font-bold flex items-center justify-center">
                  2
                </span>
                Validate
              </CardTitle>
              <CardDescription className="text-xs">
                Dry-run: checks every row without writing anything.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                onClick={runPreview}
                disabled={!canPreview}
                className="w-full"
                variant="outline"
              >
                {loading === 'preview' ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                Run Preview
              </Button>
              {preview && <PreviewSummary preview={preview} />}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <span className="h-6 w-6 rounded-full bg-red-100 text-red-900 text-xs font-bold flex items-center justify-center">
                  3
                </span>
                Commit
              </CardTitle>
              <CardDescription className="text-xs">
                Writes customers, bookings, plans, payments and creates DRAFT demand drafts
                for overdue milestones.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={runCommit}
                disabled={!canCommit}
                className="w-full"
              >
                {loading === 'commit' ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Commit to Database
              </Button>
              {result && (
                <div className="mt-3 border rounded bg-emerald-50 p-3 text-sm space-y-1">
                  <div className="font-medium text-emerald-900 flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4" />
                    Committed batch {result.importBatchId}
                  </div>
                  <ul className="text-xs text-emerald-900 space-y-0.5">
                    <li>Customers: {result.created.customers}</li>
                    <li>Bookings: {result.created.bookings}</li>
                    <li>Plans: {result.created.plans}</li>
                    <li>Milestones: {result.created.milestones}</li>
                    <li>Payments: {result.created.payments}</li>
                    <li>Draft Demand Drafts: {result.created.demandDrafts}</li>
                  </ul>
                  {result.errors.length > 0 && (
                    <div className="text-xs text-red-700 mt-2">
                      {result.errors.length} non-fatal errors — review logs.
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Instructions accordion */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Column reference</CardTitle>
          <CardDescription className="text-xs">
            Every value must match one of the columns defined in the template. Missing columns
            are treated as empty.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {SHEET_SPEC.map((s) => (
              <div key={s.sheet} className="border rounded p-3">
                <div className="font-medium text-sm text-gray-900 mb-1">{s.sheet}</div>
                <ul className="text-xs text-gray-600 space-y-0.5">
                  {s.columns.map((c) => (
                    <li key={c}>
                      <code className="text-[11px]">{c}</code>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-4 text-xs text-gray-600 space-y-1">
            <p>
              <strong>rowId</strong> is a temporary identifier you invent (eg
              <code> c1, c2, b1, b2 </code>) to link customers ↔ bookings ↔ milestones ↔ payments
              within the same file. It is NOT stored in the database – it only helps the
              importer correlate rows.
            </p>
            <p>
              <strong>existingCustomerId</strong> can be supplied instead of customer fields if
              the customer already exists in the ERP. The importer will then attach the booking
              to that customer without creating a duplicate.
            </p>
            <p>
              <strong>initialEscalationLevel</strong> (0-3) controls where a legacy milestone
              starts in the reminder ladder on first scan after import. Use 0 for "not overdue
              yet", 1 for "first reminder", 2 for "second reminder", 3 for "final reminder".
            </p>
            <p>
              <strong>remindersEnabled</strong> is optional: leave blank and the importer will
              auto-disable reminders for plans whose oldest overdue exceeds the configured
              legacy threshold (default 180 days).
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="border rounded p-3 bg-white">
      <div className="text-[11px] uppercase text-gray-500 tracking-wide">{label}</div>
      <div className="text-xl font-semibold text-gray-900 mt-1">{value.toLocaleString()}</div>
    </div>
  );
}

function PreviewSummary({ preview }: { preview: LegacyImportPreview }) {
  const hasErrors = preview.errors.length > 0;
  const hasWarnings = preview.warnings.length > 0;
  return (
    <div className="mt-3 border rounded p-3 text-sm bg-white space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-500">Batch: {preview.importBatchId}</div>
        <Badge
          variant="outline"
          className={
            hasErrors
              ? 'bg-red-50 text-red-800 border-red-200'
              : hasWarnings
                ? 'bg-amber-50 text-amber-800 border-amber-200'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
          }
        >
          {hasErrors ? 'Errors' : hasWarnings ? 'Warnings' : 'Clean'}
        </Badge>
      </div>
      <ul className="text-xs text-gray-700 space-y-0.5">
        <li>New customers: {preview.summary.customers}</li>
        <li>Existing customers referenced: {preview.summary.existingCustomersReferenced}</li>
        <li>Bookings: {preview.summary.bookings}</li>
        <li>Milestones: {preview.summary.milestones}</li>
        <li>Payments: {preview.summary.payments}</li>
        <li className="font-medium">
          Draft DDs to be materialized: {preview.summary.estimatedOverdueMilestones}
        </li>
      </ul>
      {hasErrors && (
        <div className="border rounded bg-red-50 border-red-200 p-2">
          <div className="text-xs font-medium text-red-900 mb-1 flex items-center gap-1">
            <X className="h-3 w-3" /> {preview.errors.length} errors
          </div>
          <ul className="text-[11px] text-red-800 space-y-0.5 max-h-40 overflow-y-auto">
            {preview.errors.slice(0, 100).map((e, i) => (
              <li key={i}>• {e}</li>
            ))}
            {preview.errors.length > 100 && (
              <li>… and {preview.errors.length - 100} more.</li>
            )}
          </ul>
        </div>
      )}
      {hasWarnings && (
        <div className="border rounded bg-amber-50 border-amber-200 p-2">
          <div className="text-xs font-medium text-amber-900 mb-1 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" /> {preview.warnings.length} warnings
          </div>
          <ul className="text-[11px] text-amber-800 space-y-0.5 max-h-40 overflow-y-auto">
            {preview.warnings.slice(0, 50).map((w, i) => (
              <li key={i}>• {w}</li>
            ))}
            {preview.warnings.length > 50 && (
              <li>… and {preview.warnings.length - 50} more.</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
