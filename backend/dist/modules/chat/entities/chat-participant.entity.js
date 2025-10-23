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
exports.ChatParticipant = exports.ChatParticipantRole = void 0;
const typeorm_1 = require("typeorm");
const chat_group_entity_1 = require("./chat-group.entity");
var ChatParticipantRole;
(function (ChatParticipantRole) {
    ChatParticipantRole["ADMIN"] = "ADMIN";
    ChatParticipantRole["MEMBER"] = "MEMBER";
})(ChatParticipantRole || (exports.ChatParticipantRole = ChatParticipantRole = {}));
let ChatParticipant = class ChatParticipant {
};
exports.ChatParticipant = ChatParticipant;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ChatParticipant.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', name: 'chat_group_id' }),
    __metadata("design:type", String)
], ChatParticipant.prototype, "chatGroupId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => chat_group_entity_1.ChatGroup),
    (0, typeorm_1.JoinColumn)({ name: 'chat_group_id' }),
    __metadata("design:type", chat_group_entity_1.ChatGroup)
], ChatParticipant.prototype, "chatGroup", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', name: 'employee_id', nullable: true }),
    __metadata("design:type", String)
], ChatParticipant.prototype, "employeeId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ChatParticipantRole,
        default: ChatParticipantRole.MEMBER,
    }),
    __metadata("design:type", String)
], ChatParticipant.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ChatParticipant.prototype, "joinedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], ChatParticipant.prototype, "lastReadAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], ChatParticipant.prototype, "isActive", void 0);
exports.ChatParticipant = ChatParticipant = __decorate([
    (0, typeorm_1.Entity)('chat_participants'),
    (0, typeorm_1.Index)(['chatGroupId']),
    (0, typeorm_1.Index)(['employeeId']),
    (0, typeorm_1.Index)(['isActive']),
    (0, typeorm_1.Index)(['lastReadAt'])
], ChatParticipant);
//# sourceMappingURL=chat-participant.entity.js.map