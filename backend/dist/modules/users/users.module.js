"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const users_service_1 = require("./users.service");
const users_controller_1 = require("./users.controller");
const user_entity_1 = require("./entities/user.entity");
const role_entity_1 = require("./entities/role.entity");
const permission_entity_1 = require("./entities/permission.entity");
const user_property_access_entity_1 = require("./entities/user-property-access.entity");
const property_role_template_entity_1 = require("./entities/property-role-template.entity");
const users_bootstrap_1 = require("./users.bootstrap");
const property_access_service_1 = require("./services/property-access.service");
const property_access_controller_1 = require("./controllers/property-access.controller");
const property_entity_1 = require("../properties/entities/property.entity");
const notifications_module_1 = require("../notifications/notifications.module");
let UsersModule = class UsersModule {
};
exports.UsersModule = UsersModule;
exports.UsersModule = UsersModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                user_entity_1.User,
                role_entity_1.Role,
                permission_entity_1.Permission,
                user_property_access_entity_1.UserPropertyAccess,
                property_role_template_entity_1.PropertyRoleTemplate,
                property_entity_1.Property,
            ]),
            notifications_module_1.NotificationsModule,
        ],
        controllers: [
            users_controller_1.UsersController,
            users_controller_1.RolesController,
            users_controller_1.PermissionsController,
            property_access_controller_1.PropertyAccessController,
        ],
        providers: [users_service_1.UsersService, users_bootstrap_1.UsersBootstrapService, property_access_service_1.PropertyAccessService],
        exports: [users_service_1.UsersService, property_access_service_1.PropertyAccessService, typeorm_1.TypeOrmModule],
    })
], UsersModule);
//# sourceMappingURL=users.module.js.map