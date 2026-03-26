'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/services/api';
import AddVendorModal from '@/components/modals/AddVendorModal';
import VendorPaymentModal from '@/components/modals/VendorPaymentModal';
import { CardGridSkeleton } from '@/components/Skeletons';
import { BrandHero, BrandPrimaryButton, BrandSecondaryButton } from '@/components/layout/BrandHero';
import { BrandStatCard } from '@/components/layout/BrandStatCard';
import { brandPalette, formatIndianNumber } from '@/utils/brand';
import {
  Users, Plus, Search, Star, Phone, Mail, DollarSign,
  CreditCard, Package, AlertTriangle, Building2,
} from 'lucide-react';

function VendorsPageContent() {
  const router = useRouter();
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [selectedVendor, setSelectedVendor] = useState<any | null>(null);

  useEffect(() => { loadVendors(); }, []);

  const loadVendors = async () => {
    setLoading(true);
    try {
      const response = await api.get('/vendors');
      const data = Array.isArray(response) ? response : (response?.data || []);
      setVendors((data || []).filter((v: any) => v.isActive));
    } catch (error) {
      console.error('Failed to load vendors:', error);
    } finally {
      setLoading(false);
    }
  };

  const fmtCur = (n: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(n) || 0);

  const getRatingColor = (r: number) => {
    if (r >= 4) return brandPalette.success;
    if (r >= 3) return brandPalette.accent;
    return '#EF4444';
  };

  const totalOutstanding = vendors.reduce((s, v) => s + (Number(v.outstandingAmount) || 0), 0);
  const avgRating = vendors.length
    ? vendors.reduce((s, v) => s + (Number(v.rating) || 0), 0) / vendors.length
    : 0;
  const highOutstanding = vendors.filter(v => Number(v.outstandingAmount) > 100000).length;

  const categories = [...new Set(
    vendors.flatMap(v => Array.isArray(v.materialsSupplied) ? v.materialsSupplied : []).filter(Boolean)
  )];

  const filtered = vendors.filter(v => {
    const q = search.toLowerCase();
    const matchSearch = !search ||
      v.vendorName?.toLowerCase().includes(q) ||
      v.vendorCode?.toLowerCase().includes(q) ||
      v.contactPerson?.toLowerCase().includes(q);
    const matchCat = !filterCategory ||
      (Array.isArray(v.materialsSupplied) && v.materialsSupplied.includes(filterCategory));
    return matchSearch && matchCat;
  });

  return (
    <div
      className="p-6 md:p-8 space-y-8 min-h-full"
      style={{ backgroundColor: brandPalette.background }}
    >
      {/* Hero */}
      <BrandHero
        eyebrow="Vendor Management"
        title={<>Your supply chain, <span style={{ color: brandPalette.accent }}>always in control</span></>}
        description="Manage all material suppliers, track outstanding payments, monitor credit limits, and maintain vendor ratings — everything in one place."
        actions={
          <>
            <BrandPrimaryButton onClick={() => setShowAddModal(true)}>
              <Plus className="w-4 h-4" /> Add Vendor
            </BrandPrimaryButton>
            <BrandSecondaryButton onClick={() => setShowPaymentModal(true)}>
              <DollarSign className="w-4 h-4" /> Record Payment
            </BrandSecondaryButton>
          </>
        }
      />

      {/* Stat Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <BrandStatCard
          title="Total Vendors"
          primary={formatIndianNumber(vendors.length)}
          subLabel={`${vendors.length} active suppliers`}
          icon={<Building2 className="w-7 h-7" />}
          accentColor={brandPalette.primary}
        />
        <BrandStatCard
          title="Total Outstanding"
          primary={fmtCur(totalOutstanding)}
          subLabel={`${highOutstanding} vendors over ₹1L`}
          icon={<CreditCard className="w-7 h-7" />}
          accentColor={totalOutstanding > 0 ? 'rgba(239,68,68,0.2)' : 'rgba(61,163,93,0.2)'}
        />
        <BrandStatCard
          title="Average Rating"
          primary={avgRating.toFixed(1)}
          subLabel={`out of 5.0 stars`}
          icon={<Star className="w-7 h-7" />}
          accentColor="rgba(242,201,76,0.35)"
        />
        <BrandStatCard
          title="Material Types"
          primary={formatIndianNumber(categories.length)}
          subLabel="Distinct supply categories"
          icon={<Package className="w-7 h-7" />}
          accentColor="rgba(61,163,93,0.2)"
        />
      </section>

      {/* Outstanding Alert */}
      {totalOutstanding > 500000 && (
        <div className="rounded-2xl border-l-4 border-yellow-500 bg-yellow-50 px-6 py-4 flex items-start gap-4 shadow-sm">
          <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-yellow-900">High Outstanding Balance</p>
            <p className="text-sm text-yellow-800 mt-0.5">
              Total outstanding across all vendors is {fmtCur(totalOutstanding)}. Review and schedule payments.
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div
        className="rounded-2xl border bg-white/90 backdrop-blur-sm shadow-sm p-5 space-y-4"
        style={{ borderColor: `${brandPalette.neutral}80` }}
      >
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, code, or contact…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#A8211B]"
            />
          </div>
          {categories.length > 0 && (
            <select
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              className="px-4 py-2.5 border rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#A8211B] bg-white"
            >
              <option value="">All Categories</option>
              {categories.map(c => <option key={c as string} value={c as string}>{c as string}</option>)}
            </select>
          )}
          {(search || filterCategory) && (
            <button
              onClick={() => { setSearch(''); setFilterCategory(''); }}
              className="px-4 py-2.5 text-sm border rounded-xl hover:bg-gray-50 whitespace-nowrap"
              style={{ borderColor: brandPalette.neutral, color: brandPalette.secondary }}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Vendor Grid */}
      {loading ? (
        <CardGridSkeleton cards={6} />
      ) : filtered.length === 0 ? (
        <div
          className="bg-white rounded-3xl border p-12 text-center shadow-sm"
          style={{ borderColor: `${brandPalette.neutral}60` }}
        >
          <Users className="w-16 h-16 mx-auto mb-4" style={{ color: brandPalette.primary, opacity: 0.45 }} />
          <h3 className="text-xl font-semibold mb-2" style={{ color: brandPalette.secondary }}>
            {vendors.length === 0 ? 'No Vendors Yet' : 'No Vendors Match'}
          </h3>
          <p className="text-gray-500 text-sm mb-6">
            {vendors.length === 0
              ? 'Add your first vendor to start managing your supply chain.'
              : 'Try adjusting your search or clear the filters.'}
          </p>
          {vendors.length === 0 && (
            <BrandPrimaryButton onClick={() => setShowAddModal(true)}>
              <Plus className="w-4 h-4" /> Add First Vendor
            </BrandPrimaryButton>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map(vendor => {
            const rating = Number(vendor.rating) || 0;
            const outstanding = Number(vendor.outstandingAmount) || 0;
            const creditLimit = Number(vendor.creditLimit) || 0;
            const creditUsed = creditLimit > 0 ? Math.min((outstanding / creditLimit) * 100, 100) : 0;

            return (
              <div
                key={vendor.id}
                className="bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all overflow-hidden"
                style={{ borderColor: `${brandPalette.neutral}60` }}
              >
                {/* Top accent */}
                <div className="h-1 w-full" style={{ backgroundColor: outstanding > creditLimit * 0.8 ? '#EF4444' : brandPalette.primary }} />

                <div className="p-5">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2 mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 text-lg line-clamp-1">{vendor.vendorName}</h3>
                      <p className="text-xs text-gray-400 font-mono mt-0.5">{vendor.vendorCode}</p>
                    </div>
                    {/* Star rating */}
                    <div className="shrink-0 flex items-center gap-1">
                      <Star className="w-4 h-4" style={{ color: getRatingColor(rating), fill: getRatingColor(rating) }} />
                      <span className="text-sm font-semibold" style={{ color: getRatingColor(rating) }}>
                        {rating.toFixed(1)}
                      </span>
                    </div>
                  </div>

                  {/* Contact */}
                  <div className="space-y-1.5 mb-4">
                    {vendor.contactPerson && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span className="truncate">{vendor.contactPerson}</span>
                      </div>
                    )}
                    {vendor.phoneNumber && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span>{vendor.phoneNumber}</span>
                      </div>
                    )}
                    {vendor.email && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span className="truncate">{vendor.email}</span>
                      </div>
                    )}
                    {Array.isArray(vendor.materialsSupplied) && vendor.materialsSupplied.length > 0 && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Package className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span className="truncate">{(vendor.materialsSupplied as string[]).join(', ')}</span>
                      </div>
                    )}
                  </div>

                  {/* Financial summary */}
                  <div className="rounded-xl bg-gray-50 p-3 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Outstanding</span>
                      <span className={`font-semibold ${outstanding > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {fmtCur(outstanding)}
                      </span>
                    </div>
                    {creditLimit > 0 && (
                      <>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Credit Limit</span>
                          <span className="font-medium text-gray-700">{fmtCur(creditLimit)}</span>
                        </div>
                        <div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div
                              className="h-1.5 rounded-full transition-all"
                              style={{
                                width: `${creditUsed}%`,
                                backgroundColor: creditUsed > 80 ? '#EF4444' : brandPalette.primary,
                              }}
                            />
                          </div>
                          <p className="text-right text-xs text-gray-400 mt-0.5">{creditUsed.toFixed(0)}% utilised</p>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Action */}
                  <button
                    onClick={() => { setSelectedVendor(vendor); setShowPaymentModal(true); }}
                    className="mt-4 w-full py-2 text-sm font-medium border rounded-xl transition-colors hover:bg-[#FEF3E2]"
                    style={{ borderColor: brandPalette.accent, color: brandPalette.secondary }}
                  >
                    Record Payment
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer */}
      <div className="pt-4 text-center text-sm text-gray-400">
        Eastern Estate ERP • Building Homes, Nurturing Bonds
      </div>

      {/* Modals */}
      <AddVendorModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => { setShowAddModal(false); loadVendors(); }}
      />
      <VendorPaymentModal
        isOpen={showPaymentModal}
        onClose={() => { setShowPaymentModal(false); setSelectedVendor(null); }}
        onSuccess={() => { setShowPaymentModal(false); setSelectedVendor(null); loadVendors(); }}
      />
    </div>
  );
}

export default function VendorsPage() {
  return (
    <Suspense fallback={<CardGridSkeleton cards={6} />}>
      <VendorsPageContent />
    </Suspense>
  );
}
