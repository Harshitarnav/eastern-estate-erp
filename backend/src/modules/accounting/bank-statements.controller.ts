import {
  Controller, Get, Post, Param, Body, UseGuards,
  UseInterceptors, UploadedFile, BadRequestException,
} from '@nestjs/common';
// memoryStorage keeps the file in RAM (file.buffer) instead of writing to disk
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { BankStatementsService } from './bank-statements.service';
import { memoryStorage } from 'multer';

@Controller('accounting/bank-statements')
@UseGuards(JwtAuthGuard)
export class BankStatementsController {
  constructor(private readonly service: BankStatementsService) {}

  /** All transactions for a bank account */
  @Get(':bankAccountId')
  findAll(@Param('bankAccountId') bankAccountId: string) {
    return this.service.findAll(bankAccountId);
  }

  /** Only unreconciled transactions */
  @Get('unreconciled/:bankAccountId')
  findUnreconciled(@Param('bankAccountId') bankAccountId: string) {
    return this.service.findUnreconciled(bankAccountId);
  }

  /** Upload Excel bank statement */
  @Post('upload')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body('bankAccountId') bankAccountId: string,
  ) {
    if (!file) throw new BadRequestException('No file uploaded. Ensure the form field is named "file".');
    if (!bankAccountId) throw new BadRequestException('bankAccountId is required');
    if (!file.originalname.match(/\.(xlsx|xls)$/i)) {
      throw new BadRequestException('Only Excel files (.xlsx / .xls) are accepted');
    }
    return this.service.uploadStatement(bankAccountId, file.buffer, file.originalname);
  }

  /** Match a statement line to a journal entry */
  @Post(':id/reconcile')
  reconcile(
    @Param('id') id: string,
    @Body('journalEntryId') journalEntryId: string,
  ) {
    if (!journalEntryId) throw new BadRequestException('journalEntryId is required');
    return this.service.reconcile(id, journalEntryId);
  }

  /** Remove reconciliation match */
  @Post(':id/unreconcile')
  unreconcile(@Param('id') id: string) {
    return this.service.unreconcile(id);
  }
}
