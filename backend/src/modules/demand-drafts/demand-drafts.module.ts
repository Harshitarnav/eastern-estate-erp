import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DemandDraft } from './entities/demand-draft.entity';
import { DemandDraftsService } from './demand-drafts.service';
import { DemandDraftsController } from './demand-drafts.controller';
import { DemandDraftsSchemaSyncService } from './demand-drafts.schema-sync.service';
import { ConstructionModule } from '../construction/construction.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([DemandDraft, User]),
    ConstructionModule,
    NotificationsModule,
  ],
  controllers: [DemandDraftsController],
  providers: [DemandDraftsService, DemandDraftsSchemaSyncService],
  exports: [DemandDraftsService],
})
export class DemandDraftsModule {}
