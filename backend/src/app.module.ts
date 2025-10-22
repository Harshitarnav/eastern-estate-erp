import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { PropertiesModule } from './modules/properties/properties.module';
import { TowersModule } from './modules/towers/towers.module';
import { FlatsModule } from './modules/flats/flats.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { CustomersModule } from './modules/customers/customers.module';
import { LeadsModule } from './modules/leads/leads.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { InventoryModule } from './modules/inventory/inventory.module';
// import { ConstructionModule } from './modules/construction/construction.module'; // Removed - using existing construction module
import { StoreModule } from './modules/store/store.module';
import { EmployeesModule } from './modules/employees/employees.module';
import { HrModule } from './modules/hr/hr.module';
import { MarketingModule } from './modules/marketing/marketing.module';
import { ReportsModule } from './modules/reports/reports.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AccountingModule } from './modules/accounting/accounting.module';
import { PurchaseOrdersModule } from './modules/purchase-orders/purchase-orders.module';
import { ConstructionModule } from './modules/construction/construction.module';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { UploadModule } from './common/upload/upload.module';
import { ThrottlerGuard, ThrottlerModule, ThrottlerModuleOptions } from '@nestjs/throttler';
import configuration from './config/configuration';
import { validationSchema } from './config/validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [configuration],
      validationSchema,
      validationOptions: {
        abortEarly: false,
      },
    }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.getOrThrow<string>('database.host'),
        port: configService.getOrThrow<number>('database.port'),
        username: configService.getOrThrow<string>('database.username'),
        password: configService.get<string>('database.password') ?? '',
        database: configService.getOrThrow<string>('database.name'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        // synchronize: configService.get('DB_SYNCHRONIZE') === 'true',
        synchronize: false, // ✅ Set to false - manual schema management
        logging: configService.get<boolean>('database.logging') ?? false,
        ssl:
          (configService.get<boolean>('database.sslEnabled') ?? false)
            ? { rejectUnauthorized: false }
            : false,
        namingStrategy: new SnakeNamingStrategy(), // Add this line
        // migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
        // migrationsRun: true,
      }),
      inject: [ConfigService],      
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService): ThrottlerModuleOptions => ({
        throttlers: [
          {
            ttl: configService.getOrThrow<number>('security.rateLimitTtl'),
            limit: configService.getOrThrow<number>('security.rateLimitMax'),
          },
        ],
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    ProjectsModule,
    UsersModule,
    PropertiesModule,
    TowersModule,
    FlatsModule,
    CustomersModule,
    LeadsModule,
    BookingsModule,
    PaymentsModule,
    InventoryModule,
    // ConstructionModule, // Removed - conflicts with existing module
    StoreModule,
    EmployeesModule,
    HrModule,
    MarketingModule,
    ReportsModule,
    NotificationsModule,
    AccountingModule,
    PurchaseOrdersModule,
    ConstructionModule,
    UploadModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
