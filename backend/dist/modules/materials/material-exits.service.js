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
exports.MaterialExitsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const material_exit_entity_1 = require("./entities/material-exit.entity");
const material_entity_1 = require("./entities/material.entity");
let MaterialExitsService = class MaterialExitsService {
    constructor(exitsRepository, materialsRepository, dataSource) {
        this.exitsRepository = exitsRepository;
        this.materialsRepository = materialsRepository;
        this.dataSource = dataSource;
    }
    async create(createDto) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const material = await queryRunner.manager.findOne(material_entity_1.Material, {
                where: { id: createDto.materialId },
            });
            if (!material) {
                throw new common_1.NotFoundException('Material not found');
            }
            if (Number(material.currentStock) < createDto.quantity) {
                throw new common_1.ConflictException('Insufficient stock');
            }
            const exit = this.exitsRepository.create(createDto);
            await queryRunner.manager.save(exit);
            material.currentStock = Number(material.currentStock) - createDto.quantity;
            await queryRunner.manager.save(material);
            await queryRunner.commitTransaction();
            return exit;
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async findAll(filters) {
        const query = this.exitsRepository.createQueryBuilder('exit');
        if (filters?.materialId) {
            query.andWhere('exit.materialId = :materialId', { materialId: filters.materialId });
        }
        if (filters?.projectId) {
            query.andWhere('exit.constructionProjectId = :projectId', { projectId: filters.projectId });
        }
        return await query.orderBy('exit.exitDate', 'DESC').getMany();
    }
    async findOne(id) {
        const exit = await this.exitsRepository.findOne({ where: { id } });
        if (!exit) {
            throw new common_1.NotFoundException(`Material exit with ID ${id} not found`);
        }
        return exit;
    }
    async update(id, updateDto) {
        const exit = await this.findOne(id);
        Object.assign(exit, updateDto);
        return await this.exitsRepository.save(exit);
    }
    async remove(id) {
        await this.exitsRepository.delete(id);
    }
};
exports.MaterialExitsService = MaterialExitsService;
exports.MaterialExitsService = MaterialExitsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(material_exit_entity_1.MaterialExit)),
    __param(1, (0, typeorm_1.InjectRepository)(material_entity_1.Material)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], MaterialExitsService);
//# sourceMappingURL=material-exits.service.js.map