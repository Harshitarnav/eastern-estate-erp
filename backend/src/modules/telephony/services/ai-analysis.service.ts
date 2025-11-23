import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import OpenAI from 'openai';
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

/**
 * AI Analysis Service using OpenAI GPT-4
 * Analyzes call transcriptions to extract insights and lead information
 */
@Injectable()
export class AIAnalysisService {
  private readonly logger = new Logger(AIAnalysisService.name);
  private readonly openai: OpenAI;
  private readonly model: string;

  constructor(
    private configService: ConfigService,
    @InjectRepository(AIInsight)
    private aiInsightRepo: Repository<AIInsight>,
    @InjectRepository(CallLog)
    private callLogRepo: Repository<CallLog>,
    @InjectRepository(CallTranscription)
    private transcriptionRepo: Repository<CallTranscription>,
  ) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    this.openai = new OpenAI({ apiKey });
    this.model = this.configService.get<string>('OPENAI_MODEL', 'gpt-4-turbo-preview');

    this.logger.log('AI Analysis Service initialized');
  }

  /**
   * Analyze a call transcription using GPT-4
   */
  async analyzeCall(callSid: string): Promise<CallAnalysis> {
    try {
      this.logger.log(`Starting AI analysis for call ${callSid}`);

      // Get transcription
      const transcription = await this.transcriptionRepo.findOne({
        where: { callSid },
      });

      if (!transcription) {
        throw new Error(`Transcription not found for call ${callSid}`);
      }

      // Check if already analyzed
      const existing = await this.aiInsightRepo.findOne({
        where: { callSid },
      });

      if (existing) {
        this.logger.log(`Call ${callSid} already analyzed`);
        return this.mapToAnalysisResult(existing);
      }

      // Get call details for context
      const call = await this.callLogRepo.findOne({
        where: { callSid },
      });

      // Analyze using GPT-4
      const analysis = await this.performGPT4Analysis(
        transcription.transcriptText,
        call,
      );

      // Save insights to database
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

      // Update call log
      call.insightId = insight.id;
      call.sentiment = analysis.sentiment;
      await this.callLogRepo.save(call);

      this.logger.log(`AI analysis completed for call ${callSid}`);

      return {
        ...analysis,
        insightId: insight.id,
      };
    } catch (error) {
      this.logger.error(`AI analysis failed for call ${callSid}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Perform GPT-4 analysis on transcription
   */
  private async performGPT4Analysis(
    transcriptText: string,
    call: CallLog,
  ): Promise<Omit<CallAnalysis, 'insightId' | 'callSid'>> {
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
        temperature: 0.3, // Lower temperature for more consistent results
      });

      const result = JSON.parse(completion.choices[0].message.content);

      // Validate and normalize the response
      return this.normalizeGPT4Response(result);
    } catch (error) {
      this.logger.error(`GPT-4 analysis failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Build system prompt for GPT-4
   */
  private buildSystemPrompt(): string {
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

  /**
   * Build user prompt with call details
   */
  private buildUserPrompt(transcriptText: string, call: CallLog): string {
    return `Analyze this real estate sales call:

CALL DETAILS:
- Duration: ${call.duration} seconds
- Direction: ${call.direction}
- Status: ${call.status}

TRANSCRIPT:
${transcriptText}

Provide a comprehensive analysis following the exact JSON structure specified in the system prompt.`;
  }

  /**
   * Normalize GPT-4 response to ensure data consistency
   */
  private normalizeGPT4Response(result: any): Omit<CallAnalysis, 'insightId' | 'callSid'> {
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

  /**
   * Helper methods for normalization
   */
  private normalizeSentiment(sentiment: string): 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' {
    const normalized = sentiment?.toUpperCase();
    if (['POSITIVE', 'NEUTRAL', 'NEGATIVE'].includes(normalized)) {
      return normalized as any;
    }
    return 'NEUTRAL';
  }

  private normalizeScore(score: any): number {
    const num = parseInt(score);
    if (isNaN(num)) return 0;
    return Math.max(0, Math.min(100, num));
  }

  private normalizeBudget(budget: any): number | null {
    if (budget === null || budget === undefined) return null;
    const num = parseInt(budget);
    return isNaN(num) ? null : num;
  }

  /**
   * Get insights by call SID
   */
  async getInsights(callSid: string): Promise<AIInsight | null> {
    try {
      return await this.aiInsightRepo.findOne({
        where: { callSid },
      });
    } catch (error) {
      this.logger.error(`Error fetching insights: ${error.message}`);
      return null;
    }
  }

  /**
   * Get hot leads
   */
  async getHotLeads(propertyId?: number, limit: number = 50): Promise<AIInsight[]> {
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
    } catch (error) {
      this.logger.error(`Error fetching hot leads: ${error.message}`);
      return [];
    }
  }

  /**
   * Get AI insights statistics
   */
  async getStatistics(propertyId?: number): Promise<any> {
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
    } catch (error) {
      this.logger.error(`Error getting statistics: ${error.message}`);
      return null;
    }
  }

  /**
   * Map database entity to analysis result
   */
  private mapToAnalysisResult(insight: AIInsight): CallAnalysis {
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

  /**
   * Batch analyze multiple calls
   */
  async batchAnalyze(callSids: string[]): Promise<CallAnalysis[]> {
    const results: CallAnalysis[] = [];

    for (const callSid of callSids) {
      try {
        const result = await this.analyzeCall(callSid);
        results.push(result);
      } catch (error) {
        this.logger.error(`Failed to analyze call ${callSid}: ${error.message}`);
      }
    }

    return results;
  }
}

