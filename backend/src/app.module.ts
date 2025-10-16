import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { PropertiesModule } from './modules/properties/properties.module';
import { TowersModule } from './modules/towers/towers.module';
import { FlatsModule } from './modules/flats/flats.module';
import { CustomersModule } from './modules/customers/customers.module';
import { LeadsModule } from './modules/leads/leads.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { ConstructionModule } from './modules/construction/construction.module';
import { StoreModule } from './modules/store/store.module';
import { EmployeesModule } from './modules/employees/employees.module';
import { HrModule } from './modules/hr/hr.module';
import { MarketingModule } from './modules/marketing/marketing.module';
import { ReportsModule } from './modules/reports/reports.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AccountingModule } from './modules/accounting/accounting.module';
import { PurchaseOrdersModule } from './modules/purchase-orders/purchase-orders.module';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { UploadModule } from './common/upload/upload.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: +configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        // synchronize: configService.get('DB_SYNCHRONIZE') === 'true',
        synchronize: false, // ✅ Move inside and set to false
        logging: configService.get('DB_LOGGING') === 'true',
        ssl: configService.get('DB_SSL') === 'true' ? { rejectUnauthorized: false } : false,
        namingStrategy: new SnakeNamingStrategy(), // Add this line
        // migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
        // migrationsRun: true,
      }),
      inject: [ConfigService],      
    }),
    AuthModule,
    UsersModule,
    PropertiesModule,
    TowersModule,
    FlatsModule,
    CustomersModule,
    LeadsModule,
    BookingsModule,
    PaymentsModule,
    InventoryModule,
    ConstructionModule,
    StoreModule,
    EmployeesModule,
    HrModule,
    MarketingModule,
    ReportsModule,
    NotificationsModule,
    AccountingModule,
    PurchaseOrdersModule,
    UploadModule,
  ],
})
export class AppModule {}
