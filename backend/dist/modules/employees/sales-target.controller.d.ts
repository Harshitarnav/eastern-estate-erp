import { SalesTargetService } from './sales-target.service';
import { CreateSalesTargetDto } from './dto/create-sales-target.dto';
import { TargetPeriod } from './entities/sales-target.entity';
export declare class SalesTargetController {
    private readonly salesTargetService;
    constructor(salesTargetService: SalesTargetService);
    create(createSalesTargetDto: CreateSalesTargetDto): Promise<import("./entities/sales-target.entity").SalesTarget>;
    findBySalesPerson(salesPersonId: string): Promise<import("./entities/sales-target.entity").SalesTarget[]>;
    getActiveTarget(salesPersonId: string, period?: TargetPeriod): Promise<import("./entities/sales-target.entity").SalesTarget>;
    getTeamPerformanceSummary(teamMemberIds: string): Promise<any>;
    getTeamTargets(teamMemberIds: string, period?: TargetPeriod): Promise<import("./entities/sales-target.entity").SalesTarget[]>;
    findOne(id: string): Promise<import("./entities/sales-target.entity").SalesTarget>;
    update(id: string, updateData: Partial<CreateSalesTargetDto>): Promise<import("./entities/sales-target.entity").SalesTarget>;
    updateAchievement(id: string): Promise<import("./entities/sales-target.entity").SalesTarget>;
    updateSelfTarget(id: string, body: {
        selfTargetBookings: number;
        selfTargetRevenue: number;
        notes?: string;
    }): Promise<import("./entities/sales-target.entity").SalesTarget>;
    markIncentivePaid(id: string): Promise<import("./entities/sales-target.entity").SalesTarget>;
    remove(id: string): Promise<void>;
}
