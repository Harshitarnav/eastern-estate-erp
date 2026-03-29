'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Building2, RefreshCw, Edit, Trash2, ToggleLeft, ToggleRight, X, Check } from 'lucide-react';
import api from '@/services/api';
import { TableRowsSkeleton } from '@/components/Skeletons';

interface BankAccount {
  id: string;
  accountName: string;
  bankName: string;
  accountNumber: string;
  ifscCode?: string;
  branchName?: string;
  currentBalance?: number;
  openingBalance?: number;
  accountType?: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  coaAccount?: { id: string; accountCode: string } | null;
}

const emptyForm = {
  accountName: '', bankName: '', accountNumber: '',
  ifscCode: '', branchName: '', openingBalance: '', description: '',
};

const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(n) || 0);

export default function BankAccountsPage() {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<BankAccount>>({});
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchAccounts = async () => {
    try {
      const data = await api.get('/accounting/bank-accounts');
      setAccounts(data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAccounts(); }, []);

  // ── Create ──────────────────────────────────────────────
  const handleCreate = async () => {
    setError('');
    setSuccessMsg('');
    if (!form.accountName || !form.bankName || !form.accountNumber) {
      setError('Account name, bank name and account number are required.');
      return;
    }
    setSaving(true);
    try {
      const created: BankAccount = await api.post('/accounting/bank-accounts', {
        ...form,
        openingBalance: Number(form.openingBalance) || 0,
      });
      setShowForm(false);
      setForm({ ...emptyForm });
      await fetchAccounts();
      if (created?.coaAccount?.accountCode) {
        setSuccessMsg(`Bank account saved. COA entry auto-linked: Account ${created.coaAccount.accountCode} in Chart of Accounts.`);
      } else {
        setSuccessMsg('Bank account saved successfully.');
      }
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to create bank account');
    } finally { setSaving(false); }
  };

  // ── Edit ─────────────────────────────────────────────────
  const startEdit = (a: BankAccount) => {
    setEditingId(a.id);
    setEditForm({
      accountName: a.accountName,
      bankName: a.bankName,
      accountNumber: a.accountNumber,
      ifscCode: a.ifscCode || '',
      branchName: a.branchName || '',
      description: a.description || '',
    });
  };

  const saveEdit = async (id: string) => {
    setSaving(true);
    try {
      await api.patch(`/accounting/bank-accounts/${id}`, editForm);
      setEditingId(null);
      await fetchAccounts();
    } catch (e: any) {
      alert(e?.response?.data?.message || 'Failed to update bank account');
    } finally { setSaving(false); }
  };

  // ── Toggle Status ─────────────────────────────────────────
  const toggleStatus = async (a: BankAccount) => {
    const action = a.isActive ? 'deactivate' : 'activate';
    const confirm_msg = a.isActive
      ? `Deactivate "${a.accountName}"? It will no longer appear in transactions.`
      : `Re-activate "${a.accountName}"?`;
    if (!confirm(confirm_msg)) return;
    try {
      await api.patch(`/accounting/bank-accounts/${a.id}/${action}`, {});
      await fetchAccounts();
    } catch (e: any) {
      alert(e?.response?.data?.message || 'Failed to update status');
    }
  };

  // ── Delete ────────────────────────────────────────────────
  const handleDelete = async (a: BankAccount) => {
    if (!confirm(`Permanently delete "${a.accountName}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/accounting/bank-accounts/${a.id}`);
      await fetchAccounts();
    } catch (e: any) {
      alert(e?.response?.data?.message || 'Failed to delete bank account');
    }
  };

  if (loading) return <div className="p-6"><TableRowsSkeleton rows={5} cols={5} /></div>;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Bank Accounts</h1>
          <p className="text-sm text-gray-500 mt-1">Manage bank accounts and run reconciliation</p>
        </div>
        <Button onClick={() => { setShowForm(true); setError(''); }} style={{ backgroundColor: '#A8211B', color: 'white' }}>
          <Plus className="h-4 w-4 mr-2" /> Add Bank Account
        </Button>
      </div>

      {/* Success Banner */}
      {successMsg && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-800 rounded-lg px-4 py-3 text-sm">
          <Check className="h-4 w-4 flex-shrink-0 text-green-600" />
          <span className="flex-1">{successMsg}</span>
          <button onClick={() => setSuccessMsg('')} className="text-green-600 hover:text-green-800"><X className="h-4 w-4" /></button>
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-gray-500">Total Accounts</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{accounts.length}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-green-600">Active</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-green-700">{accounts.filter(a => a.isActive).length}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-gray-500">Total Balance</CardTitle></CardHeader>
          <CardContent><p className="text-xl font-bold">{fmt(accounts.reduce((s, a) => s + (Number(a.currentBalance) || 0), 0))}</p></CardContent>
        </Card>
      </div>

      {/* Add Form */}
      {showForm && (
        <Card className="border-2 border-dashed border-[#A8211B]/30">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="h-5 w-5" style={{ color: '#A8211B' }} />
              New Bank Account
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Nickname *</label>
                <Input placeholder="e.g. HDFC Current – Main" value={form.accountName}
                  onChange={e => setForm(f => ({ ...f, accountName: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name *</label>
                <Input placeholder="e.g. HDFC Bank" value={form.bankName}
                  onChange={e => setForm(f => ({ ...f, bankName: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Number *</label>
                <Input placeholder="e.g. 50100123456789" value={form.accountNumber}
                  onChange={e => setForm(f => ({ ...f, accountNumber: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">IFSC Code</label>
                <Input placeholder="e.g. HDFC0001234" value={form.ifscCode}
                  onChange={e => setForm(f => ({ ...f, ifscCode: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
                <Input placeholder="e.g. Andheri West" value={form.branchName}
                  onChange={e => setForm(f => ({ ...f, branchName: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Opening Balance (₹)</label>
                <Input type="number" placeholder="0" value={form.openingBalance}
                  onChange={e => setForm(f => ({ ...f, openingBalance: e.target.value }))} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
                <Input placeholder="Notes about this account" value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
            </div>
            {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">{error}</p>}
            <div className="flex gap-2">
              <Button onClick={handleCreate} disabled={saving} style={{ backgroundColor: '#A8211B', color: 'white' }}>
                {saving ? 'Saving…' : 'Save Bank Account'}
              </Button>
              <Button variant="outline" onClick={() => { setShowForm(false); setError(''); }}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Accounts List */}
      <Card>
        <CardHeader>
          <CardTitle>All Bank Accounts</CardTitle>
          <CardDescription>{accounts.length} accounts registered</CardDescription>
        </CardHeader>
        <CardContent>
          {accounts.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Building2 className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="text-lg font-medium">No bank accounts yet</p>
              <p className="text-sm">Add your first bank account to start reconciliation</p>
            </div>
          ) : (
            <div className="space-y-3">
              {accounts.map(a => (
                <div
                  key={a.id}
                  className={`border rounded-xl p-4 transition-all ${a.isActive ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-200 opacity-70'}`}
                >
                  {editingId === a.id ? (
                    /* ── Inline Edit Form ── */
                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-gray-500 mb-2">Editing: {a.accountName}</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="text-xs font-medium text-gray-500 mb-1 block">Account Nickname *</label>
                          <Input value={editForm.accountName || ''} onChange={e => setEditForm(f => ({ ...f, accountName: e.target.value }))} />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-500 mb-1 block">Bank Name *</label>
                          <Input value={editForm.bankName || ''} onChange={e => setEditForm(f => ({ ...f, bankName: e.target.value }))} />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-500 mb-1 block">Account Number *</label>
                          <Input value={editForm.accountNumber || ''} onChange={e => setEditForm(f => ({ ...f, accountNumber: e.target.value }))} />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-500 mb-1 block">IFSC Code</label>
                          <Input value={editForm.ifscCode || ''} onChange={e => setEditForm(f => ({ ...f, ifscCode: e.target.value }))} />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-500 mb-1 block">Branch</label>
                          <Input value={editForm.branchName || ''} onChange={e => setEditForm(f => ({ ...f, branchName: e.target.value }))} />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-500 mb-1 block">Description</label>
                          <Input value={editForm.description || ''} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} />
                        </div>
                      </div>
                      <div className="flex gap-2 pt-1">
                        <Button size="sm" onClick={() => saveEdit(a.id)} disabled={saving} style={{ backgroundColor: '#A8211B', color: 'white' }}>
                          <Check className="h-3 w-3 mr-1" /> {saving ? 'Saving…' : 'Save Changes'}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                          <X className="h-3 w-3 mr-1" /> Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    /* ── Read View ── */
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                          <Building2 className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-gray-900">{a.accountName}</p>
                            <Badge className={a.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}>
                              {a.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                            {a.coaAccount ? (
                              <Link href={`/accounting/accounts/${a.coaAccount.id}`}>
                                <Badge className="bg-blue-50 text-blue-700 border border-blue-200 cursor-pointer hover:bg-blue-100 font-mono text-xs">
                                  COA: {a.coaAccount.accountCode}
                                </Badge>
                              </Link>
                            ) : (
                              <Badge className="bg-yellow-50 text-yellow-700 border border-yellow-200 text-xs">
                                No COA entry
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">{a.bankName} • <span className="font-mono">{a.accountNumber}</span>{a.ifscCode ? ` • ${a.ifscCode}` : ''}{a.branchName ? ` • ${a.branchName}` : ''}</p>
                          {a.description && <p className="text-xs text-gray-400 mt-0.5">{a.description}</p>}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="text-right mr-2 hidden md:block">
                          <p className="text-xs text-gray-400">Current Balance</p>
                          <p className="font-bold text-gray-800">{fmt(a.currentBalance || 0)}</p>
                        </div>

                        {/* Reconcile */}
                        <Link href={`/accounting/bank-accounts/${a.id}/reconcile`}>
                          <Button size="sm" variant="outline" className="gap-1 text-xs">
                            <RefreshCw className="h-3 w-3" /> Reconcile
                          </Button>
                        </Link>

                        {/* Edit */}
                        <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={() => startEdit(a)}>
                          <Edit className="h-3 w-3" /> Edit
                        </Button>

                        {/* Toggle Active/Inactive */}
                        <Button
                          size="sm"
                          variant="outline"
                          className={`gap-1 text-xs ${a.isActive ? 'text-orange-600 border-orange-200 hover:bg-orange-50' : 'text-green-600 border-green-200 hover:bg-green-50'}`}
                          onClick={() => toggleStatus(a)}
                        >
                          {a.isActive
                            ? <><ToggleLeft className="h-3 w-3" /> Deactivate</>
                            : <><ToggleRight className="h-3 w-3" /> Activate</>
                          }
                        </Button>

                        {/* Delete */}
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1 text-xs text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => handleDelete(a)}
                        >
                          <Trash2 className="h-3 w-3" /> Delete
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
