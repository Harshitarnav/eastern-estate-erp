 import { Injectable } from '@nestjs/common';
import { Lead, LeadStatus } from './entities/lead.entity';

export interface PriorityScore {
  score: number;
  urgency: 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';
  reasons: string[];
  color: string;
  emoji: string;
}

export interface PrioritizedTask {
  id: string;
  type: 'FOLLOW_UP' | 'FIRST_CONTACT' | 'SITE_VISIT' | 'CALLBACK';
  lead: Lead;
  dueDate: Date;
  priority: PriorityScore;
  action: string;
  quickActions: Array<{
    label: string;
    icon: string;
    action: string;
  }>;
}

@Injectable()
export class PriorityService {
  /**
   * Calculate priority score for a lead based on multiple factors
   */
  calculateLeadPriority(lead: Lead, now: Date = new Date()): PriorityScore {
    let score = 0;
    const reasons: string[] = [];

    // Factor 1: Follow-up timing (0-40 points)
    if (lead.nextFollowUpDate) {
      const followUpDate = new Date(lead.nextFollowUpDate);
      const hoursUntilFollowUp = (followUpDate.getTime() - now.getTime()) / (1000 * 60 * 60);

      if (hoursUntilFollowUp < 0) {
        score += 40;
        reasons.push(`Follow-up overdue by ${Math.abs(Math.round(hoursUntilFollowUp))} hours`);
      } else if (hoursUntilFollowUp < 1) {
        score += 35;
        reasons.push('Follow-up due in less than 1 hour');
      } else if (hoursUntilFollowUp < 4) {
        score += 30;
        reasons.push('Follow-up due today');
      } else if (hoursUntilFollowUp < 24) {
        score += 20;
        reasons.push('Follow-up due today');
      } else if (hoursUntilFollowUp < 48) {
        score += 10;
        reasons.push('Follow-up due tomorrow');
      }
    }

    // Factor 2: Lead status (0-25 points)
    if (lead.status === LeadStatus.QUALIFIED) {
      score += 25;
      reasons.push('Hot lead - high interest');
    } else if (lead.status === LeadStatus.CONTACTED) {
      score += 20;
      reasons.push('Interested lead');
    } else if (lead.status === LeadStatus.NEW) {
      score += 10;
      reasons.push('New lead needs first contact');
    }

    // Factor 3: Lead priority field (0-15 points)
    if (lead.priority === 'URGENT') {
      score += 15;
      reasons.push('Marked as urgent');
    } else if (lead.priority === 'HIGH') {
      score += 10;
      reasons.push('High priority');
    } else if (lead.priority === 'MEDIUM') {
      score += 5;
      reasons.push('Medium priority');
    }

    // Factor 4: Time since last contact (0-10 points)
    if (lead.lastContactedAt) {
      const lastContact = new Date(lead.lastContactedAt);
      const daysSinceContact = (now.getTime() - lastContact.getTime()) / (1000 * 60 * 60 * 24);

      if (daysSinceContact > 7) {
        score += 10;
        reasons.push(`No contact for ${Math.round(daysSinceContact)} days`);
      } else if (daysSinceContact > 3) {
        score += 5;
        reasons.push('Contact within a week');
      }
    } else {
      score += 8;
      reasons.push('Never contacted');
    }

    // Factor 5: Site visit pending (0-10 points)
    if (lead.hasSiteVisit === false && lead.status === LeadStatus.CONTACTED) {
      score += 10;
      reasons.push('Site visit not scheduled');
    }

    // Determine urgency level and styling
    let urgency: PriorityScore['urgency'];
    let color: string;
    let emoji: string;

    if (score >= 70) {
      urgency = 'URGENT';
      color = '#EF4444'; // Red
      emoji = '🔴';
    } else if (score >= 50) {
      urgency = 'HIGH';
      color = '#F59E0B'; // Orange
      emoji = '🟡';
    } else if (score >= 30) {
      urgency = 'MEDIUM';
      color = '#3B82F6'; // Blue
      emoji = '🔵';
    } else {
      urgency = 'LOW';
      color = '#6B7280'; // Gray
      emoji = '⚪';
    }

    return {
      score,
      urgency,
      reasons,
      color,
      emoji,
    };
  }

  /**
   * Prioritize a list of leads
   */
  prioritizeLeads(leads: Lead[]): Lead[] {
    const now = new Date();
    
    return leads
      .map(lead => ({
        lead,
        priority: this.calculateLeadPriority(lead, now),
      }))
      .sort((a, b) => b.priority.score - a.priority.score)
      .map(item => item.lead);
  }

