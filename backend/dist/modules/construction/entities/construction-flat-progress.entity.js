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
exports.ConstructionFlatProgress = void 0;
const typeorm_1 = require("typeorm");
const construction_project_entity_1 = require("./construction-project.entity");
const flat_entity_1 = require("../../flats/entities/flat.entity");
const construction_tower_progress_entity_1 = require("./construction-tower-progress.entity");
let ConstructionFlatProgress = class ConstructionFlatProgress {
    get isDelayed() {
        if (!this.expectedEndDate || this.status === construction_tower_progress_entity_1.PhaseStatus.COMPLETED) {
            return false;
        }
        return new Date() > new Date(this.expectedEndDate);
    }
    get daysRemaining() {
        if (!this.expectedEndDate || this.status === construction_tower_progress_entity_1.PhaseStatus.COMPLETED) {
            return null;
        }
        const today = new Date();
        const expected = new Date(this.expectedEndDate);
        const diff = Math.ceil((expected.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return diff;
    }
    get isCompleted() {
        return this.status === construction_tower_progress_entity_1.PhaseStatus.COMPLETED && this.phaseProgress === 100;
    }
    get isReadyForHandover() {
        return this.phase === construction_tower_progress_entity_1.ConstructionPhase.HANDOVER && this.phaseProgress === 100;
    }
};
exports.ConstructionFlatProgress = ConstructionFlatProgress;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ConstructionFlatProgress.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'construction_project_id', type: 'uuid' }),
    __metadata("design:type", String)
], ConstructionFlatProgress.prototype, "constructionProjectId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => construction_project_entity_1.ConstructionProject),
    (0, typeorm_1.JoinColumn)({ name: 'construction_project_id' }),
    __metadata("design:type", construction_project_entity_1.ConstructionProject)
], ConstructionFlatProgress.prototype, "constructionProject", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'flat_id', type: 'uuid' }),
    __metadata("design:type", String)
], ConstructionFlatProgress.prototype, "flatId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => flat_entity_1.Flat),
    (0, typeorm_1.JoinColumn)({ name: 'flat_id' }),
    __metadata("design:type", flat_entity_1.Flat)
], ConstructionFlatProgress.prototype, "flat", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 30,
        enum: construction_tower_progress_entity_1.ConstructionPhase,
    }),
    __metadata("design:type", String)
], ConstructionFlatProgress.prototype, "phase", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'phase_progress',
        type: 'decimal',
        precision: 5,
        scale: 2,
        default: 0,
    }),
    __metadata("design:type", Number)
], ConstructionFlatProgress.prototype, "phaseProgress", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'overall_progress',
        type: 'decimal',
        precision: 5,
        scale: 2,
        default: 0,
    }),
    __metadata("design:type", Number)
], ConstructionFlatProgress.prototype, "overallProgress", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'start_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], ConstructionFlatProgress.prototype, "startDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'expected_end_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], ConstructionFlatProgress.prototype, "expectedEndDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'actual_end_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], ConstructionFlatProgress.prototype, "actualEndDate", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 20,
        enum: construction_tower_progress_entity_1.PhaseStatus,
        default: construction_tower_progress_entity_1.PhaseStatus.NOT_STARTED,
    }),
    __metadata("design:type", String)
], ConstructionFlatProgress.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], ConstructionFlatProgress.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], ConstructionFlatProgress.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], ConstructionFlatProgress.prototype, "updatedAt", void 0);
exports.ConstructionFlatProgress = ConstructionFlatProgress = __decorate([
    (0, typeorm_1.Entity)('construction_flat_progress')
], ConstructionFlatProgress);
//# sourceMappingURL=construction-flat-progress.entity.js.map