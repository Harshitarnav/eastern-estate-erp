import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { PaymentRefund } from './entities/payment-refund.entity';
import { PaymentSchedule } from './entities/payment-schedule.entity';
import { PaymentsService } from './payments.service';
import { RefundsService } from './refunds.service';
import { PaymentCompletionService } from './services/payment-completion.service';
import { OverdueScannerService } from './services/overdue-scanner.service';
import { LegacyImportService } from './services/legacy-import.service';
import { CollectionsService } from './services/collections.service';
import { PaymentsController } from './payments.controller';
import { RefundsController } from './refunds.controller';
import { LegacyImportController } from './controllers/legacy-import.controller';
import { CollectionsController } from './controllers/collections.controller';
import { PaymentPlansModule } from '../payment-plans/payment-plans.module';
import { AccountingModule } from '../accounting/accounting.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { SettingsModule } from '../settings/settings.module';
import { MailModule } from '../../common/mail/mail.module';
import { ConstructionModule } from '../construction/construction.module';
import { DemandDraftsModule } from '../demand-drafts/demand-drafts.module';
import { Flat } from '../flats/entities/flat.entity';
import { Booking } from '../bookings/entities/booking.entity';
import { Customer } from '../customers/entities/customer.entity';
import { FlatPaymentPlan } from '../payment-plans/entities/flat-payment-plan.entity';
import { DemandDraft } from '../demand-drafts/entities/demand-draft.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Payment,
      PaymentRefund,
      PaymentSchedule,
      Flat,
      Booking,
      Customer,
      FlatPaymentPlan,
      DemandDraft,
      User,
    ]),
    PaymentPlansModule,
    AccountingModule,
    NotificationsModule,
    SettingsModule,
    MailModule,
    ConstructionModule,
    DemandDraftsModule,
    // SmsModule is global via @Global() in app.module, no explicit import needed.
  ],
  controllers: [
    PaymentsController,
    RefundsController,
    LegacyImportController,
    CollectionsController,
  ],
  providers: [
    PaymentsService,
    RefundsService,
    PaymentCompletionService,
    OverdueScannerService,
    LegacyImportService,
    CollectionsService,
  ],
  exports: [
    PaymentsService,
    RefundsService,
    PaymentCompletionService,
    OverdueScannerService,
    LegacyImportService,
    CollectionsService,
  ],
})
export class PaymentsModule {}
