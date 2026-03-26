'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Building2, RefreshCw, Eye } from 'lucide-react';
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
  isActive: boolean;
  createdAt: string;
}

const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(n) || 0);

export default function BankAccountsPage() {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    accountName: '', bankName: '', accountNumber: '',
    ifscCode: '', branchName: '', openingBalance: '',
  });
  const [error, setError] = useState('');

  const fetchAccounts = async () => {
    try {
      const data = await api.get('/accounting/bank-accounts');
      setAccounts(data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAccounts(); }, []);

  const handleCreate = async () => {
    setError('');
    if (!form.accountName || !form.bankName || !form.accountNumber) {
      setError('Account name, bank name and account number are required.');
      return;
    }
    setSaving(true);
    try {
      await api.post('/accounting/bank-accounts', {
        ...form,
        openingBalance: Number(form.openingBalance) || 0,
      });
      setShowForm(false);
      setForm({ accountName: '', bankName: '', accountNumber: '', ifscCode: '', branchName: '', openingBalance: '' });
      await fetchAccounts();
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to create bank account');
    } finally { setSaving(false); }
  };

  if (loading) return <div className="p-6"><TableRowsSkeleton rows={5} cols={5} /></div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Bank Accounts</h1>
          <p className="text-sm text-gray-500 mt-1">Manage bank accounts and run reconciliation</p>
        </div>
        <Button onClick={() => setShowForm(true)} style={{ backgroundColor: '#A8211B', color: 'white' }}>
          <Plus className="h-4 w-4 mr-2" /> Add Bank Account
        </Button>
      </div>

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
      </div>

      {/* Add Bank Account Form */}
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
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="text-left p-3">Account</th>
                    <th className="text-left p-3">Bank</th>
                    <th className="text-left p-3">Account No.</th>
                    <th className="text-left p-3">IFSC</th>
                    <th className="text-center p-3">Status</th>
                    <th className="text-right p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.map(a => (
                    <tr key={a.id} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-medium flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-gray-400" />
                        {a.accountName}
                      </td>
                      <td className="p-3">{a.bankName}</td>
                      <td className="p-3 font-mono text-xs">{a.accountNumber}</td>
                      <td className="p-3 font-mono text-xs text-gray-500">{a.ifscCode || '—'}</td>
                      <td className="p-3 text-center">
                        <Badge className={a.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}>
                          {a.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="p-3 text-right">
                        <Link href={`/accounting/bank-accounts/${a.id}/reconcile`}>
                          <Button size="sm" variant="outline" className="gap-1">
                            <RefreshCw className="h-3 w-3" /> Reconcile
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
