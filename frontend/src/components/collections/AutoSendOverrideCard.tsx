'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { customersService } from '@/services/customers.service';
import { propertiesService } from '@/services/properties.service';

/**
 * Small tri-state override control that writes
 * `autoSendMilestoneDemandDrafts` (null | true | false) on either a
 * customer or a property record.
 *
 * The three layers (customer > property > company_settings) together
 * determine whether a milestone-triggered DD is created as SENT or
 * DRAFT-for-review. This card exposes the *per-record* layer so a user
 * can carve out exceptions without touching the company-wide default.
 */
type Subject = 'customer' | 'property';

interface Props {
  subject: Subject;
  recordId: string;
  // Current stored value. `undefined` is treated the same as `null` (inherit).
  value: boolean | null | undefined;
  // Optional palette for the customer page, which themes everything.
  brandPrimary?: string;
  brandSecondary?: string;
  brandNeutral?: string;
  // Called with the saved value after a successful write so the parent
  // can update its copy without a full reload.
  onSaved?: (next: boolean | null) => void;
}

type TriState = 'inherit' | 'always' | 'never';

const toTri = (v: boolean | null | undefined): TriState => {
  if (v === true) return 'always';
  if (v === false) return 'never';
  return 'inherit';
};

const fromTri = (t: TriState): boolean | null => {
  if (t === 'always') return true;
  if (t === 'never') return false;
  return null;
};

export function AutoSendOverrideCard({
  subject,
  recordId,
  value,
  brandPrimary,
  brandSecondary,
  brandNeutral,
  onSaved,
}: Props) {
  const [pending, setPending] = useState<TriState | null>(null);
  const [current, setCurrent] = useState<boolean | null>(
    value === undefined ? null : value,
  );

  const save = async (next: TriState) => {
    const prev = current;
    const nextVal = fromTri(next);
    setPending(next);
    setCurrent(nextVal);
    try {
      if (subject === 'customer') {
        await customersService.updateCustomer(recordId, {
          autoSendMilestoneDemandDrafts: nextVal,
        } as any);
      } else {
        await propertiesService.updateProperty(recordId, {
          autoSendMilestoneDemandDrafts: nextVal,
        } as any);
      }
      onSaved?.(nextVal);
      const noun = subject === 'customer' ? 'customer' : 'project';
      toast.success(
        next === 'inherit'
          ? `Now inheriting auto-send for this ${noun}`
          : next === 'always'
            ? `Auto-send enabled for this ${noun}`
            : `Review required for this ${noun}`,
      );
    } catch (err: any) {
      setCurrent(prev);
      toast.error(
        err?.response?.data?.message || 'Failed to update auto-send override',
      );
    } finally {
      setPending(null);
    }
  };

  const tri = toTri(current);
  const noun = subject === 'customer' ? 'customer' : 'project';
  const inheritLabel =
    subject === 'customer'
      ? 'Inherit from project / company default'
      : 'Inherit from company default';

  // Minimal style so the card fits both the brand-heavy customer page
  // and the simpler property page. Brand colors are used only when
  // supplied.
  const accent = brandPrimary ?? '#A8211B';
  const subtle = brandNeutral ? `${brandNeutral}60` : '#e5e7eb';

  return (
    <div
      className="bg-white rounded-2xl border p-6"
      style={{ borderColor: subtle }}
    >
      <h2
        className="text-xl font-semibold mb-1"
        style={{ color: brandSecondary ?? '#111' }}
      >
        Demand Draft Auto-Send
      </h2>
      <p className="text-sm text-gray-600 mb-4">
        Controls whether new milestone demand drafts for this {noun} go out
        automatically or require a human to click Send Now from the
        Collections Workstation.
      </p>

      <div className="space-y-2">
        {(
          [
            {
              key: 'inherit' as const,
              label: inheritLabel,
              hint: 'Safest default. Falls back through the precedence chain.',
            },
            {
              key: 'always' as const,
              label: 'Always auto-send (skip review)',
              hint: 'DDs email the customer immediately on creation.',
            },
            {
              key: 'never' as const,
              label: 'Always require human review',
              hint: 'DDs land as DRAFT in Collections; nothing leaves until approved.',
            },
          ] as const
        ).map((opt) => {
          const selected = tri === opt.key;
          const loading = pending === opt.key;
          return (
            <label
              key={opt.key}
              className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                selected
                  ? 'bg-red-50'
                  : 'hover:bg-gray-50 border-gray-200'
              }`}
              style={selected ? { borderColor: accent } : undefined}
            >
              <input
                type="radio"
                name={`auto-send-${subject}-${recordId}`}
                className="mt-0.5"
                checked={selected}
                disabled={!!pending}
                onChange={() => save(opt.key)}
                style={{ accentColor: accent }}
              />
              <div className="flex-1">
                <div
                  className="text-sm font-medium flex items-center gap-2"
                  style={{ color: selected ? accent : '#111' }}
                >
                  {opt.label}
                  {loading && <Loader2 className="h-3 w-3 animate-spin" />}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">{opt.hint}</div>
              </div>
            </label>
          );
        })}
      </div>

      <p className="text-[11px] text-gray-400 mt-3">
        Precedence: customer override &gt; project override &gt; company
        default. &quot;Inherit&quot; here means this {noun} contributes no
        opinion and the next layer decides.
      </p>
    </div>
  );
}
