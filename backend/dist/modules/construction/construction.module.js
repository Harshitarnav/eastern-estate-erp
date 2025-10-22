"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConstructionModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const construction_project_entity_1 = require("./entities/construction-project.entity");
const construction_team_entity_1 = require("./entities/construction-team.entity");
const construction_progress_log_entity_1 = require("./entities/construction-progress-log.entity");
const construction_project_assignment_entity_1 = require("./entities/construction-project-assignment.entity");
const construction_tower_progress_entity_1 = require("./entities/construction-tower-progress.entity");
const construction_flat_progress_entity_1 = require("./entities/construction-flat-progress.entity");
const construction_development_update_entity_1 = require("./entities/construction-development-update.entity");
const construction_projects_service_1 = require("./construction-projects.service");
const construction_projects_controller_1 = require("./construction-projects.controller");
const construction_teams_service_1 = require("./construction-teams.service");
const construction_teams_controller_1 = require("./construction-teams.controller");
const construction_progress_logs_service_1 = require("./construction-progress-logs.service");
const construction_progress_logs_controller_1 = require("./construction-progress-logs.controller");
const project_assignments_service_1 = require("./project-assignments.service");
const project_assignments_controller_1 = require("./project-assignments.controller");
const tower_progress_service_1 = require("./tower-progress.service");
const tower_progress_controller_1 = require("./tower-progress.controller");
const flat_progress_service_1 = require("./flat-progress.service");
const flat_progress_controller_1 = require("./flat-progress.controller");
const development_updates_service_1 = require("./development-updates.service");
const development_updates_controller_1 = require("./development-updates.controller");
let ConstructionModule = class ConstructionModule {
};
exports.ConstructionModule = ConstructionModule;
exports.ConstructionModule = ConstructionModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                construction_project_entity_1.ConstructionProject,
                construction_team_entity_1.ConstructionTeam,
                construction_progress_log_entity_1.ConstructionProgressLog,
                construction_project_assignment_entity_1.ConstructionProjectAssignment,
                construction_tower_progress_entity_1.ConstructionTowerProgress,
                construction_flat_progress_entity_1.ConstructionFlatProgress,
                construction_development_update_entity_1.ConstructionDevelopmentUpdate,
            ]),
        ],
        controllers: [
            construction_projects_controller_1.ConstructionProjectsController,
            construction_teams_controller_1.ConstructionTeamsController,
            construction_progress_logs_controller_1.ConstructionProgressLogsController,
            project_assignments_controller_1.ProjectAssignmentsController,
            tower_progress_controller_1.TowerProgressController,
            flat_progress_controller_1.FlatProgressController,
            development_updates_controller_1.DevelopmentUpdatesController,
        ],
        providers: [
            construction_projects_service_1.ConstructionProjectsService,
            construction_teams_service_1.ConstructionTeamsService,
            construction_progress_logs_service_1.ConstructionProgressLogsService,
            project_assignments_service_1.ProjectAssignmentsService,
            tower_progress_service_1.TowerProgressService,
            flat_progress_service_1.FlatProgressService,
            development_updates_service_1.DevelopmentUpdatesService,
        ],
        exports: [
            construction_projects_service_1.ConstructionProjectsService,
            construction_teams_service_1.ConstructionTeamsService,
            construction_progress_logs_service_1.ConstructionProgressLogsService,
            project_assignments_service_1.ProjectAssignmentsService,
            tower_progress_service_1.TowerProgressService,
            flat_progress_service_1.FlatProgressService,
            development_updates_service_1.DevelopmentUpdatesService,
        ],
    })
], ConstructionModule);
//# sourceMappingURL=construction.module.js.map