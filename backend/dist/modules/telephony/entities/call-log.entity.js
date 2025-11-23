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
exports.CallLog = void 0;
const typeorm_1 = require("typeorm");
const property_entity_1 = require("../../properties/entities/property.entity");
const employee_entity_1 = require("../../employees/entities/employee.entity");
const customer_entity_1 = require("../../customers/entities/customer.entity");
const lead_entity_1 = require("../../leads/entities/lead.entity");
const call_recording_entity_1 = require("./call-recording.entity");
const call_transcription_entity_1 = require("./call-transcription.entity");
const ai_insight_entity_1 = require("./ai-insight.entity");
let CallLog = class CallLog {
};
exports.CallLog = CallLog;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], CallLog.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'call_sid', unique: true }),
    __metadata("design:type", String)
], CallLog.prototype, "callSid", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'conversation_uuid', nullable: true }),
    __metadata("design:type", String)
], CallLog.prototype, "conversationUuid", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'direction' }),
    __metadata("design:type", String)
], CallLog.prototype, "direction", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'call_type', default: 'GENERAL' }),
    __metadata("design:type", String)
], CallLog.prototype, "callType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'from_number' }),
    __metadata("design:type", String)
], CallLog.prototype, "fromNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'to_number' }),
    __metadata("design:type", String)
], CallLog.prototype, "toNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'masked_number', nullable: true }),
    __metadata("design:type", String)
], CallLog.prototype, "maskedNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'customer_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], CallLog.prototype, "customerId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => customer_entity_1.Customer, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'customer_id' }),
    __metadata("design:type", customer_entity_1.Customer)
], CallLog.prototype, "customer", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'lead_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], CallLog.prototype, "leadId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => lead_entity_1.Lead, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'lead_id' }),
    __metadata("design:type", lead_entity_1.Lead)
], CallLog.prototype, "lead", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'property_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], CallLog.prototype, "propertyId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => property_entity_1.Property, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'property_id' }),
    __metadata("design:type", property_entity_1.Property)
], CallLog.prototype, "property", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'assigned_agent_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], CallLog.prototype, "assignedAgentId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => employee_entity_1.Employee, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'assigned_agent_id' }),
    __metadata("design:type", employee_entity_1.Employee)
], CallLog.prototype, "assignedAgent", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'status', default: 'QUEUED' }),
    __metadata("design:type", String)
], CallLog.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ivr_selection', nullable: true }),
    __metadata("design:type", String)
], CallLog.prototype, "ivrSelection", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ivr_path', type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], CallLog.prototype, "ivrPath", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'duration', default: 0 }),
    __metadata("design:type", Number)
], CallLog.prototype, "duration", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ring_duration', nullable: true }),
    __metadata("design:type", Number)
], CallLog.prototype, "ringDuration", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'conversation_duration', nullable: true }),
    __metadata("design:type", Number)
], CallLog.prototype, "conversationDuration", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'queue_position', nullable: true }),
    __metadata("design:type", Number)
], CallLog.prototype, "queuePosition", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'wait_time', default: 0 }),
    __metadata("design:type", Number)
], CallLog.prototype, "waitTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'queue_name', nullable: true }),
    __metadata("design:type", String)
], CallLog.prototype, "queueName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'round_robin_attempt', default: 1 }),
    __metadata("design:type", Number)
], CallLog.prototype, "roundRobinAttempt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'agents_tried', type: 'uuid', array: true, nullable: true }),
    __metadata("design:type", Array)
], CallLog.prototype, "agentsTried", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'call_quality', nullable: true }),
    __metadata("design:type", String)
], CallLog.prototype, "callQuality", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'disconnect_reason', nullable: true }),
    __metadata("design:type", String)
], CallLog.prototype, "disconnectReason", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'recording_url', type: 'text', nullable: true }),
    __metadata("design:type", String)
], CallLog.prototype, "recordingUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'recording_sid', nullable: true }),
    __metadata("design:type", String)
], CallLog.prototype, "recordingSid", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'recording_duration', nullable: true }),
    __metadata("design:type", Number)
], CallLog.prototype, "recordingDuration", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'recording_status', default: 'PENDING' }),
    __metadata("design:type", String)
], CallLog.prototype, "recordingStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'transcription_text', type: 'text', nullable: true }),
    __metadata("design:type", String)
], CallLog.prototype, "transcriptionText", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'transcription_status', default: 'PENDING' }),
    __metadata("design:type", String)
], CallLog.prototype, "transcriptionStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'transcription_confidence', type: 'decimal', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], CallLog.prototype, "transcriptionConfidence", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ai_summary', type: 'text', nullable: true }),
    __metadata("design:type", String)
], CallLog.prototype, "aiSummary", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ai_detailed_summary', type: 'text', nullable: true }),
    __metadata("design:type", String)
], CallLog.prototype, "aiDetailedSummary", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sentiment', nullable: true }),
    __metadata("design:type", String)
], CallLog.prototype, "sentiment", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sentiment_score', type: 'decimal', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], CallLog.prototype, "sentimentScore", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'intent', nullable: true }),
    __metadata("design:type", String)
], CallLog.prototype, "intent", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'key_topics', type: 'jsonb', nullable: true }),
    __metadata("design:type", Array)
], CallLog.prototype, "keyTopics", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'action_items', type: 'jsonb', nullable: true }),
    __metadata("design:type", Array)
], CallLog.prototype, "actionItems", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'entities_extracted', type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], CallLog.prototype, "entitiesExtracted", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'lead_quality_score', nullable: true }),
    __metadata("design:type", Number)
], CallLog.prototype, "leadQualityScore", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'conversion_probability', type: 'decimal', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], CallLog.prototype, "conversionProbability", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'next_action_suggestion', type: 'text', nullable: true }),
    __metadata("design:type", String)
], CallLog.prototype, "nextActionSuggestion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'queued_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], CallLog.prototype, "queuedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ringing_started_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], CallLog.prototype, "ringingStartedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'answered_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], CallLog.prototype, "answeredAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ended_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], CallLog.prototype, "endedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'exotel_metadata', type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], CallLog.prototype, "exotelMetadata", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'custom_data', type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], CallLog.prototype, "customData", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], CallLog.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], CallLog.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => call_recording_entity_1.CallRecording, recording => recording.callLog),
    __metadata("design:type", Array)
], CallLog.prototype, "recordings", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => call_transcription_entity_1.CallTranscription, transcription => transcription.callLog),
    __metadata("design:type", call_transcription_entity_1.CallTranscription)
], CallLog.prototype, "transcription", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => ai_insight_entity_1.AiInsight, insight => insight.callLog),
    __metadata("design:type", ai_insight_entity_1.AiInsight)
], CallLog.prototype, "aiInsight", void 0);
exports.CallLog = CallLog = __decorate([
    (0, typeorm_1.Entity)('call_logs', { schema: 'telephony' })
], CallLog);
//# sourceMappingURL=call-log.entity.js.map