import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
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

@Injectable()
export class DatabaseService {
  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  /**
   * Get list of all tables in the database
   */
  async getTables(): Promise<string[]> {
    const query = `
      SELECT table_name 
      FROM information_schema.tables
      WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `;
    
    const result = await this.dataSource.query(query);
    return result.map((row: any) => row.table_name);
  }

  /**
   * Get detailed information about a specific table
   */
  async getTableInfo(tableName: string): Promise<TableInfo> {
    // Get column information
    const columnsQuery = `
      SELECT 
        c.column_name as name,
        c.data_type as type,
        c.is_nullable as nullable,
        c.column_default as default_value,
        CASE WHEN pk.column_name IS NOT NULL THEN true ELSE false END as is_primary,
        CASE WHEN u.column_name IS NOT NULL THEN true ELSE false END as is_unique,
        CASE WHEN fk.column_name IS NOT NULL THEN true ELSE false END as is_foreign_key,
        fk.foreign_table_name as referenced_table,
        fk.foreign_column_name as referenced_column
      FROM information_schema.columns c
      LEFT JOIN (
        SELECT ku.table_name, ku.column_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage ku
          ON tc.constraint_name = ku.constraint_name
        WHERE tc.constraint_type = 'PRIMARY KEY'
      ) pk ON c.table_name = pk.table_name AND c.column_name = pk.column_name
      LEFT JOIN (
        SELECT ku.table_name, ku.column_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage ku
          ON tc.constraint_name = ku.constraint_name
        WHERE tc.constraint_type = 'UNIQUE'
      ) u ON c.table_name = u.table_name AND c.column_name = u.column_name
      LEFT JOIN (
        SELECT
          kcu.table_name,
          kcu.column_name,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY'
      ) fk ON c.table_name = fk.table_name AND c.column_name = fk.column_name
      WHERE c.table_name = $1
      ORDER BY c.ordinal_position;
    `;

    const columns = await this.dataSource.query(columnsQuery, [tableName]);

    // Get row count
    const countQuery = `SELECT COUNT(*) as count FROM "${tableName}"`;
    const countResult = await this.dataSource.query(countQuery);
    const rowCount = parseInt(countResult[0].count);

    // Get indexes
    const indexQuery = `
      SELECT indexname
      FROM pg_indexes
      WHERE tablename = $1;
    `;
    const indexes = await this.dataSource.query(indexQuery, [tableName]);

    // Get foreign keys
    const fkQuery = `
      SELECT
        kcu.column_name,
        ccu.table_name AS referenced_table,
        ccu.column_name AS referenced_column
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_name = $1;
    `;
    const foreignKeys = await this.dataSource.query(fkQuery, [tableName]);

    return {
      name: tableName,
      rowCount,
      columns: columns.map((col: any) => ({
        name: col.name,
        type: col.type,
        nullable: col.nullable === 'YES',
        default: col.default_value,
        isPrimary: col.is_primary,
        isUnique: col.is_unique,
        isForeignKey: col.is_foreign_key,
        references: col.is_foreign_key ? {
          table: col.referenced_table,
          column: col.referenced_column,
        } : undefined,
      })),
      indexes: indexes.map((idx: any) => idx.indexname),
      foreignKeys: foreignKeys.map((fk: any) => ({
        column: fk.column_name,
        referencedTable: fk.referenced_table,
        referencedColumn: fk.referenced_column,
      })),
    };
  }

