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
var AIAnalysisService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIAnalysisService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const openai_1 = require("openai");
const ai_insight_entity_1 = require("../entities/ai-insight.entity");
const call_log_entity_1 = require("../entities/call-log.entity");
const call_transcription_entity_1 = require("../entities/call-transcription.entity");
let AIAnalysisService = AIAnalysisService_1 = class AIAnalysisService {
    constructor(configService, aiInsightRepo, callLogRepo, transcriptionRepo) {
        this.configService = configService;
        this.aiInsightRepo = aiInsightRepo;
        this.callLogRepo = callLogRepo;
        this.transcriptionRepo = transcriptionRepo;
        this.logger = new common_1.Logger(AIAnalysisService_1.name);
        const apiKey = this.configService.get('OPENAI_API_KEY');
        this.openai = new openai_1.default({ apiKey });
        this.model = this.configService.get('OPENAI_MODEL', 'gpt-4-turbo-preview');
        this.logger.log('AI Analysis Service initialized');
    }
    async analyzeCall(callSid) {
        try {
            this.logger.log(`Starting AI analysis for call ${callSid}`);
            const transcription = await this.transcriptionRepo.findOne({
                where: { callSid },
            });
            if (!transcription) {
                throw new Error(`Transcription not found for call ${callSid}`);
            }
            const existing = await this.aiInsightRepo.findOne({
                where: { callSid },
            });
            if (existing) {
                this.logger.log(`Call ${callSid} already analyzed`);
                return this.mapToAnalysisResult(existing);
            }
            const call = await this.callLogRepo.findOne({
                where: { callSid },
            });
            const analysis = await this.performGPT4Analysis(transcription.transcriptText, call);
            const insight = this.aiInsightRepo.create({
                callSid: callSid,
                summary: analysis.summary,
                sentiment: analysis.sentiment,
                leadQualityScore: analysis.leadQualityScore,
                hotLead: analysis.hotLead,
                conversionProbability: analysis.conversionProbability,
                keyTopics: analysis.keyTopics,
                painPoints: analysis.painPoints,
                objections: analysis.objections,
                nextBestAction: analysis.nextBestAction,
                customerName: analysis.leadInfo.customerName,
                customerEmail: analysis.leadInfo.customerEmail,
                budgetMin: analysis.leadInfo.budgetMin,
                budgetMax: analysis.leadInfo.budgetMax,
                preferredLocation: analysis.leadInfo.preferredLocation,
                bhkRequirement: analysis.leadInfo.bhkRequirement,
                purposeOfPurchase: analysis.leadInfo.purposeOfPurchase,
                timeline: analysis.leadInfo.timeline,
                financingNeeded: analysis.leadInfo.financingNeeded,
                propertyTypes: analysis.leadInfo.propertyTypes,
                metadata: {
                    model: this.model,
                    analyzedAt: new Date().toISOString(),
                },
            });
            await this.aiInsightRepo.save(insight);
            call.insightId = insight.id;
            call.sentiment = analysis.sentiment;
            await this.callLogRepo.save(call);
            this.logger.log(`AI analysis completed for call ${callSid}`);
            return {
                ...analysis,
                insightId: insight.id,
            };
        }
        catch (error) {
            this.logger.error(`AI analysis failed for call ${callSid}: ${error.message}`, error.stack);
            throw error;
        }
    }
    async performGPT4Analysis(transcriptText, call) {
        try {
            const systemPrompt = this.buildSystemPrompt();
            const userPrompt = this.buildUserPrompt(transcriptText, call);
            const completion = await this.openai.chat.completions.create({
                model: this.model,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt },
                ],
                response_format: { type: 'json_object' },
                temperature: 0.3,
            });
            const result = JSON.parse(completion.choices[0].message.content);
            return this.normalizeGPT4Response(result);
        }
        catch (error) {
            this.logger.error(`GPT-4 analysis failed: ${error.message}`);
            throw error;
        }
    }
    buildSystemPrompt() {
        return `You are an expert real estate sales analyst for Eastern Estate, a premium real estate company in India. 

Your task is to analyze customer-agent phone conversations and extract valuable insights for the sales team.

You must ALWAYS respond with a valid JSON object containing the following structure:

{
  "summary": "Brief 2-3 sentence summary of the call",
  "sentiment": "POSITIVE" | "NEUTRAL" | "NEGATIVE",
  "leadQualityScore": 0-100 (integer),
  "hotLead": true | false,
  "conversionProbability": 0-100 (integer, percentage),
  "keyTopics": ["topic1", "topic2", ...],
  "painPoints": ["pain1", "pain2", ...],
  "objections": ["objection1", "objection2", ...],
  "nextBestAction": "Specific recommended next step",
  "leadInfo": {
    "customerName": "Full Name" or null,
    "customerEmail": "email@domain.com" or null,
    "budgetMin": number (in rupees) or null,
    "budgetMax": number (in rupees) or null,
    "preferredLocation": ["location1", "location2"] or [],
    "bhkRequirement": "1BHK" | "2BHK" | "3BHK" | "4BHK" | "5BHK+" or null,
    "purposeOfPurchase": "INVESTMENT" | "END_USE" | "RESALE" or null,
    "timeline": "IMMEDIATE" | "1-3_MONTHS" | "3-6_MONTHS" | "6-12_MONTHS" | "12+_MONTHS" or null,
    "financingNeeded": true | false | null,
    "propertyTypes": ["APARTMENT", "VILLA", "PENTHOUSE", "PLOT"] or []
  }
}

Guidelines:
1. Hot lead = high interest + clear intent + good budget match + short timeline
2. Lead quality score considers: intent, budget clarity, timeline, engagement level
3. Conversion probability considers: buying signals, objections handled, next step agreed
4. Extract ALL mentioned locations, property types, and requirements
5. Identify specific pain points the customer mentioned
6. Note any objections or concerns raised
7. Recommend specific, actionable next steps
8. Be conservative with email extraction - only include if explicitly stated
9. Budget should be in actual rupees (e.g., 5000000 for 50 lakhs)
10. If information is not mentioned, use null or empty arrays`;
    }
    buildUserPrompt(transcriptText, call) {
        return `Analyze this real estate sales call:

CALL DETAILS:
- Duration: ${call.duration} seconds
- Direction: ${call.direction}
- Status: ${call.status}

TRANSCRIPT:
${transcriptText}

Provide a comprehensive analysis following the exact JSON structure specified in the system prompt.`;
    }
    normalizeGPT4Response(result) {
        return {
            summary: result.summary || 'No summary available',
            sentiment: this.normalizeSentiment(result.sentiment),
            leadQualityScore: this.normalizeScore(result.leadQualityScore),
            hotLead: Boolean(result.hotLead),
            conversionProbability: this.normalizeScore(result.conversionProbability),
            keyTopics: Array.isArray(result.keyTopics) ? result.keyTopics : [],
            painPoints: Array.isArray(result.painPoints) ? result.painPoints : [],
            objections: Array.isArray(result.objections) ? result.objections : [],
            nextBestAction: result.nextBestAction || 'Follow up with customer',
            leadInfo: {
                customerName: result.leadInfo?.customerName || null,
                customerEmail: result.leadInfo?.customerEmail || null,
                budgetMin: this.normalizeBudget(result.leadInfo?.budgetMin),
                budgetMax: this.normalizeBudget(result.leadInfo?.budgetMax),
                preferredLocation: Array.isArray(result.leadInfo?.preferredLocation)
                    ? result.leadInfo.preferredLocation
                    : [],
                bhkRequirement: result.leadInfo?.bhkRequirement || null,
                purposeOfPurchase: result.leadInfo?.purposeOfPurchase || null,
                timeline: result.leadInfo?.timeline || null,
                financingNeeded: result.leadInfo?.financingNeeded ?? null,
                propertyTypes: Array.isArray(result.leadInfo?.propertyTypes)
                    ? result.leadInfo.propertyTypes
                    : [],
            },
        };
    }
    normalizeSentiment(sentiment) {
        const normalized = sentiment?.toUpperCase();
        if (['POSITIVE', 'NEUTRAL', 'NEGATIVE'].includes(normalized)) {
            return normalized;
        }
        return 'NEUTRAL';
    }
    normalizeScore(score) {
        const num = parseInt(score);
        if (isNaN(num))
            return 0;
        return Math.max(0, Math.min(100, num));
    }
    normalizeBudget(budget) {
        if (budget === null || budget === undefined)
            return null;
        const num = parseInt(budget);
        return isNaN(num) ? null : num;
    }
    async getInsights(callSid) {
        try {
            return await this.aiInsightRepo.findOne({
                where: { callSid },
            });
        }
        catch (error) {
            this.logger.error(`Error fetching insights: ${error.message}`);
            return null;
        }
    }
    async getHotLeads(propertyId, limit = 50) {
        try {
            const queryBuilder = this.aiInsightRepo
                .createQueryBuilder('ai')
                .innerJoin('call_logs', 'cl', 'cl.call_sid = ai.call_sid')
                .where('ai.hot_lead = true')
                .orderBy('ai.lead_quality_score', 'DESC')
                .addOrderBy('ai.conversion_probability', 'DESC')
                .limit(limit);
            if (propertyId) {
                queryBuilder.andWhere('cl.property_id = :propertyId', { propertyId });
            }
            return await queryBuilder.getMany();
        }
        catch (error) {
            this.logger.error(`Error fetching hot leads: ${error.message}`);
            return [];
        }
    }
    async getStatistics(propertyId) {
        try {
            let query = this.aiInsightRepo
                .createQueryBuilder('ai')
                .innerJoin('call_logs', 'cl', 'cl.call_sid = ai.call_sid');
            if (propertyId) {
                query = query.where('cl.property_id = :propertyId', { propertyId });
            }
            const stats = await query
                .select([
                'COUNT(*) as total_analyzed',
                'COUNT(*) FILTER (WHERE hot_lead = true) as hot_leads',
                'AVG(lead_quality_score)::numeric(5,2) as avg_lead_score',
                'AVG(conversion_probability)::numeric(5,2) as avg_conversion_prob',
                'COUNT(*) FILTER (WHERE sentiment = \'POSITIVE\') as positive_sentiment',
                'COUNT(*) FILTER (WHERE sentiment = \'NEUTRAL\') as neutral_sentiment',
                'COUNT(*) FILTER (WHERE sentiment = \'NEGATIVE\') as negative_sentiment',
            ])
                .getRawOne();
            return {
                totalAnalyzed: parseInt(stats.total_analyzed) || 0,
                hotLeads: parseInt(stats.hot_leads) || 0,
                avgLeadScore: parseFloat(stats.avg_lead_score) || 0,
                avgConversionProb: parseFloat(stats.avg_conversion_prob) || 0,
                sentimentBreakdown: {
                    positive: parseInt(stats.positive_sentiment) || 0,
                    neutral: parseInt(stats.neutral_sentiment) || 0,
                    negative: parseInt(stats.negative_sentiment) || 0,
                },
            };
        }
        catch (error) {
            this.logger.error(`Error getting statistics: ${error.message}`);
            return null;
        }
    }
    mapToAnalysisResult(insight) {
        return {
            insightId: insight.id,
            callSid: insight.callSid,
            summary: insight.summary,
            sentiment: insight.sentiment,
            leadQualityScore: insight.leadQualityScore,
            hotLead: insight.hotLead,
            conversionProbability: insight.conversionProbability,
            keyTopics: insight.keyTopics || [],
            painPoints: insight.painPoints || [],
            objections: insight.objections || [],
            nextBestAction: insight.nextBestAction,
            leadInfo: {
                customerName: insight.customerName,
                customerEmail: insight.customerEmail,
                budgetMin: insight.budgetMin,
                budgetMax: insight.budgetMax,
                preferredLocation: insight.preferredLocation || [],
                bhkRequirement: insight.bhkRequirement,
                purposeOfPurchase: insight.purposeOfPurchase,
                timeline: insight.timeline,
                financingNeeded: insight.financingNeeded,
                propertyTypes: insight.propertyTypes || [],
            },
        };
    }
    async batchAnalyze(callSids) {
        const results = [];
        for (const callSid of callSids) {
            try {
                const result = await this.analyzeCall(callSid);
                results.push(result);
            }
            catch (error) {
                this.logger.error(`Failed to analyze call ${callSid}: ${error.message}`);
            }
        }
        return results;
    }
};
exports.AIAnalysisService = AIAnalysisService;
exports.AIAnalysisService = AIAnalysisService = AIAnalysisService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(ai_insight_entity_1.AIInsight)),
    __param(2, (0, typeorm_1.InjectRepository)(call_log_entity_1.CallLog)),
    __param(3, (0, typeorm_1.InjectRepository)(call_transcription_entity_1.CallTranscription)),
    __metadata("design:paramtypes", [config_1.ConfigService,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], AIAnalysisService);
//# sourceMappingURL=ai-analysis.service.js.map