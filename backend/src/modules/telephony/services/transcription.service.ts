import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import OpenAI from 'openai';
import { CallTranscription } from '../entities/call-transcription.entity';
import { CallLog } from '../entities/call-log.entity';
import * as fs from 'fs';
import * as path from 'path';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';

export interface TranscriptionResult {
  transcriptionId: number;
  callSid: string;
  text: string;
  duration: number;
  language: string;
  confidence: number;
}

/**
 * Transcription Service using OpenAI Whisper
 * Converts call recordings to text
 */
@Injectable()
export class TranscriptionService {
  private readonly logger = new Logger(TranscriptionService.name);
  private readonly openai: OpenAI;
  private readonly whisperModel: string;
  private readonly tempDir: string;

  constructor(
    private configService: ConfigService,
    @InjectRepository(CallTranscription)
    private transcriptionRepo: Repository<CallTranscription>,
    @InjectRepository(CallLog)
    private callLogRepo: Repository<CallLog>,
  ) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    this.openai = new OpenAI({ apiKey });
    this.whisperModel = this.configService.get<string>('WHISPER_MODEL', 'whisper-1');
    this.tempDir = this.configService.get<string>('TEMP_DIR', '/tmp/recordings');

    // Ensure temp directory exists
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }

    this.logger.log('Transcription Service initialized');
  }

  /**
   * Transcribe a call recording
   */
  async transcribeCall(
    callSid: string,
    recordingBuffer: Buffer,
    format: string = 'mp3',
  ): Promise<TranscriptionResult> {
    try {
      this.logger.log(`Starting transcription for call ${callSid}`);

      // Get call details
      const call = await this.callLogRepo.findOne({ where: { callSid } });
      if (!call) {
        throw new Error(`Call ${callSid} not found`);
      }

      // Check if already transcribed
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

      // Save recording to temporary file
      const tempFilePath = path.join(this.tempDir, `${callSid}.${format}`);
      fs.writeFileSync(tempFilePath, recordingBuffer);

      this.logger.log(`Recording saved to ${tempFilePath}`);

      // Transcribe using OpenAI Whisper
      const startTime = Date.now();
      const transcription = await this.openai.audio.transcriptions.create({
        file: fs.createReadStream(tempFilePath),
        model: this.whisperModel,
        response_format: 'verbose_json',
        language: 'en', // You can make this dynamic
      });

      const duration = Date.now() - startTime;
      this.logger.log(`Transcription completed in ${duration}ms`);

      // Save transcription to database
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

      // Update call log
      call.transcriptionId = transcriptionEntity.id;
      await this.callLogRepo.save(call);

      // Clean up temp file
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
    } catch (error) {
      this.logger.error(`Transcription failed for call ${callSid}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get transcription by call SID
   */
  async getTranscription(callSid: string): Promise<CallTranscription | null> {
    try {
      return await this.transcriptionRepo.findOne({
        where: { callSid },
      });
    } catch (error) {
      this.logger.error(`Error fetching transcription: ${error.message}`);
      return null;
    }
  }

  /**
   * Get transcription by ID
   */
  async getTranscriptionById(id: number): Promise<CallTranscription | null> {
    try {
      return await this.transcriptionRepo.findOne({
        where: { id },
      });
    } catch (error) {
      this.logger.error(`Error fetching transcription: ${error.message}`);
      return null;
    }
  }

  /**
   * Search transcriptions by text
   */
  async searchTranscriptions(
    searchQuery: string,
    propertyId?: number,
    limit: number = 50,
  ): Promise<CallTranscription[]> {
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
    } catch (error) {
      this.logger.error(`Error searching transcriptions: ${error.message}`);
      return [];
    }
  }

  /**
   * Get transcription statistics
   */
  async getStatistics(propertyId?: number): Promise<any> {
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
    } catch (error) {
      this.logger.error(`Error getting statistics: ${error.message}`);
      return null;
    }
  }

  /**
   * Extract keywords from transcription
   */
  extractKeywords(text: string): string[] {
    // Remove common words and extract meaningful keywords
    const commonWords = new Set([
      'the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'but',
      'in', 'with', 'to', 'for', 'of', 'as', 'by', 'from', 'i', 'you',
      'he', 'she', 'it', 'we', 'they', 'what', 'when', 'where', 'how',
    ]);

    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter((word) => word.length > 3 && !commonWords.has(word));

    // Count frequency
    const frequency: Record<string, number> = {};
    words.forEach((word) => {
      frequency[word] = (frequency[word] || 0) + 1;
    });

    // Sort by frequency and return top keywords
    return Object.entries(frequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);
  }

  /**
   * Calculate confidence score from Whisper response
   */
  private calculateConfidence(transcription: any): number {
    // Whisper doesn't provide direct confidence scores
    // We estimate based on:
    // 1. Presence of segments
    // 2. Length of transcription
    // 3. Language match

    if (!transcription.segments || transcription.segments.length === 0) {
      return 0.7; // Default confidence
    }

    // Calculate average confidence from segments if available
    const avgConfidence =
      transcription.segments.reduce((sum: number, seg: any) => {
        return sum + (seg.no_speech_prob ? 1 - seg.no_speech_prob : 0.8);
      }, 0) / transcription.segments.length;

    return Math.min(0.99, Math.max(0.1, avgConfidence));
  }

  /**
   * Detect language from transcription (if auto-detect is needed)
   */
  async detectLanguage(recordingBuffer: Buffer, format: string = 'mp3'): Promise<string> {
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
    } catch (error) {
      this.logger.error(`Language detection failed: ${error.message}`);
      return 'en'; // Default to English
    }
  }

  /**
   * Batch transcribe multiple calls
   */
  async batchTranscribe(
    calls: { callSid: string; recordingBuffer: Buffer; format?: string }[],
  ): Promise<TranscriptionResult[]> {
    const results: TranscriptionResult[] = [];

    for (const call of calls) {
      try {
        const result = await this.transcribeCall(
          call.callSid,
          call.recordingBuffer,
          call.format,
        );
        results.push(result);
      } catch (error) {
        this.logger.error(`Failed to transcribe call ${call.callSid}: ${error.message}`);
      }
    }

    return results;
  }

  /**
   * Get recent transcriptions
   */
  async getRecentTranscriptions(limit: number = 20): Promise<CallTranscription[]> {
    try {
      return await this.transcriptionRepo.find({
        order: { createdAt: 'DESC' },
        take: limit,
      });
    } catch (error) {
      this.logger.error(`Error fetching recent transcriptions: ${error.message}`);
      return [];
    }
  }
}


