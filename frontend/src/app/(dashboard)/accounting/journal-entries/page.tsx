'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Plus, FileText, CheckCircle, XCircle, Trash2, Eye,
  ChevronDown, ChevronUp, AlertCircle, BookOpen,
  ArrowDownLeft, ArrowUpRight, ArrowLeftRight, ReceiptText, Table2,
} from 'lucide-react';
import { journalEntriesService, accountsService, type JournalEntry, type Account } from '@/services/accounting.service';
import { format } from 'date-fns';
import { TableRowsSkeleton } from '@/components/Skeletons';
import { usePropertyStore } from '@/store/propertyStore';
import { useAuthStore } from '@/store/authStore';
import { AccountPicker, pushRecentAccount } from '@/components/accounting/AccountPicker';

/** Matches backend `isGlobalAdmin` roles that may post org-wide journals when multi-project. */
function rolesAllowOrgWideJe(user: { roles?: unknown[] } | null): boolean {
  if (!user?.roles?.length) return false;
  return user.roles.some((r: unknown) => {
    const n = (typeof r === 'string' ? r : (r as { name?: string })?.name || '')
      .toUpperCase()
      .replace(/[-_\s]/g, '');
    return n.includes('SUPERADMIN') || n.includes('HEADACCOUNTANT');
  });
}

/** Tab-separated: accountCode, debit, credit, narration (optional). From Excel: copy rows and paste here. */
function parseBulkTsv(text: string, accounts: Account[]): JELine[] | string {
  const rows: JELine[] = [];
  const rawLines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  for (let i = 0; i < rawLines.length; i++) {
    const parts = rawLines[i].split('\t');
    if (parts.length < 3) {
      return `Row ${i + 1}: use tabs between account code, debit, credit (and optional narration).`;
    }
    const code = parts[0].trim();
    const d = Number(parts[1]) || 0;
    const c = Number(parts[2]) || 0;
    const desc = (parts[3] ?? '').trim();
    const acc = accounts.find((a) => a.accountCode === code);
    if (!acc) return `Row ${i + 1}: no account with code "${code}" in the current chart list.`;
    if (d > 0 && c > 0) return `Row ${i + 1}: only debit or credit, not both.`;
    if (d === 0 && c === 0) return `Row ${i + 1}: enter a debit or credit amount.`;
    rows.push({ accountId: acc.id, debitAmount: d, creditAmount: c, description: desc });
  }
  return rows;
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface JELine {
  accountId: string;
  debitAmount: number;
  creditAmount: number;
  description: string;
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    DRAFT: 'bg-yellow-100 text-yellow-800',
    POSTED: 'bg-green-100 text-green-800',
    VOID: 'bg-gray-200 text-gray-600',
    APPROVED: 'bg-blue-100 text-blue-800',
  };
  return <Badge className={map[status] || ''}>{status}</Badge>;
}

type JePropertyOption = { id: string; name: string };

function JeFormProjectFields({
  properties,
  formPropertyId,
  onProjectChange,
  includeSharedCoa,
  onIncludeSharedCoaChange,
  propertyIdRequired,
  singleProject,
}: {
  properties: JePropertyOption[];
  formPropertyId: string;
  onProjectChange: (id: string) => void;
  includeSharedCoa: boolean;
  onIncludeSharedCoaChange: (v: boolean) => void;
  propertyIdRequired: boolean;
  singleProject: boolean;
}) {
  if (singleProject) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50/80 p-3 space-y-2">
        <p className="text-xs text-gray-700">
          <strong>Project:</strong> {properties[0]?.name ?? '-'} (single-project organization).
        </p>
        <label className="flex items-start gap-2 text-xs text-gray-700 cursor-pointer">
          <input
            type="checkbox"
            checked={includeSharedCoa}
            onChange={(e) => onIncludeSharedCoaChange(e.target.checked)}
            className="mt-0.5"
          />
          <span>
            <strong>Include company-wide accounts</strong> (shared cash/bank GL). Off = only ledgers tagged to this
            project.
          </span>
        </label>
      </div>
    );
  }
  return (
    <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50/80 p-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Related project *</label>
        <select
          className={`border rounded-md p-2 text-sm w-full max-w-md bg-white ${
            propertyIdRequired && !formPropertyId ? 'border-amber-500' : ''
          }`}
          value={formPropertyId}
          onChange={(e) => onProjectChange(e.target.value)}
        >
          {propertyIdRequired ? <option value="">Select a project…</option> : null}
          {!propertyIdRequired ? <option value="">Organization-wide (not tied to one project)</option> : null}
          {properties.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>
      {(formPropertyId || !propertyIdRequired) && (
        <label className="flex items-start gap-2 text-xs text-gray-700 cursor-pointer">
          <input
            type="checkbox"
            checked={includeSharedCoa}
            disabled={propertyIdRequired && !formPropertyId}
            onChange={(e) => onIncludeSharedCoaChange(e.target.checked)}
            className="mt-0.5"
          />
          <span>
            <strong>Include company-wide accounts</strong> (shared cash/bank GL). Turn off to show{' '}
            <em>only</em> accounts tagged to the project - use that when your chart is fully per-project.
          </span>
        </label>
      )}
    </div>
  );
}