  /**
   * Get data from a specific table with pagination
   */
  async getTableData(
    tableName: string,
    page: number = 1,
    limit: number = 10,
    search?: string,
    sortBy?: string,
    sortOrder: 'ASC' | 'DESC' = 'DESC',
  ): Promise<TableData> {
    const offset = (page - 1) * limit;

    // Get total count
    let countQuery = `SELECT COUNT(*) as count FROM "${tableName}"`;
    let dataQuery = `SELECT * FROM "${tableName}"`;
    
    const params: any[] = [];

    // Add search if provided
    if (search) {
      // Get all columns to search across
      const columnsQuery = `
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_name = $1
          AND data_type IN ('character varying', 'text', 'character');
      `;
      const searchableColumns = await this.dataSource.query(columnsQuery, [tableName]);
      
      if (searchableColumns.length > 0) {
        const searchConditions = searchableColumns.map(
          (col: any) => `"${col.column_name}"::TEXT ILIKE $${params.length + 1}`
        ).join(' OR ');
        
        const whereClause = ` WHERE ${searchConditions}`;
        countQuery += whereClause;
        dataQuery += whereClause;
        params.push(`%${search}%`);
      }
    }

    // Add sorting
    if (sortBy) {
      dataQuery += ` ORDER BY "${sortBy}" ${sortOrder}`;
    } else {
      // Default sort by first column
      dataQuery += ` ORDER BY 1 ${sortOrder}`;
    }

    // Add pagination
    dataQuery += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    // Execute queries
    const countResult = await this.dataSource.query(countQuery, search ? [`%${search}%`] : []);
    const total = parseInt(countResult[0].count);
    
    const data = await this.dataSource.query(dataQuery, params);

    return {
      tableName,
      data,
      total,
      page,
      limit,
    };
  }

  /**
   * Get all tables with basic info (for overview/dashboard)
   */
  async getAllTablesInfo(): Promise<Array<{ name: string; rowCount: number; columnCount: number }>> {
    const query = `
      SELECT 
        t.table_name as name,
        (SELECT COUNT(*) FROM information_schema.columns c WHERE c.table_name = t.table_name) as column_count
      FROM information_schema.tables t
      WHERE t.table_schema = 'public' 
        AND t.table_type = 'BASE TABLE'
      ORDER BY t.table_name;
    `;
    
    const tables = await this.dataSource.query(query);
    
    // Get row counts for each table
    const tablesWithCounts = await Promise.all(
      tables.map(async (table: any) => {
        try {
          const countQuery = `SELECT COUNT(*) as count FROM "${table.name}"`;
          const countResult = await this.dataSource.query(countQuery);
          return {
            name: table.name,
            rowCount: parseInt(countResult[0].count),
            columnCount: parseInt(table.column_count),
          };
        } catch (error) {
          return {
            name: table.name,
            rowCount: 0,
            columnCount: parseInt(table.column_count),
          };
        }
      })
    );

    return tablesWithCounts;
  }

  /**
   * Get database statistics
   */
  async getDatabaseStats(): Promise<{
    totalTables: number;
    totalRows: number;
    databaseSize: string;
  }> {
    // Get total tables
    const tablesQuery = `
      SELECT COUNT(*) as count
      FROM information_schema.tables
      WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE';
    `;
    const tablesResult = await this.dataSource.query(tablesQuery);
    const totalTables = parseInt(tablesResult[0].count);

    // Get database size
    const sizeQuery = `
      SELECT pg_size_pretty(pg_database_size(current_database())) as size;
    `;
    const sizeResult = await this.dataSource.query(sizeQuery);
    const databaseSize = sizeResult[0].size;

    // Get all tables info
    const allTables = await this.getAllTablesInfo();
    const totalRows = allTables.reduce((sum, table) => sum + table.rowCount, 0);

      return {
      totalTables,
      totalRows,
      databaseSize,
    };
  }

  /**
   * Get table relationships (foreign keys visualization)
   */
  async getTableRelationships(): Promise<Array<{
    fromTable: string;
    fromColumn: string;
    toTable: string;
    toColumn: string;
    constraintName: string;
  }>> {
    const query = `
      SELECT
        tc.table_name as "fromTable",
        kcu.column_name as "fromColumn",
        ccu.table_name as "toTable",
        ccu.column_name as "toColumn",
        tc.constraint_name as "constraintName"
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
      ORDER BY tc.table_name, kcu.column_name;
    `;

    return await this.dataSource.query(query);
  }

