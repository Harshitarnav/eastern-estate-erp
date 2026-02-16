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
import { DemandDraftsService } from './demand-drafts.service';
import { AutoDemandDraftService } from '../construction/services/auto-demand-draft.service';

@Controller('demand-drafts')
@UseGuards(JwtAuthGuard)
export class DemandDraftsController {
  constructor(
    private readonly demandDraftsService: DemandDraftsService,
    private readonly autoDemandDraftService: AutoDemandDraftService,
  ) {}

  @Get()
  async findAll(@Query() query: any) {
    return await this.demandDraftsService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.demandDraftsService.findOne(id);
  }

  @Post()
  async create(@Body() createDto: any, @Req() req: any) {
    return await this.demandDraftsService.create(createDto, req.user.id);
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
  async remove(@Param('id') id: string) {
    await this.demandDraftsService.remove(id);
    return { message: 'Demand draft deleted successfully' };
  }

  /**
   * Approve a demand draft (ready to send)
   */
  @Put(':id/approve')
  async approve(@Param('id') id: string, @Req() req: any) {
    return await this.autoDemandDraftService.approveDemandDraft(id, req.user.id);
  }

  /**
   * Send a demand draft to customer
   */
  @Post(':id/send')
  async send(@Param('id') id: string, @Req() req: any) {
    return await this.autoDemandDraftService.sendDemandDraft(id, req.user.id);
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
