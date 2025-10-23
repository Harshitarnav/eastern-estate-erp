import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ChatGroup } from './chat-group.entity';

export enum ChatParticipantRole {
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
}

/**
 * Chat Participant Entity
 * Represents a participant/member in a chat group
 * Note: employeeId is stored as string without foreign key to employees table
 */
@Entity('chat_participants')
@Index(['chatGroupId'])
@Index(['employeeId'])
@Index(['isActive'])
@Index(['lastReadAt'])
export class ChatParticipant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'chat_group_id' })
  chatGroupId: string;

  @ManyToOne(() => ChatGroup)
  @JoinColumn({ name: 'chat_group_id' })
  chatGroup: ChatGroup;

  @Column({ type: 'uuid', name: 'employee_id', nullable: true })
  employeeId: string;

  @Column({
    type: 'enum',
    enum: ChatParticipantRole,
    default: ChatParticipantRole.MEMBER,
  })
  role: ChatParticipantRole;

  @CreateDateColumn()
  joinedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastReadAt: Date;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;
}
