import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ChatMessage } from './chat-message.entity';

/**
 * Chat Attachment Entity
 * Represents a file/media attachment in a chat message
 */
@Entity('chat_attachments')
@Index(['messageId'])
@Index(['uploadedAt'])
export class ChatAttachment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'message_id' })
  messageId: string;

  @ManyToOne(() => ChatMessage)
  @JoinColumn({ name: 'message_id' })
  message: ChatMessage;

  @Column({ length: 500 })
  fileName: string;

  @Column({ length: 1000 })
  filePath: string;

  @Column({ length: 100 })
  fileType: string;

  @Column({ type: 'bigint' })
  fileSize: number;

  @Column({ length: 200, nullable: true })
  mimeType: string;

  @CreateDateColumn()
  uploadedAt: Date;
}
