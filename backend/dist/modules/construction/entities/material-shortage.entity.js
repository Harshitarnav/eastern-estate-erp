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
exports.MaterialShortage = exports.MaterialShortagePriority = exports.MaterialShortageStatus = void 0;
const typeorm_1 = require("typeorm");
const construction_project_entity_1 = require("./construction-project.entity");
const material_entity_1 = require("../../materials/entities/material.entity");
var MaterialShortageStatus;
(function (MaterialShortageStatus) {
    MaterialShortageStatus["PENDING"] = "PENDING";
    MaterialShortageStatus["PO_RAISED"] = "PO_RAISED";
    MaterialShortageStatus["IN_TRANSIT"] = "IN_TRANSIT";
    MaterialShortageStatus["DELIVERED"] = "DELIVERED";
    MaterialShortageStatus["RESOLVED"] = "RESOLVED";
})(MaterialShortageStatus || (exports.MaterialShortageStatus = MaterialShortageStatus = {}));
var MaterialShortagePriority;
(function (MaterialShortagePriority) {
    MaterialShortagePriority["LOW"] = "LOW";
    MaterialShortagePriority["MEDIUM"] = "MEDIUM";
    MaterialShortagePriority["HIGH"] = "HIGH";
    MaterialShortagePriority["URGENT"] = "URGENT";
})(MaterialShortagePriority || (exports.MaterialShortagePriority = MaterialShortagePriority = {}));
let MaterialShortage = class MaterialShortage {
    get isResolved() {
        return [MaterialShortageStatus.DELIVERED, MaterialShortageStatus.RESOLVED].includes(this.status);
    }
    get isOverdue() {
        if (this.isResolved)
            return false;
        return new Date() > new Date(this.requiredByDate);
    }
    get isUrgent() {
        return this.priority === MaterialShortagePriority.URGENT;
    }
    get shortagePercentage() {
        if (Number(this.quantityRequired) === 0)
            return 0;
        return (Number(this.shortageQuantity) / Number(this.quantityRequired)) * 100;
    }
    get daysUntilRequired() {
        const now = new Date();
        const required = new Date(this.requiredByDate);
        const diffTime = required.getTime() - now.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    get hasPOBeenRaised() {
        return [
            MaterialShortageStatus.PO_RAISED,
            MaterialShortageStatus.IN_TRANSIT,
            MaterialShortageStatus.DELIVERED,
            MaterialShortageStatus.RESOLVED,
        ].includes(this.status);
    }
};
exports.MaterialShortage = MaterialShortage;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], MaterialShortage.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'construction_project_id', type: 'uuid' }),
    __metadata("design:type", String)
], MaterialShortage.prototype, "constructionProjectId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => construction_project_entity_1.ConstructionProject, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'construction_project_id' }),
    __metadata("design:type", construction_project_entity_1.ConstructionProject)
], MaterialShortage.prototype, "constructionProject", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'material_id', type: 'uuid' }),
    __metadata("design:type", String)
], MaterialShortage.prototype, "materialId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => material_entity_1.Material),
    (0, typeorm_1.JoinColumn)({ name: 'material_id' }),
    __metadata("design:type", material_entity_1.Material)
], MaterialShortage.prototype, "material", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'quantity_required', type: 'decimal', precision: 15, scale: 3 }),
    __metadata("design:type", Number)
], MaterialShortage.prototype, "quantityRequired", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'quantity_available', type: 'decimal', precision: 15, scale: 3, default: 0 }),
    __metadata("design:type", Number)
], MaterialShortage.prototype, "quantityAvailable", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'shortage_quantity', type: 'decimal', precision: 15, scale: 3 }),
    __metadata("design:type", Number)
], MaterialShortage.prototype, "shortageQuantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'required_by_date', type: 'date' }),
    __metadata("design:type", Date)
], MaterialShortage.prototype, "requiredByDate", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: MaterialShortageStatus,
        default: MaterialShortageStatus.PENDING,
    }),
    __metadata("design:type", String)
], MaterialShortage.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: MaterialShortagePriority,
    }),
    __metadata("design:type", String)
], MaterialShortage.prototype, "priority", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'impact_on_schedule', type: 'text', nullable: true }),
    __metadata("design:type", String)
], MaterialShortage.prototype, "impactOnSchedule", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], MaterialShortage.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], MaterialShortage.prototype, "updatedAt", void 0);
exports.MaterialShortage = MaterialShortage = __decorate([
    (0, typeorm_1.Entity)('material_shortages')
], MaterialShortage);
//# sourceMappingURL=material-shortage.entity.js.map