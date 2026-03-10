import { Controller, Get, Patch, Post, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/constants/roles.constant';
import { SettingsService } from './settings.service';
import { CompanySettings } from './entities/company-settings.entity';

@Controller('settings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  /** Any authenticated user can read company settings (needed for PDFs/drafts on frontend) */
  @Get('company')
  async getCompanySettings(): Promise<Omit<CompanySettings, 'smtpPass'>> {
    const s = await this.settingsService.get();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { smtpPass: _omit, ...safe } = s as any;
    return safe;
  }

  /** Only admins can update settings */
  @Patch('company')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async updateCompanySettings(
    @Body() dto: Partial<CompanySettings>,
  ): Promise<Omit<CompanySettings, 'smtpPass'>> {
    const s = await this.settingsService.update(dto);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { smtpPass: _omit, ...safe } = s as any;
    return safe;
  }

  /**
   * Send a test email using the current SMTP configuration.
   * Body: { to: string, subject?: string, message?: string }
   */
  @Post('company/test-email')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async testEmail(@Body() body: { to: string; subject?: string; message?: string }) {
    return this.settingsService.testEmail(body.to, body.subject, body.message);
  }
}
