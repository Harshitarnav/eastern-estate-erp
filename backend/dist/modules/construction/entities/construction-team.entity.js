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
exports.ConstructionTeam = exports.TeamType = void 0;
const typeorm_1 = require("typeorm");
const property_entity_1 = require("../../properties/entities/property.entity");
var TeamType;
(function (TeamType) {
    TeamType["CONTRACTOR"] = "CONTRACTOR";
    TeamType["IN_HOUSE"] = "IN_HOUSE";
    TeamType["LABOR"] = "LABOR";
})(TeamType || (exports.TeamType = TeamType = {}));
let ConstructionTeam = class ConstructionTeam {
};
exports.ConstructionTeam = ConstructionTeam;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ConstructionTeam.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'team_name', type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], ConstructionTeam.prototype, "teamName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'team_code', type: 'varchar', length: 50, unique: true, nullable: true }),
    __metadata("design:type", String)
], ConstructionTeam.prototype, "teamCode", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'team_type',
        type: 'enum',
        enum: TeamType,
    }),
    __metadata("design:type", String)
], ConstructionTeam.prototype, "teamType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'property_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], ConstructionTeam.prototype, "propertyId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => property_entity_1.Property, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'property_id' }),
    __metadata("design:type", property_entity_1.Property)
], ConstructionTeam.prototype, "property", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'construction_project_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], ConstructionTeam.prototype, "constructionProjectId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'leader_name', type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], ConstructionTeam.prototype, "leaderName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'contact_number', type: 'varchar', length: 20 }),
    __metadata("design:type", String)
], ConstructionTeam.prototype, "contactNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'email', type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], ConstructionTeam.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_members', type: 'integer', default: 0 }),
    __metadata("design:type", Number)
], ConstructionTeam.prototype, "totalMembers", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'active_members', type: 'integer', default: 0 }),
    __metadata("design:type", Number)
], ConstructionTeam.prototype, "activeMembers", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'specialization', type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], ConstructionTeam.prototype, "specialization", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'skills', type: 'text', array: true, nullable: true }),
    __metadata("design:type", Array)
], ConstructionTeam.prototype, "skills", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'contract_start_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], ConstructionTeam.prototype, "contractStartDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'contract_end_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], ConstructionTeam.prototype, "contractEndDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'daily_rate', type: 'decimal', precision: 10, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], ConstructionTeam.prototype, "dailyRate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], ConstructionTeam.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], ConstructionTeam.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], ConstructionTeam.prototype, "updatedAt", void 0);
exports.ConstructionTeam = ConstructionTeam = __decorate([
    (0, typeorm_1.Entity)('construction_teams')
], ConstructionTeam);
//# sourceMappingURL=construction-team.entity.js.map