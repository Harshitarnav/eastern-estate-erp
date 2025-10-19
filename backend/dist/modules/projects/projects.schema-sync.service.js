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
var ProjectsSchemaSyncService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectsSchemaSyncService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
let ProjectsSchemaSyncService = ProjectsSchemaSyncService_1 = class ProjectsSchemaSyncService {
    constructor(dataSource) {
        this.dataSource = dataSource;
        this.logger = new common_1.Logger(ProjectsSchemaSyncService_1.name);
    }
    async onModuleInit() {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        try {
            await queryRunner.startTransaction();
            await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);
            await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS projects (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          project_code VARCHAR(50) UNIQUE NOT NULL,
          name VARCHAR(150) NOT NULL,
          description TEXT,
          address TEXT,
          city VARCHAR(100),
          state VARCHAR(100),
          country VARCHAR(100),
          pincode VARCHAR(15),
          status VARCHAR(50),
          start_date DATE,
          end_date DATE,
          contact_person VARCHAR(150),
          contact_email VARCHAR(150),
          contact_phone VARCHAR(25),
          gst_number VARCHAR(25),
          pan_number VARCHAR(25),
          finance_entity_name VARCHAR(150),
          is_active BOOLEAN DEFAULT true,
          created_by UUID,
          updated_by UUID,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      `);
            await queryRunner.query(`
        CREATE UNIQUE INDEX IF NOT EXISTS idx_projects_project_code ON projects (project_code);
      `);
            await queryRunner.query(`
        CREATE INDEX IF NOT EXISTS idx_projects_is_active ON projects (is_active);
      `);
            await queryRunner.commitTransaction();
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            this.logger.error('Failed to ensure projects table exists', error);
        }
        finally {
            await queryRunner.release();
        }
    }
};
exports.ProjectsSchemaSyncService = ProjectsSchemaSyncService;
exports.ProjectsSchemaSyncService = ProjectsSchemaSyncService = ProjectsSchemaSyncService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], ProjectsSchemaSyncService);
//# sourceMappingURL=projects.schema-sync.service.js.map