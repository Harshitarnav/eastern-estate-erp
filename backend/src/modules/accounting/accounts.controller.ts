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
  ForbiddenException,
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
  resolveAccountingReportScope,
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

  /**
   * Bulk-import Chart of Accounts rows produced by the Excel import modal.
   * The frontend parses the workbook and POSTs JSON rows here so we can validate centrally.
   */
  @Post('bulk-import')
  bulkImport(
    @Body()
    body: {
      propertyId?: string | null;
      rows: Array<{
        accountCode: string;
        accountName: string;
        accountType: string;
        accountCategory: string;
        description?: string;
        openingBalance?: number;
      }>;
    },
    @Req() req: Request,
  ) {
    const targetPid = body.propertyId || null;
    if (targetPid && !(req as any).isGlobalAdmin) {
      const ids = (req as any).accessiblePropertyIds || [];
      if (!ids.includes(targetPid)) {
        throw new ForbiddenException('You do not have access to this project');
      }
    }
    return this.accountsService.bulkImport(body.rows, targetPid);
  }

  @Get()
  findAll(
    @Req() req: Request,
    @Query('accountType') accountType?: AccountType,
    @Query('isActive') isActive?: string,
    @Query('propertyId') propertyId?: string,
    @Query('projectOnlyCoa') projectOnlyCoa?: string,
  ) {
    const scopeIds = accessiblePropertyIdsOrThrow(req as any);
    return this.accountsService.findAll(
      {
        accountType,
        isActive: isActive ? isActive === 'true' : undefined,
        propertyId,
        projectOnlyCoa: projectOnlyCoa === 'true',
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
    const resolved = resolveAccountingReportScope(req as any, propertyId);
    return this.accountsService.getBalanceSheet(resolved);
  }

  @Get('profit-loss')
  getProfitAndLoss(
    @Req() req: Request,
    @Query('propertyId') propertyId: string | undefined,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const resolved = resolveAccountingReportScope(req as any, propertyId);
    return this.accountsService.getProfitAndLoss(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
      resolved,
    );
  }

  @Get('trial-balance')
  getTrialBalance(@Query('propertyId') propertyId: string | undefined, @Req() req: Request) {
    const resolved = resolveAccountingReportScope(req as any, propertyId);
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
  async findOne(
    @Param('id') id: string,
    @Query('propertyId') propertyId: string | undefined,
    @Req() req: Request,
  ) {
    if (propertyId && !(req as any).isGlobalAdmin) {
      const ids = (req as any).accessiblePropertyIds || [];
      if (!ids.includes(propertyId)) {
        throw new ForbiddenException('You do not have access to this project');
      }
    }
    const acc = await this.accountsService.findOne(id, propertyId);
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
