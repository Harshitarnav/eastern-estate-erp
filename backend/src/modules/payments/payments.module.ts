import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { PaymentInstallment } from './entities/payment-installment.entity';
import { PaymentRefund } from './entities/payment-refund.entity';
import { PaymentsService } from './payments.service';
import { InstallmentsService } from './installments.service';
import { RefundsService } from './refunds.service';
import { PaymentsController } from './payments.controller';
import { InstallmentsController } from './installments.controller';
import { RefundsController } from './refunds.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Payment,
      PaymentInstallment,
      PaymentRefund,
    ]),
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
  ],
  exports: [
    PaymentsService,
    InstallmentsService,
    RefundsService,
  ],
})
export class PaymentsModule {}
