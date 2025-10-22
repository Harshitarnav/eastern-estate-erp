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
const construction_projects_service_1 = require("./construction-projects.service");
const construction_projects_controller_1 = require("./construction-projects.controller");
const construction_teams_service_1 = require("./construction-teams.service");
const construction_teams_controller_1 = require("./construction-teams.controller");
const construction_progress_logs_service_1 = require("./construction-progress-logs.service");
const construction_progress_logs_controller_1 = require("./construction-progress-logs.controller");
let ConstructionModule = class ConstructionModule {
};
exports.ConstructionModule = ConstructionModule;
exports.ConstructionModule = ConstructionModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([construction_project_entity_1.ConstructionProject, construction_team_entity_1.ConstructionTeam, construction_progress_log_entity_1.ConstructionProgressLog])],
        controllers: [
            construction_projects_controller_1.ConstructionProjectsController,
            construction_teams_controller_1.ConstructionTeamsController,
            construction_progress_logs_controller_1.ConstructionProgressLogsController,
        ],
        providers: [
            construction_projects_service_1.ConstructionProjectsService,
            construction_teams_service_1.ConstructionTeamsService,
            construction_progress_logs_service_1.ConstructionProgressLogsService,
        ],
        exports: [
            construction_projects_service_1.ConstructionProjectsService,
            construction_teams_service_1.ConstructionTeamsService,
            construction_progress_logs_service_1.ConstructionProgressLogsService,
        ],
    })
], ConstructionModule);
//# sourceMappingURL=construction.module.js.map