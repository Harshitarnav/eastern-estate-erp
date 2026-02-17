import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/constants/roles.constant';
import { DemandDraftsService } from './demand-drafts.service';
import { AutoDemandDraftService } from '../construction/services/auto-demand-draft.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType, NotificationCategory } from '../notifications/entities/notification.entity';

@Controller('demand-drafts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DemandDraftsController {
  constructor(
    private readonly demandDraftsService: DemandDraftsService,
    private readonly autoDemandDraftService: AutoDemandDraftService,
    private readonly notificationsService: NotificationsService,
  ) {}

  @Get()
  async findAll(@Query() query: any, @Req() req: any) {
    return await this.demandDraftsService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.demandDraftsService.findOne(id);
  }

  /**
   * Create user-generated demand draft
   * Sales team can create drafts, admin receives notification
   */
  @Post()
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.SALES_TEAM)
  async create(@Body() createDto: any, @Req() req: any) {
    const draft = await this.demandDraftsService.create(createDto, req.user.id);

    // Notify admin about user-created demand draft
    await this.notificationsService.create({
      targetRoles: 'admin,super_admin',
      title: 'New Demand Draft Created',
      message: `${req.user.firstName} ${req.user.lastName} created a demand draft for ₹${createDto.amount.toLocaleString('en-IN')}`,
      type: NotificationType.INFO,
      category: NotificationCategory.PAYMENT,
      actionUrl: `/demand-drafts/${draft.id}`,
      actionLabel: 'Review Draft',
      relatedEntityId: draft.id,
      relatedEntityType: 'demand_draft',
      priority: 5,
    }, req.user.id);

    return draft;
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: any,
    @Req() req: any,
  ) {
    return await this.demandDraftsService.update(id, updateDto, req.user.id);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async remove(@Param('id') id: string) {
    await this.demandDraftsService.remove(id);
    return { message: 'Demand draft deleted successfully' };
  }

  /**
   * Approve a demand draft (ready to send)
   * Admin/Super Admin only
   */
  @Put(':id/approve')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async approve(@Param('id') id: string, @Req() req: any) {
    const result = await this.autoDemandDraftService.approveDemandDraft(id, req.user.id);

    // Notify creator
    const draft = await this.demandDraftsService.findOne(id);
    if (draft.createdBy && draft.createdBy !== req.user.id) {
      await this.notificationsService.create({
        userId: draft.createdBy,
        title: 'Demand Draft Approved',
        message: `Your demand draft for ₹${draft.amount.toLocaleString('en-IN')} has been approved`,
        type: NotificationType.SUCCESS,
        category: NotificationCategory.PAYMENT,
        actionUrl: `/demand-drafts/${id}`,
        actionLabel: 'View Draft',
      }, req.user.id);
    }

    return result;
  }

  /**
   * Send a demand draft to customer
   * Admin/Super Admin only
   */
  @Post(':id/send')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async send(@Param('id') id: string, @Req() req: any) {
    const result = await this.autoDemandDraftService.sendDemandDraft(id, req.user.id);

    // Notify creator
    const draft = await this.demandDraftsService.findOne(id);
    if (draft.createdBy && draft.createdBy !== req.user.id) {
      await this.notificationsService.create({
        userId: draft.createdBy,
        title: 'Demand Draft Sent',
        message: `Your demand draft has been sent to the customer`,
        type: NotificationType.SUCCESS,
        category: NotificationCategory.PAYMENT,
        actionUrl: `/demand-drafts/${id}`,
        actionLabel: 'View Draft',
      }, req.user.id);
    }

    return result;
  }

  /**
   * Get HTML preview of demand draft
   */
  @Get(':id/preview')
  async preview(@Param('id') id: string) {
    const draft = await this.demandDraftsService.findOne(id);
    return {
      html: draft.content || '<p>No content available</p>',
      metadata: draft.metadata,
    };
  }

  /**
   * Export demand draft as formatted HTML/PDF-ready content
   */
  @Get(':id/export')
  async export(@Param('id') id: string) {
    const draft = await this.demandDraftsService.findOne(id);
    const title = draft.metadata?.title || 'Payment Demand';
    const dueDate = draft.metadata?.dueDate ? new Date(draft.metadata.dueDate).toLocaleDateString() : 'N/A';
    
    // Generate formatted HTML for PDF export
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    .header {
      text-align: center;
      border-bottom: 2px solid #333;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .header h1 {
      margin: 0;
      color: #1a1a1a;
    }
    .content {
      white-space: pre-wrap;
      margin: 20px 0;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #ccc;
      font-size: 12px;
      color: #666;
    }
    .amount {
      font-weight: bold;
      color: #d9534f;
      font-size: 18px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 12px;
      text-align: left;
    }
    th {
      background-color: #f5f5f5;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${title}</h1>
    <p>Generated on: ${new Date().toLocaleString()}</p>
  </div>
  
  <div class="content">
    ${draft.content || 'No content available'}
  </div>

  <div class="footer">
    <p><strong>Draft ID:</strong> ${draft.id}</p>
    <p><strong>Due Date:</strong> ${dueDate}</p>
    <p><strong>Status:</strong> ${draft.status}</p>
    <p><strong>Amount:</strong> ₹${draft.amount?.toLocaleString('en-IN') || '0'}</p>
    <p><em>This is a computer-generated document and does not require a signature.</em></p>
  </div>
</body>
</html>
    `.trim();

    return {
      html,
      filename: `demand-draft-${draft.id}.html`,
      contentType: 'text/html',
    };
  }
}
