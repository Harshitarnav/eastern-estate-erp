import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Patch,
} from '@nestjs/common';
import { LeadsService } from './leads.service';
import {
  CreateLeadDto,
  UpdateLeadDto,
  QueryLeadDto,
  LeadResponseDto,
  PaginatedLeadsResponse,
} from './dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('leads')
@UseGuards(JwtAuthGuard)
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  /**
   * Create a new lead
   * POST /leads
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createLeadDto: CreateLeadDto): Promise<LeadResponseDto> {
    return this.leadsService.create(createLeadDto);
  }

  /**
   * Get all leads with filtering and pagination
   * GET /leads
   */
  @Get()
  async findAll(@Query() query: QueryLeadDto): Promise<PaginatedLeadsResponse> {
    return this.leadsService.findAll(query);
  }

  /**
   * Get leads statistics
   * GET /leads/statistics
   */
  @Get('statistics')
  async getStatistics() {
    return this.leadsService.getStatistics();
  }

  /**
   * Get my leads (assigned to current user)
   * GET /leads/my-leads/:userId
   */
  @Get('my-leads/:userId')
  async getMyLeads(@Param('userId') userId: string): Promise<LeadResponseDto[]> {
    return this.leadsService.getMyLeads(userId);
  }

  /**
   * Get leads due for follow-up
   * GET /leads/due-followups
   */
  @Get('due-followups')
  async getDueFollowUps(@Query('userId') userId?: string): Promise<LeadResponseDto[]> {
    return this.leadsService.getDueFollowUps(userId);
  }

  /**
   * Get lead by ID
   * GET /leads/:id
   */
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<LeadResponseDto> {
    return this.leadsService.findOne(id);
  }

  /**
   * Update lead
   * PUT /leads/:id
   */
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateLeadDto: UpdateLeadDto,
  ): Promise<LeadResponseDto> {
    return this.leadsService.update(id, updateLeadDto);
  }

  /**
   * Assign lead to user
   * PATCH /leads/:id/assign
   */
  @Patch(':id/assign')
  async assignLead(
    @Param('id') id: string,
    @Body('userId') userId: string,
  ): Promise<LeadResponseDto> {
    return this.leadsService.assignLead(id, userId);
  }

  /**
   * Update lead status
   * PATCH /leads/:id/status
   */
  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @Body('notes') notes?: string,
  ): Promise<LeadResponseDto> {
    return this.leadsService.updateStatus(id, status, notes);
  }

  /**
   * Delete lead
   * DELETE /leads/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    return this.leadsService.remove(id);
  }
}
