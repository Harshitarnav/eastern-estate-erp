import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CallLog } from '../entities/call-log.entity';
import { ExotelService } from './provider/exotel.service';
import { RoundRobinService } from './round-robin.service';
import { TranscriptionService } from './transcription.service';
import { AIAnalysisService } from './ai-analysis.service';
import { StorageService } from './storage.service';
import { ConfigService } from '@nestjs/config';

export interface IncomingCallRequest {
  from: string;
  to: string;
  callSid: string;
  propertyId: number;
  direction?: 'INBOUND' | 'OUTBOUND';
}

export interface CallProcessingResult {
  callSid: string;
  status: string;
  agentAssigned?: string;
  queuePosition?: number;
}

/**
 * Main Call Service - Orchestrates the entire call flow
 * Handles: Routing → Recording → Transcription → AI Analysis → Lead Creation
 */
@Injectable()
export class CallService {
  private readonly logger = new Logger(CallService.name);

  constructor(
    @InjectRepository(CallLog)
    private callLogRepo: Repository<CallLog>,
    private exotelService: ExotelService,
    private roundRobinService: RoundRobinService,
    private transcriptionService: TranscriptionService,
    private aiAnalysisService: AIAnalysisService,
    private storageService: StorageService,
    private configService: ConfigService,
  ) {}

