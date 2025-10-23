import { IsString, IsNotEmpty, IsOptional, IsArray, IsUUID } from 'class-validator';

export class SendMessageDto {
  @IsUUID()
  @IsNotEmpty()
  chatGroupId: string;

  @IsString()
  @IsNotEmpty()
  messageText: string;

  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  mentionedEmployeeIds?: string[];

  @IsUUID()
  @IsOptional()
  replyToMessageId?: string;
}
