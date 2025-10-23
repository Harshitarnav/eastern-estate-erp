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
exports.ChatService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const chat_group_entity_1 = require("./entities/chat-group.entity");
const chat_participant_entity_1 = require("./entities/chat-participant.entity");
const chat_message_entity_1 = require("./entities/chat-message.entity");
const chat_attachment_entity_1 = require("./entities/chat-attachment.entity");
let ChatService = class ChatService {
    constructor(chatGroupRepository, chatParticipantRepository, chatMessageRepository, chatAttachmentRepository) {
        this.chatGroupRepository = chatGroupRepository;
        this.chatParticipantRepository = chatParticipantRepository;
        this.chatMessageRepository = chatMessageRepository;
        this.chatAttachmentRepository = chatAttachmentRepository;
    }
    async createGroup(employeeId, createGroupDto) {
        const { participantIds, ...groupData } = createGroupDto;
        const group = this.chatGroupRepository.create({
            ...groupData,
            createdByEmployeeId: null,
        });
        await this.chatGroupRepository.save(group);
        await this.addParticipant(group.id, employeeId, chat_participant_entity_1.ChatParticipantRole.ADMIN);
        for (const participantId of participantIds) {
            if (participantId !== employeeId) {
                await this.addParticipant(group.id, participantId, chat_participant_entity_1.ChatParticipantRole.MEMBER);
            }
        }
        return this.getGroupById(group.id, employeeId);
    }
    async createOrGetDirectMessage(employeeId, otherEmployeeId) {
        const existingConversations = await this.chatGroupRepository
            .createQueryBuilder('group')
            .innerJoin('chat_participants', 'p1', 'p1.chat_group_id = group.id AND p1.employee_id = :employeeId', { employeeId })
            .innerJoin('chat_participants', 'p2', 'p2.chat_group_id = group.id AND p2.employee_id = :otherEmployeeId', { otherEmployeeId })
            .where('group.group_type = :type', { type: chat_group_entity_1.ChatGroupType.DIRECT })
            .andWhere('group.is_active = true')
            .getMany();
        if (existingConversations.length > 0) {
            return this.getGroupById(existingConversations[0].id, employeeId);
        }
        const group = this.chatGroupRepository.create({
            name: `Direct Message`,
            groupType: chat_group_entity_1.ChatGroupType.DIRECT,
            createdByEmployeeId: null,
        });
        await this.chatGroupRepository.save(group);
        await this.addParticipant(group.id, employeeId, chat_participant_entity_1.ChatParticipantRole.MEMBER);
        await this.addParticipant(group.id, otherEmployeeId, chat_participant_entity_1.ChatParticipantRole.MEMBER);
        return this.getGroupById(group.id, employeeId);
    }
    async getMyGroups(employeeId) {
        const participants = await this.chatParticipantRepository.find({
            where: {
                employeeId,
                isActive: true,
            },
            relations: ['chatGroup'],
            order: {
                chatGroup: {
                    updatedAt: 'DESC',
                },
            },
        });
        const groups = await Promise.all(participants.map(async (participant) => {
            const unreadCount = await this.getUnreadCount(participant.chatGroupId, employeeId);
            const lastMessage = await this.getLastMessage(participant.chatGroupId);
            const participantsList = await this.getGroupParticipants(participant.chatGroupId);
            return {
                ...participant.chatGroup,
                unreadCount,
                lastMessage,
                participants: participantsList,
                myRole: participant.role,
            };
        }));
        return groups.filter((g) => g.isActive);
    }
    async getGroupById(groupId, employeeId) {
        const participant = await this.chatParticipantRepository.findOne({
            where: {
                chatGroupId: groupId,
                employeeId,
                isActive: true,
            },
        });
        if (!participant) {
            throw new common_1.ForbiddenException('You are not a member of this group');
        }
        const group = await this.chatGroupRepository.findOne({
            where: { id: groupId },
        });
        if (!group) {
            throw new common_1.NotFoundException('Group not found');
        }
        const participants = await this.getGroupParticipants(groupId);
        const unreadCount = await this.getUnreadCount(groupId, employeeId);
        return {
            ...group,
            participants,
            unreadCount,
            myRole: participant.role,
        };
    }
    async getGroupParticipants(groupId) {
        const participants = await this.chatParticipantRepository.find({
            where: {
                chatGroupId: groupId,
                isActive: true,
            },
        });
        return participants.map((p) => ({
            id: p.id,
            employeeId: p.employeeId,
            role: p.role,
            joinedAt: p.joinedAt,
            lastReadAt: p.lastReadAt,
        }));
    }
    async addParticipants(groupId, employeeId, addParticipantsDto) {
        const requester = await this.chatParticipantRepository.findOne({
            where: {
                chatGroupId: groupId,
                employeeId,
                isActive: true,
            },
        });
        if (!requester || requester.role !== chat_participant_entity_1.ChatParticipantRole.ADMIN) {
            throw new common_1.ForbiddenException('Only admins can add participants');
        }
        for (const participantId of addParticipantsDto.employeeIds) {
            await this.addParticipant(groupId, participantId, chat_participant_entity_1.ChatParticipantRole.MEMBER);
        }
        return { message: 'Participants added successfully' };
    }
    async removeParticipant(groupId, employeeId, participantIdToRemove) {
        const requester = await this.chatParticipantRepository.findOne({
            where: {
                chatGroupId: groupId,
                employeeId,
                isActive: true,
            },
        });
        if (!requester || requester.role !== chat_participant_entity_1.ChatParticipantRole.ADMIN) {
            throw new common_1.ForbiddenException('Only admins can remove participants');
        }
        const participant = await this.chatParticipantRepository.findOne({
            where: {
                chatGroupId: groupId,
                employeeId: participantIdToRemove,
            },
        });
        if (participant) {
            participant.isActive = false;
            await this.chatParticipantRepository.save(participant);
        }
        return { message: 'Participant removed successfully' };
    }
    async sendMessage(employeeId, sendMessageDto) {
        const { chatGroupId, messageText, mentionedEmployeeIds, replyToMessageId } = sendMessageDto;
        const participant = await this.chatParticipantRepository.findOne({
            where: {
                chatGroupId,
                employeeId,
                isActive: true,
            },
        });
        if (!participant) {
            throw new common_1.ForbiddenException('You are not a member of this group');
        }
        const message = this.chatMessageRepository.create({
            chatGroupId,
            senderEmployeeId: employeeId,
            messageText,
            mentionedEmployeeIds: Array.isArray(mentionedEmployeeIds) ? mentionedEmployeeIds : [],
            replyToMessageId,
        });
        await this.chatMessageRepository.save(message);
        await this.chatGroupRepository.update(chatGroupId, {
            updatedAt: new Date(),
        });
        return this.getMessageById(message.id);
    }
    async getMessages(groupId, employeeId, limit = 50, before) {
        const participant = await this.chatParticipantRepository.findOne({
            where: {
                chatGroupId: groupId,
                employeeId,
                isActive: true,
            },
        });
        if (!participant) {
            throw new common_1.ForbiddenException('You are not a member of this group');
        }
        const queryBuilder = this.chatMessageRepository
            .createQueryBuilder('message')
            .leftJoinAndSelect('message.replyToMessage', 'replyToMessage')
            .where('message.chatGroupId = :groupId', { groupId })
            .andWhere('message.isDeleted = false')
            .orderBy('message.createdAt', 'DESC')
            .take(limit);
        if (before) {
            queryBuilder.andWhere('message.createdAt < :before', { before: new Date(before) });
        }
        const messages = await queryBuilder.getMany();
        const messagesWithAttachments = await Promise.all(messages.map(async (message) => {
            const attachments = await this.chatAttachmentRepository.find({
                where: { messageId: message.id },
            });
            return {
                ...message,
                senderEmployeeId: message.senderEmployeeId,
                attachments,
                replyTo: message.replyToMessage
                    ? {
                        id: message.replyToMessage.id,
                        messageText: message.replyToMessage.messageText,
                        senderEmployeeId: message.replyToMessage.senderEmployeeId,
                    }
                    : null,
            };
        }));
        return messagesWithAttachments.reverse();
    }
    async markAsRead(groupId, employeeId) {
        const participant = await this.chatParticipantRepository.findOne({
            where: {
                chatGroupId: groupId,
                employeeId,
                isActive: true,
            },
        });
        if (!participant) {
            throw new common_1.ForbiddenException('You are not a member of this group');
        }
        participant.lastReadAt = new Date();
        await this.chatParticipantRepository.save(participant);
        return { message: 'Messages marked as read' };
    }
    async getUnreadCount(groupId, employeeId) {
        const participant = await this.chatParticipantRepository.findOne({
            where: {
                chatGroupId: groupId,
                employeeId,
                isActive: true,
            },
        });
        if (!participant) {
            return 0;
        }
        const lastReadAt = participant.lastReadAt || new Date('1970-01-01');
        const count = await this.chatMessageRepository
            .createQueryBuilder('message')
            .where('message.chatGroupId = :groupId', { groupId })
            .andWhere('message.senderEmployeeId != :employeeId', { employeeId })
            .andWhere('message.isDeleted = false')
            .andWhere('message.createdAt > :lastReadAt', { lastReadAt })
            .getCount();
        return count;
    }
    async getTotalUnreadCount(employeeId) {
        const participants = await this.chatParticipantRepository.find({
            where: {
                employeeId,
                isActive: true,
            },
        });
        let totalCount = 0;
        for (const participant of participants) {
            const count = await this.getUnreadCount(participant.chatGroupId, employeeId);
            totalCount += count;
        }
        return totalCount;
    }
    async deleteMessage(messageId, employeeId) {
        const message = await this.chatMessageRepository.findOne({
            where: { id: messageId },
        });
        if (!message) {
            throw new common_1.NotFoundException('Message not found');
        }
        if (message.senderEmployeeId !== employeeId) {
            throw new common_1.ForbiddenException('You can only delete your own messages');
        }
        message.isDeleted = true;
        message.deletedAt = new Date();
        await this.chatMessageRepository.save(message);
        return { message: 'Message deleted successfully' };
    }
    async editMessage(messageId, employeeId, newText) {
        const message = await this.chatMessageRepository.findOne({
            where: { id: messageId },
        });
        if (!message) {
            throw new common_1.NotFoundException('Message not found');
        }
        if (message.senderEmployeeId !== employeeId) {
            throw new common_1.ForbiddenException('You can only edit your own messages');
        }
        message.messageText = newText;
        message.isEdited = true;
        message.editedAt = new Date();
        await this.chatMessageRepository.save(message);
        return this.getMessageById(messageId);
    }
    async addParticipant(groupId, employeeId, role) {
        const existing = await this.chatParticipantRepository.findOne({
            where: {
                chatGroupId: groupId,
                employeeId,
            },
        });
        if (existing) {
            if (!existing.isActive) {
                existing.isActive = true;
                await this.chatParticipantRepository.save(existing);
            }
            return existing;
        }
        const participant = this.chatParticipantRepository.create({
            chatGroupId: groupId,
            employeeId,
            role,
        });
        return this.chatParticipantRepository.save(participant);
    }
    async getLastMessage(groupId) {
        const message = await this.chatMessageRepository.findOne({
            where: {
                chatGroupId: groupId,
                isDeleted: false,
            },
            order: {
                createdAt: 'DESC',
            },
        });
        if (!message) {
            return null;
        }
        return {
            id: message.id,
            messageText: message.messageText,
            createdAt: message.createdAt,
            senderEmployeeId: message.senderEmployeeId,
        };
    }
    async getMessageById(messageId) {
        const message = await this.chatMessageRepository.findOne({
            where: { id: messageId },
            relations: ['replyToMessage'],
        });
        if (!message) {
            throw new common_1.NotFoundException('Message not found');
        }
        const attachments = await this.chatAttachmentRepository.find({
            where: { messageId: message.id },
        });
        return {
            ...message,
            sender: {
                id: message.senderEmployeeId,
                fullName: 'User',
                email: '',
            },
            attachments,
            replyTo: message.replyToMessage
                ? {
                    id: message.replyToMessage.id,
                    messageText: message.replyToMessage.messageText,
                    sender: {
                        id: message.replyToMessage.senderEmployeeId,
                        fullName: 'User',
                    },
                }
                : null,
        };
    }
    async searchEmployees(employeeId, query) {
        return [];
    }
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(chat_group_entity_1.ChatGroup)),
    __param(1, (0, typeorm_1.InjectRepository)(chat_participant_entity_1.ChatParticipant)),
    __param(2, (0, typeorm_1.InjectRepository)(chat_message_entity_1.ChatMessage)),
    __param(3, (0, typeorm_1.InjectRepository)(chat_attachment_entity_1.ChatAttachment)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ChatService);
//# sourceMappingURL=chat.service.js.map