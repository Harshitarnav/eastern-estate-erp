import { DataCompletenessStatus } from '../../../common/enums/data-completeness-status.enum';
import { FlatStatus } from '../../flats/entities/flat.entity';
export interface FlatSalesStatusBreakdown {
    available: number;
    onHold: number;
    booked: number;
    sold: number;
    blocked: number;
    underConstruction: number;
    total: number;
}
export interface PropertyTowersCompletenessBreakdown {
    notStarted: number;
    inProgress: number;
    needsReview: number;
    complete: number;
}
export declare class TowerInventorySummaryDto {
    id: string;
    name: string;
    towerNumber: string;
    towerCode: string;
    totalFloors: number;
    totalUnits: number;
    unitsPlanned: number;
    unitsDefined: number;
    missingUnits: number;
    dataCompletionPct: number;
    dataCompletenessStatus: DataCompletenessStatus;
    issuesCount: number;
    salesBreakdown: FlatSalesStatusBreakdown;
}
export declare class PropertyInventorySummaryDto {
    propertyId: string;
    propertyName: string;
    propertyCode: string;
    dataCompletionPct: number;
    dataCompletenessStatus: DataCompletenessStatus;
    towersPlanned: number;
    towersDefined: number;
    missingTowers: number;
    unitsPlanned: number;
    unitsDefined: number;
    missingUnits: number;
    towersCompleteness: PropertyTowersCompletenessBreakdown;
    salesBreakdown: FlatSalesStatusBreakdown;
    towers: TowerInventorySummaryDto[];
    generatedAt: string;
}
export declare const emptySalesBreakdown: () => FlatSalesStatusBreakdown;
export declare const emptyTowersCompleteness: () => PropertyTowersCompletenessBreakdown;
export declare const flatStatusToBreakdownKey: (status: FlatStatus) => keyof FlatSalesStatusBreakdown;
