'use client';

/**
 * Reusable "upload Excel → preview → import" modal.
 *
 * Used for Chart of Accounts import and Expenses import. The parent owns
 * the network call so each page can show domain-appropriate success toasts.
 * All XLSX parsing is client-side (we already bundle the `xlsx` lib for reports).
 */

import * as React from 'react';
import * as XLSX from 'xlsx';
import {
  AlertCircle,
  Check,
  Download,
  FileSpreadsheet,
  Loader2,
  Upload,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface ImportField {
  /** Key used in the parsed row (lowercased header) */
  key: string;
  /** Human label rendered in the sample/template */
  label: string;
  required?: boolean;
  hint?: string;
}

export interface RowValidationError {
  /** 1-based Excel row (header is row 1). */
  row: number;
  message: string;
  /** Optional offending value for display. */
  value?: string;
}

export interface ImportResult {
  created: number;
  skipped: number;
  errors?: Array<{ row: number; message: string }>;
}

export interface ExcelImportModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: React.ReactNode;
  /** Column spec used both for the downloadable template and preview. */
  fields: ImportField[];
  /** Sample rows inserted into the downloadable template. */
  sampleRows?: Record<string, string | number>[];
  /** Custom pre-import validation; return per-row errors. */
  validate?: (rows: Record<string, unknown>[]) => RowValidationError[];
  /** Optional transform before sending to the import endpoint. */
  transform?: (rows: Record<string, unknown>[]) => Record<string, unknown>[];
  /** The actual import call (POST). Should return counts. */
  onImport: (rows: Record<string, unknown>[]) => Promise<ImportResult>;
  /** Shown under the title as a note, e.g. "Importing to Eastern Tower". */
  scopeLabel?: string;
  /** Optional extra controls rendered above the preview (e.g. project selector). */
  extraHeader?: React.ReactNode;
}

const HEADER_ALIASES: Record<string, string[]> = {
  accountCode: ['accountcode', 'code', 'a/c code', 'ac code'],
  accountName: ['accountname', 'name', 'ledger', 'a/c name'],
  accountType: ['accounttype', 'type', 'group'],
  accountCategory: ['accountcategory', 'category', 'sub-group', 'subgroup'],
  openingBalance: ['openingbalance', 'opening', 'balance'],
  expenseCategory: ['expensecategory', 'category'],
  expenseDate: ['expensedate', 'date', 'invoicedate'],
  paymentMethod: ['paymentmethod', 'mode', 'method'],
};

/** Normalize "Account Name" → "accountname" for alias matching. */
function normalize(s: string): string {
  return s.toString().trim().toLowerCase().replace(/[\s_\-/.]/g, '');
}

/**
 * Build a header-to-canonicalKey map. If header equals a known canonical key
 * (case-insensitive) or any alias, we map it. Otherwise the header is kept
 * as-is so custom columns still flow through.
 */
function headerMapFor(fields: ImportField[], headers: string[]): Record<string, string> {
  const canonicals = new Set(fields.map((f) => normalize(f.key)));
  const aliasToKey: Record<string, string> = {};
  for (const f of fields) {
    aliasToKey[normalize(f.key)] = f.key;
    for (const alias of HEADER_ALIASES[f.key] || []) {
      aliasToKey[normalize(alias)] = f.key;
    }
  }
  const out: Record<string, string> = {};
  for (const h of headers) {
    const n = normalize(h);
    if (aliasToKey[n]) out[h] = aliasToKey[n];
    else if (canonicals.has(n)) out[h] = n;
    else out[h] = h;
  }
  return out;
}

