import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from './entities/account.entity';
import { JournalEntry } from './entities/journal-entry.entity';
import { JournalEntryLine } from './entities/journal-entry-line.entity';
import { Expense } from './entities/expense.entity';
import { Budget } from './entities/budget.entity';
import { FiscalYear } from './entities/fiscal-year.entity';
import { AccountsService } from './accounts.service';
import { ExpensesService } from './expenses.service';
import { BudgetsService } from './budgets.service';
import { JournalEntriesService } from './journal-entries.service';
import { AccountsController } from './accounts.controller';
import { ExpensesController } from './expenses.controller';
import { BudgetsController } from './budgets.controller';
import { JournalEntriesController } from './journal-entries.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Account,
      JournalEntry,
      JournalEntryLine,
      Expense,
      Budget,
      FiscalYear,
    ]),
  ],
  controllers: [
    AccountsController,
    ExpensesController,
    BudgetsController,
    JournalEntriesController,
  ],
  providers: [
    AccountsService,
    ExpensesService,
    BudgetsService,
    JournalEntriesService,
  ],
  exports: [
    AccountsService,
    ExpensesService,
    BudgetsService,
    JournalEntriesService,
  ],
})
export class AccountingModule {}
