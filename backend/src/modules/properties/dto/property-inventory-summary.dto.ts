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

export class TowerInventorySummaryDto {
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

export class PropertyInventorySummaryDto {
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

export const emptySalesBreakdown = (): FlatSalesStatusBreakdown => ({
  available: 0,
  onHold: 0,
  booked: 0,
  sold: 0,
  blocked: 0,
  underConstruction: 0,
  total: 0,
});

export const emptyTowersCompleteness = (): PropertyTowersCompletenessBreakdown => ({
  notStarted: 0,
  inProgress: 0,
  needsReview: 0,
  complete: 0,
});

export const flatStatusToBreakdownKey = (status: FlatStatus): keyof FlatSalesStatusBreakdown => {
  switch (status) {
    case FlatStatus.AVAILABLE:
      return 'available';
    case FlatStatus.BOOKED:
      return 'booked';
    case FlatStatus.SOLD:
      return 'sold';
    case FlatStatus.BLOCKED:
      return 'blocked';
    case FlatStatus.ON_HOLD:
      return 'onHold';
    case FlatStatus.UNDER_CONSTRUCTION:
    default:
      return 'underConstruction';
  }
};
