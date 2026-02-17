"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const schedule_1 = require("@nestjs/schedule");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./modules/users/users.module");
const properties_module_1 = require("./modules/properties/properties.module");
const towers_module_1 = require("./modules/towers/towers.module");
const flats_module_1 = require("./modules/flats/flats.module");
const customers_module_1 = require("./modules/customers/customers.module");
const leads_module_1 = require("./modules/leads/leads.module");
const bookings_module_1 = require("./modules/bookings/bookings.module");
const payments_module_1 = require("./modules/payments/payments.module");
const employees_module_1 = require("./modules/employees/employees.module");
const notifications_module_1 = require("./modules/notifications/notifications.module");
const chat_module_1 = require("./modules/chat/chat.module");
const accounting_module_1 = require("./modules/accounting/accounting.module");
const purchase_orders_module_1 = require("./modules/purchase-orders/purchase-orders.module");
const construction_module_1 = require("./modules/construction/construction.module");
const materials_module_1 = require("./modules/materials/materials.module");
const vendors_module_1 = require("./modules/vendors/vendors.module");
const marketing_module_1 = require("./modules/marketing/marketing.module");
const roles_module_1 = require("./modules/roles/roles.module");
const demand_drafts_module_1 = require("./modules/demand-drafts/demand-drafts.module");
const database_module_1 = require("./modules/database/database.module");
const payment_plans_module_1 = require("./modules/payment-plans/payment-plans.module");
const typeorm_naming_strategies_1 = require("typeorm-naming-strategies");
const upload_module_1 = require("./common/upload/upload.module");
const logging_interceptor_1 = require("./common/interceptors/logging.interceptor");
const throttler_1 = require("@nestjs/throttler");
const configuration_1 = require("./config/configuration");
const validation_1 = require("./config/validation");
const schema_sync_service_1 = require("./database/schema-sync.service");
const jwt_auth_guard_1 = require("./auth/guards/jwt-auth.guard");
const roles_guard_1 = require("./auth/guards/roles.guard");
const property_access_guard_1 = require("./common/guards/property-access.guard");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
                load: [configuration_1.default],
                validationSchema: validation_1.validationSchema,
                validationOptions: {
                    abortEarly: false,
                },
            }),
            schedule_1.ScheduleModule.forRoot(),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: (configService) => ({
                    type: 'postgres',
                    host: configService.getOrThrow('database.host'),
                    port: configService.getOrThrow('database.port'),
                    username: configService.getOrThrow('database.username'),
                    password: configService.get('database.password') ?? '',
                    database: configService.getOrThrow('database.name'),
                    entities: [__dirname + '/**/*.entity{.ts,.js}'],
                    synchronize: false,
                    logging: configService.get('database.logging') ?? false,
                    ssl: (configService.get('database.sslEnabled') ?? false)
                        ? { rejectUnauthorized: false }
                        : false,
                    namingStrategy: new typeorm_naming_strategies_1.SnakeNamingStrategy(),
                }),
                inject: [config_1.ConfigService],
            }),
            throttler_1.ThrottlerModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: (configService) => ({
                    throttlers: [
                        {
                            ttl: configService.getOrThrow('security.rateLimitTtl'),
                            limit: configService.getOrThrow('security.rateLimitMax'),
                        },
                    ],
                }),
                inject: [config_1.ConfigService],
            }),
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            properties_module_1.PropertiesModule,
            towers_module_1.TowersModule,
            flats_module_1.FlatsModule,
            customers_module_1.CustomersModule,
            leads_module_1.LeadsModule,
            bookings_module_1.BookingsModule,
            payments_module_1.PaymentsModule,
            employees_module_1.EmployeesModule,
            notifications_module_1.NotificationsModule,
            chat_module_1.ChatModule,
            accounting_module_1.AccountingModule,
            purchase_orders_module_1.PurchaseOrdersModule,
            construction_module_1.ConstructionModule,
            materials_module_1.MaterialsModule,
            vendors_module_1.VendorsModule,
            marketing_module_1.MarketingModule,
            roles_module_1.RolesModule,
            demand_drafts_module_1.DemandDraftsModule,
            database_module_1.DatabaseModule,
            payment_plans_module_1.PaymentPlansModule,
            upload_module_1.UploadModule,
        ],
        providers: [
            {
                provide: core_1.APP_GUARD,
                useClass: throttler_1.ThrottlerGuard,
            },
            {
                provide: core_1.APP_GUARD,
                useClass: jwt_auth_guard_1.JwtAuthGuard,
            },
            {
                provide: core_1.APP_GUARD,
                useClass: roles_guard_1.RolesGuard,
            },
            {
                provide: core_1.APP_GUARD,
                useClass: property_access_guard_1.PropertyAccessGuard,
            },
            {
                provide: core_1.APP_INTERCEPTOR,
                useClass: logging_interceptor_1.LoggingInterceptor,
            },
            schema_sync_service_1.SchemaSyncService,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map