/**
 * @file sales/follow-ups/new/page.tsx
 * @description Create follow-up entry for a lead
 */

'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { followupsService } from '@/services/followups.service';
import { leadsService, Lead } from '@/services/leads.service';
import { FollowUpOutcome, FollowUpType } from '@/types/sales-crm.types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { brandGradient, brandPalette } from '@/utils/brand';
import { Loader2, ArrowLeft, Phone } from 'lucide-react';

type FormState = {
  leadId: string;
  followUpType: FollowUpType;
  outcome: FollowUpOutcome;
  followUpDate: string;
  followUpTime: string;
  feedback: string;
  customerResponse: string;
  nextFollowUpDate: string;
  nextFollowUpTime: string;
  nextFollowUpPlan: string;
};

const defaultFormState: FormState = {
  leadId: '',
  followUpType: FollowUpType.CALL,
  outcome: FollowUpOutcome.INTERESTED,
  followUpDate: new Date().toISOString().slice(0, 10),
  followUpTime: new Date().toISOString().slice(11, 16),
  feedback: '',
  customerResponse: '',
  nextFollowUpDate: '',
  nextFollowUpTime: '',
  nextFollowUpPlan: '',
};

export default function NewFollowUpPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [form, setForm] = useState<FormState>(defaultFormState);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadLeads = async () => {
      if (!user?.id) return;
      try {
        setLoadingLeads(true);
        const data = await leadsService.getMyLeads(user.id);
        setLeads(data ?? []);
        if (data && data.length > 0) {
          setForm((prev) => ({ ...prev, leadId: prev.leadId || data[0].id }));
        }
      } catch (err) {
        console.error('Error loading leads:', err);
        setError('Could not fetch your assigned leads. Please try again.');
      } finally {
        setLoadingLeads(false);
      }
    };
    loadLeads();
  }, [user?.id]);

  const canSubmit = useMemo(() => {
    return Boolean(
      form.leadId &&
        form.followUpDate &&
        form.followUpType &&
        form.outcome &&
        form.feedback.trim().length > 0
    );
  }, [form]);

  const handleChange = (
    field: keyof FormState,
    value: string
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
    setError(null);
    setSuccessMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user?.id || !canSubmit) return;

    setSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const followUpDateTime = new Date(`${form.followUpDate}T${form.followUpTime || '09:00'}`);
      const nextFollowUpDateTime =
        form.nextFollowUpDate && form.nextFollowUpTime
          ? new Date(`${form.nextFollowUpDate}T${form.nextFollowUpTime}`)
          : form.nextFollowUpDate
          ? new Date(form.nextFollowUpDate)
          : null;

      await followupsService.create({
        leadId: form.leadId,
        performedBy: user.id,
        followUpDate: followUpDateTime.toISOString(),
        followUpType: form.followUpType,
        outcome: form.outcome,
        feedback: form.feedback,
        customerResponse: form.customerResponse || undefined,
        nextFollowUpDate: nextFollowUpDateTime?.toISOString(),
        nextFollowUpPlan: form.nextFollowUpPlan || undefined,
      });

      setSuccessMessage('Follow-up logged successfully.');
      setTimeout(() => {
        router.push('/sales/follow-ups');
      }, 800);
    } catch (err: any) {
      console.error('Failed to create follow-up:', err);
      setError(err?.response?.data?.message || 'Failed to save follow-up. Please retry.');
      setSubmitting(false);
    }
  };

  if (isLoading || (loadingLeads && !user)) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-[#A8211B]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen space-y-6 bg-[#F9F7F3] px-4 py-8 md:px-10">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center gap-3 text-sm text-[#7B1E12]">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="rounded-full border-[#A8211B]/30 text-[#A8211B]"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <span>Sales Console / Follow-ups / New</span>
        </div>

        <Card className="border-none shadow-lg">
          <CardHeader
            className="rounded-t-3xl bg-gradient-to-r from-[#A8211B] to-[#7B1E12] px-6 py-8 text-white"
          >
            <CardTitle className="text-2xl font-semibold">
              Log a follow-up
            </CardTitle>
            <CardDescription className="text-white/70">
              Keep conversations documented and plan the next action before the lead goes cold.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 px-6 py-8">
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}
            {successMessage && (
              <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                {successMessage}
              </div>
            )}

            {leads.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#A8211B]/20 bg-white px-6 py-10 text-center">
                <p className="text-lg font-semibold text-[#7B1E12]">
                  No leads assigned yet
                </p>
                <p className="mt-2 text-sm text-gray-600">
                  Capture or assign a lead before logging follow-ups.
                </p>
                <div className="mt-4 flex justify-center gap-3">
                  <Button
                    onClick={() => router.push('/leads/new')}
                    className="rounded-full bg-[#A8211B] px-6 py-2 text-white hover:bg-[#921c16]"
                  >
                    Create Lead
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push('/leads')}
                    className="rounded-full border-[#A8211B]/40 text-[#A8211B]"
                  >
                    View Leads
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">
                      Lead
                    </label>
                    <Select
                      value={form.leadId}
                      onValueChange={(value) => handleChange('leadId', value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select lead" />
                      </SelectTrigger>
                      <SelectContent>
                        {leads.map((lead) => (
                          <SelectItem key={lead.id} value={lead.id}>
                            <span className="flex flex-col">
                              <span className="font-medium">
                                {lead.firstName} {lead.lastName}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {lead.phone}
                              </span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">
                      Follow-up Type
                    </label>
                    <Select
                      value={form.followUpType}
                      onValueChange={(value) =>
                        handleChange('followUpType', value as FollowUpType)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(FollowUpType).map((type) => (
                          <SelectItem key={type} value={type}>
                            {type.replace(/_/g, ' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">
                      Outcome
                    </label>
                    <Select
                      value={form.outcome}
                      onValueChange={(value) =>
                        handleChange('outcome', value as FollowUpOutcome)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(FollowUpOutcome).map((outcome) => (
                          <SelectItem key={outcome} value={outcome}>
                            {outcome.replace(/_/g, ' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">
                        Follow-up Date
                      </label>
                      <Input
                        type="date"
                        value={form.followUpDate}
                        onChange={(e) => handleChange('followUpDate', e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">
                        Time
                      </label>
                      <Input
                        type="time"
                        value={form.followUpTime}
                        onChange={(e) => handleChange('followUpTime', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">
                    Notes from this interaction
                  </label>
                  <Textarea
                    value={form.feedback}
                    onChange={(e) => handleChange('feedback', e.target.value)}
                    rows={4}
                    placeholder="Summarise the conversation, objections, and next commitments."
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">
                    Customer response (optional)
                  </label>
                  <Textarea
                    value={form.customerResponse}
                    onChange={(e) => handleChange('customerResponse', e.target.value)}
                    rows={3}
                    placeholder="Capture exact words or key emotions shared by the customer."
                  />
                </div>

                <div className="rounded-2xl border border-dashed border-[#A8211B]/20 bg-white/80 p-5 shadow-inner">
                  <h3 className="text-sm font-semibold text-[#7B1E12]">
                    Schedule next action
                  </h3>
                  <p className="text-xs text-gray-500">
                    Set a reminder to stay proactive. Leave blank if no immediate follow-up is required.
                  </p>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                        Next follow-up date
                      </label>
                      <Input
                        type="date"
                        value={form.nextFollowUpDate}
                        onChange={(e) => handleChange('nextFollowUpDate', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                        Time
                      </label>
                      <Input
                        type="time"
                        value={form.nextFollowUpTime}
                        onChange={(e) => handleChange('nextFollowUpTime', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="mt-3 space-y-2">
                    <label className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                      Plan / reminder
                    </label>
                    <Textarea
                      value={form.nextFollowUpPlan}
                      onChange={(e) => handleChange('nextFollowUpPlan', e.target.value)}
                      rows={2}
                      placeholder="E.g. Share floor-plan PDF, confirm site visit slot, discuss loan processing."
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Phone className="h-4 w-4 text-gray-400" />
                    Save call logs within five minutes for accurate analytics.
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setForm(defaultFormState);
                        setSuccessMessage(null);
                        setError(null);
                      }}
                      className="rounded-full border-[#A8211B]/30 text-[#A8211B]"
                    >
                      Clear
                    </Button>
                    <Button
                      type="submit"
                      disabled={!canSubmit || submitting}
                      className="rounded-full px-6"
                      style={{ background: brandGradient, color: '#fff' }}
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Save Follow-up'
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        <div className="text-center text-xs text-gray-500">
          Eastern Estate ERP • Every interaction remembered.
        </div>

        <div className="text-center text-sm text-[#A8211B]">
          <Link href="/sales/follow-ups" className="hover:underline">
            Back to follow-ups
          </Link>
        </div>
      </div>
    </div>
  );
}
