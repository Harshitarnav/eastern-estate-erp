import { ChatGroup } from './chat-group.entity';
export declare enum ChatParticipantRole {
    ADMIN = "ADMIN",
    MEMBER = "MEMBER"
}
export declare class ChatParticipant {
    id: string;
    chatGroupId: string;
    chatGroup: ChatGroup;
    employeeId: string;
    role: ChatParticipantRole;
    joinedAt: Date;
    lastReadAt: Date;
    isActive: boolean;
}
