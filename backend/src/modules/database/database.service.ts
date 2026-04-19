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
   * Fast table overview: column counts in one aggregation, row counts from pg_stat
   * (approximate n_live_tup - same source as EXPLAIN row estimates; avoids COUNT(*) per table).
   */
  async getAllTablesInfo(): Promise<Array<{ name: string; rowCount: number; columnCount: number }>> {
    const query = `
      WITH col_counts AS (
        SELECT table_name, COUNT(*)::int AS column_count
        FROM information_schema.columns
        WHERE table_schema = 'public'
        GROUP BY table_name
      )
      SELECT
        t.tablename AS name,
        COALESCE(s.n_live_tup, 0)::bigint AS row_count,
        COALESCE(cc.column_count, 0)::int AS column_count
      FROM pg_tables t
      LEFT JOIN pg_stat_user_tables s
        ON s.schemaname = t.schemaname AND s.relname = t.tablename
      LEFT JOIN col_counts cc ON cc.table_name = t.tablename
      WHERE t.schemaname = 'public'
      ORDER BY t.tablename;
    `;

    const rows = await this.dataSource.query(query);
    return rows.map((row: any) => ({
      name: row.name,
      rowCount: Number(row.row_count ?? row.rowcount ?? 0),
      columnCount: Number(row.column_count ?? row.columncount ?? 0),
    }));
  }

  /**
   * Get database statistics
   */
  async getDatabaseStats(): Promise<{
    totalTables: number;
    totalRows: number;
    databaseSize: string;
  }> {
    const tablesQuery = `
      SELECT COUNT(*)::int AS count
      FROM pg_tables
      WHERE schemaname = 'public';
    `;
    const rowsQuery = `
      SELECT COALESCE(SUM(n_live_tup), 0)::bigint AS total
      FROM pg_stat_user_tables
      WHERE schemaname = 'public';
    `;
    const sizeQuery = `
      SELECT pg_size_pretty(pg_database_size(current_database())) AS size;
    `;

    const [tablesResult, rowsResult, sizeResult] = await Promise.all([
      this.dataSource.query(tablesQuery),
      this.dataSource.query(rowsQuery),
      this.dataSource.query(sizeQuery),
    ]);

    return {
      totalTables: parseInt(tablesResult[0].count, 10),
      totalRows: Number(rowsResult[0].total ?? 0),
      databaseSize: sizeResult[0].size,
    };
  }

  /**
   * One round-trip payload for the database explorer home (tables grid + stats cards).
   */
  async getExplorerSummary(): Promise<{
    tables: Array<{ name: string; rowCount: number; columnCount: number }>;
    stats: { totalTables: number; totalRows: number; databaseSize: string };
  }> {
    const [tables, sizeResult] = await Promise.all([
      this.getAllTablesInfo(),
      this.dataSource.query(
        `SELECT pg_size_pretty(pg_database_size(current_database())) AS size`,
      ),
    ]);

    const totalRows = tables.reduce((sum, t) => sum + t.rowCount, 0);

    return {
      tables,
      stats: {
        totalTables: tables.length,
        totalRows,
        databaseSize: sizeResult[0].size,
      },
    };
  }

  /**
   * Get table relationships for the Database Relationships viewer.
   *
   * Returns two kinds of edges:
   *  1. `foreign_key` – hard FK constraints read from information_schema.
   *  2. `inferred`    – best-effort edges derived from column naming
   *                     convention (`<singular>_id` → `<plural>.id`). These
   *                     are surfaced so the viewer is useful even when some
   *                     FK constraints couldn't be added (e.g. due to
   *                     orphaned rows in legacy tables).
   *
   * Inferred edges never shadow a real FK on the same (fromTable, fromColumn).
   */
  async getTableRelationships(): Promise<Array<{
    fromTable: string;
    fromColumn: string;
    toTable: string;
    toColumn: string;
    constraintName: string;
    kind: 'foreign_key' | 'inferred';
  }>> {
    const fkQuery = `
      SELECT
        tc.table_name   as "fromTable",
        kcu.column_name as "fromColumn",
        ccu.table_name  as "toTable",
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

    const fks: Array<{
      fromTable: string; fromColumn: string;
      toTable: string;   toColumn: string;
      constraintName: string;
    }> = await this.dataSource.query(fkQuery);

    const seen = new Set(
      fks.map((f) => `${f.fromTable}.${f.fromColumn}`),
    );

    // Inferred: find *_id columns in public tables, then try a few naming
    // heuristics to locate their target table. We use a single round-trip
    // to fetch both sides to keep the page snappy.
    const [colRows, tableRows] = await Promise.all([
      this.dataSource.query(`
        SELECT table_name, column_name
        FROM   information_schema.columns
        WHERE  table_schema = 'public'
          AND  column_name LIKE '%\\_id' ESCAPE '\\'
          AND  column_name <> 'id'
      `),
      this.dataSource.query(`
        SELECT table_name
        FROM   information_schema.tables
        WHERE  table_schema = 'public'
          AND  table_type = 'BASE TABLE'
      `),
    ]);

    const allTables: Set<string> = new Set(
      tableRows.map((r: any) => r.table_name),
    );

    // Manual overrides for columns whose names don't map cleanly.
    const overrides: Record<string, string> = {
      assigned_to: 'users',
      created_by: 'users',
      updated_by: 'users',
      approved_by: 'users',
      voided_by: 'users',
      uploaded_by: 'users',
      manager_id: 'employees',
      parent_account_id: 'accounts',
      construction_project_id: 'construction_projects',
      journal_entry_id: 'journal_entries',
      customer_id: 'customers',
      property_id: 'properties',
      tower_id: 'towers',
      flat_id: 'flats',
      booking_id: 'bookings',
      vendor_id: 'vendors',
      purchase_order_id: 'purchase_orders',
      material_id: 'materials',
      user_id: 'users',
      account_id: 'accounts',
      role_id: 'roles',
      permission_id: 'permissions',
      employee_id: 'employees',
      lead_id: 'leads',
      milestone_id: 'payment_schedules',
      bank_account_id: 'bank_accounts',
      document_id: 'documents',
      campaign_id: 'marketing_campaigns',
    };

    const pluralize = (base: string): string[] => {
      // Return several plausible table names in preference order.
      const cands: string[] = [];
      if (base.endsWith('y')) cands.push(base.slice(0, -1) + 'ies');
      if (base.endsWith('s')) cands.push(base + 'es');
      cands.push(base + 's');
      cands.push(base);
      return cands;
    };

    const inferred: Array<{
      fromTable: string; fromColumn: string;
      toTable: string;   toColumn: string;
      constraintName: string;
    }> = [];

    for (const row of colRows as Array<{ table_name: string; column_name: string }>) {
      const key = `${row.table_name}.${row.column_name}`;
      if (seen.has(key)) continue;

      let target: string | null = null;
      if (overrides[row.column_name]) {
        if (allTables.has(overrides[row.column_name])) {
          target = overrides[row.column_name];
        }
      } else if (row.column_name.endsWith('_id')) {
        const base = row.column_name.slice(0, -3);
        for (const c of pluralize(base)) {
          if (allTables.has(c)) { target = c; break; }
        }
      }

      if (target && target !== row.table_name) {
        inferred.push({
          fromTable: row.table_name,
          fromColumn: row.column_name,
          toTable: target,
          toColumn: 'id',
          constraintName: `inferred_${row.table_name}_${row.column_name}`,
        });
        seen.add(key);
      }
    }

    return [
      ...fks.map((f) => ({ ...f, kind: 'foreign_key' as const })),
      ...inferred.map((f) => ({ ...f, kind: 'inferred' as const })),
    ];
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
