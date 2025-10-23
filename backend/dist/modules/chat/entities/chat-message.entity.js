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
exports.ChatMessage = void 0;
const typeorm_1 = require("typeorm");
const chat_group_entity_1 = require("./chat-group.entity");
let ChatMessage = class ChatMessage {
};
exports.ChatMessage = ChatMessage;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ChatMessage.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', name: 'chat_group_id' }),
    __metadata("design:type", String)
], ChatMessage.prototype, "chatGroupId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => chat_group_entity_1.ChatGroup),
    (0, typeorm_1.JoinColumn)({ name: 'chat_group_id' }),
    __metadata("design:type", chat_group_entity_1.ChatGroup)
], ChatMessage.prototype, "chatGroup", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', name: 'sender_employee_id', nullable: true }),
    __metadata("design:type", String)
], ChatMessage.prototype, "senderEmployeeId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', name: 'message_text' }),
    __metadata("design:type", String)
], ChatMessage.prototype, "messageText", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', name: 'reply_to_message_id', nullable: true }),
    __metadata("design:type", String)
], ChatMessage.prototype, "replyToMessageId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => ChatMessage, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'reply_to_message_id' }),
    __metadata("design:type", ChatMessage)
], ChatMessage.prototype, "replyToMessage", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', array: true, name: 'mentioned_employee_ids', default: [] }),
    __metadata("design:type", Array)
], ChatMessage.prototype, "mentionedEmployeeIds", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', name: 'is_edited', default: false }),
    __metadata("design:type", Boolean)
], ChatMessage.prototype, "isEdited", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', name: 'edited_at', nullable: true }),
    __metadata("design:type", Date)
], ChatMessage.prototype, "editedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', name: 'is_deleted', default: false }),
    __metadata("design:type", Boolean)
], ChatMessage.prototype, "isDeleted", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', name: 'deleted_at', nullable: true }),
    __metadata("design:type", Date)
], ChatMessage.prototype, "deletedAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ChatMessage.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], ChatMessage.prototype, "updatedAt", void 0);
exports.ChatMessage = ChatMessage = __decorate([
    (0, typeorm_1.Entity)('chat_messages'),
    (0, typeorm_1.Index)(['chatGroupId']),
    (0, typeorm_1.Index)(['senderEmployeeId']),
    (0, typeorm_1.Index)(['createdAt']),
    (0, typeorm_1.Index)(['isDeleted'])
], ChatMessage);
//# sourceMappingURL=chat-message.entity.js.map