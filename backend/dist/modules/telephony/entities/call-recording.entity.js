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
exports.CallRecording = void 0;
const typeorm_1 = require("typeorm");
const call_log_entity_1 = require("./call-log.entity");
const call_transcription_entity_1 = require("./call-transcription.entity");
let CallRecording = class CallRecording {
};
exports.CallRecording = CallRecording;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], CallRecording.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'call_log_id', type: 'uuid' }),
    __metadata("design:type", String)
], CallRecording.prototype, "callLogId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => call_log_entity_1.CallLog, callLog => callLog.recordings),
    (0, typeorm_1.JoinColumn)({ name: 'call_log_id' }),
    __metadata("design:type", call_log_entity_1.CallLog)
], CallRecording.prototype, "callLog", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'recording_url', type: 'text' }),
    __metadata("design:type", String)
], CallRecording.prototype, "recordingUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'recording_sid', unique: true, nullable: true }),
    __metadata("design:type", String)
], CallRecording.prototype, "recordingSid", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'duration' }),
    __metadata("design:type", Number)
], CallRecording.prototype, "duration", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'file_size', nullable: true }),
    __metadata("design:type", Number)
], CallRecording.prototype, "fileSize", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'format', default: 'mp3' }),
    __metadata("design:type", String)
], CallRecording.prototype, "format", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'storage_provider', default: 'aws' }),
    __metadata("design:type", String)
], CallRecording.prototype, "storageProvider", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 's3_bucket', nullable: true }),
    __metadata("design:type", String)
], CallRecording.prototype, "s3Bucket", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 's3_key', type: 'text', nullable: true }),
    __metadata("design:type", String)
], CallRecording.prototype, "s3Key", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'local_path', type: 'text', nullable: true }),
    __metadata("design:type", String)
], CallRecording.prototype, "localPath", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_downloaded', default: false }),
    __metadata("design:type", Boolean)
], CallRecording.prototype, "isDownloaded", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_processed', default: false }),
    __metadata("design:type", Boolean)
], CallRecording.prototype, "isProcessed", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_transcribed', default: false }),
    __metadata("design:type", Boolean)
], CallRecording.prototype, "isTranscribed", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'recorded_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], CallRecording.prototype, "recordedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'downloaded_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], CallRecording.prototype, "downloadedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'processed_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], CallRecording.prototype, "processedAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], CallRecording.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => call_transcription_entity_1.CallTranscription, transcription => transcription.recording),
    __metadata("design:type", call_transcription_entity_1.CallTranscription)
], CallRecording.prototype, "transcription", void 0);
exports.CallRecording = CallRecording = __decorate([
    (0, typeorm_1.Entity)('call_recordings', { schema: 'telephony' })
], CallRecording);
//# sourceMappingURL=call-recording.entity.js.map