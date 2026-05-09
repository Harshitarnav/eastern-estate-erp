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
exports.EmployeeLeaveDay = exports.EmployeeLeaveKind = void 0;
const typeorm_1 = require("typeorm");
const employee_entity_1 = require("./employee.entity");
var EmployeeLeaveKind;
(function (EmployeeLeaveKind) {
    EmployeeLeaveKind["PAID"] = "PAID";
    EmployeeLeaveKind["UNPAID"] = "UNPAID";
    EmployeeLeaveKind["ABSENT"] = "ABSENT";
})(EmployeeLeaveKind || (exports.EmployeeLeaveKind = EmployeeLeaveKind = {}));
let EmployeeLeaveDay = class EmployeeLeaveDay {
};
exports.EmployeeLeaveDay = EmployeeLeaveDay;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], EmployeeLeaveDay.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'employee_id', type: 'uuid' }),
    __metadata("design:type", String)
], EmployeeLeaveDay.prototype, "employeeId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => employee_entity_1.Employee),
    (0, typeorm_1.JoinColumn)({ name: 'employee_id' }),
    __metadata("design:type", employee_entity_1.Employee)
], EmployeeLeaveDay.prototype, "employee", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'leave_date', type: 'date' }),
    __metadata("design:type", Date)
], EmployeeLeaveDay.prototype, "leaveDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'day_fraction', type: 'decimal', precision: 3, scale: 2, default: 1 }),
    __metadata("design:type", Number)
], EmployeeLeaveDay.prototype, "dayFraction", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'leave_kind', type: 'varchar', length: 20 }),
    __metadata("design:type", String)
], EmployeeLeaveDay.prototype, "leaveKind", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], EmployeeLeaveDay.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], EmployeeLeaveDay.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], EmployeeLeaveDay.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], EmployeeLeaveDay.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], EmployeeLeaveDay.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'updated_by', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], EmployeeLeaveDay.prototype, "updatedBy", void 0);
exports.EmployeeLeaveDay = EmployeeLeaveDay = __decorate([
    (0, typeorm_1.Entity)('employee_leave_days'),
    (0, typeorm_1.Index)(['employeeId']),
    (0, typeorm_1.Index)(['leaveDate'])
], EmployeeLeaveDay);
//# sourceMappingURL=employee-leave-day.entity.js.map