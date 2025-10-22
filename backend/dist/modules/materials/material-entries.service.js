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
exports.MaterialEntriesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const material_entry_entity_1 = require("./entities/material-entry.entity");
const material_entity_1 = require("./entities/material.entity");
let MaterialEntriesService = class MaterialEntriesService {
    constructor(entriesRepository, materialsRepository, dataSource) {
        this.entriesRepository = entriesRepository;
        this.materialsRepository = materialsRepository;
        this.dataSource = dataSource;
    }
    async create(createDto) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const entry = this.entriesRepository.create(createDto);
            await queryRunner.manager.save(entry);
            const material = await queryRunner.manager.findOne(material_entity_1.Material, {
                where: { id: createDto.materialId },
            });
            if (material) {
                material.currentStock = Number(material.currentStock) + createDto.quantity;
                await queryRunner.manager.save(material);
            }
            await queryRunner.commitTransaction();
            return entry;
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
        const query = this.entriesRepository.createQueryBuilder('entry');
        if (filters?.materialId) {
            query.andWhere('entry.materialId = :materialId', { materialId: filters.materialId });
        }
        if (filters?.vendorId) {
            query.andWhere('entry.vendorId = :vendorId', { vendorId: filters.vendorId });
        }
        return await query.orderBy('entry.entryDate', 'DESC').getMany();
    }
    async findOne(id) {
        const entry = await this.entriesRepository.findOne({ where: { id } });
        if (!entry) {
            throw new common_1.NotFoundException(`Material entry with ID ${id} not found`);
        }
        return entry;
    }
    async update(id, updateDto) {
        const entry = await this.findOne(id);
        Object.assign(entry, updateDto);
        return await this.entriesRepository.save(entry);
    }
    async remove(id) {
        await this.entriesRepository.delete(id);
    }
};
exports.MaterialEntriesService = MaterialEntriesService;
exports.MaterialEntriesService = MaterialEntriesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(material_entry_entity_1.MaterialEntry)),
    __param(1, (0, typeorm_1.InjectRepository)(material_entity_1.Material)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], MaterialEntriesService);
//# sourceMappingURL=material-entries.service.js.map