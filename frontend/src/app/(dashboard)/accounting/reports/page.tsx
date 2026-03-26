'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Download, Printer, FileText, TrendingUp, PieChart,
  CheckCircle, XCircle, BarChart3, Calendar, Building2,
} from 'lucide-react';
import { accountsService, budgetsService, downloadWithAuth } from '@/services/accounting.service';
import { api } from '@/services/api';
import { format, startOfYear, endOfYear } from 'date-fns';
import { SectionSkeleton } from '@/components/Skeletons';

type Tab = 'balance-sheet' | 'pl' | 'trial-balance' | 'budget-variance' | 'itr' | 'property-pl' | 'ar-aging' | 'ap-aging' | 'cash-flow';

const fmt = (n: number | string) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(n) || 0);

// ─── Print helper ──────────────────────────────────────────────────────────
function printReport(title: string) {
  const el = document.getElementById('print-area');
  if (!el) return;
  const win = window.open('', '_blank');
  if (!win) return;
  win.document.write(`
    <html><head><title>${title}</title>
    <style>
      body { font-family: Arial, sans-serif; padding: 24px; color: #111; }
      table { width: 100%; border-collapse: collapse; margin-top: 12px; }
      th, td { border: 1px solid #ddd; padding: 8px 12px; text-align: left; }
      th { background: #f3f4f6; font-weight: 600; }
      .text-right { text-align: right; }
      .total-row { font-weight: bold; background: #f9fafb; }
      .section-header { font-size: 16px; font-weight: bold; margin: 20px 0 8px; }
      .green { color: #16a34a; } .red { color: #dc2626; } .blue { color: #2563eb; }
      h1 { font-size: 22px; margin-bottom: 4px; }
      .subtitle { color: #6b7280; font-size: 13px; margin-bottom: 24px; }
    </style>
    </head><body>
    <h1>${title}</h1>
    <p class="subtitle">Eastern Estate ERP — Generated on ${new Date().toLocaleDateString('en-IN')}</p>
    ${el.innerHTML}
    </body></html>
  `);
  win.document.close();
  win.print();
}

