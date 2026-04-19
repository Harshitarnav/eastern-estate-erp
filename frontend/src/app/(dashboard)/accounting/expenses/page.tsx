'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Plus, Check, X, DollarSign, Pencil, Eye, FileSpreadsheet } from 'lucide-react';
import { expensesService, type Expense } from '@/services/accounting.service';
import { format } from 'date-fns';
import { TableRowsSkeleton } from '@/components/Skeletons';
import { usePropertyStore } from '@/store/propertyStore';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import { ExcelImportModal, type ImportField, type RowValidationError } from '@/components/accounting/ExcelImportModal';

export default function ExpensesPage() {
  const { selectedProperties } = usePropertyStore();
  const selectedPropertyId = selectedProperties[0] ?? undefined;
  const { user } = useAuthStore();
  const canAdminEdit = user?.roles?.some((r: any) =>
    ['super_admin', 'admin'].includes(typeof r === 'string' ? r : r.name)
  );

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: '', category: '' });
  const [importOpen, setImportOpen] = useState(false);
  const { properties } = usePropertyStore();
  const selectedPropertyName =
    selectedPropertyId ? properties.find((p) => p.id === selectedPropertyId)?.name : undefined;

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { ...filter };
      if (selectedPropertyId) params.propertyId = selectedPropertyId;
      const data = await expensesService.getAll(params);
      setExpenses(data);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setLoading(false);
    }
  }, [filter, selectedPropertyId]);

  useEffect(() => { fetchExpenses(); }, [fetchExpenses]);

  const handleApprove = async (id: string) => {
    try {
      await expensesService.approve(id);
      void fetchExpenses();
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

  const formatCurrency = (amount: any) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(Number(amount) || 0);
  };

  if (loading) {
    return <div className="p-6"><TableRowsSkeleton rows={6} cols={5} /></div>;
  }

  const totalExpenses = ((expenses || [])).reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);
  const pendingCount = ((expenses || [])).filter(e => e.status === 'PENDING').length;
  const approvedCount = ((expenses || [])).filter(e => e.status === 'APPROVED').length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-3">
        <h1 className="text-3xl font-bold">Expenses</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setImportOpen(true)} title="Import expenses from Excel">
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Import Excel
          </Button>
          <Button onClick={() => (window.location.href = '/accounting/expenses/new')}>
            <Plus className="h-4 w-4 mr-2" />
            New Expense
          </Button>
        </div>
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
                  <th className="text-left p-2">Project</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-right p-2">Details / Actions</th>
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
                    <td className="p-2 text-sm text-gray-500">{(expense as any).property?.name ?? ((expense as any).propertyId ? '…' : <span className="text-gray-300">-</span>)}</td>
                    <td className="p-2">{getStatusBadge(expense.status)}</td>
                    <td className="p-2">
                      <div className="flex justify-end gap-2 flex-wrap">
                        <Button size="sm" variant="outline" asChild title="View details">
                          <Link href={`/accounting/expenses/${expense.id}`}>
                            <Eye className="h-3 w-3" />
                          </Link>
                        </Button>
                        {canAdminEdit && expense.status === 'PENDING' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => (window.location.href = `/accounting/expenses/${expense.id}/edit`)}
                            title="Edit"
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                        )}
                        {expense.status === 'PENDING' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleApprove(expense.id)}
                              title="Approve"
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReject(expense.id)}
                              title="Reject"
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

      <ExcelImportModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        title="Import Expenses"
        description={
          <span>
            Upload an Excel of expenses (one per row). All imported rows land in <strong>PENDING</strong>{' '}
            status so the normal approve / mark-paid flow still applies.
          </span>
        }
        scopeLabel={
          selectedPropertyId
            ? `Importing to project: ${selectedPropertyName || selectedPropertyId}`
            : 'No project selected - rows will be tagged to the project in each row, if any'
        }
        fields={expenseImportFields}
        sampleRows={expenseSampleRows}
        validate={(rows) => validateExpenseRows(rows)}
        onImport={async (rows) => {
          const res = await expensesService.bulkImport({
            propertyId: selectedPropertyId || null,
            rows,
          });
          if (res.created > 0) {
            toast.success(`Imported ${res.created} expense${res.created !== 1 ? 's' : ''}`);
            fetchExpenses();
          }
          return {
            created: res.created,
            skipped: res.skipped,
            errors: res.errors,
          };
        }}
      />
    </div>
  );
}

// ─── Expenses import spec ──────────────────────────────────────────────────────
const expenseImportFields: ImportField[] = [
  { key: 'expenseDate', label: 'Date', required: true, hint: 'YYYY-MM-DD or Excel date' },
  { key: 'expenseCategory', label: 'Category', required: true, hint: 'e.g. SALARY, RENT, MATERIALS' },
  { key: 'amount', label: 'Amount', required: true, hint: 'In rupees, no commas' },
  { key: 'description', label: 'Description' },
  { key: 'expenseType', label: 'Type' },
  { key: 'paymentMethod', label: 'Payment Method', hint: 'CASH, BANK, UPI, CHEQUE…' },
  { key: 'paymentReference', label: 'Payment Ref' },
  { key: 'invoiceNumber', label: 'Invoice No' },
];

const expenseSampleRows: Record<string, string | number>[] = [
  { expenseDate: '2026-04-01', expenseCategory: 'RENT', amount: 50000, description: 'Office rent April 2026', paymentMethod: 'BANK' },
  { expenseDate: '2026-04-03', expenseCategory: 'MATERIALS', amount: 128500, description: 'Cement + sand - Block A', paymentMethod: 'CHEQUE', invoiceNumber: 'INV-2341' },
  { expenseDate: '2026-04-05', expenseCategory: 'UTILITIES', amount: 8240, description: 'Electricity bill site office', paymentMethod: 'UPI' },
];

function validateExpenseRows(rows: Record<string, unknown>[]): RowValidationError[] {
  const errors: RowValidationError[] = [];
  rows.forEach((r, i) => {
    const row = i + 2;
    const date = (r.expenseDate ?? '').toString().trim();
    const category = (r.expenseCategory ?? '').toString().trim();
    const amtStr = (r.amount ?? '').toString().trim();
    const amt = Number(amtStr);
    if (!date) errors.push({ row, message: 'Date is required' });
    else if (Number.isNaN(new Date(date).getTime())) errors.push({ row, message: 'Invalid date', value: date });
    if (!category) errors.push({ row, message: 'Category is required' });
    if (!amtStr) errors.push({ row, message: 'Amount is required' });
    else if (Number.isNaN(amt) || amt <= 0) errors.push({ row, message: 'Amount must be a positive number', value: amtStr });
  });
  return errors;
}
