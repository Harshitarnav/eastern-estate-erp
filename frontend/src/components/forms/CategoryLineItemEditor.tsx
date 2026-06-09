'use client';

import React from 'react';
import { Plus, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export interface LineItem {
  label: string;
  amount: number;
}

interface Props {
  title: string;
  /** Short hint shown under the title, e.g. "Parking, lift, amenities…" */
  hint?: string;
  items: LineItem[];
  onChange: (items: LineItem[]) => void;
  /** Accent color class for the total, e.g. "text-orange-600". */
  accentClass?: string;
  /** When true, the editor is locked (e.g. tax deferred to registry). */
  disabled?: boolean;
  disabledNote?: string;
  /** Quick-add suggestion chips. */
  suggestions?: string[];
}

const numeric = (v: any): number => {
  const n = parseFloat(String(v ?? '').replace(/[, ]/g, ''));
  // Clamp to >= 0: a negative line-item would silently reduce the category
  // total and break the primary + misc + tax = amount invariant.
  return Number.isFinite(n) ? Math.max(0, n) : 0;
};

const fmt = (n: number) => n.toLocaleString('en-IN');

export default function CategoryLineItemEditor({
  title,
  hint,
  items,
  onChange,
  accentClass = 'text-foreground',
  disabled = false,
  disabledNote,
  suggestions = [],
}: Props) {
  const total = items.reduce((s, i) => s + numeric(i.amount), 0);

  const update = (idx: number, patch: Partial<LineItem>) => {
    const next = items.map((it, i) => (i === idx ? { ...it, ...patch } : it));
    onChange(next);
  };

  const add = (label = '') => onChange([...items, { label, amount: 0 }]);
  const remove = (idx: number) => onChange(items.filter((_, i) => i !== idx));

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm font-medium text-gray-900">{title}</p>
          {hint && <p className="text-xs text-gray-500">{hint}</p>}
        </div>
        <p className={`text-sm font-semibold ${accentClass}`}>₹{fmt(total)}</p>
      </div>

      {disabled ? (
        <p className="text-xs text-gray-500 rounded-md border border-gray-200 bg-white px-3 py-2">
          {disabledNote ?? 'Locked.'}
        </p>
      ) : (
        <>
          <div className="space-y-2">
            {items.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <Input
                  value={item.label}
                  onChange={(e) => update(idx, { label: e.target.value })}
                  placeholder="What is this? e.g. Covered parking"
                  className="flex-1"
                />
                <Input
                  type="number"
                  min={0}
                  value={item.amount || ''}
                  onChange={(e) => update(idx, { amount: numeric(e.target.value) })}
                  placeholder="0"
                  className="w-32 text-right"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => remove(idx)}
                  aria-label="Remove line item"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 flex-wrap mt-3">
            <Button type="button" variant="ghost" size="sm" className="text-[var(--eastern-red)] hover:text-[var(--eastern-red)] hover:bg-red-50" onClick={() => add()}>
              <Plus className="h-3.5 w-3.5" /> Add line item
            </Button>
            {suggestions.map((s) => (
              <Button
                key={s}
                type="button"
                variant="outline"
                size="sm"
                className="h-7 rounded-full text-xs text-gray-500 border-gray-300"
                onClick={() => add(s)}
              >
                <Plus className="h-3 w-3" /> {s}
              </Button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
