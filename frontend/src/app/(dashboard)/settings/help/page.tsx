'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Search, ChevronRight, X, Download, FileText, Bell, ArrowLeft } from 'lucide-react';

// Guide content data
const guideContent = {
  'getting-started': {
    title: '🚀 Getting Started with Eastern Estate ERP',
    content: `
# Getting Started Guide

## Welcome to Eastern Estate ERP!

This guide will help you get started with the system, whether you're a manager, salesperson, site engineer, or accountant.

### First Time Login

**Step 1: Access the System**
- Open your web browser (Chrome recommended)
- Navigate to: http://erp.easternest.com (or the URL provided by IT)
- You'll see the Eastern Estate login page

**Step 2: Enter Your Credentials**
- Email: Your company email address
- Password: Provided by your manager
- First-time users: Default password is usually \`Welcome@123\`
- Click "Login"

**Step 3: Change Your Password (First Time Only)**
- You'll be prompted to change your password
- Create a strong password with:
  - At least 8 characters
  - One uppercase letter
  - One lowercase letter
  - One number
  - Example: \`Eastern@2024\`

### Understanding Your Dashboard

After login, you'll see your personalized dashboard with:

**📊 Key Metrics** - Numbers showing your important stats:
- Total leads/projects/sales
- Pending tasks
- Today's follow-ups
- Team performance

**📋 Quick Actions** - Buttons for common tasks:
- Add new lead
- Create booking
- Record payment
- Generate report

**📈 Charts & Graphs** - Visual representation of:
- Sales trends
- Project progress
- Revenue tracking
- Team performance

**🔔 Notifications** - Important alerts about:
- Pending approvals
- Follow-up reminders
- Payment dues
- System updates

### Navigation Menu

The left sidebar contains all modules:
- 🏠 **Dashboard** - Your home page
- 👥 **Leads** - Customer inquiries
- 💼 **Sales** - Bookings and deals
- 🏗️ **Construction** - Projects and materials
- 💰 **Accounting** - Finance and payments
- 👷 **HR** - Employee management
- ⚙️ **Settings** - System configuration

### Getting Help

**Need Assistance?**
- Click on "Help & Guides" in Settings (where you are now!)
- Search for specific topics using the search bar
- Contact IT Support: Ext. 101 or support@easternest.com
- Check video tutorials (coming soon)

**Pro Tips:**
- ✅ Explore without fear - you can't break anything!
- ✅ Use search bars to find things quickly
- ✅ Bookmark frequently used pages
- ✅ Keep your password secure
- ✅ Log out when done for security

### Common First-Time Questions

**Q: Can I access this from home?**
A: Yes! Access from any device with internet connection.

**Q: What if I forget my password?**
A: Click "Forgot Password" on login page, or contact IT support.

**Q: How do I change my profile picture?**
A: Go to Settings → Profile → Upload Photo

**Q: Can I use this on my mobile?**
A: Yes! The system works on phones and tablets.

### Next Steps

Based on your role, check out:
- 🎯 **Sales Team**: Sales Manager or Sales Executive guide
- 🏗️ **Site Team**: Site Engineer or Construction guide
- 💰 **Finance Team**: Accountant guide
- 👨‍💼 **Management**: CEO/MD guide

Welcome aboard! 🎉
`
  },
  'ceo-guide': {
    title: '👨‍💼 CEO / Managing Director Complete Guide',
    content: `
# CEO / Managing Director Guide

## Your Dashboard Overview

As the CEO/MD, your dashboard provides a bird's-eye view of the entire organization.

### Daily Morning Routine (15 Minutes)

**9:00 AM - Login and Quick Check**
1. Review yesterday's key numbers:
   - Total sales/bookings
   - Revenue collected
   - Projects status
   - Team performance

2. Check urgent alerts (red notifications)
3. Review pending approvals
4. Note any critical issues

### Weekly Review (Every Monday, 30 Minutes)

**Generate Weekly Summary Report:**

1. Click "📊 Reports" in menu
2. Select "Weekly Summary"
3. Review metrics:
   - **Sales Performance**: Target vs Achieved
   - **Construction Progress**: All projects
   - **Financial Health**: Cash flow, expenses
   - **Team Performance**: Individual & departmental

4. Download PDF report
5. Share with management team

### Monthly Executive Review

**First Monday of Each Month (1 Hour)**

1. **Sales Review**:
   - Total bookings this month
   - Conversion rates
   - Pipeline analysis
   - Lost opportunities (why?)

2. **Financial Review**:
   - Revenue vs Budget
   - Major expenses
   - Outstanding payments
   - Cash position

3. **Construction Review**:
   - Project completion percentages
   - Delays and reasons
   - Material costs
   - Labor productivity

4. **HR Review**:
   - Team size and hiring
   - Performance issues
   - Training needs
   - Attrition rate

### Key Metrics to Monitor

**Sales Metrics:**
- Monthly booking value
- Conversion rate (leads to bookings)
- Average deal size
- Sales cycle length

**Construction Metrics:**
- Projects on schedule
- Budget variance
- Quality issues
- Safety incidents

**Financial Metrics:**
- Total revenue
- Operating expenses
- Profit margins
- Cash flow

**HR Metrics:**
- Team productivity
- Employee satisfaction
- Retention rate
- Training completion

### Approvals You'll Handle

**Financial Approvals:**
- Expenses > ₹50,000
- Budget revisions
- Vendor contracts
- Property acquisitions

**HR Approvals:**
- New hires (manager level+)
- Promotions
- Salary increases
- Policy changes

**Operational Approvals:**
- Major project decisions
- Marketing campaigns
- System changes
- Legal matters

### Mobile App Usage

**Install Mobile App for:**
- Emergency approvals
- Real-time alerts
- Quick checks while traveling
- Push notifications

**How to Approve from Mobile:**
1. Open notification
2. Review details
3. Swipe to approve/reject
4. Add comments if needed

### Strategic Planning

**Quarterly Planning (Every 3 Months)**

1. Review past quarter:
   - What went well?
   - What didn't?
   - Lessons learned

2. Plan next quarter:
   - Sales targets
   - New projects
   - Team expansion
   - Budget allocation

3. Set clear objectives
4. Communicate to teams

### Reports You Should Review

**Daily:**
- Sales summary
- Critical alerts
- Pending approvals

**Weekly:**
- Team performance
- Project progress
- Cash flow

**Monthly:**
- Financial statements
- Sales analysis
- Construction reports
- HR metrics

**Quarterly:**
- Business review
- Budget vs actual
- Strategic goals
- Market analysis

### Best Practices

✅ **Review dashboard first thing daily**
✅ **Set aside time for strategic thinking**
✅ **Communicate decisions clearly**
✅ **Trust your team but verify**
✅ **Use data for decision making**
✅ **Be accessible for critical issues**

### Emergency Protocols

**Critical Issues:**
- Safety incidents
- Legal matters
- Major delays
- Financial irregularities

**Escalation Process:**
1. Immediate notification via phone/SMS
2. Emergency meeting if needed
3. Document all decisions
4. Follow up on resolution

Your leadership makes Eastern Estate successful! 🏆
`
  },
  'sales-manager-guide': {
    title: '🎯 Sales Manager Complete Guide',
    content: `
# Sales Manager Guide

## Your Role & Responsibilities

As Sales Manager, you're responsible for:
- Leading the sales team
- Assigning and tracking leads
- Monitoring team performance
- Achieving monthly targets
- Training and mentoring

### Morning Routine (9:00 AM - 10:00 AM)

**Daily Team Huddle:**

1. **Check New Leads** (5 minutes)
   - Review overnight inquiries
   - Note hot leads (immediate action)
   - Check lead sources

2. **Assign Leads** (10 minutes)
   - Distribute new leads to team
   - Balance workload
   - Match lead quality to salesperson strength
   - Set expectations

3. **Review Yesterday** (10 minutes)
   - Team achievements
   - Missed opportunities
   - Challenges faced
   - Solutions needed

4. **Today's Plan** (10 minutes)
   - Priority actions
   - Site visits scheduled
   - Bookings expected
   - Support needed

### Lead Management

**How to Assign a Lead:**

\`\`\`
Step 1: Go to "Leads" section
Step 2: Click on unassigned lead
Step 3: Review lead details:
   - Name, contact, budget
   - Property interested in
   - Source (how they found us)
   - Urgency level

Step 4: Choose team member based on:
   - Current workload
   - Expertise (villas vs apartments)
   - Past performance
   - Availability

Step 5: Click "Assign to"
Step 6: Select salesperson
Step 7: Add note: "Hot lead - call within 1 hour"
Step 8: Click "Assign"

✅ Team member gets instant notification!
\`\`\`

**Lead Distribution Strategy:**

- **Hot Leads** (ready to buy) → Top performers
- **Warm Leads** (researching) → Experienced team
- **Cold Leads** (just inquiring) → New team members
- **Referrals** → Handle personally or assign to senior

### Team Performance Tracking

**Daily Dashboard Review:**

\`\`\`
Name       | Leads | Calls | Visits | Closed | Conversion
-----------|-------|-------|--------|--------|------------
Rajesh     |   25  |   80  |   10   |    3   |   12%
Priya      |   30  |  100  |   15   |    5   |   16.6%
Amit       |   20  |   40  |    5   |    1   |    5%
-----------|-------|-------|--------|--------|------------
Team Total |   75  |  220  |   30   |    9   |   12%
\`\`\`

**Performance Analysis:**
- ✅ Priya - Excellent (reward & recognize)
- ⚠️ Amit - Needs support (coach & train)
- ✅ Rajesh - Good (maintain performance)

**Actions Based on Performance:**

**Low Conversion (<8%):**
- Shadow top performer
- Review call recordings
- Practice objection handling
- Check lead quality

**Average Conversion (8-15%):**
- Maintain current approach
- Share best practices
- Encourage improvement
- Set stretch goals

**High Conversion (>15%):**
- Recognize publicly
- Ask to mentor others
- Give premium leads
- Consider promotion

### Weekly Team Meeting (Friday, 5:00 PM)

**Agenda:**

1. **Celebrate Wins** (10 min)
   - This week's bookings
   - Best performances
   - Team achievements

2. **Review Numbers** (15 min)
   - Weekly vs target
   - Conversion rates
   - Pipeline health
   - Lost deals analysis

3. **Share Learnings** (15 min)
   - What worked well?
   - What didn't work?
   - Customer feedback
   - Competitor insights

4. **Plan Next Week** (15 min)
   - Targets for next week
   - Special campaigns
   - Site visit schedules
   - Training needs

5. **Q&A** (5 min)
   - Team questions
   - Clarifications
   - Concerns

### Monthly Performance Review

**Individual Reviews (30 min each):**

1. **Review Performance Data**:
   - Leads handled
   - Conversion rate
   - Revenue generated
   - Customer feedback

2. **Discuss Challenges**:
   - What's holding them back?
   - Resource needs
   - Training gaps
   - Personal issues?

3. **Set Next Month Goals**:
   - Specific targets
   - Skill development
   - Focus areas
   - Support needed

4. **Action Plan**:
   - Training to attend
   - Practice sessions
   - Mentorship pairing
   - Check-in schedule

### Handling Underperformance

**Step 1: Identify Root Cause**
- Skill issue?
- Motivation problem?
- Personal challenges?
- Lead quality?

**Step 2: Create Action Plan**
- Specific goals
- Training/support
- Regular check-ins
- Timeline (30/60/90 days)

**Step 3: Monitor Closely**
- Weekly progress reviews
- Provide guidance
- Adjust plan if needed
- Recognize improvements

**Step 4: Decision Time**
- If improving → Continue support
- If stagnant → Consider role change
- If declining → Difficult conversation

### Target Setting & Tracking

**Monthly Team Target:** ₹2 Crore bookings

**Individual Targets:**
- Senior (3+ years): ₹40 lakhs
- Mid-level (1-3 years): ₹25 lakhs
- Junior (<1 year): ₹10 lakhs

**Daily Target Breakdown:**
- Monthly Target ÷ 25 working days
- Example: ₹25 lakhs ÷ 25 = ₹1 lakh/day

**Track Progress:**
- Daily: Check vs target
- Weekly: Running total
- Monthly: Final numbers

### Best Practices

✅ **Lead with example** - Make calls yourself
✅ **Be accessible** - Team should feel comfortable asking
✅ **Celebrate wins** - Public recognition matters
✅ **Address issues quickly** - Don't let problems fester
✅ **Invest in training** - Upskill continuously
✅ **Use data** - Make decisions based on numbers
✅ **Fair distribution** - Equal opportunities for all

### Tools at Your Disposal

**Reports:**
- Team performance dashboard
- Individual scorecards
- Lead source analysis
- Conversion funnels
- Lost deal reports

**Communication:**
- Team chat/WhatsApp group
- Daily standup calls
- Weekly team meetings
- One-on-one reviews

**Training:**
- Sales scripts
- Product knowledge
- Objection handling
- Closing techniques

Lead your team to success! 🏆
`
  },
  'sales-executive-guide': {
    title: '👔 Sales Executive / Relationship Manager Complete Guide',
    content: `
# Sales Executive Guide

## Your Daily Success Plan

As a Sales Executive, your day is structured to maximize conversions and build lasting customer relationships.

### Morning Shift (9:00 AM - 12:00 PM)

**Goal: Complete all follow-up calls**

**Step 1: Check Today's Follow-ups** (9:00 AM)
\`\`\`
1. Open "My Leads" tab
2. Filter: "Today's Follow-ups"
3. Sort by: Priority (Hot leads first)
4. You'll see list like:

Name           | Mobile      | Last Call | Interest | Action
---------------|-------------|-----------|----------|--------
Ramesh Kumar   | 9876543210  | 3 days ago| Hot     | Call Now!
Priya Sharma   | 9887766554  | 1 week ago| Warm    | Follow up
Amit Patel     | 9123456789  | 2 days ago| Cold    | Quick check
\`\`\`

**Step 2: Make Calls** (9:30 AM - 12:00 PM)

**For Each Call:**

1. **Before Calling:**
   - Review customer history
   - Note their requirements
   - Check property availability
   - Prepare discussion points

2. **During Call:**
   - Greet warmly
   - Recap last conversation
   - Answer new questions
   - Create urgency (limited units!)
   - Suggest site visit

3. **After Call:**
   - Update call status immediately
   - Add detailed notes
   - Schedule next follow-up
   - Set reminders

**Call Script Template:**
\`\`\`
"Good morning Mr./Mrs. [Name]!

This is [Your Name] from Eastern Estate. We spoke [X days] ago 
about [Property Name].

I'm calling to check if you had any questions about the 
[2BHK apartment] we discussed?

[Listen to response]

Great! I'd love to show you the actual flat. When would be 
convenient for a site visit - this weekend or next week?

[If hesitant]: We have only 3 units left at this price. 
After this week, prices will increase by 5 lakhs.

[Close with]: Let me book [Saturday 11 AM] for you. 
I'll send location on WhatsApp. See you then!
\`\`\`

### Afternoon Shift (12:00 PM - 3:00 PM)

**Goal: Conduct site visits**

**Site Visit Preparation:**

1. **Before Customer Arrives:**
   - Reach site 15 minutes early
   - Check flat is clean
   - Test lights, water, etc.
   - Prepare comparison sheet
   - Have brochures ready

2. **During Site Visit:**
   - Greet warmly at gate
   - Give project overview
   - Show model flat/actual unit
   - Highlight USPs:
     * Location advantages
     * Amenities
     * Price vs market
     * Payment flexibility
     * Possession timeline

3. **Handle Objections:**
   - Price too high? → Show payment plan
   - Not sure? → Create urgency
   - Want to think? → Book token

4. **Closing:**
   - Ask: "Do you like it?"
   - If yes: "Let's book it today!"
   - Explain booking process
   - Get token advance (₹50,000)
   - Schedule documentation

5. **After Visit:**
   - Mark visit as "Completed"
   - Add detailed feedback notes
   - Set follow-up (if not booked)
   - Thank them for visiting

### Evening Shift (3:00 PM - 6:00 PM)

**Goal: Close deals and follow-ups**

**Activities:**

1. **Send Quotations** (3:00 PM - 4:00 PM)
   - For serious customers
   - Detailed pricing breakdown
   - Payment schedule options
   - Valid for 7 days only

2. **Follow Up on Quotations** (4:00 PM - 5:00 PM)
   - Call customers who received quotes
   - Answer questions
   - Push for booking

3. **Process Bookings** (5:00 PM - 6:00 PM)
   - Collect documents
   - Fill booking forms
   - Enter in system
   - Get approvals

4. **Plan Tomorrow** (6:00 PM)
   - Review tomorrow's follow-ups
   - Schedule site visits
   - Prepare requirements

### How to Add a New Lead

**When Customer Calls/Walks In:**

\`\`\`
1. Click "Leads" → "+ New Lead"

2. Fill Basic Info:
   📝 Name: Rajesh Kumar
   📞 Mobile: 9876543210
   📧 Email: rajesh@email.com (optional)
   📍 City: Mumbai

3. Lead Details:
   🔍 How found us?
   → Website / Google / Reference / Walk-in / Facebook

   🏠 Interested in?
   → 2BHK / 3BHK / Villa / Plot / Commercial

   💰 Budget?
   → 20-30L / 30-50L / 50L-1Cr / 1Cr+

   📅 When buying?
   → Immediately / 1-3 months / 3-6 months / Just researching

4. Notes:
   💬 "Looking for ground floor, needs 2 parking"

5. Click "Save Lead"

✅ System auto-schedules follow-up for tomorrow!
\`\`\`

### Creating a Booking

**When Customer is Ready to Buy:**

\`\`\`
Step 1: Go to "Bookings" → "New Booking"

Step 2: Select Details
   🏠 Property: Eastern Heights
   🏢 Tower: A
   🚪 Flat: A-402 (4th floor)

Step 3: Customer Info (auto-filled if existing lead)
   👤 Name: Already filled
   📞 Contact: Already filled
   📧 Email: Already filled

Step 4: Pricing
   💰 Basic Cost: ₹45,00,000
   📝 Registration: ₹2,00,000
   💵 GST (5%): ₹2,25,000
   📊 Other Charges: ₹75,000
   ════════════════════════════
   💰 TOTAL: ₹50,00,000

Step 5: Payment Plan
   🏦 Booking Amount: ₹2,00,000 (today - 4%)
   
   📅 Installment Schedule:
   Month 1-6: ₹2,00,000/month (24% total)
   Month 7-12: ₹2,50,000/month (30% total)
   Month 13-18: ₹3,00,000/month (36% total)
   On Possession: ₹3,00,000 (6% balance)

Step 6: Documents Upload
   📄 Aadhar Card (front & back)
   📄 PAN Card
   📄 Booking Form (signed)
   📄 Cheque/Payment proof

Step 7: Review & Submit
   ✅ Check all details
   ✅ Customer signature obtained
   ✅ Token money received
   ✅ Click "Create Booking"

🎉 Booking Done!
System will:
- Generate booking ID
- Send confirmation email
- Create payment schedule
- Set reminders for installments
\`\`\`

### Monthly Target Achievement

**Your Target:** ₹25 Lakhs/month (typically 2-3 bookings)

**Daily Breakdown:** ₹25L ÷ 25 days = ₹1 Lakh/day

**Strategy to Hit Target:**

**Week 1:** Build pipeline
- Focus on lead generation
- Quality site visits
- Building relationships

**Week 2:** Close 1 booking
- Follow up aggressively
- Create urgency
- Offer special discounts

**Week 3:** Close 1 booking
- Work on warm leads
- Referral push
- Weekend campaigns

**Week 4:** Close 1 booking
- Last chance offers
- Month-end discounts
- Quick decisions

**Pro Tips:**

✅ **Start month strong** - Don't wait for last week
✅ **Quality over quantity** - Focus on serious buyers
✅ **Follow up relentlessly** - 80% sales happen after 5th follow-up
✅ **Use urgency** - Limited units, price increase
✅ **Get referrals** - Ask happy customers
✅ **Track daily** - Know your numbers
✅ **Stay positive** - Rejection is part of sales

### Handling Objections

**"Price is too high"**
→ Show payment plan (only ₹2L/month!)
→ Compare with nearby projects
→ Highlight value (amenities, location)

**"I need to think"**
→ "What specifically concerns you?"
→ Address concern directly
→ Create urgency: "Only 2 units left at this price"

**"I'll come back later"**
→ "Sure! When exactly?"
→ Book specific appointment
→ "Just so you know, we're getting 5-6 bookings daily"

**"I found cheaper option"**
→ "That's great! May I know which project?"
→ Compare features honestly
→ Highlight our USPs

### Success Metrics

**Track Weekly:**
- Leads assigned: Target 20
- Calls made: Target 80
- Site visits: Target 10
- Bookings: Target 1

**Your Conversion Funnel:**
- 20 Leads → 10 Site Visits → 2 Bookings = 10% conversion

**Improve Conversion:**
- Better follow-ups
- Stronger closing
- More site visits
- Referral requests

You're the face of Eastern Estate! Make every interaction count! 🌟
`
  }
};

export default function HelpGuidesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGuide, setSelectedGuide] = useState<string | null>(null);

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
      description: 'Track payments, expenses, and financial reports',
    },
  ];

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Help & Guides</h1>
        <div className="grid gap-4">
          {userGuides.map((guide) => (
            <Card key={guide.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setSelectedGuide(guide.id)}>
              <CardHeader>
                <CardTitle>{guide.title}</CardTitle>
                <CardDescription>{guide.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
