'use client';

import { useEffect, useState, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/services/api';
import AddVendorModal from '@/components/modals/AddVendorModal';
import VendorPaymentModal from '@/components/modals/VendorPaymentModal';
import { brandPalette } from '@/utils/brand';
import {
  ArrowLeft, Edit, Phone, Mail, MapPin, Star, CreditCard,
  Package, Building2, Hash, FileText, DollarSign, Calendar,
  RefreshCw, AlertTriangle, Banknote, BadgeCheck,
} from 'lucide-react';

function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex justify-between items-start py-2 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-500 shrink-0 mr-4">{label}</span>
      <span className="text-sm font-medium text-gray-900 text-right">{value}</span>
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border shadow-sm p-5" style={{ borderColor: `${brandPalette.neutral}60` }}>
      <div className="flex items-center gap-2 mb-4">
        {icon && <span style={{ color: brandPalette.primary }}>{icon}</span>}
        <h2 className="font-semibold text-gray-800">{title}</h2>
      </div>
      {children}
    </div>
  );
}

const fmtCur = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(n) || 0);

const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

function VendorDetailContent() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [vendor, setVendor] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentsLoading, setPaymentsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [tab, setTab] = useState<'overview' | 'payments'>('overview');

  const loadVendor = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.get(`/vendors/${id}`);
      setVendor(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load vendor');
    } finally {
      setLoading(false);
    }
  };

  const loadPayments = async () => {
    setPaymentsLoading(true);
    try {
      const data = await api.get(`/vendor-payments?vendorId=${id}`);
      setPayments(Array.isArray(data) ? data : (data?.data || []));
    } catch {
      setPayments([]);
    } finally {
      setPaymentsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadVendor();
      loadPayments();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <RefreshCw className="w-8 h-8 animate-spin" style={{ color: brandPalette.primary }} />
      </div>
    );
  }

  if (error || !vendor) {
    return (
      <div className="p-8 max-w-lg mx-auto mt-16 text-center">
        <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-400" />
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Vendor Not Found</h2>
        <p className="text-gray-500 mb-6">{error || 'This vendor does not exist or was removed.'}</p>
        <button onClick={() => router.back()} className="text-sm underline" style={{ color: brandPalette.primary }}>
          ← Back to Vendors
        </button>
      </div>
    );
  }

  const outstanding = Number(vendor.outstandingAmount) || 0;
  const creditLimit = Number(vendor.creditLimit) || 0;
  const creditUsed = creditLimit > 0 ? Math.min((outstanding / creditLimit) * 100, 100) : 0;
  const rating = Number(vendor.rating) || 0;
  const totalPaid = payments.reduce((s, p) => s + Number(p.amount || 0), 0);

  return (
    <div className="p-6 md:p-8 space-y-6 min-h-full" style={{ backgroundColor: brandPalette.background }}>
      {/* Top bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-xl border hover:bg-white transition-colors"
          style={{ borderColor: `${brandPalette.neutral}80`, color: brandPalette.secondary }}
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => setShowPaymentModal(true)}
            className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl border transition-colors hover:bg-[#FEF3E2]"
            style={{ borderColor: brandPalette.accent, color: brandPalette.secondary }}
          >
            <DollarSign className="w-4 h-4" /> Record Payment
          </button>
          <button
            onClick={() => setShowEditModal(true)}
            className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl text-white transition-colors"
            style={{ backgroundColor: brandPalette.primary }}
          >
            <Edit className="w-4 h-4" /> Edit Vendor
          </button>
        </div>
      </div>

      {/* Vendor Header */}
      <div
        className="rounded-2xl border bg-white shadow-sm overflow-hidden"
        style={{ borderColor: `${brandPalette.neutral}60` }}
      >
        <div className="h-1.5 w-full" style={{ backgroundColor: outstanding > creditLimit * 0.8 ? '#EF4444' : brandPalette.primary }} />
        <div className="p-6 flex flex-col md:flex-row md:items-center gap-5">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-gray-900">{vendor.vendorName}</h1>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">{vendor.vendorCode}</span>
              {vendor.isActive ? (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(61,163,93,0.12)', color: brandPalette.success }}>Active</span>
              ) : (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">Inactive</span>
              )}
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-1.5 mt-3 text-sm text-gray-600">
              {vendor.contactPerson && (
                <span className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-gray-400" /> {vendor.contactPerson}
                </span>
              )}
              {vendor.phoneNumber && (
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-gray-400" /> {vendor.phoneNumber}
                </span>
              )}
              {vendor.email && (
                <a href={`mailto:${vendor.email}`} className="flex items-center gap-1.5 hover:underline" style={{ color: brandPalette.primary }}>
                  <Mail className="w-3.5 h-3.5" /> {vendor.email}
                </a>
              )}
              {(vendor.city || vendor.state) && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" /> {[vendor.city, vendor.state].filter(Boolean).join(', ')}
                </span>
              )}
            </div>
          </div>
          {/* Star rating */}
          <div className="flex items-center gap-2 shrink-0">
            {[1, 2, 3, 4, 5].map(i => (
              <Star
                key={i}
                className="w-5 h-5"
                style={{
                  color: i <= rating ? '#F2C94C' : '#E5E7EB',
                  fill: i <= rating ? '#F2C94C' : '#E5E7EB',
                }}
              />
            ))}
            <span className="text-sm font-semibold ml-1 text-gray-700">{rating.toFixed(1)}</span>
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Outstanding Balance', value: fmtCur(outstanding), color: outstanding > 0 ? '#EF4444' : brandPalette.success },
          { label: 'Total Paid (all time)', value: fmtCur(totalPaid), color: brandPalette.success },
          { label: 'Credit Limit', value: creditLimit > 0 ? fmtCur(creditLimit) : 'No limit set', color: brandPalette.secondary },
        ].map(card => (
          <div key={card.label} className="bg-white rounded-2xl border shadow-sm p-4" style={{ borderColor: `${brandPalette.neutral}60` }}>
            <p className="text-xs text-gray-500 mb-1">{card.label}</p>
            <p className="text-xl font-bold" style={{ color: card.color }}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Credit utilisation bar */}
      {creditLimit > 0 && (
        <div className="bg-white rounded-2xl border shadow-sm p-4" style={{ borderColor: `${brandPalette.neutral}60` }}>
          <div className="flex justify-between text-xs text-gray-500 mb-1.5">
            <span>Credit Utilisation</span>
            <span>{creditUsed.toFixed(0)}% of {fmtCur(creditLimit)}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all"
              style={{ width: `${creditUsed}%`, backgroundColor: creditUsed > 80 ? '#EF4444' : brandPalette.primary }}
            />
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-2xl border p-1 w-fit shadow-sm" style={{ borderColor: `${brandPalette.neutral}60` }}>
        {(['overview', 'payments'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="px-5 py-2 rounded-xl text-sm font-medium capitalize transition-colors"
            style={tab === t
              ? { backgroundColor: brandPalette.primary, color: 'white' }
              : { color: brandPalette.secondary }}
          >
            {t === 'payments' ? `Payments (${payments.length})` : 'Overview'}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Contact */}
          <Section title="Contact Details" icon={<Phone className="w-4 h-4" />}>
            <InfoRow label="Vendor Name" value={vendor.vendorName} />
            <InfoRow label="Contact Person" value={vendor.contactPerson} />
            <InfoRow label="Phone" value={vendor.phoneNumber} />
            <InfoRow label="Email" value={vendor.email} />
            <InfoRow label="Address" value={vendor.address} />
            <InfoRow label="City" value={vendor.city} />
            <InfoRow label="State" value={vendor.state} />
            <InfoRow label="PIN Code" value={vendor.pincode || vendor.pinCode} />
          </Section>

          {/* Business */}
          <Section title="Business Details" icon={<BadgeCheck className="w-4 h-4" />}>
            <InfoRow label="Vendor Code" value={vendor.vendorCode} />
            <InfoRow label="GST Number" value={vendor.gstNumber} />
            <InfoRow label="PAN Number" value={vendor.panNumber} />
            <InfoRow label="Payment Terms" value={vendor.paymentTerms} />
            <InfoRow label="Credit Limit" value={creditLimit > 0 ? fmtCur(creditLimit) : 'None'} />
            {Array.isArray(vendor.materialsSupplied) && vendor.materialsSupplied.length > 0 && (
              <div className="py-2">
                <p className="text-sm text-gray-500 mb-2">Materials Supplied</p>
                <div className="flex flex-wrap gap-1.5">
                  {(vendor.materialsSupplied as string[]).map(m => (
                    <span key={m} className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">{m}</span>
                  ))}
                </div>
              </div>
            )}
            <InfoRow label="Member Since" value={fmtDate(vendor.createdAt)} />
          </Section>

          {/* Bank */}
          {(vendor.bankName || vendor.bankAccountNumber || vendor.ifscCode) && (
            <Section title="Bank Details" icon={<Banknote className="w-4 h-4" />}>
              <InfoRow label="Bank Name" value={vendor.bankName} />
              <InfoRow label="Account Number" value={vendor.bankAccountNumber} />
              <InfoRow label="IFSC Code" value={vendor.ifscCode} />
            </Section>
          )}
        </div>
      )}

      {tab === 'payments' && (
        <Section title="Payment History" icon={<CreditCard className="w-4 h-4" />}>
          {paymentsLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-5 h-5 animate-spin text-gray-400" />
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-10">
              <DollarSign className="w-10 h-10 mx-auto mb-3 text-gray-300" />
              <p className="text-sm text-gray-500">No payments recorded yet.</p>
              <button
                onClick={() => setShowPaymentModal(true)}
                className="mt-3 text-sm font-medium underline"
                style={{ color: brandPalette.primary }}
              >
                Record First Payment
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b" style={{ borderColor: `${brandPalette.neutral}50` }}>
                    {['Date', 'Amount', 'Mode', 'Reference', 'Notes'].map(h => (
                      <th key={h} className="text-left py-2 pr-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {payments.map(p => (
                    <tr key={p.id} className="border-b hover:bg-gray-50 group" style={{ borderColor: `${brandPalette.neutral}30` }}>
                      <td className="py-3 pr-4 text-gray-700 whitespace-nowrap">{fmtDate(p.paymentDate)}</td>
                      <td className="py-3 pr-4 font-semibold" style={{ color: brandPalette.success }}>{fmtCur(p.amount)}</td>
                      <td className="py-3 pr-4">
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">{p.paymentMode}</span>
                      </td>
                      <td className="py-3 pr-4 text-gray-500 font-mono text-xs">{p.transactionReference || '—'}</td>
                      <td className="py-3 text-gray-500 max-w-xs truncate">{p.notes || '—'}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2" style={{ borderColor: brandPalette.neutral }}>
                    <td className="py-3 font-semibold text-gray-700">Total</td>
                    <td className="py-3 font-bold text-lg" style={{ color: brandPalette.primary }}>{fmtCur(totalPaid)}</td>
                    <td colSpan={3} />
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </Section>
      )}

      {/* Modals */}
      <AddVendorModal
        isOpen={showEditModal}
        vendor={vendor}
        onClose={() => setShowEditModal(false)}
        onSuccess={() => { setShowEditModal(false); loadVendor(); }}
      />
      <VendorPaymentModal
        isOpen={showPaymentModal}
        vendor={vendor}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={() => { setShowPaymentModal(false); loadVendor(); loadPayments(); }}
      />
    </div>
  );
}

export default function VendorDetailPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <RefreshCw className="w-8 h-8 animate-spin" style={{ color: brandPalette.primary }} />
      </div>
    }>
      <VendorDetailContent />
    </Suspense>
  );
}
