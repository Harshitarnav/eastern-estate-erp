/**
 * @file sales/tasks/new/page.tsx
 * @description Quick-create sales task for personal scheduler
 */

'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { salesTasksService } from '@/services/sales-tasks.service';
import { leadsService, Lead } from '@/services/leads.service';
import {
  TaskPriority,
  TaskStatus,
  TaskType,
} from '@/types/sales-crm.types';
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
import { Loader2, ArrowLeft, Calendar, Clock, MapPin } from 'lucide-react';

type TaskFormState = {
  title: string;
  taskType: TaskType;
  priority: TaskPriority;
  dueDate: string;
  dueTime: string;
  leadId: string;
  location: string;
  notes: string;
};

const defaultTaskForm: TaskFormState = {
  title: '',
  taskType: TaskType.FOLLOWUP_CALL,
  priority: TaskPriority.MEDIUM,
  dueDate: new Date().toISOString().slice(0, 10),
  dueTime: '10:00',
  leadId: '',
  location: '',
  notes: '',
};

export default function NewTaskPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [form, setForm] = useState<TaskFormState>(defaultTaskForm);
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
        setError('Unable to fetch assigned leads. Please retry.');
      } finally {
        setLoadingLeads(false);
      }
    };
    loadLeads();
  }, [user?.id]);

  const canSubmit = useMemo(() => {
    return Boolean(
      form.title.trim().length > 2 &&
        form.dueDate &&
        form.taskType &&
        form.priority
    );
  }, [form]);

  const handleChange = (field: keyof TaskFormState, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
    setError(null);
    setSuccessMessage(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user?.id || !canSubmit) return;

    setSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const dueDateTime = new Date(`${form.dueDate}T${form.dueTime || '10:00'}`);

      await salesTasksService.create({
        title: form.title,
        taskType: form.taskType,
        assignedTo: user.id,
        assignedBy: user.id,
        priority: form.priority,
        status: TaskStatus.PENDING,
        dueDate: dueDateTime.toISOString(),
        estimatedDurationMinutes: 30,
        leadId: form.leadId || undefined,
        location: form.location || undefined,
        notes: form.notes || undefined,
        createdBy: user.id,
      });

      setSuccessMessage('Task created successfully.');
      setTimeout(() => {
        router.push('/sales/tasks');
      }, 800);
    } catch (err: any) {
      console.error('Failed to create task:', err);
      setError(err?.response?.data?.message || 'Could not save task. Please try again.');
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
          <span>Sales Console / Tasks / New</span>
        </div>

        <Card className="border-none shadow-lg">
          <CardHeader
            className="rounded-t-3xl bg-gradient-to-r from-[#A8211B] to-[#7B1E12] px-6 py-8 text-white"
          >
            <CardTitle className="text-2xl font-semibold">
              Schedule a task
            </CardTitle>
            <CardDescription className="text-white/70">
              Block time for follow-ups, meetings, and site visits so nothing falls through the cracks.
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

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                  Task title
                </label>
                <Input
                  value={form.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="E.g. Call Mr Rao with revised payment schedule"
                  required
                />
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">
                    Task type
                  </label>
                  <Select
                    value={form.taskType}
                    onValueChange={(value) =>
                      handleChange('taskType', value as TaskType)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(TaskType).map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.replace(/_/g, ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">
                    Priority
                  </label>
                  <Select
                    value={form.priority}
                    onValueChange={(value) =>
                      handleChange('priority', value as TaskPriority)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(TaskPriority).map((priority) => (
                        <SelectItem key={priority} value={priority}>
                          {priority}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    Due date
                  </label>
                  <Input
                    type="date"
                    value={form.dueDate}
                    onChange={(e) => handleChange('dueDate', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    Time
                  </label>
                  <Input
                    type="time"
                    value={form.dueTime}
                    onChange={(e) => handleChange('dueTime', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                  Link to a lead (optional)
                </label>
                <Select
                  value={form.leadId}
                  onValueChange={(value) => handleChange('leadId', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select assigned lead (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No lead</SelectItem>
                    {leads.map((lead) => (
                      <SelectItem key={lead.id} value={lead.id}>
                        <span className="flex flex-col">
                          <span className="font-medium">
                            {lead.firstName} {lead.lastName}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {lead.status?.replace(/_/g, ' ')} • {lead.phone}
                          </span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.leadId && (
                  <p className="text-xs text-gray-500">
                    Need context?{' '}
                    <Link href={`/leads/${form.leadId}`} className="text-[#A8211B] underline-offset-2 hover:underline">
                      View lead profile
                    </Link>
                  </p>
                )}
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    Location / Meeting link
                  </label>
                  <Input
                    value={form.location}
                    onChange={(e) => handleChange('location', e.target.value)}
                    placeholder="E.g. Eastern Estate Experience Centre / Zoom"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">
                    Notes for reminder (optional)
                  </label>
                  <Textarea
                    value={form.notes}
                    onChange={(e) => handleChange('notes', e.target.value)}
                    rows={3}
                    placeholder="Prep message, documents to carry, agenda, etc."
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-gray-500">
                  Tasks auto-sync with your dashboard and reminders.
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setForm(defaultTaskForm);
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
                    className="rounded-full px-6 text-white"
                    style={{ background: brandGradient }}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Task'
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="text-center text-xs text-gray-500">
          Eastern Estate ERP • Plan the day, celebrate the close.
        </div>
      </div>
    </div>
  );
}
