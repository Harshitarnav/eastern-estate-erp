'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';
import { accountsService, type Account } from '@/services/accounting.service';

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetchAccounts();
  }, [filter]);

  const fetchAccounts = async () => {
    try {
      const params = filter ? { accountType: filter } : {};
      const data = await accountsService.getAll(params);
      setAccounts(data);
    } catch (error) {
      console.error('Error fetching accounts:', error);
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

  const getTypeBadge = (type: string) => {
    const variants: Record<string, string> = {
      ASSET: 'bg-green-100 text-green-800',
      LIABILITY: 'bg-red-100 text-red-800',
      EQUITY: 'bg-blue-100 text-blue-800',
      INCOME: 'bg-purple-100 text-purple-800',
      EXPENSE: 'bg-orange-100 text-orange-800',
    };
    return <Badge className={variants[type] || ''}>{type}</Badge>;
  };

  if (loading) {
    return <div className="flex items-center justify-center h-96">Loading accounts...</div>;
  }

  const totalsByType = (accounts || []).reduce((acc, account) => {
    acc[account.accountType] = (acc[account.accountType] || 0) + account.currentBalance;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Chart of Accounts</h1>
        <Button onClick={() => (window.location.href = '/accounting/accounts/new')}>
          <Plus className="h-4 w-4 mr-2" />
          New Account
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {['ASSET', 'LIABILITY', 'EQUITY', 'INCOME', 'EXPENSE'].map(type => (
          <Card key={type}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{type}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalsByType[type] || 0)}</div>
              <p className="text-xs text-muted-foreground">
                {(accounts || []).filter(a => a.accountType === type).length} accounts
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          <select
            className="border rounded p-2 w-full md:w-64"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="">All Account Types</option>
            <option value="ASSET">Assets</option>
            <option value="LIABILITY">Liabilities</option>
            <option value="EQUITY">Equity</option>
            <option value="INCOME">Income</option>
            <option value="EXPENSE">Expenses</option>
          </select>
        </CardContent>
      </Card>

      {/* Accounts Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Accounts</CardTitle>
          <CardDescription>{(accounts || []).length} accounts found</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Code</th>
                  <th className="text-left p-2">Account Name</th>
                  <th className="text-left p-2">Type</th>
                  <th className="text-left p-2">Category</th>
                  <th className="text-right p-2">Balance</th>
                  <th className="text-center p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {(accounts || []).map((account) => (
                  <tr key={account.id} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-mono text-sm">{account.accountCode}</td>
                    <td className="p-2 font-medium">{account.accountName}</td>
                    <td className="p-2">{getTypeBadge(account.accountType)}</td>
                    <td className="p-2 text-sm">{account.accountCategory}</td>
                    <td className="p-2 text-right font-medium">
                      {formatCurrency(account.currentBalance)}
                    </td>
                    <td className="p-2 text-center">
                      {account.isActive ? (
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
