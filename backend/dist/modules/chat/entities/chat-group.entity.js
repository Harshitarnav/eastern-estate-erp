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
exports.ChatGroup = exports.ChatGroupType = void 0;
const typeorm_1 = require("typeorm");
const employee_entity_1 = require("../../employees/entities/employee.entity");
var ChatGroupType;
(function (ChatGroupType) {
    ChatGroupType["GROUP"] = "GROUP";
    ChatGroupType["DIRECT"] = "DIRECT";
})(ChatGroupType || (exports.ChatGroupType = ChatGroupType = {}));
let ChatGroup = class ChatGroup {
};
exports.ChatGroup = ChatGroup;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ChatGroup.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 200 }),
    __metadata("design:type", String)
], ChatGroup.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], ChatGroup.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ChatGroupType,
        default: ChatGroupType.GROUP,
    }),
    __metadata("design:type", String)
], ChatGroup.prototype, "groupType", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 500, nullable: true }),
    __metadata("design:type", String)
], ChatGroup.prototype, "avatarUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', name: 'created_by_employee_id', nullable: true }),
    __metadata("design:type", String)
], ChatGroup.prototype, "createdByEmployeeId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => employee_entity_1.Employee, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'created_by_employee_id' }),
    __metadata("design:type", employee_entity_1.Employee)
], ChatGroup.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], ChatGroup.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ChatGroup.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], ChatGroup.prototype, "updatedAt", void 0);
exports.ChatGroup = ChatGroup = __decorate([
    (0, typeorm_1.Entity)('chat_groups'),
    (0, typeorm_1.Index)(['createdByEmployeeId']),
    (0, typeorm_1.Index)(['groupType']),
    (0, typeorm_1.Index)(['isActive']),
    (0, typeorm_1.Index)(['createdAt'])
], ChatGroup);
//# sourceMappingURL=chat-group.entity.js.map