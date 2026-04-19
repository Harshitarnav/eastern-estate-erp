import type { Request } from 'express';
import { AccountsService } from './accounts.service';
import { AccountingService } from './accounting.service';
import { CreateAccountDto, UpdateAccountDto } from './dto/create-account.dto';
import { AccountType } from './entities/account.entity';
export declare class AccountsController {
    private readonly accountsService;
    private readonly accountingService;
    constructor(accountsService: AccountsService, accountingService: AccountingService);
    create(createAccountDto: CreateAccountDto): Promise<import("./entities/account.entity").Account>;
    seedCoaForProject(propertyId: string): Promise<{
        created: number;
        skipped: number;
    }>;
    bulkImport(body: {
        propertyId?: string | null;
        rows: Array<{
            accountCode: string;
            accountName: string;
            accountType: string;
            accountCategory: string;
            description?: string;
            openingBalance?: number;
        }>;
    }, req: Request): Promise<{
        created: number;
        skipped: number;
        errors: Array<{
            row: number;
            code: string;
            message: string;
        }>;
        createdIds: string[];
    }>;
    findAll(req: Request, accountType?: AccountType, isActive?: string, propertyId?: string, projectOnlyCoa?: string): Promise<import("./entities/account.entity").Account[]>;
    getHierarchy(req: Request): Promise<import("./entities/account.entity").Account[]>;
    getBalanceSheet(propertyId: string | undefined, req: Request): Promise<{
        assets: import("./entities/account.entity").Account[];
        liabilities: import("./entities/account.entity").Account[];
        equity: import("./entities/account.entity").Account[];
        totalAssets: number;
        totalLiabilities: number;
        totalEquity: number;
    }>;
    getProfitAndLoss(req: Request, propertyId: string | undefined, startDate?: string, endDate?: string): Promise<{
        income: import("./entities/account.entity").Account[];
        expenses: import("./entities/account.entity").Account[];
        totalIncome: number;
        totalExpenses: number;
        netProfit: number;
    }>;
    getTrialBalance(propertyId: string | undefined, req: Request): Promise<{
        accounts: Array<{
            accountCode: string;
            accountName: string;
            accountType: string;
            debitBalance: number;
            creditBalance: number;
        }>;
        totalDebit: number;
        totalCredit: number;
        isBalanced: boolean;
    }>;
    getPropertyWisePL(propertyId: string, req: Request): Promise<{
        propertyId: string;
        income: Array<{
            accountName: string;
            accountCode: string;
            amount: number;
        }>;
        expenses: Array<{
            accountName: string;
            accountCode: string;
            amount: number;
        }>;
        totalIncome: number;
        totalExpenses: number;
        netProfit: number;
    }>;
    findByCode(code: string, req: Request): Promise<import("./entities/account.entity").Account>;
    findOne(id: string, propertyId: string | undefined, req: Request): Promise<import("./entities/account.entity").Account>;
    update(id: string, updateAccountDto: UpdateAccountDto, req: Request): Promise<import("./entities/account.entity").Account>;
    remove(id: string, req: Request): Promise<void>;
}
