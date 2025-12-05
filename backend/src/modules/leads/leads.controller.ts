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
  HttpException,
  Patch,
  Req,
} from '@nestjs/common';
import { LeadsService } from './leads.service';
import { PriorityService } from './priority.service';
import {
  CreateLeadDto,
  UpdateLeadDto,
  QueryLeadDto,
  LeadResponseDto,
  PaginatedLeadsResponse,
} from './dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Request } from 'express';

@Controller('leads')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LeadsController {
  constructor(
    private readonly leadsService: LeadsService,
    private readonly priorityService: PriorityService,
  ) {}

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
  async findAll(@Query() query: QueryLeadDto, @Req() req: Request): Promise<PaginatedLeadsResponse> {
    console.log('[LeadsController] findAll query:', query, 'user:', (req.user as any)?.id);
    return this.leadsService.findAll(query, req.user as any);
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
   * Get prioritized leads for current user
   * GET /leads/prioritized
   */
  @Get('prioritized')
  async getPrioritizedLeads(@Req() req: Request, @Query('userId') userId?: string) {
    const leads = await this.leadsService.getMyLeads(this.getEffectiveUserId(req, userId));
    const prioritized = this.priorityService.prioritizeLeads(leads as any[]);
    
    // Add priority info to each lead
    return prioritized.map(lead => ({
      ...lead,
      priorityInfo: this.priorityService.calculateLeadPriority(lead),
    }));
  }

  /**
   * Get today's prioritized tasks
   * GET /leads/today-tasks
   */
  @Get('today-tasks')
  async getTodaysTasks(@Req() req: Request, @Query('userId') userId?: string) {
    const leads = await this.leadsService.getMyLeads(this.getEffectiveUserId(req, userId));
    return this.priorityService.getTodaysPrioritizedTasks(leads as any[]);
  }

  /**
   * Get smart tips for current user
   * GET /leads/smart-tips
   */
  @Get('smart-tips')
  async getSmartTips(@Req() req: Request, @Query('userId') userId?: string) {
    const leads = await this.leadsService.getMyLeads(this.getEffectiveUserId(req, userId));
    return {
      tips: this.priorityService.getSmartTips(leads as any[]),
      timestamp: new Date(),
    };
  }

  /**
   * Get my leads (assigned to current user)
   * GET /leads/my-leads/:userId
   */
  @Get('my-leads/:userId')
  async getMyLeads(@Param('userId') userId: string, @Req() req: Request): Promise<LeadResponseDto[]> {
    return this.leadsService.getMyLeads(this.getEffectiveUserId(req, userId));
  }

  /**
   * Get leads due for follow-up
   * GET /leads/due-followups
   */
  @Get('due-followups')
  async getDueFollowUps(@Req() req: Request, @Query('userId') userId?: string): Promise<LeadResponseDto[]> {
    return this.leadsService.getDueFollowUps(this.getEffectiveUserId(req, userId));
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
  @Roles('super_admin', 'admin', 'sales_manager', 'sales_gm')
  async assignLead(
    @Param('id') id: string,
    @Body('userId') userId: string,
    @Req() req: Request,
  ): Promise<LeadResponseDto> {
    return this.leadsService.assignLead(id, userId, (req.user as any)?.id);
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

  /**
   * Public lead capture endpoint (token protected)
   * POST /leads/public
   */
  @Post('public')
  @HttpCode(HttpStatus.CREATED)
  async createPublicLead(
    @Body() createLeadDto: Partial<CreateLeadDto>,
    @Req() req: Request,
  ): Promise<LeadResponseDto> {
    const token = (req.headers['x-public-token'] || req.query.token) as string;
    const expected = process.env.PUBLIC_LEAD_TOKEN;
    if (!expected || token !== expected) {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }
    const payload: CreateLeadDto = {
      firstName: createLeadDto.firstName || 'Website',
      lastName: createLeadDto.lastName || 'Lead',
      phone: createLeadDto.phone || createLeadDto['phoneNumber'] || '',
      email: createLeadDto.email || '',
      source: (createLeadDto.source as any) || 'WEBSITE',
      status: createLeadDto.status as any || 'NEW',
      notes: createLeadDto.notes || '',
      propertyId: createLeadDto.propertyId,
      towerId: createLeadDto['towerId'],
      flatId: createLeadDto['flatId'],
    };
    return this.leadsService.create(payload);
  }

  /**
   * Bulk assign leads
   * POST /leads/bulk-assign
   */
  @Post('bulk-assign')
  async bulkAssignLeads(@Body() bulkAssignDto: any): Promise<{ assigned: number }> {
    return this.leadsService.bulkAssignLeads(bulkAssignDto);
  }

  /**
   * Check for duplicate lead
   * POST /leads/check-duplicate
   */
  @Post('check-duplicate')
  async checkDuplicateLead(@Body() checkDto: any) {
    return this.leadsService.checkDuplicateLead(checkDto);
  }

  /**
   * Get agent dashboard statistics
   * GET /leads/dashboard/agent/:agentId
   */
  @Get('dashboard/agent/:agentId')
  async getAgentDashboardStats(
    @Param('agentId') agentId: string,
    @Query() query: any,
  ) {
    return this.leadsService.getAgentDashboardStats(agentId, query);
  }

  /**
   * Get admin dashboard statistics
   * GET /leads/dashboard/admin
   */
  @Get('dashboard/admin')
  async getAdminDashboardStats(@Query() query: any) {
    return this.leadsService.getAdminDashboardStats(query);
  }

  /**
   * Get team dashboard statistics
   * GET /leads/dashboard/team/:gmId
   */
  @Get('dashboard/team/:gmId')
  async getTeamDashboardStats(
    @Param('gmId') gmId: string,
    @Query() query: any,
  ) {
    return this.leadsService.getTeamDashboardStats(gmId, query);
  }

  /**
   * Import leads from Excel data
   * POST /leads/import
   */
  @Post('import')
  async importLeads(@Body() importDto: any) {
    return this.leadsService.importLeads(importDto);
  }

  private getEffectiveUserId(req: Request, requestedUserId?: string): string {
    const user = req.user as any;
    const roles: string[] = user?.roles?.map((r: any) => r.name) ?? [];
    const isManager = roles.some((r) =>
      ['super_admin', 'admin', 'sales_manager', 'sales_gm'].includes(r),
    );
    if (isManager && requestedUserId) return requestedUserId;
    return user?.id;
  }
}
