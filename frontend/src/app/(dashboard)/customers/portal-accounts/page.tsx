'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { apiService } from '@/services/api';
import { toast } from 'sonner';
import {
  Users, CheckCircle2, XCircle, Clock, Search, RefreshCw,
  MoreVertical, KeyRound, Trash2, Ban, ShieldCheck, ExternalLink,
  UserPlus, ArrowLeft,
} from 'lucide-react';

interface PortalAccount {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  customerId: string;
  customer?: {
    id: string;
    fullName: string;
    customerCode: string;
    email: string;
    phoneNumber: string;
  };
}

function timeSince(dateStr: string | null): string {
  if (!dateStr) return 'Never';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function fmtDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function PortalAccountsPage() {
  const [accounts, setAccounts] = useState<PortalAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [actionMenu, setActionMenu] = useState<string | null>(null);

  // Reset password modal state
  const [resetUserId, setResetUserId] = useState<string | null>(null);
  const [resetPassword, setResetPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  // Revoke confirm modal
  const [revokeAccount, setRevokeAccount] = useState<PortalAccount | null>(null);
  const [revokeLoading, setRevokeLoading] = useState(false);

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    // Hard watchdog: if the network / backend hangs, the page would show
    // skeletons forever. Flip to an error state after 25s so the user can
    // retry instead of staring at a spinner.
    let settled = false;
    const watchdog = setTimeout(() => {
      if (!settled) {
        setLoading(false);
        setLoadError('Request is taking too long. Check your connection and try again.');
        toast.error('Portal accounts request timed out');
      }
    }, 25_000);

    try {
      const data: any = await apiService.get('/customer-portal/accounts', {
        timeout: 20_000,
      });
      setAccounts(Array.isArray(data) ? data : []);
    } catch (e: any) {
      const msg =
        e?.userMessage ||
        e?.response?.data?.message ||
        (e?.code === 'ECONNABORTED' ? 'Request timed out' : 'Failed to load portal accounts');
      setLoadError(msg);
      toast.error(msg);
    } finally {
      settled = true;
      clearTimeout(watchdog);
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAccounts(); }, [fetchAccounts]);

  // Close action menu on outside click
  useEffect(() => {
    const close = () => setActionMenu(null);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  const handleToggleStatus = async (account: PortalAccount) => {
    setActionMenu(null);
    try {
      await apiService.patch(`/customer-portal/accounts/${account.id}/status`, {
        isActive: !account.isActive,
      });
      toast.success(`Account ${!account.isActive ? 'activated' : 'deactivated'}`);
      fetchAccounts();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to update status');
    }
  };

  const handleResetPassword = async () => {
    if (!resetPassword || resetPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setResetLoading(true);
    try {
      await apiService.patch(`/customer-portal/accounts/${resetUserId}/reset-password`, {
        newPassword: resetPassword,
      });
      toast.success('Password reset successfully');
      setResetUserId(null);
      setResetPassword('');
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to reset password');
    } finally {
      setResetLoading(false);
    }
  };

  const handleRevoke = async () => {
    if (!revokeAccount) return;
    setRevokeLoading(true);
    try {
      await apiService.delete(`/customer-portal/accounts/${revokeAccount.id}`);
      toast.success('Portal access revoked');
      setRevokeAccount(null);
      fetchAccounts();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to revoke access');
    } finally {
      setRevokeLoading(false);
    }
  };

  const filtered = accounts.filter((a) => {
    const q = search.toLowerCase();
    return (
      !q ||
      a.email.toLowerCase().includes(q) ||
      `${a.firstName} ${a.lastName}`.toLowerCase().includes(q) ||
      a.customer?.fullName?.toLowerCase().includes(q) ||
      a.customer?.customerCode?.toLowerCase().includes(q)
    );
  });

  const activeCount = accounts.filter(a => a.isActive).length;
  const neverLoggedIn = accounts.filter(a => !a.lastLoginAt).length;

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/customers" className="text-gray-400 hover:text-gray-600 transition">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-xl font-black text-gray-900">Customer Portal Accounts</h1>
          </div>
          <p className="text-sm text-gray-500">
            Manage login access for customers to view their units, payments & updates
          </p>
        </div>
        <button onClick={fetchAccounts}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition shrink-0">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Accounts', value: accounts.length, icon: Users, color: 'text-[#A8211B] bg-[#A8211B]/10' },
          { label: 'Active', value: activeCount, icon: CheckCircle2, color: 'text-green-600 bg-green-50' },
          { label: 'Inactive', value: accounts.length - activeCount, icon: XCircle, color: 'text-gray-500 bg-gray-100' },
          { label: 'Never Logged In', value: neverLoggedIn, icon: Clock, color: 'text-orange-600 bg-orange-50' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">{label}</p>
              <p className="text-2xl font-black text-gray-900 leading-none mt-0.5">{loading ? '–' : value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name, email or customer code…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#A8211B] transition"
        />
      </div>

      {/* Table / cards */}
      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="h-20 bg-gray-100 rounded-2xl" />
          ))}
        </div>
      ) : loadError ? (
        <div className="bg-white rounded-2xl border border-red-100 p-10 text-center">
          <XCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <p className="text-gray-800 font-semibold">Couldn&apos;t load portal accounts</p>
          <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">{loadError}</p>
          <button
            onClick={fetchAccounts}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#A8211B] text-white text-sm font-semibold hover:bg-[#7B1E12] transition"
          >
            <RefreshCw className="w-4 h-4" /> Try again
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <Users className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">
            {search ? 'No accounts match your search' : 'No portal accounts yet'}
          </p>
          {!search && (
            <p className="text-xs text-gray-400 mt-1">
              Invite customers from their{' '}
              <Link href="/customers" className="text-[#A8211B] hover:underline">customer detail page</Link>
            </p>
          )}
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-50 text-left">
                  <th className="px-5 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Customer</th>
                  <th className="px-5 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Login Email</th>
                  <th className="px-5 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Last Sign-in</th>
                  <th className="px-5 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Account Created</th>
                  <th className="px-5 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider w-10" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((account) => (
                  <tr key={account.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#A8211B]/10 flex items-center justify-center text-[#A8211B] text-xs font-black shrink-0">
                          {account.firstName?.[0]}{account.lastName?.[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {account.customer?.fullName || `${account.firstName} ${account.lastName}`}
                          </p>
                          {account.customer?.customerCode && (
                            <p className="text-xs text-gray-400">{account.customer.customerCode}</p>
                          )}
                        </div>
                        {account.customer?.id && (
                          <Link href={`/customers/${account.customer.id}`}
                            className="text-gray-300 hover:text-[#A8211B] transition ml-1" title="View customer">
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-gray-700">{account.email}</td>
                    <td className="px-5 py-3.5">
                      {account.isActive ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold bg-green-50 text-green-700 px-2.5 py-1 rounded-full">
                          <CheckCircle2 className="w-3 h-3" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-bold bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full">
                          <Ban className="w-3 h-3" /> Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      {account.lastLoginAt ? (
                        <div>
                          <p className="text-gray-700 font-medium">{timeSince(account.lastLoginAt)}</p>
                          <p className="text-xs text-gray-400">{fmtDate(account.lastLoginAt)}</p>
                        </div>
                      ) : (
                        <span className="text-xs text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full font-semibold">
                          Never signed in
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 text-xs">{fmtDate(account.createdAt)}</td>
                    <td className="px-5 py-3.5">
                      <div className="relative">
                        <button
                          onClick={(e) => { e.stopPropagation(); setActionMenu(actionMenu === account.id ? null : account.id); }}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        {actionMenu === account.id && (
                          <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-100 rounded-xl shadow-xl z-20 py-1 text-sm"
                            onClick={(e) => e.stopPropagation()}>
                            <button onClick={() => { setActionMenu(null); setResetUserId(account.id); setResetPassword(''); }}
                              className="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-gray-50 text-left text-gray-700">
                              <KeyRound className="w-4 h-4 text-blue-500" /> Reset Password
                            </button>
                            <button onClick={() => handleToggleStatus(account)}
                              className={`w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-gray-50 text-left ${
                                account.isActive ? 'text-orange-600' : 'text-green-600'
                              }`}>
                              {account.isActive
                                ? <><Ban className="w-4 h-4" /> Deactivate</>
                                : <><ShieldCheck className="w-4 h-4" /> Activate</>}
                            </button>
                            <div className="border-t border-gray-50 my-1" />
                            <button onClick={() => { setActionMenu(null); setRevokeAccount(account); }}
                              className="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-red-50 text-left text-red-600">
                              <Trash2 className="w-4 h-4" /> Revoke Access
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-5 py-3 border-t border-gray-50 text-xs text-gray-400">
              {filtered.length} account{filtered.length !== 1 ? 's' : ''}
              {search && ` matching "${search}"`}
            </div>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {filtered.map((account) => (
              <div key={account.id} className="bg-white rounded-2xl border border-gray-100 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-[#A8211B]/10 flex items-center justify-center text-[#A8211B] text-sm font-black shrink-0">
                      {account.firstName?.[0]}{account.lastName?.[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-gray-900 truncate">
                        {account.customer?.fullName || `${account.firstName} ${account.lastName}`}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{account.email}</p>
                    </div>
                  </div>
                  {account.isActive ? (
                    <span className="shrink-0 text-xs font-bold bg-green-50 text-green-700 px-2 py-0.5 rounded-full">Active</span>
                  ) : (
                    <span className="shrink-0 text-xs font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Inactive</span>
                  )}
                </div>

                <div className="mt-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-gray-400">Last sign-in: </span>
                    <span className={`font-semibold ${!account.lastLoginAt ? 'text-orange-600' : 'text-gray-700'}`}>
                      {timeSince(account.lastLoginAt)}
                    </span>
                  </div>
                  <span className="text-gray-400">Added {fmtDate(account.createdAt)}</span>
                </div>

                <div className="mt-3 flex gap-2">
                  <button onClick={() => { setResetUserId(account.id); setResetPassword(''); }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold hover:bg-blue-100 transition">
                    <KeyRound className="w-3.5 h-3.5" /> Reset Password
                  </button>
                  <button onClick={() => handleToggleStatus(account)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition ${
                      account.isActive
                        ? 'bg-orange-50 text-orange-700 hover:bg-orange-100'
                        : 'bg-green-50 text-green-700 hover:bg-green-100'
                    }`}>
                    {account.isActive ? <><Ban className="w-3.5 h-3.5" /> Deactivate</> : <><ShieldCheck className="w-3.5 h-3.5" /> Activate</>}
                  </button>
                  {account.customer?.id && (
                    <Link href={`/customers/${account.customer.id}`}
                      className="flex items-center justify-center w-10 py-2 rounded-xl bg-gray-50 text-gray-500 hover:bg-gray-100 transition">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Reset Password Modal */}
      {resetUserId && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <KeyRound className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900">Reset Password</h2>
                <p className="text-xs text-gray-500">Set a new temporary password</p>
              </div>
            </div>
            <input
              type="text"
              placeholder="New password (min. 6 characters)"
              value={resetPassword}
              onChange={(e) => setResetPassword(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#A8211B] transition mb-4"
            />
            <div className="flex gap-2">
              <button onClick={() => { setResetUserId(null); setResetPassword(''); }}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">
                Cancel
              </button>
              <button onClick={handleResetPassword} disabled={resetLoading}
                className="flex-1 py-2.5 rounded-xl bg-[#A8211B] text-white text-sm font-bold hover:bg-[#7B1E12] transition disabled:opacity-50">
                {resetLoading ? 'Saving…' : 'Set Password'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Revoke Access Confirm Modal */}
      {revokeAccount && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900">Revoke Portal Access</h2>
                <p className="text-xs text-gray-500">This permanently deletes the login account</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-5">
              Are you sure you want to revoke portal access for{' '}
              <strong>{revokeAccount.customer?.fullName || revokeAccount.email}</strong>?
              The customer will no longer be able to sign in. You can re-invite them later.
            </p>
            <div className="flex gap-2">
              <button onClick={() => setRevokeAccount(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">
                Cancel
              </button>
              <button onClick={handleRevoke} disabled={revokeLoading}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition disabled:opacity-50">
                {revokeLoading ? 'Revoking…' : 'Yes, Revoke'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
