import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeesService } from './employees.service';
import { EmployeesController } from './employees.controller';
import { Employee } from './entities/employee.entity';
import { SalesTarget } from './entities/sales-target.entity';
import { SalesTargetService } from './sales-target.service';
import { SalesTargetController } from './sales-target.controller';
import { Lead } from '../leads/entities/lead.entity';
import { Booking } from '../bookings/entities/booking.entity';
import { UsersModule } from '../users/users.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Employee, SalesTarget, Lead, Booking]),
    forwardRef(() => UsersModule),
    NotificationsModule,
  ],
  controllers: [EmployeesController, SalesTargetController],
  providers: [EmployeesService, SalesTargetService],
  exports: [EmployeesService, SalesTargetService],
})
export class EmployeesModule {}
