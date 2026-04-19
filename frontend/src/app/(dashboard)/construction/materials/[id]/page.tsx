'use client';

import { useEffect, useState, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/services/api';
import { brandPalette } from '@/utils/brand';
import MaterialEntryModal from '@/components/modals/MaterialEntryModal';
import MaterialExitModal from '@/components/modals/MaterialExitModal';
import {
  ArrowLeft, Package, ArrowDownCircle, ArrowUpCircle, RefreshCw,
  AlertTriangle, Tag, Layers, Hash, BarChart3, RotateCcw,
} from 'lucide-react';

const fmtDate = (d: string | Date) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';

const fmtNum = (n: number | string, unit = '') =>
  `${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 3 })}${unit ? ' ' + unit : ''}`;

const fmtCur = (n: number | string) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(n) || 0);

function StockBar({ current, min, max }: { current: number; min: number; max: number }) {
  const pct = max > 0 ? Math.min(100, (current / max) * 100) : current > 0 ? 100 : 0;
  const color = current <= min ? '#EF4444' : current >= max * 0.9 ? '#F59E0B' : '#22C55E';
  return (
    <div>
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>Min: {fmtNum(min)}</span>
        <span className="font-semibold" style={{ color }}>{fmtNum(current)}</span>
        <span>Max: {fmtNum(max)}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

function MaterialDetailContent() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [material, setMaterial] = useState<any>(null);
  const [entries, setEntries] = useState<any[]>([]);
  const [exits, setExits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<'overview' | 'entries' | 'exits'>('overview');
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);

  const reload = async () => {
    setLoading(true);
    setError('');
    try {
      const [mat, ent, ext] = await Promise.all([
        api.get(`/materials/${id}`),
        api.get(`/material-entries?materialId=${id}`),
        api.get(`/material-exits?materialId=${id}`),
      ]);
      setMaterial(mat);
      setEntries(Array.isArray(ent) ? ent : (ent?.data || []));
      setExits(Array.isArray(ext) ? ext : (ext?.data || []));
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load material');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (id) reload(); }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <RefreshCw className="w-8 h-8 animate-spin" style={{ color: brandPalette.primary }} />
    </div>
  );

  if (error || !material) return (
    <div className="p-8 max-w-lg mx-auto mt-16 text-center">
      <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-400" />
      <h2 className="text-xl font-semibold text-gray-800 mb-2">Material Not Found</h2>
      <p className="text-gray-500 mb-6">{error || 'This material does not exist or was removed.'}</p>
      <button onClick={() => router.back()} className="text-sm underline" style={{ color: brandPalette.primary }}>
        ← Back
      </button>
    </div>
  );

  const stock = Number(material.currentStock) || 0;
  const min = Number(material.minimumStockLevel) || 0;
  const max = Number(material.maximumStockLevel) || 0;
  const stockValue = stock * Number(material.unitPrice || 0);
  const isLowStock = stock <= min;

  const totalIn = entries.reduce((s, e) => s + Number(e.quantity || 0), 0);
  const totalOut = exits.reduce((s, e) => s + Number(e.quantity || 0), 0);
  const totalInValue = entries.reduce((s, e) => s + Number(e.totalValue || 0), 0);

  return (
    <div className="p-6 md:p-8 space-y-6 min-h-full" style={{ backgroundColor: brandPalette.background }}>

      {/* Top bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-xl border hover:bg-white transition-colors"
          style={{ borderColor: `${brandPalette.neutral}80`, color: brandPalette.secondary }}
        >
          <ArrowLeft className="w-4 h-4" /> Back to Materials
        </button>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setShowEntryModal(true)}
            className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl border transition-colors hover:bg-green-50"
            style={{ borderColor: brandPalette.success, color: brandPalette.success }}
          >
            <ArrowDownCircle className="w-4 h-4" /> Stock In
          </button>
          <button
            onClick={() => setShowExitModal(true)}
            className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl border transition-colors hover:bg-orange-50"
            style={{ borderColor: '#EA580C', color: '#EA580C' }}
          >
            <ArrowUpCircle className="w-4 h-4" /> Issue to Site
          </button>
        </div>
      </div>

      {/* Header card */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: `${brandPalette.neutral}60` }}>
        <div className="h-1.5" style={{ backgroundColor: isLowStock ? '#EF4444' : brandPalette.primary }} />
        <div className="p-6 flex flex-col md:flex-row gap-6">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap mb-1">
              <h1 className="text-2xl font-bold text-gray-900">{material.materialName}</h1>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">{material.materialCode}</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{
                backgroundColor: isLowStock ? 'rgba(239,68,68,0.1)' : 'rgba(61,163,93,0.1)',
                color: isLowStock ? '#EF4444' : brandPalette.success,
              }}>
                {isLowStock ? '⚠ Low Stock' : 'Normal'}
              </span>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600 mb-4">
              <span className="flex items-center gap-1.5"><Tag className="w-3.5 h-3.5 text-gray-400" />{material.category}</span>
              <span className="flex items-center gap-1.5"><Layers className="w-3.5 h-3.5 text-gray-400" />{material.unitOfMeasurement}</span>
              {Number(material.gstPercentage) > 0 && (
                <span className="flex items-center gap-1.5"><Hash className="w-3.5 h-3.5 text-gray-400" />GST {material.gstPercentage}%</span>
              )}
            </div>
            {material.specifications && (
              <p className="text-sm text-gray-500 bg-gray-50 rounded-lg px-3 py-2">{material.specifications}</p>
            )}
          </div>
          <div className="shrink-0 w-full md:w-64">
            <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">Current Stock</p>
            <StockBar current={stock} min={min} max={max} />
            <p className="text-right text-xs text-gray-400 mt-1.5">
              Stock value: <span className="font-semibold text-gray-700">{fmtCur(stockValue)}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Current Stock', value: fmtNum(stock, material.unitOfMeasurement), color: isLowStock ? '#EF4444' : brandPalette.success },
          { label: 'Unit Price', value: fmtCur(material.unitPrice || 0), color: brandPalette.secondary },
          { label: `Total Received (${entries.length} records)`, value: fmtNum(totalIn, material.unitOfMeasurement), color: '#2563EB' },
          { label: `Total Issued (${exits.length} records)`, value: fmtNum(totalOut, material.unitOfMeasurement), color: '#EA580C' },
        ].map(c => (
          <div key={c.label} className="bg-white rounded-2xl border shadow-sm p-4" style={{ borderColor: `${brandPalette.neutral}60` }}>
            <p className="text-xs text-gray-500 mb-1 leading-tight">{c.label}</p>
            <p className="text-lg font-bold" style={{ color: c.color }}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-2xl border p-1 w-fit shadow-sm" style={{ borderColor: `${brandPalette.neutral}60` }}>
        {([
          { key: 'overview', label: 'Overview' },
          { key: 'entries', label: `Stock In (${entries.length})` },
          { key: 'exits', label: `Issued To (${exits.length})` },
        ] as { key: typeof tab; label: string }[]).map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="px-5 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap"
            style={tab === t.key
              ? { backgroundColor: brandPalette.primary, color: 'white' }
              : { color: brandPalette.secondary }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview tab */}
      {tab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-white rounded-2xl border shadow-sm p-5" style={{ borderColor: `${brandPalette.neutral}60` }}>
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-4 h-4" style={{ color: brandPalette.primary }} />
              <h2 className="font-semibold text-gray-800">Material Details</h2>
            </div>
            {[
              ['Material Code', material.materialCode],
              ['Category', material.category],
              ['Unit', material.unitOfMeasurement],
              ['Unit Price', fmtCur(material.unitPrice || 0)],
              ['GST %', `${material.gstPercentage || 0}%`],
              ['Min Stock', fmtNum(min, material.unitOfMeasurement)],
              ['Max Stock', fmtNum(max, material.unitOfMeasurement)],
            ].map(([label, val]) => (
              <div key={label} className="flex justify-between py-2 border-b border-gray-100 last:border-0 text-sm">
                <span className="text-gray-500">{label}</span>
                <span className="font-medium text-gray-900">{val}</span>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl border shadow-sm p-5" style={{ borderColor: `${brandPalette.neutral}60` }}>
            <div className="flex items-center gap-2 mb-4">
              <Package className="w-4 h-4" style={{ color: brandPalette.primary }} />
              <h2 className="font-semibold text-gray-800">Stock Summary</h2>
            </div>
            {[
              ['Current Stock', fmtNum(stock, material.unitOfMeasurement)],
              ['Stock Value', fmtCur(stockValue)],
              ['Total Received', fmtNum(totalIn, material.unitOfMeasurement)],
              ['Total Value Received', fmtCur(totalInValue)],
              ['Total Issued', fmtNum(totalOut, material.unitOfMeasurement)],
              ['Receipts Count', `${entries.length} deliveries`],
              ['Issue Count', `${exits.length} issues`],
            ].map(([label, val]) => (
              <div key={label} className="flex justify-between py-2 border-b border-gray-100 last:border-0 text-sm">
                <span className="text-gray-500">{label}</span>
                <span className="font-medium text-gray-900">{val}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stock In tab */}
      {tab === 'entries' && (
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: `${brandPalette.neutral}60` }}>
          <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: `${brandPalette.neutral}40` }}>
            <div className="flex items-center gap-2">
              <ArrowDownCircle className="w-4 h-4" style={{ color: brandPalette.success }} />
              <h2 className="font-semibold text-gray-800">Stock In - Received Deliveries</h2>
            </div>
            <button
              onClick={() => setShowEntryModal(true)}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors"
              style={{ backgroundColor: 'rgba(61,163,93,0.1)', color: brandPalette.success }}
            >
              + Record New
            </button>
          </div>
          {entries.length === 0 ? (
            <div className="p-12 text-center">
              <ArrowDownCircle className="w-10 h-10 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-500 text-sm">No deliveries recorded yet.</p>
              <button onClick={() => setShowEntryModal(true)} className="mt-2 text-sm underline" style={{ color: brandPalette.primary }}>
                Record First Delivery
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50" style={{ borderColor: `${brandPalette.neutral}40` }}>
                    {['Date', 'Qty Received', 'Unit Price', 'Total Value', 'Vendor', 'Invoice #', 'Remarks'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {entries.map((e, i) => (
                    <tr key={e.id || i} className="border-b hover:bg-gray-50" style={{ borderColor: `${brandPalette.neutral}30` }}>
                      <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{fmtDate(e.entryDate)}</td>
                      <td className="px-4 py-3 font-semibold" style={{ color: brandPalette.success }}>
                        +{fmtNum(e.quantity)} <span className="text-xs font-normal text-gray-400">{material.unitOfMeasurement}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-700">{fmtCur(e.unitPrice)}</td>
                      <td className="px-4 py-3 font-semibold text-gray-900">{fmtCur(e.totalValue)}</td>
                      <td className="px-4 py-3 text-gray-600">{e.vendor?.vendorName || '-'}</td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">{e.invoiceNumber || '-'}</td>
                      <td className="px-4 py-3 text-gray-500 max-w-xs truncate">{e.remarks || '-'}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 bg-gray-50" style={{ borderColor: brandPalette.neutral }}>
                    <td className="px-4 py-3 font-semibold text-gray-700">Total</td>
                    <td className="px-4 py-3 font-bold" style={{ color: brandPalette.success }}>
                      +{fmtNum(totalIn)} <span className="text-xs font-normal text-gray-400">{material.unitOfMeasurement}</span>
                    </td>
                    <td className="px-4 py-3" />
                    <td className="px-4 py-3 font-bold text-gray-900">{fmtCur(totalInValue)}</td>
                    <td colSpan={3} />
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Issued To tab */}
      {tab === 'exits' && (
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: `${brandPalette.neutral}60` }}>
          <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: `${brandPalette.neutral}40` }}>
            <div className="flex items-center gap-2">
              <ArrowUpCircle className="w-4 h-4" style={{ color: '#EA580C' }} />
              <h2 className="font-semibold text-gray-800">Issued To Site</h2>
            </div>
            <button
              onClick={() => setShowExitModal(true)}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors"
              style={{ backgroundColor: 'rgba(234,88,12,0.1)', color: '#EA580C' }}
            >
              + Issue New
            </button>
          </div>
          {exits.length === 0 ? (
            <div className="p-12 text-center">
              <ArrowUpCircle className="w-10 h-10 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-500 text-sm">No issuances recorded yet.</p>
              <button onClick={() => setShowExitModal(true)} className="mt-2 text-sm underline" style={{ color: brandPalette.primary }}>
                Issue to Site
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50" style={{ borderColor: `${brandPalette.neutral}40` }}>
                    {['Date', 'Qty Issued', 'Purpose', 'Issued To', 'Return?', 'Returned', 'Remarks'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {exits.map((e, i) => {
                    const returned = Number(e.returnQuantity) || 0;
                    const pending = Number(e.quantity) - returned;
                    return (
                      <tr key={e.id || i} className="border-b hover:bg-gray-50" style={{ borderColor: `${brandPalette.neutral}30` }}>
                        <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{fmtDate(e.exitDate)}</td>
                        <td className="px-4 py-3 font-semibold" style={{ color: '#EA580C' }}>
                          -{fmtNum(e.quantity)} <span className="text-xs font-normal text-gray-400">{material.unitOfMeasurement}</span>
                        </td>
                        <td className="px-4 py-3 text-gray-700 max-w-[150px] truncate">{e.purpose || '-'}</td>
                        <td className="px-4 py-3 text-gray-600">
                          {e.issuedToEmployee?.fullName || '-'}
                        </td>
                        <td className="px-4 py-3">
                          {e.returnExpected ? (
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{
                              backgroundColor: pending > 0 ? 'rgba(239,68,68,0.1)' : 'rgba(61,163,93,0.1)',
                              color: pending > 0 ? '#EF4444' : brandPalette.success,
                            }}>
                              {pending > 0 ? `${fmtNum(pending)} pending` : '✓ Returned'}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">No</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-500">
                          {returned > 0 ? (
                            <span className="flex items-center gap-1">
                              <RotateCcw className="w-3 h-3" />
                              {fmtNum(returned)} {e.returnDate ? `(${fmtDate(e.returnDate)})` : ''}
                            </span>
                          ) : '-'}
                        </td>
                        <td className="px-4 py-3 text-gray-500 max-w-xs truncate">{e.remarks || '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 bg-gray-50" style={{ borderColor: brandPalette.neutral }}>
                    <td className="px-4 py-3 font-semibold text-gray-700">Total</td>
                    <td className="px-4 py-3 font-bold" style={{ color: '#EA580C' }}>
                      -{fmtNum(totalOut)} <span className="text-xs font-normal text-gray-400">{material.unitOfMeasurement}</span>
                    </td>
                    <td colSpan={5} />
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modals - pre-filtered to this material */}
      <MaterialEntryModal
        isOpen={showEntryModal}
        onClose={() => setShowEntryModal(false)}
        onSuccess={() => { setShowEntryModal(false); reload(); }}
      />
      <MaterialExitModal
        isOpen={showExitModal}
        onClose={() => setShowExitModal(false)}
        onSuccess={() => { setShowExitModal(false); reload(); }}
        propertyId=""
      />
    </div>
  );
}

export default function MaterialDetailPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <RefreshCw className="w-8 h-8 animate-spin" style={{ color: brandPalette.primary }} />
      </div>
    }>
      <MaterialDetailContent />
    </Suspense>
  );
}
