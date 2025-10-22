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
exports.ConstructionTeamsController = void 0;
const common_1 = require("@nestjs/common");
const construction_teams_service_1 = require("./construction-teams.service");
let ConstructionTeamsController = class ConstructionTeamsController {
    constructor(constructionTeamsService) {
        this.constructionTeamsService = constructionTeamsService;
    }
    create(createDto) {
        return this.constructionTeamsService.create(createDto);
    }
    findByProject(projectId) {
        return this.constructionTeamsService.findByProject(projectId);
    }
    findOne(id) {
        return this.constructionTeamsService.findOne(id);
    }
    update(id, updateDto) {
        return this.constructionTeamsService.update(id, updateDto);
    }
    remove(id) {
        return this.constructionTeamsService.remove(id);
    }
};
exports.ConstructionTeamsController = ConstructionTeamsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ConstructionTeamsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('project/:projectId'),
    __param(0, (0, common_1.Param)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ConstructionTeamsController.prototype, "findByProject", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ConstructionTeamsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ConstructionTeamsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ConstructionTeamsController.prototype, "remove", null);
exports.ConstructionTeamsController = ConstructionTeamsController = __decorate([
    (0, common_1.Controller)('construction-teams'),
    __metadata("design:paramtypes", [construction_teams_service_1.ConstructionTeamsService])
], ConstructionTeamsController);
//# sourceMappingURL=construction-teams.controller.js.map