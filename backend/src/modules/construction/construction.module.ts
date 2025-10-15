import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConstructionController } from './construction.controller';
import { ConstructionService } from './construction.service';
import { ConstructionProject } from './entities/construction-project.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ConstructionProject])],
  controllers: [ConstructionController],
  providers: [ConstructionService],
  exports: [ConstructionService],
})
export class ConstructionModule {}
