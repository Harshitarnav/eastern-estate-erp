import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { Project } from './entities/project.entity';
import { Property } from '../properties/entities/property.entity';
import { ProjectsSchemaSyncService } from './projects.schema-sync.service';

@Module({
  imports: [TypeOrmModule.forFeature([Project, Property])],
  controllers: [ProjectsController],
  providers: [ProjectsService, ProjectsSchemaSyncService],
  exports: [ProjectsService, TypeOrmModule],
})
export class ProjectsModule {}
