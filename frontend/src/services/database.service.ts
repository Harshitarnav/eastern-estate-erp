import { api } from './api';

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

export interface TableOverview {
  name: string;
  rowCount: number;
  columnCount: number;
}

export interface DatabaseStats {
  totalTables: number;
  totalRows: number;
  databaseSize: string;
}

export interface TableRelationship {
  fromTable: string;
  fromColumn: string;
  toTable: string;
  toColumn: string;
  constraintName: string;
  kind?: 'foreign_key' | 'inferred';
}

export const databaseService = {
  /**
   * Get list of all table names
   */
  async getTables(): Promise<string[]> {
    const response = await api.get('/database/tables');
    return response.data || [];
  },

  /**
   * Get overview of all tables with row counts
   */
  async getTablesOverview(): Promise<TableOverview[]> {
    const response = await api.get('/database/tables/overview');
    return response.data || [];
  },

  /**
   * Database explorer home: tables + stats in one request.
   */
  async getExplorerSummary(): Promise<{
    tables: TableOverview[];
    stats: DatabaseStats;
  }> {
    const response = await api.get('/database/explorer-summary');
    return response.data;
  },

  /**
   * Get database statistics
   */
  async getDatabaseStats(): Promise<DatabaseStats> {
    const response = await api.get('/database/stats');
    return response.data;
  },

  /**
   * Get table relationships
   */
  async getTableRelationships(): Promise<TableRelationship[]> {
    const response = await api.get('/database/relationships');
    return response.data || [];
  },

  /**
   * Get detailed info about a specific table
   */
  async getTableInfo(tableName: string): Promise<TableInfo> {
    const response = await api.get(`/database/tables/${tableName}`);
    return response.data;
  },

  /**
   * Get data from a specific table
   */
  async getTableData(
    tableName: string,
    params?: {
      page?: number;
      limit?: number;
      search?: string;
      sortBy?: string;
      sortOrder?: 'ASC' | 'DESC';
    }
  ): Promise<{ data: any[]; meta: any }> {
    const response = await api.get(`/database/tables/${tableName}/data`, { params });
    return {
      data: response.data || [],
      meta: response.meta,
    };
  },

  /**
   * Execute a custom SQL query
   */
  async executeQuery(sql: string): Promise<{ success: boolean; data?: any[]; error?: string; rowCount?: number }> {
    const response = await api.post('/database/query', { sql });
    return response;
  },

  /**
   * Get primary key columns for a table
   */
  async getPrimaryKeys(tableName: string): Promise<string[]> {
    const response = await api.get(`/database/tables/${tableName}/primary-keys`);
    return response.data || [];
  },

  /**
   * Update a record in a table
   */
  async updateRecord(
    tableName: string,
    primaryKey: Record<string, any>,
    data: Record<string, any>
  ): Promise<{ success: boolean; message: string }> {
    const response = await api.put(`/database/tables/${tableName}/records`, {
      primaryKey,
      data,
    });
    return response;
  },

  /**
   * Create a new record in a table
   */
  async createRecord(
    tableName: string,
    data: Record<string, any>
  ): Promise<{ success: boolean; message: string; insertedId?: any }> {
    const response = await api.post(`/database/tables/${tableName}/records`, {
      data,
    });
    return response;
  },

  /**
   * Delete a record from a table
   */
  async deleteRecord(
    tableName: string,
    primaryKey: Record<string, any>
  ): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/database/tables/${tableName}/records`, {
      data: { primaryKey },
    });
    return response;
  },
};
