'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Download, TrendingUp, TrendingDown, BookOpen } from 'lucide-react';
import { accountsService } from '@/services/accounting.service';
import { format, startOfYear, endOfYear } from 'date-fns';

interface LedgerEntry {
  date: string;
  entryNumber: string;
  narration: string;
  debit: number;
  credit: number;
  balance: number;
}

interface LedgerData {
  account: {
    id: string;
    accountCode: string;
    accountName: string;
    accountType: string;
    currentBalance: number;
  };
  openingBalance: number;
  closingBalance: number;
  entries: LedgerEntry[];
}

const TYPE_COLORS: Record<string, string> = {
  ASSET: 'bg-green-100 text-green-800',
  LIABILITY: 'bg-red-100 text-red-800',
  EQUITY: 'bg-blue-100 text-blue-800',
  INCOME: 'bg-purple-100 text-purple-800',
  EXPENSE: 'bg-orange-100 text-orange-800',
};

export default function AccountLedgerPage() {
  const params = useParams();
  const router = useRouter();
  const accountId = params.id as string;

  const [ledger, setLedger] = useState<LedgerData | null>(null);
  const [account, setAccount] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(format(startOfYear(new Date()), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(endOfYear(new Date()), 'yyyy-MM-dd'));

  const fetchLedger = useCallback(async () => {
    setLoading(true);
    try {
      const [ledgerData, accountData] = await Promise.all([
        accountsService.getLedger(accountId, startDate, endDate),
        accountsService.getOne(accountId),
      ]);
      setLedger(ledgerData);
      setAccount(accountData);
    } catch (err) {
      console.error('Error fetching ledger:', err);
    } finally {
      setLoading(false);
    }
  }, [accountId, startDate, endDate]);

  useEffect(() => {
    fetchLedger();
  }, [fetchLedger]);

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Math.abs(n));

  const handleExport = async () => {
    try {
      const apiBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api').replace(/\/+$/, '');
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : '';
      const url = `${apiBase}/accounting/exports/ledger/${accountId}?startDate=${startDate}&endDate=${endDate}`;

      const response = await fetch(url, {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
      });

      if (!response.ok) {
        alert('Export failed: ' + response.statusText);
        return;
      }

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', `ledger-${account?.accountCode || accountId}-${startDate}-${endDate}.xlsx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Export error:', err);
      alert('Export failed. Please try again.');
    }
  };

  const displayAccount = account || ledger?.account;

  return (
    <div className="p-6 space-y-6">
      {/* Back + Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <div className="flex-1">
          {displayAccount ? (
            <div className="flex items-center gap-3">
              <BookOpen className="h-6 w-6" style={{ color: '#A8211B' }} />
              <div>
                <h1 className="text-2xl font-bold">
                  {displayAccount.accountName}
                  <span className="ml-2 font-mono text-gray-400 text-lg">({displayAccount.accountCode})</span>
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={TYPE_COLORS[displayAccount.accountType] || ''}>
                    {displayAccount.accountType}
                  </Badge>
                  <span className="text-sm text-gray-500">Account Ledger</span>
                </div>
              </div>
            </div>
          ) : (
            <h1 className="text-2xl font-bold">Account Ledger</h1>
          )}
        </div>
      </div>

      {/* Date Range + Export */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">From</label>
              <Input
                type="date"
                className="w-40 text-sm"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">To</label>
              <Input
                type="date"
                className="w-40 text-sm"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
              />
            </div>
            <div className="pt-5">
              <Button variant="outline" onClick={fetchLedger} size="sm">Apply</Button>
            </div>
            <div className="pt-5 ml-auto">
              <Button variant="outline" onClick={handleExport} size="sm">
                <Download className="h-4 w-4 mr-1" />
                Export Excel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Balance Summary Cards */}
      {ledger && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-500">Opening Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{fmt(ledger.openingBalance)}</p>
              <p className="text-xs text-gray-400">At {format(new Date(startDate), 'dd MMM yyyy')}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-500">Net Movement</CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-2xl font-bold ${(ledger.closingBalance - ledger.openingBalance) >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                {ledger.closingBalance >= ledger.openingBalance ? '+' : '-'}
                {fmt(ledger.closingBalance - ledger.openingBalance)}
              </p>
              <p className="text-xs text-gray-400">{ledger.entries.length} transactions</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-500">Closing Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold" style={{ color: '#A8211B' }}>{fmt(ledger.closingBalance)}</p>
              <p className="text-xs text-gray-400">At {format(new Date(endDate), 'dd MMM yyyy')}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Ledger Table */}
      <Card>
        <CardHeader>
          <CardTitle>Ledger Transactions</CardTitle>
          <CardDescription>
            {ledger ? `${ledger.entries.length} transactions from ${format(new Date(startDate), 'dd MMM yyyy')} to ${format(new Date(endDate), 'dd MMM yyyy')}` : 'Loading…'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          ) : !ledger || ledger.entries.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="text-lg font-medium">No transactions in this period</p>
              <p className="text-sm">Try expanding the date range or post journal entries for this account</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="text-left p-3 font-medium">Date</th>
                    <th className="text-left p-3 font-medium">Entry #</th>
                    <th className="text-left p-3 font-medium">Narration</th>
                    <th className="text-right p-3 font-medium text-blue-700">Debit</th>
                    <th className="text-right p-3 font-medium text-green-700">Credit</th>
                    <th className="text-right p-3 font-medium">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Opening Balance Row */}
                  <tr className="bg-blue-50 border-b font-semibold text-blue-800">
                    <td className="p-3">{format(new Date(startDate), 'dd MMM yyyy')}</td>
                    <td className="p-3" colSpan={2}>Opening Balance</td>
                    <td className="p-3 text-right">-</td>
                    <td className="p-3 text-right">-</td>
                    <td className="p-3 text-right">{fmt(ledger.openingBalance)}</td>
                  </tr>

                  {/* Transaction Rows */}
                  {ledger.entries.map((entry, i) => (
                    <tr key={i} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="p-3 whitespace-nowrap text-gray-600">
                        {format(new Date(entry.date), 'dd MMM yyyy')}
                      </td>
                      <td className="p-3 font-mono text-xs text-gray-500">{entry.entryNumber}</td>
                      <td className="p-3 text-gray-800">{entry.narration || '-'}</td>
                      <td className="p-3 text-right font-medium text-blue-700">
                        {Number(entry.debit) > 0 ? fmt(entry.debit) : '-'}
                      </td>
                      <td className="p-3 text-right font-medium text-green-700">
                        {Number(entry.credit) > 0 ? fmt(entry.credit) : '-'}
                      </td>
                      <td className={`p-3 text-right font-semibold ${Number(entry.balance) < 0 ? 'text-red-600' : 'text-gray-800'}`}>
                        {fmt(entry.balance)}
                        {Number(entry.balance) < 0 && <span className="text-xs ml-1">(Cr)</span>}
                      </td>
                    </tr>
                  ))}

                  {/* Closing Balance Row */}
                  <tr className="bg-gray-800 text-white font-bold">
                    <td className="p-3">{format(new Date(endDate), 'dd MMM yyyy')}</td>
                    <td className="p-3" colSpan={2}>Closing Balance</td>
                    <td className="p-3 text-right">
                      {fmt(ledger.entries.reduce((s, e) => s + Number(e.debit), 0))}
                    </td>
                    <td className="p-3 text-right">
                      {fmt(ledger.entries.reduce((s, e) => s + Number(e.credit), 0))}
                    </td>
                    <td className="p-3 text-right" style={{ color: '#F3E3C1' }}>
                      {fmt(ledger.closingBalance)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
