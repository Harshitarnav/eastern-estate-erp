'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Building2, Loader2, MapPin, RefreshCw, ShieldAlert } from 'lucide-react';
import { flatsService, Flat } from '@/services/flats.service';
import { customersService, Customer } from '@/services/customers.service';
import { BrandHero, BrandSecondaryButton } from '@/components/layout/BrandHero';
import { brandPalette, formatIndianNumber } from '@/utils/brand';
import { formatCurrency } from '@/utils/formatters';

const CHECKLIST_LABELS: Record<string, string> = {
  has_area: 'Area details captured',
  has_pricing: 'Pricing defined',
  has_facing: 'Facing direction added',
  has_amenities: 'Amenities listed',
  has_parking_map: 'Parking allocation mapped',
};

export default function FlatDetailPage() {
  const router = useRouter();
  const params = useParams();
  const flatId = typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params.id[0] : '';

  const [flat, setFlat] = useState<Flat | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [customerError, setCustomerError] = useState<string | null>(null);
  const [loadingCustomer, setLoadingCustomer] = useState(false);

  useEffect(() => {
    if (!flatId) {
      setError('Invalid unit id.');
      setLoading(false);
      return;
    }

    const loadFlat = async () => {
      try {
        setError(null);
        const data = await flatsService.getFlat(flatId, { forceRefresh: true });
        setFlat(data);
      } catch (err: any) {
        const message =
          err?.response?.data?.message ??
          err?.message ??
          'Unable to load flat details right now.';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    loadFlat();
  }, [flatId]);

  useEffect(() => {
    if (!flat?.customerId) {
      setCustomer(null);
      setCustomerError(null);
      setLoadingCustomer(false);
      return;
    }

    const loadCustomer = async () => {
      try {
        setLoadingCustomer(true);
        setCustomerError(null);
        const data = await customersService.getCustomer(flat.customerId as string);
        setCustomer(data);
      } catch (err: any) {
        const message =
          err?.response?.data?.message ??
          err?.message ??
          'Unable to load linked customer details.';
        setCustomerError(message);
        setCustomer(null);
      } finally {
        setLoadingCustomer(false);
      }
    };

    loadCustomer();
  }, [flat?.customerId]);

  const handleRefresh = async () => {
    if (!flatId) {
      return;
    }

    try {
      setRefreshing(true);
      const data = await flatsService.getFlat(flatId, { forceRefresh: true });
      setFlat(data);
      setError(null);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ??
        err?.message ??
        'Unable to refresh flat details right now.';
      setError(message);
    } finally {
      setRefreshing(false);
    }
  };

  const checklistEntries = useMemo(() => {
    if (!flat?.flatChecklist) {
      return [];
    }

    return Object.entries(flat.flatChecklist).map(([key, value]) => ({
      key,
      label: CHECKLIST_LABELS[key] ?? key,
      complete: Boolean(value),
    }));
  }, [flat]);

  const issues = flat?.issues ?? [];
  const list = (val?: string[] | string | null) =>
    Array.isArray(val)
      ? val
      : val
      ? String(val)
          .split(',')
          .map((x) => x.trim())
          .filter(Boolean)
      : [];

  return (
    <div className="space-y-6 p-6 md:p-8" style={{ backgroundColor: brandPalette.background, borderRadius: '24px' }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/flats')}
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-gray-300 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to inventory
          </button>
          <BrandSecondaryButton onClick={handleRefresh}>
            {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Refresh
          </BrandSecondaryButton>
        </div>
        <button
          onClick={() => router.push(`/flats/${flatId}/edit`)}
          className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white shadow-sm transition"
          style={{ backgroundColor: brandPalette.primary }}
        >
          Edit Flat
        </button>
      </div>

      <BrandHero
        eyebrow="Unit Overview"
        title={
          flat ? (
            <>
              {flat.flatNumber}{' '}
              <span style={{ color: brandPalette.accent }}>
                {flat.name ? `· ${flat.name}` : ''}
              </span>
            </>
          ) : (
            'Loading unit'
          )
        }
        description={
          flat
            ? `Tracking readiness for a ${flat.type.replace('_', ' ')} on floor ${flat.floor ?? '—'}.`
            : 'Fetching unit details to help your editors stay aligned.'
        }
      />

      {loading ? (
        <div className="flex items-center justify-center rounded-3xl border border-dashed border-gray-200 bg-white/70 py-20 text-gray-600">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-3 text-sm font-medium">Loading unit details…</span>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-red-200 bg-red-50 p-10 text-center text-sm text-red-700">
          <ShieldAlert className="h-8 w-8" />
          <div className="max-w-sm">{error}</div>
          <button
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 rounded-full border border-red-300 bg-white px-4 py-2 text-xs font-semibold text-red-700 transition hover:border-red-400 hover:text-red-900"
          >
            Try again
          </button>
        </div>
      ) : flat ? (
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3 space-y-6">
            <section className="rounded-3xl border border-gray-200 bg-white/80 p-6 shadow-sm">
              <header className="flex flex-col gap-2 border-b border-gray-100 pb-4 md:flex-row md:items-center md:justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Location</h2>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <MapPin className="h-4 w-4 text-rose-500" />
                  <span>{flat.property?.name ?? 'Property not linked'}</span>
                  <Building2 className="h-4 w-4 text-sky-500" />
                  <span>{flat.tower?.name ?? 'Tower not linked'}</span>
                </div>
              </header>
              <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                <DetailItem label="Unit number" value={flat.flatNumber} />
                <DetailItem label="Unit name" value={flat.name} />
                <DetailItem label="Floor" value={flat.floor ?? '—'} />
                <DetailItem label="Facing" value={flat.facing ?? '—'} />
                <DetailItem label="Typology" value={flat.type.replace('_', ' ')} />
                <DetailItem
                  label="Status"
                  value={
                    <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold text-white" style={{ backgroundColor: '#2563EB' }}>
                      {flat.status.replace('_', ' ')}
                    </span>
                  }
                />
              </dl>
          </section>

          <section className="rounded-3xl border border-gray-200 bg-white/80 p-6 shadow-sm">
            <header className="flex flex-col gap-2 border-b border-gray-100 pb-4 md:flex-row md:items-center md:justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Documents & Compliance</h2>
            </header>
            <div className="mt-4 grid gap-3">
              <DetailItem label="Sale Agreement" value={flat.saleAgreementUrl} isLink />
              <DetailItem label="Allotment Letter" value={flat.allotmentLetterUrl} isLink />
              <DetailItem label="Possession Letter" value={flat.possessionLetterUrl} isLink />
              <DetailItem label="Payment Plan" value={flat.paymentPlanUrl} isLink />
              <DetailList label="Registration Receipts" values={list(flat.registrationReceiptUrls)} />
              <DetailList label="Payment Receipts" values={list(flat.paymentReceiptUrls)} />
              <DetailList label="Demand Letters" values={list(flat.demandLetterUrls)} />
              <DetailItem label="NOC / No Dues" value={flat.nocUrl} isLink />
              <DetailItem label="RERA Certificate" value={flat.reraCertificateUrl} isLink />
              <DetailList label="KYC Docs" values={list(flat.kycDocsUrls)} />
              <DetailItem label="Snag / Defect List" value={flat.snagListUrl} isLink />
              <DetailItem label="Handover Checklist" value={flat.handoverChecklistUrl} isLink />
              <DetailList label="Other Documents" values={list(flat.otherDocuments)} />
            </div>
          </section>

          <section className="rounded-3xl border border-gray-200 bg-white/80 p-6 shadow-sm">
            <header className="flex flex-col gap-2 border-b border-gray-100 pb-4 md:flex-row md:items-center md:justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Statuses & Dates</h2>
            </header>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <DetailItem label="Agreement Date" value={flat.agreementDate} />
              <DetailItem label="Registration Date" value={flat.registrationDate} />
              <DetailItem label="Handover Date" value={flat.handoverDate} />
              <DetailItem label="Loan Status" value={flat.loanStatus} />
              <DetailItem label="Handover Status" value={flat.handoverStatus} />
              <DetailItem label="Verification Status" value={flat.verificationStatus} />
              <DetailItem label="Verified At" value={flat.verifiedAt} />
              <DetailItem label="Verified By" value={flat.verifiedBy} />
            </dl>
          </section>

          <section className="rounded-3xl border border-gray-200 bg-white/80 p-6 shadow-sm">
            <header className="flex flex-col gap-2 border-b border-gray-100 pb-4 md:flex-row md:items-center md:justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Assignments & Extras</h2>
            </header>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <DetailItem label="Salesperson ID" value={flat.salespersonId} />
              <DetailItem label="Service Contact ID" value={flat.serviceContactId} />
              <DetailItem label="Co-buyer Name" value={flat.coBuyerName} />
              <DetailItem label="Co-buyer Email" value={flat.coBuyerEmail} />
              <DetailItem label="Co-buyer Phone" value={flat.coBuyerPhone} />
              <DetailItem label="Parking Number" value={flat.parkingNumber} />
              <DetailItem label="Parking Type" value={flat.parkingType} />
              <DetailItem label="Storage / Locker ID" value={flat.storageId} />
              <DetailItem label="Furnishing Pack" value={flat.furnishingPack} />
              <DetailItem label="Appliance Pack Applied" value={flat.appliancePack ? 'Yes' : 'No'} />
            </dl>
          </section>

            <section className="rounded-3xl border border-gray-200 bg-white/80 p-6 shadow-sm">
              <header className="border-b border-gray-100 pb-4">
                <h2 className="text-lg font-semibold text-gray-900">Area & Pricing</h2>
              </header>
              <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                <DetailItem label="Carpet area" value={`${formatIndianNumber(flat.carpetArea)} sq.ft`} />
                <DetailItem label="Super built-up" value={`${formatIndianNumber(flat.superBuiltUpArea)} sq.ft`} />
                <DetailItem label="Built-up" value={`${formatIndianNumber(flat.builtUpArea)} sq.ft`} />
                <DetailItem label="Balcony area" value={flat.balconyArea ? `${formatIndianNumber(flat.balconyArea)} sq.ft` : '—'} />
                <DetailItem label="Base price" value={`₹${formatIndianNumber(flat.basePrice)}`} />
                <DetailItem label="Final price" value={`₹${formatIndianNumber(flat.finalPrice)}`} />
              </dl>
            </section>

            <section className="rounded-3xl border border-gray-200 bg-white/80 p-6 shadow-sm">
              <header className="border-b border-gray-100 pb-4">
                <h2 className="text-lg font-semibold text-gray-900">Narrative & Highlights</h2>
              </header>
              <div className="mt-4 space-y-4 text-sm text-gray-700">
                <DetailItem label="Description" value={flat.description ?? 'Add a marketing-ready description so your sales team is aligned.'} />
                <DetailItem
                  label="Amenities"
                  value={
                    flat.amenities && (flat.amenities || []).length > 0
                      ? flat.amenities.join(', ')
                      : 'List amenities to give prospects a feel for the home.'
                  }
                />
                <DetailItem label="Special features" value={flat.specialFeatures ?? 'Document highlights like corner views or double-height ceilings.'} />
              </div>
            </section>

            <section className="rounded-3xl border border-gray-200 bg-white/80 p-6 shadow-sm">
              <header className="border-b border-gray-100 pb-4">
                <h2 className="text-lg font-semibold text-gray-900">Payment Status</h2>
                <p className="mt-1 text-sm text-gray-600">Stay in sync with finance as construction progresses.</p>
              </header>
              <FlatFinancialSnapshot
                target={flat.fundsTarget}
                realized={flat.fundsRealized}
                outstanding={flat.fundsOutstanding}
              />
            </section>

            <section className="rounded-3xl border border-gray-200 bg-white/80 p-6 shadow-sm">
              <header className="border-b border-gray-100 pb-4">
                <h2 className="text-lg font-semibold text-gray-900">Customer</h2>
                <p className="mt-1 text-sm text-gray-600">
                  {flat.customerId ? 'Linked buyer details keep CRM and inventory aligned.' : 'Link a customer to track booking progress.'}
                </p>
              </header>
              <div className="mt-4 space-y-4 text-sm text-gray-700">
                {loadingCustomer ? (
                  <div className="flex items-center gap-2 text-gray-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Loading customer information…</span>
                  </div>
                ) : flat.customerId ? (
                  customer ? (
                    <>
                      <DetailItem
                        label="Customer"
                        value={`${customer.firstName} ${customer.lastName}`}
                      />
                      <DetailItem label="Email" value={customer.email} />
                      <DetailItem label="Phone" value={customer.phone} />
                      <DetailItem label="Type" value={customer.type.replace('_', ' ')} />
                      <DetailItem label="Notes" value={customer.notes ?? 'No notes captured yet.'} />
                    </>
                  ) : (
                    <DetailItem label="Customer" value={customerError ?? 'Customer record not found.'} />
                  )
                ) : (
                  <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center text-sm text-gray-600">
                    No customer is linked to this unit yet. Use the edit workflow to assign one so the customer module stays up to date.
                  </div>
                )}
              </div>
            </section>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <section className="rounded-3xl border border-gray-200 bg-white/80 p-6 shadow-sm">
              <header className="border-b border-gray-100 pb-4">
                <h2 className="text-lg font-semibold text-gray-900">Completion score</h2>
                <p className="mt-1 text-sm text-gray-600">
                  {Math.round(flat.dataCompletionPct ?? 0)}% complete · {(issues || []).length} warning{(issues || []).length === 1 ? '' : 's'}
                </p>
              </header>

              <ul className="mt-4 space-y-3 text-sm">
                {((checklistEntries || [])).map(({ key, label, complete }) => (
                  <li
                    key={key}
                    className={`flex items-center justify-between rounded-2xl border px-4 py-3 ${
                      complete ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-orange-200 bg-orange-50 text-orange-700'
                    }`}
                  >
                    <span className="font-medium">{label}</span>
                    <span className="text-xs font-semibold uppercase tracking-wide">
                      {complete ? 'Ready' : 'Missing'}
                    </span>
                  </li>
                ))}
                {(checklistEntries || []).length === 0 && (
                  <li className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
                    Checklist will appear once the unit has baseline data.
                  </li>
                )}
              </ul>
            </section>

            <section className="rounded-3xl border border-orange-200 bg-orange-50/90 p-6 shadow-sm">
              <header className="flex items-center gap-2 border-b border-orange-200 pb-3">
                <ShieldAlert className="h-5 w-5 text-orange-500" />
                <h2 className="text-lg font-semibold text-orange-800">Needs attention</h2>
              </header>
              <ul className="mt-4 space-y-2 text-sm text-orange-800">
                {(issues || []).length > 0 ? (
                  ((issues || [])).map((item, index) => (
                    <li key={`${item}-${index}`} className="rounded-xl border border-orange-200 bg-white/70 px-4 py-3">
                      {item}
                    </li>
                  ))
                ) : (
                  <li className="rounded-xl border border-emerald-200 bg-white/80 px-4 py-3 text-emerald-700">
                    All good! No outstanding warnings.
                  </li>
                )}
              </ul>
            </section>

            <section className="rounded-3xl border border-gray-200 bg-white/80 p-6 shadow-sm">
              <header className="border-b border-gray-100 pb-4">
                <h2 className="text-lg font-semibold text-gray-900">Documents & Compliance</h2>
              </header>
              <div className="mt-4 space-y-3">
                <DetailItem label="Sale Agreement" value={flat.saleAgreementUrl} isLink />
                <DetailItem label="Allotment Letter" value={flat.allotmentLetterUrl} isLink />
                <DetailItem label="Possession Letter" value={flat.possessionLetterUrl} isLink />
                <DetailItem label="Payment Plan" value={flat.paymentPlanUrl} isLink />
                <DetailList label="Registration Receipts" values={list(flat.registrationReceiptUrls)} />
                <DetailList label="Payment Receipts" values={list(flat.paymentReceiptUrls)} />
                <DetailList label="Demand Letters" values={list(flat.demandLetterUrls)} />
                <DetailItem label="NOC / No Dues" value={flat.nocUrl} isLink />
                <DetailItem label="RERA Certificate" value={flat.reraCertificateUrl} isLink />
                <DetailList label="KYC Docs" values={list(flat.kycDocsUrls)} />
                <DetailItem label="Snag / Defect List" value={flat.snagListUrl} isLink />
                <DetailItem label="Handover Checklist" value={flat.handoverChecklistUrl} isLink />
                <DetailList label="Other Documents" values={list(flat.otherDocuments)} />
              </div>
            </section>

            <section className="rounded-3xl border border-gray-200 bg-white/80 p-6 shadow-sm">
              <header className="border-b border-gray-100 pb-4">
                <h2 className="text-lg font-semibold text-gray-900">Statuses & Dates</h2>
              </header>
              <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                <DetailItem label="Agreement Date" value={flat.agreementDate} />
                <DetailItem label="Registration Date" value={flat.registrationDate} />
                <DetailItem label="Handover Date" value={flat.handoverDate} />
                <DetailItem label="Loan Status" value={flat.loanStatus} />
                <DetailItem label="Handover Status" value={flat.handoverStatus} />
                <DetailItem label="Verification Status" value={flat.verificationStatus} />
                <DetailItem label="Verified At" value={flat.verifiedAt} />
                <DetailItem label="Verified By" value={flat.verifiedBy} />
              </dl>
            </section>

            <section className="rounded-3xl border border-gray-200 bg-white/80 p-6 shadow-sm">
              <header className="border-b border-gray-100 pb-4">
                <h2 className="text-lg font-semibold text-gray-900">Assignments & Extras</h2>
              </header>
              <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                <DetailItem label="Salesperson ID" value={flat.salespersonId} />
                <DetailItem label="Service Contact ID" value={flat.serviceContactId} />
                <DetailItem label="Co-buyer Name" value={flat.coBuyerName} />
                <DetailItem label="Co-buyer Email" value={flat.coBuyerEmail} />
                <DetailItem label="Co-buyer Phone" value={flat.coBuyerPhone} />
                <DetailItem label="Parking Number" value={flat.parkingNumber} />
                <DetailItem label="Parking Type" value={flat.parkingType} />
                <DetailItem label="Storage / Locker ID" value={flat.storageId} />
                <DetailItem label="Furnishing Pack" value={flat.furnishingPack} />
                <DetailItem label="Appliance Pack Applied" value={flat.appliancePack ? 'Yes' : 'No'} />
              </dl>
            </section>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function DetailItem({ label, value, isLink }: { label: string; value: React.ReactNode; isLink?: boolean }) {
  return (
    <div className="space-y-1 text-sm">
      <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</dt>
      <dd className="text-gray-800 break-all">
        {isLink && typeof value === 'string' ? (
          <a href={value} className="text-blue-600 hover:underline" target="_blank" rel="noreferrer">
            {value}
          </a>
        ) : (
          value ?? '—'
        )}
      </dd>
    </div>
  );
}

function DetailList({ label, values }: { label: string; values: string[] }) {
  if (!values || values.length === 0) return null;
  return (
    <div className="space-y-1 text-sm">
      <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</dt>
      <dd className="space-y-1">
        <ul className="space-y-1 text-blue-600 break-all">
          {values.map((v, idx) => (
            <li key={`${label}-${idx}`}>
              {v.startsWith('http') ? (
                <a href={v} className="hover:underline" target="_blank" rel="noreferrer">
                  {v}
                </a>
              ) : (
                v
              )}
            </li>
          ))}
        </ul>
      </dd>
    </div>
  );
}

function FlatFinancialSnapshot({
  target,
  realized,
  outstanding,
}: {
  target?: number | null;
  realized?: number | null;
  outstanding?: number | null;
}) {
  const rows = [
    { label: 'Projected Collections', amount: target, tone: 'text-indigo-600' },
    { label: 'Funds Realised', amount: realized, tone: 'text-emerald-600' },
    { label: 'Funds Outstanding', amount: outstanding, tone: 'text-orange-600' },
  ];

  return (
    <div className="mt-4 grid gap-4 sm:grid-cols-3">
      {((rows || [])).map(({ label, amount, tone }) => (
        <div key={label} className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
          <p className={`mt-2 text-base font-semibold ${tone}`}>
            {amount !== undefined && amount !== null ? formatCurrency(amount) : '—'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {amount !== undefined && amount !== null
              ? `${formatIndianNumber(Math.round(amount))} INR`
              : 'Awaiting data'}
          </p>
        </div>
      ))}
    </div>
  );
}
