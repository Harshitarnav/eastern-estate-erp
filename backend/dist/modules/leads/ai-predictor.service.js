"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIConversionPredictor = void 0;
const common_1 = require("@nestjs/common");
let AIConversionPredictor = class AIConversionPredictor {
    predictConversionProbability(lead) {
        let probability = 50;
        const reasons = [];
        const statusScores = {
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
        const totalInteractions = (lead.totalCalls || 0) +
            (lead.totalEmails || 0) +
            (lead.totalMeetings || 0);
        if (totalInteractions > 10) {
            probability += 20;
            reasons.push('High engagement - 10+ interactions');
        }
        else if (totalInteractions > 5) {
            probability += 10;
            reasons.push('Good engagement level');
        }
        else if (totalInteractions > 2) {
            probability += 5;
        }
        if (lead.hasSiteVisit) {
            probability += 15;
            reasons.push('Site visit completed');
            if ((lead.totalSiteVisits || 0) > 1) {
                probability += 5;
                reasons.push('Multiple site visits show serious intent');
            }
        }
        if (lead.budgetMin && lead.budgetMax) {
            probability += 15;
            reasons.push('Clear budget range provided');
        }
        else if (lead.budgetMin) {
            probability += 10;
            reasons.push('Minimum budget shared');
        }
        if (lead.lastContactedAt) {
            const daysSinceContact = (Date.now() - new Date(lead.lastContactedAt).getTime()) / (1000 * 60 * 60 * 24);
            if (daysSinceContact < 1) {
                probability += 10;
                reasons.push('Recently contacted - active lead');
            }
            else if (daysSinceContact < 3) {
                probability += 5;
            }
            else if (daysSinceContact > 7) {
                probability -= 10;
                reasons.push('Warning: No contact in 7+ days');
            }
        }
        const sourceScores = {
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
        if (lead.totalFollowUps) {
            const followupBonus = Math.min(lead.totalFollowUps / 2, 5);
            probability += followupBonus;
            if (lead.totalFollowUps >= 10) {
                reasons.push('Extensive follow-up history');
            }
        }
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
    getConversionCategory(probability) {
        if (probability >= 80) {
            return { category: 'Very High', color: '#10B981', emoji: '🔥' };
        }
        else if (probability >= 60) {
            return { category: 'High', color: '#3B82F6', emoji: '⭐' };
        }
        else if (probability >= 40) {
            return { category: 'Medium', color: '#F59E0B', emoji: '💡' };
        }
        else if (probability >= 20) {
            return { category: 'Low', color: '#EF4444', emoji: '⚠️' };
        }
        else {
            return { category: 'Very Low', color: '#6B7280', emoji: '❄️' };
        }
    }
    suggestNextAction(lead, prediction) {
        if (prediction.probability >= 80) {
            return 'Schedule site visit or close deal ASAP';
        }
        else if (prediction.probability >= 60) {
            return 'Send detailed property information and pricing';
        }
        else if (prediction.probability >= 40) {
            return 'Schedule follow-up call to understand requirements better';
        }
        else if (prediction.probability >= 20) {
            return 'Share relevant case studies or testimonials';
        }
        else {
            return 'Re-qualify lead - may need nurturing or disqualification';
        }
    }
};
exports.AIConversionPredictor = AIConversionPredictor;
exports.AIConversionPredictor = AIConversionPredictor = __decorate([
    (0, common_1.Injectable)()
], AIConversionPredictor);
//# sourceMappingURL=ai-predictor.service.js.map