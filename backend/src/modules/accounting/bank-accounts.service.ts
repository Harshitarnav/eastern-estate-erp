import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BankAccount } from './entities/bank-account.entity';

@Injectable()
export class BankAccountsService {
  constructor(
    @InjectRepository(BankAccount)
    private readonly bankAccountsRepo: Repository<BankAccount>,
  ) {}

  findAll(): Promise<BankAccount[]> {
    return this.bankAccountsRepo.find({ order: { createdAt: 'ASC' } });
  }

  async findOne(id: string): Promise<BankAccount> {
    const account = await this.bankAccountsRepo.findOne({ where: { id } });
    if (!account) throw new NotFoundException(`Bank account ${id} not found`);
    return account;
  }

  async create(dto: {
    accountName: string;
    bankName: string;
    accountNumber: string;
    ifscCode?: string;
    branchName?: string;
    accountType?: string;
    openingBalance?: number;
    description?: string;
  }): Promise<BankAccount> {
    const ob = Number(dto.openingBalance) || 0;
    const account = this.bankAccountsRepo.create({
      accountName: dto.accountName,
      bankName: dto.bankName,
      accountNumber: dto.accountNumber,
      ifscCode: dto.ifscCode,
      branchName: dto.branchName,
      accountType: dto.accountType || 'Current',
      openingBalance: ob,
      currentBalance: ob,
      description: dto.description,
    });
    return this.bankAccountsRepo.save(account);
  }

  async update(id: string, dto: Partial<BankAccount>): Promise<BankAccount> {
    const account = await this.findOne(id);
    Object.assign(account, dto);
    return this.bankAccountsRepo.save(account);
  }

  async deactivate(id: string): Promise<BankAccount> {
    const account = await this.findOne(id);
    account.isActive = false;
    return this.bankAccountsRepo.save(account);
  }
}
