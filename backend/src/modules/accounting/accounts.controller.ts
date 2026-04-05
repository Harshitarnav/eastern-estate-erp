import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { AccountsService } from './accounts.service';
import { AccountingService } from './accounting.service';
import { CreateAccountDto, UpdateAccountDto } from './dto/create-account.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AccountType } from './entities/account.entity';
import {
  accessiblePropertyIdsOrThrow,
  assertAccountReadable,
  resolveAccountingPropertyScope,
} from './utils/accounting-scope.util';

@Controller('accounting/accounts')
@UseGuards(JwtAuthGuard)
export class AccountsController {
  constructor(
    private readonly accountsService: AccountsService,
    private readonly accountingService: AccountingService,
  ) {}

  @Post()
  create(@Body() createAccountDto: CreateAccountDto) {
    return this.accountsService.create(createAccountDto);
  }

  @Post('seed-for-project/:propertyId')
  seedCoaForProject(@Param('propertyId') propertyId: string) {
    return this.accountingService.seedCoaForProject(propertyId);
  }

  @Get()
  findAll(
    @Req() req: Request,
    @Query('accountType') accountType?: AccountType,
    @Query('isActive') isActive?: string,
    @Query('propertyId') propertyId?: string,
  ) {
    const scopeIds = accessiblePropertyIdsOrThrow(req as any);
    return this.accountsService.findAll(
      {
        accountType,
        isActive: isActive ? isActive === 'true' : undefined,
        propertyId,
      },
      scopeIds,
    );
  }

  @Get('hierarchy')
  getHierarchy(@Req() req: Request) {
    const scopeIds = accessiblePropertyIdsOrThrow(req as any);
    return this.accountsService.getAccountHierarchy(scopeIds);
  }

  @Get('balance-sheet')
  getBalanceSheet(@Query('propertyId') propertyId: string | undefined, @Req() req: Request) {
    const resolved = resolveAccountingPropertyScope(req as any, propertyId);
    return this.accountsService.getBalanceSheet(resolved);
  }

  @Get('profit-loss')
  getProfitAndLoss(
    @Req() req: Request,
    @Query('propertyId') propertyId: string | undefined,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const resolved = resolveAccountingPropertyScope(req as any, propertyId);
    return this.accountsService.getProfitAndLoss(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
      resolved,
    );
  }

  @Get('trial-balance')
  getTrialBalance(@Query('propertyId') propertyId: string | undefined, @Req() req: Request) {
    const resolved = resolveAccountingPropertyScope(req as any, propertyId);
    return this.accountsService.getTrialBalance(resolved);
  }

  @Get('property-pl')
  getPropertyWisePL(@Query('propertyId') propertyId: string, @Req() req: Request) {
    resolveAccountingPropertyScope(req as any, propertyId);
    return this.accountsService.getPropertyWisePL(propertyId);
  }

  @Get('code/:code')
  async findByCode(@Param('code') code: string, @Req() req: Request) {
    const acc = await this.accountsService.findByCode(code);
    assertAccountReadable(acc, req as any);
    return acc;
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: Request) {
    const acc = await this.accountsService.findOne(id);
    assertAccountReadable(acc, req as any);
    return acc;
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateAccountDto: UpdateAccountDto,
    @Req() req: Request,
  ) {
    const acc = await this.accountsService.findOne(id);
    assertAccountReadable(acc, req as any);
    return this.accountsService.update(id, updateAccountDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: Request) {
    const acc = await this.accountsService.findOne(id);
    assertAccountReadable(acc, req as any);
    return this.accountsService.remove(id);
  }
}
