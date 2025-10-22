import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConstructionProject } from './entities/construction-project.entity';
import { ConstructionTeam } from './entities/construction-team.entity';
import { ConstructionProgressLog } from './entities/construction-progress-log.entity';
import { ConstructionProjectsService } from './construction-projects.service';
import { ConstructionProjectsController } from './construction-projects.controller';
import { ConstructionTeamsService } from './construction-teams.service';
import { ConstructionTeamsController } from './construction-teams.controller';
import { ConstructionProgressLogsService } from './construction-progress-logs.service';
import { ConstructionProgressLogsController } from './construction-progress-logs.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ConstructionProject, ConstructionTeam, ConstructionProgressLog])],
  controllers: [
    ConstructionProjectsController,
    ConstructionTeamsController,
    ConstructionProgressLogsController,
  ],
  providers: [
    ConstructionProjectsService,
    ConstructionTeamsService,
    ConstructionProgressLogsService,
  ],
  exports: [
    ConstructionProjectsService,
    ConstructionTeamsService,
    ConstructionProgressLogsService,
  ],
})
export class ConstructionModule {}
