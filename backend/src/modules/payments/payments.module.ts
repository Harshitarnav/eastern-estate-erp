import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PaymentScheduleService } from './payment-schedule.service';
import { Payment } from './entities/payment.entity';
import { PaymentSchedule } from './entities/payment-schedule.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Payment, PaymentSchedule])],
  controllers: [PaymentsController],
  providers: [PaymentsService, PaymentScheduleService],
  exports: [PaymentsService, PaymentScheduleService],
})
export class PaymentsModule {}