  /**
   * Handle incoming call - Main entry point
   */
  async handleIncomingCall(request: IncomingCallRequest): Promise<CallProcessingResult> {
    try {
      this.logger.log(`Incoming call from ${request.from} to ${request.to}`);

      // Create call log immediately
      const callLog = await this.createCallLog(request);

      // Get next available agent using round-robin
      const agent = await this.roundRobinService.getNextAvailableAgent({
        propertyId: request.propertyId,
        customerPhone: request.from,
      });

      if (agent) {
        // Agent available - route call
        this.logger.log(`Routing call ${request.callSid} to agent ${agent.employeeName}`);

        callLog.agentId = agent.employeeId;
        callLog.status = 'IN_PROGRESS';
        await this.callLogRepo.save(callLog);

        // Update agent load
        await this.roundRobinService.updateAgentLoad(agent.employeeId, true);

        return {
          callSid: request.callSid,
          status: 'CONNECTED',
          agentAssigned: agent.employeeName,
        };
      } else {
        // No agents available - add to queue
        this.logger.log(`No agents available, adding call ${request.callSid} to queue`);

        const queueEntry = await this.roundRobinService.addToQueue({
          propertyId: request.propertyId,
          customerPhone: request.from,
        });

        callLog.status = 'QUEUED';
        await this.callLogRepo.save(callLog);

        return {
          callSid: request.callSid,
          status: 'QUEUED',
          queuePosition: 1, // You could calculate actual position
        };
      }
    } catch (error) {
      this.logger.error(`Error handling incoming call: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Handle call completion - Triggers post-call processing
   */
  async handleCallComplete(callSid: string): Promise<void> {
    try {
      this.logger.log(`Processing completed call ${callSid}`);

      const callLog = await this.callLogRepo.findOne({ where: { callSid } });
      if (!callLog) {
        throw new Error(`Call ${callSid} not found`);
      }

      // Update call status
      callLog.status = 'COMPLETED';
      callLog.endTime = new Date();
      
      // Get call details from Exotel
      const callDetails = await this.exotelService.getCallDetails(callSid);
      callLog.duration = callDetails.duration;
      callLog.recordingUrl = callDetails.recordingUrl;
      callLog.recordingSid = callDetails.recordingSid;

      await this.callLogRepo.save(callLog);

      // Release agent capacity
      if (callLog.agentId) {
        await this.roundRobinService.updateAgentLoad(callLog.agentId, false);
      }

      // Trigger async post-call processing
      this.processCallAsync(callSid);
    } catch (error) {
      this.logger.error(`Error handling call complete: ${error.message}`, error.stack);
    }
  }

  /**
   * Async post-call processing: Download → Store → Transcribe → Analyze
   */
  private async processCallAsync(callSid: string): Promise<void> {
    try {
      this.logger.log(`Starting async processing for call ${callSid}`);

      const callLog = await this.callLogRepo.findOne({ where: { callSid } });
      
      // Check if call is long enough to process
      const minDuration = this.configService.get<number>(
        'MIN_CALL_DURATION_FOR_TRANSCRIPTION',
        30,
      );

      if (callLog.duration < minDuration) {
        this.logger.log(`Call ${callSid} too short (${callLog.duration}s), skipping processing`);
        return;
      }

      // Step 1: Download recording from Exotel
      if (!callLog.recordingUrl) {
        this.logger.warn(`No recording URL for call ${callSid}`);
        return;
      }

      this.logger.log(`Downloading recording from ${callLog.recordingUrl}`);
      const recordingBuffer = await this.exotelService.downloadRecording(
        callLog.recordingUrl,
      );

      // Step 2: Upload to storage (S3 or local)
      this.logger.log(`Uploading recording to storage`);
      const uploadResult = await this.storageService.uploadRecording(
        callSid,
        recordingBuffer,
        'audio/mpeg',
      );

      callLog.storageUrl = uploadResult.url;
      callLog.storageKey = uploadResult.key;
      await this.callLogRepo.save(callLog);

      // Step 3: Transcribe using Whisper
      if (this.configService.get<boolean>('AUTO_TRANSCRIBE_CALLS', true)) {
        this.logger.log(`Transcribing call ${callSid}`);
        const transcription = await this.transcriptionService.transcribeCall(
          callSid,
          recordingBuffer,
          'mp3',
        );

        // Step 4: AI Analysis using GPT-4
        if (this.configService.get<boolean>('AUTO_ANALYZE_CALLS', true)) {
          this.logger.log(`Analyzing call ${callSid} with AI`);
          const analysis = await this.aiAnalysisService.analyzeCall(callSid);

          // Step 5: Auto-create lead if hot lead detected
          if (
            analysis.hotLead &&
            this.configService.get<boolean>('AUTO_CREATE_LEADS', true)
          ) {
            this.logger.log(`Hot lead detected! Creating lead for ${analysis.leadInfo.customerName}`);
            await this.createLeadFromAnalysis(callSid, analysis);
          }
        }
      }

      this.logger.log(`Async processing completed for call ${callSid}`);
    } catch (error) {
      this.logger.error(
        `Error in async call processing for ${callSid}: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Create call log entry
   */
  private async createCallLog(request: IncomingCallRequest): Promise<CallLog> {
    const callLog = this.callLogRepo.create({
      callSid: request.callSid,
      propertyId: request.propertyId,
      customerPhone: request.from,
      virtualNumber: request.to,
      direction: request.direction || 'INBOUND',
      status: 'INITIATED',
      startTime: new Date(),
    });

    return await this.callLogRepo.save(callLog);
  }

  /**
   * Create lead from AI analysis (placeholder - will integrate with leads module)
   */
  private async createLeadFromAnalysis(callSid: string, analysis: any): Promise<void> {
    try {
      // This will integrate with your existing leads module
      // For now, we'll just log the intent
      
      this.logger.log(`Would create lead with data:`, {
        name: analysis.leadInfo.customerName,
        phone: analysis.leadInfo.customerPhone,
        email: analysis.leadInfo.customerEmail,
        budget: `₹${analysis.leadInfo.budgetMin} - ₹${analysis.leadInfo.budgetMax}`,
        location: analysis.leadInfo.preferredLocation,
        bhk: analysis.leadInfo.bhkRequirement,
        source: 'TELEPHONY',
        callSid: callSid,
        leadScore: analysis.leadQualityScore,
      });

      // TODO: Integrate with LeadsService
      // await this.leadsService.create({
      //   ...
      // });
    } catch (error) {
      this.logger.error(`Error creating lead: ${error.message}`);
    }
  }

  /**
   * Get call by SID
   */
  async getCall(callSid: string): Promise<CallLog | null> {
    return await this.callLogRepo.findOne({
      where: { callSid },
      relations: ['transcription', 'aiInsight'],
    });
  }

  /**
   * Get all calls with filters
   */
  async getCalls(filters: {
    propertyId?: number;
    agentId?: number;
    status?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }): Promise<{ calls: CallLog[]; total: number }> {
    try {
      const queryBuilder = this.callLogRepo.createQueryBuilder('call');

      if (filters.propertyId) {
        queryBuilder.andWhere('call.property_id = :propertyId', {
          propertyId: filters.propertyId,
        });
      }

      if (filters.agentId) {
        queryBuilder.andWhere('call.agent_id = :agentId', {
          agentId: filters.agentId,
        });
      }

      if (filters.status) {
        queryBuilder.andWhere('call.status = :status', {
          status: filters.status,
        });
      }

      if (filters.startDate) {
        queryBuilder.andWhere('call.start_time >= :startDate', {
          startDate: filters.startDate,
        });
      }

      if (filters.endDate) {
        queryBuilder.andWhere('call.start_time <= :endDate', {
          endDate: filters.endDate,
        });
      }

      queryBuilder.orderBy('call.start_time', 'DESC');

      const total = await queryBuilder.getCount();

      queryBuilder
        .skip(filters.offset || 0)
        .take(filters.limit || 50);

      const calls = await queryBuilder.getMany();

      return { calls, total };
    } catch (error) {
      this.logger.error(`Error fetching calls: ${error.message}`);
      return { calls: [], total: 0 };
    }
  }

  /**
   * Get call statistics
   */
  async getStatistics(propertyId?: number): Promise<any> {
    try {
      let query = this.callLogRepo.createQueryBuilder('call');

      if (propertyId) {
        query = query.where('call.property_id = :propertyId', { propertyId });
      }

      const stats = await query
        .select([
          'COUNT(*) as total_calls',
          'COUNT(*) FILTER (WHERE status = \'COMPLETED\') as completed_calls',
          'COUNT(*) FILTER (WHERE status = \'MISSED\') as missed_calls',
          'COUNT(*) FILTER (WHERE status = \'FAILED\') as failed_calls',
          'AVG(duration)::int as avg_duration',
          'SUM(duration)::int as total_duration',
        ])
        .getRawOne();

      return {
        totalCalls: parseInt(stats.total_calls) || 0,
        completedCalls: parseInt(stats.completed_calls) || 0,
        missedCalls: parseInt(stats.missed_calls) || 0,
        failedCalls: parseInt(stats.failed_calls) || 0,
        avgDuration: parseInt(stats.avg_duration) || 0,
        totalDuration: parseInt(stats.total_duration) || 0,
      };
    } catch (error) {
      this.logger.error(`Error getting statistics: ${error.message}`);
      return null;
    }
  }

  /**
   * Manual trigger for post-call processing (for testing or retry)
   */
  async reprocessCall(callSid: string): Promise<void> {
    await this.processCallAsync(callSid);
  }

  /**
   * Make outbound call
   */
  async makeOutboundCall(params: {
    propertyId: number;
    agentPhone: string;
    customerPhone: string;
    callerId?: string;
  }): Promise<CallProcessingResult> {
    try {
      this.logger.log(`Making outbound call from ${params.agentPhone} to ${params.customerPhone}`);

      // Make call via Exotel
      const callResponse = await this.exotelService.makeCall({
        from: params.agentPhone,
        to: params.customerPhone,
        callerId: params.callerId,
      });

      // Create call log
      const callLog = await this.createCallLog({
        callSid: callResponse.callSid,
        from: params.agentPhone,
        to: params.customerPhone,
        propertyId: params.propertyId,
        direction: 'OUTBOUND',
      });

      return {
        callSid: callResponse.callSid,
        status: callResponse.status,
      };
    } catch (error) {
      this.logger.error(`Error making outbound call: ${error.message}`);
      throw error;
    }
  }
}


