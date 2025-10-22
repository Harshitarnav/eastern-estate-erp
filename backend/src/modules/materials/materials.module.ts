import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Material } from './entities/material.entity';
import { MaterialEntry } from './entities/material-entry.entity';
import { MaterialExit } from './entities/material-exit.entity';
import { MaterialsService } from './materials.service';
import { MaterialEntriesService } from './material-entries.service';
import { MaterialExitsService } from './material-exits.service';
import { MaterialsController } from './materials.controller';
import { MaterialEntriesController } from './material-entries.controller';
import { MaterialExitsController } from './material-exits.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Material, MaterialEntry, MaterialExit]),
  ],
  controllers: [
    MaterialsController,
    MaterialEntriesController,
    MaterialExitsController,
  ],
  providers: [
    MaterialsService,
    MaterialEntriesService,
    MaterialExitsService,
  ],
  exports: [
    MaterialsService,
    MaterialEntriesService,
    MaterialExitsService,
  ],
})
export class MaterialsModule {}
