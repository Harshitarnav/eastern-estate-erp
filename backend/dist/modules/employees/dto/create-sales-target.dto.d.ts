import { TargetPeriod } from '../entities/sales-target.entity';
export declare class CreateSalesTargetDto {
    salesPersonId: string;
    targetPeriod: TargetPeriod;
    startDate: Date;
    endDate: Date;
    targetLeads?: number;
    targetSiteVisits?: number;
    targetConversions?: number;
    targetBookings?: number;
    targetRevenue?: number;
    selfTargetBookings?: number;
    selfTargetRevenue?: number;
    selfTargetNotes?: string;
    baseIncentive?: number;
    setBy?: string;
    notes?: string;
}
