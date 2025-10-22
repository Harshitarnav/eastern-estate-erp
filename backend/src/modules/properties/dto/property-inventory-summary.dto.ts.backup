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
  constructionStatus?: string | null;
  heroImage?: string | null;
  imageGallery?: string[];
  unitStagePreviews?: TowerUnitStagePreviewDto[];
  fundsTarget: number;
  fundsRealized: number;
  fundsOutstanding: number;
  paymentStages: TowerPaymentStageDto[];
}

export class TowerUnitStagePreviewDto {
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

export class TowerPaymentStageDto {
  floorNumber: number;
  stageLabel: string;
  constructionStatus: 'COMPLETED' | 'IN_PROGRESS' | 'UPCOMING';
  paymentDue: number;
  paymentCollected: number;
  paymentBalance: number;
  isPaymentComplete: boolean;
  completedAt?: string | null;
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
  fundsTarget: number;
  fundsRealized: number;
  fundsOutstanding: number;
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
