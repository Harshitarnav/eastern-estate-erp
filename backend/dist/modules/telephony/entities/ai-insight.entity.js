"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiInsight = void 0;
const typeorm_1 = require("typeorm");
const call_log_entity_1 = require("./call-log.entity");
const call_transcription_entity_1 = require("./call-transcription.entity");
let AiInsight = class AiInsight {
};
exports.AiInsight = AiInsight;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], AiInsight.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'call_log_id', type: 'uuid' }),
    __metadata("design:type", String)
], AiInsight.prototype, "callLogId", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => call_log_entity_1.CallLog, callLog => callLog.aiInsight),
    (0, typeorm_1.JoinColumn)({ name: 'call_log_id' }),
    __metadata("design:type", call_log_entity_1.CallLog)
], AiInsight.prototype, "callLog", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'transcription_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], AiInsight.prototype, "transcriptionId", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => call_transcription_entity_1.CallTranscription, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'transcription_id' }),
    __metadata("design:type", call_transcription_entity_1.CallTranscription)
], AiInsight.prototype, "transcription", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'summary', type: 'text', nullable: true }),
    __metadata("design:type", String)
], AiInsight.prototype, "summary", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'detailed_summary', type: 'text', nullable: true }),
    __metadata("design:type", String)
], AiInsight.prototype, "detailedSummary", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'key_points', type: 'text', array: true, nullable: true }),
    __metadata("design:type", Array)
], AiInsight.prototype, "keyPoints", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'overall_sentiment', nullable: true }),
    __metadata("design:type", String)
], AiInsight.prototype, "overallSentiment", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sentiment_score', type: 'decimal', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], AiInsight.prototype, "sentimentScore", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sentiment_by_segment', type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], AiInsight.prototype, "sentimentBySegment", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'customer_emotion', nullable: true }),
    __metadata("design:type", String)
], AiInsight.prototype, "customerEmotion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'primary_intent', nullable: true }),
    __metadata("design:type", String)
], AiInsight.prototype, "primaryIntent", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'secondary_intents', type: 'text', array: true, nullable: true }),
    __metadata("design:type", Array)
], AiInsight.prototype, "secondaryIntents", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'intent_confidence', type: 'decimal', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], AiInsight.prototype, "intentConfidence", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'customer_name', nullable: true }),
    __metadata("design:type", String)
], AiInsight.prototype, "customerName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'customer_email', nullable: true }),
    __metadata("design:type", String)
], AiInsight.prototype, "customerEmail", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'customer_phone', nullable: true }),
    __metadata("design:type", String)
], AiInsight.prototype, "customerPhone", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'customer_alternate_phone', nullable: true }),
    __metadata("design:type", String)
], AiInsight.prototype, "customerAlternatePhone", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'budget_min', type: 'decimal', precision: 15, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], AiInsight.prototype, "budgetMin", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'budget_max', type: 'decimal', precision: 15, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], AiInsight.prototype, "budgetMax", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'budget_currency', default: 'INR' }),
    __metadata("design:type", String)
], AiInsight.prototype, "budgetCurrency", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'preferred_location', type: 'text', nullable: true }),
    __metadata("design:type", String)
], AiInsight.prototype, "preferredLocation", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'property_type', nullable: true }),
    __metadata("design:type", String)
], AiInsight.prototype, "propertyType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'bhk_requirement', nullable: true }),
    __metadata("design:type", String)
], AiInsight.prototype, "bhkRequirement", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'property_requirements', type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], AiInsight.prototype, "propertyRequirements", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'timeline', nullable: true }),
    __metadata("design:type", String)
], AiInsight.prototype, "timeline", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'urgency_level', nullable: true }),
    __metadata("design:type", String)
], AiInsight.prototype, "urgencyLevel", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ready_to_visit', nullable: true }),
    __metadata("design:type", Boolean)
], AiInsight.prototype, "readyToVisit", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'preferred_visit_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], AiInsight.prototype, "preferredVisitDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'key_topics', type: 'text', array: true, nullable: true }),
    __metadata("design:type", Array)
], AiInsight.prototype, "keyTopics", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'mentioned_properties', type: 'text', array: true, nullable: true }),
    __metadata("design:type", Array)
], AiInsight.prototype, "mentionedProperties", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'mentioned_competitors', type: 'text', array: true, nullable: true }),
    __metadata("design:type", Array)
], AiInsight.prototype, "mentionedCompetitors", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'customer_questions', type: 'jsonb', nullable: true }),
    __metadata("design:type", Array)
], AiInsight.prototype, "customerQuestions", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'objections', type: 'jsonb', nullable: true }),
    __metadata("design:type", Array)
], AiInsight.prototype, "objections", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'action_items', type: 'jsonb', nullable: true }),
    __metadata("design:type", Array)
], AiInsight.prototype, "actionItems", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'follow_up_required', default: false }),
    __metadata("design:type", Boolean)
], AiInsight.prototype, "followUpRequired", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'follow_up_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], AiInsight.prototype, "followUpDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'follow_up_reason', type: 'text', nullable: true }),
    __metadata("design:type", String)
], AiInsight.prototype, "followUpReason", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'lead_quality_score', nullable: true }),
    __metadata("design:type", Number)
], AiInsight.prototype, "leadQualityScore", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'conversion_probability', type: 'decimal', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], AiInsight.prototype, "conversionProbability", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'hot_lead', default: false }),
    __metadata("design:type", Boolean)
], AiInsight.prototype, "hotLead", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'next_best_action', type: 'text', nullable: true }),
    __metadata("design:type", String)
], AiInsight.prototype, "nextBestAction", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'recommended_properties', type: 'uuid', array: true, nullable: true }),
    __metadata("design:type", Array)
], AiInsight.prototype, "recommendedProperties", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'talking_points', type: 'text', array: true, nullable: true }),
    __metadata("design:type", Array)
], AiInsight.prototype, "talkingPoints", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'model_used', default: 'gpt-4-turbo-preview' }),
    __metadata("design:type", String)
], AiInsight.prototype, "modelUsed", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'processing_cost', type: 'decimal', precision: 10, scale: 4, nullable: true }),
    __metadata("design:type", Number)
], AiInsight.prototype, "processingCost", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'processing_time', nullable: true }),
    __metadata("design:type", Number)
], AiInsight.prototype, "processingTime", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], AiInsight.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], AiInsight.prototype, "updatedAt", void 0);
exports.AiInsight = AiInsight = __decorate([
    (0, typeorm_1.Entity)('ai_insights', { schema: 'telephony' })
], AiInsight);
//# sourceMappingURL=ai-insight.entity.js.map