'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft, Upload, CheckCircle, XCircle, RefreshCw,
  AlertCircle, Link2, Building2,
} from 'lucide-react';
import api from '@/services/api';
import { journalEntriesService } from '@/services/accounting.service';
import { format } from 'date-fns';
import { TableRowsSkeleton } from '@/components/Skeletons';

interface BankStatement {
  id: string;
  transactionDate: string;
  description: string;
  referenceNumber?: string;
  transactionId?: string;
  debitAmount: number;
  creditAmount: number;
  balance: number;
  isReconciled: boolean;
  reconciledWithEntryId?: string;
}

interface JournalEntryOption {
  id: string;
  entryNumber: string;
  entryDate: string;
  description: string;
  totalDebit: number;
  totalCredit: number;
}

const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(n) || 0);

export default function BankReconcilePage() {
  const params = useParams();
  const router = useRouter();
  const bankAccountId = params.id as string;

  const [bankAccount, setBankAccount] = useState<any>(null);
  const [statements, setStatements] = useState<BankStatement[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntryOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [reconciling, setReconciling] = useState<string | null>(null);
  const [matchingId, setMatchingId] = useState<Record<string, string>>({});
  const [uploadError, setUploadError] = useState('');
  const [tab, setTab] = useState<'unreconciled' | 'all'>('unreconciled');

  const fetchData = useCallback(async () => {
    try {
      const [ba, stmt, je] = await Promise.all([
        api.get(`/accounting/bank-accounts/${bankAccountId}`),
        api.get(`/accounting/bank-statements/unreconciled/${bankAccountId}`),
        journalEntriesService.getAll({ status: 'POSTED' }),
      ]);
      setBankAccount(ba);
      setStatements(stmt || []);
      setJournalEntries(je || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [bankAccountId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bankAccountId', bankAccountId);
      await api.post('/accounting/bank-statements/upload', formData);
      await fetchData();
    } catch (err: any) {
      setUploadError(err?.response?.data?.message || 'Upload failed. Ensure file is Excel (.xlsx)');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleReconcile = async (statementId: string) => {
    const jeId = matchingId[statementId];
    if (!jeId) { alert('Select a journal entry to match first'); return; }
    setReconciling(statementId);
    try {
      await api.post(`/accounting/bank-statements/${statementId}/reconcile`, { journalEntryId: jeId });
      await fetchData();
    } catch (e: any) {
      alert(e?.response?.data?.message || 'Reconciliation failed');
    } finally { setReconciling(null); }
  };

  const unreconciledCount = statements.filter(s => !s.isReconciled).length;
  const reconciledCount = statements.filter(s => s.isReconciled).length;
  const displayed = tab === 'unreconciled' ? statements.filter(s => !s.isReconciled) : statements;

  if (loading) return <div className="p-6"><TableRowsSkeleton rows={6} cols={5} /></div>;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <Building2 className="h-6 w-6" style={{ color: '#A8211B' }} />
            <div>
              <h1 className="text-2xl font-bold">
                {bankAccount?.accountName || 'Bank Account'}
                <span className="ml-2 text-gray-400 font-normal text-lg">— Reconciliation</span>
              </h1>
              <p className="text-sm text-gray-500">{bankAccount?.bankName} · {bankAccount?.accountNumber}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-gray-500">Total Transactions</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{statements.length}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-red-600">Unreconciled</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-700">{unreconciledCount}</p>
            <p className="text-xs text-gray-400">Need matching</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-green-600">Reconciled</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-700">{reconciledCount}</p>
            <p className="text-xs text-gray-400">Matched to JE</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-gray-500">Completion</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {statements.length > 0 ? Math.round((reconciledCount / statements.length) * 100) : 0}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Upload Bank Statement</CardTitle>
          <CardDescription>
            Upload an Excel (.xlsx) file exported from your bank. Columns needed: Date, Description, Debit, Credit, Balance.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <label className={`flex items-center gap-2 px-4 py-2 rounded-md border cursor-pointer text-sm font-medium transition-colors
              ${uploading ? 'bg-gray-100 text-gray-400' : 'bg-white hover:bg-gray-50 border-gray-300'}`}>
              <Upload className="h-4 w-4" />
              {uploading ? 'Uploading…' : 'Choose Excel File'}
              <input type="file" accept=".xlsx,.xls" className="hidden" onChange={handleUpload} disabled={uploading} />
            </label>
            <p className="text-xs text-gray-400">Only .xlsx / .xls files</p>
          </div>
          {uploadError && (
            <div className="mt-2 flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />{uploadError}
            </div>
          )}
          {/* Expected format hint */}
          <div className="mt-3 bg-amber-50 border border-amber-200 rounded p-3 text-xs text-amber-800">
            <strong>Expected Excel columns:</strong> Date · Transaction Date · Description / Narration · Debit / Withdrawal · Credit / Deposit · Balance · Reference Number (optional)
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Bank Transactions</CardTitle>
              <CardDescription>Match each transaction to a posted journal entry</CardDescription>
            </div>
            <div className="flex gap-2">
              {(['unreconciled', 'all'] as const).map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className={`px-3 py-1 text-sm rounded-full border transition-colors ${tab === t
                    ? 'bg-gray-800 text-white border-gray-800' : 'text-gray-600 border-gray-300 hover:bg-gray-50'}`}>
                  {t === 'unreconciled' ? `Pending (${unreconciledCount})` : `All (${statements.length})`}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {displayed.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <CheckCircle className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="text-lg font-medium">
                {tab === 'unreconciled' ? 'All transactions reconciled! 🎉' : 'No transactions uploaded yet'}
              </p>
              <p className="text-sm">{tab === 'unreconciled' ? 'Switch to "All" to view history' : 'Upload a bank statement above to get started'}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="text-left p-3">Date</th>
                    <th className="text-left p-3">Description</th>
                    <th className="text-right p-3 text-red-700">Debit</th>
                    <th className="text-right p-3 text-green-700">Credit</th>
                    <th className="text-right p-3">Balance</th>
                    <th className="text-left p-3 min-w-[200px]">Match to Journal Entry</th>
                    <th className="text-center p-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {displayed.map(stmt => (
                    <tr key={stmt.id} className={`border-b ${stmt.isReconciled ? 'bg-green-50/50 opacity-75' : 'hover:bg-gray-50'}`}>
                      <td className="p-3 whitespace-nowrap text-gray-600">
                        {stmt.transactionDate ? format(new Date(stmt.transactionDate), 'dd MMM yyyy') : '—'}
                      </td>
                      <td className="p-3 max-w-xs">
                        <p className="truncate" title={stmt.description}>{stmt.description}</p>
                        {stmt.referenceNumber && <p className="text-xs text-gray-400">{stmt.referenceNumber}</p>}
                      </td>
                      <td className="p-3 text-right font-medium text-red-600">
                        {Number(stmt.debitAmount) > 0 ? fmt(stmt.debitAmount) : '—'}
                      </td>
                      <td className="p-3 text-right font-medium text-green-600">
                        {Number(stmt.creditAmount) > 0 ? fmt(stmt.creditAmount) : '—'}
                      </td>
                      <td className="p-3 text-right">{fmt(stmt.balance)}</td>
                      <td className="p-3">
                        {stmt.isReconciled ? (
                          <div className="flex items-center gap-1 text-green-700 text-xs font-medium">
                            <Link2 className="h-3 w-3" /> Matched
                          </div>
                        ) : (
                          <select
                            className="border rounded p-1 text-xs w-full"
                            value={matchingId[stmt.id] || ''}
                            onChange={e => setMatchingId(m => ({ ...m, [stmt.id]: e.target.value }))}
                          >
                            <option value="">— Select journal entry —</option>
                            {journalEntries.map(je => (
                              <option key={je.id} value={je.id}>
                                {je.entryNumber} · {format(new Date(je.entryDate), 'dd/MM')} · {je.description.slice(0, 30)}
                              </option>
                            ))}
                          </select>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        {stmt.isReconciled ? (
                          <CheckCircle className="h-5 w-5 text-green-600 mx-auto" />
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReconcile(stmt.id)}
                            disabled={!matchingId[stmt.id] || reconciling === stmt.id}
                            className="text-xs"
                          >
                            <RefreshCw className={`h-3 w-3 mr-1 ${reconciling === stmt.id ? 'animate-spin' : ''}`} />
                            Match
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
