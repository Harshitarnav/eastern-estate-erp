import { DataCompletenessStatus } from '../../../common/enums/data-completeness-status.enum';
import { FlatSalesStatusBreakdown, TowerInventorySummaryDto, emptySalesBreakdown } from '../../properties/dto/property-inventory-summary.dto';
export interface TowerChecklistInsight {
    status: DataCompletenessStatus;
    count: number;
}
export declare class TowerInventoryOverviewDto {
    tower: TowerInventorySummaryDto;
    property: {
        id: string;
        name: string;
        code: string;
    } | null;
    floorsDefined: number;
    floorsPlanned: number;
    typologies: string[];
    checklistInsights: TowerChecklistInsight[];
    salesBreakdown: FlatSalesStatusBreakdown;
    generatedAt: string;
}
export declare const emptyChecklistInsights: () => TowerChecklistInsight[];
export { emptySalesBreakdown };
