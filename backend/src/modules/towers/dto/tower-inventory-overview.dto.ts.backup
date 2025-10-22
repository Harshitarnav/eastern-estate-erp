import { DataCompletenessStatus } from '../../../common/enums/data-completeness-status.enum';
import {
  FlatSalesStatusBreakdown,
  TowerInventorySummaryDto,
  emptySalesBreakdown,
} from '../../properties/dto/property-inventory-summary.dto';

export interface TowerChecklistInsight {
  status: DataCompletenessStatus;
  count: number;
}

export class TowerInventoryOverviewDto {
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

export const emptyChecklistInsights = (): TowerChecklistInsight[] => [
  { status: DataCompletenessStatus.NOT_STARTED, count: 0 },
  { status: DataCompletenessStatus.IN_PROGRESS, count: 0 },
  { status: DataCompletenessStatus.NEEDS_REVIEW, count: 0 },
  { status: DataCompletenessStatus.COMPLETE, count: 0 },
];

export { emptySalesBreakdown };

