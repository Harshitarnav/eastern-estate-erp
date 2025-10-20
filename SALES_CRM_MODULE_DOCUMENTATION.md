# Sales & CRM Module - Comprehensive Documentation

## 📋 Overview

The Sales & CRM module is a comprehensive system designed to empower your sales team with tools for lead management, performance tracking, personal productivity, and automated workflows. This module was built based on direct requirements from your Sales Head to address real-world sales team needs.

## ✨ Key Features Implemented

### 🎯 Phase 1: Enhanced Lead & Customer Management

#### New Lead Tracking Fields
- **Site Visit Status**: NOT_SCHEDULED, SCHEDULED, PENDING, DONE, CANCELLED
- **Customer Requirement Type**: END_USER, INVESTOR, BOTH
- **Property Preference**: FLAT, DUPLEX, PENTHOUSE, VILLA, PLOT, COMMERCIAL, ANY
- **Tentative Purchase Timeframe**: "1-3 months", "3-6 months", "6-12 months", "1+ year"
- **Follow-up Tracking**: Last follow-up feedback, total follow-ups counter
- **Reminder System**: Automated reminder flags for follow-ups
- **Site Visit Details**: Time tracking, last visit date

#### Enhanced Customer Fields
- **Requirement Type**: Investor or End User classification
- **Property Preference**: Type of property customer is looking for
- **Purchase Timeline**: When they plan to make a purchase

### 📊 Phase 2: FollowUp Management System

#### FollowUp Entity Features
- **Multiple Follow-up Types**: CALL, EMAIL, MEETING, WHATSAPP, SMS, SITE_VISIT, VIDEO_CALL
- **Outcome Tracking**: 11 different outcome types (INTERESTED, NOT_INTERESTED, CONVERTED, etc.)
- **Detailed Feedback**: Customer response, actions taken, feedback
- **Interest Scoring**: Interest level (1-10), Budget fit (1-10), Timeline fit (1-10)
- **Site Visit Specific**: Property visited, rating, detailed feedback
- **Next Follow-up Planning**: Auto-schedule next follow-up with notes

#### FollowUp Service Capabilities
```typescript
// Create detailed followup records
await followUpService.create({
  leadId, followUpType, outcome, feedback,
  customerResponse, interestLevel, budgetFit
});

// Get statistics
const stats = await followUpService.getStatistics(salesPersonId, startDate, endDate);
// Returns: total followups, breakdown by type, outcomes, avg interest/budget/timeline fit

// Get upcoming followups
const upcoming = await followUpService.getUpcomingFollowUps(salesPersonId);
```

### ✅ Phase 3: Personal Task Scheduler (Sales Tasks)

#### Task Management Features
- **10 Task Types**: FOLLOWUP_CALL, SITE_VISIT, MEETING, DOCUMENTATION, etc.
- **Priority Levels**: LOW, MEDIUM, HIGH, URGENT
- **Task Status**: PENDING, IN_PROGRESS, COMPLETED, CANCELLED, OVERDUE
- **Time Management**: Due date, due time, estimated duration
- **Meeting Support**: Attendees, meeting links (Zoom/Teams)
- **Reminders**: Configurable reminder timing (default: 24 hours before)
- **Recurring Tasks**: Support for recurring tasks
- **Outcome Tracking**: Record task outcomes and notes

#### Task Service Capabilities
```typescript
// Get today's tasks
const todayTasks = await salesTaskService.getTodayTasks(userId);

// Get upcoming tasks (next 7 days by default)
const upcoming = await salesTaskService.getUpcomingTasks(userId, 7);

// Get overdue tasks (auto-marks as OVERDUE)
const overdue = await salesTaskService.getOverdueTasks(userId);

// Complete a task
await salesTaskService.completeTask(taskId, outcome, notes);

// Get statistics
const stats = await salesTaskService.getStatistics(userId);
// Returns: completion rate, avg completion time, breakdown by type
```

### 🎯 Phase 4: Sales Target & Performance Tracking

#### Sales Target System
- **Target Periods**: MONTHLY, QUARTERLY, HALF_YEARLY, YEARLY
- **Multiple Metrics**:
  - Target Leads
  - Target Site Visits
  - Target Conversions
  - Target Bookings
  - Target Revenue
- **Self-Targets**: Sales people can set personal stretch goals
- **Achievement Tracking**: Real-time calculation of achievement percentages
- **Incentive Calculation**:
  - Base Incentive
  - Earned Incentive (proportional to achievement)
  - Bonus Incentive (for exceeding targets)
- **Motivational Messages**: Auto-generated encouragement based on performance

