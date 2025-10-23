import { ChatGroup } from './chat-group.entity';
export declare class ChatMessage {
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
}
