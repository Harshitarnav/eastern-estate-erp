'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Check, X, DollarSign } from 'lucide-react';
import { expensesService, type Expense } from '@/services/accounting.service';
import { format } from 'date-fns';

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: '', category: '' });

  useEffect(() => {
    fetchExpenses();
  }, [filter]);

  const fetchExpenses = async () => {
    try {
      const data = await expensesService.getAll(filter);
      setExpenses(data);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await expensesService.approve(id);
      fetchExpenses();
    } catch (error) {
      console.error('Error approving expense:', error);
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;
    try {
      await expensesService.reject(id, reason);
      fetchExpenses();
    } catch (error) {
      console.error('Error rejecting expense:', error);
    }
  };

  const handleMarkPaid = async (id: string) => {
    try {
      await expensesService.markAsPaid(id);
      fetchExpenses();
    } catch (error) {
      console.error('Error marking expense as paid:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-blue-100 text-blue-800',
      PAID: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
    };
    return <Badge className={variants[status] || ''}>{status}</Badge>;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-96">Loading expenses...</div>;
  }

  const totalExpenses = ((expenses || [])).reduce((sum, exp) => sum + exp.amount, 0);
  const pendingCount = ((expenses || [])).filter(e => e.status === 'PENDING').length;
  const approvedCount = ((expenses || [])).filter(e => e.status === 'APPROVED').length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Expenses</h1>
        <Button onClick={() => (window.location.href = '/accounting/expenses/new')}>
          <Plus className="h-4 w-4 mr-2" />
          New Expense
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalExpenses)}</div>
            <p className="text-xs text-muted-foreground">{(expenses || []).length} total expenses</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedCount}</div>
            <p className="text-xs text-muted-foreground">Ready for payment</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Expenses</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <select
            className="border rounded p-2"
            value={filter.status}
            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
          >
            <option value="">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="PAID">Paid</option>
            <option value="REJECTED">Rejected</option>
          </select>
          <select
            className="border rounded p-2"
            value={filter.category}
            onChange={(e) => setFilter({ ...filter, category: e.target.value })}
          >
            <option value="">All Categories</option>
            <option value="SALARY">Salary</option>
            <option value="RENT">Rent</option>
            <option value="UTILITIES">Utilities</option>
            <option value="MARKETING">Marketing</option>
            <option value="MATERIALS">Materials</option>
            <option value="MAINTENANCE">Maintenance</option>
          </select>
        </CardContent>
      </Card>

      {/* Expenses Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Expenses</CardTitle>
          <CardDescription>{(expenses || []).length} expenses found</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Code</th>
                  <th className="text-left p-2">Category</th>
                  <th className="text-left p-2">Type</th>
                  <th className="text-right p-2">Amount</th>
                  <th className="text-left p-2">Date</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-right p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {((expenses || [])).map((expense) => (
                  <tr key={expense.id} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-mono text-sm">{expense.expenseCode}</td>
                    <td className="p-2">{expense.expenseCategory}</td>
                    <td className="p-2">{expense.expenseType}</td>
                    <td className="p-2 text-right font-medium">{formatCurrency(expense.amount)}</td>
                    <td className="p-2">{format(new Date(expense.expenseDate), 'dd MMM yyyy')}</td>
                    <td className="p-2">{getStatusBadge(expense.status)}</td>
                    <td className="p-2">
                      <div className="flex justify-end gap-2">
                        {expense.status === 'PENDING' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleApprove(expense.id)}
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReject(expense.id)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </>
                        )}
                        {expense.status === 'APPROVED' && (
                          <Button
                            size="sm"
                            onClick={() => handleMarkPaid(expense.id)}
                          >
                            Mark Paid
                          </Button>
                        )}
                      </div>
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
