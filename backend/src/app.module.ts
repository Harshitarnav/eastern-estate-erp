import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { PropertiesModule } from './modules/properties/properties.module';
import { TowersModule } from './modules/towers/towers.module';
import { FlatsModule } from './modules/flats/flats.module';
import { CustomersModule } from './modules/customers/customers.module';
import { LeadsModule } from './modules/leads/leads.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { EmployeesModule } from './modules/employees/employees.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ChatModule } from './modules/chat/chat.module';
import { AccountingModule } from './modules/accounting/accounting.module';
import { PurchaseOrdersModule } from './modules/purchase-orders/purchase-orders.module';
import { ConstructionModule } from './modules/construction/construction.module';
import { MaterialsModule } from './modules/materials/materials.module';
import { VendorsModule } from './modules/vendors/vendors.module';
import { MarketingModule } from './modules/marketing/marketing.module';
import { RolesModule } from './modules/roles/roles.module';
// import { TelephonyModule } from './modules/telephony/telephony.module'; // Temporarily disabled
import { TelephonySimpleModule } from './modules/telephony-simple/telephony-simple.module';
import { DemandDraftsModule } from './modules/demand-drafts/demand-drafts.module';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { UploadModule } from './common/upload/upload.module';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { ThrottlerGuard, ThrottlerModule, ThrottlerModuleOptions } from '@nestjs/throttler';
import configuration from './config/configuration';
import { validationSchema } from './config/validation';
import { SchemaSyncService } from './database/schema-sync.service';

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
    UsersModule,
    PropertiesModule,
    TowersModule,
    FlatsModule,
    CustomersModule,
    LeadsModule,
    BookingsModule,
    PaymentsModule,
    EmployeesModule,
    NotificationsModule,
    ChatModule,
    AccountingModule,
    PurchaseOrdersModule,
    ConstructionModule,
    MaterialsModule,
    VendorsModule,
    MarketingModule,
    RolesModule,
    // TelephonyModule, // Temporarily disabled - using simple version instead
    TelephonySimpleModule,
    DemandDraftsModule,
    UploadModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    SchemaSyncService,
  ],
})
export class AppModule {}