  /**
   * Execute a custom SQL query (admin only, read-only)
   */
  async executeQuery(sql: string): Promise<any> {
    // Security: Only allow SELECT queries
    const trimmedSql = sql.trim().toLowerCase();
    if (!trimmedSql.startsWith('select')) {
      throw new Error('Only SELECT queries are allowed');
    }

    // Add LIMIT if not present
    if (!trimmedSql.includes('limit')) {
      sql += ' LIMIT 100';
    }

    return await this.dataSource.query(sql);
  }

  /**
   * Get primary key column(s) for a table
   */
  async getPrimaryKeyColumns(tableName: string): Promise<string[]> {
    const query = `
      SELECT kcu.column_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      WHERE tc.constraint_type = 'PRIMARY KEY'
        AND tc.table_name = $1
        AND tc.table_schema = 'public'
      ORDER BY kcu.ordinal_position;
    `;
    
    const result = await this.dataSource.query(query, [tableName]);
    return result.map((row: any) => row.column_name);
  }

  /**
   * Update a record in a table
   */
  async updateRecord(
    tableName: string,
    primaryKey: Record<string, any>,
    data: Record<string, any>,
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Get primary key columns
      const pkColumns = await this.getPrimaryKeyColumns(tableName);
      
      if (pkColumns.length === 0) {
        throw new Error(`Table ${tableName} has no primary key`);
      }

      // Build WHERE clause for primary key
      const whereConditions = pkColumns.map((col, idx) => `"${col}" = $${idx + 1}`);
      const whereValues = pkColumns.map(col => primaryKey[col]);

      // Build SET clause
      const setColumns = Object.keys(data).filter(col => !pkColumns.includes(col));
      const setClauses = setColumns.map((col, idx) => `"${col}" = $${idx + whereValues.length + 1}`);
      const setValues = setColumns.map(col => data[col]);

      if (setClauses.length === 0) {
        throw new Error('No columns to update');
    }

    const query = `
        UPDATE "${tableName}"
        SET ${setClauses.join(', ')}
        WHERE ${whereConditions.join(' AND ')}
      `;

      await this.dataSource.query(query, [...whereValues, ...setValues]);

      return {
        success: true,
        message: 'Record updated successfully',
      };
    } catch (error: any) {
      throw new Error(`Failed to update record: ${error.message}`);
    }
  }

  /**
   * Create a new record in a table
   */
  async createRecord(
    tableName: string,
    data: Record<string, any>,
  ): Promise<{ success: boolean; message: string; insertedId?: any }> {
    try {
      const columns = Object.keys(data);
      const values = Object.values(data);
      
      const columnNames = columns.map(col => `"${col}"`).join(', ');
      const placeholders = columns.map((_, idx) => `$${idx + 1}`).join(', ');

      // Get primary key to return the inserted ID
      const pkColumns = await this.getPrimaryKeyColumns(tableName);
      const returningClause = pkColumns.length > 0 ? `RETURNING "${pkColumns[0]}"` : '';

    const query = `
        INSERT INTO "${tableName}" (${columnNames})
        VALUES (${placeholders})
        ${returningClause}
      `;

      const result = await this.dataSource.query(query, values);

      return {
        success: true,
        message: 'Record created successfully',
        insertedId: result[0]?.[pkColumns[0]],
      };
    } catch (error: any) {
      throw new Error(`Failed to create record: ${error.message}`);
    }
  }

  /**
   * Delete a record from a table
   */
  async deleteRecord(
    tableName: string,
    primaryKey: Record<string, any>,
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Get primary key columns
      const pkColumns = await this.getPrimaryKeyColumns(tableName);
      
      if (pkColumns.length === 0) {
        throw new Error(`Table ${tableName} has no primary key`);
      }

      // Build WHERE clause for primary key
      const whereConditions = pkColumns.map((col, idx) => `"${col}" = $${idx + 1}`);
      const whereValues = pkColumns.map(col => primaryKey[col]);

      const query = `
        DELETE FROM "${tableName}"
        WHERE ${whereConditions.join(' AND ')}
      `;

      await this.dataSource.query(query, whereValues);

      return {
        success: true,
        message: 'Record deleted successfully',
      };
    } catch (error: any) {
      throw new Error(`Failed to delete record: ${error.message}`);
    }
  }
}
