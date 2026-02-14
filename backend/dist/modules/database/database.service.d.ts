import { DataSource } from 'typeorm';
export interface TableColumn {
    name: string;
    type: string;
    nullable: boolean;
    default: string | null;
    isPrimary: boolean;
    isUnique: boolean;
    isForeignKey: boolean;
    references?: {
        table: string;
        column: string;
    };
}
export interface TableInfo {
    name: string;
    rowCount: number;
    columns: TableColumn[];
    indexes: string[];
    foreignKeys: Array<{
        column: string;
        referencedTable: string;
        referencedColumn: string;
    }>;
}
export interface TableData {
    tableName: string;
    data: any[];
    total: number;
    page: number;
    limit: number;
}
export declare class DatabaseService {
    private dataSource;
    constructor(dataSource: DataSource);
    getTables(): Promise<string[]>;
    getTableInfo(tableName: string): Promise<TableInfo>;
    getTableData(tableName: string, page?: number, limit?: number, search?: string, sortBy?: string, sortOrder?: 'ASC' | 'DESC'): Promise<TableData>;
    getAllTablesInfo(): Promise<Array<{
        name: string;
        rowCount: number;
        columnCount: number;
    }>>;
    getDatabaseStats(): Promise<{
        totalTables: number;
        totalRows: number;
        databaseSize: string;
    }>;
    getTableRelationships(): Promise<Array<{
        fromTable: string;
        fromColumn: string;
        toTable: string;
        toColumn: string;
        constraintName: string;
    }>>;
    executeQuery(sql: string): Promise<any>;
    getPrimaryKeyColumns(tableName: string): Promise<string[]>;
    updateRecord(tableName: string, primaryKey: Record<string, any>, data: Record<string, any>): Promise<{
        success: boolean;
        message: string;
    }>;
    createRecord(tableName: string, data: Record<string, any>): Promise<{
        success: boolean;
        message: string;
        insertedId?: any;
    }>;
    deleteRecord(tableName: string, primaryKey: Record<string, any>): Promise<{
        success: boolean;
        message: string;
    }>;
}
