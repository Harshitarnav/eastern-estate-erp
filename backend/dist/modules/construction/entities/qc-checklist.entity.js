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
exports.QCChecklist = exports.QCResult = exports.QCPhase = void 0;
const typeorm_1 = require("typeorm");
const construction_project_entity_1 = require("./construction-project.entity");
const user_entity_1 = require("../../users/entities/user.entity");
var QCPhase;
(function (QCPhase) {
    QCPhase["FOUNDATION"] = "FOUNDATION";
    QCPhase["STRUCTURE"] = "STRUCTURE";
    QCPhase["MEP"] = "MEP";
    QCPhase["FINISHING"] = "FINISHING";
    QCPhase["HANDOVER"] = "HANDOVER";
})(QCPhase || (exports.QCPhase = QCPhase = {}));
var QCResult;
(function (QCResult) {
    QCResult["PASS"] = "PASS";
    QCResult["FAIL"] = "FAIL";
    QCResult["PARTIAL"] = "PARTIAL";
    QCResult["PENDING"] = "PENDING";
})(QCResult || (exports.QCResult = QCResult = {}));
let QCChecklist = class QCChecklist {
    get passCount() {
        return this.items.filter(i => i.status === 'PASS').length;
    }
    get failCount() {
        return this.items.filter(i => i.status === 'FAIL').length;
    }
    get openDefects() {
        return this.defects.filter(d => d.status === 'OPEN').length;
    }
};
exports.QCChecklist = QCChecklist;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], QCChecklist.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'construction_project_id', type: 'uuid' }),
    __metadata("design:type", String)
], QCChecklist.prototype, "constructionProjectId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => construction_project_entity_1.ConstructionProject),
    (0, typeorm_1.JoinColumn)({ name: 'construction_project_id' }),
    __metadata("design:type", construction_project_entity_1.ConstructionProject)
], QCChecklist.prototype, "constructionProject", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'phase',
        type: 'varchar',
        length: 30,
    }),
    __metadata("design:type", String)
], QCChecklist.prototype, "phase", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'inspection_date', type: 'date' }),
    __metadata("design:type", Date)
], QCChecklist.prototype, "inspectionDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'inspector_name', type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], QCChecklist.prototype, "inspectorName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'location_description', type: 'varchar', length: 500, nullable: true }),
    __metadata("design:type", String)
], QCChecklist.prototype, "locationDescription", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'items', type: 'jsonb', default: '[]' }),
    __metadata("design:type", Array)
], QCChecklist.prototype, "items", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'defects', type: 'jsonb', default: '[]' }),
    __metadata("design:type", Array)
], QCChecklist.prototype, "defects", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'overall_result',
        type: 'varchar',
        length: 20,
        default: QCResult.PENDING,
    }),
    __metadata("design:type", String)
], QCChecklist.prototype, "overallResult", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'notes', type: 'text', nullable: true }),
    __metadata("design:type", String)
], QCChecklist.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'next_inspection_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], QCChecklist.prototype, "nextInspectionDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], QCChecklist.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'created_by' }),
    __metadata("design:type", user_entity_1.User)
], QCChecklist.prototype, "creator", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], QCChecklist.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], QCChecklist.prototype, "updatedAt", void 0);
exports.QCChecklist = QCChecklist = __decorate([
    (0, typeorm_1.Entity)('qc_checklists')
], QCChecklist);
//# sourceMappingURL=qc-checklist.entity.js.map