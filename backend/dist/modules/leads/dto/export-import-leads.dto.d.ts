export declare class ExportLeadsDto {
    startDate?: string;
    endDate?: string;
    status?: string;
    source?: string;
    assignedTo?: string;
    format?: 'excel' | 'pdf';
}
export declare class ImportLeadRowDto {
    firstName: string;
    lastName: string;
    phone: string;
    email?: string;
    source: string;
    property?: string;
    status?: string;
    notes?: string;
}
export declare class ImportLeadsDto {
    leads: ImportLeadRowDto[];
}
export declare class ImportLeadsResultDto {
    totalRows: number;
    successCount: number;
    errorCount: number;
    errors: {
        row: number;
        data: ImportLeadRowDto;
        error: string;
    }[];
    createdLeads: string[];
}
