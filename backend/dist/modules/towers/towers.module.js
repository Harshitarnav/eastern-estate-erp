"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TowersModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const towers_controller_1 = require("./towers.controller");
const towers_service_1 = require("./towers.service");
const tower_entity_1 = require("./entities/tower.entity");
const property_entity_1 = require("../properties/entities/property.entity");
const flat_entity_1 = require("../flats/entities/flat.entity");
const towers_schema_sync_service_1 = require("./towers.schema-sync.service");
const booking_entity_1 = require("../bookings/entities/booking.entity");
const construction_project_entity_1 = require("../construction/entities/construction-project.entity");
let TowersModule = class TowersModule {
};
exports.TowersModule = TowersModule;
exports.TowersModule = TowersModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([tower_entity_1.Tower, property_entity_1.Property, flat_entity_1.Flat, booking_entity_1.Booking, construction_project_entity_1.ConstructionProject]),
        ],
        controllers: [towers_controller_1.TowersController],
        providers: [towers_service_1.TowersService, towers_schema_sync_service_1.TowersSchemaSyncService],
        exports: [towers_service_1.TowersService],
    })
], TowersModule);
//# sourceMappingURL=towers.module.js.map