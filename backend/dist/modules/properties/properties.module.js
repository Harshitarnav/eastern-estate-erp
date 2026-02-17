"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PropertiesModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const properties_service_1 = require("./properties.service");
const properties_controller_1 = require("./properties.controller");
const property_entity_1 = require("./entities/property.entity");
const tower_entity_1 = require("../towers/entities/tower.entity");
const flat_entity_1 = require("../flats/entities/flat.entity");
const customer_entity_1 = require("../customers/entities/customer.entity");
const booking_entity_1 = require("../bookings/entities/booking.entity");
const properties_schema_sync_service_1 = require("./properties.schema-sync.service");
const users_module_1 = require("../users/users.module");
let PropertiesModule = class PropertiesModule {
};
exports.PropertiesModule = PropertiesModule;
exports.PropertiesModule = PropertiesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([property_entity_1.Property, tower_entity_1.Tower, flat_entity_1.Flat, customer_entity_1.Customer, booking_entity_1.Booking]),
            users_module_1.UsersModule,
        ],
        controllers: [properties_controller_1.PropertiesController],
        providers: [properties_service_1.PropertiesService, properties_schema_sync_service_1.PropertiesSchemaSyncService],
        exports: [properties_service_1.PropertiesService, typeorm_1.TypeOrmModule],
    })
], PropertiesModule);
//# sourceMappingURL=properties.module.js.map