'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, TrendingDown, PieChart, FileText } from 'lucide-react';
import Link from 'next/link';
import { accountsService, expensesService } from '@/services/accounting.service';

export default function AccountingDashboard() {
  const [loading, setLoading] = useState(true);
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
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg">Loading accounting data...</div>
      </div>
    );
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
    </div>
  );
}
