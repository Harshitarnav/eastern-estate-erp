'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/services/api';
import { CardGridSkeleton } from '@/components/Skeletons';
import CreatePurchaseOrderModal from '@/components/modals/CreatePurchaseOrderModal';
import { BrandHero, BrandPrimaryButton } from '@/components/layout/BrandHero';
import { BrandStatCard } from '@/components/layout/BrandStatCard';
import { brandPalette, formatIndianNumber, formatToCrore } from '@/utils/brand';
import {
  ShoppingCart, Plus, Search, TrendingUp, Clock,
  CheckCircle, AlertTriangle, ChevronRight, Calendar,
  RefreshCw,
} from 'lucide-react';

interface PurchaseOrder {
  id: string;
  poNumber: string;
  poDate: string;
  vendor?: { vendorName: string; phoneNumber?: string };
  constructionProject?: { projectName: string };
  status: string;
  expectedDeliveryDate?: string;
  actualDeliveryDate?: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  advancePaid: number;
  balanceAmount: number;
  notes?: string;
}

const STATUS_CFG: Record<string, { label: string; bg: string; text: string; border: string }> = {
  DRAFT:              { label: 'Draft',             bg: 'bg-gray-100',   text: 'text-gray-700',   border: 'border-gray-200' },
  PENDING_APPROVAL:   { label: 'Pending Approval',  bg: 'bg-yellow-50',  text: 'text-yellow-700', border: 'border-yellow-200' },
  APPROVED:           { label: 'Approved',           bg: 'bg-blue-50',    text: 'text-blue-700',   border: 'border-blue-200' },
  ORDERED:            { label: 'Ordered',            bg: 'bg-purple-50',  text: 'text-purple-700', border: 'border-purple-200' },
  PARTIALLY_RECEIVED: { label: 'Partial Receipt',    bg: 'bg-orange-50',  text: 'text-orange-700', border: 'border-orange-200' },
  RECEIVED:           { label: 'Received',           bg: 'bg-green-50',   text: 'text-green-700',  border: 'border-green-200' },
  DELIVERED:          { label: 'Delivered',          bg: 'bg-green-50',   text: 'text-green-700',  border: 'border-green-200' },
  CANCELLED:          { label: 'Cancelled',          bg: 'bg-red-50',     text: 'text-red-700',    border: 'border-red-200' },
};

const STATUS_NEXT: Record<string, string> = {
  DRAFT: 'PENDING_APPROVAL',
  PENDING_APPROVAL: 'APPROVED',
  APPROVED: 'ORDERED',
  ORDERED: 'PARTIALLY_RECEIVED',
  PARTIALLY_RECEIVED: 'RECEIVED',
};

const STATUS_NEXT_LABEL: Record<string, string> = {
  DRAFT: 'Submit for Approval',
  PENDING_APPROVAL: 'Approve',
  APPROVED: 'Mark as Ordered',
  ORDERED: 'Mark Partial Receipt',
  PARTIALLY_RECEIVED: 'Mark Fully Received',
};

