'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/services/api';
import { bankAccountsService, downloadWithAuth } from '@/services/accounting.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Download, Printer, BookOpen, Building2, Loader2 } from 'lucide-react';

const fmt = (n: number | string) =>
  '₹' + Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function printLedger(title: string) {
  const el = document.getElementById('ledger-print');
  if (!el) return;
  const w = window.open('', '_blank');
  if (!w) return;
  w.document.write(`
    <html><head><title>${title}</title>
    <style>
      body{font-family:Arial,sans-serif;padding:24px;color:#111}
      table{width:100%;border-collapse:collapse;margin-top:12px}
      th,td{border:1px solid #ddd;padding:8px 12px;text-align:left}
      th{background:#f3f4f6;font-weight:600}
      .text-right{text-align:right}
      h1{font-size:22px;margin-bottom:4px}
      .sub{color:#6b7280;font-size:13px;margin-bottom:24px}
    </style></head><body>
    <h1>${title}</h1>
    <p class="sub">Eastern Estate ERP — ${new Date().toLocaleDateString('en-IN')}</p>
    ${el.innerHTML}
    </body></html>
  `);
  w.document.close();
  w.print();
}

interface LedgerEntry {
  date: string;
  entryNumber: string;
  narration: string;
  debit: number;
  credit: number;
  balance: number;
}

interface LedgerData {
  account: { accountName: string; accountCode: string };
  openingBalance: number;
  closingBalance: number;
  entries: LedgerEntry[];
}

interface BankAccount {
  id: string;
  accountName: string;
  bankName: string;
  accountNumber: string;
  currentBalance: number;
}

