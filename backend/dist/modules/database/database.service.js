"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
let DatabaseService = class DatabaseService {
    constructor(dataSource) {
        this.dataSource = dataSource;
    }
    async getTables() {
        const query = `
      SELECT table_name 
      FROM information_schema.tables
      WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `;
        const result = await this.dataSource.query(query);
        return result.map((row) => row.table_name);
    }
    async getTableInfo(tableName) {
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
        const countQuery = `SELECT COUNT(*) as count FROM "${tableName}"`;
        const countResult = await this.dataSource.query(countQuery);
        const rowCount = parseInt(countResult[0].count);
        const indexQuery = `
      SELECT indexname
      FROM pg_indexes
      WHERE tablename = $1;
    `;
        const indexes = await this.dataSource.query(indexQuery, [tableName]);
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
            columns: columns.map((col) => ({
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
            indexes: indexes.map((idx) => idx.indexname),
            foreignKeys: foreignKeys.map((fk) => ({
                column: fk.column_name,
                referencedTable: fk.referenced_table,
                referencedColumn: fk.referenced_column,
            })),
        };
    }
    async getTableData(tableName, page = 1, limit = 10, search, sortBy, sortOrder = 'DESC') {
        const offset = (page - 1) * limit;
        let countQuery = `SELECT COUNT(*) as count FROM "${tableName}"`;
        let dataQuery = `SELECT * FROM "${tableName}"`;
        const params = [];
        if (search) {
            const columnsQuery = `
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_name = $1
          AND data_type IN ('character varying', 'text', 'character');
      `;
            const searchableColumns = await this.dataSource.query(columnsQuery, [tableName]);
            if (searchableColumns.length > 0) {
                const searchConditions = searchableColumns.map((col) => `"${col.column_name}"::TEXT ILIKE $${params.length + 1}`).join(' OR ');
                const whereClause = ` WHERE ${searchConditions}`;
                countQuery += whereClause;
                dataQuery += whereClause;
                params.push(`%${search}%`);
            }
        }
        if (sortBy) {
            dataQuery += ` ORDER BY "${sortBy}" ${sortOrder}`;
        }
        else {
            dataQuery += ` ORDER BY 1 ${sortOrder}`;
        }
        dataQuery += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(limit, offset);
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
    async getAllTablesInfo() {
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
        return rows.map((row) => ({
            name: row.name,
            rowCount: Number(row.row_count ?? row.rowcount ?? 0),
            columnCount: Number(row.column_count ?? row.columncount ?? 0),
        }));
    }
    async getDatabaseStats() {
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
    async getExplorerSummary() {
        const [tables, sizeResult] = await Promise.all([
            this.getAllTablesInfo(),
            this.dataSource.query(`SELECT pg_size_pretty(pg_database_size(current_database())) AS size`),
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
    async getTableRelationships() {
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
        const fks = await this.dataSource.query(fkQuery);
        const seen = new Set(fks.map((f) => `${f.fromTable}.${f.fromColumn}`));
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
        const allTables = new Set(tableRows.map((r) => r.table_name));
        const overrides = {
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
        const pluralize = (base) => {
            const cands = [];
            if (base.endsWith('y'))
                cands.push(base.slice(0, -1) + 'ies');
            if (base.endsWith('s'))
                cands.push(base + 'es');
            cands.push(base + 's');
            cands.push(base);
            return cands;
        };
        const inferred = [];
        for (const row of colRows) {
            const key = `${row.table_name}.${row.column_name}`;
            if (seen.has(key))
                continue;
            let target = null;
            if (overrides[row.column_name]) {
                if (allTables.has(overrides[row.column_name])) {
                    target = overrides[row.column_name];
                }
            }
            else if (row.column_name.endsWith('_id')) {
                const base = row.column_name.slice(0, -3);
                for (const c of pluralize(base)) {
                    if (allTables.has(c)) {
                        target = c;
                        break;
                    }
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
            ...fks.map((f) => ({ ...f, kind: 'foreign_key' })),
            ...inferred.map((f) => ({ ...f, kind: 'inferred' })),
        ];
    }
    async executeQuery(sql) {
        const trimmedSql = sql.trim().toLowerCase();
        if (!trimmedSql.startsWith('select')) {
            throw new Error('Only SELECT queries are allowed');
        }
        if (!trimmedSql.includes('limit')) {
            sql += ' LIMIT 100';
        }
        return await this.dataSource.query(sql);
    }
    async getPrimaryKeyColumns(tableName) {
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
        return result.map((row) => row.column_name);
    }
    async updateRecord(tableName, primaryKey, data) {
        try {
            const pkColumns = await this.getPrimaryKeyColumns(tableName);
            if (pkColumns.length === 0) {
                throw new Error(`Table ${tableName} has no primary key`);
            }
            const whereConditions = pkColumns.map((col, idx) => `"${col}" = $${idx + 1}`);
            const whereValues = pkColumns.map(col => primaryKey[col]);
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
        }
        catch (error) {
            throw new Error(`Failed to update record: ${error.message}`);
        }
    }
    async createRecord(tableName, data) {
        try {
            const columns = Object.keys(data);
            const values = Object.values(data);
            const columnNames = columns.map(col => `"${col}"`).join(', ');
            const placeholders = columns.map((_, idx) => `$${idx + 1}`).join(', ');
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
        }
        catch (error) {
            throw new Error(`Failed to create record: ${error.message}`);
        }
    }
    async deleteRecord(tableName, primaryKey) {
        try {
            const pkColumns = await this.getPrimaryKeyColumns(tableName);
            if (pkColumns.length === 0) {
                throw new Error(`Table ${tableName} has no primary key`);
            }
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
        }
        catch (error) {
            throw new Error(`Failed to delete record: ${error.message}`);
        }
    }
};
exports.DatabaseService = DatabaseService;
exports.DatabaseService = DatabaseService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectDataSource)()),
    __metadata("design:paramtypes", [typeorm_2.DataSource])
], DatabaseService);
//# sourceMappingURL=database.service.js.map