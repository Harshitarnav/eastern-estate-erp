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
exports.DemandDraftTemplate = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../users/entities/user.entity");
let DemandDraftTemplate = class DemandDraftTemplate {
};
exports.DemandDraftTemplate = DemandDraftTemplate;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], DemandDraftTemplate.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 200 }),
    __metadata("design:type", String)
], DemandDraftTemplate.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], DemandDraftTemplate.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 500 }),
    __metadata("design:type", String)
], DemandDraftTemplate.prototype, "subject", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'html_content', type: 'text' }),
    __metadata("design:type", String)
], DemandDraftTemplate.prototype, "htmlContent", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', default: true }),
    __metadata("design:type", Boolean)
], DemandDraftTemplate.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], DemandDraftTemplate.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], DemandDraftTemplate.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true, name: 'created_by' }),
    __metadata("design:type", String)
], DemandDraftTemplate.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'created_by' }),
    __metadata("design:type", user_entity_1.User)
], DemandDraftTemplate.prototype, "creator", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true, name: 'updated_by' }),
    __metadata("design:type", String)
], DemandDraftTemplate.prototype, "updatedBy", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'updated_by' }),
    __metadata("design:type", user_entity_1.User)
], DemandDraftTemplate.prototype, "updater", void 0);
exports.DemandDraftTemplate = DemandDraftTemplate = __decorate([
    (0, typeorm_1.Entity)('demand_draft_templates'),
    (0, typeorm_1.Index)(['isActive'])
], DemandDraftTemplate);
//# sourceMappingURL=demand-draft-template.entity.js.map