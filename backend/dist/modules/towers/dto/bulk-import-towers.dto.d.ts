export interface BulkImportTowerErrorDto {
    rowNumber: number;
    towerNumber?: string;
    issues: string[];
}
export declare class BulkImportTowersSummaryDto {
    propertyId: string;
    totalRows: number;
    created: number;
    skipped: number;
    errors: BulkImportTowerErrorDto[];
}
