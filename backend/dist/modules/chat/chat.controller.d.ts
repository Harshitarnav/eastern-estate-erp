import { ChatService } from './chat.service';
import { CreateChatGroupDto } from './dto/create-chat-group.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { AddParticipantsDto } from './dto/add-participants.dto';
export declare class ChatController {
    private readonly chatService;
    constructor(chatService: ChatService);
    getMyGroups(req: any): Promise<{
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
            role: import("./entities/chat-participant.entity").ChatParticipantRole;
            joinedAt: Date;
            lastReadAt: Date;
        }[];
        myRole: import("./entities/chat-participant.entity").ChatParticipantRole;
        id: string;
        name: string;
        description: string;
        groupType: import("./entities/chat-group.entity").ChatGroupType;
        avatarUrl: string;
        createdByEmployeeId: string;
        createdBy: import("../employees/entities/employee.entity").Employee;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    createGroup(req: any, createGroupDto: CreateChatGroupDto): Promise<{
        participants: {
            id: string;
            employeeId: string;
            role: import("./entities/chat-participant.entity").ChatParticipantRole;
            joinedAt: Date;
            lastReadAt: Date;
        }[];
        unreadCount: number;
        myRole: import("./entities/chat-participant.entity").ChatParticipantRole;
        id: string;
        name: string;
        description: string;
        groupType: import("./entities/chat-group.entity").ChatGroupType;
        avatarUrl: string;
        createdByEmployeeId: string;
        createdBy: import("../employees/entities/employee.entity").Employee;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getGroup(req: any, groupId: string): Promise<{
        participants: {
            id: string;
            employeeId: string;
            role: import("./entities/chat-participant.entity").ChatParticipantRole;
            joinedAt: Date;
            lastReadAt: Date;
        }[];
        unreadCount: number;
        myRole: import("./entities/chat-participant.entity").ChatParticipantRole;
        id: string;
        name: string;
        description: string;
        groupType: import("./entities/chat-group.entity").ChatGroupType;
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
        role: import("./entities/chat-participant.entity").ChatParticipantRole;
        joinedAt: Date;
        lastReadAt: Date;
    }[]>;
    addParticipants(req: any, groupId: string, addParticipantsDto: AddParticipantsDto): Promise<{
        message: string;
    }>;
    removeParticipant(req: any, groupId: string, participantId: string): Promise<{
        message: string;
    }>;
    createDirectMessage(req: any, otherEmployeeId: string): Promise<{
        participants: {
            id: string;
            employeeId: string;
            role: import("./entities/chat-participant.entity").ChatParticipantRole;
            joinedAt: Date;
            lastReadAt: Date;
        }[];
        unreadCount: number;
        myRole: import("./entities/chat-participant.entity").ChatParticipantRole;
        id: string;
        name: string;
        description: string;
        groupType: import("./entities/chat-group.entity").ChatGroupType;
        avatarUrl: string;
        createdByEmployeeId: string;
        createdBy: import("../employees/entities/employee.entity").Employee;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    sendMessage(req: any, sendMessageDto: SendMessageDto): Promise<{
        sender: {
            id: string;
            fullName: string;
            email: string;
        };
        attachments: import("./entities/chat-attachment.entity").ChatAttachment[];
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
        chatGroup: import("./entities/chat-group.entity").ChatGroup;
        senderEmployeeId: string;
        messageText: string;
        replyToMessageId: string;
        replyToMessage: import("./entities/chat-message.entity").ChatMessage;
        mentionedEmployeeIds: string[];
        isEdited: boolean;
        editedAt: Date;
        isDeleted: boolean;
        deletedAt: Date;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getMessages(req: any, groupId: string, limit?: string, before?: string): Promise<{
        senderEmployeeId: string;
        attachments: import("./entities/chat-attachment.entity").ChatAttachment[];
        replyTo: {
            id: string;
            messageText: string;
            senderEmployeeId: string;
        };
        id: string;
        chatGroupId: string;
        chatGroup: import("./entities/chat-group.entity").ChatGroup;
        messageText: string;
        replyToMessageId: string;
        replyToMessage: import("./entities/chat-message.entity").ChatMessage;
        mentionedEmployeeIds: string[];
        isEdited: boolean;
        editedAt: Date;
        isDeleted: boolean;
        deletedAt: Date;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    markAsRead(req: any, groupId: string): Promise<{
        message: string;
    }>;
    getUnreadCount(req: any, groupId: string): Promise<{
        count: number;
    }>;
    getTotalUnreadCount(req: any): Promise<{
        count: number;
    }>;
    editMessage(req: any, messageId: string, messageText: string): Promise<{
        sender: {
            id: string;
            fullName: string;
            email: string;
        };
        attachments: import("./entities/chat-attachment.entity").ChatAttachment[];
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
        chatGroup: import("./entities/chat-group.entity").ChatGroup;
        senderEmployeeId: string;
        messageText: string;
        replyToMessageId: string;
        replyToMessage: import("./entities/chat-message.entity").ChatMessage;
        mentionedEmployeeIds: string[];
        isEdited: boolean;
        editedAt: Date;
        isDeleted: boolean;
        deletedAt: Date;
        createdAt: Date;
        updatedAt: Date;
    }>;
    deleteMessage(req: any, messageId: string): Promise<{
        message: string;
    }>;
    searchEmployees(req: any, query: string): Promise<any[]>;
}
