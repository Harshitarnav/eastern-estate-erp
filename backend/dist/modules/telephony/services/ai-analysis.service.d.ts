import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { AIInsight } from '../entities/ai-insight.entity';
import { CallLog } from '../entities/call-log.entity';
import { CallTranscription } from '../entities/call-transcription.entity';
export interface LeadInformation {
    customerName?: string;
    customerEmail?: string;
    budgetMin?: number;
    budgetMax?: number;
    preferredLocation?: string[];
    bhkRequirement?: string;
    purposeOfPurchase?: string;
    timeline?: string;
    financingNeeded?: boolean;
    propertyTypes?: string[];
}
export interface CallAnalysis {
    insightId: number;
    callSid: string;
    summary: string;
    sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
    leadQualityScore: number;
    hotLead: boolean;
    conversionProbability: number;
    keyTopics: string[];
    painPoints: string[];
    objections: string[];
    nextBestAction: string;
    leadInfo: LeadInformation;
}
export declare class AIAnalysisService {
    private configService;
    private aiInsightRepo;
    private callLogRepo;
    private transcriptionRepo;
    private readonly logger;
    private readonly openai;
    private readonly model;
    constructor(configService: ConfigService, aiInsightRepo: Repository<AIInsight>, callLogRepo: Repository<CallLog>, transcriptionRepo: Repository<CallTranscription>);
    analyzeCall(callSid: string): Promise<CallAnalysis>;
    private performGPT4Analysis;
    private buildSystemPrompt;
    private buildUserPrompt;
    private normalizeGPT4Response;
    private normalizeSentiment;
    private normalizeScore;
    private normalizeBudget;
    getInsights(callSid: string): Promise<AIInsight | null>;
    getHotLeads(propertyId?: number, limit?: number): Promise<AIInsight[]>;
    getStatistics(propertyId?: number): Promise<any>;
    private mapToAnalysisResult;
    batchAnalyze(callSids: string[]): Promise<CallAnalysis[]>;
}
