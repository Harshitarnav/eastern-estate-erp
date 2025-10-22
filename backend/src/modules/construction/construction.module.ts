import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConstructionProject } from './entities/construction-project.entity';
import { ConstructionTeam } from './entities/construction-team.entity';
import { ConstructionProgressLog } from './entities/construction-progress-log.entity';
import { ConstructionProjectAssignment } from './entities/construction-project-assignment.entity';
import { ConstructionTowerProgress } from './entities/construction-tower-progress.entity';
import { ConstructionFlatProgress } from './entities/construction-flat-progress.entity';
import { ConstructionDevelopmentUpdate } from './entities/construction-development-update.entity';
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
import { DevelopmentUpdatesService } from './development-updates.service';
import { DevelopmentUpdatesController } from './development-updates.controller';

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
    ]),
  ],
  controllers: [
    ConstructionProjectsController,
    ConstructionTeamsController,
    ConstructionProgressLogsController,
    ProjectAssignmentsController,
    TowerProgressController,
    FlatProgressController,
    DevelopmentUpdatesController,
  ],
  providers: [
    ConstructionProjectsService,
    ConstructionTeamsService,
    ConstructionProgressLogsService,
    ProjectAssignmentsService,
    TowerProgressService,
    FlatProgressService,
    DevelopmentUpdatesService,
  ],
  exports: [
    ConstructionProjectsService,
    ConstructionTeamsService,
    ConstructionProgressLogsService,
    ProjectAssignmentsService,
    TowerProgressService,
    FlatProgressService,
    DevelopmentUpdatesService,
  ],
})
export class ConstructionModule {}