#### Target Service Features
```typescript
// Create monthly target for salesperson
await salesTargetService.create({
  salesPersonId,
  targetPeriod: TargetPeriod.MONTHLY,
  targetBookings: 10,
  targetRevenue: 50000000, // 5 Crores
  baseIncentive: 50000,
});

// Update achievement (auto-calculates from actual performance)
const updated = await salesTargetService.updateAchievement(targetId);
// Auto-generates motivational message like:
// "💪 You're so close! Just 2 more bookings to hit your target. You've got this!"

// Get team performance
const teamStats = await salesTargetService.getTeamPerformanceSummary(teamMemberIds);
```

### 📈 Phase 5: Sales Person Dashboard

#### Comprehensive Dashboard Metrics
The dashboard aggregates data from all modules to provide a complete view:

```typescript
const dashboard = await salesDashboardService.getDashboardMetrics(salesPersonId);
```

**Returns:**
1. **Performance Summary**
   - Current target achievement %
   - Motivational message
   - Days remaining in period
   - Incentive breakdown

2. **Lead Metrics**
   - Total leads, new leads this month
   - Hot/Warm/Cold lead counts
   - Conversion rate
   - Leads by source breakdown

3. **Site Visit Metrics**
   - Pending this week
   - Completed this month
   - Scheduled upcoming
   - Average rating

4. **Follow-up Metrics**
   - Due today, due this week
   - Overdue count
   - Completed this month

5. **Task Metrics**
   - Due today, due this week
   - Overdue, completed today
   - Completion rate

6. **Revenue Metrics**
   - This month, this quarter
   - Average deal size
   - Projected month-end

7. **Recent Activities**
   - Latest 20 activities (followups + completed tasks)
   - Chronologically sorted

8. **Upcoming Events**
   - Next 7 days:
     - Follow-ups scheduled
     - Tasks due
     - Site visits
     - Meetings

### ⏰ Phase 6: Automated Reminder System

#### Cron Job Schedule
1. **Follow-up Reminders** (Every Hour)
   - Sends email 24 hours before follow-up
   - Includes lead details and previous notes
   
2. **Task Reminders** (Every Hour)
   - Configurable reminder time (default: 24 hours before)
   - Includes task details and related lead info

3. **Site Visit Confirmations** (Daily at 9 AM)
   - Sends to both customer and salesperson
   - Day before site visit
   - Includes property details and timing

4. **Reminder Flag Reset** (Daily at 10 PM)
   - Resets reminder flags for rescheduled follow-ups

#### Reminder Service Features
```typescript
// Auto-runs via cron
@Cron(CronExpression.EVERY_HOUR)
async sendFollowUpReminders()

@Cron('0 9 * * *')
async sendSiteVisitReminders()

// Manual trigger
await reminderService.sendManualReminder(leadId, 'followup');
```

## 🗄️ Database Schema

### New Tables Created

#### 1. `followups`
```sql
- id (UUID, Primary Key)
- lead_id (UUID, FK to leads)
- follow_up_date (DATE)
- follow_up_type (ENUM)
- duration_minutes (INT)
- performed_by (UUID, FK to users)
- outcome (ENUM)
- feedback (TEXT)
- customer_response (TEXT)
- next_follow_up_date (DATE)
- is_site_visit (BOOLEAN)
- site_visit_rating (INT)
- interest_level (INT)
- budget_fit (INT)
- timeline_fit (INT)
- reminder_sent (BOOLEAN)
```

#### 2. `sales_targets`
```sql
- id (UUID, Primary Key)
- sales_person_id (UUID, FK to users)
- target_period (ENUM: MONTHLY, QUARTERLY, etc.)
- start_date, end_date (DATE)
- target_leads, target_site_visits, target_conversions (INT)
- target_bookings, target_revenue (DECIMAL)
- achieved_* (corresponding fields for actual performance)
- *_achievement_pct (calculated percentages)
- base_incentive, earned_incentive, bonus_incentive (DECIMAL)
- motivational_message (TEXT)
- status (ENUM)
```

#### 3. `sales_tasks`
```sql
- id (UUID, Primary Key)
- title, description (VARCHAR, TEXT)
- task_type (ENUM: 10 types)
- priority (ENUM: LOW to URGENT)
- status (ENUM: PENDING to OVERDUE)
- assigned_to, assigned_by (UUID, FK to users)
- due_date, due_time (DATE, TIME)
- lead_id (UUID, FK to leads)
- location, meeting_link (VARCHAR)
- attendees (TEXT[])
- send_reminder, reminder_sent (BOOLEAN)
- is_recurring, recurrence_pattern (BOOLEAN, VARCHAR)
```

### Enhanced Existing Tables