  /**
   * Get today's prioritized tasks for an agent
   */
  async getTodaysPrioritizedTasks(leads: Lead[]): Promise<PrioritizedTask[]> {
    const now = new Date();
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    const tasks: PrioritizedTask[] = [];

    for (const lead of leads) {
      const priority = this.calculateLeadPriority(lead, now);

      // Follow-ups due today
      if (lead.nextFollowUpDate) {
        const followUpDate = new Date(lead.nextFollowUpDate);
        if (followUpDate <= endOfDay) {
          tasks.push({
            id: `followup-${lead.id}`,
            type: 'FOLLOW_UP',
            lead,
            dueDate: followUpDate,
            priority,
            action: `Call ${lead.firstName} ${lead.lastName}`,
            quickActions: [
              { label: 'Call', icon: '📞', action: `tel:${lead.phone}` },
              { label: 'Reschedule', icon: '📅', action: 'reschedule' },
              { label: 'Done', icon: '✅', action: 'complete' },
            ],
          });
        }
      }

      // New leads needing first contact
      if (!lead.lastContactedAt && lead.status === LeadStatus.NEW) {
        tasks.push({
          id: `first-contact-${lead.id}`,
          type: 'FIRST_CONTACT',
          lead,
          dueDate: lead.createdAt,
          priority,
          action: `First contact: ${lead.firstName} ${lead.lastName}`,
          quickActions: [
              { label: 'Call', icon: '📞', action: `tel:${lead.phone}` },
              { label: 'WhatsApp', icon: '💬', action: `whatsapp:${lead.phone}` },
              { label: 'Email', icon: '📧', action: `mailto:${lead.email}` },
            ],
          });
      }

      // Site visits pending
      if (!lead.hasSiteVisit && lead.status === LeadStatus.CONTACTED) {
        tasks.push({
          id: `site-visit-${lead.id}`,
          type: 'SITE_VISIT',
          lead,
          dueDate: lead.updatedAt,
          priority,
          action: `Schedule site visit for ${lead.firstName} ${lead.lastName}`,
          quickActions: [
            { label: 'Schedule', icon: '📅', action: 'schedule-visit' },
            { label: 'Call', icon: '📞', action: `tel:${lead.phone}` },
          ],
        });
      }
    }

    // Sort by priority score
    return tasks.sort((a, b) => b.priority.score - a.priority.score);
  }

  /**
   * Get motivation message based on performance
   */
  getMotivationalMessage(stats: {
    achievementPercentage: number;
    daysRemaining: number;
    missedBy: number;
  }): string {
    const { achievementPercentage, daysRemaining, missedBy } = stats;

    if (achievementPercentage >= 100) {
      return `🎉 Outstanding! You've crushed your target! Keep the momentum going!`;
    } else if (achievementPercentage >= 90) {
      return `🔥 You're so close! Just a little push to hit 100%!`;
    } else if (achievementPercentage >= 75) {
      return `💪 Great progress! ${Math.round(100 - achievementPercentage)}% more to reach your goal!`;
    } else if (achievementPercentage >= 50) {
      return `📈 Halfway there! ${daysRemaining} days left to make it happen!`;
    } else if (achievementPercentage >= 25) {
      return `⚡ Time to accelerate! Focus on your hot leads!`;
    } else if (daysRemaining <= 3) {
      return `🚀 Final push needed! Let's finish strong!`;
    } else {
      return `🌟 Every great journey starts with a single step. Let's make today count!`;
    }
  }

  /**
   * Generate smart tips based on lead data
   */
  getSmartTips(leads: Lead[]): string[] {
    const tips: string[] = [];
    const now = new Date();

    // Count leads by status
    const overdueFollowUps = leads.filter(l => 
      l.nextFollowUpDate && new Date(l.nextFollowUpDate) < now
    ).length;

    const hotLeads = leads.filter(l => l.status === LeadStatus.QUALIFIED).length;
    const coldLeads = leads.filter(l => {
      if (!l.lastContactedAt) return false;
      const daysSince = (now.getTime() - new Date(l.lastContactedAt).getTime()) / (1000 * 60 * 60 * 24);
      return daysSince > 7;
    }).length;

    // Generate tips
    if (overdueFollowUps > 0) {
      tips.push(`⚠️ You have ${overdueFollowUps} overdue follow-ups. Prioritize these first!`);
    }

    if (hotLeads > 0) {
      tips.push(`🔥 ${hotLeads} hot leads need your attention. Strike while the iron is hot!`);
    }

    if (coldLeads > 3) {
      tips.push(`❄️ ${coldLeads} leads haven't been contacted in a week. Time to re-engage!`);
    }

    // Time-based tips
    const hour = now.getHours();
    if (hour >= 10 && hour <= 11) {
      tips.push(`☀️ Morning is the best time to call! People are usually available.`);
    } else if (hour >= 14 && hour <= 16) {
      tips.push(`📞 Afternoon is great for follow-ups! Catch people after lunch.`);
    }

    return tips;
  }
}