function useJeModalAccounts(
  properties: JePropertyOption[],
  defaultProjectId: string,
  propertyIdRequired: boolean,
) {
  const singleProject = properties.length === 1;
  const [formPropertyId, setFormPropertyId] = useState(() =>
    singleProject ? properties[0].id : defaultProjectId,
  );
  const [includeSharedCoa, setIncludeSharedCoa] = useState(true);
  const [accounts, setAccounts] = useState<Account[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (singleProject) {
        const pid = properties[0].id;
        const d = await accountsService.getAll({
          propertyId: pid,
          projectOnlyCoa: !includeSharedCoa,
        });
        if (!cancelled) setAccounts(d || []);
        return;
      }
      if (!formPropertyId) {
        if (propertyIdRequired) {
          if (!cancelled) setAccounts([]);
          return;
        }
        const d = await accountsService.getAll();
        if (!cancelled) setAccounts(d || []);
        return;
      }
      const d = await accountsService.getAll({
        propertyId: formPropertyId,
        projectOnlyCoa: !includeSharedCoa,
      });
      if (!cancelled) setAccounts(d || []);
    })();
    return () => {
      cancelled = true;
    };
  }, [singleProject, properties, formPropertyId, includeSharedCoa, propertyIdRequired]);

  const effectivePropertyId: string | undefined = singleProject
    ? properties[0]?.id
    : formPropertyId.trim() || undefined;

  return {
    formPropertyId,
    setFormPropertyId,
    includeSharedCoa,
    setIncludeSharedCoa,
    accounts,
    singleProject,
    effectivePropertyId,
  };
}

