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
import { PushService } from './push.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly pushService: PushService,
  ) {}

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
    try {
      const include = includeRead === 'true';
      return await this.notificationsService.findAllForUser(userId, include);
    } catch (error) {
      // If notifications table is missing, avoid 500s and return empty
      return [];
    }
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

  // ── Push subscription endpoints ──────────────────────────────────────────

  @Get('push/vapid-public-key')
  getVapidPublicKey() {
    return { publicKey: this.pushService.getPublicKey() };
  }

  @Post('push/subscribe')
  async pushSubscribe(@Body() body: { endpoint: string; p256dh: string; auth: string }, @Req() req: any) {
    const userId = req.user?.userId || req.user?.id;
    await this.pushService.subscribe(userId, body.endpoint, body.p256dh, body.auth);
    return { message: 'Subscribed' };
  }

  @Post('push/unsubscribe')
  async pushUnsubscribe(@Body() body: { endpoint: string }, @Req() req: any) {
    const userId = req.user?.userId || req.user?.id;
    await this.pushService.unsubscribe(userId, body.endpoint);
    return { message: 'Unsubscribed' };
  }
}
