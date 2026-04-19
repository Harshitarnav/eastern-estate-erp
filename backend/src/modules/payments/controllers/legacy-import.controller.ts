import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import {
  LegacyImportPayload,
  LegacyImportPreview,
  LegacyImportResult,
  LegacyImportService,
} from '../services/legacy-import.service';
import { OverdueScannerService } from '../services/overdue-scanner.service';
import { Roles } from '../../../auth/decorators/roles.decorator';

/**
 * Legacy import endpoints.
 *
 * Scope (PR1, backend-only):
 *   POST /legacy-import/preview  - dry-run validation
 *   POST /legacy-import/commit   - actually create the records
 *   POST /legacy-import/scan-overdues - manually trigger the scanner
 *
 * Only admin and super_admin roles can use these. The CSV upload UI that
 * calls preview/commit is PR2.
 */
@Controller('legacy-import')
export class LegacyImportController {
  constructor(
    private readonly importService: LegacyImportService,
    private readonly overdueScanner: OverdueScannerService,
  ) {}

  @Post('preview')
  @Roles('admin', 'super_admin')
  @HttpCode(HttpStatus.OK)
  async preview(
    @Body() payload: LegacyImportPayload,
  ): Promise<LegacyImportPreview> {
    return this.importService.preview(payload);
  }

  @Post('commit')
  @Roles('admin', 'super_admin')
  @HttpCode(HttpStatus.CREATED)
  async commit(
    @Body() payload: LegacyImportPayload,
    @Req() req: Request,
  ): Promise<LegacyImportResult> {
    const actorId = (req as any).user?.id ?? null;
    return this.importService.commit(payload, actorId);
  }

  /**
   * Manually trigger the daily overdue scanner. Useful for:
   *   - ops verifying the scanner works before 09:00 IST,
   *   - testing a just-committed legacy batch,
   *   - catch-up runs after downtime.
   */
  @Post('scan-overdues')
  @Roles('admin', 'super_admin')
  @HttpCode(HttpStatus.OK)
  async manualScan() {
    return this.overdueScanner.runScan();
  }
}
