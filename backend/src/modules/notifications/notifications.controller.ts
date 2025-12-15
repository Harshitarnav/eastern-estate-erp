import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  async create(@Body() createNotificationDto: CreateNotificationDto, @Req() req: any) {
    const userId = req.user?.userId || req.user?.id;
    return this.notificationsService.create(createNotificationDto, userId);
  }

  @Get()
  async findAll(@Req() req: any, @Query('includeRead') includeRead?: string) {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) {
      return [];
    }
    const include = includeRead === 'true';
    return this.notificationsService.findAllForUser(userId, include);
  }

  @Get('unread-count')
  async getUnreadCount(@Req() req: any) {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) {
      return { count: 0 };
    }
    try {
      const count = await this.notificationsService.getUnreadCount(userId);
      return { count };
    } catch (error) {
      // In environments without the notifications table, avoid throwing
      return { count: 0 };
    }
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.userId || req.user?.id;
    return this.notificationsService.markAsRead(id, userId);
  }

  @Patch('mark-all-read')
  async markAllAsRead(@Req() req: any) {
    const userId = req.user?.userId || req.user?.id;
    await this.notificationsService.markAllAsRead(userId);
    return { message: 'All notifications marked as read' };
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.userId || req.user?.id;
    await this.notificationsService.remove(id, userId);
    return { message: 'Notification deleted successfully' };
  }

  @Delete('clear/read')
  async clearRead(@Req() req: any) {
    const userId = req.user?.userId || req.user?.id;
    await this.notificationsService.clearRead(userId);
    return { message: 'Read notifications cleared successfully' };
  }
}
