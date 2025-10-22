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
exports.MaterialExit = void 0;
const typeorm_1 = require("typeorm");
const material_entity_1 = require("./material.entity");
const employee_entity_1 = require("../../employees/entities/employee.entity");
let MaterialExit = class MaterialExit {
    get isReturned() {
        return !!this.returnDate;
    }
    get isOverdueForReturn() {
        if (!this.returnExpected || this.isReturned)
            return false;
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return new Date(this.exitDate) < thirtyDaysAgo;
    }
    get pendingReturnQuantity() {
        if (!this.returnExpected)
            return 0;
        return Number(this.quantity) - (Number(this.returnQuantity) || 0);
    }
};
exports.MaterialExit = MaterialExit;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], MaterialExit.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'material_id', type: 'uuid' }),
    __metadata("design:type", String)
], MaterialExit.prototype, "materialId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => material_entity_1.Material),
    (0, typeorm_1.JoinColumn)({ name: 'material_id' }),
    __metadata("design:type", material_entity_1.Material)
], MaterialExit.prototype, "material", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'construction_project_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], MaterialExit.prototype, "constructionProjectId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 15, scale: 3 }),
    __metadata("design:type", Number)
], MaterialExit.prototype, "quantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], MaterialExit.prototype, "purpose", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'issued_to', type: 'uuid' }),
    __metadata("design:type", String)
], MaterialExit.prototype, "issuedTo", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => employee_entity_1.Employee),
    (0, typeorm_1.JoinColumn)({ name: 'issued_to' }),
    __metadata("design:type", employee_entity_1.Employee)
], MaterialExit.prototype, "issuedToEmployee", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'approved_by', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], MaterialExit.prototype, "approvedBy", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => employee_entity_1.Employee, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'approved_by' }),
    __metadata("design:type", employee_entity_1.Employee)
], MaterialExit.prototype, "approvedByEmployee", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'exit_date', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], MaterialExit.prototype, "exitDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'return_expected', default: false }),
    __metadata("design:type", Boolean)
], MaterialExit.prototype, "returnExpected", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'return_date', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], MaterialExit.prototype, "returnDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'return_quantity', type: 'decimal', precision: 15, scale: 3, nullable: true }),
    __metadata("design:type", Number)
], MaterialExit.prototype, "returnQuantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], MaterialExit.prototype, "remarks", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], MaterialExit.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], MaterialExit.prototype, "updatedAt", void 0);
exports.MaterialExit = MaterialExit = __decorate([
    (0, typeorm_1.Entity)('material_exits')
], MaterialExit);
//# sourceMappingURL=material-exit.entity.js.map