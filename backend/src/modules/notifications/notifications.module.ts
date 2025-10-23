// ============================================
// FILE: backend/src/modules/notifications/notifications.module.ts
// ============================================

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailService } from './email.service';
import { ReminderService } from './reminder.service';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { Notification } from './entities/notification.entity';
import { User } from '../users/entities/user.entity';
import { Lead } from '../leads/entities/lead.entity';
import { SalesTask } from '../leads/entities/sales-task.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Notification, User, Lead, SalesTask])],
  controllers: [NotificationsController],
  providers: [EmailService, ReminderService, NotificationsService],
  exports: [EmailService, ReminderService, NotificationsService],
})
export class NotificationsModule {}
