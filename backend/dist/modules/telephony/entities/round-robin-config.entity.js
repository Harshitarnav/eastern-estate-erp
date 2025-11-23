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
exports.RoundRobinConfig = void 0;
const typeorm_1 = require("typeorm");
const property_entity_1 = require("../../properties/entities/property.entity");
let RoundRobinConfig = class RoundRobinConfig {
};
exports.RoundRobinConfig = RoundRobinConfig;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], RoundRobinConfig.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'property_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], RoundRobinConfig.prototype, "propertyId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => property_entity_1.Property, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'property_id' }),
    __metadata("design:type", property_entity_1.Property)
], RoundRobinConfig.prototype, "property", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'name' }),
    __metadata("design:type", String)
], RoundRobinConfig.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'department' }),
    __metadata("design:type", String)
], RoundRobinConfig.prototype, "department", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'algorithm', default: 'ROUND_ROBIN' }),
    __metadata("design:type", String)
], RoundRobinConfig.prototype, "algorithm", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'max_queue_size', default: 100 }),
    __metadata("design:type", Number)
], RoundRobinConfig.prototype, "maxQueueSize", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'max_wait_time', default: 300 }),
    __metadata("design:type", Number)
], RoundRobinConfig.prototype, "maxWaitTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'max_ring_time', default: 30 }),
    __metadata("design:type", Number)
], RoundRobinConfig.prototype, "maxRingTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'overflow_action', default: 'VOICEMAIL' }),
    __metadata("design:type", String)
], RoundRobinConfig.prototype, "overflowAction", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'overflow_number', nullable: true }),
    __metadata("design:type", String)
], RoundRobinConfig.prototype, "overflowNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'overflow_message', type: 'text', nullable: true }),
    __metadata("design:type", String)
], RoundRobinConfig.prototype, "overflowMessage", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'business_hours', type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], RoundRobinConfig.prototype, "businessHours", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'timezone', default: 'Asia/Kolkata' }),
    __metadata("design:type", String)
], RoundRobinConfig.prototype, "timezone", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'priority_rules', type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], RoundRobinConfig.prototype, "priorityRules", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'active', default: true }),
    __metadata("design:type", Boolean)
], RoundRobinConfig.prototype, "active", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], RoundRobinConfig.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], RoundRobinConfig.prototype, "updatedAt", void 0);
exports.RoundRobinConfig = RoundRobinConfig = __decorate([
    (0, typeorm_1.Entity)('round_robin_config', { schema: 'telephony' })
], RoundRobinConfig);
//# sourceMappingURL=round-robin-config.entity.js.map