'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Save, Building2, CreditCard, Shield, Mail, Loader2,
  Info, ExternalLink, AlertTriangle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { settingsService, CompanySettings } from '@/services/settings.service';

const EMPTY: CompanySettings = {
  companyName: 'Eastern Estate',
  tagline: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
  phone: '',
  email: '',
  website: '',
  gstin: '',
  reraNumber: '',
  bankName: '',
  accountName: '',
  accountNumber: '',
  ifscCode: '',
  branch: '',
  upiId: '',
  smtpHost: '',
  smtpPort: 587,
  smtpUser: '',
  smtpPass: '',
  smtpFrom: '',
};

function Field({
  label, id, value, onChange, placeholder, type = 'text', hint,
}: {
  label: string; id: string; value: string | number; onChange: (v: string) => void;
  placeholder?: string; type?: string; hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function FallbackBanner({ onNavigate }: { onNavigate: () => void }) {
  return (
    <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
      <div className="space-y-1">
        <p className="font-semibold">These are fallback defaults only.</p>
        <p className="text-amber-800">
          Eastern Estate has a different GSTIN, RERA number, and bank account for each project.
          Set those details directly on each&nbsp;
          <button
            onClick={onNavigate}
            className="inline-flex items-center gap-0.5 font-medium underline underline-offset-2 hover:text-amber-950"
          >
            Property <ExternalLink className="h-3 w-3" />
          </button>
          .&nbsp;The values below are only used when a project has <em>not</em> filled in its own details.
        </p>
      </div>
    </div>
  );
}

function InfoBanner({ text }: { text: string }) {
  return (
    <div className="flex gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
      <p>{text}</p>
    </div>
  );
}

export default function CompanySettingsPage() {
  const router = useRouter();
  const [form, setForm] = useState<CompanySettings>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    settingsService.getCompanySettings()
      .then((data) => setForm({ ...EMPTY, ...data }))
      .catch(() => toast.error('Failed to load settings'))
      .finally(() => setLoading(false));
  }, []);

  const set = (key: keyof CompanySettings) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await settingsService.updateCompanySettings(form);
      toast.success('Settings saved successfully');
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Company Settings</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-xl">
            Global defaults for the organisation. The company name, address, and SMTP settings
            here apply across the entire ERP. GSTIN, RERA, and bank details should be set
            per-project on the&nbsp;
            <button
              onClick={() => router.push('/properties')}
              className="text-[#A8211B] underline underline-offset-2 hover:text-[#7B1E12]"
            >
              Properties page
            </button>
            ; the values below serve as a fallback only.
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="shrink-0 bg-[#A8211B] hover:bg-[#7B1E12]"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          Save Changes
        </Button>
      </div>

      {/* ── 1. Company Information ───────────────────────────────────── */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-[#A8211B]" />
            <CardTitle className="text-base">Company Information</CardTitle>
          </div>
          <CardDescription>
            Displayed in the letterhead of all demand drafts, money receipts, and emails.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="Company Name *" id="companyName" value={form.companyName} onChange={set('companyName')} placeholder="Eastern Estate" />
            <Field label="Tagline" id="tagline" value={form.tagline ?? ''} onChange={set('tagline')} placeholder="Construction & Development" />
            <div className="sm:col-span-2">
              <Field label="Registered Address" id="address" value={form.address ?? ''} onChange={set('address')} placeholder="123, MG Road" />
            </div>
            <Field label="City" id="city" value={form.city ?? ''} onChange={set('city')} placeholder="Lucknow" />
            <Field label="State" id="state" value={form.state ?? ''} onChange={set('state')} placeholder="Uttar Pradesh" />
            <Field label="Pincode" id="pincode" value={form.pincode ?? ''} onChange={set('pincode')} placeholder="226001" />
            <Field label="Phone" id="phone" value={form.phone ?? ''} onChange={set('phone')} placeholder="+91 9876543210" />
            <Field label="Email" id="email" value={form.email ?? ''} onChange={set('email')} placeholder="info@easternestate.in" type="email" />
            <Field label="Website" id="website" value={form.website ?? ''} onChange={set('website')} placeholder="https://easternestate.in" />
          </div>
        </CardContent>
      </Card>

      {/* ── 2. Tax & Legal (fallback) ─────────────────────────────────── */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-[#A8211B]" />
            <CardTitle className="text-base">Tax &amp; Legal — Fallback Defaults</CardTitle>
          </div>
          <CardDescription>
            Used on invoices and demand drafts <em>only</em> when the project has no project-specific GSTIN / RERA set.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <FallbackBanner onNavigate={() => router.push('/properties')} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field
              label="Company GSTIN (fallback)"
              id="gstin"
              value={form.gstin ?? ''}
              onChange={set('gstin')}
              placeholder="09AAAAA0000A1Z5"
              hint="15-character GST Identification Number"
            />
            <Field
              label="RERA Registration (fallback)"
              id="reraNumber"
              value={form.reraNumber ?? ''}
              onChange={set('reraNumber')}
              placeholder="UPRERAPRJ000000"
              hint="Set per-project on the Property page for accuracy"
            />
          </div>
        </CardContent>
      </Card>

      {/* ── 3. Bank Details (fallback) ────────────────────────────────── */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-[#A8211B]" />
            <CardTitle className="text-base">Bank Details — Fallback Defaults</CardTitle>
          </div>
          <CardDescription>
            Shown in demand drafts &amp; receipts <em>only</em> when the project has no project-specific bank account set.
            Existing drafts must be re-generated to pick up new values.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <FallbackBanner onNavigate={() => router.push('/properties')} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="Bank Name" id="bankName" value={form.bankName ?? ''} onChange={set('bankName')} placeholder="HDFC Bank" />
            <Field label="Account Name" id="accountName" value={form.accountName ?? ''} onChange={set('accountName')} placeholder="Eastern Estate Pvt Ltd" />
            <Field label="Account Number" id="accountNumber" value={form.accountNumber ?? ''} onChange={set('accountNumber')} placeholder="50100123456789" />
            <Field label="IFSC Code" id="ifscCode" value={form.ifscCode ?? ''} onChange={set('ifscCode')} placeholder="HDFC0001234" />
            <Field label="Branch" id="branch" value={form.branch ?? ''} onChange={set('branch')} placeholder="Hazratganj, Lucknow" />
            <Field label="UPI ID" id="upiId" value={form.upiId ?? ''} onChange={set('upiId')} placeholder="easternestate@hdfcbank" />
          </div>
        </CardContent>
      </Card>

      {/* ── 4. SMTP / Email ───────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-[#A8211B]" />
            <CardTitle className="text-base">Email (SMTP) Configuration</CardTitle>
          </div>
          <CardDescription>
            One shared mail server for the whole ERP. Used to send demand drafts, receipts, and
            reminders to customers. Leave blank to disable email sending.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <InfoBanner text="Gmail users: generate an App Password from your Google Account → Security → 2-Step Verification → App Passwords. Do NOT use your normal login password here." />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="SMTP Host" id="smtpHost" value={form.smtpHost ?? ''} onChange={set('smtpHost')} placeholder="smtp.gmail.com" />
            <Field
              label="SMTP Port"
              id="smtpPort"
              value={form.smtpPort ?? 587}
              onChange={(v) => setForm(p => ({ ...p, smtpPort: Number(v) }))}
              placeholder="587"
              type="number"
              hint="465 = SSL · 587 = TLS (recommended)"
            />
            <Field label="SMTP Username" id="smtpUser" value={form.smtpUser ?? ''} onChange={set('smtpUser')} placeholder="your@email.com" />
            <Field
              label="SMTP Password / App Password"
              id="smtpPass"
              value={form.smtpPass ?? ''}
              onChange={set('smtpPass')}
              placeholder="••••••••••••••••"
              type="password"
            />
            <Field
              label="From Address"
              id="smtpFrom"
              value={form.smtpFrom ?? ''}
              onChange={set('smtpFrom')}
              placeholder="noreply@easternestate.in"
              hint='Appears as the "From" name in customer emails'
            />
          </div>
        </CardContent>
      </Card>

      {/* Sticky save footer */}
      <div className="flex items-center justify-between rounded-xl border bg-white p-4 shadow-sm">
        <p className="text-sm text-muted-foreground">
          Changes apply to all <strong>newly generated</strong> drafts and PDFs.
          Existing documents are not retroactively updated.
        </p>
        <Button onClick={handleSave} disabled={saving} size="lg" className="bg-[#A8211B] hover:bg-[#7B1E12]">
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          Save All Settings
        </Button>
      </div>

    </div>
  );
}
