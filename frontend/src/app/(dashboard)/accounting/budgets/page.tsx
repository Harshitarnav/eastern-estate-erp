'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, TrendingUp, TrendingDown, Pencil, Trash2 } from 'lucide-react';
import { budgetsService, type Budget } from '@/services/accounting.service';
import { format } from 'date-fns';
import { TableRowsSkeleton } from '@/components/Skeletons';

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    try {
      const data = await budgetsService.getAll();
      setBudgets(data);
    } catch (error) {
      console.error('Error fetching budgets:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: any) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(Number(amount) || 0);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete budget "${name}"? This cannot be undone.`)) return;
    try {
      await budgetsService.delete(id);
      setBudgets((prev) => prev.filter((b) => b.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete budget');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      DRAFT: 'bg-gray-100 text-gray-800',
      ACTIVE: 'bg-green-100 text-green-800',
      CLOSED: 'bg-red-100 text-red-800',
      REVISED: 'bg-blue-100 text-blue-800',
    };
    return <Badge className={variants[status] || ''}>{status}</Badge>;
  };

  // variance = budgeted - actual: positive means under budget (good = green), negative = over budget (red)
  const getVarianceColor = (variance: number) => {
    if (variance >= 0) return 'text-green-600';
    if (variance < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getProgressPercentage = (actual: number, budgeted: number) => {
    if (budgeted === 0) return 0;
    return Math.min((actual / budgeted) * 100, 100);
  };

  if (loading) {
    return <div className="p-6"><TableRowsSkeleton rows={6} cols={5} /></div>;
  }

  const totalBudgeted = ((budgets || [])).reduce((sum, b) => sum + (Number(b.budgetedAmount) || 0), 0);
  const totalActual = ((budgets || [])).reduce((sum, b) => sum + (Number(b.actualAmount) || 0), 0);
  const totalVariance = totalBudgeted - totalActual;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Budgets</h1>
        <Button onClick={() => (window.location.href = '/accounting/budgets/new')}>
          <Plus className="h-4 w-4 mr-2" />
          New Budget
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budgeted</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalBudgeted)}</div>
            <p className="text-xs text-muted-foreground">{(budgets || []).length} budgets</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Actual</CardTitle>
            <TrendingDown className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalActual)}</div>
            <p className="text-xs text-muted-foreground">Actual spending</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Variance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getVarianceColor(totalVariance)}`}>
              {formatCurrency(Math.abs(totalVariance))}
            </div>
            <p className="text-xs text-muted-foreground">
              {totalVariance >= 0 ? 'Under budget ✓' : 'Over budget ⚠'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Budgets Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Budgets</CardTitle>
          <CardDescription>{(budgets || []).length} budgets found</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {((budgets || [])).map((budget) => {
              const budgeted = Number(budget.budgetedAmount) || 0;
              const actual = Number(budget.actualAmount) || 0;
              // variance: positive = under budget (good), negative = over budget (bad)
              const varianceAmt = budgeted - actual;
              const variancePct = budgeted > 0 ? (varianceAmt / budgeted) * 100 : 0;
              const progressPercentage = getProgressPercentage(actual, budgeted);
              const isOverBudget = actual > budgeted;
              
              return (
                <div key={budget.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">{budget.budgetName}</h3>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(budget.startDate), 'MMM dd, yyyy')} - {format(new Date(budget.endDate), 'MMM dd, yyyy')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(budget.status)}
                      <Badge>FY {budget.fiscalYear}</Badge>
                      {budget.status === 'DRAFT' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => (window.location.href = `/accounting/budgets/${budget.id}/edit`)}
                          title="Edit"
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => handleDelete(budget.id, budget.budgetName)}
                        title="Delete"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Budgeted</p>
                      <p className="font-semibold">{formatCurrency(budget.budgetedAmount)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Actual</p>
                      <p className="font-semibold">{formatCurrency(budget.actualAmount)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Variance</p>
                      <p className={`font-semibold ${getVarianceColor(varianceAmt)}`}>
                        {varianceAmt >= 0 ? '−' : '+'}{formatCurrency(Math.abs(varianceAmt))} ({Math.abs(variancePct).toFixed(1)}%)
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Utilization: {progressPercentage.toFixed(1)}%</span>
                      <span>{isOverBudget ? 'Over Budget!' : 'On Track'}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          isOverBudget ? 'bg-red-600' : 'bg-green-600'
                        }`}
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                  </div>

                  {budget.notes && (
                    <p className="text-sm text-muted-foreground italic">{budget.notes}</p>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
