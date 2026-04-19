import { Global, Module } from '@nestjs/common';
import { SmsService } from './sms.service';
import { SettingsModule } from '../../modules/settings/settings.module';

/**
 * Global SMS module. The default provider is a log-and-skip stub -
 * PR4 will swap in MSG91 (or whichever DLT-approved provider the
 * business chooses) by providing a subclass of SmsService here.
 */
@Global()
@Module({
  imports: [SettingsModule],
  providers: [SmsService],
  exports: [SmsService],
})
export class SmsModule {}
