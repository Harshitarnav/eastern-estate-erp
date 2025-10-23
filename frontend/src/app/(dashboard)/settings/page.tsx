'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Save, User, Bell, Shield, Database, BookOpen, Search, ChevronRight, Download, FileText } from 'lucide-react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [settings, setSettings] = useState({
    // Profile
    name: 'Admin User',
    email: 'admin@easternest ate.com',
    phone: '+91 1234567890',
    role: 'Super Admin',
    
    // Notifications
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    approvalAlerts: true,
    budgetAlerts: true,
    
    // Security
    twoFactorAuth: false,
    sessionTimeout: '30',
    passwordExpiry: '90',
    
    // System
    currency: 'INR',
    dateFormat: 'DD/MM/YYYY',
    timezone: 'Asia/Kolkata',
    language: 'English',
    fiscalYearStart: 'April',
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGuide, setSelectedGuide] = useState<string | null>(null);

  const handleSave = () => {
    alert('Settings saved successfully!');
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'system', label: 'System', icon: Database },
    { id: 'help', label: 'Help & Guides', icon: BookOpen },
  ];

  const userGuides = [
    {
      id: 'getting-started',
      title: '🚀 Getting Started Guide',
      category: 'Basics',
      description: 'Learn how to login and navigate the system',
    },
    {
      id: 'ceo-guide',
      title: '👨‍💼 CEO / Managing Director Guide',
      category: 'Role-Based',
      description: 'Daily, weekly, and monthly tasks for senior management',
    },
    {
      id: 'sales-manager-guide',
      title: '🎯 Sales Manager Guide',
      category: 'Role-Based',
      description: 'Manage your sales team and track performance',
    },
    {
      id: 'sales-executive-guide',
      title: '👔 Sales Executive Guide',
      category: 'Role-Based',
      description: 'Handle leads, follow-ups, and bookings',
    },
    {
      id: 'site-engineer-guide',
      title: '🏗️ Site Engineer / Project Manager Guide',
      category: 'Role-Based',
      description: 'Manage construction projects and track progress',
    },
    {
      id: 'accountant-guide',
      title: '💰 Accountant / Finance Team Guide',
      category: 'Role-Based',
      description: 'Record payments, expenses, and generate reports',
    },
    {
      id: 'telecaller-guide',
      title: '📞 Telecaller / Receptionist Guide',
      category: 'Role-Based',
      description: 'Make calls, handle walk-ins, and manage inquiries',
    },
    {
      id: 'purchase-manager-guide',
      title: '🛒 Purchase / Procurement Manager Guide',
      category: 'Role-Based',
      description: 'Create purchase orders and manage vendors',
    },
    {
      id: 'troubleshooting',
      title: '🔧 Common Issues & Troubleshooting',
      category: 'Help',
      description: 'Solutions to common problems',
    },
    {
      id: 'keyboard-shortcuts',
      title: '⌨️ Keyboard Shortcuts',
      category: 'Tips',
      description: 'Work faster with keyboard shortcuts',
    },
  ];

  const filteredGuides = userGuides.filter(guide =>
    guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    guide.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    guide.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const downloadPDF = (guideId: string) => {
    alert(`Downloading ${guideId} as PDF... (Feature coming soon!)`);
  };

  const guideContentData: {[key: string]: {title: string, content: string}} = {
    'getting-started': {
      title: '🚀 Getting Started with Eastern Estate ERP',
      content: `Welcome to Eastern Estate ERP! This guide will help you get started quickly.

## First Time Login
1. Open your browser and navigate to the ERP URL
2. Enter your email and password
3. Change your password on first login
4. Explore your personalized dashboard

## Understanding the Dashboard
- **Key Metrics**: Important numbers at a glance
- **Quick Actions**: Buttons for common tasks  
- **Navigation Menu**: Access all modules from sidebar
- **Notifications**: Stay updated on important events

## Getting Help
- Use this Help & Guides section anytime
- Search for specific topics
- Contact IT Support: Ext. 101

You're all set! Start exploring the system.`
    },
    'ceo-guide': {
      title: '👨‍💼 CEO / Managing Director Guide',
      content: `Complete guide for senior management to monitor and lead the organization.

## Daily Morning Routine (15 Minutes)
1. Review yesterday's key numbers
2. Check urgent alerts  
3. Review pending approvals
4. Note critical issues

## Weekly Review (Every Monday)
- Generate weekly summary report
- Review sales, construction, finance metrics
- Download and share with team

## Monthly Executive Review  
- Sales performance analysis
- Financial health check
- Construction progress review
- HR and team performance

## Key Metrics to Monitor
- Sales conversion rates
- Project completion percentages
- Cash flow and profitability
- Team productivity

Your leadership makes Eastern Estate successful!`
    },
    'sales-manager-guide': {
      title: '🎯 Sales Manager Guide', 
      content: `Lead your sales team to success with these best practices.

## Morning Routine (9-10 AM)
1. Check new leads
2. Assign leads to team members
3. Review yesterday's performance
4. Plan today's priorities

## Team Performance Tracking
- Monitor daily conversions
- Identify top performers
- Support struggling team members
- Set clear targets

## Weekly Team Meeting (Friday 5 PM)
- Celebrate wins
- Review numbers
- Share learnings
- Plan next week

## Best Practices
✅ Lead by example
✅ Be accessible to team
✅ Celebrate wins publicly
✅ Use data for decisions
✅ Invest in training

Lead your team to hit those targets!`
    },
    'sales-executive-guide': {
      title: '👔 Sales Executive Guide',
      content: `Master the art of converting leads into happy customers.

## Daily Workflow

### Morning (9 AM - 12 PM): Follow-up Calls
- Check today's follow-ups
- Prioritize hot leads  
- Make calls systematically
- Update status after each call

### Afternoon (12 PM - 3 PM): Site Visits
- Conduct property tours
- Highlight key features
- Handle objections professionally
- Close deals on-site

### Evening (3 PM - 6 PM): Documentation
- Send quotations
- Process bookings
- Follow up on pending docs
- Plan tomorrow

## Target Achievement Strategy
- Week 1: Build pipeline
- Week 2: Close 1 booking
- Week 3: Close 1 booking  
- Week 4: Close 1 booking

You're the face of Eastern Estate!`
    },
    'site-engineer-guide': {
      title: '🏗️ Site Engineer Guide',
      content: `Manage construction projects efficiently and track progress.

## Daily Tasks
- Check material stock levels
- Review worker attendance  
- Monitor today's work plan
- Report any issues immediately

## Logging Daily Progress
1. Go to Construction → Projects
2. Click your project
3. Log today's work completed
4. Upload site photos
5. Note materials used

## Requesting Materials
When running low on stock:
1. Check current inventory
2. Click "Request Material"
3. Specify quantity and urgency
4. Purchase team gets notified

## Best Practices
✅ Log progress daily
✅ Take before/after photos
✅ Report issues immediately
✅ Track material usage
✅ Maintain safety standards

Keep those projects on track!`
    },
    'accountant-guide': {
      title: '💰 Accountant / Finance Guide',
      content: `Maintain accurate financial records and generate reports.

## Daily Tasks
### Morning
- Check yesterday's collections
- Verify bank deposits
- Review pending payments

### Afternoon  
- Process vendor payments
- Update expense entries
- Reconcile accounts

### Evening
- Prepare payment reminders
- Update cash book
- Generate reports

## Recording Customer Payments
1. Go to Payments → New Payment
2. Select customer and booking
3. Enter amount and method
4. Upload payment proof
5. System generates receipt

## Monthly Tasks
- Reconcile all bank accounts
- Generate financial statements
- Process pending payments
- Submit reports to management

Accurate records = Business success!`
    },
    'telecaller-guide': {
      title: '📞 Telecaller / Receptionist Guide',
      content: `Handle calls professionally and convert inquiries to leads.

## Daily Call Routine
1. Check today's call list
2. Prioritize hot leads
3. Follow calling scripts
4. Update call status after each call
5. Schedule callbacks

## Handling Walk-in Inquiries
1. Greet warmly
2. Quick lead entry in system
3. Notify available sales person
4. Provide property brochures
5. Promise callback within 2 hours

## Call Scripts
**Opening**: "Good morning! This is [Name] from Eastern Estate..."
**Purpose**: "We have exciting new properties in [Location]..."
**Closing**: "When can we schedule a site visit for you?"

## Daily Targets
- 50-60 calls per day
- 10-15 qualified leads
- 3-5 site visit bookings

Every call is an opportunity!`
    },
    'purchase-manager-guide': {
      title: '🛒 Purchase Manager Guide',
      content: `Manage procurement efficiently and maintain vendor relationships.

## Daily Workflow
### Morning
- Check material requests from sites
- Review low stock alerts
- Follow up on pending deliveries

### Afternoon
- Create new purchase orders
- Negotiate with vendors
- Get competitive quotations

### Evening
- Verify deliveries
- Update stock levels
- Process vendor payments

## Creating Purchase Orders
1. Go to Purchase Orders → New PO
2. Select vendor
3. Add materials and quantities
4. Set delivery timeline
5. Send PO to vendor

## Managing Inventory
- Monitor stock levels daily
- Set minimum stock thresholds
- Order before running out
- Track material costs

## Vendor Management
- Rate vendor performance
- Track payment schedules
- Negotiate better rates
- Maintain good relationships

Smart procurement = Cost savings!`
    },
    'troubleshooting': {
      title: '🔧 Troubleshooting Common Issues',
      content: `Quick solutions to common problems.

## Login Issues
**Problem**: Can't login
**Solution**: 
- Check email spelling
- Try "Forgot Password"
- Clear browser cache
- Contact IT Support

## Slow Performance
**Problem**: System is slow
**Solution**:
- Refresh page (F5)
- Clear browser cache
- Check internet connection
- Try different browser

## Data Not Showing
**Problem**: No data visible
**Solution**:
- Check filter settings
- Verify date range
- Refresh the page
- Check permissions

## Cannot Create Booking
**Problem**: Error when creating booking
**Solution**:
- Fill all required fields
- Check property availability
- Verify customer details
- Contact support if persists

## Contact Support
📞 IT Support: Ext. 101
📧 Email: support@easternest.com
⏰ Available: 9 AM - 6 PM (Mon-Sat)

We're here to help!`
    },
    'keyboard-shortcuts': {
      title: '⌨️ Keyboard Shortcuts',
      content: `Work faster with these keyboard shortcuts.

## General Navigation
- **Ctrl + /** : Show help
- **Ctrl + K** : Quick search
- **Esc** : Close modal/dialog
- **Tab** : Move to next field
- **Shift + Tab** : Move to previous field

## Common Actions
- **Ctrl + S** : Save current form
- **Ctrl + N** : Create new (context-dependent)
- **Ctrl + P** : Print current page
- **Ctrl + F** : Find on page

## Lead Management
- **Alt + L** : Go to Leads
- **Alt + N** : New lead
- **Alt + F** : Follow-ups

## Quick Tips
- Most buttons show shortcuts on hover
- Press and hold Alt to see shortcuts
- Customize shortcuts in Settings

## Browser Shortcuts
- **Ctrl + T** : New tab
- **Ctrl + W** : Close tab  
- **Ctrl + Shift + T** : Reopen closed tab
- **Ctrl + R** : Refresh page

Master these shortcuts to work like a pro!`
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Settings</h1>
        {activeTab !== 'help' && (
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b overflow-x-auto">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 py-2 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-[#A8211B] text-[#A8211B]'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              <Icon className="h-4 w-4 mr-2" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Profile Settings */}
      {activeTab === 'profile' && (
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Full Name</label>
              <input
                type="text"
                value={settings.name}
                onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Phone</label>
              <input
                type="tel"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Role</label>
              <input
                type="text"
                value={settings.role}
                disabled
                className="w-full border rounded-lg px-3 py-2 bg-gray-100"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notifications Settings */}
      {activeTab === 'notifications' && (
        <Card>
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
            <CardDescription>Manage how you receive notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-gray-600">Receive notifications via email</p>
              </div>
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                className="w-5 h-5"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">SMS Notifications</p>
                <p className="text-sm text-gray-600">Receive notifications via SMS</p>
              </div>
              <input
                type="checkbox"
                checked={settings.smsNotifications}
                onChange={(e) => setSettings({ ...settings, smsNotifications: e.target.checked })}
                className="w-5 h-5"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Push Notifications</p>
                <p className="text-sm text-gray-600">Receive push notifications</p>
              </div>
              <input
                type="checkbox"
                checked={settings.pushNotifications}
                onChange={(e) => setSettings({ ...settings, pushNotifications: e.target.checked })}
                className="w-5 h-5"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Approval Alerts</p>
                <p className="text-sm text-gray-600">Get notified about pending approvals</p>
              </div>
              <input
                type="checkbox"
                checked={settings.approvalAlerts}
                onChange={(e) => setSettings({ ...settings, approvalAlerts: e.target.checked })}
                className="w-5 h-5"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Budget Alerts</p>
                <p className="text-sm text-gray-600">Get notified when budgets are exceeded</p>
              </div>
              <input
                type="checkbox"
                checked={settings.budgetAlerts}
                onChange={(e) => setSettings({ ...settings, budgetAlerts: e.target.checked })}
                className="w-5 h-5"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Security Settings */}
      {activeTab === 'security' && (
        <Card>
          <CardHeader>
            <CardTitle>Security Settings</CardTitle>
            <CardDescription>Manage your account security</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Two-Factor Authentication</p>
                <p className="text-sm text-gray-600">Add an extra layer of security</p>
              </div>
              <input
                type="checkbox"
                checked={settings.twoFactorAuth}
                onChange={(e) => setSettings({ ...settings, twoFactorAuth: e.target.checked })}
                className="w-5 h-5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Session Timeout (minutes)</label>
              <select
                value={settings.sessionTimeout}
                onChange={(e) => setSettings({ ...settings, sessionTimeout: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="60">1 hour</option>
                <option value="120">2 hours</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Password Expiry (days)</label>
              <select
                value={settings.passwordExpiry}
                onChange={(e) => setSettings({ ...settings, passwordExpiry: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="30">30 days</option>
                <option value="60">60 days</option>
                <option value="90">90 days</option>
                <option value="0">Never</option>
              </select>
            </div>
            <div>
              <Button variant="outline" className="w-full">
                Change Password
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* System Settings */}
      {activeTab === 'system' && (
        <Card>
          <CardHeader>
            <CardTitle>System Configuration</CardTitle>
            <CardDescription>Configure system-wide settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Currency</label>
              <select
                value={settings.currency}
                onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="INR">Indian Rupee (INR)</option>
                <option value="USD">US Dollar (USD)</option>
                <option value="EUR">Euro (EUR)</option>
                <option value="GBP">British Pound (GBP)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Date Format</label>
              <select
                value={settings.dateFormat}
                onChange={(e) => setSettings({ ...settings, dateFormat: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Timezone</label>
              <select
                value={settings.timezone}
                onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                <option value="America/New_York">America/New_York (EST)</option>
                <option value="Europe/London">Europe/London (GMT)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Language</label>
              <select
                value={settings.language}
                onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
                <option value="Spanish">Spanish</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Fiscal Year Start</label>
              <select
                value={settings.fiscalYearStart}
                onChange={(e) => setSettings({ ...settings, fiscalYearStart: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="January">January</option>
                <option value="April">April</option>
                <option value="July">July</option>
                <option value="October">October</option>
              </select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Help & Guides Tab */}
      {activeTab === 'help' && (
        <div className="space-y-6">
          {/* Header */}
          <Card className="bg-gradient-to-r from-[#FEF3E2] to-[#F3E3C1] border-[#F2C94C]">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2" style={{ color: '#7B1E12' }}>
                <BookOpen className="h-6 w-6" style={{ color: '#A8211B' }} />
                Help & User Guides
              </CardTitle>
              <CardDescription className="text-base">
                Complete documentation to help you use Eastern Estate ERP effectively. Select your role to view relevant guides.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search guides... (e.g., 'sales', 'how to', 'booking')"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#A8211B] focus:border-transparent"
            />
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-green-200 bg-green-50">
              <CardContent className="p-4">
                <FileText className="h-8 w-8 text-green-600 mb-2" />
                <h3 className="font-semibold mb-1">Complete User Manual</h3>
                <p className="text-sm text-gray-600 mb-3">8,000+ word comprehensive guide</p>
                <Button size="sm" variant="outline" className="w-full" onClick={() => window.open('/EASTERN_ESTATE_ERP_COMPLETE_USER_GUIDE.md', '_blank')}>
                  View Full Guide
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <BookOpen className="h-8 w-8 text-blue-600 mb-2" />
                <h3 className="font-semibold mb-1">Getting Started Guide</h3>
                <p className="text-sm text-gray-600 mb-3">New to the system? Start here!</p>
                <Button size="sm" variant="outline" className="w-full" onClick={() => setSelectedGuide('getting-started')}>
                  Read Guide
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-purple-200 bg-purple-50">
              <CardContent className="p-4">
                <Download className="h-8 w-8 text-purple-600 mb-2" />
                <h3 className="font-semibold mb-1">Download PDF Guides</h3>
                <p className="text-sm text-gray-600 mb-3">Print for offline reference</p>
                <Button size="sm" variant="outline" className="w-full" onClick={() => downloadPDF('all')}>
                  Download All
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* User Guides List */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Browse by Role</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredGuides.map(guide => (
                <Card 
                  key={guide.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer border-l-4"
                  style={{
                    borderLeftColor: 
                      guide.category === 'Basics' ? '#10b981' :
                      guide.category === 'Role-Based' ? '#3b82f6' :
                      guide.category === 'Help' ? '#f59e0b' : '#8b5cf6'
                  }}
                  onClick={() => setSelectedGuide(guide.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-semibold px-2 py-1 rounded"
                        style={{
                          backgroundColor:
                            guide.category === 'Basics' ? '#d1fae5' :
                            guide.category === 'Role-Based' ? '#dbeafe' :
                            guide.category === 'Help' ? '#fed7aa' : '#ede9fe',
                          color:
                            guide.category === 'Basics' ? '#065f46' :
                            guide.category === 'Role-Based' ? '#1e40af' :
                            guide.category === 'Help' ? '#92400e' : '#5b21b6'
                        }}
                      >
                        {guide.category}
                      </span>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                    <h3 className="font-semibold mb-2 text-lg">{guide.title}</h3>
                    <p className="text-sm text-gray-600">{guide.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Contact Support */}
          <Card className="bg-gray-50">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Need More Help?
              </h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium mb-1">📞 IT Support</p>
                  <p className="text-gray-600">Extension: 101</p>
                  <p className="text-gray-600">Email: support@easternest.com</p>
                </div>
                <div>
                  <p className="font-medium mb-1">💡 Submit Feedback</p>
                  <p className="text-gray-600">Have suggestions? Let us know!</p>
                  <Button size="sm" variant="outline" className="mt-2">
                    Send Feedback
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Guide Content Modal */}
      {selectedGuide && guideContentData[selectedGuide] && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {guideContentData[selectedGuide].title}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {userGuides.find(g => g.id === selectedGuide)?.description}
                </p>
              </div>
              <button
                onClick={() => setSelectedGuide(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto flex-1">
              <div className="prose prose-blue max-w-none">
                {guideContentData[selectedGuide].content.split('\n').map((line, idx) => {
                  if (line.startsWith('## ')) {
                    return (
                      <h2 key={idx} className="text-xl font-bold mt-6 mb-3 text-blue-900">
                        {line.replace('## ', '')}
                      </h2>
                    );
                  } else if (line.startsWith('### ')) {
                    return (
                      <h3 key={idx} className="text-lg font-semibold mt-4 mb-2 text-gray-800">
                        {line.replace('### ', '')}
                      </h3>
                    );
                  } else if (line.startsWith('**') && line.endsWith('**')) {
                    return (
                      <p key={idx} className="font-semibold text-gray-900 mt-3 mb-1">
                        {line.replace(/\*\*/g, '')}
                      </p>
                    );
                  } else if (line.startsWith('- ')) {
                    return (
                      <li key={idx} className="ml-6 text-gray-700">
                        {line.replace('- ', '')}
                      </li>
                    );
                  } else if (line.startsWith('✅ ')) {
                    return (
                      <p key={idx} className="flex items-start gap-2 text-gray-700 my-1">
                        <span>✅</span>
                        <span>{line.replace('✅ ', '')}</span>
                      </p>
                    );
                  } else if (line.trim()) {
                    return (
                      <p key={idx} className="text-gray-700 my-2">
                        {line}
                      </p>
                    );
                  }
                  return <br key={idx} />;
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t bg-gray-50 flex justify-between items-center">
              <div className="text-sm text-gray-600">
                💡 <strong>Tip:</strong> Press ESC to close this guide
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => downloadPDF(selectedGuide)}>
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
                <Button onClick={() => setSelectedGuide(null)}>
                  Close Guide
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
