import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DemandDraftsService } from './demand-drafts.service';
import { DemandDraftsController } from './demand-drafts.controller';
import { DemandDraft } from './entities/demand-draft.entity';
import { DemandDraftsSchemaSyncService } from './demand-drafts.schema-sync.service';

@Module({
  imports: [TypeOrmModule.forFeature([DemandDraft])],
  controllers: [DemandDraftsController],
  providers: [DemandDraftsService, DemandDraftsSchemaSyncService],
  exports: [DemandDraftsService],
})
export class DemandDraftsModule {}
