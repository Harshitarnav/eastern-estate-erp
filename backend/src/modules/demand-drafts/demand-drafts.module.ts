import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DemandDraft } from './entities/demand-draft.entity';
import { DemandDraftsService } from './demand-drafts.service';
import { DemandDraftsController } from './demand-drafts.controller';
import { ConstructionModule } from '../construction/construction.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([DemandDraft]),
    ConstructionModule,
    NotificationsModule,
  ],
  controllers: [DemandDraftsController],
  providers: [DemandDraftsService],
  exports: [DemandDraftsService],
})
export class DemandDraftsModule {}
