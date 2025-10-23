import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatGroup } from './entities/chat-group.entity';
import { ChatParticipant } from './entities/chat-participant.entity';
import { ChatMessage } from './entities/chat-message.entity';
import { ChatAttachment } from './entities/chat-attachment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ChatGroup,
      ChatParticipant,
      ChatMessage,
      ChatAttachment,
    ]),
  ],
  controllers: [ChatController],
  providers: [ChatService],
  exports: [ChatService],
})
export class ChatModule {}
