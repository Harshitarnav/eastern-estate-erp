import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConstructionProject } from './entities/construction-project.entity';
import { ConstructionTeam } from './entities/construction-team.entity';
import { ConstructionProgressLog } from './entities/construction-progress-log.entity';
import { ConstructionProjectAssignment } from './entities/construction-project-assignment.entity';
import { ConstructionTowerProgress } from './entities/construction-tower-progress.entity';
import { ConstructionFlatProgress } from './entities/construction-flat-progress.entity';
import { ConstructionDevelopmentUpdate } from './entities/construction-development-update.entity';
import { RABill } from './entities/ra-bill.entity';
import { QCChecklist } from './entities/qc-checklist.entity';
import { ConstructionProjectsService } from './construction-projects.service';
import { ConstructionProjectsController } from './construction-projects.controller';
import { ConstructionTeamsService } from './construction-teams.service';
import { ConstructionTeamsController } from './construction-teams.controller';
import { ConstructionProgressLogsService } from './construction-progress-logs.service';
import { ConstructionProgressLogsController } from './construction-progress-logs.controller';
import { ProjectAssignmentsService } from './project-assignments.service';
import { ProjectAssignmentsController } from './project-assignments.controller';
import { TowerProgressService } from './tower-progress.service';
import { TowerProgressController } from './tower-progress.controller';
import { FlatProgressService } from './flat-progress.service';
import { FlatProgressController } from './flat-progress.controller';
import { FlatProgressSimpleController } from './controllers/flat-progress-simple.controller';
import { DevelopmentUpdatesService } from './development-updates.service';
import { DevelopmentUpdatesController } from './development-updates.controller';
import { ProjectsAliasController } from './projects-alias.controller';
import { MilestonesController } from './controllers/milestones.controller';
import { ConstructionSchemaSyncService } from './construction.schema-sync.service';
import { MilestoneDetectionService } from './services/milestone-detection.service';
import { AutoDemandDraftService } from './services/auto-demand-draft.service';
import { ConstructionWorkflowService } from './services/construction-workflow.service';
import { RABillsService } from './ra-bills.service';
import { RABillsController } from './ra-bills.controller';
import { QCService } from './qc.service';
import { QCController } from './qc.controller';
import { ConstructionReportsService } from './services/construction-reports.service';
import { ConstructionReportsController } from './controllers/construction-reports.controller';
import { PaymentPlansModule } from '../payment-plans/payment-plans.module';
import { SettingsModule } from '../settings/settings.module';
import { MailModule } from '../../common/mail/mail.module';
import { AccountingModule } from '../accounting/accounting.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { DemandDraft } from '../demand-drafts/entities/demand-draft.entity';
import { PaymentSchedule } from '../payments/entities/payment-schedule.entity';
import { FlatPaymentPlan } from '../payment-plans/entities/flat-payment-plan.entity';
import { Flat } from '../flats/entities/flat.entity';
import { Customer } from '../customers/entities/customer.entity';
import { Booking } from '../bookings/entities/booking.entity';
import { Property } from '../properties/entities/property.entity';
import { Tower } from '../towers/entities/tower.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ConstructionProject,
      ConstructionTeam,
      ConstructionProgressLog,
      ConstructionProjectAssignment,
      ConstructionTowerProgress,
      ConstructionFlatProgress,
      ConstructionDevelopmentUpdate,
      RABill,
      QCChecklist,
      DemandDraft,
      PaymentSchedule,
      FlatPaymentPlan,
      Flat,
      Customer,
      Booking,
      Property,
      Tower,
      User,
    ]),
    PaymentPlansModule,
    SettingsModule,
    MailModule,
    AccountingModule,
    NotificationsModule,
  ],
  controllers: [
    ConstructionProjectsController,
    ProjectsAliasController,
    ConstructionTeamsController,
    ConstructionProgressLogsController,
    ProjectAssignmentsController,
    TowerProgressController,
    FlatProgressController,
    FlatProgressSimpleController,
    DevelopmentUpdatesController,
    MilestonesController,
    RABillsController,
    QCController,
    ConstructionReportsController,
  ],
  providers: [
    ConstructionProjectsService,
    ConstructionSchemaSyncService,
    ConstructionTeamsService,
    ConstructionProgressLogsService,
    ProjectAssignmentsService,
    TowerProgressService,
    FlatProgressService,
    DevelopmentUpdatesService,
    MilestoneDetectionService,
    AutoDemandDraftService,
    ConstructionWorkflowService,
    RABillsService,
    QCService,
    ConstructionReportsService,
  ],
  exports: [
    ConstructionProjectsService,
    ConstructionTeamsService,
    ConstructionProgressLogsService,
    ProjectAssignmentsService,
    TowerProgressService,
    FlatProgressService,
    DevelopmentUpdatesService,
    MilestoneDetectionService,
    AutoDemandDraftService,
    ConstructionWorkflowService,
    RABillsService,
    QCService,
    ConstructionReportsService,
  ],
})
export class ConstructionModule {}
