# Sales Dashboard System - Complete Guide

## Dashboard Structure

### 1. Sales Agent Dashboard (`/sales`)
**Purpose:** Personal dashboard for sales agents
**Access:** Automatic - uses logged-in user's ID
**Who sees it:** Sales Agents, Sales Managers, Sales GMs

**How it works:**
- Automatically loads when user visits `/sales`
- Uses `useAuth()` hook to get current user's ID
- Shows personalized metrics, tasks, and leads
- No manual ID needed - system detects who you are

**What's displayed:**
- **Performance Metrics:** Monthly targets, achievement %, revenue
- **Focus Leads:** Leads needing attention in next 48 hours
- **My Leads:** All leads assigned to the agent
- **Today's Tasks:** Tasks due today
- **Follow-ups:** Scheduled follow-ups
- **Site Visits:** Upcoming site visits
- **Recent Activity:** Last 15 actions taken

**Key Features:**
- Real-time task completion tracking
- Incentive calculator
- Lead source breakdown
- One-click call buttons
- Quick actions (Add Lead, Log Follow-up, Create Task)

---

### 2. Admin Sales Dashboard (`/sales/admin`)
**Purpose:** High-level overview for admins and management
**Access:** Admins, Super Admins
**Who sees it:** Admin, Super Admin roles

**How it works:**
- Shows company-wide sales metrics
- Aggregates data from all sales agents
- Compares agent performance
- Displays property-wise analytics

**What's displayed:**
- **Overall Metrics:** Total leads, conversions, revenue
- **Agent Performance Chart:** Bar chart comparing all agents
- **Top Performers:** Leaderboard of best-performing agents
- **Property Breakdown:** Which properties are selling

**Use Cases:**
- Weekly sales review meetings
- Identifying top performers
- Spotting underperforming areas
- Making strategic decisions

---

### 3. Sales GM Dashboard (`/sales/team/[gmId]`)
**Purpose:** Team management for Sales GMs
**Access:** Sales GM role
**Who sees it:** Sales General Managers

**How it works:**
- Shows all agents in GM's team
- Displays team metrics and performance
- Allows quick lead assignment
- Tracks team tasks

**What's displayed:**
- **Team Size:** Number of agents in team
- **Active Leads:** Total leads assigned to team
- **Team Conversions:** Combined conversions
- **Team Members Grid:** Each agent's performance
- **Task Overview:** Pending tasks by agent
- **Quick Assign Button:** Assign unassigned leads to agents

**Quick Assign Feature:**
- Click "Quick Assign" button
- Modal opens with unassigned leads
- Select leads and choose agent
- Leads are assigned, agent gets notification

---

## How Agent IDs Work

### Getting Your Agent ID

**Method 1: From User Profile**
```
1. Login to system
2. Your user account is linked to an employee record
3. Employee record has an ID
4. This ID is used for /sales/agent/[id]
```

**Method 2: From Database**
```sql
SELECT id, first_name, last_name, role_id 
FROM employees 
WHERE user_id = 'your-user-id';
```

**Method 3: From API**
```bash
curl http://localhost:3000/employees/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### URL Structure

**For Agents:**
- `/sales` - Your personal dashboard (automatic)
- `/sales/agent/123` - View specific agent (for managers)

**For GMs:**
- `/sales/team/456` - Your team dashboard (use your employee ID)

**For Admins:**
- `/sales/admin` - Company-wide dashboard

---

## Task Assignment System

### How Tasks Are Created

**1. Automatic Tasks (from system):**
- Follow-up due → Task created automatically
- Site visit scheduled → Task appears in calendar
- Lead assigned → "Contact lead" task created

**2. Manual Tasks (by agents/GMs):**
- Agent creates task: `/sales/tasks/new`
- GM assigns task to agent
- Task shows in agent's dashboard

### What Agents See in Tasks

**Today's Tasks Section:**
```
Task: Follow up with John Doe
Time: 2:00 PM
Type: Phone Call
Priority: HIGH
Lead: John Doe - Lead #12345
Action: [Call Now] [Mark Complete]
```

**Task Details:**
- Title: What needs to be done
- Time: When it's scheduled
- Type: Call, Meeting, Site Visit, Email
- Priority: Urgent, High, Medium, Low
- Associated Lead: Which customer
- Notes: Additional context

### Task Workflow

```
1. Task Created
   ↓
2. Appears in "Today's Tasks" (if due today)
   ↓
3. Agent clicks task
   ↓
4. Makes call/takes action
   ↓
5. Logs outcome
   ↓
6. Task marked complete
   ↓
7. Next follow-up scheduled (if needed)
```

---

## Complete Feature List

### `/sales` (Agent Dashboard)

✅ **Performance Tracking**
- Monthly targets
- Achievement percentage
- Days remaining
- Incentive tracking

✅ **Lead Management**
- Focus leads (48hr touchpoints)
- My assigned leads
- Lead source breakdown
- Quick call buttons

✅ **Task Management**
- Today's tasks
- This week's tasks
- Overdue tasks
- Completion rate

✅ **Follow-ups**
- Due today
- This week
- Overdue
- Completed count

✅ **Site Visits**
- Completed this month
- Pending this week
- Scheduled upcoming
- Average rating

✅ **Revenue**
- This month
- Projected month-end
- Average deal size
- Target progress

✅ **Activity Log**
- Recent 15 activities
- Follow-up calls
- Site visits
- Task completions

### `/sales/admin` (Admin Dashboard)

✅ **Company Metrics**
- Total leads
- Total conversions
- Conversion rate
- Total revenue

✅ **Agent Analytics**
- Performance comparison chart
- Top performers list
- Bottom performers alert
- Individual stats

✅ **Property Analytics**
- Leads per property
- Conversions per property
- Revenue per property
- Conversion rates

✅ **Trends**
- Month-over-month growth
- Source effectiveness
- Seasonal patterns

### `/sales/team/[gmId]` (GM Dashboard)

✅ **Team Overview**
- Team size
- Active leads count
- Team conversions
- Target achievement

✅ **Agent Performance Grid**
- Each agent's stats
- Leads assigned
- Conversion rate
- Quick assign button

✅ **Task Overview**
- Tasks by agent
- Overdue count
- Completion rates

✅ **Quick Actions**
- Bulk assign leads
- Schedule team meeting
- Generate reports

---

## Testing Guide

### Test as Sales Agent

```bash
# 1. Login as sales agent
# 2. Visit /sales
# 3. Should see your personal dashboard automatically

# Expected:
- Your name in welcome message
- Your leads only
- Your tasks only
- Your performance metrics
```

### Test as Sales GM

```bash
# 1. Login as Sales GM
# 2. Get your employee ID from profile
# 3. Visit /sales/team/YOUR_EMPLOYEE_ID
# 4. See your team's dashboard

# Expected:
- All team members listed
- Team-wide metrics
- Ability to assign leads
- Task overview for all team members
```

### Test as Admin

```bash
# 1. Login as Admin/Super Admin
# 2. Visit /sales/admin
# 3. See company-wide dashboard

# Expected:
- All agents' performance
- Company-wide metrics
- Performance charts
- Property analytics
```

---

## API
