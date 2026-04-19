'use client';

import { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2, Info, Sparkles, PencilLine, SkipForward } from 'lucide-react';
import {
  paymentPlansService,
  type PaymentPlanTemplate,
} from '@/services/payment-plans.service';

/* ──────────────────────────────────────────────────────────────────────────
 *  Types
 * ────────────────────────────────────────────────────────────────────────── */

export type PlanMode = 'template' | 'template-edit' | 'custom' | 'skip';

export interface PlanMilestoneInput {
  sequence: number;
  name: string;
  constructionPhase?: 'FOUNDATION' | 'STRUCTURE' | 'MEP' | 'FINISHING' | 'HANDOVER' | null;
  phasePercentage?: number | null;
  /** User-entered percentage (0-100) */
  paymentPercentage: number;
  description?: string;
}

export interface PlanPayload {
  mode: 'template' | 'template-edit' | 'custom';
  templateId?: string;
  milestones?: PlanMilestoneInput[];
}

export interface BookingPaymentPlanStepValue {
  mode: PlanMode;
  payload?: PlanPayload;
  /** Local representation used for the milestone preview table */
  milestones: PlanMilestoneInput[];
  templateId?: string;
}

interface Props {
  totalAmount: number;
  value: BookingPaymentPlanStepValue;
  onChange: (v: BookingPaymentPlanStepValue) => void;
}

/* ──────────────────────────────────────────────────────────────────────────
 *  Helpers
 * ────────────────────────────────────────────────────────────────────────── */

const fmtINR = (n: number) =>
  Number.isFinite(n) ? `₹${Math.round(n).toLocaleString('en-IN')}` : '-';

const emptyMilestone = (sequence: number): PlanMilestoneInput => ({
  sequence,
  name: '',
  constructionPhase: null,
  phasePercentage: null,
  paymentPercentage: 0,
  description: '',
});

const templateToMilestones = (t: PaymentPlanTemplate): PlanMilestoneInput[] =>
  t.milestones.map((m) => ({
    sequence: m.sequence,
    name: m.name,
    constructionPhase: m.constructionPhase ?? null,
    phasePercentage: m.phasePercentage ?? null,
    paymentPercentage: m.paymentPercentage,
    description: m.description,
  }));

/* ──────────────────────────────────────────────────────────────────────────
 *  Component
 * ────────────────────────────────────────────────────────────────────────── */

