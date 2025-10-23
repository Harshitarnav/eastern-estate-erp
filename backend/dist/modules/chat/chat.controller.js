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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const chat_service_1 = require("./chat.service");
const create_chat_group_dto_1 = require("./dto/create-chat-group.dto");
const send_message_dto_1 = require("./dto/send-message.dto");
const add_participants_dto_1 = require("./dto/add-participants.dto");
let ChatController = class ChatController {
    constructor(chatService) {
        this.chatService = chatService;
    }
    async getMyGroups(req) {
        const employeeId = req.user?.employeeId || req.user?.id;
        if (!employeeId) {
            return [];
        }
        return this.chatService.getMyGroups(employeeId);
    }
    async createGroup(req, createGroupDto) {
        const employeeId = req.user?.employeeId || req.user?.id;
        if (!employeeId) {
            throw new common_1.BadRequestException('User not authenticated or employee ID missing');
        }
        return this.chatService.createGroup(employeeId, createGroupDto);
    }
    async getGroup(req, groupId) {
        const employeeId = req.user?.employeeId || req.user?.id;
        if (!employeeId) {
            throw new common_1.BadRequestException('User not authenticated');
        }
        return this.chatService.getGroupById(groupId, employeeId);
    }
    async getGroupParticipants(groupId) {
        return this.chatService.getGroupParticipants(groupId);
    }
    async addParticipants(req, groupId, addParticipantsDto) {
        const employeeId = req.user?.employeeId || req.user?.id;
        if (!employeeId) {
            throw new common_1.BadRequestException('User not authenticated');
        }
        return this.chatService.addParticipants(groupId, employeeId, addParticipantsDto);
    }
    async removeParticipant(req, groupId, participantId) {
        const employeeId = req.user?.employeeId || req.user?.id;
        if (!employeeId) {
            throw new common_1.BadRequestException('User not authenticated');
        }
        return this.chatService.removeParticipant(groupId, employeeId, participantId);
    }
    async createDirectMessage(req, otherEmployeeId) {
        const employeeId = req.user?.employeeId || req.user?.id;
        if (!employeeId) {
            throw new common_1.BadRequestException('User not authenticated or employee ID missing');
        }
        return this.chatService.createOrGetDirectMessage(employeeId, otherEmployeeId);
    }
    async sendMessage(req, sendMessageDto) {
        const employeeId = req.user?.employeeId || req.user?.id;
        if (!employeeId) {
            throw new common_1.BadRequestException('User not authenticated');
        }
        return this.chatService.sendMessage(employeeId, sendMessageDto);
    }
    async getMessages(req, groupId, limit, before) {
        const employeeId = req.user?.employeeId || req.user?.id;
        if (!employeeId) {
            throw new common_1.BadRequestException('User not authenticated');
        }
        const messageLimit = limit ? parseInt(limit, 10) : 50;
        return this.chatService.getMessages(groupId, employeeId, messageLimit, before);
    }
    async markAsRead(req, groupId) {
        const employeeId = req.user?.employeeId || req.user?.id;
        if (!employeeId) {
            throw new common_1.BadRequestException('User not authenticated');
        }
        return this.chatService.markAsRead(groupId, employeeId);
    }
    async getUnreadCount(req, groupId) {
        const employeeId = req.user?.employeeId || req.user?.id;
        if (!employeeId) {
            return { count: 0 };
        }
        const count = await this.chatService.getUnreadCount(groupId, employeeId);
        return { count };
    }
    async getTotalUnreadCount(req) {
        const employeeId = req.user?.employeeId || req.user?.id;
        if (!employeeId) {
            return { count: 0 };
        }
        const count = await this.chatService.getTotalUnreadCount(employeeId);
        return { count };
    }
    async editMessage(req, messageId, messageText) {
        const employeeId = req.user?.employeeId || req.user?.id;
        if (!employeeId) {
            throw new common_1.BadRequestException('User not authenticated');
        }
        return this.chatService.editMessage(messageId, employeeId, messageText);
    }
    async deleteMessage(req, messageId) {
        const employeeId = req.user?.employeeId || req.user?.id;
        if (!employeeId) {
            throw new common_1.BadRequestException('User not authenticated');
        }
        return this.chatService.deleteMessage(messageId, employeeId);
    }
    async searchEmployees(req, query) {
        const employeeId = req.user?.employeeId || req.user?.id;
        if (!employeeId) {
            return [];
        }
        return this.chatService.searchEmployees(employeeId, query);
    }
};
exports.ChatController = ChatController;
__decorate([
    (0, common_1.Get)('groups'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getMyGroups", null);
__decorate([
    (0, common_1.Post)('groups'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_chat_group_dto_1.CreateChatGroupDto]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "createGroup", null);
__decorate([
    (0, common_1.Get)('groups/:groupId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('groupId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getGroup", null);
__decorate([
    (0, common_1.Get)('groups/:groupId/participants'),
    __param(0, (0, common_1.Param)('groupId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getGroupParticipants", null);
__decorate([
    (0, common_1.Post)('groups/:groupId/participants'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('groupId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, add_participants_dto_1.AddParticipantsDto]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "addParticipants", null);
__decorate([
    (0, common_1.Delete)('groups/:groupId/participants/:participantId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('groupId')),
    __param(2, (0, common_1.Param)('participantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "removeParticipant", null);
__decorate([
    (0, common_1.Post)('direct'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)('employeeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "createDirectMessage", null);
__decorate([
    (0, common_1.Post)('messages'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, send_message_dto_1.SendMessageDto]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "sendMessage", null);
__decorate([
    (0, common_1.Get)('groups/:groupId/messages'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('groupId')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('before')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getMessages", null);
__decorate([
    (0, common_1.Put)('groups/:groupId/read'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('groupId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "markAsRead", null);
__decorate([
    (0, common_1.Get)('groups/:groupId/unread-count'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('groupId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getUnreadCount", null);
__decorate([
    (0, common_1.Get)('unread-count'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getTotalUnreadCount", null);
__decorate([
    (0, common_1.Put)('messages/:messageId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('messageId')),
    __param(2, (0, common_1.Body)('messageText')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "editMessage", null);
__decorate([
    (0, common_1.Delete)('messages/:messageId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('messageId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "deleteMessage", null);
__decorate([
    (0, common_1.Get)('search/employees'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('q')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "searchEmployees", null);
exports.ChatController = ChatController = __decorate([
    (0, common_1.Controller)('chat'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [chat_service_1.ChatService])
], ChatController);
//# sourceMappingURL=chat.controller.js.map