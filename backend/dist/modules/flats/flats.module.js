"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlatsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const flats_controller_1 = require("./flats.controller");
const flats_service_1 = require("./flats.service");
const flat_entity_1 = require("./entities/flat.entity");
const flats_schema_sync_service_1 = require("./flats.schema-sync.service");
const tower_entity_1 = require("../towers/entities/tower.entity");
let FlatsModule = class FlatsModule {
};
exports.FlatsModule = FlatsModule;
exports.FlatsModule = FlatsModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([flat_entity_1.Flat, tower_entity_1.Tower])],
        controllers: [flats_controller_1.FlatsController],
        providers: [flats_service_1.FlatsService, flats_schema_sync_service_1.FlatsSchemaSyncService],
        exports: [flats_service_1.FlatsService],
    })
], FlatsModule);
//# sourceMappingURL=flats.module.js.map