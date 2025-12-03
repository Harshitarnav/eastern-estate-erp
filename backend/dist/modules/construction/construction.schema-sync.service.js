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
var ConstructionSchemaSyncService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConstructionSchemaSyncService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
let ConstructionSchemaSyncService = ConstructionSchemaSyncService_1 = class ConstructionSchemaSyncService {
    constructor(dataSource) {
        this.dataSource = dataSource;
        this.logger = new common_1.Logger(ConstructionSchemaSyncService_1.name);
    }
    async onModuleInit() {
        const runner = this.dataSource.createQueryRunner();
        await runner.connect();
        try {
            await runner.startTransaction();
            await runner.query(`
        DO $$
        BEGIN
          IF EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_name = 'construction_projects'
              AND column_name = 'property_id'
              AND is_nullable = 'NO'
          ) THEN
            ALTER TABLE construction_projects ALTER COLUMN property_id DROP NOT NULL;
          END IF;
        END $$;
      `);
            await runner.commitTransaction();
        }
        catch (error) {
            await runner.rollbackTransaction();
            this.logger.error('Failed to sync construction_projects schema', error);
        }
        finally {
            await runner.release();
        }
    }
};
exports.ConstructionSchemaSyncService = ConstructionSchemaSyncService;
exports.ConstructionSchemaSyncService = ConstructionSchemaSyncService = ConstructionSchemaSyncService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], ConstructionSchemaSyncService);
//# sourceMappingURL=construction.schema-sync.service.js.map