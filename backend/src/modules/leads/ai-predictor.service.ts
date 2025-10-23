import { Injectable } from '@nestjs/common';
import { Lead } from './entities/lead.entity';

interface ConversionPrediction {
  probability: number;
  category: string;
  color: string;
  emoji: string;
  reasons: string[];
}

@Injectable()
export class AIConversionPredictor {
  /**
   * Predict conversion probability using 7-factor algorithm
   */
  predictConversionProbability(lead: Lead): ConversionPrediction {
    let probability = 50; // Base 50%
    const reasons: string[] = [];

    // Factor 1: Lead Status (25%)
    const statusScores: Record<string, number> = {
      QUALIFIED: 15,
      NEGOTIATION: 20,
      CONTACTED: 10,
      NEW: 5,
      ON_HOLD: -10,
      LOST: -25,
      WON: 25,
    };
    const statusScore = statusScores[lead.status] || 0;
    probability += statusScore;
    if (statusScore > 10) {
      reasons.push(`${lead.status} status shows strong interest`);
    }

    // Factor 2: Engagement Level (20%)
    const totalInteractions = 
      (lead.totalCalls || 0) + 
      (lead.totalEmails || 0) + 
      (lead.totalMeetings || 0);
    
    if (totalInteractions > 10) {
      probability += 20;
      reasons.push('High engagement - 10+ interactions');
    } else if (totalInteractions > 5) {
      probability += 10;
      reasons.push('Good engagement level');
    } else if (totalInteractions > 2) {
      probability += 5;
    }

    // Factor 3: Site Visit (15%)
    if (lead.hasSiteVisit) {
      probability += 15;
      reasons.push('Site visit completed');
      
      if ((lead.totalSiteVisits || 0) > 1) {
        probability += 5;
        reasons.push('Multiple site visits show serious intent');
      }
    }

    // Factor 4: Budget Alignment (15%)
    if (lead.budgetMin && lead.budgetMax) {
      probability += 15;
      reasons.push('Clear budget range provided');
    } else if (lead.budgetMin) {
      probability += 10;
      reasons.push('Minimum budget shared');
    }

    // Factor 5: Response Speed (10%)
    if (lead.lastContactedAt) {
      const daysSinceContact = 
        (Date.now() - new Date(lead.lastContactedAt).getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysSinceContact < 1) {
        probability += 10;
        reasons.push('Recently contacted - active lead');
      } else if (daysSinceContact < 3) {
        probability += 5;
      } else if (daysSinceContact > 7) {
        probability -= 10;
        reasons.push('Warning: No contact in 7+ days');
      }
    }

    // Factor 6: Source Quality (10%)
    const sourceScores: Record<string, number> = {
      REFERRAL: 10,
      WALK_IN: 8,
      EXHIBITION: 6,
      WEBSITE: 5,
      SOCIAL_MEDIA: 3,
      PHONE: 4,
      EMAIL: 4,
      ADVERTISEMENT: 5,
      BROKER: 7,
      OTHER: 2,
    };
    const sourceScore = sourceScores[lead.source] || 0;
    probability += sourceScore;
    if (sourceScore >= 8) {
      reasons.push(`High-quality ${lead.source.toLowerCase()} source`);
    }

    // Factor 7: Total Follow-ups (5%)
    if (lead.totalFollowUps) {
      const followupBonus = Math.min(lead.totalFollowUps / 2, 5); // Max 5 points
      probability += followupBonus;
      if (lead.totalFollowUps >= 10) {
        reasons.push('Extensive follow-up history');
      }
    }

    // Normalize to 0-100 range
    probability = Math.max(0, Math.min(100, probability));

    const category = this.getConversionCategory(probability);

    return {
      probability: Math.round(probability),
      category: category.category,
      color: category.color,
      emoji: category.emoji,
      reasons,
    };
  }

  private getConversionCategory(probability: number): {
    category: string;
    color: string;
    emoji: string;
  } {
    if (probability >= 80) {
      return { category: 'Very High', color: '#10B981', emoji: '🔥' };
    } else if (probability >= 60) {
      return { category: 'High', color: '#3B82F6', emoji: '⭐' };
    } else if (probability >= 40) {
      return { category: 'Medium', color: '#F59E0B', emoji: '💡' };
    } else if (probability >= 20) {
      return { category: 'Low', color: '#EF4444', emoji: '⚠️' };
    } else {
      return { category: 'Very Low', color: '#6B7280', emoji: '❄️' };
    }
  }

  /**
   * Get next best action for lead based on prediction
   */
  suggestNextAction(lead: Lead, prediction: ConversionPrediction): string {
    if (prediction.probability >= 80) {
      return 'Schedule site visit or close deal ASAP';
    } else if (prediction.probability >= 60) {
      return 'Send detailed property information and pricing';
    } else if (prediction.probability >= 40) {
      return 'Schedule follow-up call to understand requirements better';
    } else if (prediction.probability >= 20) {
      return 'Share relevant case studies or testimonials';
    } else {
      return 'Re-qualify lead - may need nurturing or disqualification';
    }
  }
}
