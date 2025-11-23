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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var TranscriptionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TranscriptionService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const openai_1 = require("openai");
const call_transcription_entity_1 = require("../entities/call-transcription.entity");
const call_log_entity_1 = require("../entities/call-log.entity");
const fs = require("fs");
const path = require("path");
let TranscriptionService = TranscriptionService_1 = class TranscriptionService {
    constructor(configService, transcriptionRepo, callLogRepo) {
        this.configService = configService;
        this.transcriptionRepo = transcriptionRepo;
        this.callLogRepo = callLogRepo;
        this.logger = new common_1.Logger(TranscriptionService_1.name);
        const apiKey = this.configService.get('OPENAI_API_KEY');
        this.openai = new openai_1.default({ apiKey });
        this.whisperModel = this.configService.get('WHISPER_MODEL', 'whisper-1');
        this.tempDir = this.configService.get('TEMP_DIR', '/tmp/recordings');
        if (!fs.existsSync(this.tempDir)) {
            fs.mkdirSync(this.tempDir, { recursive: true });
        }
        this.logger.log('Transcription Service initialized');
    }
    async transcribeCall(callSid, recordingBuffer, format = 'mp3') {
        try {
            this.logger.log(`Starting transcription for call ${callSid}`);
            const call = await this.callLogRepo.findOne({ where: { callSid } });
            if (!call) {
                throw new Error(`Call ${callSid} not found`);
            }
            const existing = await this.transcriptionRepo.findOne({
                where: { callSid },
            });
            if (existing) {
                this.logger.log(`Call ${callSid} already transcribed`);
                return {
                    transcriptionId: existing.id,
                    callSid: existing.callSid,
                    text: existing.transcriptText,
                    duration: existing.duration,
                    language: existing.language,
                    confidence: existing.confidence,
                };
            }
            const tempFilePath = path.join(this.tempDir, `${callSid}.${format}`);
            fs.writeFileSync(tempFilePath, recordingBuffer);
            this.logger.log(`Recording saved to ${tempFilePath}`);
            const startTime = Date.now();
            const transcription = await this.openai.audio.transcriptions.create({
                file: fs.createReadStream(tempFilePath),
                model: this.whisperModel,
                response_format: 'verbose_json',
                language: 'en',
            });
            const duration = Date.now() - startTime;
            this.logger.log(`Transcription completed in ${duration}ms`);
            const transcriptionEntity = this.transcriptionRepo.create({
                callSid: callSid,
                transcriptText: transcription.text,
                duration: Math.round(transcription.duration || 0),
                language: transcription.language || 'en',
                confidence: this.calculateConfidence(transcription),
                wordCount: transcription.text.split(/\s+/).length,
                metadata: {
                    model: this.whisperModel,
                    processingTimeMs: duration,
                    segments: transcription.segments || [],
                },
            });
            await this.transcriptionRepo.save(transcriptionEntity);
            call.transcriptionId = transcriptionEntity.id;
            await this.callLogRepo.save(call);
            fs.unlinkSync(tempFilePath);
            this.logger.log(`Temp file deleted: ${tempFilePath}`);
            return {
                transcriptionId: transcriptionEntity.id,
                callSid: transcriptionEntity.callSid,
                text: transcriptionEntity.transcriptText,
                duration: transcriptionEntity.duration,
                language: transcriptionEntity.language,
                confidence: transcriptionEntity.confidence,
            };
        }
        catch (error) {
            this.logger.error(`Transcription failed for call ${callSid}: ${error.message}`, error.stack);
            throw error;
        }
    }
    async getTranscription(callSid) {
        try {
            return await this.transcriptionRepo.findOne({
                where: { callSid },
            });
        }
        catch (error) {
            this.logger.error(`Error fetching transcription: ${error.message}`);
            return null;
        }
    }
    async getTranscriptionById(id) {
        try {
            return await this.transcriptionRepo.findOne({
                where: { id },
            });
        }
        catch (error) {
            this.logger.error(`Error fetching transcription: ${error.message}`);
            return null;
        }
    }
    async searchTranscriptions(searchQuery, propertyId, limit = 50) {
        try {
            const queryBuilder = this.transcriptionRepo
                .createQueryBuilder('ct')
                .innerJoin('call_logs', 'cl', 'cl.call_sid = ct.call_sid')
                .where('ct.transcript_text ILIKE :query', {
                query: `%${searchQuery}%`,
            })
                .orderBy('ct.created_at', 'DESC')
                .limit(limit);
            if (propertyId) {
                queryBuilder.andWhere('cl.property_id = :propertyId', { propertyId });
            }
            return await queryBuilder.getMany();
        }
        catch (error) {
            this.logger.error(`Error searching transcriptions: ${error.message}`);
            return [];
        }
    }
    async getStatistics(propertyId) {
        try {
            let query = this.transcriptionRepo
                .createQueryBuilder('ct')
                .innerJoin('call_logs', 'cl', 'cl.call_sid = ct.call_sid');
            if (propertyId) {
                query = query.where('cl.property_id = :propertyId', { propertyId });
            }
            const stats = await query
                .select([
                'COUNT(*) as total_transcriptions',
                'AVG(ct.duration)::int as avg_duration',
                'AVG(ct.word_count)::int as avg_word_count',
                'AVG(ct.confidence)::numeric(5,2) as avg_confidence',
                'COUNT(*) FILTER (WHERE ct.confidence > 0.8) as high_confidence_count',
            ])
                .getRawOne();
            return {
                totalTranscriptions: parseInt(stats.total_transcriptions) || 0,
                avgDuration: parseInt(stats.avg_duration) || 0,
                avgWordCount: parseInt(stats.avg_word_count) || 0,
                avgConfidence: parseFloat(stats.avg_confidence) || 0,
                highConfidenceCount: parseInt(stats.high_confidence_count) || 0,
            };
        }
        catch (error) {
            this.logger.error(`Error getting statistics: ${error.message}`);
            return null;
        }
    }
    extractKeywords(text) {
        const commonWords = new Set([
            'the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'but',
            'in', 'with', 'to', 'for', 'of', 'as', 'by', 'from', 'i', 'you',
            'he', 'she', 'it', 'we', 'they', 'what', 'when', 'where', 'how',
        ]);
        const words = text.toLowerCase()
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .filter((word) => word.length > 3 && !commonWords.has(word));
        const frequency = {};
        words.forEach((word) => {
            frequency[word] = (frequency[word] || 0) + 1;
        });
        return Object.entries(frequency)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10)
            .map(([word]) => word);
    }
    calculateConfidence(transcription) {
        if (!transcription.segments || transcription.segments.length === 0) {
            return 0.7;
        }
        const avgConfidence = transcription.segments.reduce((sum, seg) => {
            return sum + (seg.no_speech_prob ? 1 - seg.no_speech_prob : 0.8);
        }, 0) / transcription.segments.length;
        return Math.min(0.99, Math.max(0.1, avgConfidence));
    }
    async detectLanguage(recordingBuffer, format = 'mp3') {
        try {
            const tempFilePath = path.join(this.tempDir, `detect_${Date.now()}.${format}`);
            fs.writeFileSync(tempFilePath, recordingBuffer);
            const transcription = await this.openai.audio.transcriptions.create({
                file: fs.createReadStream(tempFilePath),
                model: this.whisperModel,
                response_format: 'verbose_json',
            });
            fs.unlinkSync(tempFilePath);
            return transcription.language || 'en';
        }
        catch (error) {
            this.logger.error(`Language detection failed: ${error.message}`);
            return 'en';
        }
    }
    async batchTranscribe(calls) {
        const results = [];
        for (const call of calls) {
            try {
                const result = await this.transcribeCall(call.callSid, call.recordingBuffer, call.format);
                results.push(result);
            }
            catch (error) {
                this.logger.error(`Failed to transcribe call ${call.callSid}: ${error.message}`);
            }
        }
        return results;
    }
    async getRecentTranscriptions(limit = 20) {
        try {
            return await this.transcriptionRepo.find({
                order: { createdAt: 'DESC' },
                take: limit,
            });
        }
        catch (error) {
            this.logger.error(`Error fetching recent transcriptions: ${error.message}`);
            return [];
        }
    }
};
exports.TranscriptionService = TranscriptionService;
exports.TranscriptionService = TranscriptionService = TranscriptionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(call_transcription_entity_1.CallTranscription)),
    __param(2, (0, typeorm_1.InjectRepository)(call_log_entity_1.CallLog)),
    __metadata("design:paramtypes", [config_1.ConfigService,
        typeorm_2.Repository,
        typeorm_2.Repository])
], TranscriptionService);
//# sourceMappingURL=transcription.service.js.map