#### `leads` - New Fields
```sql
- site_visit_status (ENUM)
- site_visit_time (TIME)
- last_site_visit_date (DATE)
- requirement_type (ENUM)
- property_preference (ENUM)
- tentative_purchase_timeframe (VARCHAR)
- last_follow_up_feedback (TEXT)
- total_follow_ups (INT)
- send_follow_up_reminder (BOOLEAN)
- reminder_sent (BOOLEAN)
- reminder_sent_at (TIMESTAMP)
```

#### `customers` - New Fields
```sql
- requirement_type (ENUM)
- property_preference (ENUM)
- tentative_purchase_timeframe (VARCHAR)
```

## 🔌 API Endpoints

### FollowUp APIs
```
POST   /followups                           - Create followup
GET    /followups/lead/:leadId              - Get all followups for a lead
GET    /followups/salesperson/:id           - Get followups by salesperson
GET    /followups/salesperson/:id/upcoming  - Get upcoming followups
GET    /followups/salesperson/:id/statistics - Get followup statistics
PATCH  /followups/:id                       - Update followup
DELETE /followups/:id                       - Delete followup
```

### Sales Task APIs
```
POST   /sales-tasks                         - Create task
GET    /sales-tasks/user/:userId            - Get all tasks for user
GET    /sales-tasks/user/:userId/today      - Get today's tasks
GET    /sales-tasks/user/:userId/upcoming   - Get upcoming tasks
GET    /sales-tasks/user/:userId/overdue    - Get overdue tasks
GET    /sales-tasks/user/:userId/statistics - Get task statistics
GET    /sales-tasks/user/:userId/by-date    - Get tasks by date range
PATCH  /sales-tasks/:id/complete            - Mark task complete
PATCH  /sales-tasks/:id/status              - Update task status
PATCH  /sales-tasks/:id/cancel              - Cancel task
```

### Sales Target APIs
```
POST   /sales-targets                                  - Create target
GET    /sales-targets/salesperson/:id                  - Get targets for salesperson
GET    /sales-targets/salesperson/:id/active           - Get active target
PATCH  /sales-targets/:id/update-achievement           - Recalculate achievement
PATCH  /sales-targets/:id/self-target                  - Update self-target
PATCH  /sales-targets/:id/mark-incentive-paid          - Mark incentive as paid
GET    /sales-targets/team/performance-summary         - Get team performance
GET    /sales-targets/team/targets                     - Get all team targets
```

### Dashboard API
```
GET    /sales-dashboard/:salesPersonId      - Get comprehensive dashboard
```

## 🚀 Implementation Status

### ✅ Completed

1. **Backend Entities & Database Schema**
   - All 3 new entities created
   - Enhanced existing entities
   - Migration SQL generated

2. **Services & Business Logic**
   - FollowUpService with statistics
   - SalesTaskService with scheduler functions
   - SalesTargetService with achievement calculation
   - SalesDashboardService with comprehensive metrics
   - ReminderService with cron jobs

3. **Controllers & APIs**
   - All REST endpoints implemented
   - JWT authentication integrated
   - Query parameter support

4. **Automation**
   - Automated reminder system (cron jobs)
   - Auto-calculation of achievements
   - Auto-generation of motivational messages

5. **Module Integration**
   - LeadsModule updated
   - EmployeesModule updated
   - NotificationsModule created
   - ScheduleModule integrated

### ⏳ Pending

1. **Database Migration**
   - Run migration SQL: `database-migration-sales-crm-phase1.sql`

2. **Email Service Integration**
   - Currently, email methods are prepared but commented out
   - Need to uncomment and configure EmailService

3. **Frontend Development** (Next Phase)
   - Sales Person Dashboard UI
   - Lead Management Enhanced UI
   - Task Scheduler Interface
   - Target Management Interface
   - Follow-up Forms

4. **Sales Head Console** (Priority Features)
   - Team overview dashboard
   - Lead assignment interface
   - Target setting for team
   - Team performance analytics
   - Field configuration abilities

## 📝 Usage Examples

### Creating a FollowUp After a Call
```typescript
const followUp = await followUpService.create({
  leadId: 'lead-uuid',
  followUpDate: new Date(),
  followUpType: FollowUpType.CALL,
  durationMinutes: 15,
  performedBy: 'salesperson-uuid',
  outcome: FollowUpOutcome.INTERESTED,
  feedback: 'Customer showed strong interest in 2BHK flats. Budget confirmed at 45L.',
  customerResponse: 'Wants to see property this weekend',
  interestLevel: 8,
  budgetFit: 9,
  timelineFit: 7,
  nextFollowUpDate: addDays(new Date(), 2),
  nextFollowUpPlan: 'Schedule site visit for Saturday 10 AM'
});
```

