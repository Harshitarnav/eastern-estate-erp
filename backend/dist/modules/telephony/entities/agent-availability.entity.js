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
exports.AgentAvailability = void 0;
const typeorm_1 = require("typeorm");
const employee_entity_1 = require("../../employees/entities/employee.entity");
const property_entity_1 = require("../../properties/entities/property.entity");
let AgentAvailability = class AgentAvailability {
};
exports.AgentAvailability = AgentAvailability;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], AgentAvailability.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'employee_id', type: 'uuid' }),
    __metadata("design:type", String)
], AgentAvailability.prototype, "employeeId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => employee_entity_1.Employee),
    (0, typeorm_1.JoinColumn)({ name: 'employee_id' }),
    __metadata("design:type", employee_entity_1.Employee)
], AgentAvailability.prototype, "employee", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'property_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], AgentAvailability.prototype, "propertyId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => property_entity_1.Property, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'property_id' }),
    __metadata("design:type", property_entity_1.Property)
], AgentAvailability.prototype, "property", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_available', default: true }),
    __metadata("design:type", Boolean)
], AgentAvailability.prototype, "isAvailable", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'status', default: 'AVAILABLE' }),
    __metadata("design:type", String)
], AgentAvailability.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'phone_number' }),
    __metadata("design:type", String)
], AgentAvailability.prototype, "phoneNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'alternate_number', nullable: true }),
    __metadata("design:type", String)
], AgentAvailability.prototype, "alternateNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'extension', nullable: true }),
    __metadata("design:type", String)
], AgentAvailability.prototype, "extension", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'exotel_agent_id', nullable: true }),
    __metadata("design:type", String)
], AgentAvailability.prototype, "exotelAgentId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'max_concurrent_calls', default: 2 }),
    __metadata("design:type", Number)
], AgentAvailability.prototype, "maxConcurrentCalls", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'current_calls', default: 0 }),
    __metadata("design:type", Number)
], AgentAvailability.prototype, "currentCalls", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_calls_today', default: 0 }),
    __metadata("design:type", Number)
], AgentAvailability.prototype, "totalCallsToday", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_duration_today', default: 0 }),
    __metadata("design:type", Number)
], AgentAvailability.prototype, "totalDurationToday", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'successful_calls_today', default: 0 }),
    __metadata("design:type", Number)
], AgentAvailability.prototype, "successfulCallsToday", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'missed_calls_today', default: 0 }),
    __metadata("design:type", Number)
], AgentAvailability.prototype, "missedCallsToday", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_call_assigned_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], AgentAvailability.prototype, "lastCallAssignedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_call_completed_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], AgentAvailability.prototype, "lastCallCompletedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'priority_score', default: 100 }),
    __metadata("design:type", Number)
], AgentAvailability.prototype, "priorityScore", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'break_start_time', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], AgentAvailability.prototype, "breakStartTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'break_duration', nullable: true }),
    __metadata("design:type", Number)
], AgentAvailability.prototype, "breakDuration", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'notes', type: 'text', nullable: true }),
    __metadata("design:type", String)
], AgentAvailability.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'settings', type: 'jsonb', default: '{}' }),
    __metadata("design:type", Object)
], AgentAvailability.prototype, "settings", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], AgentAvailability.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], AgentAvailability.prototype, "updatedAt", void 0);
exports.AgentAvailability = AgentAvailability = __decorate([
    (0, typeorm_1.Entity)('agent_availability', { schema: 'telephony' })
], AgentAvailability);
//# sourceMappingURL=agent-availability.entity.js.map