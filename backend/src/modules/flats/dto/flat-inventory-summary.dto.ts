import { FlatStatus, FlatType, FacingDirection } from '../entities/flat.entity';
import { DataCompletenessStatus } from '../../../common/enums/data-completeness-status.enum';
import {
  FlatSalesStatusBreakdown,
  emptySalesBreakdown,
} from '../../properties/dto/property-inventory-summary.dto';

export interface FlatCompletenessBreakdown {
  notStarted: number;
  inProgress: number;
  needsReview: number;
  complete: number;
}

export const emptyFlatCompleteness = (): FlatCompletenessBreakdown => ({
  notStarted: 0,
  inProgress: 0,
  needsReview: 0,
  complete: 0,
});

export class FlatInventoryUnitDto {
  id: string;
  flatNumber: string;
  floor: number;
  type: FlatType;
  carpetArea: number;
  superBuiltUpArea: number;
  builtUpArea: number;
  facing?: FacingDirection;
  basePrice: number;
  pricePerSqft?: number;
  status: FlatStatus;
  dataCompletionPct: number;
  completenessStatus: DataCompletenessStatus;
  checklist: Record<string, boolean> | null;
  issues: string[];
  issuesCount: number;
}

export class FlatInventorySummaryDto {
  towerId: string;
  towerName: string;
  towerNumber: string;
  propertyId: string;
  propertyName?: string;
  propertyCode?: string;
  unitsPlanned: number;
  unitsDefined: number;
  missingUnits: number;
  averageCompletionPct: number;
  completeness: FlatCompletenessBreakdown;
  issuesCount: number;
  salesBreakdown: FlatSalesStatusBreakdown;
  units: FlatInventoryUnitDto[];
  generatedAt: string;
}

export { emptySalesBreakdown };
