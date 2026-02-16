import { Controller, Get, Query, Param, UseGuards, Post, Body, Put, Delete } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@Controller('database')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DatabaseController {
  constructor(private readonly databaseService: DatabaseService) {}

  /**
   * Get list of all tables
   * GET /database/tables
   */
  @Get('tables')
  @Roles('super_admin', 'admin')
  async getTables() {
    const tables = await this.databaseService.getTables();
    return { data: tables };
  }

  /**
   * Get overview of all tables with counts
   * GET /database/tables/overview
   */
  @Get('tables/overview')
  @Roles('super_admin', 'admin')
  async getTablesOverview() {
    const tables = await this.databaseService.getAllTablesInfo();
    return { data: tables };
  }

  /**
   * Get database statistics
   * GET /database/stats
   */
  @Get('stats')
  @Roles('super_admin', 'admin')
  async getStats() {
    const stats = await this.databaseService.getDatabaseStats();
    return { data: stats };
  }

  /**
   * Get table relationships
   * GET /database/relationships
   */
  @Get('relationships')
  @Roles('super_admin', 'admin')
  async getRelationships() {
    const relationships = await this.databaseService.getTableRelationships();
    return { data: relationships };
  }

  /**
   * Get detailed info about a specific table
   * GET /database/tables/:tableName
   */
  @Get('tables/:tableName')
  @Roles('super_admin', 'admin')
  async getTableInfo(@Param('tableName') tableName: string) {
    const info = await this.databaseService.getTableInfo(tableName);
    return { data: info };
  }

  /**
   * Get data from a specific table
   * GET /database/tables/:tableName/data
   */
  @Get('tables/:tableName/data')
  @Roles('super_admin', 'admin')
  async getTableData(
    @Param('tableName') tableName: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder: 'ASC' | 'DESC' = 'DESC',
  ) {
    const data = await this.databaseService.getTableData(
      tableName,
      parseInt(page),
      parseInt(limit),
      search,
      sortBy,
      sortOrder,
    );
    return {
      data: data.data,
      meta: {
        total: data.total,
        page: data.page,
        limit: data.limit,
        totalPages: Math.ceil(data.total / data.limit),
      },
    };
  }

  /**
   * Execute a custom SQL query (SELECT only)
   * POST /database/query
   */
  @Post('query')
  @Roles('super_admin')
  async executeQuery(@Body('sql') sql: string) {
    try {
      const result = await this.databaseService.executeQuery(sql);
      return {
        success: true,
        data: result,
        rowCount: result.length,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Update a record in a table
   * PUT /database/tables/:tableName/records
   */
  @Put('tables/:tableName/records')
  @Roles('super_admin', 'admin')
  async updateRecord(
    @Param('tableName') tableName: string,
    @Body('primaryKey') primaryKey: Record<string, any>,
    @Body('data') data: Record<string, any>,
  ) {
    try {
      const result = await this.databaseService.updateRecord(tableName, primaryKey, data);
      return result;
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  /**
   * Create a new record in a table
   * POST /database/tables/:tableName/records
   */
  @Post('tables/:tableName/records')
  @Roles('super_admin', 'admin')
  async createRecord(
    @Param('tableName') tableName: string,
    @Body('data') data: Record<string, any>,
  ) {
    try {
      const result = await this.databaseService.createRecord(tableName, data);
      return result;
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  /**
   * Delete a record from a table
   * DELETE /database/tables/:tableName/records
   */
  @Delete('tables/:tableName/records')
  @Roles('super_admin', 'admin')
  async deleteRecord(
    @Param('tableName') tableName: string,
    @Body('primaryKey') primaryKey: Record<string, any>,
  ) {
    try {
      const result = await this.databaseService.deleteRecord(tableName, primaryKey);
      return result;
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  /**
   * Get primary key columns for a table
   * GET /database/tables/:tableName/primary-keys
   */
  @Get('tables/:tableName/primary-keys')
  @Roles('super_admin', 'admin')
  async getPrimaryKeys(@Param('tableName') tableName: string) {
    try {
      const primaryKeys = await this.databaseService.getPrimaryKeyColumns(tableName);
      return { data: primaryKeys };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
      };
    }
  }
}
