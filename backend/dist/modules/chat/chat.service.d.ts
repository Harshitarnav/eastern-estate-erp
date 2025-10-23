import { Repository } from 'typeorm';
import { ChatGroup, ChatGroupType } from './entities/chat-group.entity';
import { ChatParticipant, ChatParticipantRole } from './entities/chat-participant.entity';
import { ChatMessage } from './entities/chat-message.entity';
import { ChatAttachment } from './entities/chat-attachment.entity';
import { CreateChatGroupDto } from './dto/create-chat-group.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { AddParticipantsDto } from './dto/add-participants.dto';
import { NotificationsService } from '../notifications/notifications.service';
export declare class ChatService {
    private chatGroupRepository;
    private chatParticipantRepository;
    private chatMessageRepository;
    private chatAttachmentRepository;
    private notificationsService;
    constructor(chatGroupRepository: Repository<ChatGroup>, chatParticipantRepository: Repository<ChatParticipant>, chatMessageRepository: Repository<ChatMessage>, chatAttachmentRepository: Repository<ChatAttachment>, notificationsService: NotificationsService);
    createGroup(employeeId: string, createGroupDto: CreateChatGroupDto): Promise<{
        participants: {
            id: string;
            employeeId: string;
            role: ChatParticipantRole;
            joinedAt: Date;
            lastReadAt: Date;
        }[];
        unreadCount: number;
        myRole: ChatParticipantRole;
        id: string;
        name: string;
        description: string;
        groupType: ChatGroupType;
        avatarUrl: string;
        createdByEmployeeId: string;
        createdBy: import("../employees/entities/employee.entity").Employee;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    createOrGetDirectMessage(employeeId: string, otherEmployeeId: string): Promise<{
        participants: {
            id: string;
            employeeId: string;
            role: ChatParticipantRole;
            joinedAt: Date;
            lastReadAt: Date;
        }[];
        unreadCount: number;
        myRole: ChatParticipantRole;
        id: string;
        name: string;
        description: string;
        groupType: ChatGroupType;
        avatarUrl: string;
        createdByEmployeeId: string;
        createdBy: import("../employees/entities/employee.entity").Employee;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getMyGroups(employeeId: string): Promise<{
        unreadCount: number;
        lastMessage: {
            id: string;
            messageText: string;
            createdAt: Date;
            senderEmployeeId: string;
        };
        participants: {
            id: string;
            employeeId: string;
            role: ChatParticipantRole;
            joinedAt: Date;
            lastReadAt: Date;
        }[];
        myRole: ChatParticipantRole;
        id: string;
        name: string;
        description: string;
        groupType: ChatGroupType;
        avatarUrl: string;
        createdByEmployeeId: string;
        createdBy: import("../employees/entities/employee.entity").Employee;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    getGroupById(groupId: string, employeeId: string): Promise<{
        participants: {
            id: string;
            employeeId: string;
            role: ChatParticipantRole;
            joinedAt: Date;
            lastReadAt: Date;
        }[];
        unreadCount: number;
        myRole: ChatParticipantRole;
        id: string;
        name: string;
        description: string;
        groupType: ChatGroupType;
        avatarUrl: string;
        createdByEmployeeId: string;
        createdBy: import("../employees/entities/employee.entity").Employee;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getGroupParticipants(groupId: string): Promise<{
        id: string;
        employeeId: string;
        role: ChatParticipantRole;
        joinedAt: Date;
        lastReadAt: Date;
    }[]>;
    addParticipants(groupId: string, employeeId: string, addParticipantsDto: AddParticipantsDto): Promise<{
        message: string;
    }>;
    removeParticipant(groupId: string, employeeId: string, participantIdToRemove: string): Promise<{
        message: string;
    }>;
    sendMessage(employeeId: string, sendMessageDto: SendMessageDto): Promise<{
        sender: {
            id: string;
            fullName: string;
            email: string;
        };
        attachments: ChatAttachment[];
        replyTo: {
            id: string;
            messageText: string;
            sender: {
                id: string;
                fullName: string;
            };
        };
        id: string;
        chatGroupId: string;
        chatGroup: ChatGroup;
        senderEmployeeId: string;
        messageText: string;
        replyToMessageId: string;
        replyToMessage: ChatMessage;
        mentionedEmployeeIds: string[];
        isEdited: boolean;
        editedAt: Date;
        isDeleted: boolean;
        deletedAt: Date;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getMessages(groupId: string, employeeId: string, limit?: number, before?: string): Promise<{
        senderEmployeeId: string;
        attachments: ChatAttachment[];
        replyTo: {
            id: string;
            messageText: string;
            senderEmployeeId: string;
        };
        id: string;
        chatGroupId: string;
        chatGroup: ChatGroup;
        messageText: string;
        replyToMessageId: string;
        replyToMessage: ChatMessage;
        mentionedEmployeeIds: string[];
        isEdited: boolean;
        editedAt: Date;
        isDeleted: boolean;
        deletedAt: Date;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    markAsRead(groupId: string, employeeId: string): Promise<{
        message: string;
    }>;
    getUnreadCount(groupId: string, employeeId: string): Promise<number>;
    getTotalUnreadCount(employeeId: string): Promise<number>;
    deleteMessage(messageId: string, employeeId: string): Promise<{
        message: string;
    }>;
    editMessage(messageId: string, employeeId: string, newText: string): Promise<{
        sender: {
            id: string;
            fullName: string;
            email: string;
        };
        attachments: ChatAttachment[];
        replyTo: {
            id: string;
            messageText: string;
            sender: {
                id: string;
                fullName: string;
            };
        };
        id: string;
        chatGroupId: string;
        chatGroup: ChatGroup;
        senderEmployeeId: string;
        messageText: string;
        replyToMessageId: string;
        replyToMessage: ChatMessage;
        mentionedEmployeeIds: string[];
        isEdited: boolean;
        editedAt: Date;
        isDeleted: boolean;
        deletedAt: Date;
        createdAt: Date;
        updatedAt: Date;
    }>;
    private addParticipant;
    private getLastMessage;
    private getMessageById;
    searchEmployees(employeeId: string, query: string): Promise<any[]>;
}
