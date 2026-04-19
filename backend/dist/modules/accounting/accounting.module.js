"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountingModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const account_entity_1 = require("./entities/account.entity");
const journal_entry_entity_1 = require("./entities/journal-entry.entity");
const journal_entry_line_entity_1 = require("./entities/journal-entry-line.entity");
const expense_entity_1 = require("./entities/expense.entity");
const budget_entity_1 = require("./entities/budget.entity");
const fiscal_year_entity_1 = require("./entities/fiscal-year.entity");
const bank_account_entity_1 = require("./entities/bank-account.entity");
const bank_statement_entity_1 = require("./entities/bank-statement.entity");
const accounting_service_1 = require("./accounting.service");
const accounts_service_1 = require("./accounts.service");
const expenses_service_1 = require("./expenses.service");
const budgets_service_1 = require("./budgets.service");
const journal_entries_service_1 = require("./journal-entries.service");
const bank_accounts_service_1 = require("./bank-accounts.service");
const bank_statements_service_1 = require("./bank-statements.service");
const accounting_controller_1 = require("./accounting.controller");
const accounts_controller_1 = require("./accounts.controller");
const expenses_controller_1 = require("./expenses.controller");
const budgets_controller_1 = require("./budgets.controller");
const journal_entries_controller_1 = require("./journal-entries.controller");
const bank_accounts_controller_1 = require("./bank-accounts.controller");
const bank_statements_controller_1 = require("./bank-statements.controller");
const accounting_integration_service_1 = require("./accounting-integration.service");
const property_entity_1 = require("../properties/entities/property.entity");
let AccountingModule = class AccountingModule {
};
exports.AccountingModule = AccountingModule;
exports.AccountingModule = AccountingModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                account_entity_1.Account,
                journal_entry_entity_1.JournalEntry,
                journal_entry_line_entity_1.JournalEntryLine,
                expense_entity_1.Expense,
                budget_entity_1.Budget,
                fiscal_year_entity_1.FiscalYear,
                bank_account_entity_1.BankAccount,
                bank_statement_entity_1.BankStatement,
                property_entity_1.Property,
            ]),
        ],
        controllers: [
            accounting_controller_1.AccountingController,
            accounts_controller_1.AccountsController,
            expenses_controller_1.ExpensesController,
            budgets_controller_1.BudgetsController,
            journal_entries_controller_1.JournalEntriesController,
            bank_accounts_controller_1.BankAccountsController,
            bank_statements_controller_1.BankStatementsController,
        ],
        providers: [
            accounting_service_1.AccountingService,
            accounts_service_1.AccountsService,
            expenses_service_1.ExpensesService,
            budgets_service_1.BudgetsService,
            journal_entries_service_1.JournalEntriesService,
            bank_accounts_service_1.BankAccountsService,
            bank_statements_service_1.BankStatementsService,
            accounting_integration_service_1.AccountingIntegrationService,
        ],
        exports: [
            accounting_service_1.AccountingService,
            accounts_service_1.AccountsService,
            expenses_service_1.ExpensesService,
            budgets_service_1.BudgetsService,
            journal_entries_service_1.JournalEntriesService,
            bank_accounts_service_1.BankAccountsService,
            bank_statements_service_1.BankStatementsService,
            accounting_integration_service_1.AccountingIntegrationService,
        ],
    })
], AccountingModule);
//# sourceMappingURL=accounting.module.js.map