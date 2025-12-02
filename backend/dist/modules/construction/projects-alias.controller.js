"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectsAliasController = void 0;
const common_1 = require("@nestjs/common");
const construction_projects_service_1 = require("./construction-projects.service");
const create_construction_project_dto_1 = require("./dto/create-construction-project.dto");
const update_construction_project_dto_1 = require("./dto/update-construction-project.dto");
let ProjectsAliasController = class ProjectsAliasController {
    constructor(constructionProjectsService) {
        this.constructionProjectsService = constructionProjectsService;
    }
    create(createDto) {
        return this.constructionProjectsService.create(createDto);
    }
    findAll(propertyId) {
        return this.constructionProjectsService.findAll(propertyId);
    }
    getByProperty(propertyId) {
        return this.constructionProjectsService.getByProperty(propertyId);
    }
    findOne(id) {
        return this.constructionProjectsService.findOne(id);
    }
    update(id, updateDto) {
        return this.constructionProjectsService.update(id, updateDto);
    }
    remove(id) {
        return this.constructionProjectsService.remove(id);
    }
};
exports.ProjectsAliasController = ProjectsAliasController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_construction_project_dto_1.CreateConstructionProjectDto]),
    __metadata("design:returntype", void 0)
], ProjectsAliasController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('propertyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProjectsAliasController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('property/:propertyId'),
    __param(0, (0, common_1.Param)('propertyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProjectsAliasController.prototype, "getByProperty", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProjectsAliasController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_construction_project_dto_1.UpdateConstructionProjectDto]),
    __metadata("design:returntype", void 0)
], ProjectsAliasController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProjectsAliasController.prototype, "remove", null);
exports.ProjectsAliasController = ProjectsAliasController = __decorate([
    (0, common_1.Controller)('projects'),
    __metadata("design:paramtypes", [construction_projects_service_1.ConstructionProjectsService])
], ProjectsAliasController);
//# sourceMappingURL=projects-alias.controller.js.map