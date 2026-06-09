'use client';

import React, { useEffect, useState } from 'react';
import { paymentsService } from '@/services/payments.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Info } from 'lucide-react';

interface CategoryTotals {
  demanded: number;
  collected: number;
  arrear: number;
  deferred: number;
}

interface TaggedTotal {
  label: string;
  amount: number;
}

interface BookingFinancialSummary {
  primary: CategoryTotals;
  misc: CategoryTotals;
  tax: CategoryTotals;
  total: CategoryTotals;
  totalTaxDeferred: number;
  miscTags?: TaggedTotal[];
  taxTags?: TaggedTotal[];
}

interface Props {
  bookingId: string;
  /** Compact single-row layout for list views (e.g. customer page multi-booking table). */
  compact?: boolean;
}

const fmt = (n: number) =>
  n.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

function CategoryRow({ label, data }: { label: string; data: CategoryTotals }) {
  return (
    <tr className="border-b last:border-0">
      <td className="py-2 pr-4 text-sm text-foreground whitespace-nowrap">{label}</td>
      <td className="py-2 px-3 text-right text-sm text-muted-foreground">₹{fmt(data.demanded)}</td>
      <td className="py-2 px-3 text-right text-sm text-foreground">₹{fmt(data.collected)}</td>
      <td className="py-2 pl-3 text-right text-sm font-medium">
        {data.arrear > 0 ? (
          <span className="text-destructive">₹{fmt(data.arrear)}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </td>
    </tr>
  );
}

export default function BookingFinancialSummaryPanel({ bookingId, compact }: Props) {
  const [summary, setSummary] = useState<BookingFinancialSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!bookingId) return;
    setLoading(true);
    setError(null);
    paymentsService
      .getFinancialSummary(bookingId)
      .then((data) => { setSummary(data); })
      .catch(() => {
        setError('Could not load payment summary.');
        setSummary(null);
      })
      .finally(() => setLoading(false));
  }, [bookingId]);

  if (error) {
    return (
      <div className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-2.5 text-xs text-destructive">
        {error}
      </div>
    );
  }

  if (loading) {
    if (compact) return <Skeleton className="h-4 w-full" />;
    return (
      <Card>
        <CardHeader className="pb-3 border-b">
          <Skeleton className="h-4 w-40" />
        </CardHeader>
        <CardContent className="pt-4 space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!summary) return null;

  const hasTaxDeferred = summary.totalTaxDeferred > 0;

  if (compact) {
    return (
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span>
          Primary: <span className="font-medium text-foreground">₹{fmt(summary.primary.collected)}</span>
          {summary.primary.arrear > 0 && (
            <span className="ml-1 text-destructive">(₹{fmt(summary.primary.arrear)} due)</span>
          )}
        </span>
        <span>
          Misc: <span className="font-medium text-foreground">₹{fmt(summary.misc.collected)}</span>
          {summary.misc.arrear > 0 && (
            <span className="ml-1 text-destructive">(₹{fmt(summary.misc.arrear)} due)</span>
          )}
        </span>
        <span>
          Tax: <span className="font-medium text-foreground">₹{fmt(summary.tax.collected)}</span>
          {hasTaxDeferred && (
            <span className="ml-1 text-primary">(₹{fmt(summary.totalTaxDeferred)} deferred)</span>
          )}
        </span>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="border-b pb-3 flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">Payment Summary</CardTitle>
        {hasTaxDeferred && (
          <Badge variant="secondary" className="gap-1 font-normal">
            <Info className="h-3 w-3" />
            ₹{fmt(summary.totalTaxDeferred)} Tax Deferred to Registry
          </Badge>
        )}
      </CardHeader>

      <CardContent className="pt-4">
        <table className="w-full">
          <thead>
            <tr className="text-xs text-muted-foreground">
              <th className="pb-2 text-left font-medium">Category</th>
              <th className="pb-2 text-right font-medium">Demanded</th>
              <th className="pb-2 text-right font-medium">Collected</th>
              <th className="pb-2 text-right font-medium">Arrear</th>
            </tr>
          </thead>
          <tbody>
            <CategoryRow label="Primary (Construction)" data={summary.primary} />
            <CategoryRow label="Miscellaneous" data={summary.misc} />
            <CategoryRow label="Tax (GST / Stamp Duty)" data={summary.tax} />
            <tr className="border-t-2 font-semibold">
              <td className="pt-2 pr-4 text-sm">Total</td>
              <td className="pt-2 px-3 text-right text-sm text-muted-foreground">₹{fmt(summary.total.demanded)}</td>
              <td className="pt-2 px-3 text-right text-sm">₹{fmt(summary.total.collected)}</td>
              <td className="pt-2 pl-3 text-right text-sm text-destructive">
                {summary.total.arrear > 0 ? `₹${fmt(summary.total.arrear)}` : '—'}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Tagged breakdown of what was collected under Misc / Tax */}
        {((summary.miscTags?.length ?? 0) > 0 || (summary.taxTags?.length ?? 0) > 0) && (
          <div className="mt-3 pt-3 border-t grid sm:grid-cols-2 gap-4">
            {(summary.miscTags?.length ?? 0) > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Miscellaneous collected — what it was</p>
                <ul className="space-y-0.5">
                  {summary.miscTags!.map((t) => (
                    <li key={t.label} className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{t.label}</span>
                      <span className="font-medium">₹{fmt(t.amount)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {(summary.taxTags?.length ?? 0) > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Tax collected — what it was</p>
                <ul className="space-y-0.5">
                  {summary.taxTags!.map((t) => (
                    <li key={t.label} className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{t.label}</span>
                      <span className="font-medium">₹{fmt(t.amount)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>

      {hasTaxDeferred && (
        <div className="mx-6 mb-2 rounded-md border bg-muted/40 px-4 py-2.5 text-xs text-muted-foreground leading-relaxed">
          <span className="font-medium text-foreground">Registry note:</span> ₹{fmt(summary.totalTaxDeferred)} in
          GST/tax has been deferred to registration time as agreed with the customer. It will be
          collected as a single registry payment at the time of property registration.
        </div>
      )}
    </Card>
  );
}
