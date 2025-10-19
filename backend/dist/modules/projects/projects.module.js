"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const projects_controller_1 = require("./projects.controller");
const projects_service_1 = require("./projects.service");
const project_entity_1 = require("./entities/project.entity");
const property_entity_1 = require("../properties/entities/property.entity");
const projects_schema_sync_service_1 = require("./projects.schema-sync.service");
let ProjectsModule = class ProjectsModule {
};
exports.ProjectsModule = ProjectsModule;
exports.ProjectsModule = ProjectsModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([project_entity_1.Project, property_entity_1.Property])],
        controllers: [projects_controller_1.ProjectsController],
        providers: [projects_service_1.ProjectsService, projects_schema_sync_service_1.ProjectsSchemaSyncService],
        exports: [projects_service_1.ProjectsService, typeorm_1.TypeOrmModule],
    })
], ProjectsModule);
//# sourceMappingURL=projects.module.js.map