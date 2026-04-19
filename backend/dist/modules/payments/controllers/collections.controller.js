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
exports.CollectionsController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../../../auth/guards/roles.guard");
const roles_decorator_1 = require("../../../common/decorators/roles.decorator");
const collections_service_1 = require("../services/collections.service");
const overdue_scanner_service_1 = require("../services/overdue-scanner.service");
const demand_drafts_service_1 = require("../../demand-drafts/demand-drafts.service");
const auto_demand_draft_service_1 = require("../../construction/services/auto-demand-draft.service");
const demand_draft_entity_1 = require("../../demand-drafts/entities/demand-draft.entity");
const payments_service_1 = require("../payments.service");
let CollectionsController = class CollectionsController {
    constructor(collections, scanner, demandDrafts, autoDemandDrafts, payments) {
        this.collections = collections;
        this.scanner = scanner;
        this.demandDrafts = demandDrafts;
        this.autoDemandDrafts = autoDemandDrafts;
        this.payments = payments;
    }
    async list(query, req) {
        const userId = req.user?.id ?? null;
        const mineUserId = query.mine === 'true' && userId ? userId : undefined;
        const filter = {
            tier: query.tier,
            customerId: query.customerId,
            bookingId: query.bookingId,
            flatId: query.flatId,
            propertyId: query.propertyId,
            status: query.status,
            tone: query.tone,
            includeLegacyOnly: query.includeLegacyOnly === 'true',
            search: query.search,
            limit: query.limit ? Math.min(Number(query.limit), 200) : 50,
            offset: query.offset ? Number(query.offset) : 0,
            assigneeId: query.assigneeId && query.assigneeId !== 'unassigned'
                ? query.assigneeId
                : undefined,
            unassignedOnly: query.assigneeId === 'unassigned',
            mineUserId,
        };
        return this.collections.list(filter);
    }
    async stats(propertyId) {
        return this.collections.stats({ propertyId });
    }
    async assignees(propertyId) {
        return this.collections.listAssignees({ propertyId });
    }
    async detail(id) {
        return this.collections.detail(id);
    }
    async pause(id, body) {
        const days = Number(body?.days) || 14;
        if (days < 1 || days > 365) {
            throw new common_1.BadRequestException('days must be between 1 and 365');
        }
        return this.collections.pauseReminders(id, days, body?.scope ?? 'plan', body?.note);
    }
    async recordPayment(id, body = {}, req) {
        const dd = await this.demandDrafts.findOne(id);
        if (dd.status === demand_draft_entity_1.DemandDraftStatus.PAID) {
            throw new common_1.BadRequestException('This DD is already marked paid');
        }
        const amount = Number.isFinite(Number(body.amount)) && Number(body.amount) > 0
            ? Number(body.amount)
            : Number(dd.amount) || 0;
        if (amount <= 0) {
            throw new common_1.BadRequestException('Cannot record a zero-amount payment. Pass an explicit amount.');
        }
        const userId = req.user?.id ?? null;
        const paymentDate = body.paymentDate ? new Date(body.paymentDate) : new Date();
        if (Number.isNaN(paymentDate.getTime())) {
            throw new common_1.BadRequestException('Invalid paymentDate');
        }
        if (!dd.bookingId) {
            throw new common_1.BadRequestException('DD is not linked to a booking. Record the payment from the payments module instead.');
        }
        const payment = await this.payments.create({
            bookingId: dd.bookingId,
            customerId: dd.customerId ?? undefined,
            paymentType: 'INSTALLMENT',
            paymentMethod: body.paymentMethod || 'OTHER',
            amount,
            paymentDate,
            transactionReference: body.transactionReference,
            chequeNumber: body.chequeNumber,
            bankName: body.bankName,
            notes: [
                body.notes,
                `Recorded from Collections for DD ${dd.title ?? dd.id}`,
            ]
                .filter(Boolean)
                .join(' | '),
        }, userId ?? 'SYSTEM');
        const { payment: verified, journalEntryId, journalEntrySkipReason } = await this.payments.verifyWithReport(payment.id, userId ?? 'SYSTEM');
        return {
            ok: true,
            paymentId: verified.id,
            paymentCode: verified.paymentCode,
            amount: Number(verified.amount) || 0,
            status: verified.status,
            demandDraftId: dd.id,
            journalEntryId,
            journalEntrySkipReason,
        };
    }
    async contact(id, body, req) {
        if (!body?.channel || !body?.note) {
            throw new common_1.BadRequestException('channel and note are required');
        }
        const userId = req.user?.id ?? null;
        await this.collections.recordContact(id, { ...body, by: userId });
        return { ok: true };
    }
    async sendWarning(id, req) {
        const userId = req.user?.id;
        const dd = await this.demandDrafts.findOne(id);
        if (dd.tone !== demand_draft_entity_1.DemandDraftTone.CANCELLATION_WARNING) {
            throw new common_1.BadRequestException('This endpoint is only valid for CANCELLATION_WARNING DDs');
        }
        if (dd.status !== demand_draft_entity_1.DemandDraftStatus.DRAFT) {
            throw new common_1.BadRequestException('Warning is already in a non-DRAFT state');
        }
        await this.autoDemandDrafts.approveDemandDraft(id, userId);
        return this.autoDemandDrafts.sendDemandDraft(id, userId);
    }
    async scanNow() {
        return this.scanner.runScan();
    }
    async bulkPause(body) {
        const ids = Array.isArray(body?.ids) ? body.ids.filter(Boolean) : [];
        if (!ids.length)
            throw new common_1.BadRequestException('ids[] is required');
        if (ids.length > 500) {
            throw new common_1.BadRequestException('max 500 rows per bulk pause');
        }
        const days = Number(body?.days) || 14;
        if (days < 1 || days > 365) {
            throw new common_1.BadRequestException('days must be between 1 and 365');
        }
        return this.collections.bulkPause(ids, days, body?.scope ?? 'plan', body?.note);
    }
    async pauseCustomer(customerId, body) {
        const days = Number(body?.days) || 14;
        if (days < 1 || days > 365) {
            throw new common_1.BadRequestException('days must be between 1 and 365');
        }
        return this.collections.pauseCustomer(customerId, days, body?.note);
    }
    async bulkAssign(body, req) {
        const ids = Array.isArray(body?.ids) ? body.ids.filter(Boolean) : [];
        if (!ids.length)
            throw new common_1.BadRequestException('ids[] is required');
        if (ids.length > 500) {
            throw new common_1.BadRequestException('max 500 rows per bulk assign');
        }
        const assigneeId = body?.assigneeId && String(body.assigneeId).trim()
            ? String(body.assigneeId)
            : null;
        const assignedBy = req.user?.id ?? null;
        return this.collections.assignRows(ids, assigneeId, assignedBy);
    }
    async bulkContact(body, req) {
        const ids = Array.isArray(body?.ids) ? body.ids.filter(Boolean) : [];
        if (!ids.length)
            throw new common_1.BadRequestException('ids[] is required');
        if (ids.length > 500) {
            throw new common_1.BadRequestException('max 500 rows per bulk contact');
        }
        if (!body?.channel || !body?.note) {
            throw new common_1.BadRequestException('channel and note are required');
        }
        const userId = req.user?.id ?? null;
        return this.collections.bulkRecordContact(ids, {
            channel: body.channel,
            note: body.note,
            by: userId,
        });
    }
    async bulkSend(body, req) {
        const ids = Array.isArray(body?.ids) ? body.ids.filter(Boolean) : [];
        if (!ids.length)
            throw new common_1.BadRequestException('ids[] is required');
        if (ids.length > 200) {
            throw new common_1.BadRequestException('max 200 rows per bulk send');
        }
        const userId = req.user?.id;
        const sent = [];
        const skipped = [];
        const failed = [];
        for (const id of ids) {
            try {
                const dd = await this.demandDrafts.findOne(id);
                if (dd.tone === demand_draft_entity_1.DemandDraftTone.CANCELLATION_WARNING) {
                    skipped.push({ id, reason: 'Warnings must be sent individually' });
                    continue;
                }
                if (dd.status === demand_draft_entity_1.DemandDraftStatus.SENT) {
                    skipped.push({ id, reason: 'Already sent' });
                    continue;
                }
                if (dd.status !== demand_draft_entity_1.DemandDraftStatus.READY &&
                    dd.status !== demand_draft_entity_1.DemandDraftStatus.DRAFT) {
                    skipped.push({ id, reason: `Not sendable from ${dd.status}` });
                    continue;
                }
                if (dd.status === demand_draft_entity_1.DemandDraftStatus.DRAFT) {
                    await this.autoDemandDrafts.approveDemandDraft(id, userId);
                }
                await this.autoDemandDrafts.sendDemandDraft(id, userId);
                sent.push(id);
            }
            catch (err) {
                failed.push({ id, reason: err?.message || 'Send failed' });
            }
        }
        return { sent, skipped, failed };
    }
};
exports.CollectionsController = CollectionsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CollectionsController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('stats'),
    __param(0, (0, common_1.Query)('propertyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CollectionsController.prototype, "stats", null);
__decorate([
    (0, common_1.Get)('assignees'),
    __param(0, (0, common_1.Query)('propertyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CollectionsController.prototype, "assignees", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CollectionsController.prototype, "detail", null);
__decorate([
    (0, common_1.Post)(':id/pause'),
    (0, roles_decorator_1.Roles)('admin', 'super_admin', 'finance'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CollectionsController.prototype, "pause", null);
__decorate([
    (0, common_1.Post)(':id/record-payment'),
    (0, roles_decorator_1.Roles)('admin', 'super_admin', 'finance'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], CollectionsController.prototype, "recordPayment", null);
__decorate([
    (0, common_1.Post)(':id/contact'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], CollectionsController.prototype, "contact", null);
__decorate([
    (0, common_1.Post)(':id/send-warning'),
    (0, roles_decorator_1.Roles)('admin', 'super_admin'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CollectionsController.prototype, "sendWarning", null);
__decorate([
    (0, common_1.Post)('scan-now'),
    (0, roles_decorator_1.Roles)('admin', 'super_admin'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CollectionsController.prototype, "scanNow", null);
__decorate([
    (0, common_1.Post)('bulk/pause'),
    (0, roles_decorator_1.Roles)('admin', 'super_admin', 'finance'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CollectionsController.prototype, "bulkPause", null);
__decorate([
    (0, common_1.Post)('customer/:customerId/pause'),
    (0, roles_decorator_1.Roles)('admin', 'super_admin', 'finance'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('customerId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CollectionsController.prototype, "pauseCustomer", null);
__decorate([
    (0, common_1.Post)('bulk/assign'),
    (0, roles_decorator_1.Roles)('admin', 'super_admin', 'finance'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CollectionsController.prototype, "bulkAssign", null);
__decorate([
    (0, common_1.Post)('bulk/contact'),
    (0, roles_decorator_1.Roles)('admin', 'super_admin', 'finance'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CollectionsController.prototype, "bulkContact", null);
__decorate([
    (0, common_1.Post)('bulk/send'),
    (0, roles_decorator_1.Roles)('admin', 'super_admin'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CollectionsController.prototype, "bulkSend", null);
exports.CollectionsController = CollectionsController = __decorate([
    (0, common_1.Controller)('collections'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [collections_service_1.CollectionsService,
        overdue_scanner_service_1.OverdueScannerService,
        demand_drafts_service_1.DemandDraftsService,
        auto_demand_draft_service_1.AutoDemandDraftService,
        payments_service_1.PaymentsService])
], CollectionsController);
//# sourceMappingURL=collections.controller.js.map