import { IsString, IsNotEmpty, IsOptional, IsEnum, IsArray, IsUUID } from 'class-validator';
import { ChatGroupType } from '../entities/chat-group.entity';

export class CreateChatGroupDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(ChatGroupType)
  @IsOptional()
  groupType?: ChatGroupType;

  @IsString()
  @IsOptional()
  avatarUrl?: string;

  @IsArray()
  @IsUUID('4', { each: true })
  @IsNotEmpty()
  participantIds: string[]; // Array of employee IDs to add as participants
}
