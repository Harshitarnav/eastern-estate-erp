import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ChatGroup } from './chat-group.entity';

/**
 * Chat Message Entity
 * Represents a message in a chat group
 * Note: senderEmployeeId is stored as string without foreign key to employees table
 */
@Entity('chat_messages')
@Index(['chatGroupId'])
@Index(['senderEmployeeId'])
@Index(['createdAt'])
@Index(['isDeleted'])
export class ChatMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'chat_group_id' })
  chatGroupId: string;

  @ManyToOne(() => ChatGroup)
  @JoinColumn({ name: 'chat_group_id' })
  chatGroup: ChatGroup;

  @Column({ type: 'uuid', name: 'sender_employee_id', nullable: true })
  senderEmployeeId: string;

  @Column({ type: 'text', name: 'message_text' })
  messageText: string;

  @Column({ type: 'uuid', name: 'reply_to_message_id', nullable: true })
  replyToMessageId: string;

  @ManyToOne(() => ChatMessage, { nullable: true })
  @JoinColumn({ name: 'reply_to_message_id' })
  replyToMessage: ChatMessage;

  @Column({ type: 'text', array: true, name: 'mentioned_employee_ids', default: [] })
  mentionedEmployeeIds: string[];

  @Column({ type: 'boolean', name: 'is_edited', default: false })
  isEdited: boolean;

  @Column({ type: 'timestamp', name: 'edited_at', nullable: true })
  editedAt: Date;

  @Column({ type: 'boolean', name: 'is_deleted', default: false })
  isDeleted: boolean;

  @Column({ type: 'timestamp', name: 'deleted_at', nullable: true })
  deletedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