// ─── Cash Book ───────────────────────────────────────────────────────────────
function CashBook() {
  const thisYear = new Date().getFullYear();
  const [startDate, setStartDate] = useState(`${thisYear}-04-01`);
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));
  const [data, setData] = useState<LedgerData | null>(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/accounting/ledgers/cash-book', {
        params: { startDate, endDate },
      });
      setData(res.data);
    } catch (e: any) {
      setError(e.response?.data?.message || e.message || 'Failed to load cash book');
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => { load(); }, []);

  const handleExport = async () => {
    if (!data?.account) return;
    setExporting(true);
    try {
      // find account id from the cash book data - we need to navigate via accounts list
      const accRes = await api.get('/accounting/accounts');
      const accounts = accRes.data?.data || accRes.data || [];
      const cashAcc = accounts.find((a: any) =>
        a.accountCode === data.account.accountCode || a.accountName === data.account.accountName
      );
      if (cashAcc) {
        await downloadWithAuth(
          `/accounting/exports/ledger/${cashAcc.id}?startDate=${startDate}&endDate=${endDate}`,
          `cash-book-${startDate}-to-${endDate}.xlsx`,
        );
      } else {
        setError('Could not locate Cash account for export');
      }
    } catch (e: any) {
      setError(e.message || 'Export failed');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-end">
        <div>
          <Label className="text-xs">From</Label>
          <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-36 h-8 text-sm" />
        </div>
        <div>
          <Label className="text-xs">To</Label>
          <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-36 h-8 text-sm" />
        </div>
        <Button size="sm" onClick={load} disabled={loading} style={{ backgroundColor: '#A8211B' }}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Show'}
        </Button>
        {data && (
          <>
            <Button size="sm" variant="outline" onClick={handleExport} disabled={exporting}>
              <Download className="h-4 w-4 mr-1" />{exporting ? '…' : 'Excel'}
            </Button>
            <Button size="sm" variant="outline" onClick={() => printLedger('Cash Book')}>
              <Printer className="h-4 w-4 mr-1" /> Print
            </Button>
          </>
        )}
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-2 text-sm">{error}</div>}

      {data && (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-4">
            <Card><CardContent className="pt-4">
              <p className="text-xs text-gray-500">Opening Balance</p>
              <p className="text-xl font-bold text-blue-700">{fmt(data.openingBalance)}</p>
            </CardContent></Card>
            <Card><CardContent className="pt-4">
              <p className="text-xs text-gray-500">Closing Balance</p>
              <p className={`text-xl font-bold ${Number(data.closingBalance) >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                {fmt(data.closingBalance)}
              </p>
            </CardContent></Card>
            <Card><CardContent className="pt-4">
              <p className="text-xs text-gray-500">Net Cash Flow</p>
              <p className={`text-xl font-bold ${(Number(data.closingBalance) - Number(data.openingBalance)) >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                {fmt(Number(data.closingBalance) - Number(data.openingBalance))}
              </p>
            </CardContent></Card>
          </div>

          {/* Ledger table */}
          <div id="ledger-print" className="overflow-x-auto">
            <table className="w-full text-sm border rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-gray-100">
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Entry No.</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Narration</th>
                  <th className="text-right px-4 py-3 font-medium text-green-700">Cash In (Dr)</th>
                  <th className="text-right px-4 py-3 font-medium text-red-600">Cash Out (Cr)</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Balance</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t bg-blue-50 text-xs text-blue-700 font-medium">
                  <td colSpan={5} className="px-4 py-2">Opening Balance</td>
                  <td className="px-4 py-2 text-right">{fmt(data.openingBalance)}</td>
                </tr>
                {data.entries.length === 0 && (
                  <tr><td colSpan={6} className="text-center py-8 text-gray-400">No cash transactions in this period</td></tr>
                )}
                {data.entries.map((e, i) => (
                  <tr key={i} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2">{new Date(e.date).toLocaleDateString('en-IN')}</td>
                    <td className="px-4 py-2 font-mono text-xs">{e.entryNumber}</td>
                    <td className="px-4 py-2 text-gray-700">{e.narration}</td>
                    <td className="px-4 py-2 text-right text-green-700 font-mono">
                      {e.debit > 0 ? fmt(e.debit) : '—'}
                    </td>
                    <td className="px-4 py-2 text-right text-red-600 font-mono">
                      {e.credit > 0 ? fmt(e.credit) : '—'}
                    </td>
                    <td className={`px-4 py-2 text-right font-mono font-medium ${e.balance >= 0 ? 'text-gray-800' : 'text-red-700'}`}>
                      {fmt(e.balance)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 bg-gray-50 font-semibold text-sm">
                  <td colSpan={3} className="px-4 py-3">Closing Balance</td>
                  <td className="px-4 py-3 text-right text-green-700 font-mono">
                    {fmt(data.entries.reduce((s, e) => s + Number(e.debit), 0))}
                  </td>
                  <td className="px-4 py-3 text-right text-red-600 font-mono">
                    {fmt(data.entries.reduce((s, e) => s + Number(e.credit), 0))}
                  </td>
                  <td className={`px-4 py-3 text-right font-mono ${Number(data.closingBalance) >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                    {fmt(data.closingBalance)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Bank Book ───────────────────────────────────────────────────────────────
function BankBook() {
  const thisYear = new Date().getFullYear();
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [selectedBank, setSelectedBank] = useState('');
  const [startDate, setStartDate] = useState(`${thisYear}-04-01`);
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));
  const [data, setData] = useState<LedgerData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    bankAccountsService.getAll().then(res => {
      const accs = res.data?.data || res.data || [];
      setBankAccounts(accs);
      if (accs.length > 0) setSelectedBank(accs[0].id);
    }).catch(console.error);
  }, []);

  const load = async () => {
    if (!selectedBank) { setError('Please select a bank account'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/accounting/ledgers/bank-book/${selectedBank}`, {
        params: { startDate, endDate },
      });
      setData(res.data);
    } catch (e: any) {
      setError(e.response?.data?.message || e.message || 'Failed to load bank book. Ensure the bank account is linked to a Chart of Accounts entry with the same name.');
    } finally {
      setLoading(false);
    }
  };

  const selectedBankData = bankAccounts.find(b => b.id === selectedBank);

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-end">
        <div>
          <Label className="text-xs">Bank Account</Label>
          <select
            value={selectedBank}
            onChange={e => setSelectedBank(e.target.value)}
            className="block w-60 h-8 text-sm border border-gray-300 rounded-md px-2"
          >
            {bankAccounts.map(b => (
              <option key={b.id} value={b.id}>
                {b.accountName} — {b.bankName}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label className="text-xs">From</Label>
          <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-36 h-8 text-sm" />
        </div>
        <div>
          <Label className="text-xs">To</Label>
          <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-36 h-8 text-sm" />
        </div>
        <Button size="sm" onClick={load} disabled={loading} style={{ backgroundColor: '#A8211B' }}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Show'}
        </Button>
        {data && (
          <Button size="sm" variant="outline" onClick={() => printLedger(`Bank Book — ${selectedBankData?.accountName}`)}>
            <Printer className="h-4 w-4 mr-1" /> Print
          </Button>
        )}
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-2 text-sm">{error}</div>}

      {bankAccounts.length === 0 && (
        <div className="text-center py-10 text-gray-400">
          <Building2 className="h-10 w-10 mx-auto mb-2 opacity-30" />
          <p>No bank accounts found. Add bank accounts in <strong>Accounting → Bank Accounts</strong></p>
        </div>
      )}

      {data && (
        <>
          <div className="grid grid-cols-3 gap-4">
            <Card><CardContent className="pt-4">
              <p className="text-xs text-gray-500">Opening Balance</p>
              <p className="text-xl font-bold text-blue-700">{fmt(data.openingBalance)}</p>
            </CardContent></Card>
            <Card><CardContent className="pt-4">
              <p className="text-xs text-gray-500">Closing Balance</p>
              <p className={`text-xl font-bold ${Number(data.closingBalance) >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                {fmt(data.closingBalance)}
              </p>
            </CardContent></Card>
            <Card><CardContent className="pt-4">
              <p className="text-xs text-gray-500">Transactions</p>
              <p className="text-xl font-bold text-gray-800">{data.entries.length}</p>
            </CardContent></Card>
          </div>

          <div id="ledger-print" className="overflow-x-auto">
            <table className="w-full text-sm border rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-gray-100">
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Entry No.</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Narration</th>
                  <th className="text-right px-4 py-3 font-medium text-green-700">Debit (In)</th>
                  <th className="text-right px-4 py-3 font-medium text-red-600">Credit (Out)</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Balance</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t bg-blue-50 text-xs text-blue-700 font-medium">
                  <td colSpan={5} className="px-4 py-2">Opening Balance</td>
                  <td className="px-4 py-2 text-right">{fmt(data.openingBalance)}</td>
                </tr>
                {data.entries.length === 0 && (
                  <tr><td colSpan={6} className="text-center py-8 text-gray-400">No transactions in this period</td></tr>
                )}
                {data.entries.map((e, i) => (
                  <tr key={i} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2">{new Date(e.date).toLocaleDateString('en-IN')}</td>
                    <td className="px-4 py-2 font-mono text-xs">{e.entryNumber}</td>
                    <td className="px-4 py-2 text-gray-700">{e.narration}</td>
                    <td className="px-4 py-2 text-right text-green-700 font-mono">
                      {e.debit > 0 ? fmt(e.debit) : '—'}
                    </td>
                    <td className="px-4 py-2 text-right text-red-600 font-mono">
                      {e.credit > 0 ? fmt(e.credit) : '—'}
                    </td>
                    <td className={`px-4 py-2 text-right font-mono font-medium ${e.balance >= 0 ? 'text-gray-800' : 'text-red-700'}`}>
                      {fmt(e.balance)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 bg-gray-50 font-semibold">
                  <td colSpan={3} className="px-4 py-3">Closing Balance</td>
                  <td className="px-4 py-3 text-right text-green-700 font-mono">
                    {fmt(data.entries.reduce((s, e) => s + Number(e.debit), 0))}
                  </td>
                  <td className="px-4 py-3 text-right text-red-600 font-mono">
                    {fmt(data.entries.reduce((s, e) => s + Number(e.credit), 0))}
                  </td>
                  <td className={`px-4 py-3 text-right font-mono ${Number(data.closingBalance) >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                    {fmt(data.closingBalance)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function CashBankBookPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold" style={{ color: '#7B1E12' }}>Cash & Bank Book</h1>
        <p className="text-gray-600 mt-1">Complete ledger of all cash and bank transactions</p>
      </div>

      <Tabs defaultValue="cash">
        <TabsList>
          <TabsTrigger value="cash" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" /> Cash Book
          </TabsTrigger>
          <TabsTrigger value="bank" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" /> Bank Book
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cash">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Cash Book</CardTitle>
            </CardHeader>
            <CardContent>
              <CashBook />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bank">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Bank Book</CardTitle>
            </CardHeader>
            <CardContent>
              <BankBook />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
        <strong>📌 Note:</strong> The Cash Book shows all transactions in your default Cash account (code 1001).
        The Bank Book links your registered bank accounts (from <em>Bank Accounts</em>) to their Chart of Accounts entry by name.
        Ensure each bank account in <em>Accounting → Bank Accounts</em> has a matching account name in <em>Chart of Accounts</em>.
      </div>
    </div>
  );
}
