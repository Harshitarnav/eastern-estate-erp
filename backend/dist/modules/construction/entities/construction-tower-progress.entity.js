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
exports.ConstructionTowerProgress = exports.PhaseStatus = exports.ConstructionPhase = void 0;
const typeorm_1 = require("typeorm");
const construction_project_entity_1 = require("./construction-project.entity");
const tower_entity_1 = require("../../towers/entities/tower.entity");
var ConstructionPhase;
(function (ConstructionPhase) {
    ConstructionPhase["FOUNDATION"] = "FOUNDATION";
    ConstructionPhase["STRUCTURE"] = "STRUCTURE";
    ConstructionPhase["MEP"] = "MEP";
    ConstructionPhase["FINISHING"] = "FINISHING";
    ConstructionPhase["HANDOVER"] = "HANDOVER";
})(ConstructionPhase || (exports.ConstructionPhase = ConstructionPhase = {}));
var PhaseStatus;
(function (PhaseStatus) {
    PhaseStatus["NOT_STARTED"] = "NOT_STARTED";
    PhaseStatus["IN_PROGRESS"] = "IN_PROGRESS";
    PhaseStatus["COMPLETED"] = "COMPLETED";
    PhaseStatus["ON_HOLD"] = "ON_HOLD";
})(PhaseStatus || (exports.PhaseStatus = PhaseStatus = {}));
let ConstructionTowerProgress = class ConstructionTowerProgress {
    get isDelayed() {
        if (!this.expectedEndDate || this.status === PhaseStatus.COMPLETED) {
            return false;
        }
        return new Date() > new Date(this.expectedEndDate);
    }
    get daysRemaining() {
        if (!this.expectedEndDate || this.status === PhaseStatus.COMPLETED) {
            return null;
        }
        const today = new Date();
        const expected = new Date(this.expectedEndDate);
        const diff = Math.ceil((expected.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return diff;
    }
    get isCompleted() {
        return this.status === PhaseStatus.COMPLETED && this.phaseProgress === 100;
    }
};
exports.ConstructionTowerProgress = ConstructionTowerProgress;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ConstructionTowerProgress.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'construction_project_id', type: 'uuid' }),
    __metadata("design:type", String)
], ConstructionTowerProgress.prototype, "constructionProjectId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => construction_project_entity_1.ConstructionProject),
    (0, typeorm_1.JoinColumn)({ name: 'construction_project_id' }),
    __metadata("design:type", construction_project_entity_1.ConstructionProject)
], ConstructionTowerProgress.prototype, "constructionProject", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tower_id', type: 'uuid' }),
    __metadata("design:type", String)
], ConstructionTowerProgress.prototype, "towerId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => tower_entity_1.Tower),
    (0, typeorm_1.JoinColumn)({ name: 'tower_id' }),
    __metadata("design:type", tower_entity_1.Tower)
], ConstructionTowerProgress.prototype, "tower", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 30,
        enum: ConstructionPhase,
    }),
    __metadata("design:type", String)
], ConstructionTowerProgress.prototype, "phase", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'phase_progress',
        type: 'decimal',
        precision: 5,
        scale: 2,
        default: 0,
    }),
    __metadata("design:type", Number)
], ConstructionTowerProgress.prototype, "phaseProgress", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'overall_progress',
        type: 'decimal',
        precision: 5,
        scale: 2,
        default: 0,
    }),
    __metadata("design:type", Number)
], ConstructionTowerProgress.prototype, "overallProgress", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'start_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], ConstructionTowerProgress.prototype, "startDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'expected_end_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], ConstructionTowerProgress.prototype, "expectedEndDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'actual_end_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], ConstructionTowerProgress.prototype, "actualEndDate", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 20,
        enum: PhaseStatus,
        default: PhaseStatus.NOT_STARTED,
    }),
    __metadata("design:type", String)
], ConstructionTowerProgress.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], ConstructionTowerProgress.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], ConstructionTowerProgress.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], ConstructionTowerProgress.prototype, "updatedAt", void 0);
exports.ConstructionTowerProgress = ConstructionTowerProgress = __decorate([
    (0, typeorm_1.Entity)('construction_tower_progress')
], ConstructionTowerProgress);
//# sourceMappingURL=construction-tower-progress.entity.js.map