function PurchaseOrdersPageContent() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => { loadOrders(); }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/purchase-orders');
      const data = Array.isArray(res) ? res : (res?.data || res?.items || []);
      setOrders(data);
    } catch (error) {
      console.error('Failed to load purchase orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/purchase-orders/${id}/status`, { status });
      await loadOrders();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const fmtCur = (n: number | string) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(n) || 0);
  const fmt = (d?: string) =>
    d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';

  const filtered = orders.filter(po => {
    const matchStatus = !filterStatus || po.status === filterStatus;
    const matchSearch = !searchTerm
      || po.poNumber?.toLowerCase().includes(searchTerm.toLowerCase())
      || po.vendor?.vendorName?.toLowerCase().includes(searchTerm.toLowerCase())
      || po.constructionProject?.projectName?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchStatus && matchSearch;
  });

  const stats = {
    total: orders.length,
    pending: orders.filter(p => p.status === 'PENDING_APPROVAL').length,
    active: orders.filter(p => ['APPROVED', 'ORDERED', 'PARTIALLY_RECEIVED'].includes(p.status)).length,
    received: orders.filter(p => ['RECEIVED', 'DELIVERED'].includes(p.status)).length,
    totalValue: orders.reduce((s, p) => s + (Number(p.totalAmount) || 0), 0),
    outstanding: orders.reduce((s, p) => s + (Number(p.balanceAmount) || 0), 0),
  };

  return (
    <div className="p-6 md:p-8 space-y-8 min-h-full" style={{ backgroundColor: brandPalette.background }}>

      {/* Hero */}
      <BrandHero
        eyebrow="Purchase Orders"
        title={<>Procure materials, <span style={{ color: brandPalette.accent }}>from order to delivery</span></>}
        description="Create, approve and track all material purchase orders. Monitor delivery status, outstanding payments and the full procurement lifecycle."
        actions={
          <BrandPrimaryButton onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4" /> New Purchase Order
          </BrandPrimaryButton>
        }
      />

      {/* Stats */}
      <section className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <BrandStatCard
          title="Total Orders"
          primary={formatIndianNumber(stats.total)}
          subLabel={`${stats.pending} pending approval`}
          icon={<ShoppingCart className="w-7 h-7" />}
          accentColor={brandPalette.primary}
        />
        <BrandStatCard
          title="Active Orders"
          primary={formatIndianNumber(stats.active)}
          subLabel="Approved or in transit"
          icon={<TrendingUp className="w-7 h-7" />}
          accentColor="rgba(37,99,235,0.2)"
        />
        <BrandStatCard
          title="Total Value"
          primary={formatToCrore(stats.totalValue)}
          subLabel="All purchase orders"
          icon={<Clock className="w-7 h-7" />}
          accentColor="rgba(168,33,27,0.18)"
        />
        <BrandStatCard
          title="Outstanding"
          primary={formatToCrore(stats.outstanding)}
          subLabel="Balance to be paid"
          icon={<AlertTriangle className="w-7 h-7" />}
          accentColor={stats.outstanding > 0 ? 'rgba(239,68,68,0.2)' : 'rgba(61,163,93,0.2)'}
        />
      </section>

      {/* Workflow Banner */}
      <div
        className="rounded-2xl border bg-white/90 shadow-sm p-4 flex flex-wrap items-center gap-2"
        style={{ borderColor: `${brandPalette.neutral}80` }}
      >
        <span className="text-xs font-semibold text-gray-400 uppercase mr-2">Workflow</span>
        {['Draft', 'Pending Approval', 'Approved', 'Ordered', 'Partial Receipt', 'Received'].map((step, i, arr) => (
          <span key={step} className="flex items-center gap-2">
            <span className="bg-gray-100 text-gray-700 text-xs rounded-full px-3 py-1 font-medium">{step}</span>
            {i < arr.length - 1 && <ChevronRight className="w-3.5 h-3.5 text-gray-300" />}
          </span>
        ))}
      </div>

      {/* Filters */}
      <div
        className="rounded-2xl border bg-white/90 backdrop-blur-sm shadow-sm p-5"
        style={{ borderColor: `${brandPalette.neutral}80` }}
      >
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by PO number, vendor, or project…"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#A8211B]"
            />
          </div>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 border rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#A8211B] bg-white"
          >
            <option value="">All Statuses</option>
            {Object.entries(STATUS_CFG).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
          <button
            onClick={loadOrders}
            className="px-4 py-2.5 border rounded-xl text-sm flex items-center gap-2 hover:bg-gray-50"
            style={{ borderColor: brandPalette.neutral, color: brandPalette.secondary }}
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
          {(searchTerm || filterStatus) && (
            <button
              onClick={() => { setSearchTerm(''); setFilterStatus(''); }}
              className="px-4 py-2.5 text-sm border rounded-xl hover:bg-gray-50"
              style={{ borderColor: brandPalette.neutral, color: brandPalette.secondary }}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* PO List */}
      {loading ? (
        <CardGridSkeleton cards={4} />
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-3xl border p-12 text-center shadow-sm" style={{ borderColor: `${brandPalette.neutral}60` }}>
          <ShoppingCart className="w-16 h-16 mx-auto mb-4" style={{ color: brandPalette.primary, opacity: 0.45 }} />
          <h3 className="text-xl font-semibold mb-2" style={{ color: brandPalette.secondary }}>
            {orders.length === 0 ? 'No Purchase Orders Yet' : 'No Orders Match'}
          </h3>
          <p className="text-gray-500 text-sm mb-6">
            {orders.length === 0 ? 'Create your first purchase order to start tracking procurement.' : 'Try adjusting your filters.'}
          </p>
          {orders.length === 0 && (
            <BrandPrimaryButton onClick={() => setShowCreateModal(true)}>
              <Plus className="w-4 h-4" /> Create First PO
            </BrandPrimaryButton>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(po => {
            const statusCfg = STATUS_CFG[po.status] || STATUS_CFG.DRAFT;
            const isOverdue = po.expectedDeliveryDate
              && new Date(po.expectedDeliveryDate) < new Date()
              && !['RECEIVED', 'DELIVERED', 'CANCELLED'].includes(po.status);
            const totalAmt = Number(po.totalAmount) || 0;
            const paidAmt = Number(po.advancePaid) || 0;
            const balAmt = Number(po.balanceAmount) || 0;

            return (
              <div
                key={po.id}
                className="bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all overflow-hidden"
                style={{ borderColor: `${brandPalette.neutral}60` }}
              >
                <div className="p-5">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    {/* Left */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="font-bold text-gray-900 text-lg">{po.poNumber}</h3>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}>
                          {statusCfg.label}
                        </span>
                        {isOverdue && (
                          <span className="flex items-center gap-1 text-xs font-medium text-red-600">
                            <AlertTriangle className="w-3 h-3" /> Overdue
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <p className="text-gray-400 text-xs">Vendor</p>
                          <p className="font-medium">{po.vendor?.vendorName || '-'}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs">Project</p>
                          <p className="font-medium truncate">{po.constructionProject?.projectName || '-'}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs">PO Date</p>
                          <p className="font-medium flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-gray-400" />{fmt(po.poDate)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs">Expected Delivery</p>
                          <p className={`font-medium flex items-center gap-1 ${isOverdue ? 'text-red-600' : ''}`}>
                            <Calendar className="w-3 h-3 text-gray-400" />{fmt(po.expectedDeliveryDate)}
                          </p>
                          {po.actualDeliveryDate && (
                            <p className="text-xs text-green-600 flex items-center gap-1 mt-0.5">
                              <CheckCircle className="w-3 h-3" /> {fmt(po.actualDeliveryDate)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right - financials */}
                    <div className="md:w-64 shrink-0">
                      <div className="bg-gray-50 rounded-xl p-3 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Total</span>
                          <span className="font-bold text-gray-900">{fmtCur(totalAmt)}</span>
                        </div>
                        {paidAmt > 0 && (
                          <>
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div
                                className="h-1.5 rounded-full"
                                style={{
                                  width: `${totalAmt > 0 ? Math.min((paidAmt / totalAmt) * 100, 100) : 0}%`,
                                  backgroundColor: brandPalette.success,
                                }}
                              />
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-green-600 font-medium">Paid: {fmtCur(paidAmt)}</span>
                              <span className={`font-medium ${balAmt > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                                Bal: {fmtCur(balAmt)}
                              </span>
                            </div>
                          </>
                        )}
                        {STATUS_NEXT[po.status] && (
                          <button
                            onClick={() => updateStatus(po.id, STATUS_NEXT[po.status])}
                            className="w-full mt-1 py-1.5 rounded-lg text-xs font-semibold text-white transition-opacity hover:opacity-90"
                            style={{ backgroundColor: brandPalette.primary }}
                          >
                            {STATUS_NEXT_LABEL[po.status]}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer */}
      <div className="pt-4 text-center text-sm text-gray-400">
        Eastern Estate ERP • Life Long Bonding...
      </div>

      <CreatePurchaseOrderModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => { setShowCreateModal(false); loadOrders(); }}
        propertyId=""
      />
    </div>
  );
}

export default function PurchaseOrdersPage() {
  return (
    <Suspense fallback={<CardGridSkeleton cards={4} />}>
      <PurchaseOrdersPageContent />
    </Suspense>
  );
}
