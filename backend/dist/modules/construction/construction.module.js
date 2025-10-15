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
const construction_controller_1 = require("./construction.controller");
const construction_service_1 = require("./construction.service");
const construction_project_entity_1 = require("./entities/construction-project.entity");
let ConstructionModule = class ConstructionModule {
};
exports.ConstructionModule = ConstructionModule;
exports.ConstructionModule = ConstructionModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([construction_project_entity_1.ConstructionProject])],
        controllers: [construction_controller_1.ConstructionController],
        providers: [construction_service_1.ConstructionService],
        exports: [construction_service_1.ConstructionService],
    })
], ConstructionModule);
//# sourceMappingURL=construction.module.js.map