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
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./modules/users/users.module");
const properties_module_1 = require("./modules/properties/properties.module");
const towers_module_1 = require("./modules/towers/towers.module");
const flats_module_1 = require("./modules/flats/flats.module");
const customers_module_1 = require("./modules/customers/customers.module");
const leads_module_1 = require("./modules/leads/leads.module");
const bookings_module_1 = require("./modules/bookings/bookings.module");
const payments_module_1 = require("./modules/payments/payments.module");
const inventory_module_1 = require("./modules/inventory/inventory.module");
const construction_module_1 = require("./modules/construction/construction.module");
const store_module_1 = require("./modules/store/store.module");
const employees_module_1 = require("./modules/employees/employees.module");
const hr_module_1 = require("./modules/hr/hr.module");
const marketing_module_1 = require("./modules/marketing/marketing.module");
const reports_module_1 = require("./modules/reports/reports.module");
const notifications_module_1 = require("./modules/notifications/notifications.module");
const accounting_module_1 = require("./modules/accounting/accounting.module");
const purchase_orders_module_1 = require("./modules/purchase-orders/purchase-orders.module");
const typeorm_naming_strategies_1 = require("typeorm-naming-strategies");
const upload_module_1 = require("./common/upload/upload.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: (configService) => ({
                    type: 'postgres',
                    host: configService.get('DB_HOST'),
                    port: +configService.get('DB_PORT'),
                    username: configService.get('DB_USERNAME'),
                    password: configService.get('DB_PASSWORD'),
                    database: configService.get('DB_DATABASE'),
                    entities: [__dirname + '/**/*.entity{.ts,.js}'],
                    synchronize: false,
                    logging: configService.get('DB_LOGGING') === 'true',
                    ssl: configService.get('DB_SSL') === 'true' ? { rejectUnauthorized: false } : false,
                    namingStrategy: new typeorm_naming_strategies_1.SnakeNamingStrategy(),
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
            inventory_module_1.InventoryModule,
            construction_module_1.ConstructionModule,
            store_module_1.StoreModule,
            employees_module_1.EmployeesModule,
            hr_module_1.HrModule,
            marketing_module_1.MarketingModule,
            reports_module_1.ReportsModule,
            notifications_module_1.NotificationsModule,
            accounting_module_1.AccountingModule,
            purchase_orders_module_1.PurchaseOrdersModule,
            upload_module_1.UploadModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map