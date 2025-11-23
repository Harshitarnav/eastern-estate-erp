import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CallLog } from '../telephony/entities/call-log.entity';
import { CallTranscription } from '../telephony/entities/call-transcription.entity';
import { AiInsight } from '../telephony/entities/ai-insight.entity';
import { AgentAvailability } from '../telephony/entities/agent-availability.entity';

/**
 * Simple Telephony Controller - Read-only endpoints
 */
@Controller('telephony')
// @UseGuards(JwtAuthGuard) // Temporarily disabled for testing
export class TelephonySimpleController {
  private readonly logger = new Logger(TelephonySimpleController.name);

  constructor(
    @InjectRepository(CallLog)
    private callLogRepo: Repository<CallLog>,
    @InjectRepository(CallTranscription)
    private transcriptionRepo: Repository<CallTranscription>,
    @InjectRepository(AiInsight)
    private aiInsightRepo: Repository<AiInsight>,
    @InjectRepository(AgentAvailability)
    private agentAvailabilityRepo: Repository<AgentAvailability>,
  ) {}

  /**
   * Get all calls with filters
   * GET /api/telephony/calls
   */
  @Get('calls')
  async getCalls(
    @Query('propertyId') propertyId?: string,
    @Query('status') status?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    try {
      const queryBuilder = this.callLogRepo
        .createQueryBuilder('call')
        .orderBy('call.queuedAt', 'DESC');

      if (propertyId) {
        queryBuilder.andWhere('call.propertyId = :propertyId', { propertyId });
      }

      if (status) {
        queryBuilder.andWhere('call.status = :status', { status });
      }

      const limitNum = limit ? parseInt(limit) : 50;
      const offsetNum = offset ? parseInt(offset) : 0;

      const [calls, total] = await queryBuilder
        .skip(offsetNum)
        .take(limitNum)
        .getManyAndCount();

      return {
        success: true,
        data: calls,
        meta: {
          total,
          limit: limitNum,
          offset: offsetNum,
        },
      };
    } catch (error) {
      this.logger.error(`Error fetching calls: ${error.message}`);
      return {
        success: false,
        data: [],
        meta: { total: 0, limit: 50, offset: 0 },
      };
    }
  }

  /**
   * Get call by SID
   * GET /api/telephony/calls/:callSid
   */
  @Get('calls/:callSid')
  async getCall(@Param('callSid') callSid: string) {
    try {
      const call = await this.callLogRepo.findOne({
        where: { callSid },
      });

      if (!call) {
        return {
          success: false,
          message: 'Call not found',
        };
      }

      return {
        success: true,
        data: call,
      };
    } catch (error) {
      this.logger.error(`Error fetching call: ${error.message}`);
      return {
        success: false,
        message: 'Failed to fetch call',
      };
    }
  }

  /**
   * Get call transcription
   * GET /api/telephony/calls/:callSid/transcription
   */
  @Get('calls/:callSid/transcription')
  async getTranscription(@Param('callSid') callSid: string) {
    try {
      // First find the call
      const call = await this.callLogRepo.findOne({
        where: { callSid },
        relations: ['transcription'],
      });

      if (!call || !call.transcription) {
        return {
          success: false,
          message: 'Transcription not found',
        };
      }

      return {
        success: true,
        data: call.transcription,
      };
    } catch (error) {
      this.logger.error(`Error fetching transcription: ${error.message}`);
      return {
        success: false,
        message: 'Failed to fetch transcription',
      };
    }
  }

  /**
   * Get AI insights for a call
   * GET /api/telephony/calls/:callSid/insights
   */
  @Get('calls/:callSid/insights')
  async getInsights(@Param('callSid') callSid: string) {
    try {
      // First find the call
      const call = await this.callLogRepo.findOne({
        where: { callSid },
        relations: ['aiInsight'],
      });

      if (!call || !call.aiInsight) {
        return {
          success: false,
          message: 'Insights not found',
        };
      }

      return {
        success: true,
        data: call.aiInsight,
      };
    } catch (error) {
      this.logger.error(`Error fetching insights: ${error.message}`);
      return {
        success: false,
        message: 'Failed to fetch insights',
      };
    }
  }