export function ExcelImportModal({
  open,
  onClose,
  title,
  description,
  fields,
  sampleRows,
  validate,
  transform,
  onImport,
  scopeLabel,
  extraHeader,
}: ExcelImportModalProps) {
  const [rows, setRows] = React.useState<Record<string, unknown>[]>([]);
  const [fileName, setFileName] = React.useState<string>('');
  const [parseError, setParseError] = React.useState<string>('');
  const [validationErrors, setValidationErrors] = React.useState<RowValidationError[]>([]);
  const [importing, setImporting] = React.useState(false);
  const [result, setResult] = React.useState<ImportResult | null>(null);

  /** Reset local state whenever the modal is re-opened. */
  React.useEffect(() => {
    if (open) {
      setRows([]);
      setFileName('');
      setParseError('');
      setValidationErrors([]);
      setImporting(false);
      setResult(null);
    }
  }, [open]);

  if (!open) return null;

  const handleFile = (file: File) => {
    setParseError('');
    setResult(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: 'array', cellDates: true });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        if (!sheet) {
          setParseError('No sheet found in the workbook.');
          return;
        }
        const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
          raw: false,
          defval: '',
        });
        if (!json.length) {
          setParseError('The first sheet is empty. Add rows below the header.');
          return;
        }
        const headers = Object.keys(json[0] || {});
        const mapping = headerMapFor(fields, headers);
        const canonical = json.map((r) => {
          const out: Record<string, unknown> = {};
          for (const [h, v] of Object.entries(r)) {
            const key = mapping[h] || h;
            // Convert XLSX Date objects to YYYY-MM-DD so the backend DTO accepts them.
            if (v instanceof Date) out[key] = v.toISOString().slice(0, 10);
            else out[key] = v;
          }
          return out;
        });
        setRows(canonical);
        setFileName(file.name);
        if (validate) setValidationErrors(validate(canonical));
        else setValidationErrors([]);
      } catch (err) {
        console.error(err);
        setParseError('Could not read this file. Please upload a valid .xlsx.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDownloadTemplate = () => {
    const headerRow = fields.reduce<Record<string, string | number>>((acc, f) => {
      acc[f.label] = '';
      return acc;
    }, {});
    const rowsForTemplate: Record<string, string | number>[] = [headerRow];
    for (const sample of sampleRows || []) {
      const translated: Record<string, string | number> = {};
      for (const f of fields) {
        const v = sample[f.key];
        if (v !== undefined) translated[f.label] = v;
      }
      rowsForTemplate.push(translated);
    }
    const ws = XLSX.utils.json_to_sheet(rowsForTemplate, { skipHeader: true });
    ws['!cols'] = fields.map(() => ({ wch: 22 }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, `${title.toLowerCase().replace(/\s+/g, '-')}-template.xlsx`);
  };

  const handleImport = async () => {
    setImporting(true);
    setParseError('');
    try {
      const payload = transform ? transform(rows) : rows;
      const res = await onImport(payload);
      setResult(res);
    } catch (e: any) {
      setParseError(e?.response?.data?.message || e?.message || 'Import failed.');
    } finally {
      setImporting(false);
    }
  };

  const previewRows = rows.slice(0, 50);
  const blockingErrors = validationErrors.length;
  const canImport = rows.length > 0 && blockingErrors === 0 && !result;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b">
          <div className="flex items-start gap-3">
            <FileSpreadsheet className="h-6 w-6 text-[#A8211B]" />
            <div>
              <h2 className="text-lg font-bold">{title}</h2>
              {scopeLabel && <p className="text-xs text-gray-500">{scopeLabel}</p>}
              {description && <div className="text-sm text-gray-600 mt-1">{description}</div>}
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {extraHeader}

          {/* Template + file picker */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="border rounded-lg p-4 bg-amber-50/60 border-amber-100">
              <div className="flex items-start gap-3">
                <Download className="h-5 w-5 text-amber-700 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-amber-900">Step 1 - Get the template</p>
                  <p className="text-xs text-amber-800/90 mt-1">
                    Download a ready Excel with the correct columns. Fill the rows and upload below.
                  </p>
                  <Button variant="outline" size="sm" className="mt-2" onClick={handleDownloadTemplate}>
                    <Download className="h-3 w-3 mr-1" /> Download template
                  </Button>
                </div>
              </div>
            </div>
            <div className="border rounded-lg p-4 bg-sky-50/60 border-sky-100">
              <div className="flex items-start gap-3">
                <Upload className="h-5 w-5 text-sky-700 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-sky-900">Step 2 - Upload your file</p>
                  <p className="text-xs text-sky-800/90 mt-1">
                    Only the first sheet is imported. We'll show a preview before anything is saved.
                  </p>
                  <label
                    className={cn(
                      'mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-md border text-sm cursor-pointer',
                      'bg-white hover:bg-gray-50 border-gray-300',
                    )}
                  >
                    <Upload className="h-3 w-3" />
                    {fileName ? `Change file (${fileName})` : 'Choose Excel file'}
                    <input
                      type="file"
                      accept=".xlsx,.xls"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleFile(f);
                        e.target.value = '';
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Field guide */}
          <div className="border rounded-lg p-3 bg-gray-50 border-gray-200">
            <p className="text-xs font-semibold text-gray-700 mb-2">Required columns</p>
            <div className="flex flex-wrap gap-1.5">
              {fields.map((f) => (
                <span
                  key={f.key}
                  className={cn(
                    'text-[11px] px-2 py-0.5 rounded border',
                    f.required
                      ? 'bg-red-50 text-red-700 border-red-200'
                      : 'bg-white text-gray-600 border-gray-200',
                  )}
                  title={f.hint}
                >
                  {f.label}
                  {f.required ? ' *' : ''}
                </span>
              ))}
            </div>
          </div>

          {/* Parse error */}
          {parseError && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-md p-3 text-sm flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{parseError}</span>
            </div>
          )}

          {/* Preview */}
          {rows.length > 0 && (
            <div className="border rounded-lg overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-gray-50 border-b text-xs">
                <span className="font-semibold text-gray-700">
                  Preview - {rows.length} row{rows.length > 1 ? 's' : ''} parsed
                  {rows.length > previewRows.length && ` (showing first ${previewRows.length})`}
                </span>
                {blockingErrors > 0 ? (
                  <span className="text-red-700 font-semibold flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {blockingErrors} issue{blockingErrors > 1 ? 's' : ''} - fix Excel &amp; re-upload
                  </span>
                ) : (
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <Check className="h-3 w-3" /> Looks good
                  </span>
                )}
              </div>
              <div className="overflow-x-auto max-h-[260px]">
                <table className="w-full text-xs">
                  <thead className="bg-gray-100 sticky top-0">
                    <tr>
                      <th className="p-2 text-left w-12">Row</th>
                      {fields.map((f) => (
                        <th key={f.key} className="p-2 text-left whitespace-nowrap">
                          {f.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewRows.map((r, i) => {
                      const humanRow = i + 2;
                      const rowErrs = validationErrors.filter((v) => v.row === humanRow);
                      const hasErr = rowErrs.length > 0;
                      return (
                        <tr
                          key={i}
                          className={cn(
                            'border-t',
                            hasErr ? 'bg-red-50' : i % 2 === 0 ? 'bg-white' : 'bg-gray-50/40',
                          )}
                          title={hasErr ? rowErrs.map((e) => e.message).join('; ') : ''}
                        >
                          <td className="p-2 text-gray-400 font-mono">{humanRow}</td>
                          {fields.map((f) => (
                            <td key={f.key} className="p-2 whitespace-nowrap">
                              {(r[f.key] as string | number | undefined)?.toString() ?? ''}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {validationErrors.length > 0 && (
                <div className="border-t bg-red-50/60 p-2 max-h-[140px] overflow-y-auto text-xs text-red-800">
                  <p className="font-semibold mb-1">Fix these before importing:</p>
                  <ul className="list-disc ml-5 space-y-0.5">
                    {validationErrors.slice(0, 20).map((v, i) => (
                      <li key={i}>
                        Row {v.row}: {v.message}
                        {v.value && <span className="text-red-600"> (“{v.value}”)</span>}
                      </li>
                    ))}
                    {validationErrors.length > 20 && (
                      <li>…and {validationErrors.length - 20} more.</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="border border-emerald-200 bg-emerald-50 rounded-md p-4 text-sm text-emerald-900">
              <div className="flex items-center gap-2 font-semibold mb-1">
                <Check className="h-4 w-4" /> Imported {result.created} row{result.created !== 1 ? 's' : ''}
                {result.skipped ? ` · skipped ${result.skipped}` : ''}
              </div>
              {result.errors && result.errors.length > 0 && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-emerald-800">
                    {result.errors.length} row{result.errors.length !== 1 ? 's' : ''} reported by server
                  </summary>
                  <ul className="list-disc ml-5 mt-1 space-y-0.5 text-xs">
                    {result.errors.slice(0, 20).map((e, i) => (
                      <li key={i}>
                        Row {e.row}: {e.message}
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t bg-gray-50">
          <Button variant="outline" onClick={onClose} disabled={importing}>
            {result ? 'Close' : 'Cancel'}
          </Button>
          {!result && (
            <Button
              onClick={handleImport}
              disabled={!canImport || importing}
              style={{ backgroundColor: '#A8211B', color: 'white' }}
            >
              {importing ? (
                <span className="flex items-center gap-1">
                  <Loader2 className="h-4 w-4 animate-spin" /> Importing…
                </span>
              ) : (
                `Import ${rows.length} row${rows.length !== 1 ? 's' : ''}`
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ExcelImportModal;
