"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DemandDraftsController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const demand_drafts_service_1 = require("./demand-drafts.service");
const auto_demand_draft_service_1 = require("../construction/services/auto-demand-draft.service");
let DemandDraftsController = class DemandDraftsController {
    constructor(demandDraftsService, autoDemandDraftService) {
        this.demandDraftsService = demandDraftsService;
        this.autoDemandDraftService = autoDemandDraftService;
    }
    async findAll(query) {
        return await this.demandDraftsService.findAll(query);
    }
    async findOne(id) {
        return await this.demandDraftsService.findOne(id);
    }
    async create(createDto, req) {
        return await this.demandDraftsService.create(createDto, req.user.id);
    }
    async update(id, updateDto, req) {
        return await this.demandDraftsService.update(id, updateDto, req.user.id);
    }
    async remove(id) {
        await this.demandDraftsService.remove(id);
        return { message: 'Demand draft deleted successfully' };
    }
    async approve(id, req) {
        return await this.autoDemandDraftService.approveDemandDraft(id, req.user.id);
    }
    async send(id, req) {
        return await this.autoDemandDraftService.sendDemandDraft(id, req.user.id);
    }
    async preview(id) {
        const draft = await this.demandDraftsService.findOne(id);
        return {
            html: draft.content || '<p>No content available</p>',
            metadata: draft.metadata,
        };
    }
    async export(id) {
        const draft = await this.demandDraftsService.findOne(id);
        const title = draft.metadata?.title || 'Payment Demand';
        const dueDate = draft.metadata?.dueDate ? new Date(draft.metadata.dueDate).toLocaleDateString() : 'N/A';
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
};
exports.DemandDraftsController = DemandDraftsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DemandDraftsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DemandDraftsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], DemandDraftsController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], DemandDraftsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DemandDraftsController.prototype, "remove", null);
__decorate([
    (0, common_1.Put)(':id/approve'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DemandDraftsController.prototype, "approve", null);
__decorate([
    (0, common_1.Post)(':id/send'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DemandDraftsController.prototype, "send", null);
__decorate([
    (0, common_1.Get)(':id/preview'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DemandDraftsController.prototype, "preview", null);
__decorate([
    (0, common_1.Get)(':id/export'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DemandDraftsController.prototype, "export", null);
exports.DemandDraftsController = DemandDraftsController = __decorate([
    (0, common_1.Controller)('demand-drafts'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [demand_drafts_service_1.DemandDraftsService,
        auto_demand_draft_service_1.AutoDemandDraftService])
], DemandDraftsController);
//# sourceMappingURL=demand-drafts.controller.js.map