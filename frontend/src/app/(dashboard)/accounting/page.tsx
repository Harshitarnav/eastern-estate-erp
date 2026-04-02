'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, TrendingDown, PieChart, FileText, BookOpen, BarChart3, RefreshCw, Calculator, Lightbulb, ArrowRight, Database, Building2, Users } from 'lucide-react';
import Link from 'next/link';
import { accountsService, expensesService } from '@/services/accounting.service';
import { DashboardSkeleton } from '@/components/Skeletons';

export default function AccountingDashboard() {
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [balanceSheet, setBalanceSheet] = useState<any>(null);
  const [profitLoss, setProfitLoss] = useState<any>(null);
  const [expenseSummary, setExpenseSummary] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bs, pl, es] = await Promise.all([
          accountsService.getBalanceSheet(),
          accountsService.getProfitLoss(),
          expensesService.getSummary(),
        ]);
        setBalanceSheet(bs);
        setProfitLoss(pl);
        setExpenseSummary(es);
      } catch (error) {
        console.error('Error fetching accounting data:', error);
        setFetchError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <DashboardSkeleton />;
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Accounting Dashboard</h1>
      </div>

      {fetchError && (
        <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2">
          <span className="font-medium">⚠ Failed to load financial data.</span>
          <span className="text-amber-600">Values shown may be zero or stale. Check your connection and refresh.</span>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(balanceSheet?.totalAssets || 0)}</div>
            <p className="text-xs text-muted-foreground mt-1">Current asset value</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Liabilities</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(balanceSheet?.totalLiabilities || 0)}</div>
            <p className="text-xs text-muted-foreground mt-1">Outstanding liabilities</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Equity</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(balanceSheet?.totalEquity || 0)}</div>
            <p className="text-xs text-muted-foreground mt-1">Owner's equity</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(profitLoss?.netProfit || 0)}</div>
            <p className="text-xs text-muted-foreground mt-1">Income - Expenses</p>
          </CardContent>
        </Card>
      </div>

      {/* Balance Sheet & P&L Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Balance Sheet Summary</CardTitle>
            <CardDescription>Assets, Liabilities & Equity breakdown</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Assets</span>
                <span className="text-sm font-bold text-green-600">
                  {formatCurrency(balanceSheet?.totalAssets || 0)}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                {balanceSheet?.assets?.length || 0} accounts
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Liabilities</span>
                <span className="text-sm font-bold text-red-600">
                  {formatCurrency(balanceSheet?.totalLiabilities || 0)}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                {balanceSheet?.liabilities?.length || 0} accounts
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Equity</span>
                <span className="text-sm font-bold text-blue-600">
                  {formatCurrency(balanceSheet?.totalEquity || 0)}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                {balanceSheet?.equity?.length || 0} accounts
              </div>
            </div>
            <div className="pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold">Accounting Equation</span>
                <span className="text-xs text-muted-foreground">
                  Assets = Liabilities + Equity
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Profit & Loss Summary</CardTitle>
            <CardDescription>Income and Expense breakdown</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Total Income</span>
                <span className="text-sm font-bold text-green-600">
                  {formatCurrency(profitLoss?.totalIncome || 0)}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                {profitLoss?.income?.length || 0} income accounts
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Total Expenses</span>
                <span className="text-sm font-bold text-red-600">
                  {formatCurrency(profitLoss?.totalExpenses || 0)}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                {profitLoss?.expenses?.length || 0} expense accounts
              </div>
            </div>
            <div className="pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold">Net Profit</span>
                <span className={`text-lg font-bold ${(profitLoss?.netProfit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(profitLoss?.netProfit || 0)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/accounting/accounts">
          <Card className="hover:bg-accent cursor-pointer transition-colors">
            <CardHeader className="flex flex-row items-center space-x-4">
              <FileText className="h-8 w-8 text-primary" />
              <div>
                <CardTitle className="text-lg">Chart of Accounts</CardTitle>
                <CardDescription>Manage account hierarchy</CardDescription>
              </div>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/accounting/expenses">
          <Card className="hover:bg-accent cursor-pointer transition-colors">
            <CardHeader className="flex flex-row items-center space-x-4">
              <DollarSign className="h-8 w-8 text-primary" />
              <div>
                <CardTitle className="text-lg">Expenses</CardTitle>
                <CardDescription>Track and approve expenses</CardDescription>
              </div>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/accounting/budgets">
          <Card className="hover:bg-accent cursor-pointer transition-colors">
            <CardHeader className="flex flex-row items-center space-x-4">
              <PieChart className="h-8 w-8 text-primary" />
              <div>
                <CardTitle className="text-lg">Budgets</CardTitle>
                <CardDescription>Monitor budget performance</CardDescription>
              </div>
            </CardHeader>
          </Card>
        </Link>
      </div>

      {/* Expense Summary */}
      {expenseSummary && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Expenses Summary</CardTitle>
            <CardDescription>Total: {formatCurrency(expenseSummary.totalExpenses || 0)}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {expenseSummary.byCategory?.slice(0, 5).map((cat: any) => (
                <div key={cat.category} className="flex justify-between items-center">
                  <span className="text-sm">{cat.category}</span>
                  <span className="text-sm font-medium">{formatCurrency(cat.total)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Accountant's Quick Guide ───────────────────────────────────────── */}
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 space-y-5">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-amber-600 flex-shrink-0" />
          <h2 className="text-base font-bold text-amber-900">Accountant's Quick Guide — Where to do What</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">

          {/* Chart of Accounts */}
          <Link href="/accounting/accounts">
            <div className="bg-white rounded-xl border border-amber-100 p-4 hover:shadow-md transition-shadow cursor-pointer h-full">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-lg bg-green-100">
                  <BookOpen className="h-4 w-4 text-green-700" />
                </div>
                <span className="font-semibold text-sm text-gray-800">Chart of Accounts</span>
                <ArrowRight className="h-3 w-3 text-gray-400 ml-auto" />
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                Set up and manage all your ledger accounts — Cash, Bank, Sales, Rent, etc. Think of this as the <strong>master list of all heads</strong> in your books. Create accounts here before recording any entry.
              </p>
              <div className="mt-3 flex flex-wrap gap-1">
                {['Add new account', 'View balances', 'Open ledger'].map(t => (
                  <span key={t} className="text-xs bg-green-50 text-green-700 border border-green-200 rounded px-2 py-0.5">{t}</span>
                ))}
              </div>
            </div>
          </Link>

          {/* Journal Entries */}
          <Link href="/accounting/journal-entries">
            <div className="bg-white rounded-xl border border-amber-100 p-4 hover:shadow-md transition-shadow cursor-pointer h-full">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-lg bg-blue-100">
                  <FileText className="h-4 w-4 text-blue-700" />
                </div>
                <span className="font-semibold text-sm text-gray-800">Journal Entries</span>
                <ArrowRight className="h-3 w-3 text-gray-400 ml-auto" />
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                Record every financial transaction here using <strong>double-entry</strong> (Debit = Credit). This is the heart of accounting — like Tally's voucher entry. Save as <em>Draft</em> first, then <em>Post</em> to update balances.
              </p>
              <div className="mt-3 flex flex-wrap gap-1">
                {['Record transaction', 'Post entry', 'Void mistake'].map(t => (
                  <span key={t} className="text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded px-2 py-0.5">{t}</span>
                ))}
              </div>
            </div>
          </Link>

          {/* Account Ledger */}
          <Link href="/accounting/accounts">
            <div className="bg-white rounded-xl border border-amber-100 p-4 hover:shadow-md transition-shadow cursor-pointer h-full">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-lg bg-purple-100">
                  <Database className="h-4 w-4 text-purple-700" />
                </div>
                <span className="font-semibold text-sm text-gray-800">Account Ledger</span>
                <ArrowRight className="h-3 w-3 text-gray-400 ml-auto" />
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                See every transaction in a single account with running balance — exactly like Tally's ledger view. Go to <strong>Chart of Accounts → click Ledger</strong> on any account. Filter by date range and export to Excel.
              </p>
              <div className="mt-3 flex flex-wrap gap-1">
                {['Running balance', 'Date filter', 'Export Excel'].map(t => (
                  <span key={t} className="text-xs bg-purple-50 text-purple-700 border border-purple-200 rounded px-2 py-0.5">{t}</span>
                ))}
              </div>
            </div>
          </Link>

          {/* Expenses */}
          <Link href="/accounting/expenses">
            <div className="bg-white rounded-xl border border-amber-100 p-4 hover:shadow-md transition-shadow cursor-pointer h-full">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-lg bg-orange-100">
                  <DollarSign className="h-4 w-4 text-orange-700" />
                </div>
                <span className="font-semibold text-sm text-gray-800">Expenses</span>
                <ArrowRight className="h-3 w-3 text-gray-400 ml-auto" />
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                Log and approve operational expenses — site costs, office bills, vendor payments, etc. Expenses submitted by staff come here for <strong>approval or rejection</strong>. Approved expenses auto-update the P&amp;L.
              </p>
              <div className="mt-3 flex flex-wrap gap-1">
                {['Approve expense', 'Reject expense', 'Track by category'].map(t => (
                  <span key={t} className="text-xs bg-orange-50 text-orange-700 border border-orange-200 rounded px-2 py-0.5">{t}</span>
                ))}
              </div>
            </div>
          </Link>

          {/* Budgets */}
          <Link href="/accounting/budgets">
            <div className="bg-white rounded-xl border border-amber-100 p-4 hover:shadow-md transition-shadow cursor-pointer h-full">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-lg bg-teal-100">
                  <TrendingUp className="h-4 w-4 text-teal-700" />
                </div>
                <span className="font-semibold text-sm text-gray-800">Budgets</span>
                <ArrowRight className="h-3 w-3 text-gray-400 ml-auto" />
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                Set budget targets for each expense or project category and track how much has been spent vs. the allocated amount. Use this for <strong>project cost control</strong> and to flag overspending early.
              </p>
              <div className="mt-3 flex flex-wrap gap-1">
                {['Set budget', 'Track variance', 'Overspend alerts'].map(t => (
                  <span key={t} className="text-xs bg-teal-50 text-teal-700 border border-teal-200 rounded px-2 py-0.5">{t}</span>
                ))}
              </div>
            </div>
          </Link>

          {/* Bank Accounts & Reconciliation */}
          <Link href="/accounting/bank-accounts">
            <div className="bg-white rounded-xl border border-amber-100 p-4 hover:shadow-md transition-shadow cursor-pointer h-full">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-lg bg-sky-100">
                  <RefreshCw className="h-4 w-4 text-sky-700" />
                </div>
                <span className="font-semibold text-sm text-gray-800">Bank Reconciliation</span>
                <ArrowRight className="h-3 w-3 text-gray-400 ml-auto" />
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                Upload your bank statement (Excel) and match each bank transaction to a posted journal entry. Helps ensure your books match your actual bank balance.
              </p>
              <div className="mt-3 flex flex-wrap gap-1">
                {['Upload statement', 'Match transactions', 'Track reconciled'].map(t => (
                  <span key={t} className="text-xs bg-sky-50 text-sky-700 border border-sky-200 rounded px-2 py-0.5">{t}</span>
                ))}
              </div>
            </div>
          </Link>

          {/* Cash & Bank Book */}
          <Link href="/accounting/cash-bank-book">
            <div className="bg-white rounded-xl border border-amber-100 p-4 hover:shadow-md transition-shadow cursor-pointer h-full">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-lg bg-indigo-100">
                  <BookOpen className="h-4 w-4 text-indigo-700" />
                </div>
                <span className="font-semibold text-sm text-gray-800">Cash & Bank Book</span>
                <ArrowRight className="h-3 w-3 text-gray-400 ml-auto" />
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                Full chronological ledger of all <strong>cash transactions</strong> (Cash Book) and <strong>bank transactions</strong> (Bank Book) with running balance — exactly like Tally. Filter by date, print, or export.
              </p>
              <div className="mt-3 flex flex-wrap gap-1">
                {['Cash Book', 'Bank Book', 'Running balance'].map(t => (
                  <span key={t} className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 rounded px-2 py-0.5">{t}</span>
                ))}
              </div>
            </div>
          </Link>

          {/* Property-wise P&L */}
          <Link href="/accounting/reports">
            <div className="bg-white rounded-xl border border-amber-100 p-4 hover:shadow-md transition-shadow cursor-pointer h-full">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-lg bg-emerald-100">
                  <Building2 className="h-4 w-4 text-emerald-700" />
                </div>
                <span className="font-semibold text-sm text-gray-800">Property-wise P&L</span>
                <ArrowRight className="h-3 w-3 text-gray-400 ml-auto" />
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                See which <strong>project / property is most profitable</strong>. Revenue from payments vs. expenses per site, with net profit and margin %. Go to Reports → Property-wise P&L tab.
              </p>
              <div className="mt-3 flex flex-wrap gap-1">
                {['Per-property revenue', 'Profit margin', 'Site comparison'].map(t => (
                  <span key={t} className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 rounded px-2 py-0.5">{t}</span>
                ))}
              </div>
            </div>
          </Link>

          {/* Payroll */}
          <Link href="/hr/payroll">
            <div className="bg-white rounded-xl border border-amber-100 p-4 hover:shadow-md transition-shadow cursor-pointer h-full">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-lg bg-rose-100">
                  <Users className="h-4 w-4 text-rose-700" />
                </div>
                <span className="font-semibold text-sm text-gray-800">Payroll (HR)</span>
                <ArrowRight className="h-3 w-3 text-gray-400 ml-auto" />
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                Process monthly salaries with PF, ESI, and TDS deductions. When you click <strong>"Pay Now"</strong>, a Journal Entry is <em>automatically</em> created: Salary Expense Dr → Bank Cr.
              </p>
              <div className="mt-3 flex flex-wrap gap-1">
                {['Create salary', 'Deductions', 'Auto Journal Entry'].map(t => (
                  <span key={t} className="text-xs bg-rose-50 text-rose-700 border border-rose-200 rounded px-2 py-0.5">{t}</span>
                ))}
              </div>
            </div>
          </Link>

          {/* Reports */}
          <Link href="/accounting/reports">
            <div className="bg-white rounded-xl border border-amber-100 p-4 hover:shadow-md transition-shadow cursor-pointer h-full">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-lg bg-red-100">
                  <BarChart3 className="h-4 w-4 text-red-700" />
                </div>
                <span className="font-semibold text-sm text-gray-800">Financial Reports</span>
                <ArrowRight className="h-3 w-3 text-gray-400 ml-auto" />
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                View <strong>Balance Sheet</strong>, <strong>P&amp;L Statement</strong>, <strong>Trial Balance</strong>, <strong>Budget Variance</strong>, and <strong>ITR Export</strong>. Share with management or auditors. All exportable to Excel/PDF.
              </p>
              <div className="mt-3 flex flex-wrap gap-1">
                {['Balance Sheet', 'P&L', 'Trial Balance', 'ITR'].map(t => (
                  <span key={t} className="text-xs bg-red-50 text-red-700 border border-red-200 rounded px-2 py-0.5">{t}</span>
                ))}
              </div>
            </div>
          </Link>

        </div>

        {/* Daily workflow tip */}
        <div className="bg-white rounded-xl border border-amber-200 p-4">
          <div className="flex items-start gap-3">
            <Calculator className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-900 mb-1">📋 Typical Daily Workflow for an Accountant</p>
              <ol className="text-xs text-gray-600 space-y-1 list-none">
                {[
                  ['1', 'Recording a transaction?', 'Journal Entries → New → enter Debit & Credit → Save Draft → Post'],
                  ['2', 'Payment received from a customer?', 'Auto JE created when you verify a payment in Payments module'],
                  ['3', 'Made a mistake on a posted entry?', 'Click Void → enter reason → make a correcting entry'],
                  ['4', 'Want to see one account\'s history?', 'Chart of Accounts → find account → click Ledger → filter by date'],
                  ['5', 'Check daily cash position?', 'Cash & Bank Book → Cash Book tab → select date range'],
                  ['6', 'Need P&L or Balance Sheet?', 'Reports → choose Balance Sheet / P&L / Property-wise P&L → Export'],
                  ['7', 'Process monthly salaries?', 'HR → Payroll → Add Salary → Pay Now → auto Journal Entry created'],
                  ['8', 'Staff submitted an expense?', 'Expenses → Approve → Mark as Paid → auto Journal Entry created'],
                ].map(([num, task, action]) => (
                  <li key={num} className="flex gap-2">
                    <span className="flex-shrink-0 w-5 h-5 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center text-xs font-bold">{num}</span>
                    <span><strong>{task}</strong> → <span className="text-gray-500">{action}</span></span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
