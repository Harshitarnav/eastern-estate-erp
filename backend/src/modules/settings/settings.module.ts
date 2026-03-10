import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanySettings } from './entities/company-settings.entity';
import { SettingsService } from './settings.service';
import { SettingsController } from './settings.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CompanySettings])],
  controllers: [SettingsController],
  providers: [SettingsService],
  exports: [SettingsService],   // exported so MailService + DraftService can inject it
})
export class SettingsModule {}
