import {
  Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards, Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { BankAccountsService } from './bank-accounts.service';
import {
  assertBankAccountReadable,
  resolveAccountingPropertyScope,
} from './utils/accounting-scope.util';

@Controller('accounting/bank-accounts')
@UseGuards(JwtAuthGuard)
export class BankAccountsController {
  constructor(private readonly service: BankAccountsService) {}

  @Get()
  findAll(@Query('propertyId') propertyId: string | undefined, @Req() req: Request) {
    const resolved = resolveAccountingPropertyScope(req as any, propertyId);
    return this.service.findAll(resolved);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: Request) {
    const ba = await this.service.findOne(id);
    assertBankAccountReadable(ba, req as any);
    return ba;
  }

  @Post()
  create(@Body() body: {
    accountName: string;
    bankName: string;
    accountNumber: string;
    ifscCode?: string;
    branchName?: string;
    accountType?: string;
    openingBalance?: number;
    description?: string;
    propertyId?: string;
  }) {
    return this.service.create(body);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: any, @Req() req: Request) {
    const ba = await this.service.findOne(id);
    assertBankAccountReadable(ba, req as any);
    return this.service.update(id, body);
  }

  @Patch(':id/deactivate')
  async deactivate(@Param('id') id: string, @Req() req: Request) {
    const ba = await this.service.findOne(id);
    assertBankAccountReadable(ba, req as any);
    return this.service.deactivate(id);
  }

  @Patch(':id/activate')
  async activate(@Param('id') id: string, @Req() req: Request) {
    const ba = await this.service.findOne(id);
    assertBankAccountReadable(ba, req as any);
    return this.service.activate(id);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Req() req: Request) {
    const ba = await this.service.findOne(id);
    assertBankAccountReadable(ba, req as any);
    return this.service.delete(id);
  }
}
