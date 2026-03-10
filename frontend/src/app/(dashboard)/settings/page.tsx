'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Save, User, Bell, Shield, Database, BookOpen,
  Search, ChevronRight, Download, FileText,
  Eye, EyeOff, Loader2, CheckCircle2, Lock,
  Mail, Server, AlertTriangle,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { usersService } from '@/services/users.service';
import { toast } from 'sonner';

// ─── helpers ──────────────────────────────────────────────────────────────────

const brandRed  = '#A8211B';
const brandDark = '#7B1E12';

function Field({
  label, value, onChange, type = 'text', disabled = false, hint,
}: {
  label: string; value: string; onChange?: (v: string) => void;
  type?: string; disabled?: boolean; hint?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5 text-gray-700">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        disabled={disabled}
        className={`w-full border rounded-lg px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 ${
          disabled
            ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
            : 'bg-white focus:ring-[#A8211B]/30 focus:border-[#A8211B]'
        }`}
      />
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const { user, setUser } = useAuthStore();

  const [activeTab, setActiveTab] = useState('profile');

  // ── Profile form state ────────────────────────────────────────────────────
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    username: '',
  });
  const [profileSaving, setProfileSaving] = useState(false);

  // ── Password form state ───────────────────────────────────────────────────
  const [pwForm, setPwForm] = useState({ newPassword: '', confirm: '' });
  const [showPw, setShowPw]   = useState(false);
  const [pwSaving, setPwSaving] = useState(false);

  // ── Help ──────────────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGuide, setSelectedGuide] = useState<string | null>(null);

  // ─── populate profile from auth store ─────────────────────────────────────
  useEffect(() => {
    if (user) {
      setProfile({
        firstName: (user as any).firstName ?? '',
        lastName:  (user as any).lastName  ?? '',
        phone:     (user as any).phone     ?? '',
        email:     user.email              ?? '',
        username:  user.username           ?? '',
      });
    }
  }, [user]);

  // ─── Save profile ──────────────────────────────────────────────────────────
  const handleSaveProfile = async () => {
    if (!user?.id) return;
    if (!profile.firstName.trim() || !profile.lastName.trim()) {
      toast.error('First name and last name are required');
      return;
    }
    setProfileSaving(true);
    try {
      const updated = await usersService.updateUser(user.id, {
        firstName: profile.firstName.trim(),
        lastName:  profile.lastName.trim(),
        phone:     profile.phone.trim() || undefined,
      });
      // Refresh the stored user
      const refreshed = {
        ...user,
        firstName: updated.firstName,
        lastName:  updated.lastName,
        phone:     updated.phone,
      };
      setUser(refreshed as any);
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(refreshed));
      }
      toast.success('Profile updated successfully');
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to update profile');
    } finally {
      setProfileSaving(false);
    }
  };

  // ─── Change password ───────────────────────────────────────────────────────
  const handleChangePassword = async () => {
    if (!user?.id) return;
    if (pwForm.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    if (pwForm.newPassword !== pwForm.confirm) {
      toast.error('Passwords do not match');
      return;
    }
    setPwSaving(true);
    try {
      await usersService.updateUser(user.id, { password: pwForm.newPassword });
      setPwForm({ newPassword: '', confirm: '' });
      toast.success('Password changed successfully');
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to change password');
    } finally {
      setPwSaving(false);
    }
  };

  const tabs = [
    { id: 'profile',       label: 'Profile',       icon: User     },
    { id: 'security',      label: 'Security',       icon: Shield   },
    { id: 'notifications', label: 'Notifications',  icon: Bell     },
    { id: 'help',          label: 'Help & Guides',  icon: BookOpen },
  ];

  const userRole = (user as any)?.roles?.[0]?.displayName
    ?? (user as any)?.roles?.[0]?.name
    ?? 'Staff';

  // ─── Guide data ────────────────────────────────────────────────────────────
  const userGuides = [
    { id: 'getting-started',      title: '🚀 Getting Started Guide',              category: 'Basics',     description: 'Learn how to login and navigate the system' },
    { id: 'ceo-guide',            title: '👨‍💼 CEO / Managing Director Guide',      category: 'Role-Based', description: 'Daily, weekly, and monthly tasks for senior management' },
    { id: 'sales-manager-guide',  title: '🎯 Sales Manager Guide',                category: 'Role-Based', description: 'Manage your sales team and track performance' },
    { id: 'sales-executive-guide',title: '👔 Sales Executive Guide',              category: 'Role-Based', description: 'Handle leads, follow-ups, and bookings' },
    { id: 'site-engineer-guide',  title: '🏗️ Site Engineer / Project Manager Guide', category: 'Role-Based', description: 'Manage construction projects and track progress' },
    { id: 'accountant-guide',     title: '💰 Accountant / Finance Team Guide',    category: 'Role-Based', description: 'Record payments, expenses, and generate reports' },
    { id: 'telecaller-guide',     title: '📞 Telecaller / Receptionist Guide',    category: 'Role-Based', description: 'Make calls, handle walk-ins, and manage inquiries' },
    { id: 'purchase-manager-guide',title: '🛒 Purchase / Procurement Manager Guide', category: 'Role-Based', description: 'Create purchase orders and manage vendors' },
    { id: 'smtp-setup',           title: '📧 SMTP Email Setup Guide',             category: 'Technical',  description: 'How to configure Gmail / custom email for sending demand drafts' },
    { id: 'troubleshooting',      title: '🔧 Common Issues & Troubleshooting',   category: 'Help',       description: 'Solutions to common problems' },
    { id: 'keyboard-shortcuts',   title: '⌨️ Keyboard Shortcuts',                category: 'Tips',       description: 'Work faster with keyboard shortcuts' },
  ];

  const filteredGuides = userGuides.filter(g =>
    g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const guideContentData: Record<string, { title: string; content: string }> = {
    'getting-started': {
      title: '🚀 Getting Started with Eastern Estate ERP',
      content: `Welcome to Eastern Estate ERP! This guide will help you get started quickly.

## First Time Login
1. Open your browser and navigate to the ERP URL
2. Enter your email and password
3. Change your password on first login (Settings → Profile → Change Password)
4. Explore your personalized dashboard

## Understanding the Dashboard
- **Key Metrics**: Live numbers pulled from the database
- **Quick Actions**: Buttons for common tasks
- **Navigation Menu**: Access all modules from sidebar
- **Notifications**: Stay updated on important events

## Getting Help
- Use this Help & Guides section anytime
- Search for specific topics
- Contact your admin if you need a password reset

You're all set! Start exploring the system.`,
    },
    'smtp-setup': {
      title: '📧 SMTP Email Setup Guide',
      content: `This guide explains how to configure Eastern Estate ERP to send real emails — demand drafts, payment reminders, etc.

## What is SMTP?
SMTP (Simple Mail Transfer Protocol) is how email software sends emails. You need to give the ERP your email credentials so it can send emails on your behalf.

## Option A — Gmail (Recommended for most teams)

### Step 1: Enable 2-Factor Authentication on Gmail
1. Go to myaccount.google.com
2. Click "Security" in the left menu
3. Under "How you sign in to Google", click "2-Step Verification"
4. Follow the steps to turn it on

### Step 2: Generate an App Password
1. After enabling 2FA, go back to myaccount.google.com → Security
2. Search for "App passwords" in the search bar at the top
3. Click "App passwords"
4. Choose "Other (Custom name)" → type "Eastern Estate ERP"
5. Click Generate
6. Copy the 16-character password shown (looks like: abcd efgh ijkl mnop)

### Step 3: Fill in the ERP Settings
Go to Settings → Company & Bank → SMTP Configuration:
- **SMTP Host**: smtp.gmail.com
- **SMTP Port**: 587
- **SMTP User**: your-email@gmail.com
- **SMTP Password**: paste the 16-character App Password (no spaces)
- **From Email**: your-email@gmail.com
- **From Name**: Eastern Estate

Click Save. Done ✅

## Option B — Business Email (e.g. info@easternestate.in)

### If hosted on cPanel (GoDaddy, Hostinger, etc.)
Contact your hosting provider or IT person for:
- SMTP Host (usually: mail.yourdomain.com)
- SMTP Port (usually: 587 or 465)
- Username: your full email address (info@easternestate.in)
- Password: your email account password

### If using Google Workspace (G Suite)
Same as Gmail setup above — just use your workspace email.

### If using Microsoft 365 / Outlook
- SMTP Host: smtp.office365.com
- SMTP Port: 587
- Username: your-email@yourdomain.com
- Password: your Microsoft account password (or App Password if MFA is on)

## Testing the Setup
After saving, go to any demand draft → click "Send Draft" — if SMTP is configured correctly, the customer will receive an email. Check the backend logs if the email doesn't arrive.

## Common Issues
❌ "Authentication failed" → Wrong App Password or 2FA not enabled
❌ "Connection refused" → Wrong SMTP host or port
❌ "Less secure apps" error → Use App Password instead of your regular password (Google has blocked this method)
❌ Email goes to spam → Add a proper "From Name" and use a business email address

## Security Note
Your SMTP password is stored encrypted in the database. Never share it. If someone leaves the company, immediately change the email password and update the ERP settings.`,
    },
    'ceo-guide': {
      title: '👨‍💼 CEO / Managing Director Guide',
      content: `Complete guide for senior management to monitor and lead the organization.

## Daily Morning Routine (15 Minutes)
1. Open Dashboard — check live KPI cards
2. Look at "Overdue Units" alert — any customer needs a call?
3. Check recent payments collected
4. Review pending approvals in your inbox

## Weekly Review (Every Monday)
- Go to Reports → Outstanding to see which units have unpaid milestones
- Go to Reports → Collection to see this week's revenue
- Go to Reports → Inventory to see unit availability

## Monthly Executive Review
- Sales performance analysis
- Financial health check (total collected vs outstanding)
- Construction progress review
- Team performance

## Key Metrics to Monitor (on Dashboard)
- Total Agreement Value vs Total Collected → tells you overall collection efficiency
- Outstanding Balance → what's still owed
- Available Units → how much inventory is left to sell
- Overdue Milestones → customers who haven't paid on time

Your leadership makes Eastern Estate successful!`,
    },
    'sales-manager-guide': {
      title: '🎯 Sales Manager Guide',
      content: `Lead your sales team to success with these best practices.

## Morning Routine (9-10 AM)
1. Check new leads (Leads module)
2. Assign unassigned leads to team members
3. Review yesterday's bookings
4. Plan today's site visits

## Team Performance Tracking
- Monitor daily conversions in the Bookings module
- Check Leads → follow-up status
- Identify hot leads (site visit done, pricing discussed)

## Weekly Team Meeting (Friday 5 PM)
- Review new leads this week
- Bookings closed
- Site visits completed
- Pipeline forecast

## Best Practices
✅ Lead by example — log your own interactions
✅ Be accessible to the team
✅ Celebrate wins publicly
✅ Use data from reports for decisions
✅ Invest in team training

Lead your team to hit those targets!`,
    },
    'sales-executive-guide': {
      title: '👔 Sales Executive Guide',
      content: `Master the art of converting leads into happy customers.

## Daily Workflow

### Morning (9 AM - 12 PM): Follow-up Calls
- Go to Leads and filter by your follow-up date = today
- Prioritize "HOT" leads
- Log every call outcome in the Lead notes
- Update lead status after each call

### Afternoon (12 PM - 3 PM): Site Visits
- Conduct property tours
- Highlight key features
- Handle objections professionally

### Evening (3 PM - 6 PM): Documentation
- Create new bookings for confirmed customers
- Upload token payment receipts
- Update tomorrow's follow-up dates

## Creating a Booking
1. Ensure customer exists (Customers module)
2. Go to Bookings → New Booking
3. Select Property → Tower → Flat
4. Fill in pricing and payment plan
5. Review summary → Confirm

You're the face of Eastern Estate!`,
    },
    'site-engineer-guide': {
      title: '🏗️ Site Engineer Guide',
      content: `Manage construction projects efficiently and track progress.

## Daily Tasks
- Go to Construction → Projects → your project
- Log today's completed work
- Check material stock (Construction → Inventory)
- Report any safety issues immediately

## Logging Construction Progress
1. Go to Construction → Milestones
2. Find your tower/project
3. Mark phases as completed
4. When a phase is marked complete → system auto-generates demand drafts for that milestone

## Requesting Materials
1. Go to Construction → Materials
2. Check current stock
3. Create a Purchase Order for replenishment

## Best Practices
✅ Log progress daily — this triggers payment milestones automatically
✅ Upload site photos as proof
✅ Report issues immediately
✅ Track material usage accurately

Keep those projects on track!`,
    },
    'accountant-guide': {
      title: '💰 Accountant / Finance Guide',
      content: `Maintain accurate financial records and generate reports.

## Daily Tasks
### Morning
- Check Dashboard → Recent Payments
- Verify bank deposits match system entries
- Review Payments → filter by today's date

### Afternoon
- Process vendor payments (Accounting → Expenses)
- Update expense entries
- Reconcile accounts

### Evening
- Generate outstanding report (Reports → Outstanding)
- Prepare payment reminders for overdue units
- Update cash book

## Recording Customer Payments
1. Go to Payments → New Payment
2. Select customer and booking
3. Enter amount, method, reference number
4. Upload payment proof (cheque scan, screenshot, etc.)
5. System auto-generates a receipt number

## Generating Reports
- Reports → Outstanding: Who owes what
- Reports → Collection: What was received this month
- Reports → Inventory: Unit-wise stock value

## Monthly Tasks
- Reconcile all bank accounts
- Generate GST-ready reports
- Process pending payroll entries

Accurate records = Business success!`,
    },
    'telecaller-guide': {
      title: '📞 Telecaller / Receptionist Guide',
      content: `Handle calls professionally and convert inquiries to leads.

## Daily Call Routine
1. Go to Leads → filter by status = NEW or FOLLOW_UP
2. Make calls systematically
3. Update call notes after each call
4. Schedule callback if needed

## Handling Walk-in Inquiries
1. Greet warmly
2. Go to Leads → New Lead → enter details quickly
3. Notify available sales person
4. Provide property brochures

## Call Scripts
**Opening**: "Good morning! This is [Name] from Eastern Estate..."
**Purpose**: "We have exciting new properties in [Location]..."
**Closing**: "When can we schedule a site visit for you?"

## Daily Targets
- 50-60 calls per day
- 10-15 qualified leads created in system
- 3-5 site visit bookings arranged

Every call is an opportunity!`,
    },
    'purchase-manager-guide': {
      title: '🛒 Purchase Manager Guide',
      content: `Manage procurement efficiently and maintain vendor relationships.

## Daily Workflow
### Morning
- Check Construction → Materials for low stock alerts
- Review pending Purchase Orders → follow up on deliveries

### Afternoon
- Create new Purchase Orders (Construction → Purchase Orders)
- Get competitive quotations from vendors

### Evening
- Verify deliveries and update stock
- Process vendor payments (Accounting → Expenses)

## Creating Purchase Orders
1. Go to Construction → Purchase Orders → New PO
2. Select vendor
3. Add materials and quantities
4. Set delivery timeline
5. Approve and send PO to vendor

## Managing Vendors
- Go to Construction → Vendors
- Rate vendor performance after each delivery
- Track payment schedules

Smart procurement = Cost savings!`,
    },
    'troubleshooting': {
      title: '🔧 Troubleshooting Common Issues',
      content: `Quick solutions to common problems.

## Login Issues
**Problem**: Can't login
**Solution**:
- Check email spelling and case
- Try "Forgot Password"
- Clear browser cache (Ctrl+Shift+Delete)
- Ask your admin to reset your password via Settings → Users

## Data Not Saving
**Problem**: Form saves but data disappears
**Solution**:
- Check for red validation errors below the fields
- Make sure all required fields (marked *) are filled
- Look at the error message toast — it usually tells you exactly what's wrong

## Slow Performance
**Problem**: System is slow
**Solution**:
- Refresh page (Ctrl+R or F5)
- Clear browser cache
- Check internet connection
- Try Chrome or Edge instead of Firefox

## API Errors
**Problem**: Red "API Error" toast appears
**Solution**:
- Read the error message carefully — it tells you which field has a problem
- If it says "Internal server error", contact your admin
- If it says "Unauthorized", log out and log back in

## Contact Support
📧 IT / Dev Support: Contact your admin
⏰ Hours: As per your company schedule

We're here to help!`,
    },
    'keyboard-shortcuts': {
      title: '⌨️ Keyboard Shortcuts',
      content: `Work faster with these keyboard shortcuts.

## General Navigation
- **Ctrl + /** : Show help
- **Esc** : Close modal/dialog
- **Tab** : Move to next field
- **Shift + Tab** : Move to previous field
- **Enter** : Submit form (most forms)

## Common Actions
- **Ctrl + S** : Save current form
- **Ctrl + P** : Print / Export PDF
- **Ctrl + F** : Find on page

## Browser Shortcuts
- **Ctrl + T** : New tab
- **Ctrl + W** : Close tab
- **Ctrl + Shift + T** : Reopen closed tab
- **Ctrl + R** or **F5** : Refresh page
- **F12** : Open developer tools (for debugging)

## Tips
- Most buttons show tooltips on hover
- Use Tab to navigate forms quickly without a mouse
- Press Esc to cancel any modal without losing your work (unless you've started typing)

Master these shortcuts to work like a pro!`,
    },
  };

  const downloadPDF = (guideId: string) => {
    toast.info(`PDF download for "${guideId}" coming soon!`);
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: brandDark }}>Settings</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage your account, security and system preferences</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 border-b overflow-x-auto">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 py-2.5 border-b-2 transition-colors whitespace-nowrap text-sm font-medium ${
                activeTab === tab.id
                  ? 'border-[#A8211B] text-[#A8211B]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="h-4 w-4 mr-2" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── Profile Tab ──────────────────────────────────────────────────────── */}
      {activeTab === 'profile' && (
        <div className="space-y-5">
          {/* Profile info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Personal Information</CardTitle>
              <CardDescription>Update your name and phone number. Email and username cannot be changed here — contact an admin.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field
                  label="First Name *"
                  value={profile.firstName}
                  onChange={(v) => setProfile(p => ({ ...p, firstName: v }))}
                />
                <Field
                  label="Last Name *"
                  value={profile.lastName}
                  onChange={(v) => setProfile(p => ({ ...p, lastName: v }))}
                />
              </div>
              <Field
                label="Phone"
                value={profile.phone}
                onChange={(v) => setProfile(p => ({ ...p, phone: v }))}
                type="tel"
                hint="Used for account recovery and notifications"
              />
              <Field label="Email" value={profile.email} disabled hint="Contact an admin to change your email" />
              <Field label="Username" value={profile.username} disabled hint="Usernames cannot be changed" />
              <div className="flex items-center gap-3 pt-1">
                <div className="text-sm text-gray-500">
                  Role: <span className="font-medium text-gray-700">{userRole}</span>
                </div>
              </div>
              <div className="pt-2">
                <Button
                  onClick={handleSaveProfile}
                  disabled={profileSaving}
                  style={{ backgroundColor: brandRed }}
                  className="text-white hover:opacity-90"
                >
                  {profileSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  {profileSaving ? 'Saving…' : 'Save Profile'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Change password */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Lock className="h-4 w-4" style={{ color: brandRed }} />
                Change Password
              </CardTitle>
              <CardDescription>Set a new password for your account. Minimum 8 characters.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <label className="block text-sm font-medium mb-1.5 text-gray-700">New Password *</label>
                <input
                  type={showPw ? 'text' : 'password'}
                  value={pwForm.newPassword}
                  onChange={(e) => setPwForm(p => ({ ...p, newPassword: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#A8211B]/30 focus:border-[#A8211B]"
                  placeholder="Min. 8 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 text-gray-700">Confirm New Password *</label>
                <input
                  type={showPw ? 'text' : 'password'}
                  value={pwForm.confirm}
                  onChange={(e) => setPwForm(p => ({ ...p, confirm: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#A8211B]/30 focus:border-[#A8211B]"
                  placeholder="Re-enter new password"
                />
                {pwForm.confirm && pwForm.newPassword !== pwForm.confirm && (
                  <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                )}
                {pwForm.confirm && pwForm.newPassword === pwForm.confirm && pwForm.newPassword.length >= 8 && (
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Passwords match
                  </p>
                )}
              </div>
              <Button
                onClick={handleChangePassword}
                disabled={pwSaving || pwForm.newPassword.length < 8 || pwForm.newPassword !== pwForm.confirm}
                variant="outline"
                className="border-[#A8211B] text-[#A8211B] hover:bg-[#A8211B]/5"
              >
                {pwSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Lock className="h-4 w-4 mr-2" />}
                {pwSaving ? 'Changing…' : 'Change Password'}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Security Tab ─────────────────────────────────────────────────────── */}
      {activeTab === 'security' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Security Settings</CardTitle>
            <CardDescription>Account security configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-semibold">Advanced security settings</p>
                <p className="mt-0.5 text-amber-700">Two-factor authentication, session timeouts, and IP whitelisting are managed at the server level. Contact your system administrator to configure these settings.</p>
              </div>
            </div>

            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>Your session uses JWT with automatic expiry</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>Passwords are hashed with bcrypt (12 rounds)</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>All API calls require authenticated tokens</span>
              </div>
            </div>

            <div className="pt-2">
              <p className="text-sm font-medium text-gray-700 mb-2">Change your password</p>
              <Button
                variant="outline"
                onClick={() => setActiveTab('profile')}
                className="border-[#A8211B] text-[#A8211B] hover:bg-[#A8211B]/5"
              >
                <Lock className="h-4 w-4 mr-2" />
                Go to Profile → Change Password
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Notifications Tab ────────────────────────────────────────────────── */}
      {activeTab === 'notifications' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notification Preferences</CardTitle>
            <CardDescription>Control which alerts you receive (email delivery requires SMTP to be configured in Company Settings)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 border border-blue-200">
              <Mail className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold">Email notifications require SMTP setup</p>
                <p className="mt-0.5">Configure your email server in{' '}
                  <a href="/settings/company" className="underline font-medium">Settings → Company & Bank</a>{' '}
                  to enable real email delivery.{' '}
                  <button onClick={() => { setActiveTab('help'); setSelectedGuide('smtp-setup'); }} className="underline font-medium">
                    Read the SMTP setup guide →
                  </button>
                </p>
              </div>
            </div>

            {[
              { label: 'New booking created',        sub: 'When a new booking is recorded in the system' },
              { label: 'Payment received',           sub: 'When a new payment is logged against a booking' },
              { label: 'Milestone demand due',       sub: 'When a payment milestone is due within 7 days' },
              { label: 'Overdue milestone alert',    sub: 'When a milestone passes its due date unpaid' },
              { label: 'Demand draft sent to customer', sub: 'When a demand draft status changes to SENT' },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-800">{item.label}</p>
                  <p className="text-xs text-gray-500">{item.sub}</p>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">Coming soon</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* ── Help Tab ─────────────────────────────────────────────────────────── */}
      {activeTab === 'help' && (
        <div className="space-y-6">
          <Card className="bg-gradient-to-r from-[#FEF3E2] to-[#F3E3C1] border-[#F2C94C]">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2" style={{ color: brandDark }}>
                <BookOpen className="h-5 w-5" style={{ color: brandRed }} />
                Help & User Guides
              </CardTitle>
              <CardDescription className="text-sm">
                Complete documentation to help you use Eastern Estate ERP effectively.
              </CardDescription>
            </CardHeader>
          </Card>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search guides… (e.g. 'SMTP', 'booking', 'payment')"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-[#A8211B]/30 focus:outline-none"
            />
          </div>

          {/* Featured */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="hover:shadow-md transition-shadow cursor-pointer border-green-200 bg-green-50"
              onClick={() => setSelectedGuide('getting-started')}>
              <CardContent className="p-4">
                <FileText className="h-7 w-7 text-green-600 mb-2" />
                <h3 className="font-semibold text-sm mb-1">Getting Started Guide</h3>
                <p className="text-xs text-gray-500">New to the system? Start here!</p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-md transition-shadow cursor-pointer border-blue-200 bg-blue-50"
              onClick={() => setSelectedGuide('smtp-setup')}>
              <CardContent className="p-4">
                <Server className="h-7 w-7 text-blue-600 mb-2" />
                <h3 className="font-semibold text-sm mb-1">SMTP Email Setup</h3>
                <p className="text-xs text-gray-500">Configure Gmail or business email for sending drafts</p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-md transition-shadow cursor-pointer border-amber-200 bg-amber-50"
              onClick={() => setSelectedGuide('troubleshooting')}>
              <CardContent className="p-4">
                <AlertTriangle className="h-7 w-7 text-amber-600 mb-2" />
                <h3 className="font-semibold text-sm mb-1">Troubleshooting</h3>
                <p className="text-xs text-gray-500">Solutions to common problems</p>
              </CardContent>
            </Card>
          </div>

          {/* All guides */}
          <div>
            <h2 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Browse All Guides</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredGuides.map(guide => (
                <Card
                  key={guide.id}
                  className="hover:shadow-md transition-shadow cursor-pointer border-l-4"
                  style={{
                    borderLeftColor:
                      guide.category === 'Basics'    ? '#10b981' :
                      guide.category === 'Technical' ? '#3b82f6' :
                      guide.category === 'Role-Based'? '#A8211B' :
                      guide.category === 'Help'      ? '#f59e0b' : '#8b5cf6'
                  }}
                  onClick={() => setSelectedGuide(guide.id)}
                >
                  <CardContent className="p-3.5">
                    <div className="flex justify-between items-start mb-1.5">
                      <span className="text-xs font-semibold px-1.5 py-0.5 rounded"
                        style={{
                          backgroundColor:
                            guide.category === 'Basics'    ? '#d1fae5' :
                            guide.category === 'Technical' ? '#dbeafe' :
                            guide.category === 'Role-Based'? '#fef2f2' :
                            guide.category === 'Help'      ? '#fed7aa' : '#ede9fe',
                          color:
                            guide.category === 'Basics'    ? '#065f46' :
                            guide.category === 'Technical' ? '#1e40af' :
                            guide.category === 'Role-Based'? '#991b1b' :
                            guide.category === 'Help'      ? '#92400e' : '#5b21b6',
                        }}
                      >
                        {guide.category}
                      </span>
                      <ChevronRight className="h-4 w-4 text-gray-300" />
                    </div>
                    <h3 className="font-medium text-sm mb-0.5">{guide.title}</h3>
                    <p className="text-xs text-gray-500">{guide.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Guide Modal ───────────────────────────────────────────────────────── */}
      {selectedGuide && guideContentData[selectedGuide] && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-5 border-b flex justify-between items-start gap-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">{guideContentData[selectedGuide].title}</h2>
                <p className="text-xs text-gray-500 mt-0.5">{userGuides.find(g => g.id === selectedGuide)?.description}</p>
              </div>
              <button onClick={() => setSelectedGuide(null)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
            </div>
            <div className="p-5 overflow-y-auto flex-1 text-sm">
              {guideContentData[selectedGuide].content.split('\n').map((line, idx) => {
                if (line.startsWith('## '))       return <h2 key={idx} className="text-base font-bold mt-5 mb-2" style={{ color: brandDark }}>{line.replace('## ', '')}</h2>;
                if (line.startsWith('### '))      return <h3 key={idx} className="text-sm font-semibold mt-3 mb-1 text-gray-800">{line.replace('### ', '')}</h3>;
                if (line.startsWith('- '))        return <li key={idx} className="ml-5 text-gray-700 my-0.5">{line.replace('- ', '')}</li>;
                if (line.startsWith('✅ '))       return <p key={idx} className="flex gap-2 text-gray-700 my-1"><span>✅</span><span>{line.replace('✅ ', '')}</span></p>;
                if (line.startsWith('❌ '))       return <p key={idx} className="flex gap-2 text-red-700 my-1"><span>❌</span><span>{line.replace('❌ ', '')}</span></p>;
                if (line.match(/^\d+\./))         return <p key={idx} className="ml-3 text-gray-700 my-0.5">{line}</p>;
                if (line.trim())                  return <p key={idx} className="text-gray-700 my-1.5">{line}</p>;
                return <br key={idx} />;
              })}
            </div>
            <div className="p-4 border-t bg-gray-50 flex justify-between items-center">
              <p className="text-xs text-gray-400">Press <kbd className="px-1 border rounded text-xs">Esc</kbd> or click × to close</p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => downloadPDF(selectedGuide)}>
                  <Download className="h-3.5 w-3.5 mr-1.5" /> Download PDF
                </Button>
                <Button size="sm" onClick={() => setSelectedGuide(null)}>Close</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
