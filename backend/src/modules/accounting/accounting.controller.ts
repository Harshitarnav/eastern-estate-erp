import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
  Res,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { AccountingService } from './accounting.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('accounting')
@UseGuards(JwtAuthGuard)
export class AccountingController {
  constructor(private readonly accountingService: AccountingService) {}

  // NOTE: Journal entry CRUD is handled by JournalEntriesController (/accounting/journal-entries/*)
  //       Only the Excel import endpoint lives here because it uses file upload middleware.

  // ============ LEDGER REPORTS ============
  @Get('ledgers/account/:id')
  getAccountLedger(
    @Param('id') id: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.accountingService.getAccountLedger(
      id,
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('ledgers/weekly')
  getWeeklyLedger(@Query('week') week: number, @Query('year') year: number) {
    return this.accountingService.getWeeklyLedger(week, year);
  }

  @Get('ledgers/cash-book')
  getCashBook(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.accountingService.getCashBook(
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('ledgers/bank-book/:bankAccountId')
  getBankBook(
    @Param('bankAccountId') bankAccountId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.accountingService.getBankBook(
      bankAccountId,
      new Date(startDate),
      new Date(endDate),
    );
  }

  // ============ EXCEL IMPORT/EXPORT ============
  @Post('journal-entries/import-excel')
  @UseInterceptors(FileInterceptor('file'))
  async importJournalEntriesFromExcel(@UploadedFile() file: Express.Multer.File) {
    return this.accountingService.importJournalEntriesFromExcel(file.buffer);
  }

  @Get('exports/ledger/:accountId')
  async exportLedgerToExcel(
    @Param('accountId') accountId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Res() res: Response,
  ) {
    const buffer = await this.accountingService.exportLedgerToExcel(
      accountId,
      new Date(startDate),
      new Date(endDate),
    );

    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename=ledger-${accountId}.xlsx`,
    });

    res.send(buffer);
  }

  @Get('exports/trial-balance')
  async exportTrialBalanceToExcel(
    @Query('date') date: string,
    @Res() res: Response,
  ) {
    const buffer = await this.accountingService.exportTrialBalanceToExcel(
      new Date(date),
    );

    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename=trial-balance-${date}.xlsx`,
    });

    res.send(buffer);
  }

  // ============ PROPERTY-WISE P&L ============
  @Get('reports/property-wise-pl')
  getPropertyWisePL(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), 0, 1);
    const end = endDate ? new Date(endDate) : new Date();
    return this.accountingService.getPropertyWisePL(start, end);
  }

  // ============ AR AGING ============
  @Get('reports/ar-aging')
  getARAgingReport(@Query('asOf') asOf?: string) {
    const date = asOf ? new Date(asOf) : new Date();
    return this.accountingService.getARAgingReport(date);
  }

  // ============ AP AGING ============
  @Get('reports/ap-aging')
  getAPAgingReport(@Query('asOf') asOf?: string) {
    const date = asOf ? new Date(asOf) : new Date();
    return this.accountingService.getAPAgingReport(date);
  }

  // ============ CASH FLOW STATEMENT ============
  @Get('reports/cash-flow')
  getCashFlowStatement(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), 0, 1);
    const end = endDate ? new Date(endDate) : new Date();
    return this.accountingService.getCashFlowStatement(start, end);
  }

  // ============ ITR EXPORTS ============
  @Get('exports/itr')
  exportForITR(@Query('financialYear') financialYear: string) {
    return this.accountingService.exportForITR(financialYear);
  }

  // NOTE: Bank accounts & bank statements are handled by
  //       BankAccountsController  (/accounting/bank-accounts/*)
  //       BankStatementsController (/accounting/bank-statements/*)
}
