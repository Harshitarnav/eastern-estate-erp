import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { PaymentInstallment } from './entities/payment-installment.entity';
import { PaymentRefund } from './entities/payment-refund.entity';
import { PaymentSchedule } from './entities/payment-schedule.entity';
import { PaymentsService } from './payments.service';
import { InstallmentsService } from './installments.service';
import { RefundsService } from './refunds.service';
import { PaymentCompletionService } from './services/payment-completion.service';
import { PaymentsController } from './payments.controller';
import { InstallmentsController } from './installments.controller';
import { RefundsController } from './refunds.controller';
import { PaymentPlansModule } from '../payment-plans/payment-plans.module';
import { Flat } from '../flats/entities/flat.entity';
import { Booking } from '../bookings/entities/booking.entity';
import { FlatPaymentPlan } from '../payment-plans/entities/flat-payment-plan.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Payment,
      PaymentInstallment,
      PaymentRefund,
      PaymentSchedule,
      Flat,
      Booking,
      FlatPaymentPlan,
    ]),
    PaymentPlansModule,
  ],
  controllers: [
    PaymentsController,
    InstallmentsController,
    RefundsController,
  ],
  providers: [
    PaymentsService,
    InstallmentsService,
    RefundsService,
    PaymentCompletionService,
  ],
  exports: [
    PaymentsService,
    InstallmentsService,
    RefundsService,
    PaymentCompletionService,
  ],
})
export class PaymentsModule {}
