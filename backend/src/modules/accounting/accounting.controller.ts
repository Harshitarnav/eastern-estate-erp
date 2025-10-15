import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { AccountingService } from './accounting.service';

@Controller('accounting')
export class AccountingController {
  constructor(private readonly accountingService: AccountingService) {}

  // ============ ACCOUNTS ============
  @Post('accounts')
  createAccount(@Body() data: any) {
    return this.accountingService.createAccount(data);
  }

  @Get('accounts')
  getAllAccounts() {
    return this.accountingService.getAllAccounts();
  }

  @Get('accounts/:id')
  getAccountById(@Param('id') id: string) {
    return this.accountingService.getAccountById(id);
  }

  @Put('accounts/:id')
  updateAccount(@Param('id') id: string, @Body() data: any) {
    return this.accountingService.updateAccount(id, data);
  }

  // ============ JOURNAL ENTRIES ============
  @Post('journal-entries')
  createJournalEntry(@Body() data: any) {
    return this.accountingService.createJournalEntry(data);
  }

  @Get('journal-entries/:id')
  getJournalEntryById(@Param('id') id: string) {
    return this.accountingService.getJournalEntryById(id);
  }

  @Get('journal-entries/:id/lines')
  getJournalEntryLines(@Param('id') id: string) {
    return this.accountingService.getJournalEntryLines(id);
  }

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

  // ============ ITR EXPORTS ============
  @Get('exports/itr')
  exportForITR(@Query('financialYear') financialYear: string) {
    return this.accountingService.exportForITR(financialYear);
  }

  // ============ BANK ACCOUNTS ============
  @Post('bank-accounts')
  createBankAccount(@Body() data: any) {
    return this.accountingService.createBankAccount(data);
  }

  @Get('bank-accounts')
  getAllBankAccounts() {
    return this.accountingService.getAllBankAccounts();
  }

  @Get('bank-accounts/:id')
  getBankAccountById(@Param('id') id: string) {
    return this.accountingService.getBankAccountById(id);
  }

  // ============ BANK STATEMENTS & RECONCILIATION ============
  @Post('bank-statements/upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadBankStatement(
    @Body() data: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.accountingService.uploadBankStatement(data, file);
  }

  @Get('bank-statements/unreconciled/:bankAccountId')
  getUnreconciledTransactions(@Param('bankAccountId') bankAccountId: string) {
    return this.accountingService.getUnreconciledTransactions(bankAccountId);
  }

  @Post('bank-statements/:statementId/reconcile')
  reconcileTransaction(
    @Param('statementId') statementId: string,
    @Body('journalEntryId') journalEntryId: string,
  ) {
    return this.accountingService.reconcileTransaction(statementId, journalEntryId);
  }
}