// ─── New Journal Entry Modal ──────────────────────────────────────────────────
function NewJEModal({
  properties,
  defaultProjectId,
  propertyIdRequired,
  onClose,
  onCreated,
}: {
  properties: JePropertyOption[];
  defaultProjectId: string;
  propertyIdRequired: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const {
    formPropertyId,
    setFormPropertyId,
    includeSharedCoa,
    setIncludeSharedCoa,
    accounts,
    singleProject,
    effectivePropertyId,
  } = useJeModalAccounts(properties, defaultProjectId, propertyIdRequired);

  const [entryDate, setEntryDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [description, setDescription] = useState('');
  const [referenceType, setReferenceType] = useState('');
  const emptyLines = (): JELine[] => [
    { accountId: '', debitAmount: 0, creditAmount: 0, description: '' },
    { accountId: '', debitAmount: 0, creditAmount: 0, description: '' },
  ];
  const [lines, setLines] = useState<JELine[]>(emptyLines);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const totalDebit = lines.reduce((s, l) => s + (Number(l.debitAmount) || 0), 0);
  const totalCredit = lines.reduce((s, l) => s + (Number(l.creditAmount) || 0), 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

  const updateLine = (index: number, field: keyof JELine, value: string | number) => {
    setLines(prev => prev.map((l, i) => {
      if (i !== index) return l;
      // Auto-clear the opposite side (Tally-style: one side only per line)
      if (field === 'debitAmount' && Number(value) > 0) return { ...l, debitAmount: value as number, creditAmount: 0 };
      if (field === 'creditAmount' && Number(value) > 0) return { ...l, creditAmount: value as number, debitAmount: 0 };
      return { ...l, [field]: value };
    }));
  };

  const addLine = () => setLines(prev => [...prev, { accountId: '', debitAmount: 0, creditAmount: 0, description: '' }]);
  const removeLine = (index: number) => setLines(prev => prev.filter((_, i) => i !== index));

  /** Ctrl+S saves draft, Ctrl+Shift+S saves-and-new, Ctrl+Enter adds a new line. */
  const rootRef = useRef<HTMLDivElement>(null);
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
      e.preventDefault();
      if (e.shiftKey) void submit(true);
      else void submit(false);
      return;
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      addLine();
    }
  };

  /** `keepOpen` = "Save & New": save draft, reset lines, keep modal so you can type the next voucher. */
  const submit = async (keepOpen: boolean): Promise<void> => {
    setError('');
    if (propertyIdRequired && !effectivePropertyId) {
      setError('Select a related project (required when you have more than one project).');
      return;
    }
    if (!description.trim()) { setError('Description is required'); return; }
    if (!entryDate) { setError('Date is required'); return; }
    if (lines.some(l => !l.accountId)) { setError('All lines must have an account selected'); return; }

    // Each line must have EITHER debit OR credit - not both, not neither
    const badLine = lines.findIndex(l => {
      const d = Number(l.debitAmount) || 0;
      const c = Number(l.creditAmount) || 0;
      return (d > 0 && c > 0) || (d === 0 && c === 0);
    });
    if (badLine !== -1) {
      setError(`Line ${badLine + 1}: Each line must have either a Debit OR a Credit amount (not both, not empty).`);
      return;
    }

    if (!isBalanced) { setError(`Journal entry must balance. Debit: ₹${totalDebit.toLocaleString('en-IN')} ≠ Credit: ₹${totalCredit.toLocaleString('en-IN')}`); return; }

    setSaving(true);
    try {
      await journalEntriesService.create({
        entryDate,
        description,
        referenceType: referenceType || undefined,
        ...(effectivePropertyId ? { propertyId: effectivePropertyId } : {}),
        lines: lines.map(l => ({
          accountId: l.accountId,
          debitAmount: Number(l.debitAmount) || 0,
          creditAmount: Number(l.creditAmount) || 0,
          description: l.description,
        })),
      });
      // Remember recently used accounts for future pickers.
      for (const l of lines) pushRecentAccount('je-line', l.accountId);
      onCreated();
      if (keepOpen) {
        setDescription('');
        setLines(emptyLines());
        setError('');
      } else {
        onClose();
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to create journal entry');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = () => { void submit(false); };
  const handleSubmitAndNew = () => { void submit(true); };

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onKeyDown={handleKeyDown}>
      <div ref={rootRef} className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <BookOpen className="h-6 w-6" style={{ color: '#A8211B' }} />
            <h2 className="text-xl font-bold">New Journal Entry</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        <div className="p-6 space-y-5">
          <JeFormProjectFields
            properties={properties}
            formPropertyId={formPropertyId}
            onProjectChange={setFormPropertyId}
            includeSharedCoa={includeSharedCoa}
            onIncludeSharedCoaChange={setIncludeSharedCoa}
            propertyIdRequired={propertyIdRequired}
            singleProject={singleProject}
          />

          {/* Entry details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
              <Input type="date" value={entryDate} onChange={e => setEntryDate(e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description / Narration *</label>
              <Input
                placeholder="e.g. Payment received from customer for Flat A-301"
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>
          </div>
          <div className="w-48">
            <label className="block text-sm font-medium text-gray-700 mb-1">Reference Type</label>
            <select
              className="border rounded-md p-2 w-full text-sm"
              value={referenceType}
              onChange={e => setReferenceType(e.target.value)}
            >
              <option value="">- None -</option>
              <option value="PAYMENT">Payment</option>
              <option value="BOOKING">Booking</option>
              <option value="EXPENSE">Expense</option>
              <option value="SALARY">Salary</option>
              <option value="PROPERTY">Property</option>
              <option value="ADJUSTMENT">Adjustment</option>
            </select>
          </div>

          {/* Lines */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-800">Journal Lines</h3>
              <Button size="sm" variant="outline" onClick={addLine}>
                <Plus className="h-3 w-3 mr-1" /> Add Line
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left p-2 font-medium w-8">#</th>
                    <th className="text-left p-2 font-medium w-64">Account</th>
                    <th className="text-right p-2 font-medium w-36">Debit (₹)</th>
                    <th className="text-right p-2 font-medium w-36">Credit (₹)</th>
                    <th className="text-left p-2 font-medium">Narration</th>
                    <th className="w-8"></th>
                  </tr>
                </thead>
                <tbody>
                  {lines.map((line, i) => (
                    <tr key={i} className="border-b">
                      <td className="p-2 text-gray-400">{i + 1}</td>
                      <td className="p-2">
                        <AccountPicker
                          accounts={accounts}
                          value={line.accountId}
                          onChange={(id) => updateLine(i, 'accountId', id)}
                          pickerScope="je-line"
                          size="sm"
                          placeholder="Select account…"
                        />
                      </td>
                      <td className="p-2">
                        <Input
                          type="number"
                          min="0"
                          className="text-right"
                          value={line.debitAmount || ''}
                          onChange={e => updateLine(i, 'debitAmount', e.target.value)}
                          placeholder="0"
                        />
                      </td>
                      <td className="p-2">
                        <Input
                          type="number"
                          min="0"
                          className="text-right"
                          value={line.creditAmount || ''}
                          onChange={e => updateLine(i, 'creditAmount', e.target.value)}
                          placeholder="0"
                        />
                      </td>
                      <td className="p-2">
                        <Input
                          placeholder="Optional narration"
                          value={line.description}
                          onChange={e => updateLine(i, 'description', e.target.value)}
                        />
                      </td>
                      <td className="p-2">
                        {lines.length > 2 && (
                          <button onClick={() => removeLine(i)} className="text-red-400 hover:text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50 font-semibold">
                    <td colSpan={2} className="p-2 text-right">Totals</td>
                    <td className="p-2 text-right text-blue-700">{fmt(totalDebit)}</td>
                    <td className="p-2 text-right text-blue-700">{fmt(totalCredit)}</td>
                    <td colSpan={2} className="p-2 text-center">
                      {isBalanced ? (
                        <span className="text-green-600 text-xs flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" /> Balanced
                        </span>
                      ) : (
                        <span className="text-red-600 text-xs flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" /> Off by {fmt(Math.abs(totalDebit - totalCredit))}
                        </span>
                      )}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-6 border-t bg-gray-50">
          <p className="text-[11px] text-gray-500">
            <kbd className="px-1 border rounded bg-white">Ctrl</kbd>+<kbd className="px-1 border rounded bg-white">S</kbd> save ·{' '}
            <kbd className="px-1 border rounded bg-white">Ctrl</kbd>+<kbd className="px-1 border rounded bg-white">Shift</kbd>+<kbd className="px-1 border rounded bg-white">S</kbd> save &amp; new ·{' '}
            <kbd className="px-1 border rounded bg-white">Ctrl</kbd>+<kbd className="px-1 border rounded bg-white">Enter</kbd> add line
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button
              variant="outline"
              onClick={handleSubmitAndNew}
              disabled={saving || !isBalanced}
              title="Save draft and keep entering another voucher"
            >
              {saving ? 'Saving…' : 'Save & New'}
            </Button>
            <Button onClick={handleSubmit} disabled={saving || !isBalanced} style={{ backgroundColor: '#A8211B', color: 'white' }}>
              {saving ? 'Saving…' : 'Save as Draft'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Quick Voucher Modal ────────────────────────────────────────────────────────
type VoucherType = 'payment' | 'receipt' | 'contra';

const VOUCHER_CONFIG: Record<VoucherType, {
  title: string;
  icon: React.ReactNode;
  color: string;
  debitLabel: string;
  creditLabel: string;
  debitTypes: string[];
  creditTypes: string[];
  refType: string;
  descPlaceholder: string;
}> = {
  payment: {
    title: 'Payment Voucher',
    icon: <ArrowUpRight className="h-5 w-5" />,
    color: '#dc2626',
    debitLabel: 'Expense / To Account (Dr)',
    creditLabel: 'Cash / Bank Account (Cr)',
    debitTypes: ['EXPENSE'],
    creditTypes: ['ASSET'],
    refType: 'EXPENSE',
    descPlaceholder: 'e.g. Office rent paid for March 2026',
  },
  receipt: {
    title: 'Receipt Voucher',
    icon: <ArrowDownLeft className="h-5 w-5" />,
    color: '#16a34a',
    debitLabel: 'Cash / Bank Account (Dr)',
    creditLabel: 'Income / From Account (Cr)',
    debitTypes: ['ASSET'],
    creditTypes: ['INCOME', 'LIABILITY'],
    refType: 'PAYMENT',
    descPlaceholder: 'e.g. Payment received from customer for Flat A-301',
  },
  contra: {
    title: 'Contra Entry',
    icon: <ArrowLeftRight className="h-5 w-5" />,
    color: '#7c3aed',
    debitLabel: 'To Account (Dr)',
    creditLabel: 'From Account (Cr)',
    debitTypes: ['ASSET'],
    creditTypes: ['ASSET'],
    refType: 'ADJUSTMENT',
    descPlaceholder: 'e.g. Cash withdrawn from HDFC bank for petty cash',
  },
};

function QuickVoucherModal({
  type,
  properties,
  defaultProjectId,
  propertyIdRequired,
  onClose,
  onCreated,
}: {
  type: VoucherType;
  properties: JePropertyOption[];
  defaultProjectId: string;
  propertyIdRequired: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const cfg = VOUCHER_CONFIG[type];
  const {
    formPropertyId,
    setFormPropertyId,
    includeSharedCoa,
    setIncludeSharedCoa,
    accounts,
    singleProject,
    effectivePropertyId,
  } = useJeModalAccounts(properties, defaultProjectId, propertyIdRequired);

  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [debitAccountId, setDebitAccountId] = useState('');
  const [creditAccountId, setCreditAccountId] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const debitTypes = cfg.debitTypes as Account['accountType'][];
  const creditTypes = cfg.creditTypes as Account['accountType'][];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
      e.preventDefault();
      if (e.shiftKey) void submit(true);
      else void submit(false);
    }
  };

  const submit = async (keepOpen: boolean): Promise<void> => {
    setError('');
    if (propertyIdRequired && !effectivePropertyId) {
      setError('Select a related project (required when you have more than one project).');
      return;
    }
    const amt = Number(amount);
    if (!amt || amt <= 0) { setError('Please enter a valid amount'); return; }
    if (!debitAccountId) { setError('Please select the debit account'); return; }
    if (!creditAccountId) { setError('Please select the credit account'); return; }
    if (!description.trim()) { setError('Please enter a description'); return; }

    setSaving(true);
    try {
      await journalEntriesService.create({
        entryDate: date,
        description,
        referenceType: cfg.refType,
        ...(effectivePropertyId ? { propertyId: effectivePropertyId } : {}),
        lines: [
          { accountId: debitAccountId, debitAmount: amt, creditAmount: 0, description },
          { accountId: creditAccountId, debitAmount: 0, creditAmount: amt, description },
        ],
      });
      pushRecentAccount(`voucher-${type}-dr`, debitAccountId);
      pushRecentAccount(`voucher-${type}-cr`, creditAccountId);
      onCreated();
      if (keepOpen) {
        setAmount('');
        setDescription('');
        setError('');
      } else {
        onClose();
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to create voucher');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = () => { void submit(false); };
  const handleSubmitAndNew = () => { void submit(true); };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onKeyDown={handleKeyDown}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b">
          <div className="flex items-center gap-2" style={{ color: cfg.color }}>
            {cfg.icon}
            <h2 className="text-lg font-bold" style={{ color: cfg.color }}>{cfg.title}</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        <div className="p-5 space-y-4">
          <JeFormProjectFields
            properties={properties}
            formPropertyId={formPropertyId}
            onProjectChange={setFormPropertyId}
            includeSharedCoa={includeSharedCoa}
            onIncludeSharedCoaChange={setIncludeSharedCoa}
            propertyIdRequired={propertyIdRequired}
            singleProject={singleProject}
          />

          {/* Date + Amount */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
              <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹) *</label>
              <Input
                type="number"
                min="0"
                placeholder="0.00"
                value={amount}
                onChange={e => setAmount(e.target.value)}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <Input
              placeholder={cfg.descPlaceholder}
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          {/* Debit Account */}
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
            <label className="block text-sm font-semibold text-blue-800 mb-1">
              Dr - {cfg.debitLabel}
            </label>
            <AccountPicker
              accounts={accounts}
              value={debitAccountId}
              onChange={setDebitAccountId}
              allowedTypes={debitTypes}
              pickerScope={`voucher-${type}-dr`}
              placeholder="Search account…"
            />
          </div>

          {/* Credit Account */}
          <div className="p-3 bg-green-50 rounded-lg border border-green-100">
            <label className="block text-sm font-semibold text-green-800 mb-1">
              Cr - {cfg.creditLabel}
            </label>
            <AccountPicker
              accounts={accounts}
              value={creditAccountId}
              onChange={setCreditAccountId}
              allowedTypes={creditTypes}
              pickerScope={`voucher-${type}-cr`}
              placeholder="Search account…"
            />
          </div>

          {/* Summary */}
          {amount && debitAccountId && creditAccountId && (
            <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded border text-center">
              Dr {accounts.find(a => a.id === debitAccountId)?.accountName || '…'} ₹{Number(amount).toLocaleString('en-IN')}
              &nbsp;→&nbsp;
              Cr {accounts.find(a => a.id === creditAccountId)?.accountName || '…'}
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-5 border-t bg-gray-50">
          <p className="text-[11px] text-gray-500">
            <kbd className="px-1 border rounded bg-white">Ctrl</kbd>+<kbd className="px-1 border rounded bg-white">S</kbd> save ·{' '}
            <kbd className="px-1 border rounded bg-white">Ctrl</kbd>+<kbd className="px-1 border rounded bg-white">Shift</kbd>+<kbd className="px-1 border rounded bg-white">S</kbd> save &amp; new
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button variant="outline" onClick={handleSubmitAndNew} disabled={saving}>
              {saving ? 'Saving…' : 'Save & New'}
            </Button>
            <Button onClick={handleSubmit} disabled={saving} style={{ backgroundColor: cfg.color, color: 'white' }}>
              {saving ? 'Saving…' : 'Save as Draft'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Bulk journal (many lines + Excel paste) ───────────────────────────────────
const BULK_INITIAL_ROWS = 14;

function BulkJournalModal({
  properties,
  defaultProjectId,
  propertyIdRequired,
  onClose,
  onCreated,
}: {
  properties: JePropertyOption[];
  defaultProjectId: string;
  propertyIdRequired: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const {
    formPropertyId,
    setFormPropertyId,
    includeSharedCoa,
    setIncludeSharedCoa,
    accounts,
    singleProject,
    effectivePropertyId,
  } = useJeModalAccounts(properties, defaultProjectId, propertyIdRequired);

  const [entryDate, setEntryDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [description, setDescription] = useState('');
  const [referenceType, setReferenceType] = useState('ADJUSTMENT');
  const [lines, setLines] = useState<JELine[]>(() =>
    Array.from({ length: BULK_INITIAL_ROWS }, () => ({
      accountId: '',
      debitAmount: 0,
      creditAmount: 0,
      description: '',
    })),
  );
  const [pasteBox, setPasteBox] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const updateLine = (index: number, field: keyof JELine, value: string | number) => {
    setLines((prev) =>
      prev.map((l, i) => {
        if (i !== index) return l;
        if (field === 'debitAmount' && Number(value) > 0) return { ...l, debitAmount: value as number, creditAmount: 0 };
        if (field === 'creditAmount' && Number(value) > 0) return { ...l, creditAmount: value as number, debitAmount: 0 };
        return { ...l, [field]: value };
      }),
    );
  };

  const addRows = (n: number) =>
    setLines((prev) => [
      ...prev,
      ...Array.from({ length: n }, () => ({ accountId: '', debitAmount: 0, creditAmount: 0, description: '' })),
    ]);

  const applyPaste = () => {
    setError('');
    const parsed = parseBulkTsv(pasteBox, accounts);
    if (typeof parsed === 'string') {
      setError(parsed);
      return;
    }
    if (!parsed.length) {
      setError('Paste at least one data row from Excel.');
      return;
    }
    const padding = Math.max(4, BULK_INITIAL_ROWS - parsed.length);
    setLines([
      ...parsed,
      ...Array.from({ length: padding }, () => ({ accountId: '', debitAmount: 0, creditAmount: 0, description: '' })),
    ]);
  };

  const totalDebit = lines.reduce((s, l) => s + (Number(l.debitAmount) || 0), 0);
  const totalCredit = lines.reduce((s, l) => s + (Number(l.creditAmount) || 0), 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

  const handleSubmit = async () => {
    setError('');
    if (propertyIdRequired && !effectivePropertyId) {
      setError('Select a related project (required when you have more than one project).');
      return;
    }
    if (!description.trim()) {
      setError('Description is required');
      return;
    }
    const active = lines.filter((l) => {
      const d = Number(l.debitAmount) || 0;
      const c = Number(l.creditAmount) || 0;
      return !!(l.accountId || d > 0 || c > 0);
    });
    if (active.length < 2) {
      setError('Enter at least two non-empty lines (journal must have multiple legs).');
      return;
    }
    for (let i = 0; i < active.length; i++) {
      const l = active[i];
      const d = Number(l.debitAmount) || 0;
      const c = Number(l.creditAmount) || 0;
      if (!l.accountId) {
        setError(`Line ${i + 1}: select an account (or remove the amount).`);
        return;
      }
      if ((d > 0 && c > 0) || (d === 0 && c === 0)) {
        setError(`Line ${i + 1}: each line needs exactly one of debit or credit.`);
        return;
      }
    }
    if (!isBalanced) {
      setError(
        `Debits (${totalDebit.toLocaleString('en-IN')}) must equal credits (${totalCredit.toLocaleString('en-IN')}).`,
      );
      return;
    }

    setSaving(true);
    try {
      await journalEntriesService.create({
        entryDate,
        description,
        referenceType: referenceType || undefined,
        ...(effectivePropertyId ? { propertyId: effectivePropertyId } : {}),
        lines: active.map((l) => ({
          accountId: l.accountId,
          debitAmount: Number(l.debitAmount) || 0,
          creditAmount: Number(l.creditAmount) || 0,
          description: l.description,
        })),
      });
      onCreated();
      onClose();
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
      setError(msg || 'Failed to create journal entry');
    } finally {
      setSaving(false);
    }
  };

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b">
          <div className="flex items-center gap-2">
            <Table2 className="h-6 w-6 text-[#A8211B]" />
            <div>
              <h2 className="text-lg font-bold">Bulk journal entry</h2>
              <p className="text-xs text-gray-500">Many lines in one voucher - or paste from Excel (tab-separated)</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>

        <div className="p-5 space-y-4">
          <JeFormProjectFields
            properties={properties}
            formPropertyId={formPropertyId}
            onProjectChange={setFormPropertyId}
            includeSharedCoa={includeSharedCoa}
            onIncludeSharedCoaChange={setIncludeSharedCoa}
            propertyIdRequired={propertyIdRequired}
            singleProject={singleProject}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Date *</label>
              <Input type="date" value={entryDate} onChange={(e) => setEntryDate(e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">Description *</label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. March 2026 payroll journals" />
            </div>
          </div>
          <div className="w-48">
            <label className="block text-xs font-medium text-gray-700 mb-1">Reference type</label>
            <select className="border rounded-md p-2 w-full text-sm" value={referenceType} onChange={(e) => setReferenceType(e.target.value)}>
              <option value="ADJUSTMENT">Adjustment</option>
              <option value="PAYMENT">Payment</option>
              <option value="EXPENSE">Expense</option>
              <option value="SALARY">Salary</option>
              <option value="">- None -</option>
            </select>
          </div>

          <div className="border rounded-lg p-3 bg-amber-50/80 border-amber-100">
            <label className="block text-xs font-semibold text-amber-900 mb-1">Paste from Excel</label>
            <p className="text-xs text-amber-800/90 mb-2">
              Columns: <strong>account code</strong> (tab) <strong>debit</strong> (tab) <strong>credit</strong> (tab){' '}
              optional narration. Use the same codes as in your chart. Then click Apply paste.
            </p>
            <textarea
              className="w-full border rounded-md p-2 text-xs font-mono min-h-[88px]"
              placeholder={'1100\t50000\t0\tOffice rent\n2100\t0\t50000\t'}
              value={pasteBox}
              onChange={(e) => setPasteBox(e.target.value)}
            />
            <Button type="button" size="sm" variant="outline" className="mt-2" onClick={applyPaste}>
              Apply paste to grid
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-gray-800">Lines</h3>
            <div className="flex gap-2">
              <Button type="button" size="sm" variant="outline" onClick={() => addRows(5)}>
                +5 rows
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={() => addRows(10)}>
                +10 rows
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto border rounded-lg">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left p-2 w-8">#</th>
                  <th className="text-left p-2 min-w-[220px]">Account</th>
                  <th className="text-right p-2 w-28">Debit</th>
                  <th className="text-right p-2 w-28">Credit</th>
                  <th className="text-left p-2 min-w-[120px]">Narration</th>
                </tr>
              </thead>
              <tbody>
                {lines.map((line, i) => (
                  <tr key={i} className="border-t">
                    <td className="p-1 text-gray-400">{i + 1}</td>
                    <td className="p-1">
                      <AccountPicker
                        accounts={accounts}
                        value={line.accountId}
                        onChange={(id) => updateLine(i, 'accountId', id)}
                        pickerScope="bulk-line"
                        size="sm"
                        placeholder="-"
                      />
                    </td>
                    <td className="p-1">
                      <Input
                        type="number"
                        className="text-right h-8 text-xs"
                        value={line.debitAmount || ''}
                        onChange={(e) => updateLine(i, 'debitAmount', e.target.value)}
                      />
                    </td>
                    <td className="p-1">
                      <Input
                        type="number"
                        className="text-right h-8 text-xs"
                        value={line.creditAmount || ''}
                        onChange={(e) => updateLine(i, 'creditAmount', e.target.value)}
                      />
                    </td>
                    <td className="p-1">
                      <Input
                        className="h-8 text-xs"
                        value={line.description}
                        onChange={(e) => updateLine(i, 'description', e.target.value)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50 font-semibold">
                  <td colSpan={2} className="p-2 text-right">
                    Totals
                  </td>
                  <td className="p-2 text-right text-blue-700">{fmt(totalDebit)}</td>
                  <td className="p-2 text-right text-green-700">{fmt(totalCredit)}</td>
                  <td className="p-2 text-center text-xs">
                    {isBalanced ? (
                      <span className="text-green-600">Balanced</span>
                    ) : (
                      <span className="text-red-600">Off by {fmt(Math.abs(totalDebit - totalCredit))}</span>
                    )}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 p-5 border-t bg-gray-50">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={saving || !isBalanced} style={{ backgroundColor: '#A8211B', color: 'white' }}>
            {saving ? 'Saving…' : 'Save as draft'}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Detail Drawer ─────────────────────────────────────────────────────────────
function JEDetailDrawer({ je, onClose }: { je: JournalEntry; onClose: () => void }) {
  const fmt = (n: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
      <div className="bg-white w-full max-w-2xl h-full overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b">
          <div>
            <p className="text-xs text-gray-500">Journal Entry</p>
            <h2 className="text-lg font-bold font-mono">{je.entryNumber}</h2>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={je.status} />
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
          </div>
        </div>

        <div className="p-5 space-y-5">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-gray-500">Date</span><p className="font-medium">{format(new Date(je.entryDate), 'dd MMM yyyy')}</p></div>
            <div><span className="text-gray-500">Reference</span><p className="font-medium">{je.referenceType || '-'}</p></div>
            <div>
              <span className="text-gray-500">Project</span>
              <p className="font-medium">{je.property?.name || je.propertyId || 'Organization-wide'}</p>
            </div>
            <div className="col-span-2"><span className="text-gray-500">Description</span><p className="font-medium">{je.description}</p></div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left p-2">Account</th>
                  <th className="text-right p-2">Debit</th>
                  <th className="text-right p-2">Credit</th>
                  <th className="text-left p-2">Narration</th>
                </tr>
              </thead>
              <tbody>
                {(je.lines || []).map((line: any) => (
                  <tr key={line.id} className="border-b">
                    <td className="p-2">
                      <span className="font-mono text-xs text-gray-500">{line.account?.accountCode}</span>
                      <span className="ml-2">{line.account?.accountName}</span>
                    </td>
                    <td className="p-2 text-right font-medium text-blue-700">
                      {Number(line.debitAmount) > 0 ? fmt(line.debitAmount) : '-'}
                    </td>
                    <td className="p-2 text-right font-medium text-green-700">
                      {Number(line.creditAmount) > 0 ? fmt(line.creditAmount) : '-'}
                    </td>
                    <td className="p-2 text-gray-500 text-xs">{line.description || '-'}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50 font-bold">
                  <td className="p-2">Total</td>
                  <td className="p-2 text-right text-blue-700">{fmt(je.totalDebit)}</td>
                  <td className="p-2 text-right text-green-700">{fmt(je.totalCredit)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function JournalEntriesPage() {
  const { user } = useAuthStore();
  const { selectedProperties, properties } = usePropertyStore();
  const allSelected =
    properties.length > 0 && selectedProperties.length === properties.length;
  const isAllPropertiesHeader = selectedProperties.length === 0 || allSelected;

  const allowOrgWideJe = useMemo(() => rolesAllowOrgWideJe(user), [user]);
  const projectRequired = properties.length > 1 && !allowOrgWideJe;

  const jePropertyOptions = useMemo<JePropertyOption[]>(
    () => properties.map((p) => ({ id: p.id, name: p.name })),
    [properties],
  );

  const defaultJeProjectId = useMemo(() => {
    if (properties.length === 1) return properties[0].id;
    if (isAllPropertiesHeader) return '';
    if (selectedProperties[0]) return selectedProperties[0];
    return '';
  }, [properties, selectedProperties, isAllPropertiesHeader]);

  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [activeVoucher, setActiveVoucher] = useState<VoucherType | null>(null);
  const [selectedJE, setSelectedJE] = useState<JournalEntry | null>(null);
  const [voidingId, setVoidingId] = useState<string | null>(null);
  const [postingId, setPostingId] = useState<string | null>(null);

  // Filters
  const [filterStatus, setFilterStatus] = useState('');
  const [filterRefType, setFilterRefType] = useState('');
  const [filterStart, setFilterStart] = useState('');
  const [filterEnd, setFilterEnd] = useState('');

  const topBarPropertyId = isAllPropertiesHeader
    ? undefined
    : selectedProperties[0];

  const fetchEntries = useCallback(async () => {
    try {
      const params: any = {};
      if (filterStatus) params.status = filterStatus;
      if (filterRefType) params.referenceType = filterRefType;
      if (filterStart) params.startDate = filterStart;
      if (filterEnd) params.endDate = filterEnd;
      if (topBarPropertyId) params.propertyId = topBarPropertyId;
      const data = await journalEntriesService.getAll(params);
      setEntries(data || []);
    } catch (err) {
      console.error('Error fetching journal entries:', err);
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterRefType, filterStart, filterEnd, topBarPropertyId]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const handlePost = async (id: string) => {
    if (!confirm('Post this journal entry? Account balances will be updated.')) return;
    setPostingId(id);
    try {
      await journalEntriesService.post(id);
      await fetchEntries();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to post entry');
    } finally {
      setPostingId(null);
    }
  };

  const handleVoid = async (id: string) => {
    const reason = prompt('Enter void reason (required):');
    if (!reason?.trim()) return;
    setVoidingId(id);
    try {
      await journalEntriesService.void(id, reason);
      await fetchEntries();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to void entry');
    } finally {
      setVoidingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this draft journal entry? This cannot be undone.')) return;
    try {
      await journalEntriesService.delete(id);
      await fetchEntries();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to delete entry');
    }
  };

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

  // Summary counts
  const draftCount = entries.filter(e => e.status === 'DRAFT').length;
  const postedCount = entries.filter(e => e.status === 'POSTED').length;
  const voidCount = entries.filter(e => e.status === 'VOID').length;
  const totalPostedDebit = entries
    .filter(e => e.status === 'POSTED')
    .reduce((s, e) => s + Number(e.totalDebit), 0);

  if (loading) {
    return <div className="p-6"><TableRowsSkeleton rows={8} cols={6} /></div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Journal Entries</h1>
          <p className="text-gray-500 text-sm mt-1">Double-entry bookkeeping - Debit must equal Credit</p>
        </div>
      </div>

      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-sm">Journal entry vs Expense (Expenses module)</CardTitle>
          <CardDescription className="text-sm text-gray-600 space-y-2">
            <p>
              <strong>Journal entry (this screen)</strong> is the general ledger: you choose debit/credit accounts and
              amounts. Use it for adjustments, receipts/payments you record directly in the books, contra transfers, or
              any custom double-entry. Posting updates account balances immediately.
            </p>
            <p>
              <strong>Expense</strong> (Accounting → Expenses) is an operational workflow: request/approve/pay business
              spend with categories, vendors, receipts, and status. When an expense is marked paid, the system can create
              the underlying journal entry for you with the right GL accounts and project.
            </p>
            <p className="text-xs text-gray-500">
              Rule of thumb: use <strong>Expenses</strong> for staff/vendor spend you track as a bill; use{' '}
              <strong>Journals</strong> when you are booking accounting entries directly.
            </p>
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Voucher Type Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Payment Voucher */}
        <button
          type="button"
          onClick={() => {
            setActiveVoucher('payment');
          }}
          className="flex flex-col items-center gap-2 p-4 bg-red-50 border-2 border-red-100 rounded-xl hover:border-red-400 hover:bg-red-100 transition-all group"
        >
          <div className="w-10 h-10 bg-red-100 group-hover:bg-red-200 rounded-xl flex items-center justify-center text-red-600 transition-colors">
            <ArrowUpRight className="h-5 w-5" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-red-700 text-sm">Payment Voucher</p>
            <p className="text-xs text-gray-500">Dr Expense → Cr Bank</p>
          </div>
        </button>

        {/* Receipt Voucher */}
        <button
          type="button"
          onClick={() => {
            setActiveVoucher('receipt');
          }}
          className="flex flex-col items-center gap-2 p-4 bg-green-50 border-2 border-green-100 rounded-xl hover:border-green-400 hover:bg-green-100 transition-all group"
        >
          <div className="w-10 h-10 bg-green-100 group-hover:bg-green-200 rounded-xl flex items-center justify-center text-green-600 transition-colors">
            <ArrowDownLeft className="h-5 w-5" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-green-700 text-sm">Receipt Voucher</p>
            <p className="text-xs text-gray-500">Dr Bank → Cr Income</p>
          </div>
        </button>

        {/* Contra Entry */}
        <button
          type="button"
          onClick={() => {
            setActiveVoucher('contra');
          }}
          className="flex flex-col items-center gap-2 p-4 bg-purple-50 border-2 border-purple-100 rounded-xl hover:border-purple-400 hover:bg-purple-100 transition-all group"
        >
          <div className="w-10 h-10 bg-purple-100 group-hover:bg-purple-200 rounded-xl flex items-center justify-center text-purple-600 transition-colors">
            <ArrowLeftRight className="h-5 w-5" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-purple-700 text-sm">Contra Entry</p>
            <p className="text-xs text-gray-500">Cash ↔ Bank transfer</p>
          </div>
        </button>

        {/* Journal Entry */}
        <button
          type="button"
          onClick={() => {
            setShowNewModal(true);
          }}
          className="flex flex-col items-center gap-2 p-4 bg-gray-50 border-2 border-gray-100 rounded-xl hover:border-gray-400 hover:bg-gray-100 transition-all group"
        >
          <div className="w-10 h-10 bg-gray-100 group-hover:bg-gray-200 rounded-xl flex items-center justify-center text-gray-600 transition-colors">
            <ReceiptText className="h-5 w-5" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-gray-700 text-sm">Journal Entry</p>
            <p className="text-xs text-gray-500">Multi-line advanced entry</p>
          </div>
        </button>

        {/* Bulk journal */}
        <button
          type="button"
          onClick={() => {
            setShowBulkModal(true);
          }}
          className="flex flex-col items-center gap-2 p-4 bg-slate-50 border-2 border-slate-200 rounded-xl hover:border-slate-400 hover:bg-slate-100 transition-all group"
        >
          <div className="w-10 h-10 bg-slate-200 group-hover:bg-slate-300 rounded-xl flex items-center justify-center text-slate-700 transition-colors">
            <Table2 className="h-5 w-5" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-slate-800 text-sm">Bulk journal</p>
            <p className="text-xs text-gray-500">Many lines or Excel paste</p>
          </div>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{entries.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-600">Draft</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-yellow-700">{draftCount}</p>
            <p className="text-xs text-gray-400">Awaiting posting</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600">Posted</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-700">{postedCount}</p>
            <p className="text-xs text-gray-400">In books</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Posted Value</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold">{fmt(totalPostedDebit)}</p>
            <p className="text-xs text-gray-400">{voidCount} voided</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <select
              className="border rounded-md p-2 text-sm"
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="DRAFT">Draft</option>
              <option value="POSTED">Posted</option>
              <option value="VOID">Void</option>
            </select>
            <select
              className="border rounded-md p-2 text-sm"
              value={filterRefType}
              onChange={e => setFilterRefType(e.target.value)}
            >
              <option value="">All Types</option>
              <option value="PAYMENT">Payment</option>
              <option value="BOOKING">Booking</option>
              <option value="EXPENSE">Expense</option>
              <option value="SALARY">Salary</option>
              <option value="PROPERTY">Property</option>
              <option value="ADJUSTMENT">Adjustment</option>
            </select>
            <Input
              type="date"
              className="w-40 text-sm"
              value={filterStart}
              onChange={e => setFilterStart(e.target.value)}
              placeholder="From date"
            />
            <Input
              type="date"
              className="w-40 text-sm"
              value={filterEnd}
              onChange={e => setFilterEnd(e.target.value)}
              placeholder="To date"
            />
            {(filterStatus || filterRefType || filterStart || filterEnd) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setFilterStatus(''); setFilterRefType(''); setFilterStart(''); setFilterEnd(''); }}
              >
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Journal Entries</CardTitle>
          <CardDescription>{entries.length} entries found</CardDescription>
        </CardHeader>
        <CardContent>
          {entries.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="text-lg font-medium">No journal entries yet</p>
              <p className="text-sm">Click &quot;New Journal Entry&quot; to create your first one</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left p-3 font-medium">Entry #</th>
                    <th className="text-left p-3 font-medium">Date</th>
                    <th className="text-left p-3 font-medium">Description</th>
                    <th className="text-left p-3 font-medium">Project</th>
                    <th className="text-left p-3 font-medium">Type</th>
                    <th className="text-right p-3 font-medium">Debit</th>
                    <th className="text-right p-3 font-medium">Credit</th>
                    <th className="text-center p-3 font-medium">Status</th>
                    <th className="text-right p-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((je) => (
                    <tr
                      key={je.id}
                      className={`border-b hover:bg-gray-50 transition-colors ${je.status === 'VOID' ? 'opacity-50' : ''}`}
                    >
                      <td className="p-3 font-mono text-xs font-semibold text-gray-700">{je.entryNumber}</td>
                      <td className="p-3 whitespace-nowrap">{format(new Date(je.entryDate), 'dd MMM yyyy')}</td>
                      <td className="p-3 max-w-xs">
                        <p className="truncate" title={je.description}>{je.description}</p>
                      </td>
                      <td className="p-3 text-xs text-gray-600 max-w-[140px] truncate" title={je.property?.name}>
                        {je.property?.name || (je.propertyId ? '-' : 'Org-wide')}
                      </td>
                      <td className="p-3">
                        {je.referenceType ? (
                          <Badge variant="outline" className="text-xs">{je.referenceType}</Badge>
                        ) : '-'}
                      </td>
                      <td className="p-3 text-right font-medium text-blue-700">{fmt(je.totalDebit)}</td>
                      <td className="p-3 text-right font-medium text-green-700">{fmt(je.totalCredit)}</td>
                      <td className="p-3 text-center"><StatusBadge status={je.status} /></td>
                      <td className="p-3">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedJE(je)}
                            title="View detail"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {je.status === 'DRAFT' && (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-green-700 hover:text-green-800 hover:bg-green-50"
                                onClick={() => handlePost(je.id)}
                                disabled={postingId === je.id}
                                title="Post entry"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleDelete(je.id)}
                                title="Delete draft"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          {je.status === 'POSTED' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-gray-500 hover:text-gray-700"
                              onClick={() => handleVoid(je.id)}
                              disabled={voidingId === je.id}
                              title="Void entry"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      {showNewModal && (
        <NewJEModal
          properties={jePropertyOptions}
          defaultProjectId={defaultJeProjectId}
          propertyIdRequired={projectRequired}
          onClose={() => setShowNewModal(false)}
          onCreated={fetchEntries}
        />
      )}
      {showBulkModal && (
        <BulkJournalModal
          properties={jePropertyOptions}
          defaultProjectId={defaultJeProjectId}
          propertyIdRequired={projectRequired}
          onClose={() => setShowBulkModal(false)}
          onCreated={fetchEntries}
        />
      )}
      {activeVoucher && (
        <QuickVoucherModal
          type={activeVoucher}
          properties={jePropertyOptions}
          defaultProjectId={defaultJeProjectId}
          propertyIdRequired={projectRequired}
          onClose={() => setActiveVoucher(null)}
          onCreated={fetchEntries}
        />
      )}
      {selectedJE && (
        <JEDetailDrawer je={selectedJE} onClose={() => setSelectedJE(null)} />
      )}
    </div>
  );
}
