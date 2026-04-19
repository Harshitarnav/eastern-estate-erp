import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerPortalController } from './customer-portal.controller';
import { CustomerPortalService } from './customer-portal.service';
import { CustomerPortalGuard } from './customer-portal.guard';
import { User } from '../users/entities/user.entity';
import { Role } from '../users/entities/role.entity';
import { Customer } from '../customers/entities/customer.entity';
import { Booking } from '../bookings/entities/booking.entity';
import { Payment } from '../payments/entities/payment.entity';
import { FlatPaymentPlan } from '../payment-plans/entities/flat-payment-plan.entity';
import { DemandDraft } from '../demand-drafts/entities/demand-draft.entity';
import { ConstructionProgressLog } from '../construction/entities/construction-progress-log.entity';
import { ConstructionProject } from '../construction/entities/construction-project.entity';
import { ConstructionFlatProgress } from '../construction/entities/construction-flat-progress.entity';
import { ConstructionDevelopmentUpdate } from '../construction/entities/construction-development-update.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Role,
      Customer,
      Booking,
      Payment,
      FlatPaymentPlan,
      DemandDraft,
      ConstructionProgressLog,
      ConstructionProject,
      ConstructionFlatProgress,
      ConstructionDevelopmentUpdate,
    ]),
  ],
  controllers: [CustomerPortalController],
  providers: [CustomerPortalService, CustomerPortalGuard],
})
export class CustomerPortalModule {}
