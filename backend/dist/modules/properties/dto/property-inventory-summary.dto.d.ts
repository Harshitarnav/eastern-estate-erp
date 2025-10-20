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
    constructionStatus?: string | null;
    heroImage?: string | null;
    imageGallery?: string[];
    unitStagePreviews?: TowerUnitStagePreviewDto[];
    fundsTarget: number;
    fundsRealized: number;
    fundsOutstanding: number;
    paymentStages: TowerPaymentStageDto[];
}
export declare class TowerUnitStagePreviewDto {
    id: string;
    flatNumber: string;
    status: FlatStatus;
    floor?: number | null;
    type?: string | null;
    facing?: string | null;
    images: string[];
    fundsTarget?: number;
    fundsRealized?: number;
    fundsOutstanding?: number;
}
export declare class TowerPaymentStageDto {
    floorNumber: number;
    stageLabel: string;
    constructionStatus: 'COMPLETED' | 'IN_PROGRESS' | 'UPCOMING';
    paymentDue: number;
    paymentCollected: number;
    paymentBalance: number;
    isPaymentComplete: boolean;
    completedAt?: string | null;
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
    fundsTarget: number;
    fundsRealized: number;
    fundsOutstanding: number;
    generatedAt: string;
}
export declare const emptySalesBreakdown: () => FlatSalesStatusBreakdown;
export declare const emptyTowersCompleteness: () => PropertyTowersCompletenessBreakdown;
export declare const flatStatusToBreakdownKey: (status: FlatStatus) => keyof FlatSalesStatusBreakdown;
