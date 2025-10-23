import { ChatGroupType } from '../entities/chat-group.entity';
export declare class CreateChatGroupDto {
    name: string;
    description?: string;
    groupType?: ChatGroupType;
    avatarUrl?: string;
    participantIds: string[];
}
