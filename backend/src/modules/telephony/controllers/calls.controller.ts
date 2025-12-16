import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  UseGuards,
  Logger,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { CallService } from '../services/call.service';
import { TranscriptionService } from '../services/transcription.service';
import { AIAnalysisService } from '../services/ai-analysis.service';
import { StorageService } from '../services/storage.service';
import { MakeCallDto, CallQueryDto } from '../dto/incoming-call.dto';

/**
 * Calls Controller - REST API for call management
 */
@Controller('api/telephony/calls')
@UseGuards(JwtAuthGuard)
export class CallsController {
  private readonly logger = new Logger(CallsController.name);

  constructor(
    private callService: CallService,
    private transcriptionService: TranscriptionService,
    private aiAnalysisService: AIAnalysisService,
    private storageService: StorageService,
  ) {}

  /**
   * Get all calls with filtering
   * GET /api/telephony/calls
   */
  @Get()
  async getCalls(@Query() query: CallQueryDto) {
    try {
      const filters = {
        propertyId: query.propertyId ? Number(query.propertyId) : undefined,
        agentId: query.agentId ? Number(query.agentId) : undefined,
        status: query.status,
        startDate: query.startDate ? new Date(query.startDate) : undefined,
        endDate: query.endDate ? new Date(query.endDate) : undefined,
        limit: query.limit ? Number(query.limit) : 50,
        offset: query.offset ? Number(query.offset) : 0,
      };

      const result = await this.callService.getCalls(filters);

      return {
        success: true,
        data: result.calls,
        meta: {
          total: result.total,
          limit: filters.limit,
          offset: filters.offset,
        },
      };
    } catch (error) {
      this.logger.error(`Error fetching calls: ${error.message}`);
      throw new HttpException(
        'Failed to fetch calls',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get call by ID
   * GET /api/telephony/calls/:callSid
   */
  @Get(':callSid')
  async getCall(@Param('callSid') callSid: string) {
    try {
      const call = await this.callService.getCall(callSid);

      if (!call) {
        throw new HttpException('Call not found', HttpStatus.NOT_FOUND);
      }

      return {
        success: true,
        data: call,
      };
    } catch (error) {
      this.logger.error(`Error fetching call: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get call transcription
   * GET /api/telephony/calls/:callSid/transcription
   */
  @Get(':callSid/transcription')
  async getTranscription(@Param('callSid') callSid: string) {
    try {
      const transcription = await this.transcriptionService.getTranscription(callSid);

      if (!transcription) {
        throw new HttpException('Transcription not found', HttpStatus.NOT_FOUND);
      }

      return {
        success: true,
        data: transcription,
      };
    } catch (error) {
      this.logger.error(`Error fetching transcription: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get AI insights for a call
   * GET /api/telephony/calls/:callSid/insights
   */
  @Get(':callSid/insights')
  async getInsights(@Param('callSid') callSid: string) {
    try {
      const insights = await this.aiAnalysisService.getInsights(callSid);

      if (!insights) {
        throw new HttpException('Insights not found', HttpStatus.NOT_FOUND);
      }

      return {
        success: true,
        data: insights,
      };
    } catch (error) {
      this.logger.error(`Error fetching insights: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get call recording signed URL
   * GET /api/telephony/calls/:callSid/recording
   */
  @Get(':callSid/recording')
  async getRecording(@Param('callSid') callSid: string) {
    try {
      const call = await this.callService.getCall(callSid);

      if (!call || !call.storageKey) {
        throw new HttpException('Recording not found', HttpStatus.NOT_FOUND);
      }

      // Generate signed URL (expires in 1 hour)
      const url = await this.storageService.getSignedUrl(call.storageKey, 3600);

      return {
        success: true,
        data: {
          url,
          expiresIn: 3600,
          callSid,
        },
      };
    } catch (error) {
      this.logger.error(`Error fetching recording: ${error.message}`);
      throw error;
    }
  }

  /**
   * Make outbound call
   * POST /api/telephony/calls
   */
  @Post()
  async makeCall(@Body() makeCallDto: MakeCallDto) {
    try {
      const result = await this.callService.makeOutboundCall(makeCallDto);

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      this.logger.error(`Error making call: ${error.message}`);
      throw new HttpException(
        'Failed to make call',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Reprocess a call (transcription + analysis)
   * POST /api/telephony/calls/:callSid/reprocess
   */
  @Post(':callSid/reprocess')
  async reprocessCall(@Param('callSid') callSid: string) {
    try {
      await this.callService.reprocessCall(callSid);

      return {
        success: true,
        message: 'Call reprocessing initiated',
      };
    } catch (error) {
      this.logger.error(`Error reprocessing call: ${error.message}`);
      throw new HttpException(
        'Failed to reprocess call',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get call statistics
   * GET /api/telephony/calls/stats/summary
   */
  @Get('stats/summary')
  async getStatistics(@Query('propertyId') propertyId?: number) {
    try {
      const stats = await this.callService.getStatistics(propertyId);

      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      this.logger.error(`Error fetching statistics: ${error.message}`);
      throw new HttpException(
        'Failed to fetch statistics',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Search transcriptions
   * GET /api/telephony/calls/search/transcriptions
   */
  @Get('search/transcriptions')
  async searchTranscriptions(
    @Query('q') query: string,
    @Query('propertyId') propertyId?: number,
    @Query('limit') limit?: number,
  ) {
    try {
      const results = await this.transcriptionService.searchTranscriptions(
        query,
        propertyId,
        limit || 50,
      );

      return {
        success: true,
        data: results,
      };
    } catch (error) {
      this.logger.error(`Error searching transcriptions: ${error.message}`);
      throw new HttpException(
        'Failed to search transcriptions',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get hot leads from AI insights
   * GET /api/telephony/calls/hot-leads
   */
  @Get('insights/hot-leads')
  async getHotLeads(
    @Query('propertyId') propertyId?: number,
    @Query('limit') limit?: number,
  ) {
    try {
      const hotLeads = await this.aiAnalysisService.getHotLeads(
        propertyId,
        limit || 50,
      );

      return {
        success: true,
        data: hotLeads,
      };
    } catch (error) {
      this.logger.error(`Error fetching hot leads: ${error.message}`);
      throw new HttpException(
        'Failed to fetch hot leads',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}


