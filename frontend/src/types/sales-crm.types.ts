/**
 * @file sales-crm.types.ts
 * @description TypeScript types for Sales & CRM module
 */

// ============================================
// Follow-up Types
// ============================================

export enum FollowUpType {
  CALL = 'CALL',
  EMAIL = 'EMAIL',
  MEETING = 'MEETING',
  WHATSAPP = 'WHATSAPP',
  SMS = 'SMS',
  SITE_VISIT = 'SITE_VISIT',
  VIDEO_CALL = 'VIDEO_CALL',
}

export enum FollowUpOutcome {
  INTERESTED = 'INTERESTED',
  NOT_INTERESTED = 'NOT_INTERESTED',
  CALLBACK_REQUESTED = 'CALLBACK_REQUESTED',
  SITE_VISIT_SCHEDULED = 'SITE_VISIT_SCHEDULED',
  DOCUMENTATION_REQUESTED = 'DOCUMENTATION_REQUESTED',
  PRICE_NEGOTIATION = 'PRICE_NEGOTIATION',
  NEEDS_TIME = 'NEEDS_TIME',
  NOT_REACHABLE = 'NOT_REACHABLE',
  WRONG_NUMBER = 'WRONG_NUMBER',
  CONVERTED = 'CONVERTED',
  LOST = 'LOST',
}

export interface FollowUp {
  id: string;
  leadId: string;
  followUpDate: Date | string;
  followUpType: FollowUpType;
  durationMinutes: number;
  performedBy: string;
  outcome: FollowUpOutcome;
  feedback: string;
  customerResponse?: string;
  actionsTaken?: string;
  leadStatusBefore?: string;
  leadStatusAfter?: string;
  nextFollowUpDate?: Date | string;
  nextFollowUpPlan?: string;
  isSiteVisit: boolean;
  siteVisitProperty?: string;
  siteVisitRating?: number;
  siteVisitFeedback?: string;
  interestLevel: number;
  budgetFit: number;
  timelineFit: number;
  reminderSent: boolean;
  reminderSentAt?: Date | string;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
  lead?: any;
  performedByUser?: any;
}

export interface CreateFollowUpDto {
  leadId: string;
  followUpDate: Date | string;
  followUpType: FollowUpType;
  durationMinutes?: number;
  performedBy: string;
  outcome: FollowUpOutcome;
  feedback: string;
  customerResponse?: string;
  actionsTaken?: string;
  leadStatusBefore?: string;
  leadStatusAfter?: string;
  nextFollowUpDate?: Date | string;
  nextFollowUpPlan?: string;
  isSiteVisit?: boolean;
  siteVisitProperty?: string;
  siteVisitRating?: number;
  siteVisitFeedback?: string;
  interestLevel?: number;
  budgetFit?: number;
  timelineFit?: number;
}

// ============================================
// Sales Task Types
// ============================================

export enum TaskType {
  FOLLOWUP_CALL = 'FOLLOWUP_CALL',
  SITE_VISIT = 'SITE_VISIT',
  MEETING = 'MEETING',
  DOCUMENTATION = 'DOCUMENTATION',
  PROPERTY_TOUR = 'PROPERTY_TOUR',
  CLIENT_MEETING = 'CLIENT_MEETING',
  INTERNAL_MEETING = 'INTERNAL_MEETING',
  EMAIL_FOLLOWUP = 'EMAIL_FOLLOWUP',
  NEGOTIATION = 'NEGOTIATION',
  OTHER = 'OTHER',
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum TaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  OVERDUE = 'OVERDUE',
}

export interface SalesTask {
  id: string;
  title: string;
  description?: string;
  taskType: TaskType;
  priority: TaskPriority;
  status: TaskStatus;
  assignedTo: string;
  assignedBy?: string;
  dueDate: Date | string;
  dueTime?: string;
  estimatedDurationMinutes: number;
  completedAt?: Date | string;
  leadId?: string;
  customerId?: string;
  propertyId?: string;
  location?: string;
  locationDetails?: string;
  attendees?: string[];
  meetingLink?: string;
  sendReminder: boolean;
  reminderBeforeMinutes: number;
  reminderSent: boolean;
  reminderSentAt?: Date | string;
  outcome?: string;
  notes?: string;
  attachments?: string[];
  isRecurring: boolean;
  recurrencePattern?: string;
  parentTaskId?: string;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
  createdBy?: string;
  lead?: any;
  assignedToUser?: any;
  assignedByUser?: any;
}

