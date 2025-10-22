import { AccountsService } from './accounts.service';
import { CreateAccountDto, UpdateAccountDto } from './dto/create-account.dto';
import { AccountType } from './entities/account.entity';
export declare class AccountsController {
    private readonly accountsService;
    constructor(accountsService: AccountsService);
    create(createAccountDto: CreateAccountDto): Promise<import("./entities/account.entity").Account>;
    findAll(accountType?: AccountType, isActive?: string): Promise<import("./entities/account.entity").Account[]>;
    getHierarchy(): Promise<import("./entities/account.entity").Account[]>;
    getBalanceSheet(): Promise<{
        assets: import("./entities/account.entity").Account[];
        liabilities: import("./entities/account.entity").Account[];
        equity: import("./entities/account.entity").Account[];
        totalAssets: number;
        totalLiabilities: number;
        totalEquity: number;
    }>;
    getProfitAndLoss(): Promise<{
        income: import("./entities/account.entity").Account[];
        expenses: import("./entities/account.entity").Account[];
        totalIncome: number;
        totalExpenses: number;
        netProfit: number;
    }>;
    findByCode(code: string): Promise<import("./entities/account.entity").Account>;
    findOne(id: string): Promise<import("./entities/account.entity").Account>;
    update(id: string, updateAccountDto: UpdateAccountDto): Promise<import("./entities/account.entity").Account>;
    remove(id: string): Promise<void>;
}
