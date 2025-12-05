import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeadsController } from './leads.controller';
import { LeadsService } from './leads.service';
import { Lead } from './entities/lead.entity';
import { FollowUp } from './entities/followup.entity';
import { SalesTask } from './entities/sales-task.entity';
import { FollowUpService } from './followup.service';
import { SalesTaskService } from './sales-task.service';
import { FollowUpController } from './followup.controller';
import { SalesTaskController } from './sales-task.controller';
import { SalesDashboardService } from './sales-dashboard.service';
import { SalesDashboardController } from './sales-dashboard.controller';
import { PriorityService } from './priority.service';
import { SalesTarget } from '../employees/entities/sales-target.entity';
import { Booking } from '../bookings/entities/booking.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { LeadsSchemaSyncService } from './leads.schema-sync.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Lead, FollowUp, SalesTask, SalesTarget, Booking]),
    NotificationsModule,
  ],
  controllers: [LeadsController, FollowUpController, SalesTaskController, SalesDashboardController],
  providers: [LeadsService, FollowUpService, SalesTaskService, SalesDashboardService, PriorityService, LeadsSchemaSyncService],
  exports: [LeadsService, FollowUpService, SalesTaskService, SalesDashboardService, PriorityService],
})
export class LeadsModule {}
