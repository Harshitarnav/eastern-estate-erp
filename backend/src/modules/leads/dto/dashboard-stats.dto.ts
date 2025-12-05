import { IsOptional, IsUUID, IsDateString } from 'class-validator';

export class GetDashboardStatsDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsUUID('4')
  agentId?: string;

   @IsOptional()
   @IsUUID('4')
   propertyId?: string;

   @IsOptional()
   @IsUUID('4')
   towerId?: string;

   @IsOptional()
   @IsUUID('4')
   flatId?: string;
}

export class AgentDashboardStatsDto {
  totalLeads: number;
  newLeads: number;
  inProgress: number;
  converted: number;
  conversionRate: number;
  dueFollowUps: number;
  scheduledTasks: number;
  monthlyAchievement: {
    target: number;
    achieved: number;
    percentage: number;
  };
  weeklyAchievement: {
    target: number;
    achieved: number;
    percentage: number;
  };
  leadsByStatus: {
    status: string;
    count: number;
  }[];
  leadsBySource: {
    source: string;
    count: number;
  }[];
}

export class AdminDashboardStatsDto {
  totalLeads: number;
  totalAgents: number;
  averageConversionRate: number;
  totalRevenue: number;
  leadsByStatus: {
    status: string;
    count: number;
  }[];
  leadsBySource: {
    source: string;
    count: number;
  }[];
  propertyWiseBreakdown: {
    propertyId: string;
    propertyName: string;
    leads: number;
    conversions: number;
    conversionRate: number;
  }[];
  topPerformers: {
    agentId: string;
    agentName: string;
    totalLeads: number;
    conversions: number;
    conversionRate: number;
  }[];
  recentActivity: {
    date: Date;
    leadsGenerated: number;
    leadsConverted: number;
  }[];
}

export class TeamDashboardStatsDto {
  teamLeads: number;
  teamConversions: number;
  teamConversionRate: number;
  agentPerformance: {
    agentId: string;
    agentName: string;
    totalLeads: number;
    conversions: number;
    conversionRate: number;
    dueFollowUps: number;
  }[];
  propertyMetrics: {
    propertyId: string;
    propertyName: string;
    leads: number;
    conversions: number;
  }[];
  taskOverview: {
    pending: number;
    completed: number;
    overdue: number;
  };
}
