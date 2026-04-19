'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, BookOpen, Loader2, Sparkles, FolderInput, RotateCcw, EyeOff, FileSpreadsheet } from 'lucide-react';
import { accountsService, type Account } from '@/services/accounting.service';
import { TableRowsSkeleton } from '@/components/Skeletons';
import { usePropertyStore } from '@/store/propertyStore';
import { propertiesService } from '@/services/properties.service';
import { useAuthStore } from '@/store/authStore';
import { ExcelImportModal, type RowValidationError, type ImportField } from '@/components/accounting/ExcelImportModal';

export default function AccountsPage() {
  const { selectedProperties } = usePropertyStore();
  const selectedPropertyId = selectedProperties[0] ?? undefined;
  const { user } = useAuthStore();
  const canReassign = user?.roles?.some((r: any) =>
    ['super_admin', 'admin'].includes(typeof r === 'string' ? r : r.name)
  );

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [allProperties, setAllProperties] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [seeding, setSeeding] = useState(false);
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [showInactive, setShowInactive] = useState(false);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [importOpen, setImportOpen] = useState(false);

  // Load all properties for the "Assign project" dropdown
  useEffect(() => {
    propertiesService.getProperties({ limit: 100 })
      .then((res: any) => {
        const list = res?.data ?? res ?? [];
        setAllProperties(Array.isArray(list) ? list : []);
      })
      .catch(() => {});
  }, []);

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (filter) params.accountType = filter;
      if (selectedPropertyId) params.propertyId = selectedPropertyId;
      if (showInactive) params.isActive = 'false';
      const data = await accountsService.getAll(params);
      setAccounts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching accounts:', error);
    } finally {
      setLoading(false);
    }
  }, [filter, selectedPropertyId, showInactive]);

  useEffect(() => { fetchAccounts(); }, [fetchAccounts]);

  const handleSeedCoa = async () => {
    if (!selectedPropertyId) {
      toast.error('Select a project first to initialise its Chart of Accounts');
      return;
    }
    if (!confirm('This will create 18 standard accounts for the selected project. Existing accounts will be skipped. Continue?')) return;
    setSeeding(true);
    try {
      const res: any = await accountsService.seedCoaForProject(selectedPropertyId);
      const { created, skipped } = res?.data ?? res ?? {};
      toast.success(`CoA initialised - ${created} accounts created, ${skipped} already existed`);
      fetchAccounts();
    } catch {
      toast.error('Failed to initialise Chart of Accounts');
    } finally {
      setSeeding(false);
    }
  };

  const handleAssignProject = async (accountId: string, propertyId: string | '') => {
    setAssigningId(accountId);
    try {
      await accountsService.update(accountId, { propertyId: propertyId || null } as any);
      toast.success(propertyId ? 'Account assigned to project' : 'Account unlinked from project');
      fetchAccounts();
    } catch {
      toast.error('Failed to update account');
    } finally {
      setAssigningId(null);
    }
  };

  const handleRestore = async (accountId: string, accountName: string) => {
    if (!confirm(`Restore account "${accountName}"? It will become active again.`)) return;
    setRestoringId(accountId);
    try {
      await accountsService.update(accountId, { isActive: true } as any);
      toast.success('Account restored successfully');
      fetchAccounts();
    } catch {
      toast.error('Failed to restore account');
    } finally {
      setRestoringId(null);
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
    return <div className="p-6"><TableRowsSkeleton rows={6} cols={4} /></div>;
  }

  const totalsByType = (accounts || []).reduce((acc, account) => {
    acc[account.accountType] = (acc[account.accountType] || 0) + (Number(account.currentBalance) || 0);
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-3">
        <h1 className="text-2xl sm:text-3xl font-bold">Chart of Accounts</h1>
        <div className="flex gap-2 shrink-0 flex-wrap">
          {canReassign && (
            <Button
              variant={showInactive ? 'default' : 'outline'}
              onClick={() => setShowInactive(v => !v)}
              title="Toggle deleted/inactive accounts"
            >
              {showInactive ? <EyeOff className="h-4 w-4 mr-2" /> : <RotateCcw className="h-4 w-4 mr-2" />}
              {showInactive ? 'Hide Deleted' : 'Show Deleted'}
            </Button>
          )}
          {selectedPropertyId && !showInactive && (
            <Button variant="outline" onClick={handleSeedCoa} disabled={seeding}>
              {seeding ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
              Init CoA
            </Button>
          )}
          {!showInactive && (
            <Button variant="outline" onClick={() => setImportOpen(true)} title="Import chart of accounts from Excel">
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Import Excel
            </Button>
          )}
          {!showInactive && (
            <Button onClick={() => (window.location.href = '/accounting/accounts/new')}>
              <Plus className="h-4 w-4 mr-2" />
              New Account
            </Button>
          )}
        </div>
      </div>

      {selectedPropertyId && (
        <p className="text-sm text-gray-600 max-w-3xl">
          Balances use <strong>posted journals</strong> (same basis as the accounting dashboard): company-wide accounts
          count only lines on journals tagged to this project; accounts <strong>assigned to this project</strong> include
          all posted activity on that ledger row (including older org-wide journals).
        </p>
      )}

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
          <CardTitle>{showInactive ? 'Deleted Accounts' : 'All Accounts'}</CardTitle>
          <CardDescription>
            {(accounts || []).length} {showInactive ? 'deleted' : 'active'} accounts found
            {!selectedPropertyId && ' - showing all projects (use the top bar to filter by project)'}
            {showInactive && ' - click Restore to reactivate an account'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b text-xs text-gray-500 uppercase">
                  <th className="text-left p-2">Code</th>
                  <th className="text-left p-2">Account Name</th>
                  <th className="text-left p-2">Type</th>
                  <th className="text-left p-2">Category</th>
                  <th className="text-right p-2">Balance</th>
                  <th className="text-left p-2 flex items-center gap-1">
                    <FolderInput className="h-3 w-3" /> Project
                  </th>
                  <th className="text-center p-2">{showInactive ? 'Restore' : 'Ledger'}</th>
                </tr>
              </thead>
              <tbody>
                {(accounts || []).map((account) => (
                  <tr
                    key={account.id}
                    className={`border-b hover:bg-gray-50 ${showInactive ? 'opacity-60' : ''}`}
                  >
                    <td className={`p-2 font-mono text-sm ${showInactive ? 'line-through text-gray-400' : 'cursor-pointer'}`} onClick={showInactive ? undefined : () => (window.location.href = `/accounting/accounts/${account.id}`)}>
                      {account.accountCode}
                    </td>
                    <td className={`p-2 font-medium ${showInactive ? 'line-through text-gray-400' : 'text-blue-600 hover:underline cursor-pointer'}`} onClick={showInactive ? undefined : () => (window.location.href = `/accounting/accounts/${account.id}`)}>
                      {account.accountName}
                    </td>
                    <td className="p-2">{getTypeBadge(account.accountType)}</td>
                    <td className="p-2 text-sm text-gray-600">{account.accountCategory}</td>
                    <td className="p-2 text-right font-medium text-sm">
                      {formatCurrency(Number(account.currentBalance) || 0)}
                    </td>
                    {/* Project column - editable only for admin/super_admin */}
                    <td className="p-2" onClick={e => e.stopPropagation()}>
                      {canReassign ? (
                        <select
                          value={account.propertyId ?? ''}
                          disabled={assigningId === account.id}
                          onChange={e => handleAssignProject(account.id, e.target.value)}
                          className="text-xs border rounded px-2 py-1 bg-white disabled:opacity-50 max-w-[140px]"
                          title="Assign or move this account to a project"
                        >
                          <option value="">Company-wide</option>
                          {allProperties.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-xs text-gray-500">
                          {account.property?.name ?? (account.propertyId ? '…' : 'Company-wide')}
                        </span>
                      )}
                    </td>
                    <td className="p-2 text-center" onClick={(e) => e.stopPropagation()}>
                      {showInactive ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs text-green-700 border-green-300 hover:bg-green-50"
                          disabled={restoringId === account.id}
                          onClick={() => handleRestore(account.id, account.accountName)}
                        >
                          {restoringId === account.id
                            ? <Loader2 className="h-3 w-3 animate-spin" />
                            : <><RotateCcw className="h-3 w-3 mr-1" /> Restore</>}
                        </Button>
                      ) : (
                        <Link href={`/accounting/accounts/${account.id}/ledger`}>
                          <Button size="sm" variant="ghost" className="text-xs" title="View ledger">
                            <BookOpen className="h-3 w-3 mr-1" /> Ledger
                          </Button>
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
                {accounts.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-400 text-sm">
                      {showInactive
                        ? 'No deleted accounts found.'
                        : selectedPropertyId
                          ? 'No accounts for this project yet. Click "Init CoA" to create the standard set.'
                          : 'No accounts found.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <ExcelImportModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        title="Import Chart of Accounts"
        description={
          <span>
            Upload your existing CoA (from Tally or Excel). Each row becomes one account.
            Existing codes are <strong>skipped</strong>, never overwritten.
          </span>
        }
        scopeLabel={
          selectedPropertyId
            ? `Importing to project: ${allProperties.find((p) => p.id === selectedPropertyId)?.name || selectedPropertyId}`
            : 'Importing to company-wide scope (no project selected)'
        }
        fields={coaImportFields}
        sampleRows={coaSampleRows}
        validate={(rows) => validateCoaRows(rows)}
        onImport={async (rows) => {
          const res = await accountsService.bulkImport({
            propertyId: selectedPropertyId || null,
            rows: rows as any,
          });
          if (res.created > 0) {
            toast.success(`Imported ${res.created} account${res.created !== 1 ? 's' : ''}`);
            fetchAccounts();
          }
          return {
            created: res.created,
            skipped: res.skipped,
            errors: res.errors?.map((e) => ({ row: e.row, message: e.message })),
          };
        }}
      />
    </div>
  );
}

// ─── CoA import spec ───────────────────────────────────────────────────────────
const coaImportFields: ImportField[] = [
  { key: 'accountCode', label: 'Account Code', required: true, hint: 'Unique within the scope, e.g. 1100' },
  { key: 'accountName', label: 'Account Name', required: true },
  { key: 'accountType', label: 'Account Type', required: true, hint: 'ASSET, LIABILITY, EQUITY, INCOME, EXPENSE' },
  { key: 'accountCategory', label: 'Category', required: true, hint: 'Free text, e.g. Current Asset, Direct Expense' },
  { key: 'openingBalance', label: 'Opening Balance', hint: 'Optional, in ₹' },
  { key: 'description', label: 'Description', hint: 'Optional notes' },
];

const coaSampleRows: Record<string, string | number>[] = [
  { accountCode: '1100', accountName: 'Cash in Hand', accountType: 'ASSET', accountCategory: 'Current Asset', openingBalance: 50000 },
  { accountCode: '2100', accountName: 'HDFC Bank - Operational', accountType: 'ASSET', accountCategory: 'Bank', openingBalance: 1500000 },
  { accountCode: '4100', accountName: 'Booking Revenue', accountType: 'INCOME', accountCategory: 'Sales', openingBalance: 0 },
  { accountCode: '5100', accountName: 'Site Expenses', accountType: 'EXPENSE', accountCategory: 'Direct Expense', openingBalance: 0 },
];

function validateCoaRows(rows: Record<string, unknown>[]): RowValidationError[] {
  const ALLOWED = new Set(['ASSET', 'LIABILITY', 'EQUITY', 'INCOME', 'EXPENSE']);
  const errors: RowValidationError[] = [];
  const seen = new Set<string>();
  rows.forEach((r, i) => {
    const row = i + 2;
    const code = (r.accountCode ?? '').toString().trim();
    const name = (r.accountName ?? '').toString().trim();
    const type = (r.accountType ?? '').toString().trim().toUpperCase();
    const category = (r.accountCategory ?? '').toString().trim();
    if (!code) errors.push({ row, message: 'Account Code is required' });
    if (!name) errors.push({ row, message: 'Account Name is required' });
    if (!type || !ALLOWED.has(type)) errors.push({ row, message: 'Type must be one of ASSET, LIABILITY, EQUITY, INCOME, EXPENSE', value: type });
    if (!category) errors.push({ row, message: 'Category is required' });
    if (code && seen.has(code)) errors.push({ row, message: 'Duplicate Account Code in this file', value: code });
    if (code) seen.add(code);
  });
  return errors;
}
