'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, Building2, CheckCircle, ChevronRight, ExternalLink,
  FileText, Loader2, MapPin, RefreshCw, ShieldAlert, Upload, Trash2, Hammer, Camera,
} from 'lucide-react';
import { flatsService, Flat } from '@/services/flats.service';
import { customersService, Customer } from '@/services/customers.service';
import { demandDraftsService, DemandDraft } from '@/services/demand-drafts.service';
import { paymentPlansService, FlatPaymentPlan } from '@/services/payment-plans.service';
import { apiService } from '@/services/api';

interface FlatProgressRow {
  id: string;
  phase: string;
  phaseProgress: number;
  overallProgress: number;
  status: string;
  notes?: string | null;
  photos?: string[] | null;
  updatedAt?: string;
  createdAt?: string;
}

const CONSTRUCTION_PHASES: { value: string; label: string }[] = [
  { value: 'FOUNDATION', label: 'Foundation' },
  { value: 'STRUCTURE', label: 'Structure' },
  { value: 'MEP', label: 'MEP' },
  { value: 'FINISHING', label: 'Finishing' },
  { value: 'HANDOVER', label: 'Handover' },
];
import { BrandHero, BrandSecondaryButton } from '@/components/layout/BrandHero';
import { brandPalette, formatIndianNumber } from '@/utils/brand';
import { formatCurrency } from '@/utils/formatters';
import { DocumentEntityType, DocumentCategory, documentsService, ErpDocument } from '@/services/documents.service';
import { SectionSkeleton } from '@/components/Skeletons';

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
  const [paymentPlan, setPaymentPlan] = useState<FlatPaymentPlan | null>(null);
  const [flatDocs, setFlatDocs] = useState<ErpDocument[]>([]);
  const [docUploading, setDocUploading] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<DemandDraft[]>([]);
  const [draftLoading, setDraftLoading] = useState(false);
  const [draftForm, setDraftForm] = useState({
    milestoneId: '',
    amount: '',
    content: '',
    customerName: '',
    spouseName: '',
    customerAddress: '',
    flatLabel: '',
    bhk: '',
    amountWords: '',
    reference: '',
    date: '',
    place: '',
    bankAccountHolder: '',
    bankAccountNumber: '',
    bankIfsc: '',
  });
  const [draftMessage, setDraftMessage] = useState<string | null>(null);
  const [deactivating, setDeactivating] = useState(false);
  const [flatProgressRows, setFlatProgressRows] = useState<FlatProgressRow[]>([]);

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
        const inferredFlatLabel = buildFlatLabel(data);
        const inferredBhk = (data?.type || '').replace('_', ' ') || '-';
        const inferredAmount = data?.finalPrice || 0;
        const inferredAmountWords = inferredAmount ? formatAmountInWords(inferredAmount) : '';
        const inferredPlace = data?.property?.city || data?.property?.state || '';
        setDraftForm((prev) => ({
          ...prev,
          flatLabel: inferredFlatLabel,
          bhk: inferredBhk,
          amount: prev.amount || String(inferredAmount || ''),
          amountWords: prev.amountWords || inferredAmountWords,
          milestoneId: prev.milestoneId || data?.status?.replace(/_/g, ' ') || '',
          date: prev.date || new Date().toLocaleDateString('en-GB'),
          place: prev.place || inferredPlace,
        }));
        await loadDrafts(data?.id);
        try {
          const [docs, plan, progress] = await Promise.allSettled([
            documentsService.getByEntity(DocumentEntityType.FLAT, data.id),
            paymentPlansService.getFlatPaymentPlanByFlatId(data.id),
            apiService.get<FlatProgressRow[]>(`/construction/flat-progress/flat/${data.id}`),
          ]);
          if (docs.status === 'fulfilled') setFlatDocs(docs.value);
          if (plan.status === 'fulfilled') setPaymentPlan(plan.value);
          if (progress.status === 'fulfilled')
            setFlatProgressRows(Array.isArray(progress.value) ? progress.value : []);
        } catch { /* non-fatal */ }
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

  useEffect(() => {
    if (customer) {
      const fullName = `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || customer.email || '';
      const addressLine = [
        customer.address || customer.addressLine1,
        customer.city,
        customer.state,
        customer.pincode,
      ]
        .filter(Boolean)
        .join(', ');
      setDraftForm((prev) => ({
        ...prev,
        customerName: prev.customerName || fullName,
        customerAddress: prev.customerAddress || addressLine,
      }));
    }
  }, [customer]);

  const handleRefresh = async () => {
    if (!flatId) {
      return;
    }

    try {
      setRefreshing(true);
      const data = await flatsService.getFlat(flatId, { forceRefresh: true });
      setFlat(data);
      setError(null);
      await loadDrafts(data?.id);
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

  const handleDeactivate = async () => {
    if (!flat) return;
    if (flat.status === 'BOOKED' || flat.status === 'SOLD') {
      alert('Cannot deactivate a unit that is booked or sold.');
      return;
    }
    if (!confirm(`Are you sure you want to deactivate unit ${flat.flatNumber}? It will be hidden from inventory until reactivated.`)) return;
    try {
      setDeactivating(true);
      await flatsService.deleteFlat(flatId);
      router.push('/flats');
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to deactivate unit.');
    } finally {
      setDeactivating(false);
    }
  };

  const loadDrafts = async (id?: string) => {
    if (!id) return;
    try {
      setDraftLoading(true);
      const data = await demandDraftsService.list({ flatId: id });
      setDrafts(data || []);
    } catch (err: any) {
      setDraftMessage(err?.response?.data?.message ?? 'Could not load demand drafts.');
    } finally {
      setDraftLoading(false);
    }
  };

  const handleDraftChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setDraftForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateDraft = async () => {
    if (!flat) return;
    try {
      setDraftMessage(null);
      const content = draftForm.content || buildDraftContent({ ...draftForm, flat });
      const payload = {
        flatId: flat.id,
        customerId: flat.customerId || undefined,
        amount: Number(draftForm.amount || flat.finalPrice || 0),
        milestoneId: draftForm.milestoneId || 'Construction milestone',
        content,
        metadata: {
          customerName: draftForm.customerName,
          spouseName: draftForm.spouseName,
          customerAddress: draftForm.customerAddress,
          flatLabel: draftForm.flatLabel,
          bhk: draftForm.bhk,
          amountWords: draftForm.amountWords,
          reference: draftForm.reference,
          date: draftForm.date,
          place: draftForm.place,
          bankDetails: {
            accountHolder: draftForm.bankAccountHolder,
            accountNumber: draftForm.bankAccountNumber,
            ifsc: draftForm.bankIfsc,
          },
        },
      };
      await demandDraftsService.create(payload);
      await loadDrafts(flat.id);
      setDraftMessage('Draft created. You can edit it below.');
    } catch (err: any) {
      setDraftMessage(err?.response?.data?.message ?? 'Failed to create draft.');
    }
  };

  const handleUpdateDraft = async (draftId: string, content: string, amount: number) => {
    try {
      setDraftMessage(null);
      await demandDraftsService.update(draftId, { content, amount });
      await loadDrafts(flat?.id);
      setDraftMessage('Draft updated.');
    } catch (err: any) {
      setDraftMessage(err?.response?.data?.message ?? 'Failed to update draft.');
    }
  };

  const handleMarkSent = async (draftId: string) => {
    try {
      setDraftMessage(null);
      await demandDraftsService.markSent(draftId);
      await loadDrafts(flat?.id);
      setDraftMessage('Draft marked as sent.');
    } catch (err: any) {
      setDraftMessage(err?.response?.data?.message ?? 'Failed to mark draft as sent.');
    }
  };

  const handlePreviewDraft = async (draftId: string) => {
    try {
      const res = await demandDraftsService.getHtml(draftId);
      const w = window.open('', '_blank');
      if (!w) return;
      w.document.write(res.html || '<p>No content</p>');
      w.document.close();
      w.focus();
      setTimeout(() => {
        w.print();
      }, 200);
    } catch (err: any) {
      setDraftMessage(err?.response?.data?.message ?? 'Failed to render draft.');
    }
  };

  const handleDeleteDraft = async (draftId: string) => {
    try {
      await demandDraftsService.delete(draftId);
      await loadDrafts(flat?.id);
      setDraftMessage('Draft deleted.');
    } catch (err: any) {
      setDraftMessage(err?.response?.data?.message ?? 'Failed to delete draft.');
    }
  };

  const handleDocUpload = async (label: string, category: DocumentCategory, file: File) => {
    if (!flat) return;
    setDocUploading(label);
    try {
      await documentsService.upload(file, {
        name: label,
        category,
        entityType: DocumentEntityType.FLAT,
        entityId: flat.id,
        customerId: flat.customerId || undefined,
        bookingId: flat.bookingId || undefined,
      });
      const updated = await documentsService.getByEntity(DocumentEntityType.FLAT, flat.id);
      setFlatDocs(updated);
    } catch (err: any) {
      alert(err?.response?.data?.message ?? 'Upload failed. Please try again.');
    } finally {
      setDocUploading(null);
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
      <div className="flex flex-wrap items-center justify-between gap-3">
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
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <button
            onClick={() => router.push(`/construction/flats/${flatId}/log`)}
            className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold shadow-sm transition hover:bg-red-50"
            style={{ borderColor: `${brandPalette.primary}40`, color: brandPalette.primary }}
            title="Log construction progress for this flat"
          >
            <Hammer className="h-4 w-4" />
            Log progress
          </button>
          {flat && flat.status !== 'BOOKED' && flat.status !== 'SOLD' && (
            <button
              onClick={handleDeactivate}
              disabled={deactivating}
              className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 shadow-sm transition hover:bg-red-50 disabled:opacity-50"
            >
              {deactivating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Deactivate
            </button>
          )}
          <button
            onClick={() => router.push(`/flats/${flatId}/edit`)}
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white shadow-sm transition"
            style={{ backgroundColor: brandPalette.primary }}
          >
            Edit Flat
          </button>
        </div>
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
            ? `Tracking readiness for a ${flat.type.replace('_', ' ')} on floor ${flat.floor ?? '-'}.`
            : 'Fetching unit details to help your editors stay aligned.'
        }
      />

      {loading ? (
        <div className="space-y-6">
          <SectionSkeleton rows={6} />
          <SectionSkeleton rows={4} />
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
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                  <MapPin className="h-4 w-4 text-rose-500" />
                  {flat.propertyId ? (
                    <button onClick={() => router.push(`/properties/${flat.propertyId}`)}
                      className="font-medium hover:underline" style={{ color: '#A8211B' }}>
                      {flat.property?.name ?? 'Property not linked'}
                    </button>
                  ) : (
                    <span>{flat.property?.name ?? 'Property not linked'}</span>
                  )}
                  <Building2 className="h-4 w-4 text-sky-500" />
                  <span>{flat.tower?.name ?? 'Tower not linked'}</span>
                </div>
              </header>
              <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                <DetailItem label="Unit number" value={flat.flatNumber} />
                <DetailItem label="Unit name" value={flat.name} />
                <DetailItem label="Floor" value={flat.floor ?? '-'} />
                <DetailItem label="Facing" value={flat.facing ?? '-'} />
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

          {/* Construction Progress Section */}
          <section className="rounded-3xl border border-gray-200 bg-white/80 p-6 shadow-sm">
            <header className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Construction Progress</h2>
                <p className="mt-0.5 text-xs text-gray-500">
                  Phase-wise progress, photos and on-site notes.
                </p>
              </div>
              <button
                onClick={() => router.push(`/construction/flats/${flatId}/log`)}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#A8211B] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#8B1B16] transition"
                title="Log construction progress for this flat"
              >
                <Hammer className="h-3.5 w-3.5" /> Log / update
              </button>
            </header>
            <div className="mt-4 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <DetailItem
                  label="Current Stage"
                  value={flat.constructionStage ? flat.constructionStage.replace('_', ' ') : 'Not Started'}
                />
                <DetailItem
                  label="Overall Progress"
                  value={
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-semibold">{flat.constructionProgress || 0}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-blue-600 h-2.5 rounded-full transition-all"
                          style={{ width: `${flat.constructionProgress || 0}%` }}
                        />
                      </div>
                    </div>
                  }
                />
              </div>

              {/* Phase breakdown */}
              {(() => {
                const bestByPhase = new Map<string, FlatProgressRow>();
                flatProgressRows.forEach((r) => {
                  const prev = bestByPhase.get(r.phase);
                  if (!prev || Number(r.phaseProgress || 0) > Number(prev.phaseProgress || 0)) {
                    bestByPhase.set(r.phase, r);
                  }
                });
                const hasAny = bestByPhase.size > 0;
                return (
                  <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-4">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Phase breakdown
                    </p>
                    {hasAny ? (
                      <div className="space-y-2.5">
                        {CONSTRUCTION_PHASES.map(({ value, label }) => {
                          const row = bestByPhase.get(value);
                          const pct = Number(row?.phaseProgress || 0);
                          return (
                            <div key={value}>
                              <div className="mb-1 flex items-center justify-between text-xs">
                                <span className="font-medium text-gray-700">{label}</span>
                                <span className="font-semibold text-gray-500">{pct.toFixed(0)}%</span>
                              </div>
                              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-[#A8211B] to-[#e05a53] transition-all"
                                  style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400">
                        No phase logs yet. Use "Log / update" to record the first entry.
                      </p>
                    )}
                  </div>
                );
              })()}

              {/* Latest photos */}
              {(() => {
                const photosFromLog = flatProgressRows
                  .slice(0, 4)
                  .flatMap((r) => (Array.isArray(r.photos) ? r.photos.filter(Boolean) : []));
                const unique = Array.from(new Set(photosFromLog)).slice(0, 6);
                if (!unique.length) return null;
                return (
                  <div>
                    <div className="mb-2 flex items-center gap-1.5 text-xs text-gray-500">
                      <Camera className="h-3 w-3" />
                      {unique.length} recent photo{unique.length > 1 ? 's' : ''} from site
                    </div>
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                      {unique.map((url, i) =>
                        url ? (
                          <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                            <img
                              src={url}
                              alt={`Site photo ${i + 1}`}
                              className="h-20 w-full rounded-lg border border-gray-100 object-cover transition hover:opacity-90"
                            />
                          </a>
                        ) : null,
                      )}
                    </div>
                  </div>
                );
              })()}

              {flat.lastConstructionUpdate && (
                <DetailItem
                  label="Last Updated"
                  value={new Date(flat.lastConstructionUpdate).toLocaleString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                />
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-gray-200 bg-white/80 p-6 shadow-sm">
            <header className="border-b border-gray-100 pb-4">
              <h2 className="text-lg font-semibold text-gray-900">Documents & Compliance</h2>
              <p className="mt-1 text-sm text-gray-500">
                {flatDocs.length > 0 ? `${flatDocs.length} document${flatDocs.length === 1 ? '' : 's'} uploaded` : 'Click Upload next to each item to attach files.'}
              </p>
            </header>
            <div className="mt-4 divide-y divide-gray-100">
              {(
                [
                  { label: 'Sale Agreement',    category: DocumentCategory.AGREEMENT },
                  { label: 'Allotment Letter',  category: DocumentCategory.OTHER },
                  { label: 'Possession Letter', category: DocumentCategory.POSSESSION_LETTER },
                  { label: 'Payment Plan',      category: DocumentCategory.OTHER },
                  { label: 'NOC / No Dues',     category: DocumentCategory.NOC },
                  { label: 'RERA Certificate',  category: DocumentCategory.OTHER },
                  { label: 'Snag / Defect List',category: DocumentCategory.OTHER },
                  { label: 'Handover Checklist',category: DocumentCategory.OTHER },
                ] as { label: string; category: DocumentCategory }[]
              ).map(({ label, category }) => (
                <DocRow
                  key={label}
                  label={label}
                  category={category}
                  docs={flatDocs}
                  uploading={docUploading === label}
                  onUpload={(file) => handleDocUpload(label, category, file)}
                  onDelete={async (docId) => {
                    await documentsService.remove(docId);
                    const updated = await documentsService.getByEntity(DocumentEntityType.FLAT, flat.id);
                    setFlatDocs(updated);
                  }}
                />
              ))}
            </div>
            <div className="mt-4 border-t pt-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Other Documents</p>
              <DocUploadOther
                flatId={flat.id}
                customerId={flat.customerId || undefined}
                bookingId={flat.bookingId || undefined}
                docs={flatDocs.filter((d) =>
                  !['Sale Agreement','Allotment Letter','Possession Letter','Payment Plan',
                     'NOC / No Dues','RERA Certificate','Snag / Defect List','Handover Checklist'].includes(d.name)
                )}
                onUpload={async (file, name) => { await handleDocUpload(name, DocumentCategory.OTHER, file); }}
                onDelete={async (docId) => {
                  await documentsService.remove(docId);
                  const updated = await documentsService.getByEntity(DocumentEntityType.FLAT, flat.id);
                  setFlatDocs(updated);
                }}
                uploading={docUploading !== null && !['Sale Agreement','Allotment Letter','Possession Letter','Payment Plan',
                  'NOC / No Dues','RERA Certificate','Snag / Defect List','Handover Checklist'].includes(docUploading)}
              />
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
                <DetailItem label="Balcony area" value={flat.balconyArea ? `${formatIndianNumber(flat.balconyArea)} sq.ft` : '-'} />
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
                        value={
                          <button
                            onClick={() => router.push(`/customers/${flat.customerId}`)}
                            className="font-medium hover:underline text-left"
                            style={{ color: '#A8211B' }}
                          >
                            {customer.firstName} {customer.lastName}
                          </button>
                        }
                      />
                      <DetailItem label="Email" value={customer.email} />
                      <DetailItem label="Phone" value={customer.phone} />
                      <DetailItem label="Type" value={customer.type.replace('_', ' ')} />
                      {flat.bookingId && (
                        <div className="pt-2">
                          <button
                            onClick={() => router.push(`/bookings/${flat.bookingId}`)}
                            className="inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-lg border hover:bg-blue-50 transition"
                            style={{ borderColor: '#2563EB', color: '#2563EB' }}
                          >
                            <ExternalLink className="h-3.5 w-3.5" /> View Booking
                          </button>
                        </div>
                      )}
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
            {/* ── Payment Schedule ── */}
            <section className="rounded-3xl border border-gray-200 bg-white/80 p-6 shadow-sm">
              <header className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Payment Schedule</h2>
                  <p className="mt-1 text-sm text-gray-600">
                    {paymentPlan
                      ? `${paymentPlan.milestones?.length ?? 0} milestones · ${formatCurrency(paymentPlan.totalAmount)}`
                      : 'No payment plan linked yet.'}
                  </p>
                </div>
                {paymentPlan && (
                  <button
                    onClick={() => router.push(`/payment-plans/${paymentPlan.id}`)}
                    className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-600 hover:border-gray-300 hover:text-gray-900"
                  >
                    <ChevronRight className="h-3 w-3" />
                    Full Plan
                  </button>
                )}
              </header>
              <div className="mt-4">
                {!paymentPlan ? (
                  flat.bookingId ? (
                    <button
                      onClick={() => router.push(`/payment-plans/new?bookingId=${flat.bookingId}`)}
                      className="inline-flex items-center gap-2 rounded-full border border-dashed border-gray-300 px-4 py-2 text-sm font-semibold text-gray-500 hover:border-gray-400 hover:text-gray-700"
                    >
                      <FileText className="h-4 w-4" />
                      Create Payment Plan
                    </button>
                  ) : (
                    <p className="text-sm text-gray-500">Assign a booking to this flat to create a payment plan.</p>
                  )
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-100 text-xs uppercase tracking-wide text-gray-500">
                          <th className="pb-2 text-left font-semibold">#</th>
                          <th className="pb-2 text-left font-semibold">Milestone</th>
                          <th className="pb-2 text-right font-semibold">Amount</th>
                          <th className="pb-2 text-center font-semibold">Status</th>
                          <th className="pb-2 text-center font-semibold">Demand</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {(paymentPlan.milestones || []).map((m) => {
                          const statusColors: Record<string, string> = {
                            PAID: 'bg-emerald-100 text-emerald-700',
                            TRIGGERED: 'bg-blue-100 text-blue-700',
                            OVERDUE: 'bg-red-100 text-red-700',
                            PENDING: 'bg-gray-100 text-gray-600',
                          };
                          return (
                            <tr key={m.sequence} className="hover:bg-gray-50/50">
                              <td className="py-2 text-gray-400">{m.sequence}</td>
                              <td className="py-2 text-gray-800 font-medium max-w-[140px]">
                                <span className="line-clamp-2">{m.name}</span>
                                {m.dueDate && (
                                  <span className="block text-xs text-gray-400 mt-0.5">
                                    Due {new Date(m.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}
                                  </span>
                                )}
                              </td>
                              <td className="py-2 text-right font-semibold tabular-nums">{formatCurrency(m.amount)}</td>
                              <td className="py-2 text-center">
                                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusColors[m.status] ?? 'bg-gray-100 text-gray-600'}`}>
                                  {m.status}
                                </span>
                              </td>
                              <td className="py-2 text-center">
                                {m.demandDraftId ? (
                                  <button
                                    onClick={() => router.push(`/demand-drafts/${m.demandDraftId}`)}
                                    className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 hover:bg-amber-100"
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                    View
                                  </button>
                                ) : (
                                  <span className="text-xs text-gray-400">-</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot>
                        <tr className="border-t border-gray-200">
                          <td colSpan={2} className="pt-3 text-xs font-semibold uppercase text-gray-500">Total</td>
                          <td className="pt-3 text-right font-bold tabular-nums" style={{ color: brandPalette.primary }}>
                            {formatCurrency(paymentPlan.totalAmount)}
                          </td>
                          <td colSpan={2} className="pt-3 text-right text-xs text-gray-500">
                            Paid {formatCurrency(paymentPlan.paidAmount)} · Bal {formatCurrency(paymentPlan.balanceAmount)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </div>
            </section>

            {/* ── Demand Drafts (read-only list) ── */}
            <section className="rounded-3xl border border-gray-200 bg-white/80 p-6 shadow-sm">
              <header className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Demand Drafts</h2>
                  <p className="mt-1 text-sm text-gray-600">
                    Drafts generated from the payment plan milestones.
                  </p>
                </div>
                <button
                  onClick={() => router.push('/demand-drafts')}
                  className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-600 hover:border-gray-300 hover:text-gray-900"
                >
                  <ChevronRight className="h-3 w-3" />
                  All Drafts
                </button>
              </header>
              <div className="mt-4 space-y-2">
                {draftLoading ? (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading drafts…
                  </div>
                ) : drafts.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-5 text-center text-sm text-gray-500">
                    No demand drafts yet. Generate one from the payment plan.
                  </div>
                ) : (
                  drafts.map((draft) => {
                    const statusStyle: Record<string, string> = {
                      DRAFT: 'bg-gray-100 text-gray-600',
                      READY: 'bg-blue-100 text-blue-700',
                      SENT: 'bg-emerald-100 text-emerald-700',
                    };
                    return (
                      <div
                        key={draft.id}
                        className="flex items-center justify-between rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => router.push(`/demand-drafts/${draft.id}`)}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-gray-900">
                            {(draft as any).title || (draft as any).milestoneId || 'Demand Draft'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatCurrency(draft.amount ?? 0)}
                            {draft.dueDate ? ` · Due ${new Date(draft.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}` : ''}
                          </p>
                        </div>
                        <div className="ml-3 flex items-center gap-2 flex-shrink-0">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusStyle[draft.status] ?? 'bg-gray-100 text-gray-600'}`}>
                            {draft.status}
                          </span>
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </section>

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

          </div>
        </div>
      ) : null}
    </div>
  );
}

// ── Inline document row with upload ────────────────────────────────────────
function DocRow({
  label,
  docs,
  uploading,
  onUpload,
  onDelete,
}: {
  label: string;
  category: DocumentCategory;
  docs: ErpDocument[];
  uploading: boolean;
  onUpload: (file: File) => void;
  onDelete: (docId: string) => Promise<void>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const matching = docs.filter((d) => d.name === label);

  return (
    <div className="flex items-start justify-between gap-3 py-3">
      <div className="flex min-w-0 flex-1 items-start gap-2">
        {matching.length > 0 ? (
          <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" />
        ) : (
          <div className="mt-0.5 h-4 w-4 flex-shrink-0 rounded-full border-2 border-gray-300" />
        )}
        <div className="min-w-0">
          <span className="text-sm font-medium text-gray-800">{label}</span>
          {matching.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-2">
              {matching.map((doc) => (
                <div key={doc.id} className="flex items-center gap-1">
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
                  >
                    <ExternalLink className="h-3 w-3" />
                    {doc.fileName || 'View file'}
                  </a>
                  <button
                    onClick={() => onDelete(doc.id)}
                    className="text-xs text-red-400 hover:text-red-600 ml-1"
                    title="Remove"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-shrink-0 items-center gap-2">
        {matching.length === 0 && (
          <span className="text-xs text-gray-400">Not uploaded</span>
        )}
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onUpload(f);
            e.target.value = '';
          }}
        />
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-600 hover:border-gray-300 hover:text-gray-900 disabled:opacity-50"
        >
          {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
          {matching.length > 0 ? 'Replace' : 'Upload'}
        </button>
      </div>
    </div>
  );
}

// ── Other documents upload ──────────────────────────────────────────────────
function DocUploadOther({
  docs,
  uploading,
  onUpload,
  onDelete,
}: {
  flatId: string;
  customerId?: string;
  bookingId?: string;
  docs: ErpDocument[];
  uploading: boolean;
  onUpload: (file: File, name: string) => Promise<void>;
  onDelete: (docId: string) => Promise<void>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [docName, setDocName] = useState('');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setPendingFile(f);
      setDocName(f.name.replace(/\.[^.]+$/, ''));
    }
    e.target.value = '';
  };

  const handleConfirm = async () => {
    if (!pendingFile || !docName.trim()) return;
    await onUpload(pendingFile, docName.trim());
    setPendingFile(null);
    setDocName('');
  };

  return (
    <div className="space-y-3">
      {docs.map((doc) => (
        <div key={doc.id} className="flex items-center justify-between text-sm">
          <a
            href={doc.fileUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-blue-600 hover:underline"
          >
            <FileText className="h-3.5 w-3.5" />
            {doc.name || doc.fileName}
          </a>
          <button
            onClick={() => onDelete(doc.id)}
            className="text-xs text-red-400 hover:text-red-600"
          >
            Remove
          </button>
        </div>
      ))}
      {pendingFile ? (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={docName}
            onChange={(e) => setDocName(e.target.value)}
            placeholder="Document name…"
            className="flex-1 rounded-lg border px-3 py-1.5 text-sm"
          />
          <button
            onClick={handleConfirm}
            disabled={uploading || !docName.trim()}
            className="rounded-full bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
          >
            {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Save'}
          </button>
          <button
            onClick={() => { setPendingFile(null); setDocName(''); }}
            className="rounded-full border px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      ) : (
        <>
          <input ref={inputRef} type="file" className="hidden" onChange={handleFileSelect} />
          <button
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-full border border-dashed border-gray-300 px-4 py-2 text-xs font-semibold text-gray-500 hover:border-gray-400 hover:text-gray-700"
          >
            <Upload className="h-3.5 w-3.5" />
            Upload Other Document
          </button>
        </>
      )}
    </div>
  );
}

// ── Detail helpers ──────────────────────────────────────────────────────────
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
          value ?? '-'
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
            {amount !== undefined && amount !== null ? formatCurrency(amount) : '-'}
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

function buildFlatLabel(flat?: Flat | null) {
  if (!flat) return '';
  const block = flat?.tower?.name ? `Block ${flat.tower.name}` : '';
  const flatNo = flat.flatNumber ? `Flat No-${flat.flatNumber}` : '';
  const property = flat.property?.name ? `in ${flat.property.name}` : '';
  return [block, flatNo, property].filter(Boolean).join(', ');
}

function formatAmountInWords(amount: number) {
  const formatted = Number(amount || 0).toLocaleString('en-IN');
  return `Rupees ${formatted} only`;
}

function buildDraftContent(fields: any) {
  const {
    customerName = 'Customer',
    spouseName = 'Spouse',
    customerAddress = '-',
    milestoneId = 'Construction milestone',
    flatLabel = 'Flat',
    bhk = '-',
    amount = 0,
    amountWords = '',
    reference = 'EECD/DEMAND/REF',
    date = new Date().toLocaleDateString('en-GB'),
    place = '-',
    bankAccountHolder = 'Eastern Estate Construction & Developer’s Pvt. Ltd.',
    bankAccountNumber = 'XXXXXXXXXXXX',
    bankIfsc = 'SBINXXXXXXX',
  } = fields;

  const amountFormatted = amount ? `₹${Number(amount).toLocaleString('en-IN')}` : '₹0';
  const amountWordsFinal = amountWords || 'Amount in words here';

  return `To,
${customerName}
W/O ${spouseName}
${customerAddress}

Subject: Release of ${milestoneId} of payment in respect of ${customerName}.
as per agreement (under construction to the extent of ${milestoneId} )
i.e ${amountFormatted} (${amountWordsFinal}).

Dear Sir/Madam,
In respect of the above we would like to mention that construction work in respect of ${flatLabel} allotted to ${customerName},
is under construction to the extent of ${milestoneId}. In terms of
the above mentioned agreement payment upto ${milestoneId} fallen due
as per details here under:-
Flat: ${flatLabel}
BHK Type: ${bhk}
Demand Amount details as per construction mentioned below:-
Demand amount against construction
${milestoneId}
Total
${amountFormatted}

You are requested to release the above amount to DD/NEFT/RTGS as per our bank details given
below.
Account Holder : ${bankAccountHolder}
Account Number : ${bankAccountNumber}
IFSC : ${bankIfsc}
Date: - ${date}

Place: - ${place}

Thanking You

Yours Faithfully
Eastern Estate Construction & Developer’s Pvt. Ltd.
www.eecd.in
Ref. ${reference}                                                                                            DATE-${date}
`;
}
