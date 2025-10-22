"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MaterialsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const material_entity_1 = require("./entities/material.entity");
const material_entry_entity_1 = require("./entities/material-entry.entity");
const material_exit_entity_1 = require("./entities/material-exit.entity");
const materials_service_1 = require("./materials.service");
const material_entries_service_1 = require("./material-entries.service");
const material_exits_service_1 = require("./material-exits.service");
const materials_controller_1 = require("./materials.controller");
const material_entries_controller_1 = require("./material-entries.controller");
const material_exits_controller_1 = require("./material-exits.controller");
let MaterialsModule = class MaterialsModule {
};
exports.MaterialsModule = MaterialsModule;
exports.MaterialsModule = MaterialsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([material_entity_1.Material, material_entry_entity_1.MaterialEntry, material_exit_entity_1.MaterialExit]),
        ],
        controllers: [
            materials_controller_1.MaterialsController,
            material_entries_controller_1.MaterialEntriesController,
            material_exits_controller_1.MaterialExitsController,
        ],
        providers: [
            materials_service_1.MaterialsService,
            material_entries_service_1.MaterialEntriesService,
            material_exits_service_1.MaterialExitsService,
        ],
        exports: [
            materials_service_1.MaterialsService,
            material_entries_service_1.MaterialEntriesService,
            material_exits_service_1.MaterialExitsService,
        ],
    })
], MaterialsModule);
//# sourceMappingURL=materials.module.js.map