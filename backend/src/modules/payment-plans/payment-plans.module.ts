import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentPlanTemplate } from './entities/payment-plan-template.entity';
import { FlatPaymentPlan } from './entities/flat-payment-plan.entity';
import { DemandDraftTemplate } from './entities/demand-draft-template.entity';
import { PaymentPlanTemplateService } from './services/payment-plan-template.service';
import { FlatPaymentPlanService } from './services/flat-payment-plan.service';
import { DemandDraftTemplateService } from './services/demand-draft-template.service';
import { PaymentPlanTemplateController } from './controllers/payment-plan-template.controller';
import { FlatPaymentPlanController } from './controllers/flat-payment-plan.controller';
import { DemandDraftTemplateController } from './controllers/demand-draft-template.controller';
import { Flat } from '../flats/entities/flat.entity';
import { Booking } from '../bookings/entities/booking.entity';
import { Customer } from '../customers/entities/customer.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PaymentPlanTemplate,
      FlatPaymentPlan,
      DemandDraftTemplate,
      Flat,
      Booking,
      Customer,
    ]),
  ],
  controllers: [
    PaymentPlanTemplateController,
    FlatPaymentPlanController,
    DemandDraftTemplateController,
  ],
  providers: [
    PaymentPlanTemplateService,
    FlatPaymentPlanService,
    DemandDraftTemplateService,
  ],
  exports: [
    PaymentPlanTemplateService,
    FlatPaymentPlanService,
    DemandDraftTemplateService,
  ],
})
export class PaymentPlansModule {}
