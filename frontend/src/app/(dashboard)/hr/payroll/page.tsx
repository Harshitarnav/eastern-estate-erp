'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DollarSign, Users, Plus, CheckCircle, XCircle, Loader2, IndianRupee, RefreshCw, FileText, Undo2 } from 'lucide-react';
import { propertiesService } from '@/services/properties.service';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

interface Employee {
  id: string;
  fullName: string;
  designation?: string;
  department?: string;
}

interface SalaryPayment {
  id: string;
  employeeId: string;
  employee?: { fullName: string; designation?: string };
  paymentMonth: string;
  basicSalary: number;
  grossSalary: number;
  totalDeductions: number;
  netSalary: number;
  paymentStatus: string;
  paymentDate?: string;
  paymentMode?: string;
  transactionReference?: string;
  pfDeduction: number;
  esiDeduction: number;
  taxDeduction: number;
  journalEntryNumber?: string | null;
}

interface Summary {
  totalGross: number;
  totalDeductions: number;
  totalNet: number;
  count: number;
  paid: number;
  pending: number;
}

const fmt = (n: number) =>
  '₹' + Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const statusColor: Record<string, string> = {
  PAID: 'bg-green-100 text-green-800',
  PENDING: 'bg-yellow-100 text-yellow-800',
  PROCESSING: 'bg-blue-100 text-blue-800',
  CANCELLED: 'bg-red-100 text-red-800',
  FAILED: 'bg-red-100 text-red-800',
};

