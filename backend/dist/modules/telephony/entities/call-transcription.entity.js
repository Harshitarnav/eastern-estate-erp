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
exports.CallTranscription = void 0;
const typeorm_1 = require("typeorm");
const call_log_entity_1 = require("./call-log.entity");
const call_recording_entity_1 = require("./call-recording.entity");
const ai_insight_entity_1 = require("./ai-insight.entity");
let CallTranscription = class CallTranscription {
};
exports.CallTranscription = CallTranscription;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], CallTranscription.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'call_log_id', type: 'uuid' }),
    __metadata("design:type", String)
], CallTranscription.prototype, "callLogId", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => call_log_entity_1.CallLog, callLog => callLog.transcription),
    (0, typeorm_1.JoinColumn)({ name: 'call_log_id' }),
    __metadata("design:type", call_log_entity_1.CallLog)
], CallTranscription.prototype, "callLog", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'recording_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], CallTranscription.prototype, "recordingId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => call_recording_entity_1.CallRecording, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'recording_id' }),
    __metadata("design:type", call_recording_entity_1.CallRecording)
], CallTranscription.prototype, "recording", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'full_text', type: 'text' }),
    __metadata("design:type", String)
], CallTranscription.prototype, "fullText", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'segments', type: 'jsonb', nullable: true }),
    __metadata("design:type", Array)
], CallTranscription.prototype, "segments", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'language', default: 'en' }),
    __metadata("design:type", String)
], CallTranscription.prototype, "language", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'confidence_score', type: 'decimal', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], CallTranscription.prototype, "confidenceScore", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'speakers_detected', nullable: true }),
    __metadata("design:type", Number)
], CallTranscription.prototype, "speakersDetected", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'agent_segments', type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], CallTranscription.prototype, "agentSegments", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'customer_segments', type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], CallTranscription.prototype, "customerSegments", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'provider', default: 'openai-whisper' }),
    __metadata("design:type", String)
], CallTranscription.prototype, "provider", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'model_used', nullable: true }),
    __metadata("design:type", String)
], CallTranscription.prototype, "modelUsed", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'processing_status', default: 'PENDING' }),
    __metadata("design:type", String)
], CallTranscription.prototype, "processingStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'processing_time', nullable: true }),
    __metadata("design:type", Number)
], CallTranscription.prototype, "processingTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cost', type: 'decimal', precision: 10, scale: 4, nullable: true }),
    __metadata("design:type", Number)
], CallTranscription.prototype, "cost", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'error_message', type: 'text', nullable: true }),
    __metadata("design:type", String)
], CallTranscription.prototype, "errorMessage", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'retry_count', default: 0 }),
    __metadata("design:type", Number)
], CallTranscription.prototype, "retryCount", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], CallTranscription.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], CallTranscription.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => ai_insight_entity_1.AiInsight, insight => insight.transcription),
    __metadata("design:type", ai_insight_entity_1.AiInsight)
], CallTranscription.prototype, "aiInsight", void 0);
exports.CallTranscription = CallTranscription = __decorate([
    (0, typeorm_1.Entity)('call_transcriptions', { schema: 'telephony' })
], CallTranscription);
//# sourceMappingURL=call-transcription.entity.js.map