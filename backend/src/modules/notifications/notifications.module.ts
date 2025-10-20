// ============================================
// FILE: backend/src/modules/notifications/notifications.module.ts
// ============================================

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailService } from './email.service';
import { ReminderService } from './reminder.service';
import { Lead } from '../leads/entities/lead.entity';
import { SalesTask } from '../leads/entities/sales-task.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Lead, SalesTask])],
  providers: [EmailService, ReminderService],
  exports: [EmailService, ReminderService],
})
export class NotificationsModule {}