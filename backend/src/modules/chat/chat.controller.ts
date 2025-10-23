import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ChatService } from './chat.service';
import { CreateChatGroupDto } from './dto/create-chat-group.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { AddParticipantsDto } from './dto/add-participants.dto';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  /**
   * Get all chat groups for the current user
   */
  @Get('groups')
  async getMyGroups(@Request() req) {
    const employeeId = req.user?.employeeId || req.user?.id;
    if (!employeeId) {
      return [];
    }
    return this.chatService.getMyGroups(employeeId);
  }

  /**
   * Create a new chat group
   */
  @Post('groups')
  async createGroup(@Request() req, @Body() createGroupDto: CreateChatGroupDto) {
    const employeeId = req.user?.employeeId || req.user?.id;
    if (!employeeId) {
      throw new BadRequestException('User not authenticated or employee ID missing');
    }
    return this.chatService.createGroup(employeeId, createGroupDto);
  }

  /**
   * Get a specific chat group
   */
  @Get('groups/:groupId')
  async getGroup(@Request() req, @Param('groupId') groupId: string) {
    const employeeId = req.user?.employeeId || req.user?.id;
    if (!employeeId) {
      throw new BadRequestException('User not authenticated');
    }
    return this.chatService.getGroupById(groupId, employeeId);
  }

  /**
   * Get participants of a group
   */
  @Get('groups/:groupId/participants')
  async getGroupParticipants(@Param('groupId') groupId: string) {
    return this.chatService.getGroupParticipants(groupId);
  }

  /**
   * Add participants to a group
   */
  @Post('groups/:groupId/participants')
  async addParticipants(
    @Request() req,
    @Param('groupId') groupId: string,
    @Body() addParticipantsDto: AddParticipantsDto,
  ) {
    const employeeId = req.user?.employeeId || req.user?.id;
    if (!employeeId) {
      throw new BadRequestException('User not authenticated');
    }
    return this.chatService.addParticipants(groupId, employeeId, addParticipantsDto);
  }

  /**
   * Remove a participant from a group
   */
  @Delete('groups/:groupId/participants/:participantId')
  async removeParticipant(
    @Request() req,
    @Param('groupId') groupId: string,
    @Param('participantId') participantId: string,
  ) {
    const employeeId = req.user?.employeeId || req.user?.id;
    if (!employeeId) {
      throw new BadRequestException('User not authenticated');
    }
    return this.chatService.removeParticipant(groupId, employeeId, participantId);
  }

  /**
   * Create or get a direct message conversation
   */
  @Post('direct')
  async createDirectMessage(
    @Request() req,
    @Body('employeeId') otherEmployeeId: string,
  ) {
    const employeeId = req.user?.employeeId || req.user?.id;
    if (!employeeId) {
      throw new BadRequestException('User not authenticated or employee ID missing');
    }
    return this.chatService.createOrGetDirectMessage(employeeId, otherEmployeeId);
  }

  /**
   * Send a message
   */
  @Post('messages')
  async sendMessage(@Request() req, @Body() sendMessageDto: SendMessageDto) {
    const employeeId = req.user?.employeeId || req.user?.id;
    if (!employeeId) {
      throw new BadRequestException('User not authenticated');
    }
    return this.chatService.sendMessage(employeeId, sendMessageDto);
  }

  /**
   * Get messages for a group
   */
  @Get('groups/:groupId/messages')
  async getMessages(
    @Request() req,
    @Param('groupId') groupId: string,
    @Query('limit') limit?: string,
    @Query('before') before?: string,
  ) {
    const employeeId = req.user?.employeeId || req.user?.id;
    if (!employeeId) {
      throw new BadRequestException('User not authenticated');
    }
    const messageLimit = limit ? parseInt(limit, 10) : 50;
    return this.chatService.getMessages(groupId, employeeId, messageLimit, before);
  }

  /**
   * Mark messages as read for a group
   */
  @Put('groups/:groupId/read')
  async markAsRead(@Request() req, @Param('groupId') groupId: string) {
    const employeeId = req.user?.employeeId || req.user?.id;
    if (!employeeId) {
      throw new BadRequestException('User not authenticated');
    }
    return this.chatService.markAsRead(groupId, employeeId);
  }

  /**
   * Get unread count for a group
   */
  @Get('groups/:groupId/unread-count')
  async getUnreadCount(@Request() req, @Param('groupId') groupId: string) {
    const employeeId = req.user?.employeeId || req.user?.id;
    if (!employeeId) {
      return { count: 0 };
    }
    const count = await this.chatService.getUnreadCount(groupId, employeeId);
    return { count };
  }

  /**
   * Get total unread count across all groups
   */
  @Get('unread-count')
  async getTotalUnreadCount(@Request() req) {
    const employeeId = req.user?.employeeId || req.user?.id;
    if (!employeeId) {
      return { count: 0 };
    }
    const count = await this.chatService.getTotalUnreadCount(employeeId);
    return { count };
  }

  /**
   * Edit a message
   */
  @Put('messages/:messageId')
  async editMessage(
    @Request() req,
    @Param('messageId') messageId: string,
    @Body('messageText') messageText: string,
  ) {
    const employeeId = req.user?.employeeId || req.user?.id;
    if (!employeeId) {
      throw new BadRequestException('User not authenticated');
    }
    return this.chatService.editMessage(messageId, employeeId, messageText);
  }

  /**
   * Delete a message
   */
  @Delete('messages/:messageId')
  async deleteMessage(@Request() req, @Param('messageId') messageId: string) {
    const employeeId = req.user?.employeeId || req.user?.id;
    if (!employeeId) {
      throw new BadRequestException('User not authenticated');
    }
    return this.chatService.deleteMessage(messageId, employeeId);
  }

  /**
   * Search employees for direct messaging
   */
  @Get('search/employees')
  async searchEmployees(@Request() req, @Query('q') query: string) {
    const employeeId = req.user?.employeeId || req.user?.id;
    if (!employeeId) {
      return [];
    }
    return this.chatService.searchEmployees(employeeId, query);
  }
}