export interface CreateSalesTaskDto {
  title: string;
  description?: string;
  taskType: TaskType;
  priority?: TaskPriority;
  status?: TaskStatus;
  assignedTo: string;
  assignedBy?: string;
  dueDate: Date | string;
  dueTime?: string;
  estimatedDurationMinutes?: number;
  leadId?: string;
  customerId?: string;
  propertyId?: string;
  location?: string;
  locationDetails?: string;
  attendees?: string[];
  meetingLink?: string;
  sendReminder?: boolean;
  reminderBeforeMinutes?: number;
  notes?: string;
  isRecurring?: boolean;
  recurrencePattern?: string;
  createdBy?: string;
}

// ============================================
// Sales Target Types
// ============================================

export enum TargetPeriod {
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  HALF_YEARLY = 'HALF_YEARLY',
  YEARLY = 'YEARLY',
}

export enum TargetStatus {
  ACTIVE = 'ACTIVE',
  ACHIEVED = 'ACHIEVED',
  MISSED = 'MISSED',
  IN_PROGRESS = 'IN_PROGRESS',
}

export interface SalesTarget {
  id: string;
  salesPersonId: string;
  targetPeriod: TargetPeriod;
  startDate: Date | string;
  endDate: Date | string;
  targetLeads: number;
  targetSiteVisits: number;
  targetConversions: number;
  targetBookings: number;
  targetRevenue: number;
  selfTargetBookings: number;
  selfTargetRevenue: number;
  selfTargetNotes?: string;
  achievedLeads: number;
  achievedSiteVisits: number;
  achievedConversions: number;
  achievedBookings: number;
  achievedRevenue: number;
  leadsAchievementPct: number;
  siteVisitsAchievementPct: number;
  conversionsAchievementPct: number;
  bookingsAchievementPct: number;
  revenueAchievementPct: number;
  overallAchievementPct: number;
  baseIncentive: number;
  earnedIncentive: number;
  bonusIncentive: number;
  totalIncentive: number;
  incentivePaid: boolean;
  incentivePaidDate?: Date | string;
  motivationalMessage?: string;
  missedBy: number;
  status: TargetStatus;
  setBy?: string;
  notes?: string;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
  updatedBy?: string;
  salesPerson?: any;
}

export interface CreateSalesTargetDto {
  salesPersonId: string;
  targetPeriod: TargetPeriod;
  startDate: Date | string;
  endDate: Date | string;
  targetLeads?: number;
  targetSiteVisits?: number;
  targetConversions?: number;
  targetBookings?: number;
  targetRevenue?: number;
  selfTargetBookings?: number;
  selfTargetRevenue?: number;
  selfTargetNotes?: string;
  baseIncentive?: number;
  setBy?: string;
  notes?: string;
}

// ============================================
// Dashboard Types
// ============================================

export interface DashboardMetrics {
  performance: {
    currentTarget: any;
    achievementPercentage: number;
    motivationalMessage: string;
    missedBy: number;
    daysRemaining: number;
  };
  leads: {
    total: number;
    new: number;
    active: number;
    hot: number;
    warm: number;
    cold: number;
    converted: number;
    bySource: Record<string, number>;
    conversionRate: number;
  };
  siteVisits: {
    pendingThisWeek: number;
    completedThisMonth: number;
    scheduledUpcoming: number;
    avgRating: number;
  };
  followups: {
    dueToday: number;
    dueThisWeek: number;
    overdue: number;
    completedThisMonth: number;
    avgResponseTime: number;
  };
  tasks: {
    dueToday: number;
    dueThisWeek: number;
    overdue: number;
    completedToday: number;
    completionRate: number;
  };
  revenue: {
    thisMonth: number;
    thisQuarter: number;
    avgDealSize: number;
    projectedMonthEnd: number;
  };
  recentActivities: Array<{
    type: string;
    date: Date | string;
    title: string;
    outcome?: string;
    feedback?: string;
    taskType?: string;
  }>;
  upcomingEvents: {
    followups: Array<{
      date: Date | string;
      leadName?: string;
      plan?: string;
    }>;
    tasks: Array<{
      date: Date | string;
      time?: string;
      title: string;
      taskType: TaskType;
      priority: TaskPriority;
    }>;
    siteVisits: Array<{
      date: Date | string;
      time?: string;
      leadName?: string;
      property?: string;
    }>;
    meetings: any[];
  };
}

// ============================================
// Statistics Types
// ============================================

export interface FollowUpStatistics {
  totalFollowUps: number;
  byCalls: number;
  byEmails: number;
  byMeetings: number;
  bySiteVisits: number;
  outcomes: {
    interested: number;
    notInterested: number;
    converted: number;
    siteVisitScheduled: number;
  };
  avgInterestLevel: number;
  avgBudgetFit: number;
  avgTimelineFit: number;
  totalDurationMinutes: number;
}

export interface TaskStatistics {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  overdue: number;
  cancelled: number;
  byType: Record<string, number>;
  completionRate: number;
  avgCompletionTime: number;
}



