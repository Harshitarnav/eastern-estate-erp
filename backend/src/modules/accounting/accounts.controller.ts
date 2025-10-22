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
} from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { CreateAccountDto, UpdateAccountDto } from './dto/create-account.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AccountType } from './entities/account.entity';

@Controller('accounting/accounts')
@UseGuards(JwtAuthGuard)
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post()
  create(@Body() createAccountDto: CreateAccountDto) {
    return this.accountsService.create(createAccountDto);
  }

  @Get()
  findAll(
    @Query('accountType') accountType?: AccountType,
    @Query('isActive') isActive?: string,
  ) {
    return this.accountsService.findAll({
      accountType,
      isActive: isActive ? isActive === 'true' : undefined,
    });
  }

  @Get('hierarchy')
  getHierarchy() {
    return this.accountsService.getAccountHierarchy();
  }

  @Get('balance-sheet')
  getBalanceSheet() {
    return this.accountsService.getBalanceSheet();
  }

  @Get('profit-loss')
  getProfitAndLoss() {
    return this.accountsService.getProfitAndLoss();
  }

  @Get('code/:code')
  findByCode(@Param('code') code: string) {
    return this.accountsService.findByCode(code);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.accountsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAccountDto: UpdateAccountDto) {
    return this.accountsService.update(id, updateAccountDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.accountsService.remove(id);
  }
}
