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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DemandDraft = exports.DemandDraftStatus = void 0;
const typeorm_1 = require("typeorm");
var DemandDraftStatus;
(function (DemandDraftStatus) {
    DemandDraftStatus["DRAFT"] = "DRAFT";
    DemandDraftStatus["READY"] = "READY";
    DemandDraftStatus["SENT"] = "SENT";
    DemandDraftStatus["FAILED"] = "FAILED";
})(DemandDraftStatus || (exports.DemandDraftStatus = DemandDraftStatus = {}));
let DemandDraft = class DemandDraft {
};
exports.DemandDraft = DemandDraft;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], DemandDraft.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'flat_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], DemandDraft.prototype, "flatId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'customer_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], DemandDraft.prototype, "customerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'booking_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], DemandDraft.prototype, "bookingId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'milestone_id', type: 'varchar', length: 200, nullable: true }),
    __metadata("design:type", String)
], DemandDraft.prototype, "milestoneId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], DemandDraft.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, default: DemandDraftStatus.DRAFT }),
    __metadata("design:type", String)
], DemandDraft.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'file_url', type: 'text', nullable: true }),
    __metadata("design:type", String)
], DemandDraft.prototype, "fileUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], DemandDraft.prototype, "content", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], DemandDraft.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'generated_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], DemandDraft.prototype, "generatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sent_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], DemandDraft.prototype, "sentAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], DemandDraft.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'updated_by', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], DemandDraft.prototype, "updatedBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], DemandDraft.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], DemandDraft.prototype, "updatedAt", void 0);
exports.DemandDraft = DemandDraft = __decorate([
    (0, typeorm_1.Entity)('demand_drafts'),
    (0, typeorm_1.Index)(['flatId']),
    (0, typeorm_1.Index)(['customerId']),
    (0, typeorm_1.Index)(['bookingId'])
], DemandDraft);
//# sourceMappingURL=demand-draft.entity.js.map