  /**
   * Get call recording URL (placeholder)
   * GET /api/telephony/calls/:callSid/recording
   */
  @Get('calls/:callSid/recording')
  async getRecording(@Param('callSid') callSid: string) {
    try {
      const call = await this.callLogRepo.findOne({
        where: { callSid },
      });

      if (!call || !call.recordingUrl) {
        return {
          success: false,
          message: 'Recording not found',
        };
      }

      return {
        success: true,
        data: {
          url: call.recordingUrl,
          expiresIn: 3600,
          callSid,
        },
      };
    } catch (error) {
      this.logger.error(`Error fetching recording: ${error.message}`);
      return {
        success: false,
        message: 'Failed to fetch recording',
      };
    }
  }

  /**
   * Get call statistics
   * GET /api/telephony/calls/stats/summary
   */
  @Get('calls/stats/summary')
  async getStatistics(@Query('propertyId') propertyId?: string) {
    try {
      this.logger.log('Fetching call statistics...');
      
      let baseQuery = this.callLogRepo.createQueryBuilder('call');
      if (propertyId) {
        baseQuery = baseQuery.where('call.propertyId = :propertyId', { propertyId });
      }

      const totalCalls = await baseQuery.getCount();
      this.logger.log(`Total calls found: ${totalCalls}`);

      let completedQuery = this.callLogRepo.createQueryBuilder('call');
      if (propertyId) {
        completedQuery = completedQuery.where('call.propertyId = :propertyId', { propertyId });
      }
      const completedCalls = await completedQuery
        .andWhere('call.status = :status', { status: 'COMPLETED' })
        .getCount();

      let missedQuery = this.callLogRepo.createQueryBuilder('call');
      if (propertyId) {
        missedQuery = missedQuery.where('call.propertyId = :propertyId', { propertyId });
      }
      const missedCalls = await missedQuery
        .andWhere('call.status = :status', { status: 'NO_ANSWER' })
        .getCount();

      let failedQuery = this.callLogRepo.createQueryBuilder('call');
      if (propertyId) {
        failedQuery = failedQuery.where('call.propertyId = :propertyId', { propertyId });
      }
      const failedCalls = await failedQuery
        .andWhere('call.status = :status', { status: 'FAILED' })
        .getCount();

      let avgQuery = this.callLogRepo.createQueryBuilder('call');
      if (propertyId) {
        avgQuery = avgQuery.where('call.propertyId = :propertyId', { propertyId });
      }
      const avgDuration = await avgQuery
        .select('AVG(call.duration)', 'avg')
        .getRawOne();

      const stats = {
        totalCalls,
        completedCalls,
        missedCalls,
        failedCalls,
        avgDuration: parseInt(avgDuration?.avg || '0'),
        totalDuration: 0,
      };

      this.logger.log(`Stats: ${JSON.stringify(stats)}`);

      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      this.logger.error(`Error fetching statistics: ${error.message}`, error.stack);
      return {
        success: true,
        data: {
          totalCalls: 0,
          completedCalls: 0,
          missedCalls: 0,
          failedCalls: 0,
          avgDuration: 0,
          totalDuration: 0,
        },
      };
    }
  }

  /**
   * Get hot leads from AI insights
   * GET /api/telephony/calls/insights/hot-leads
   */
  @Get('calls/insights/hot-leads')
  async getHotLeads(
    @Query('propertyId') propertyId?: string,
    @Query('limit') limit?: string,
  ) {
    try {
      this.logger.log('Fetching hot leads...');
      
      const queryBuilder = this.aiInsightRepo
        .createQueryBuilder('ai')
        .where('ai.hot_lead = true')
        .orderBy('ai.lead_quality_score', 'DESC')
        .addOrderBy('ai.conversion_probability', 'DESC');

      if (propertyId) {
        queryBuilder
          .innerJoin('ai.callLog', 'call')
          .andWhere('call.property_id = :propertyId', { propertyId });
      }

      const limitNum = limit ? parseInt(limit) : 50;
      const hotLeads = await queryBuilder.take(limitNum).getMany();
      
      this.logger.log(`Found ${hotLeads.length} hot leads`);

      return {
        success: true,
        data: hotLeads,
      };
    } catch (error) {
      this.logger.error(`Error fetching hot leads: ${error.message}`, error.stack);
      return {
        success: true,
        data: [],
      };
    }
  }
}

