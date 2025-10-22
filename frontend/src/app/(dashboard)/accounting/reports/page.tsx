'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileText, TrendingUp, PieChart } from 'lucide-react';
import { accountsService, budgetsService } from '@/services/accounting.service';

export default function ReportsPage() {
  const [balanceSheet, setBalanceSheet] = useState<any>(null);
  const [profitLoss, setProfitLoss] = useState<any>(null);
  const [variance, setVariance] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const [bs, pl, vr] = await Promise.all([
        accountsService.getBalanceSheet(),
        accountsService.getProfitLoss(),
        budgetsService.getVarianceReport(),
      ]);
      setBalanceSheet(bs);
      setProfitLoss(pl);
      setVariance(vr);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleExport = (reportType: string) => {
    alert(`Export ${reportType} functionality will be implemented`);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-96">Loading reports...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Financial Reports</h1>
      </div>

      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="flex flex-row items-center space-x-4">
            <FileText className="h-8 w-8 text-blue-600" />
            <div>
              <CardTitle className="text-sm">Balance Sheet</CardTitle>
              <CardDescription>Assets & Liabilities</CardDescription>
            </div>
          </CardHeader>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="flex flex-row items-center space-x-4">
            <TrendingUp className="h-8 w-8 text-green-600" />
            <div>
              <CardTitle className="text-sm">Profit & Loss</CardTitle>
              <CardDescription>Income vs Expenses</CardDescription>
            </div>
          </CardHeader>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="flex flex-row items-center space-x-4">
            <PieChart className="h-8 w-8 text-purple-600" />
            <div>
              <CardTitle className="text-sm">Budget Variance</CardTitle>
              <CardDescription>Budget vs Actual</CardDescription>
            </div>
          </CardHeader>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="flex flex-row items-center space-x-4">
            <FileText className="h-8 w-8 text-orange-600" />
            <div>
              <CardTitle className="text-sm">Trial Balance</CardTitle>
              <CardDescription>Debit & Credit</CardDescription>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Balance Sheet Report */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Balance Sheet</CardTitle>
              <CardDescription>As of {new Date().toLocaleDateString()}</CardDescription>
            </div>
            <Button variant="outline" onClick={() => handleExport('Balance Sheet')}>
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Assets */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-green-700">Assets</h3>
              <div className="space-y-2">
                {balanceSheet?.assets?.slice(0, 5).map((account: any) => (
                  <div key={account.id} className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm">{account.accountName}</span>
                    <span className="font-medium">{formatCurrency(account.currentBalance)}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center py-2 font-bold text-lg border-t-2">
                  <span>Total Assets</span>
                  <span className="text-green-700">{formatCurrency(balanceSheet?.totalAssets || 0)}</span>
                </div>
              </div>
            </div>

            {/* Liabilities */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-red-700">Liabilities</h3>
              <div className="space-y-2">
                {balanceSheet?.liabilities?.slice(0, 5).map((account: any) => (
                  <div key={account.id} className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm">{account.accountName}</span>
                    <span className="font-medium">{formatCurrency(account.currentBalance)}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center py-2 font-bold text-lg border-t-2">
                  <span>Total Liabilities</span>
                  <span className="text-red-700">{formatCurrency(balanceSheet?.totalLiabilities || 0)}</span>
                </div>
              </div>
            </div>

            {/* Equity */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-blue-700">Equity</h3>
              <div className="space-y-2">
                {balanceSheet?.equity?.slice(0, 5).map((account: any) => (
                  <div key={account.id} className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm">{account.accountName}</span>
                    <span className="font-medium">{formatCurrency(account.currentBalance)}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center py-2 font-bold text-lg border-t-2">
                  <span>Total Equity</span>
                  <span className="text-blue-700">{formatCurrency(balanceSheet?.totalEquity || 0)}</span>
                </div>
              </div>
            </div>

            {/* Accounting Equation */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-center text-sm text-gray-600 mb-2">
                Accounting Equation Verification
              </div>
              <div className="text-center font-mono text-lg">
                Assets ({formatCurrency(balanceSheet?.totalAssets || 0)}) = 
                Liabilities ({formatCurrency(balanceSheet?.totalLiabilities || 0)}) + 
                Equity ({formatCurrency(balanceSheet?.totalEquity || 0)})
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profit & Loss Report */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Profit & Loss Statement</CardTitle>
              <CardDescription>For the period ending {new Date().toLocaleDateString()}</CardDescription>
            </div>
            <Button variant="outline" onClick={() => handleExport('P&L Statement')}>
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Income */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-green-700">Income</h3>
              <div className="space-y-2">
                {profitLoss?.income?.slice(0, 5).map((account: any) => (
                  <div key={account.id} className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm">{account.accountName}</span>
                    <span className="font-medium">{formatCurrency(account.currentBalance)}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center py-2 font-bold text-lg border-t-2">
                  <span>Total Income</span>
                  <span className="text-green-700">{formatCurrency(profitLoss?.totalIncome || 0)}</span>
                </div>
              </div>
            </div>

            {/* Expenses */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-red-700">Expenses</h3>
              <div className="space-y-2">
                {profitLoss?.expenses?.slice(0, 5).map((account: any) => (
                  <div key={account.id} className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm">{account.accountName}</span>
                    <span className="font-medium">{formatCurrency(account.currentBalance)}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center py-2 font-bold text-lg border-t-2">
                  <span>Total Expenses</span>
                  <span className="text-red-700">{formatCurrency(profitLoss?.totalExpenses || 0)}</span>
                </div>
              </div>
            </div>

            {/* Net Profit/Loss */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold">Net Profit/Loss</span>
                <span className={`text-2xl font-bold ${(profitLoss?.netProfit || 0) >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                  {formatCurrency(profitLoss?.netProfit || 0)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Budget Variance Report */}
      {variance && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Budget Variance Report</CardTitle>
                <CardDescription>Budgeted vs Actual Performance</CardDescription>
              </div>
              <Button variant="outline" onClick={() => handleExport('Variance Report')}>
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Budget Name</th>
                    <th className="text-right p-2">Budgeted</th>
                    <th className="text-right p-2">Actual</th>
                    <th className="text-right p-2">Variance</th>
                    <th className="text-right p-2">Variance %</th>
                  </tr>
                </thead>
                <tbody>
                  {variance?.budgets?.slice(0, 10).map((budget: any) => (
                    <tr key={budget.id} className="border-b hover:bg-gray-50">
                      <td className="p-2">{budget.budgetName}</td>
                      <td className="p-2 text-right">{formatCurrency(budget.budgetedAmount)}</td>
                      <td className="p-2 text-right">{formatCurrency(budget.actualAmount)}</td>
                      <td className={`p-2 text-right font-medium ${budget.varianceAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(Math.abs(budget.varianceAmount))}
                      </td>
                      <td className={`p-2 text-right font-medium ${budget.variancePercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {Math.abs(budget.variancePercentage).toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
