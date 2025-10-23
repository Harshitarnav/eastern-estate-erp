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
exports.ChatAttachment = void 0;
const typeorm_1 = require("typeorm");
const chat_message_entity_1 = require("./chat-message.entity");
let ChatAttachment = class ChatAttachment {
};
exports.ChatAttachment = ChatAttachment;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ChatAttachment.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', name: 'message_id' }),
    __metadata("design:type", String)
], ChatAttachment.prototype, "messageId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => chat_message_entity_1.ChatMessage),
    (0, typeorm_1.JoinColumn)({ name: 'message_id' }),
    __metadata("design:type", chat_message_entity_1.ChatMessage)
], ChatAttachment.prototype, "message", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 500 }),
    __metadata("design:type", String)
], ChatAttachment.prototype, "fileName", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 1000 }),
    __metadata("design:type", String)
], ChatAttachment.prototype, "filePath", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], ChatAttachment.prototype, "fileType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint' }),
    __metadata("design:type", Number)
], ChatAttachment.prototype, "fileSize", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 200, nullable: true }),
    __metadata("design:type", String)
], ChatAttachment.prototype, "mimeType", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ChatAttachment.prototype, "uploadedAt", void 0);
exports.ChatAttachment = ChatAttachment = __decorate([
    (0, typeorm_1.Entity)('chat_attachments'),
    (0, typeorm_1.Index)(['messageId']),
    (0, typeorm_1.Index)(['uploadedAt'])
], ChatAttachment);
//# sourceMappingURL=chat-attachment.entity.js.map