### Recording a Site Visit
```typescript
const siteVisit = await followUpService.create({
  leadId: 'lead-uuid',
  followUpDate: new Date(),
  followUpType: FollowUpType.SITE_VISIT,
  performedBy: 'salesperson-uuid',
  outcome: FollowUpOutcome.SITE_VISIT_SCHEDULED,
  isSiteVisit: true,
  siteVisitProperty: 'Eastern Heights - Tower A',
  siteVisitRating: 4, // 5-star rating
  siteVisitFeedback: 'Loved the view and amenities. Concerned about pricing.',
  feedback: 'Customer very positive but needs discount discussion',
  nextFollowUpDate: addDays(new Date(), 1),
  nextFollowUpPlan: 'Follow up with pricing options and payment plans'
});
```

### Setting Monthly Target
```typescript
const target = await salesTargetService.create({
  salesPersonId: 'salesperson-uuid',
  targetPeriod: TargetPeriod.MONTHLY,
  startDate: new Date('2025-10-01'),
  endDate: new Date('2025-10-31'),
  targetLeads: 50,
  targetSiteVisits: 20,
  targetConversions: 5,
  targetBookings: 3,
  targetRevenue: 30000000, // 3 Crores
  baseIncentive: 50000,
  setBy: 'sales-manager-uuid'
});

// Salesperson sets personal stretch goal
await salesTargetService.updateSelfTarget(
  target.id,
  5, // Self target: 5 bookings
  50000000, // Self target: 5 Crores
  'I want to hit 5 bookings this month!'
);
```

### Creating a Task
```typescript
const task = await salesTaskService.create({
  title: 'Property site visit with Mr. Sharma',
  taskType: TaskType.SITE_VISIT,
  priority: TaskPriority.HIGH,
  assignedTo: 'salesperson-uuid',
  dueDate: new Date('2025-10-20'),
  dueTime: '10:00',
  estimatedDurationMinutes: 120,
  leadId: 'lead-uuid',
  location: 'Eastern Heights, Tower A',
  notes: 'Customer interested in 2BHK on higher floors'
});
```

### Getting Dashboard Data
```typescript
const dashboard = await salesDashboardService.getDashboardMetrics('salesperson-uuid');

// Response includes:
{
  performance: {
    achievementPercentage: 75.5,
    motivationalMessage: "📈 Good progress! Just 2 more bookings to reach your target."
  },
  leads: {
    total: 45,
    hot: 10,
    conversionRate: 12.5
  },
  siteVisits: {
    pendingThisWeek: 5,
    completedThisMonth: 15
  },
  tasks: {
    dueToday: 3,
    overdue: 1
  },
  upcomingEvents: {
    followups: [...],
    tasks: [...],
    siteVisits: [...]
  }
}
```

## 🔧 Configuration

### Environment Variables Needed
```env
# Email Configuration (for reminder system)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@domain.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@easternestates.com
ADMIN_EMAIL=admin@easternestates.com
```

## 🎯 Next Steps

### Immediate Actions Required

1. **Run Database Migration**
   ```bash
   psql -U your_user -d your_database -f database-migration-sales-crm-phase1.sql
   ```

2. **Configure Email Service**
   - Update `.env` with SMTP credentials
   - Uncomment email sending code in `ReminderService`

3. **Test the System**
   ```bash
   npm run start:dev
   # Test APIs using Postman or similar
   ```

### Phase 4: Sales Head Console Features (Next Priority)

Based on your Sales Head's requirements:

1. **Lead Assignment Interface**
   - Drag-and-drop lead assignment
   - Bulk assignment capabilities
   - Assignment history

2. **Team Dashboard**
   - All team members' performance at a glance
   - Site visits pending in next week (team-wide)
   - Lead summary per salesperson
   - Top performers highlight

3. **Target Management**
   - Set targets for entire team or individuals
   - Edit existing targets
   - Target templates for quick setup

4. **Field Configuration**
   - Sales GM can customize dropdown values
   - Add/edit lead sources
   - Configure property types

5. **Team Reports**
   - Weekly performance reports
   - Lead source effectiveness
   - Conversion funnels
   - Incentive summaries

## 💡 Key Advantages

1. **Automation**: Reduces manual work with auto-reminders and auto-calculations
2. **Accountability**: Complete tracking of every interaction
3. **Motivation**: Real-time progress and encouraging messages
4. **Insights**: Detailed analytics for better decision-making
5. **Efficiency**: Personal scheduler helps salespeople organize their day
6. **Performance**: Clear targets and achievement tracking
7. **Customer Experience**: Timely follow-ups and no missed appointments

## 📞 Support

For any questions or customization needs regarding the Sales & CRM module, refer to:
- API documentation in controllers
- Service method JSDoc comments
- Entity field descriptions in entity files

---

**Module Status**: Backend Complete ✅ | Frontend Pending ⏳ | Database Migration Pending ⏳

**Last Updated**: October 2025
**Version**: 1.0.0



