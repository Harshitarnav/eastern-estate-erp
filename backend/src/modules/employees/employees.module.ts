import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeesService } from './employees.service';
import { EmployeesController } from './employees.controller';
import { Employee } from './entities/employee.entity';
import { SalesTarget } from './entities/sales-target.entity';
import { SalaryPayment } from './entities/salary-payment.entity';
import { SalesTargetService } from './sales-target.service';
import { SalesTargetController } from './sales-target.controller';
import { SalaryPaymentsService } from './salary-payments.service';
import { SalaryPaymentsController } from './salary-payments.controller';
import { Lead } from '../leads/entities/lead.entity';
import { Booking } from '../bookings/entities/booking.entity';
import { UsersModule } from '../users/users.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { AccountingModule } from '../accounting/accounting.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Employee, SalesTarget, SalaryPayment, Lead, Booking]),
    forwardRef(() => UsersModule),
    NotificationsModule,
    AccountingModule,
  ],
  controllers: [SalaryPaymentsController, SalesTargetController, EmployeesController],
  providers: [EmployeesService, SalesTargetService, SalaryPaymentsService],
  exports: [EmployeesService, SalesTargetService, SalaryPaymentsService],
})
export class EmployeesModule {}
