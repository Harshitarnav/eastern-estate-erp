import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Query,
  Body,
  UseGuards,
  Logger,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RoundRobinService } from '../services/round-robin.service';
import {
  UpdateAgentAvailabilityDto,
  UpdateAgentSkillsDto,
  AgentStatsQueryDto,
} from '../dto/agent.dto';

/**
 * Agents Controller - REST API for agent management
 */
@Controller('api/telephony/agents')
@UseGuards(JwtAuthGuard)
export class AgentsController {
  private readonly logger = new Logger(AgentsController.name);

  constructor(private roundRobinService: RoundRobinService) {}

  /**
   * Get agent statistics
   * GET /api/telephony/agents/:employeeId/stats
   */
  @Get(':employeeId/stats')
  async getAgentStats(@Param('employeeId') employeeId: number) {
    try {
      const stats = await this.roundRobinService.getAgentStats(Number(employeeId));

      if (!stats) {
        throw new HttpException('Agent not found', HttpStatus.NOT_FOUND);
      }

      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      this.logger.error(`Error fetching agent stats: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update agent availability
   * PUT /api/telephony/agents/availability
   */
  @Put('availability')
  async updateAvailability(@Body() dto: UpdateAgentAvailabilityDto) {
    try {
      await this.roundRobinService.setAgentAvailability(
        dto.employeeId,
        dto.isAvailable,
        dto.reason,
      );

      return {
        success: true,
        message: 'Agent availability updated',
      };
    } catch (error) {
      this.logger.error(`Error updating availability: ${error.message}`);
      throw new HttpException(
        'Failed to update availability',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get queue statistics for a property
   * GET /api/telephony/agents/queue/stats
   */
  @Get('queue/stats')
  async getQueueStats(@Query('propertyId') propertyId: number) {
    try {
      const stats = await this.roundRobinService.getQueueStats(Number(propertyId));

      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      this.logger.error(`Error fetching queue stats: ${error.message}`);
      throw new HttpException(
        'Failed to fetch queue stats',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Process call queue manually
   * POST /api/telephony/agents/queue/process
   */
  @Post('queue/process')
  async processQueue(@Body('propertyId') propertyId: number) {
    try {
      await this.roundRobinService.processQueue(propertyId);

      return {
        success: true,
        message: 'Queue processing initiated',
      };
    } catch (error) {
      this.logger.error(`Error processing queue: ${error.message}`);
      throw new HttpException(
        'Failed to process queue',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