export default function BookingPaymentPlanStep({ totalAmount, value, onChange }: Props) {
  const [templates, setTemplates] = useState<PaymentPlanTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const list = await paymentPlansService.getPaymentPlanTemplates(true);
        setTemplates(list);
      } catch (err) {
        console.error('Failed to load payment plan templates:', err);
      } finally {
        setLoadingTemplates(false);
      }
    })();
  }, []);

  // Auto-select the first template when templates load and user is in template mode without a pick yet.
  useEffect(() => {
    if (loadingTemplates) return;
    if (templates.length === 0) return;
    if ((value.mode === 'template' || value.mode === 'template-edit') && !value.templateId) {
      const tpl = templates.find((t) => t.isDefault) ?? templates[0];
      const ms = templateToMilestones(tpl);
      onChange({
        mode: value.mode,
        templateId: tpl.id,
        milestones: ms,
        payload:
          value.mode === 'template'
            ? { mode: 'template', templateId: tpl.id }
            : { mode: 'template-edit', templateId: tpl.id, milestones: ms },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingTemplates, templates]);

  const totalPct = useMemo(
    () => value.milestones.reduce((s, m) => s + Number(m.paymentPercentage || 0), 0),
    [value.milestones],
  );
  const totalAmt = useMemo(
    () => value.milestones.reduce((s, m) => s + (totalAmount * Number(m.paymentPercentage || 0)) / 100, 0),
    [value.milestones, totalAmount],
  );
  const pctValid = Math.abs(totalPct - 100) < 0.5;

  /* ──────────── Mode switching ──────────── */

  const setMode = (mode: PlanMode) => {
    if (mode === 'skip') {
      onChange({ mode, milestones: [], payload: undefined, templateId: undefined });
      return;
    }

    if (mode === 'template') {
      const tpl = templates.find((t) => t.id === value.templateId) ?? templates[0];
      if (!tpl) {
        onChange({ mode, milestones: [], payload: undefined, templateId: undefined });
        return;
      }
      const ms = templateToMilestones(tpl);
      onChange({
        mode,
        templateId: tpl.id,
        milestones: ms,
        payload: { mode: 'template', templateId: tpl.id },
      });
      return;
    }

    if (mode === 'template-edit') {
      const tpl = templates.find((t) => t.id === value.templateId) ?? templates[0];
      const ms = tpl ? templateToMilestones(tpl) : (value.milestones.length ? value.milestones : [emptyMilestone(1)]);
      onChange({
        mode,
        templateId: tpl?.id,
        milestones: ms,
        payload: { mode: 'template-edit', templateId: tpl?.id, milestones: ms },
      });
      return;
    }

    // custom
    const ms = value.milestones.length
      ? value.milestones
      : [
          { ...emptyMilestone(1), name: 'Booking / Token', paymentPercentage: 10 },
          { ...emptyMilestone(2), name: 'On Agreement', paymentPercentage: 20 },
          { ...emptyMilestone(3), name: 'On Possession', paymentPercentage: 70 },
        ];
    onChange({
      mode,
      templateId: undefined,
      milestones: ms,
      payload: { mode: 'custom', milestones: ms },
    });
  };

  /* ──────────── Template picking ──────────── */

  const pickTemplate = (templateId: string) => {
    const tpl = templates.find((t) => t.id === templateId);
    if (!tpl) return;
    const ms = templateToMilestones(tpl);
    if (value.mode === 'template') {
      onChange({
        mode: 'template',
        templateId: tpl.id,
        milestones: ms,
        payload: { mode: 'template', templateId: tpl.id },
      });
    } else {
      // template-edit
      onChange({
        mode: 'template-edit',
        templateId: tpl.id,
        milestones: ms,
        payload: { mode: 'template-edit', templateId: tpl.id, milestones: ms },
      });
    }
  };

  /* ──────────── Milestone editing (template-edit / custom) ──────────── */

  const updateMilestone = (idx: number, patch: Partial<PlanMilestoneInput>) => {
    const next = value.milestones.map((m, i) => (i === idx ? { ...m, ...patch } : m));
    const payloadMode = value.mode === 'template-edit' ? 'template-edit' : 'custom';
    onChange({
      ...value,
      milestones: next,
      payload: {
        mode: payloadMode,
        templateId: payloadMode === 'template-edit' ? value.templateId : undefined,
        milestones: next,
      },
    });
  };

  const addMilestone = () => {
    const next = [...value.milestones, emptyMilestone(value.milestones.length + 1)];
    const payloadMode = value.mode === 'template-edit' ? 'template-edit' : 'custom';
    onChange({
      ...value,
      milestones: next,
      payload: {
        mode: payloadMode,
        templateId: payloadMode === 'template-edit' ? value.templateId : undefined,
        milestones: next,
      },
    });
  };

  const removeMilestone = (idx: number) => {
    const next = value.milestones
      .filter((_, i) => i !== idx)
      .map((m, i) => ({ ...m, sequence: i + 1 }));
    const payloadMode = value.mode === 'template-edit' ? 'template-edit' : 'custom';
    onChange({
      ...value,
      milestones: next,
      payload: {
        mode: payloadMode,
        templateId: payloadMode === 'template-edit' ? value.templateId : undefined,
        milestones: next,
      },
    });
  };

  /* ──────────── Render ──────────── */

  const ModeButton = ({
    mode,
    icon: Icon,
    title,
    hint,
  }: {
    mode: PlanMode;
    icon: any;
    title: string;
    hint: string;
  }) => {
    const active = value.mode === mode;
    return (
      <button
        type="button"
        onClick={() => setMode(mode)}
        className={`flex-1 text-left border rounded-lg p-3 transition-colors ${
          active
            ? 'border-[#A8211B] bg-[#FFF5F4] ring-1 ring-[#A8211B]'
            : 'border-gray-200 hover:border-gray-300 bg-white'
        }`}
      >
        <div className="flex items-center gap-2">
          <Icon className={`h-4 w-4 ${active ? 'text-[#A8211B]' : 'text-gray-500'}`} />
          <span className={`font-semibold text-sm ${active ? 'text-[#A8211B]' : 'text-gray-800'}`}>
            {title}
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-1">{hint}</p>
      </button>
    );
  };

  const editable = value.mode === 'template-edit' || value.mode === 'custom';
  const showMilestones = value.mode !== 'skip' && value.milestones.length > 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold" style={{ color: '#7B1E12' }}>
            Payment Plan
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Choose how the balance of{' '}
            <span className="font-medium text-gray-700">{fmtINR(totalAmount)}</span>{' '}
            will be split into milestones.
          </p>
        </div>
      </div>

      {/* Mode buttons */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-4">
        <ModeButton
          mode="template"
          icon={Sparkles}
          title="Use a template"
          hint="Pick a saved plan, no edits"
        />
        <ModeButton
          mode="template-edit"
          icon={PencilLine}
          title="Template + edit"
          hint="Start from a template, tweak lines"
        />
        <ModeButton
          mode="custom"
          icon={Plus}
          title="Build custom"
          hint="Define milestones from scratch"
        />
        <ModeButton
          mode="skip"
          icon={SkipForward}
          title="Skip for now"
          hint="Attach a plan later"
        />
      </div>

      {/* Template picker */}
      {(value.mode === 'template' || value.mode === 'template-edit') && (
        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
            Template
          </label>
          {loadingTemplates ? (
            <div className="text-sm text-gray-500">Loading templates…</div>
          ) : templates.length === 0 ? (
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-md px-3 py-2 text-sm text-amber-800">
              <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>
                No payment plan templates yet. Create one from{' '}
                <span className="font-medium">Payment Plans → Templates</span>, or use
                "Build custom" / "Skip for now".
              </span>
            </div>
          ) : (
            <select
              value={value.templateId || ''}
              onChange={(e) => pickTemplate(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#A8211B]/50"
            >
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} - {t.type.replace(/_/g, ' ')} ({t.milestones.length} milestones)
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      {/* Skip notice */}
      {value.mode === 'skip' && (
        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-md px-3 py-3 text-sm text-amber-800">
          <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>
            The booking will be created without a payment plan. It will show a{' '}
            <span className="font-medium">"Plan missing"</span> flag in the bookings list so
            you can attach one later from the booking detail page.
          </span>
        </div>
      )}

      {/* Milestones preview / editor */}
      {showMilestones && (
        <>
          <div className="overflow-x-auto border border-gray-200 rounded-md">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                  <th className="p-2 w-10 font-medium">#</th>
                  <th className="p-2 font-medium">Milestone</th>
                  <th className="p-2 w-40 font-medium hidden md:table-cell">Construction phase</th>
                  <th className="p-2 w-24 text-right font-medium">%</th>
                  <th className="p-2 w-36 text-right font-medium">Amount</th>
                  {editable && <th className="p-2 w-10" />}
                </tr>
              </thead>
              <tbody>
                {value.milestones.map((m, idx) => {
                  const amt = (totalAmount * Number(m.paymentPercentage || 0)) / 100;
                  return (
                    <tr key={idx} className="border-t border-gray-100">
                      <td className="p-2 text-gray-500">{idx + 1}</td>
                      <td className="p-2">
                        {editable ? (
                          <input
                            type="text"
                            value={m.name}
                            onChange={(e) => updateMilestone(idx, { name: e.target.value })}
                            placeholder="e.g. On foundation completion"
                            className="w-full rounded border border-gray-200 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#A8211B]/40"
                          />
                        ) : (
                          <>
                            <div className="font-medium text-gray-800">{m.name}</div>
                            {m.description && (
                              <div className="text-xs text-gray-500">{m.description}</div>
                            )}
                          </>
                        )}
                      </td>
                      <td className="p-2 hidden md:table-cell">
                        {editable ? (
                          <select
                            value={m.constructionPhase || ''}
                            onChange={(e) =>
                              updateMilestone(idx, {
                                constructionPhase: (e.target.value || null) as any,
                              })
                            }
                            className="w-full rounded border border-gray-200 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#A8211B]/40"
                          >
                            <option value="">- None -</option>
                            <option value="FOUNDATION">Foundation</option>
                            <option value="STRUCTURE">Structure</option>
                            <option value="MEP">MEP</option>
                            <option value="FINISHING">Finishing</option>
                            <option value="HANDOVER">Handover</option>
                          </select>
                        ) : (
                          <span className="text-xs text-gray-600">
                            {m.constructionPhase || '-'}
                          </span>
                        )}
                      </td>
                      <td className="p-2 text-right tabular-nums">
                        {editable ? (
                          <input
                            type="number"
                            min={0}
                            max={100}
                            step={0.5}
                            value={m.paymentPercentage}
                            onChange={(e) =>
                              updateMilestone(idx, {
                                paymentPercentage: Number(e.target.value) || 0,
                              })
                            }
                            className="w-20 text-right rounded border border-gray-200 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#A8211B]/40"
                          />
                        ) : (
                          <span>{(Number(m.paymentPercentage) || 0).toFixed(1)}%</span>
                        )}
                      </td>
                      <td className="p-2 text-right tabular-nums text-gray-700">{fmtINR(amt)}</td>
                      {editable && (
                        <td className="p-2 text-right">
                          <button
                            type="button"
                            onClick={() => removeMilestone(idx)}
                            className="text-gray-400 hover:text-red-600"
                            title="Remove milestone"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50 border-t-2 border-gray-200 font-semibold">
                  <td className="p-2" />
                  <td className="p-2">Total</td>
                  <td className="p-2 hidden md:table-cell" />
                  <td
                    className={`p-2 text-right tabular-nums ${
                      pctValid ? 'text-emerald-700' : 'text-red-600'
                    }`}
                  >
                    {totalPct.toFixed(1)}%
                  </td>
                  <td className="p-2 text-right tabular-nums">{fmtINR(totalAmt)}</td>
                  {editable && <td className="p-2" />}
                </tr>
              </tfoot>
            </table>
          </div>

          {editable && (
            <div className="mt-3 flex items-center justify-between">
              <button
                type="button"
                onClick={addMilestone}
                className="inline-flex items-center gap-1.5 text-sm text-[#A8211B] hover:underline"
              >
                <Plus className="h-4 w-4" /> Add milestone
              </button>
              {!pctValid && (
                <span className="text-xs text-red-600">
                  Percentages must add up to 100% (currently {totalPct.toFixed(1)}%).
                </span>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
