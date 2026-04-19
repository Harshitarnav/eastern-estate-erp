import { Request } from 'express';
import { LegacyImportPayload, LegacyImportPreview, LegacyImportResult, LegacyImportService } from '../services/legacy-import.service';
import { OverdueScannerService } from '../services/overdue-scanner.service';
export declare class LegacyImportController {
    private readonly importService;
    private readonly overdueScanner;
    constructor(importService: LegacyImportService, overdueScanner: OverdueScannerService);
    preview(payload: LegacyImportPayload): Promise<LegacyImportPreview>;
    commit(payload: LegacyImportPayload, req: Request): Promise<LegacyImportResult>;
    manualScan(): Promise<import("../services/overdue-scanner.service").ScanStats>;
}
