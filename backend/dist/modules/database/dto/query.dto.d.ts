export declare class ExecuteQueryDto {
    query: string;
    limit?: number;
    readonly?: boolean;
}
export declare class UpdateRowDto {
    table: string;
    id: string;
    idColumn: string;
    data: Record<string, any>;
}
export declare class InsertRowDto {
    table: string;
    data: Record<string, any>;
}
export declare class DeleteRowDto {
    table: string;
    id: string;
    idColumn: string;
}
