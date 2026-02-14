import { DatabaseService } from './database.service';
export declare class DatabaseController {
    private readonly databaseService;
    constructor(databaseService: DatabaseService);
    getTables(): Promise<{
        data: string[];
    }>;
    getTablesOverview(): Promise<{
        data: {
            name: string;
            rowCount: number;
            columnCount: number;
        }[];
    }>;
    getStats(): Promise<{
        data: {
            totalTables: number;
            totalRows: number;
            databaseSize: string;
        };
    }>;
    getRelationships(): Promise<{
        data: {
            fromTable: string;
            fromColumn: string;
            toTable: string;
            toColumn: string;
            constraintName: string;
        }[];
    }>;
    getTableInfo(tableName: string): Promise<{
        data: import("./database.service").TableInfo;
    }>;
    getTableData(tableName: string, page?: string, limit?: string, search?: string, sortBy?: string, sortOrder?: 'ASC' | 'DESC'): Promise<{
        data: any[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    executeQuery(sql: string): Promise<{
        success: boolean;
        data: any;
        rowCount: any;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        data?: undefined;
        rowCount?: undefined;
    }>;
    updateRecord(tableName: string, primaryKey: Record<string, any>, data: Record<string, any>): Promise<{
        success: boolean;
        message: any;
    }>;
    createRecord(tableName: string, data: Record<string, any>): Promise<{
        success: boolean;
        message: string;
        insertedId?: any;
    } | {
        success: boolean;
        message: any;
    }>;
    deleteRecord(tableName: string, primaryKey: Record<string, any>): Promise<{
        success: boolean;
        message: any;
    }>;
    getPrimaryKeys(tableName: string): Promise<{
        data: string[];
        success?: undefined;
        message?: undefined;
    } | {
        success: boolean;
        message: any;
        data?: undefined;
    }>;
}
