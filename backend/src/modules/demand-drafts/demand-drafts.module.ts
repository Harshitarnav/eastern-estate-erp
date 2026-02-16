import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DemandDraft } from './entities/demand-draft.entity';
import { DemandDraftsService } from './demand-drafts.service';
import { DemandDraftsController } from './demand-drafts.controller';
import { ConstructionModule } from '../construction/construction.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([DemandDraft]),
    ConstructionModule,
  ],
  controllers: [DemandDraftsController],
  providers: [DemandDraftsService],
  exports: [DemandDraftsService],
})
export class DemandDraftsModule {}