export default function PayrollPage() {
  const { user } = useAuthStore();
  const canAdminEdit = user?.roles?.some((r: any) =>
    ['super_admin', 'admin'].includes(typeof r === 'string' ? r : r.name)
  );

  const today = new Date();
  const [month, setMonth] = useState(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`);
  const [payments, setPayments] = useState<SalaryPayment[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [showPay, setShowPay] = useState<SalaryPayment | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [jeRetrying, setJeRetrying] = useState<string | null>(null);
  const [jeMessage, setJeMessage] = useState<{ id: string; msg: string; success: boolean } | null>(null);
  const [reversingId, setReversingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    employeeId: '',
    workingDays: 26,
    presentDays: 26,
    basicSalary: '',
    houseRentAllowance: '',
    transportAllowance: '',
    medicalAllowance: '',
    otherAllowances: '',
    pfDeduction: '',
    esiDeduction: '',
    taxDeduction: '',
    advanceDeduction: '',
    loanDeduction: '',
    otherDeductions: '',
    notes: '',
  });

  const [payForm, setPayForm] = useState({
    paymentMode: 'BANK_TRANSFER',
    transactionReference: '',
    bankName: '',
    paymentRemarks: '',
    propertyId: '',
  });
  const [allProperties, setAllProperties] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    propertiesService.getProperties({ limit: 100 })
      .then((res: any) => {
        const list = res?.data ?? res ?? [];
        setAllProperties(Array.isArray(list) ? list : list.data ?? []);
      })
      .catch(() => {});
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [paymentsRes, summaryRes, empRes] = await Promise.all([
        api.get('/employees/salary-payments', { params: { month } }),
        api.get('/employees/salary-payments/summary', { params: { month } }),
        api.get('/employees', { params: { limit: 200 } }),
      ]);
      setPayments(Array.isArray(paymentsRes) ? paymentsRes : []);
      setSummary(summaryRes);
      const empData = empRes?.data || empRes || [];
      setEmployees(Array.isArray(empData) ? empData : []);
    } catch (err: any) {
      setError(err.message || 'Failed to load payroll data');
    } finally {
      setLoading(false);
    }
  }, [month]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleCreate = async () => {
    if (!form.employeeId || !form.basicSalary) {
      setError('Employee and Basic Salary are required');
      return;
    }
    // Validate net salary
    const previewGross = Number(form.basicSalary || 0) + Number(form.houseRentAllowance || 0) + Number(form.transportAllowance || 0) + Number(form.medicalAllowance || 0) + Number(form.otherAllowances || 0);
    const previewDeductions = Number(form.pfDeduction || 0) + Number(form.esiDeduction || 0) + Number(form.taxDeduction || 0) + Number(form.advanceDeduction || 0) + Number(form.loanDeduction || 0) + Number(form.otherDeductions || 0);
    if (previewGross - previewDeductions <= 0) {
      setError('Net salary must be greater than ₹0. Please check earnings and deductions.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await api.post('/employees/salary-payments', {
        ...form,
        paymentMonth: month,
        basicSalary: Number(form.basicSalary),
        houseRentAllowance: Number(form.houseRentAllowance || 0),
        transportAllowance: Number(form.transportAllowance || 0),
        medicalAllowance: Number(form.medicalAllowance || 0),
        otherAllowances: Number(form.otherAllowances || 0),
        pfDeduction: Number(form.pfDeduction || 0),
        esiDeduction: Number(form.esiDeduction || 0),
        taxDeduction: Number(form.taxDeduction || 0),
        advanceDeduction: Number(form.advanceDeduction || 0),
        loanDeduction: Number(form.loanDeduction || 0),
        otherDeductions: Number(form.otherDeductions || 0),
        workingDays: Number(form.workingDays),
        presentDays: Number(form.presentDays),
      });
      setShowCreate(false);
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to create salary');
    } finally {
      setSaving(false);
    }
  };

  const handlePay = async () => {
    if (!showPay) return;
    setSaving(true);
    setError('');
    try {
      const result = await api.post(`/employees/salary-payments/${showPay.id}/pay`, payForm);
      setShowPay(null);
      await loadData();
      if (result?.journalEntryNumber) {
        setJeMessage({ id: showPay.id, msg: `✅ Journal Entry ${result.journalEntryNumber} created automatically`, success: true });
      } else {
        setJeMessage({ id: showPay.id, msg: '⚠️ Payment saved but JE was not created - click "Gen JE" to retry', success: false });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to process payment');
    } finally {
      setSaving(false);
    }
  };

  const handleReversePay = async (payment: SalaryPayment) => {
    if (!confirm(
      'Reverse this salary payment? The posted journal entry will be voided (COA balances reversed) and this row will return to Pending so you can fix and pay again.',
    )) return;
    setReversingId(payment.id);
    setJeMessage(null);
    try {
      await api.post(`/employees/salary-payments/${payment.id}/reverse-pay`, {});
      toast.success('Payment reversed - record is Pending again; journal entry voided if one existed.');
      await loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to reverse payment');
    } finally {
      setReversingId(null);
    }
  };

  const handleRetryJE = async (payment: SalaryPayment) => {
    setJeRetrying(payment.id);
    setJeMessage(null);
    try {
      const result = await api.post(`/employees/salary-payments/${payment.id}/retry-je`);
      setJeMessage({ id: payment.id, msg: result?.message || (result?.success ? '✅ JE created' : '❌ JE failed'), success: result?.success });
      await loadData();
    } catch (err: any) {
      setJeMessage({ id: payment.id, msg: `❌ ${err.response?.data?.message || err.message}`, success: false });
    } finally {
      setJeRetrying(null);
    }
  };

  const monthLabel = new Date(month).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: '#7B1E12' }}>Payroll</h1>
          <p className="text-gray-600 mt-1">Process monthly salaries - auto Journal Entry on payment</p>
        </div>
        <div className="flex gap-3 items-center">
          <div>
            <Label className="text-xs text-gray-500">Month</Label>
            <Input
              type="month"
              value={month.slice(0, 7)}
              onChange={e => setMonth(e.target.value + '-01')}
              className="w-40"
            />
          </div>
          <Button onClick={() => setShowCreate(true)} className="mt-5" style={{ backgroundColor: '#A8211B' }}>
            <Plus className="h-4 w-4 mr-2" /> Add Salary
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {jeMessage && (
        <div className={`border px-4 py-3 rounded-lg text-sm flex items-center justify-between ${jeMessage.success ? 'bg-green-50 border-green-200 text-green-800' : 'bg-amber-50 border-amber-200 text-amber-800'}`}>
          <span>{jeMessage.msg}</span>
          <button onClick={() => setJeMessage(null)} className="ml-4 text-lg leading-none opacity-60 hover:opacity-100">×</button>
        </div>
      )}

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: 'Employees', value: summary.count, icon: Users, color: '#3B82F6', isNum: false },
            { label: 'Paid', value: summary.paid, icon: CheckCircle, color: '#10B981', isNum: false },
            { label: 'Pending', value: summary.pending, icon: XCircle, color: '#F59E0B', isNum: false },
            { label: 'Gross Payroll', value: summary.totalGross, icon: IndianRupee, color: '#8B5CF6', isNum: true },
            { label: 'Total Deductions', value: summary.totalDeductions, icon: DollarSign, color: '#EF4444', isNum: true },
            { label: 'Net Payroll', value: summary.totalNet, icon: IndianRupee, color: '#10B981', isNum: true },
          ].map(c => (
            <Card key={c.label} className="border-l-4" style={{ borderColor: c.color }}>
              <CardContent className="p-4">
                <p className="text-xs text-gray-500">{c.label}</p>
                <p className="text-xl font-bold mt-1" style={{ color: c.color }}>
                  {c.isNum ? fmt(c.value as number) : c.value}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Salary Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Salary Register - {monthLabel}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin text-gray-400" /></div>
          ) : payments.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <DollarSign className="h-12 w-12 mx-auto mb-3 opacity-40" />
              <p>No salary records for {monthLabel}</p>
              <p className="text-sm mt-1">Click "Add Salary" to create one</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Employee</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">Basic</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">Gross</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">PF/ESI/Tax</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">Net Pay</th>
                    <th className="text-center px-4 py-3 font-medium text-gray-600">Status</th>
                    <th className="text-center px-4 py-3 font-medium text-gray-600">JE</th>
                    <th className="text-center px-4 py-3 font-medium text-gray-600">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map(p => (
                    <tr key={p.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <p className="font-medium">
                          {p.employee ? p.employee.fullName : p.employeeId}
                        </p>
                        {p.employee?.designation && (
                          <p className="text-xs text-gray-500">{p.employee.designation}</p>
                        )}
                        {p.paymentDate && (
                          <p className="text-xs text-green-600 mt-0.5">
                            Paid: {new Date(p.paymentDate).toLocaleDateString('en-IN')}
                            {p.paymentMode && ` via ${p.paymentMode.replace('_', ' ')}`}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-mono">{fmt(p.basicSalary)}</td>
                      <td className="px-4 py-3 text-right font-mono">{fmt(p.grossSalary)}</td>
                      <td className="px-4 py-3 text-right font-mono text-red-600">
                        -{fmt(Number(p.pfDeduction) + Number(p.esiDeduction) + Number(p.taxDeduction))}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-green-700">
                        {fmt(p.netSalary)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor[p.paymentStatus] || 'bg-gray-100 text-gray-700'}`}>
                          {p.paymentStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {p.paymentStatus === 'PAID' && (
                          p.journalEntryNumber ? (
                            <span className="flex items-center justify-center gap-1 text-xs text-green-700 font-medium">
                              <FileText className="h-3 w-3" />
                              {p.journalEntryNumber}
                            </span>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRetryJE(p)}
                              disabled={jeRetrying === p.id}
                              className="text-orange-600 border-orange-300 hover:bg-orange-50 text-xs px-2"
                            >
                              {jeRetrying === p.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3 mr-1" />}
                              Gen JE
                            </Button>
                          )
                        )}
                        {p.paymentStatus !== 'PAID' && <span className="text-xs text-gray-400">-</span>}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {p.paymentStatus === 'PENDING' && (
                          <Button
                            size="sm"
                            onClick={() => { setShowPay(p); setError(''); }}
                            style={{ backgroundColor: '#10B981' }}
                            className="text-white"
                          >
                            Pay Now
                          </Button>
                        )}
                        {p.paymentStatus === 'PAID' && (
                          canAdminEdit ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReversePay(p)}
                              disabled={reversingId === p.id}
                              className="text-amber-800 border-amber-300 hover:bg-amber-50 text-xs"
                              title="Void JE and return to Pending"
                            >
                              {reversingId === p.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <>
                                  <Undo2 className="h-3 w-3 mr-1" /> Reverse
                                </>
                              )}
                            </Button>
                          ) : (
                            <span className="text-xs text-green-600">✓ Done</span>
                          )
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 bg-gray-50 font-semibold">
                    <td className="px-4 py-3">TOTAL</td>
                    <td className="px-4 py-3 text-right font-mono">
                      {fmt(payments.reduce((s, p) => s + Number(p.basicSalary), 0))}
                    </td>
                    <td className="px-4 py-3 text-right font-mono">
                      {fmt(payments.reduce((s, p) => s + Number(p.grossSalary), 0))}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-red-600">
                      -{fmt(payments.reduce((s, p) => s + Number(p.pfDeduction) + Number(p.esiDeduction) + Number(p.taxDeduction), 0))}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-green-700">
                      {fmt(payments.reduce((s, p) => s + Number(p.netSalary), 0))}
                    </td>
                    <td colSpan={3} />
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
        <strong>💡 Auto Accounting:</strong> When you click "Pay Now", a Journal Entry is automatically created in the Accounting module:
        <br />
        <span className="font-mono">Dr. Salary Expense → Cr. Bank/Cash</span>
        <br />
        Make sure your Chart of Accounts has a <em>Salary Expense</em> account and a <em>Bank/Cash</em> account.
      </div>

      {/* Create Salary Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>Add Salary for {monthLabel}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Employee */}
            <div>
              <Label>Employee *</Label>
              <Select value={form.employeeId} onValueChange={v => setForm(f => ({ ...f, employeeId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
                <SelectContent>
                  {employees.map(e => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.fullName} {e.designation ? `- ${e.designation}` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Days */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Working Days</Label>
                <Input type="number" value={form.workingDays}
                  onChange={e => setForm(f => ({ ...f, workingDays: Number(e.target.value) }))} />
              </div>
              <div>
                <Label className="text-xs">Present Days</Label>
                <Input type="number" value={form.presentDays}
                  onChange={e => setForm(f => ({ ...f, presentDays: Number(e.target.value) }))} />
              </div>
            </div>

            {/* Earnings */}
            <div className="border-t pt-3">
              <p className="font-medium text-sm text-gray-700 mb-3">Earnings</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { key: 'basicSalary', label: 'Basic Salary *' },
                  { key: 'houseRentAllowance', label: 'HRA' },
                  { key: 'transportAllowance', label: 'Transport Allowance' },
                  { key: 'medicalAllowance', label: 'Medical Allowance' },
                  { key: 'otherAllowances', label: 'Other Allowances' },
                ].map(f => (
                  <div key={f.key}>
                    <Label className="text-xs">{f.label}</Label>
                    <Input type="number" placeholder="0"
                      value={(form as any)[f.key]}
                      onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))} />
                  </div>
                ))}
              </div>
            </div>

            {/* Deductions */}
            <div className="border-t pt-3">
              <p className="font-medium text-sm text-gray-700 mb-3">Deductions</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { key: 'pfDeduction', label: 'PF Deduction' },
                  { key: 'esiDeduction', label: 'ESI Deduction' },
                  { key: 'taxDeduction', label: 'Income Tax (TDS)' },
                  { key: 'advanceDeduction', label: 'Advance Recovery' },
                  { key: 'loanDeduction', label: 'Loan Recovery' },
                  { key: 'otherDeductions', label: 'Other Deductions' },
                ].map(f => (
                  <div key={f.key}>
                    <Label className="text-xs">{f.label}</Label>
                    <Input type="number" placeholder="0"
                      value={(form as any)[f.key]}
                      onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))} />
                  </div>
                ))}
              </div>
            </div>

            {/* Live Net Salary Preview */}
            {(() => {
              const gross =
                Number(form.basicSalary || 0) + Number(form.houseRentAllowance || 0) +
                Number(form.transportAllowance || 0) + Number(form.medicalAllowance || 0) +
                Number(form.otherAllowances || 0);
              const deductions =
                Number(form.pfDeduction || 0) + Number(form.esiDeduction || 0) +
                Number(form.taxDeduction || 0) + Number(form.advanceDeduction || 0) +
                Number(form.loanDeduction || 0) + Number(form.otherDeductions || 0);
              return (
                <div className="bg-green-50 rounded-lg p-3">
                  <div className="flex flex-wrap gap-3 justify-between text-sm">
                    <span>Gross: <strong>{fmt(gross)}</strong></span>
                    <span>Deductions: <strong className="text-red-600">-{fmt(deductions)}</strong></span>
                    <span>Net Pay: <strong className="text-green-700 text-base">{fmt(gross - deductions)}</strong></span>
                  </div>
                </div>
              );
            })()}

            {/* Notes */}
            <div className="border-t pt-3">
              <Label className="text-xs">Notes / Remarks (optional)</Label>
              <Input
                placeholder="e.g. Includes special incentive for Q4"
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>

          <DialogFooter className="flex-col-reverse sm:flex-row gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowCreate(false)} className="w-full sm:w-auto">Cancel</Button>
            <Button onClick={handleCreate} disabled={saving} style={{ backgroundColor: '#A8211B' }} className="w-full sm:w-auto">
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Create Salary Record
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pay Dialog */}
      <Dialog open={!!showPay} onOpenChange={() => setShowPay(null)}>
        <DialogContent className="w-full max-w-md max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>Process Salary Payment</DialogTitle>
          </DialogHeader>
          {showPay && (
            <div className="space-y-4 py-4">
              <div className="bg-green-50 rounded-lg p-4">
                <p className="font-medium">
                  {showPay.employee ? showPay.employee.fullName : showPay.employeeId}
                </p>
                <p className="text-2xl font-bold text-green-700 mt-1">{fmt(showPay.netSalary)}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Gross: {fmt(showPay.grossSalary)} - Deductions: {fmt(showPay.totalDeductions)}
                </p>
              </div>

              <div>
                <Label>Payment Mode</Label>
                <Select value={payForm.paymentMode} onValueChange={v => setPayForm(f => ({ ...f, paymentMode: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['BANK_TRANSFER', 'CASH', 'CHEQUE', 'UPI'].map(m => (
                      <SelectItem key={m} value={m}>{m.replace('_', ' ')}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {payForm.paymentMode === 'BANK_TRANSFER' && (
                <div>
                  <Label>Bank Name</Label>
                  <Input
                    placeholder="e.g. HDFC Bank"
                    value={payForm.bankName}
                    onChange={e => setPayForm(f => ({ ...f, bankName: e.target.value }))}
                  />
                </div>
              )}

              <div>
                <Label>Transaction / UTR Reference</Label>
                <Input
                  placeholder="e.g. UTR123456789"
                  value={payForm.transactionReference}
                  onChange={e => setPayForm(f => ({ ...f, transactionReference: e.target.value }))}
                />
              </div>

              <div>
                <Label>Remarks</Label>
                <Input
                  placeholder="Optional remarks"
                  value={payForm.paymentRemarks}
                  onChange={e => setPayForm(f => ({ ...f, paymentRemarks: e.target.value }))}
                />
              </div>

              <div>
                <Label>Project *</Label>
                <select
                  required
                  value={payForm.propertyId}
                  onChange={e => setPayForm(f => ({ ...f, propertyId: e.target.value }))}
                  className="w-full mt-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500"
                >
                  <option value="">- Select project -</option>
                  {allProperties.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-400 mt-1">Salary JE will be tagged to this project's accounts</p>
              </div>

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800">
                ✅ A Journal Entry will be auto-created: <strong>Dr. Salary Expense → Cr. Bank/Cash</strong>
                <br />⚠️ Requires an <strong>EXPENSE</strong> account named "Salary Expense" / "Payroll" / "Wages" and an <strong>ASSET</strong> account for Bank/Cash in Chart of Accounts.
              </div>
            </div>
          )}
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <DialogFooter className="flex-col-reverse sm:flex-row gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowPay(null)} className="w-full sm:w-auto">Cancel</Button>
            <Button onClick={handlePay} disabled={saving} style={{ backgroundColor: '#10B981' }} className="w-full sm:w-auto">
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Confirm Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