// ─── Balance Sheet ─────────────────────────────────────────────────────────
function BalanceSheetReport({ data }: { data: any }) {
  if (!data) return <div className="text-center py-12 text-gray-400">No data available.</div>;
  return (
    <div id="print-area">
      {/* Assets */}
      <div className="mb-6">
        <h3 className="text-base font-bold text-green-700 mb-2 border-b pb-1">ASSETS</h3>
        <table className="w-full text-sm">
          <thead><tr className="bg-gray-50"><th className="text-left p-2">Account</th><th className="text-right p-2">Balance</th></tr></thead>
          <tbody>
            {(data.assets || []).map((a: any) => (
              <tr key={a.id} className="border-b hover:bg-gray-50">
                <td className="p-2"><span className="font-mono text-xs text-gray-400 mr-2">{a.accountCode}</span>{a.accountName}</td>
                <td className="p-2 text-right">{fmt(a.currentBalance)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot><tr className="bg-green-50 font-bold"><td className="p-2">Total Assets</td><td className="p-2 text-right text-green-700">{fmt(data.totalAssets)}</td></tr></tfoot>
        </table>
      </div>
      {/* Liabilities */}
      <div className="mb-6">
        <h3 className="text-base font-bold text-red-700 mb-2 border-b pb-1">LIABILITIES</h3>
        <table className="w-full text-sm">
          <thead><tr className="bg-gray-50"><th className="text-left p-2">Account</th><th className="text-right p-2">Balance</th></tr></thead>
          <tbody>
            {(data.liabilities || []).map((a: any) => (
              <tr key={a.id} className="border-b hover:bg-gray-50">
                <td className="p-2"><span className="font-mono text-xs text-gray-400 mr-2">{a.accountCode}</span>{a.accountName}</td>
                <td className="p-2 text-right">{fmt(a.currentBalance)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot><tr className="bg-red-50 font-bold"><td className="p-2">Total Liabilities</td><td className="p-2 text-right text-red-700">{fmt(data.totalLiabilities)}</td></tr></tfoot>
        </table>
      </div>
      {/* Equity */}
      <div className="mb-6">
        <h3 className="text-base font-bold text-blue-700 mb-2 border-b pb-1">EQUITY</h3>
        <table className="w-full text-sm">
          <thead><tr className="bg-gray-50"><th className="text-left p-2">Account</th><th className="text-right p-2">Balance</th></tr></thead>
          <tbody>
            {(data.equity || []).map((a: any) => (
              <tr key={a.id} className="border-b hover:bg-gray-50">
                <td className="p-2"><span className="font-mono text-xs text-gray-400 mr-2">{a.accountCode}</span>{a.accountName}</td>
                <td className="p-2 text-right">{fmt(a.currentBalance)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot><tr className="bg-blue-50 font-bold"><td className="p-2">Total Equity</td><td className="p-2 text-right text-blue-700">{fmt(data.totalEquity)}</td></tr></tfoot>
        </table>
      </div>
      {/* Equation */}
      <div className="bg-gray-50 rounded-lg p-4 text-sm text-center font-mono border">
        Assets <strong>{fmt(data.totalAssets)}</strong> = Liabilities <strong>{fmt(data.totalLiabilities)}</strong> + Equity <strong>{fmt(data.totalEquity)}</strong>
        {Math.abs((Number(data.totalAssets) || 0) - ((Number(data.totalLiabilities) || 0) + (Number(data.totalEquity) || 0))) < 1 ? (
          <span className="ml-3 text-green-600 font-sans">✓ Balanced</span>
        ) : (
          <span className="ml-3 text-red-600 font-sans">⚠ Not balanced</span>
        )}
      </div>
    </div>
  );
}

// ─── P&L ───────────────────────────────────────────────────────────────────
function PLReport({ data }: { data: any }) {
  if (!data) return <div className="text-center py-12 text-gray-400">No data available.</div>;
  const netProfit = Number(data.netProfit) || 0;
  return (
    <div id="print-area">
      <div className="mb-6">
        <h3 className="text-base font-bold text-green-700 mb-2 border-b pb-1">INCOME</h3>
        <table className="w-full text-sm">
          <thead><tr className="bg-gray-50"><th className="text-left p-2">Account</th><th className="text-right p-2">Amount</th></tr></thead>
          <tbody>
            {(data.income || []).map((a: any) => (
              <tr key={a.id} className="border-b hover:bg-gray-50">
                <td className="p-2"><span className="font-mono text-xs text-gray-400 mr-2">{a.accountCode}</span>{a.accountName}</td>
                <td className="p-2 text-right">{fmt(a.currentBalance)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot><tr className="bg-green-50 font-bold"><td className="p-2">Total Income</td><td className="p-2 text-right text-green-700">{fmt(data.totalIncome)}</td></tr></tfoot>
        </table>
      </div>
      <div className="mb-6">
        <h3 className="text-base font-bold text-red-700 mb-2 border-b pb-1">EXPENSES</h3>
        <table className="w-full text-sm">
          <thead><tr className="bg-gray-50"><th className="text-left p-2">Account</th><th className="text-right p-2">Amount</th></tr></thead>
          <tbody>
            {(data.expenses || []).map((a: any) => (
              <tr key={a.id} className="border-b hover:bg-gray-50">
                <td className="p-2"><span className="font-mono text-xs text-gray-400 mr-2">{a.accountCode}</span>{a.accountName}</td>
                <td className="p-2 text-right">{fmt(a.currentBalance)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot><tr className="bg-red-50 font-bold"><td className="p-2">Total Expenses</td><td className="p-2 text-right text-red-700">{fmt(data.totalExpenses)}</td></tr></tfoot>
        </table>
      </div>
      <div className={`rounded-lg p-5 border-2 ${netProfit >= 0 ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}`}>
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold">{netProfit >= 0 ? 'Net Profit' : 'Net Loss'}</span>
          <span className={`text-3xl font-bold ${netProfit >= 0 ? 'text-green-700' : 'text-red-700'}`}>{fmt(Math.abs(netProfit))}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Trial Balance ─────────────────────────────────────────────────────────
function TrialBalanceReport({ data }: { data: any }) {
  if (!data) return <div className="text-center py-12 text-gray-400">No data available.</div>;
  return (
    <div id="print-area">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="text-left p-2">Code</th>
              <th className="text-left p-2">Account Name</th>
              <th className="text-left p-2">Type</th>
              <th className="text-right p-2 text-blue-700">Debit</th>
              <th className="text-right p-2 text-green-700">Credit</th>
            </tr>
          </thead>
          <tbody>
            {(data.accounts || []).map((a: any) => (
              <tr key={a.accountCode} className="border-b hover:bg-gray-50">
                <td className="p-2 font-mono text-xs text-gray-500">{a.accountCode}</td>
                <td className="p-2">{a.accountName}</td>
                <td className="p-2">
                  <Badge className={{
                    ASSET: 'bg-green-100 text-green-800', LIABILITY: 'bg-red-100 text-red-800',
                    EQUITY: 'bg-blue-100 text-blue-800', INCOME: 'bg-purple-100 text-purple-800',
                    EXPENSE: 'bg-orange-100 text-orange-800',
                  }[a.accountType as string] || ''}>{a.accountType}</Badge>
                </td>
                <td className="p-2 text-right">{Number(a.debit) > 0 ? fmt(a.debit) : '—'}</td>
                <td className="p-2 text-right">{Number(a.credit) > 0 ? fmt(a.credit) : '—'}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-800 text-white font-bold">
              <td colSpan={3} className="p-2">TOTALS</td>
              <td className="p-2 text-right">{fmt(data.totalDebit)}</td>
              <td className="p-2 text-right">{fmt(data.totalCredit)}</td>
            </tr>
            <tr className={data.isBalanced ? 'bg-green-50' : 'bg-red-50'}>
              <td colSpan={5} className="p-2 text-center text-sm font-semibold">
                {data.isBalanced
                  ? <span className="text-green-700 flex items-center justify-center gap-1"><CheckCircle className="h-4 w-4" /> Trial Balance is BALANCED</span>
                  : <span className="text-red-700 flex items-center justify-center gap-1"><XCircle className="h-4 w-4" /> Trial Balance is NOT balanced — Difference: {fmt(Math.abs((Number(data.totalDebit) || 0) - (Number(data.totalCredit) || 0)))}</span>
                }
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

// ─── Budget Variance ────────────────────────────────────────────────────────
function BudgetVarianceReport({ data }: { data: any }) {
  if (!data?.budgets?.length) return <div className="text-center py-12 text-gray-400">No budgets found. Create budgets first.</div>;
  return (
    <div id="print-area">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="text-left p-2">Budget</th>
              <th className="text-left p-2">FY</th>
              <th className="text-right p-2">Budgeted</th>
              <th className="text-right p-2">Actual</th>
              <th className="text-right p-2">Variance</th>
              <th className="text-right p-2">%</th>
              <th className="text-center p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.budgets.map((b: any) => {
              const v = Number(b.varianceAmount) || 0;
              const vp = Number(b.variancePercentage) || 0;
              return (
                <tr key={b.id} className="border-b hover:bg-gray-50">
                  <td className="p-2 font-medium">{b.budgetName}</td>
                  <td className="p-2 text-gray-500">{b.fiscalYear}</td>
                  <td className="p-2 text-right">{fmt(b.budgetedAmount)}</td>
                  <td className="p-2 text-right">{fmt(b.actualAmount)}</td>
                  <td className={`p-2 text-right font-semibold ${v >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {v >= 0 ? '+' : '-'}{fmt(Math.abs(v))}
                  </td>
                  <td className={`p-2 text-right ${vp >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {vp >= 0 ? '+' : ''}{vp.toFixed(1)}%
                  </td>
                  <td className="p-2 text-center">
                    <Badge className={b.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}>{b.status}</Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
          {data.summary && (
            <tfoot>
              <tr className="bg-gray-50 font-bold border-t-2">
                <td colSpan={2} className="p-2">Total</td>
                <td className="p-2 text-right">{fmt(data.summary.totalBudgeted)}</td>
                <td className="p-2 text-right">{fmt(data.summary.totalActual)}</td>
                <td className={`p-2 text-right ${(Number(data.summary.totalVariance) || 0) >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                  {fmt(data.summary.totalVariance)}
                </td>
                <td colSpan={2}></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}

// ─── ITR Export ─────────────────────────────────────────────────────────────
function ITRExport() {
  const currentFY = new Date().getFullYear();
  const [fy, setFy] = useState(`${currentFY - 1}-${currentFY}`);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchITR = async () => {
    setLoading(true);
    try {
      const d = await accountsService.exportITR(fy);
      setData(d);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const downloadJSON = () => {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `itr-${fy}.json`;
    a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Financial Year</label>
          <select className="border rounded-md p-2 text-sm w-48" value={fy} onChange={e => setFy(e.target.value)}>
            {[0,1,2,3].map(i => {
              const y = currentFY - i;
              return <option key={y} value={`${y-1}-${y}`}>{y-1}–{y}</option>;
            })}
          </select>
        </div>
        <Button onClick={fetchITR} disabled={loading} size="sm">
          {loading ? 'Loading…' : 'Fetch Data'}
        </Button>
        {data && (
          <Button onClick={downloadJSON} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-1" /> Download JSON
          </Button>
        )}
      </div>

      {data && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-gray-500">Total Income</CardTitle></CardHeader>
              <CardContent><p className="text-xl font-bold text-green-700">{fmt(data.total_income)}</p></CardContent></Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-gray-500">Total Expenses</CardTitle></CardHeader>
              <CardContent><p className="text-xl font-bold text-red-700">{fmt(data.total_expenses)}</p></CardContent></Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-gray-500">Net Profit</CardTitle></CardHeader>
              <CardContent><p className={`text-xl font-bold ${data.net_profit >= 0 ? 'text-green-700' : 'text-red-700'}`}>{fmt(data.net_profit)}</p></CardContent></Card>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Card><CardHeader><CardTitle className="text-sm">Income Heads</CardTitle></CardHeader>
              <CardContent>
                {(data.income_heads || []).map((h: any) => (
                  <div key={h.head} className="flex justify-between text-sm py-1 border-b"><span>{h.head}</span><span className="font-medium">{fmt(h.amount)}</span></div>
                ))}
              </CardContent>
            </Card>
            <Card><CardHeader><CardTitle className="text-sm">Expense Heads</CardTitle></CardHeader>
              <CardContent>
                {(data.expense_heads || []).map((h: any) => (
                  <div key={h.head} className="flex justify-between text-sm py-1 border-b"><span>{h.head}</span><span className="font-medium">{fmt(h.amount)}</span></div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Property-wise P&L ──────────────────────────────────────────────────────
function PropertyWisePL() {
  const thisYear = new Date().getFullYear();
  const [startDate, setStartDate] = useState(`${thisYear}-04-01`);
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/accounting/reports/property-wise-pl', {
        params: { startDate, endDate },
      });
      setData(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-4">
      {/* Date range picker */}
      <div className="flex flex-wrap gap-3 items-end">
        <div>
          <label className="text-xs text-gray-500 block mb-1">From</label>
          <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-36 h-8 text-sm" />
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">To</label>
          <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-36 h-8 text-sm" />
        </div>
        <Button size="sm" onClick={load} disabled={loading} style={{ backgroundColor: '#A8211B' }}>
          {loading ? 'Loading…' : 'Generate'}
        </Button>
        {data && (
          <Button size="sm" variant="outline" onClick={() => printReport('Property-wise Profit & Loss')}>
            <Printer className="h-4 w-4 mr-1" /> Print
          </Button>
        )}
      </div>

      {loading && <div className="text-center py-10 text-gray-400">Loading…</div>}

      {!loading && data && (
        <div id="print-area" className="space-y-4">
          {/* Totals */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Revenue', value: data.totals?.revenue, color: 'text-green-700' },
              { label: 'Total Expenses', value: data.totals?.expenses, color: 'text-red-600' },
              { label: 'Net Profit', value: data.totals?.netProfit, color: data.totals?.netProfit >= 0 ? 'text-green-700' : 'text-red-700' },
              { label: 'Overall Margin', value: `${data.totals?.margin}%`, color: 'text-blue-700', isStr: true },
            ].map(c => (
              <Card key={c.label}>
                <CardContent className="pt-4">
                  <p className="text-xs text-gray-500">{c.label}</p>
                  <p className={`text-xl font-bold mt-1 ${c.color}`}>
                    {c.isStr ? c.value : fmt(c.value)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Per-property table */}
          <table className="w-full text-sm border rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-gray-100">
                <th className="text-left px-4 py-3 font-medium text-gray-600">Property</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Revenue</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Expenses</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Net Profit</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Margin %</th>
              </tr>
            </thead>
            <tbody>
              {(data.properties || []).map((p: any) => (
                <tr key={p.propertyId} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{p.propertyName}</td>
                  <td className="px-4 py-3 text-right text-green-700 font-mono">{fmt(p.revenue)}</td>
                  <td className="px-4 py-3 text-right text-red-600 font-mono">{fmt(p.expenses)}</td>
                  <td className={`px-4 py-3 text-right font-mono font-semibold ${p.netProfit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                    {fmt(p.netProfit)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.margin >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {p.margin}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 bg-gray-50 font-semibold">
                <td className="px-4 py-3">TOTAL</td>
                <td className="px-4 py-3 text-right text-green-700 font-mono">{fmt(data.totals?.revenue)}</td>
                <td className="px-4 py-3 text-right text-red-600 font-mono">{fmt(data.totals?.expenses)}</td>
                <td className={`px-4 py-3 text-right font-mono ${data.totals?.netProfit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                  {fmt(data.totals?.netProfit)}
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {data.totals?.margin}%
                  </span>
                </td>
              </tr>
            </tfoot>
          </table>

          {data.properties?.length === 0 && (
            <div className="text-center py-10 text-gray-400">
              <Building2 className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p>No data for this period. Ensure payments and expenses are linked to properties.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── AR Aging Report ────────────────────────────────────────────────────────
function ARAgingReport({ data }: { data: any }) {
  if (!data) return <div className="text-center py-12 text-gray-400">Loading aging data…</div>;
  const { customers = [], totals } = data;
  return (
    <div id="print-area">
      {/* Summary buckets */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {[
          { label: '0–30 days', val: totals?.bucket0_30, color: 'text-green-700 bg-green-50 border-green-200' },
          { label: '31–60 days', val: totals?.bucket31_60, color: 'text-yellow-700 bg-yellow-50 border-yellow-200' },
          { label: '61–90 days', val: totals?.bucket61_90, color: 'text-orange-700 bg-orange-50 border-orange-200' },
          { label: '90+ days', val: totals?.bucket90plus, color: 'text-red-700 bg-red-50 border-red-200' },
          { label: 'Total AR', val: totals?.total, color: 'text-gray-800 bg-gray-50 border-gray-200 font-bold' },
        ].map(b => (
          <div key={b.label} className={`rounded-lg border p-3 ${b.color}`}>
            <p className="text-xs font-medium mb-1">{b.label}</p>
            <p className="text-lg font-bold">{fmt(b.val || 0)}</p>
          </div>
        ))}
      </div>

      {customers.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          <CheckCircle className="h-10 w-10 mx-auto mb-2 text-green-400" />
          <p>No outstanding receivables. All customers are up to date!</p>
        </div>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="text-left p-3 font-medium">Customer</th>
              <th className="text-left p-3 font-medium hidden md:table-cell">Booking(s)</th>
              <th className="text-right p-3 font-medium text-green-700">0–30 days</th>
              <th className="text-right p-3 font-medium text-yellow-700">31–60 days</th>
              <th className="text-right p-3 font-medium text-orange-700">61–90 days</th>
              <th className="text-right p-3 font-medium text-red-700">90+ days</th>
              <th className="text-right p-3 font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c: any) => (
              <tr key={c.customerId} className={'border-b hover:bg-gray-50' + (c.bucket90plus > 0 ? ' bg-red-50/30' : '')}>
                <td className="p-3">
                  <p className="font-medium">{c.customerName}</p>
                  <p className="text-xs text-gray-400">{c.customerPhone}</p>
                </td>
                <td className="p-3 hidden md:table-cell text-xs text-gray-500">{(c.bookings || []).join(', ')}</td>
                <td className="p-3 text-right font-mono text-sm">{c.bucket0_30 > 0 ? fmt(c.bucket0_30) : '—'}</td>
                <td className="p-3 text-right font-mono text-sm">{c.bucket31_60 > 0 ? fmt(c.bucket31_60) : '—'}</td>
                <td className="p-3 text-right font-mono text-sm">{c.bucket61_90 > 0 ? fmt(c.bucket61_90) : '—'}</td>
                <td className="p-3 text-right font-mono text-sm font-semibold text-red-700">{c.bucket90plus > 0 ? fmt(c.bucket90plus) : '—'}</td>
                <td className="p-3 text-right font-bold font-mono">{fmt(c.total)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-100 font-bold border-t-2">
              <td className="p-3" colSpan={2}>TOTAL</td>
              <td className="p-3 text-right font-mono text-green-700">{fmt(totals?.bucket0_30)}</td>
              <td className="p-3 text-right font-mono text-yellow-700">{fmt(totals?.bucket31_60)}</td>
              <td className="p-3 text-right font-mono text-orange-700">{fmt(totals?.bucket61_90)}</td>
              <td className="p-3 text-right font-mono text-red-700">{fmt(totals?.bucket90plus)}</td>
              <td className="p-3 text-right font-mono">{fmt(totals?.total)}</td>
            </tr>
          </tfoot>
        </table>
      )}
    </div>
  );
}

// ─── AP Aging Report ────────────────────────────────────────────────────────
function APAgingReport({ data }: { data: any }) {
  if (!data) return <div className="text-center py-12 text-gray-400">Loading aging data…</div>;
  const { vendors = [], totals } = data;
  return (
    <div id="print-area">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {[
          { label: 'Current', val: totals?.current, color: 'text-green-700 bg-green-50 border-green-200' },
          { label: '0–30 days', val: totals?.bucket0_30, color: 'text-yellow-700 bg-yellow-50 border-yellow-200' },
          { label: '31–60 days', val: totals?.bucket31_60, color: 'text-orange-700 bg-orange-50 border-orange-200' },
          { label: '90+ days', val: totals?.bucket90plus, color: 'text-red-700 bg-red-50 border-red-200' },
          { label: 'Total AP', val: totals?.total, color: 'text-gray-800 bg-gray-50 border-gray-200 font-bold' },
        ].map(b => (
          <div key={b.label} className={`rounded-lg border p-3 ${b.color}`}>
            <p className="text-xs font-medium mb-1">{b.label}</p>
            <p className="text-lg font-bold">{fmt(b.val || 0)}</p>
          </div>
        ))}
      </div>

      {vendors.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          <CheckCircle className="h-10 w-10 mx-auto mb-2 text-green-400" />
          <p>No outstanding payables. All vendor balances are cleared!</p>
        </div>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="text-left p-3 font-medium">Vendor</th>
              <th className="text-left p-3 font-medium hidden md:table-cell">Category</th>
              <th className="text-right p-3 font-medium text-green-700">Current</th>
              <th className="text-right p-3 font-medium text-yellow-700">0–30 days</th>
              <th className="text-right p-3 font-medium text-orange-700">31–60 days</th>
              <th className="text-right p-3 font-medium text-red-700">90+ days</th>
              <th className="text-right p-3 font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {vendors.map((v: any) => (
              <tr key={v.vendorId} className={'border-b hover:bg-gray-50' + (v.bucket90plus > 0 ? ' bg-red-50/30' : '')}>
                <td className="p-3">
                  <p className="font-medium">{v.vendorName}</p>
                  <p className="text-xs text-gray-400 font-mono">{v.vendorCode}</p>
                </td>
                <td className="p-3 hidden md:table-cell text-xs text-gray-500">{v.vendorCategory || '—'}</td>
                <td className="p-3 text-right font-mono text-sm">{v.current > 0 ? fmt(v.current) : '—'}</td>
                <td className="p-3 text-right font-mono text-sm">{v.bucket0_30 > 0 ? fmt(v.bucket0_30) : '—'}</td>
                <td className="p-3 text-right font-mono text-sm">{v.bucket31_60 > 0 ? fmt(v.bucket31_60) : '—'}</td>
                <td className="p-3 text-right font-mono text-sm font-semibold text-red-700">{v.bucket90plus > 0 ? fmt(v.bucket90plus) : '—'}</td>
                <td className="p-3 text-right font-bold font-mono">{fmt(v.outstandingAmount)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-100 font-bold border-t-2">
              <td className="p-3" colSpan={2}>TOTAL</td>
              <td className="p-3 text-right font-mono text-green-700">{fmt(totals?.current)}</td>
              <td className="p-3 text-right font-mono text-yellow-700">{fmt(totals?.bucket0_30)}</td>
              <td className="p-3 text-right font-mono text-orange-700">{fmt(totals?.bucket31_60)}</td>
              <td className="p-3 text-right font-mono text-red-700">{fmt(totals?.bucket90plus)}</td>
              <td className="p-3 text-right font-mono">{fmt(totals?.total)}</td>
            </tr>
          </tfoot>
        </table>
      )}
    </div>
  );
}

// ─── Cash Flow Statement ─────────────────────────────────────────────────────
function CashFlowReport({ data }: { data: any }) {
  if (!data) return <div className="text-center py-12 text-gray-400">Loading cash flow data…</div>;

  const sections = [
    { key: 'operating', label: '🏢 Operating Activities', color: 'text-blue-700', bg: 'bg-blue-50', data: data.operating },
    { key: 'investing', label: '🏗️ Investing Activities', color: 'text-purple-700', bg: 'bg-purple-50', data: data.investing },
    { key: 'financing', label: '🏦 Financing Activities', color: 'text-green-700', bg: 'bg-green-50', data: data.financing },
  ];

  return (
    <div id="print-area" className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-lg border p-3 bg-gray-50">
          <p className="text-xs font-medium text-gray-500 mb-1">Opening Balance</p>
          <p className="text-lg font-bold">{fmt(data.openingBalance)}</p>
        </div>
        <div className={'rounded-lg border p-3 ' + (data.netChange >= 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700')}>
          <p className="text-xs font-medium mb-1">Net Change</p>
          <p className="text-lg font-bold">{data.netChange >= 0 ? '+' : ''}{fmt(data.netChange)}</p>
        </div>
        <div className="rounded-lg border p-3 bg-blue-50 text-blue-700">
          <p className="text-xs font-medium mb-1">Closing Balance</p>
          <p className="text-lg font-bold">{fmt(data.closingBalance)}</p>
        </div>
        <div className="rounded-lg border p-3 bg-gray-50">
          <p className="text-xs font-medium text-gray-500 mb-1">Net Operating</p>
          <p className={'text-lg font-bold ' + (data.operating?.total >= 0 ? 'text-green-700' : 'text-red-700')}>
            {fmt(data.operating?.total)}
          </p>
        </div>
      </div>

      {/* Sections */}
      {sections.map(s => (
        <div key={s.key}>
          <div className={'flex items-center justify-between px-4 py-2 rounded-t-lg ' + s.bg}>
            <h3 className={'font-bold text-sm ' + s.color}>{s.label}</h3>
            <span className={'font-bold font-mono text-sm ' + s.color}>
              {(s.data?.total || 0) >= 0 ? '+' : ''}{fmt(s.data?.total || 0)}
            </span>
          </div>
          {(s.data?.items || []).length > 0 ? (
            <table className="w-full text-sm border border-t-0 rounded-b-lg">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="text-left p-2 font-medium text-xs">Date</th>
                  <th className="text-left p-2 font-medium text-xs">Description</th>
                  <th className="text-left p-2 font-medium text-xs hidden md:table-cell">Account</th>
                  <th className="text-right p-2 font-medium text-xs text-blue-700">Dr</th>
                  <th className="text-right p-2 font-medium text-xs text-green-700">Cr</th>
                </tr>
              </thead>
              <tbody>
                {(s.data?.items || []).slice(0, 20).map((item: any, i: number) => (
                  <tr key={i} className="border-b hover:bg-gray-50">
                    <td className="p-2 text-xs text-gray-500 whitespace-nowrap">
                      {item.date ? format(new Date(item.date), 'dd MMM') : '—'}
                    </td>
                    <td className="p-2 text-xs max-w-xs truncate">{item.description || '—'}</td>
                    <td className="p-2 text-xs text-gray-500 hidden md:table-cell">{item.accountName}</td>
                    <td className="p-2 text-right font-mono text-xs text-blue-700">{item.debit > 0 ? fmt(item.debit) : '—'}</td>
                    <td className="p-2 text-right font-mono text-xs text-green-700">{item.credit > 0 ? fmt(item.credit) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="border border-t-0 rounded-b-lg p-4 text-center text-sm text-gray-400">No transactions in this category</div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────
export default function ReportsPage() {
  const [tab, setTab] = useState<Tab>('balance-sheet');
  const [balanceSheet, setBalanceSheet] = useState<any>(null);
  const [profitLoss, setProfitLoss] = useState<any>(null);
  const [trialBalance, setTrialBalance] = useState<any>(null);
  const [variance, setVariance] = useState<any>(null);
  const [arAging, setArAging] = useState<any>(null);
  const [apAging, setApAging] = useState<any>(null);
  const [cashFlow, setCashFlow] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lazyLoading, setLazyLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [tbDate, setTbDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  useEffect(() => {
    (async () => {
    try {
        const [bs, pl, tb, vr] = await Promise.all([
        accountsService.getBalanceSheet(),
        accountsService.getProfitLoss(),
          accountsService.getTrialBalance(),
        budgetsService.getVarianceReport(),
      ]);
      setBalanceSheet(bs);
      setProfitLoss(pl);
        setTrialBalance(tb);
      setVariance(vr);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  // Lazy-load AR/AP aging and Cash Flow when those tabs are first opened
  useEffect(() => {
    if (tab === 'ar-aging' && !arAging) {
      setLazyLoading(true);
      api.get('/accounting/reports/ar-aging')
        .then((d: any) => setArAging(d))
        .catch(console.error)
        .finally(() => setLazyLoading(false));
    }
    if (tab === 'ap-aging' && !apAging) {
      setLazyLoading(true);
      api.get('/accounting/reports/ap-aging')
        .then((d: any) => setApAging(d))
        .catch(console.error)
        .finally(() => setLazyLoading(false));
    }
    if (tab === 'cash-flow' && !cashFlow) {
      const fyStart = new Date(new Date().getFullYear(), 3, 1).toISOString().slice(0, 10); // April 1
      const today = format(new Date(), 'yyyy-MM-dd');
      setLazyLoading(true);
      api.get('/accounting/reports/cash-flow', { params: { startDate: fyStart, endDate: today } })
        .then((d: any) => setCashFlow(d))
        .catch(console.error)
        .finally(() => setLazyLoading(false));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const handleExportTrialBalance = async () => {
    setExporting(true);
    try {
      await downloadWithAuth(
        `/accounting/exports/trial-balance?date=${tbDate}`,
        `trial-balance-${tbDate}.xlsx`,
      );
    } catch (e: any) {
      alert(e.message || 'Export failed');
    } finally { setExporting(false); }
  };

  const tabConfig: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'balance-sheet', label: 'Balance Sheet', icon: <FileText className="h-4 w-4" /> },
    { id: 'pl', label: 'Profit & Loss', icon: <TrendingUp className="h-4 w-4" /> },
    { id: 'property-pl', label: 'Property-wise P&L', icon: <Building2 className="h-4 w-4" /> },
    { id: 'trial-balance', label: 'Trial Balance', icon: <BarChart3 className="h-4 w-4" /> },
    { id: 'budget-variance', label: 'Budget Variance', icon: <PieChart className="h-4 w-4" /> },
    { id: 'cash-flow', label: 'Cash Flow', icon: <TrendingUp className="h-4 w-4" /> },
    { id: 'ar-aging', label: 'AR Aging', icon: <XCircle className="h-4 w-4" /> },
    { id: 'ap-aging', label: 'AP Aging', icon: <CheckCircle className="h-4 w-4" /> },
    { id: 'itr', label: 'ITR Export', icon: <Calendar className="h-4 w-4" /> },
  ];

  if (loading) {
    return <div className="p-6 space-y-4"><SectionSkeleton rows={4} /><SectionSkeleton rows={4} /></div>;
  }

  const reportTitle: Record<Tab, string> = {
    'balance-sheet': 'Balance Sheet',
    'pl': 'Profit & Loss Statement',
    'property-pl': 'Property-wise Profit & Loss',
    'trial-balance': 'Trial Balance',
    'budget-variance': 'Budget Variance Report',
    'itr': 'ITR Export',
    'ar-aging': 'Accounts Receivable Aging',
    'ap-aging': 'Accounts Payable Aging',
    'cash-flow': 'Cash Flow Statement',
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
        <h1 className="text-3xl font-bold">Financial Reports</h1>
          <p className="text-sm text-gray-500 mt-1">As of {format(new Date(), 'dd MMM yyyy')}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b">
        {tabConfig.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
              tab === t.id
                ? 'border-[#A8211B] text-[#A8211B]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {/* Report Panel */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle>{reportTitle[tab]}</CardTitle>
              <CardDescription>
                {tab === 'balance-sheet' && 'Assets = Liabilities + Equity'}
                {tab === 'pl' && 'Income − Expenses = Net Profit / Loss'}
                {tab === 'property-pl' && 'Revenue vs Expenses broken down per property'}
                {tab === 'trial-balance' && 'Total Debits must equal Total Credits'}
                {tab === 'budget-variance' && 'Planned vs actual spend across all budgets'}
                {tab === 'itr' && 'Income & expense summary for ITR filing'}
                {tab === 'ar-aging' && 'Outstanding installments from flat buyers, bucketed by overdue days'}
                {tab === 'ap-aging' && 'Outstanding vendor payables, bucketed by overdue days'}
                {tab === 'cash-flow' && 'Operating, Investing & Financing cash flows for this financial year'}
              </CardDescription>
            </div>

            {/* Export buttons */}
            <div className="flex items-center gap-2">
              {tab === 'trial-balance' && (
                <div className="flex items-center gap-2">
                  <Input type="date" value={tbDate} onChange={e => setTbDate(e.target.value)} className="w-36 text-sm h-8" />
                  <Button size="sm" variant="outline" onClick={handleExportTrialBalance} disabled={exporting}>
                    <Download className="h-4 w-4 mr-1" />{exporting ? 'Exporting…' : 'Excel'}
                  </Button>
                </div>
              )}
              {(tab === 'balance-sheet' || tab === 'pl' || tab === 'budget-variance') && (
                <Button size="sm" variant="outline" onClick={() => printReport(reportTitle[tab])}>
                  <Printer className="h-4 w-4 mr-1" /> Print / PDF
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {lazyLoading && (tab === 'ar-aging' || tab === 'ap-aging' || tab === 'cash-flow') && (
            <div className="text-center py-12 text-gray-400 animate-pulse">Loading report…</div>
          )}
          {tab === 'balance-sheet' && <BalanceSheetReport data={balanceSheet} />}
          {tab === 'pl' && <PLReport data={profitLoss} />}
          {tab === 'property-pl' && <PropertyWisePL />}
          {tab === 'trial-balance' && <TrialBalanceReport data={trialBalance} />}
          {tab === 'budget-variance' && <BudgetVarianceReport data={variance} />}
          {tab === 'itr' && <ITRExport />}
          {tab === 'ar-aging' && !lazyLoading && <ARAgingReport data={arAging} />}
          {tab === 'ap-aging' && !lazyLoading && <APAgingReport data={apAging} />}
          {tab === 'cash-flow' && !lazyLoading && <CashFlowReport data={cashFlow} />}
        </CardContent>
      </Card>
    </div>
  );
}
