import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Not } from 'typeorm';
import { ChatGroup, ChatGroupType } from './entities/chat-group.entity';
import { ChatParticipant, ChatParticipantRole } from './entities/chat-participant.entity';
import { ChatMessage } from './entities/chat-message.entity';
import { ChatAttachment } from './entities/chat-attachment.entity';
import { CreateChatGroupDto } from './dto/create-chat-group.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { AddParticipantsDto } from './dto/add-participants.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType, NotificationCategory } from '../notifications/entities/notification.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatGroup)
    private chatGroupRepository: Repository<ChatGroup>,
    @InjectRepository(ChatParticipant)
    private chatParticipantRepository: Repository<ChatParticipant>,
    @InjectRepository(ChatMessage)
    private chatMessageRepository: Repository<ChatMessage>,
    @InjectRepository(ChatAttachment)
    private chatAttachmentRepository: Repository<ChatAttachment>,
    private notificationsService: NotificationsService,
  ) {}

  /**
   * Create a new chat group
   */
  async createGroup(employeeId: string, createGroupDto: CreateChatGroupDto) {
    const { participantIds, ...groupData } = createGroupDto;

    // Create the group
    const group = this.chatGroupRepository.create({
      ...groupData,
      createdByEmployeeId: null,
    });
    await this.chatGroupRepository.save(group);

    // Add creator as admin
    await this.addParticipant(group.id, employeeId, ChatParticipantRole.ADMIN);

    // Add other participants as members
    for (const participantId of participantIds) {
      if (participantId !== employeeId) {
        await this.addParticipant(group.id, participantId, ChatParticipantRole.MEMBER);
      }
    }

    return this.getGroupById(group.id, employeeId);
  }

  /**
   * Create or get a direct message conversation
   */
  async createOrGetDirectMessage(employeeId: string, otherEmployeeId: string) {
    // Check if a direct conversation already exists
    const existingConversations = await this.chatGroupRepository
      .createQueryBuilder('group')
      .innerJoin('chat_participants', 'p1', 'p1.chat_group_id = group.id AND p1.employee_id = :employeeId', { employeeId })
      .innerJoin('chat_participants', 'p2', 'p2.chat_group_id = group.id AND p2.employee_id = :otherEmployeeId', { otherEmployeeId })
      .where('group.group_type = :type', { type: ChatGroupType.DIRECT })
      .andWhere('group.is_active = true')
      .getMany();

    if (existingConversations.length > 0) {
      return this.getGroupById(existingConversations[0].id, employeeId);
    }

    // Create new direct conversation
    const group = this.chatGroupRepository.create({
      name: `Direct Message`,
      groupType: ChatGroupType.DIRECT,
      createdByEmployeeId: null,
    });
    await this.chatGroupRepository.save(group);

    // Add both participants
    await this.addParticipant(group.id, employeeId, ChatParticipantRole.MEMBER);
    await this.addParticipant(group.id, otherEmployeeId, ChatParticipantRole.MEMBER);

    return this.getGroupById(group.id, employeeId);
  }

  /**
   * Get all chat groups for an employee
   */
  async getMyGroups(employeeId: string) {
    const participants = await this.chatParticipantRepository.find({
      where: {
        employeeId,
        isActive: true,
      },
      relations: ['chatGroup'],
      order: {
        chatGroup: {
          updatedAt: 'DESC',
        },
      },
    });

    const groups = await Promise.all(
      participants.map(async (participant) => {
        const unreadCount = await this.getUnreadCount(participant.chatGroupId, employeeId);
        const lastMessage = await this.getLastMessage(participant.chatGroupId);
        const participantsList = await this.getGroupParticipants(participant.chatGroupId);

        return {
          ...participant.chatGroup,
          unreadCount,
          lastMessage,
          participants: participantsList,
          myRole: participant.role,
        };
      }),
    );

    return groups.filter((g) => g.isActive);
  }

  /**
   * Get a specific group by ID
   */
  async getGroupById(groupId: string, employeeId: string) {
    // Verify employee is a participant
    const participant = await this.chatParticipantRepository.findOne({
      where: {
        chatGroupId: groupId,
        employeeId,
        isActive: true,
      },
    });

    if (!participant) {
      throw new ForbiddenException('You are not a member of this group');
    }

    const group = await this.chatGroupRepository.findOne({
      where: { id: groupId },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    const participants = await this.getGroupParticipants(groupId);
    const unreadCount = await this.getUnreadCount(groupId, employeeId);

    return {
      ...group,
      participants,
      unreadCount,
      myRole: participant.role,
    };
  }

  /**
   * Get participants of a group
   */
  async getGroupParticipants(groupId: string) {
    const participants = await this.chatParticipantRepository.find({
      where: {
        chatGroupId: groupId,
        isActive: true,
      },
    });

    return participants.map((p) => ({
      id: p.id,
      employeeId: p.employeeId,
      role: p.role,
      joinedAt: p.joinedAt,
      lastReadAt: p.lastReadAt,
    }));
  }

  /**
   * Add participants to a group
   */
  async addParticipants(groupId: string, employeeId: string, addParticipantsDto: AddParticipantsDto) {
    // Verify requester is admin
    const requester = await this.chatParticipantRepository.findOne({
      where: {
        chatGroupId: groupId,
        employeeId,
        isActive: true,
      },
    });

    if (!requester || requester.role !== ChatParticipantRole.ADMIN) {
      throw new ForbiddenException('Only admins can add participants');
    }

    // Add each participant
    for (const participantId of addParticipantsDto.employeeIds) {
      await this.addParticipant(groupId, participantId, ChatParticipantRole.MEMBER);
    }

    return { message: 'Participants added successfully' };
  }

  /**
   * Remove a participant from a group
   */
  async removeParticipant(groupId: string, employeeId: string, participantIdToRemove: string) {
    const requester = await this.chatParticipantRepository.findOne({
      where: {
        chatGroupId: groupId,
        employeeId,
        isActive: true,
      },
    });

    if (!requester || requester.role !== ChatParticipantRole.ADMIN) {
      throw new ForbiddenException('Only admins can remove participants');
    }

    const participant = await this.chatParticipantRepository.findOne({
      where: {
        chatGroupId: groupId,
        employeeId: participantIdToRemove,
      },
    });

    if (participant) {
      participant.isActive = false;
      await this.chatParticipantRepository.save(participant);
    }

    return { message: 'Participant removed successfully' };
  }

  /**
   * Send a message
   */
  async sendMessage(employeeId: string, sendMessageDto: SendMessageDto) {
    const { chatGroupId, messageText, mentionedEmployeeIds, replyToMessageId } = sendMessageDto;

    // Verify employee is a participant
    const participant = await this.chatParticipantRepository.findOne({
      where: {
        chatGroupId,
        employeeId,
        isActive: true,
      },
    });

    if (!participant) {
      throw new ForbiddenException('You are not a member of this group');
    }

    // Get group details
    const group = await this.chatGroupRepository.findOne({
      where: { id: chatGroupId },
    });

    // Create the message - ensure mentionedEmployeeIds is always an array
    const message = this.chatMessageRepository.create({
      chatGroupId,
      senderEmployeeId: employeeId,
      messageText,
      mentionedEmployeeIds: Array.isArray(mentionedEmployeeIds) ? mentionedEmployeeIds : [],
      replyToMessageId,
    });

    await this.chatMessageRepository.save(message);

    // Update group's updatedAt
    await this.chatGroupRepository.update(chatGroupId, {
      updatedAt: new Date(),
    });

    // Send notifications to all participants except the sender
    const allParticipants = await this.chatParticipantRepository.find({
      where: {
        chatGroupId,
        isActive: true,
      },
    });

    const recipientIds = allParticipants
      .filter(p => p.employeeId !== employeeId)
      .map(p => p.employeeId);

    if (recipientIds.length > 0) {
      // Determine priority based on mentions (higher number = higher priority)
      const priority = (mentionedEmployeeIds && mentionedEmployeeIds.length > 0) ? 5 : 3;

      // Create notification for each recipient
      for (const recipientId of recipientIds) {
        try {
          await this.notificationsService.create({
            userId: recipientId,
            type: NotificationType.INFO,
            category: NotificationCategory.TASK,
            title: `New message in ${group?.name || 'Chat'}`,
            message: messageText.length > 100 ? `${messageText.substring(0, 100)}...` : messageText,
            priority,
            relatedEntityType: 'CHAT_MESSAGE',
            relatedEntityId: message.id,
            actionUrl: `/chat/${chatGroupId}`,
          });
        } catch (error) {
          // Log error but don't fail the message send
          console.error(`Failed to send notification to ${recipientId}:`, error);
        }
      }
    }

    return this.getMessageById(message.id);
  }

  /**
   * Get messages for a group
   */
  async getMessages(groupId: string, employeeId: string, limit = 50, before?: string) {
    // Verify employee is a participant
    const participant = await this.chatParticipantRepository.findOne({
      where: {
        chatGroupId: groupId,
        employeeId,
        isActive: true,
      },
    });

    if (!participant) {
      throw new ForbiddenException('You are not a member of this group');
    }

    const queryBuilder = this.chatMessageRepository
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.replyToMessage', 'replyToMessage')
      .where('message.chatGroupId = :groupId', { groupId })
      .andWhere('message.isDeleted = false')
      .orderBy('message.createdAt', 'DESC')
      .take(limit);

    if (before) {
      queryBuilder.andWhere('message.createdAt < :before', { before: new Date(before) });
    }

    const messages = await queryBuilder.getMany();

    // Get attachments for each message
    const messagesWithAttachments = await Promise.all(
      messages.map(async (message) => {
        const attachments = await this.chatAttachmentRepository.find({
          where: { messageId: message.id },
        });

        return {
          ...message,
          senderEmployeeId: message.senderEmployeeId,
          attachments,
          replyTo: message.replyToMessage
            ? {
                id: message.replyToMessage.id,
                messageText: message.replyToMessage.messageText,
                senderEmployeeId: message.replyToMessage.senderEmployeeId,
              }
            : null,
        };
      }),
    );

    return messagesWithAttachments.reverse(); // Return in chronological order
  }

  /**
   * Mark messages as read
   */
  async markAsRead(groupId: string, employeeId: string) {
    const participant = await this.chatParticipantRepository.findOne({
      where: {
        chatGroupId: groupId,
        employeeId,
        isActive: true,
      },
    });

    if (!participant) {
      throw new ForbiddenException('You are not a member of this group');
    }

    participant.lastReadAt = new Date();
    await this.chatParticipantRepository.save(participant);

    return { message: 'Messages marked as read' };
  }

  /**
   * Get unread message count for a group
   */
  async getUnreadCount(groupId: string, employeeId: string): Promise<number> {
    const participant = await this.chatParticipantRepository.findOne({
      where: {
        chatGroupId: groupId,
        employeeId,
        isActive: true,
      },
    });

    if (!participant) {
      return 0;
    }

    const lastReadAt = participant.lastReadAt || new Date('1970-01-01');

    const count = await this.chatMessageRepository
      .createQueryBuilder('message')
      .where('message.chatGroupId = :groupId', { groupId })
      .andWhere('message.senderEmployeeId != :employeeId', { employeeId })
      .andWhere('message.isDeleted = false')
      .andWhere('message.createdAt > :lastReadAt', { lastReadAt })
      .getCount();

    return count;
  }

  /**
   * Get total unread count for employee
   */
  async getTotalUnreadCount(employeeId: string): Promise<number> {
    const participants = await this.chatParticipantRepository.find({
      where: {
        employeeId,
        isActive: true,
      },
    });

    let totalCount = 0;
    for (const participant of participants) {
      const count = await this.getUnreadCount(participant.chatGroupId, employeeId);
      totalCount += count;
    }

    return totalCount;
  }

  /**
   * Delete a message
   */
  async deleteMessage(messageId: string, employeeId: string) {
    const message = await this.chatMessageRepository.findOne({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (message.senderEmployeeId !== employeeId) {
      throw new ForbiddenException('You can only delete your own messages');
    }

    message.isDeleted = true;
    message.deletedAt = new Date();
    await this.chatMessageRepository.save(message);

    return { message: 'Message deleted successfully' };
  }

  /**
   * Edit a message
   */
  async editMessage(messageId: string, employeeId: string, newText: string) {
    const message = await this.chatMessageRepository.findOne({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (message.senderEmployeeId !== employeeId) {
      throw new ForbiddenException('You can only edit your own messages');
    }

    message.messageText = newText;
    message.isEdited = true;
    message.editedAt = new Date();
    await this.chatMessageRepository.save(message);

    return this.getMessageById(messageId);
  }

  // Helper methods

  private async addParticipant(groupId: string, employeeId: string, role: ChatParticipantRole) {
    const existing = await this.chatParticipantRepository.findOne({
      where: {
        chatGroupId: groupId,
        employeeId,
      },
    });

    if (existing) {
      if (!existing.isActive) {
        existing.isActive = true;
        await this.chatParticipantRepository.save(existing);
      }
      return existing;
    }

    const participant = this.chatParticipantRepository.create({
      chatGroupId: groupId,
      employeeId,
      role,
    });

    return this.chatParticipantRepository.save(participant);
  }

  private async getLastMessage(groupId: string) {
    const message = await this.chatMessageRepository.findOne({
      where: {
        chatGroupId: groupId,
        isDeleted: false,
      },
      order: {
        createdAt: 'DESC',
      },
    });

    if (!message) {
      return null;
    }

    return {
      id: message.id,
      messageText: message.messageText,
      createdAt: message.createdAt,
      senderEmployeeId: message.senderEmployeeId,
    };
  }

  private async getMessageById(messageId: string) {
    const message = await this.chatMessageRepository.findOne({
      where: { id: messageId },
      relations: ['replyToMessage'],
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    const attachments = await this.chatAttachmentRepository.find({
      where: { messageId: message.id },
    });

    return {
      ...message,
      sender: {
        id: message.senderEmployeeId,
        fullName: 'User', // Placeholder since we don't have employee data
        email: '',
      },
      attachments,
      replyTo: message.replyToMessage
        ? {
            id: message.replyToMessage.id,
            messageText: message.replyToMessage.messageText,
            sender: {
              id: message.replyToMessage.senderEmployeeId,
              fullName: 'User',
            },
          }
        : null,
    };
  }

  /**
   * Search for employees (placeholder for employee search integration)
   */
  async searchEmployees(employeeId: string, query: string) {
    // This would integrate with the employees module
    // For now, returning empty array
    return [];
  }
}
