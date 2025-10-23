"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PriorityService = void 0;
const common_1 = require("@nestjs/common");
const lead_entity_1 = require("./entities/lead.entity");
let PriorityService = class PriorityService {
    calculateLeadPriority(lead, now = new Date()) {
        let score = 0;
        const reasons = [];
        if (lead.nextFollowUpDate) {
            const followUpDate = new Date(lead.nextFollowUpDate);
            const hoursUntilFollowUp = (followUpDate.getTime() - now.getTime()) / (1000 * 60 * 60);
            if (hoursUntilFollowUp < 0) {
                score += 40;
                reasons.push(`Follow-up overdue by ${Math.abs(Math.round(hoursUntilFollowUp))} hours`);
            }
            else if (hoursUntilFollowUp < 1) {
                score += 35;
                reasons.push('Follow-up due in less than 1 hour');
            }
            else if (hoursUntilFollowUp < 4) {
                score += 30;
                reasons.push('Follow-up due today');
            }
            else if (hoursUntilFollowUp < 24) {
                score += 20;
                reasons.push('Follow-up due today');
            }
            else if (hoursUntilFollowUp < 48) {
                score += 10;
                reasons.push('Follow-up due tomorrow');
            }
        }
        if (lead.status === lead_entity_1.LeadStatus.QUALIFIED) {
            score += 25;
            reasons.push('Hot lead - high interest');
        }
        else if (lead.status === lead_entity_1.LeadStatus.CONTACTED) {
            score += 20;
            reasons.push('Interested lead');
        }
        else if (lead.status === lead_entity_1.LeadStatus.NEW) {
            score += 10;
            reasons.push('New lead needs first contact');
        }
        if (lead.priority === 'URGENT') {
            score += 15;
            reasons.push('Marked as urgent');
        }
        else if (lead.priority === 'HIGH') {
            score += 10;
            reasons.push('High priority');
        }
        else if (lead.priority === 'MEDIUM') {
            score += 5;
            reasons.push('Medium priority');
        }
        if (lead.lastContactedAt) {
            const lastContact = new Date(lead.lastContactedAt);
            const daysSinceContact = (now.getTime() - lastContact.getTime()) / (1000 * 60 * 60 * 24);
            if (daysSinceContact > 7) {
                score += 10;
                reasons.push(`No contact for ${Math.round(daysSinceContact)} days`);
            }
            else if (daysSinceContact > 3) {
                score += 5;
                reasons.push('Contact within a week');
            }
        }
        else {
            score += 8;
            reasons.push('Never contacted');
        }
        if (lead.hasSiteVisit === false && lead.status === lead_entity_1.LeadStatus.CONTACTED) {
            score += 10;
            reasons.push('Site visit not scheduled');
        }
        let urgency;
        let color;
        let emoji;
        if (score >= 70) {
            urgency = 'URGENT';
            color = '#EF4444';
            emoji = '🔴';
        }
        else if (score >= 50) {
            urgency = 'HIGH';
            color = '#F59E0B';
            emoji = '🟡';
        }
        else if (score >= 30) {
            urgency = 'MEDIUM';
            color = '#3B82F6';
            emoji = '🔵';
        }
        else {
            urgency = 'LOW';
            color = '#6B7280';
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
    prioritizeLeads(leads) {
        const now = new Date();
        return leads
            .map(lead => ({
            lead,
            priority: this.calculateLeadPriority(lead, now),
        }))
            .sort((a, b) => b.priority.score - a.priority.score)
            .map(item => item.lead);
    }
    async getTodaysPrioritizedTasks(leads) {
        const now = new Date();
        const endOfDay = new Date(now);
        endOfDay.setHours(23, 59, 59, 999);
        const tasks = [];
        for (const lead of leads) {
            const priority = this.calculateLeadPriority(lead, now);
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
            if (!lead.lastContactedAt && lead.status === lead_entity_1.LeadStatus.NEW) {
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
            if (!lead.hasSiteVisit && lead.status === lead_entity_1.LeadStatus.CONTACTED) {
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
        return tasks.sort((a, b) => b.priority.score - a.priority.score);
    }
    getMotivationalMessage(stats) {
        const { achievementPercentage, daysRemaining, missedBy } = stats;
        if (achievementPercentage >= 100) {
            return `🎉 Outstanding! You've crushed your target! Keep the momentum going!`;
        }
        else if (achievementPercentage >= 90) {
            return `🔥 You're so close! Just a little push to hit 100%!`;
        }
        else if (achievementPercentage >= 75) {
            return `💪 Great progress! ${Math.round(100 - achievementPercentage)}% more to reach your goal!`;
        }
        else if (achievementPercentage >= 50) {
            return `📈 Halfway there! ${daysRemaining} days left to make it happen!`;
        }
        else if (achievementPercentage >= 25) {
            return `⚡ Time to accelerate! Focus on your hot leads!`;
        }
        else if (daysRemaining <= 3) {
            return `🚀 Final push needed! Let's finish strong!`;
        }
        else {
            return `🌟 Every great journey starts with a single step. Let's make today count!`;
        }
    }
    getSmartTips(leads) {
        const tips = [];
        const now = new Date();
        const overdueFollowUps = leads.filter(l => l.nextFollowUpDate && new Date(l.nextFollowUpDate) < now).length;
        const hotLeads = leads.filter(l => l.status === lead_entity_1.LeadStatus.QUALIFIED).length;
        const coldLeads = leads.filter(l => {
            if (!l.lastContactedAt)
                return false;
            const daysSince = (now.getTime() - new Date(l.lastContactedAt).getTime()) / (1000 * 60 * 60 * 24);
            return daysSince > 7;
        }).length;
        if (overdueFollowUps > 0) {
            tips.push(`⚠️ You have ${overdueFollowUps} overdue follow-ups. Prioritize these first!`);
        }
        if (hotLeads > 0) {
            tips.push(`🔥 ${hotLeads} hot leads need your attention. Strike while the iron is hot!`);
        }
        if (coldLeads > 3) {
            tips.push(`❄️ ${coldLeads} leads haven't been contacted in a week. Time to re-engage!`);
        }
        const hour = now.getHours();
        if (hour >= 10 && hour <= 11) {
            tips.push(`☀️ Morning is the best time to call! People are usually available.`);
        }
        else if (hour >= 14 && hour <= 16) {
            tips.push(`📞 Afternoon is great for follow-ups! Catch people after lunch.`);
        }
        return tips;
    }
};
exports.PriorityService = PriorityService;
exports.PriorityService = PriorityService = __decorate([
    (0, common_1.Injectable)()
], PriorityService);
//# sourceMappingURL=priority.service.js.map