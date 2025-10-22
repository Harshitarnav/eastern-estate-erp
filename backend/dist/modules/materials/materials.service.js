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
exports.MaterialsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const material_entity_1 = require("./entities/material.entity");
let MaterialsService = class MaterialsService {
    constructor(materialsRepository) {
        this.materialsRepository = materialsRepository;
    }
    async create(createMaterialDto) {
        const existing = await this.materialsRepository.findOne({
            where: { materialCode: createMaterialDto.materialCode },
        });
        if (existing) {
            throw new common_1.ConflictException(`Material with code ${createMaterialDto.materialCode} already exists`);
        }
        const material = this.materialsRepository.create(createMaterialDto);
        return await this.materialsRepository.save(material);
    }
    async findAll(filters) {
        const query = this.materialsRepository.createQueryBuilder('material');
        if (filters?.category) {
            query.andWhere('material.category = :category', { category: filters.category });
        }
        if (filters?.isActive !== undefined) {
            query.andWhere('material.isActive = :isActive', { isActive: filters.isActive });
        }
        if (filters?.lowStock) {
            query.andWhere('material.currentStock < material.minimumStockLevel');
        }
        return await query.orderBy('material.materialName', 'ASC').getMany();
    }
    async findOne(id) {
        const material = await this.materialsRepository.findOne({ where: { id } });
        if (!material) {
            throw new common_1.NotFoundException(`Material with ID ${id} not found`);
        }
        return material;
    }
    async findByCode(materialCode) {
        const material = await this.materialsRepository.findOne({
            where: { materialCode },
        });
        if (!material) {
            throw new common_1.NotFoundException(`Material with code ${materialCode} not found`);
        }
        return material;
    }
    async update(id, updateMaterialDto) {
        const material = await this.findOne(id);
        if (updateMaterialDto.materialCode && updateMaterialDto.materialCode !== material.materialCode) {
            const existing = await this.materialsRepository.findOne({
                where: { materialCode: updateMaterialDto.materialCode },
            });
            if (existing) {
                throw new common_1.ConflictException(`Material with code ${updateMaterialDto.materialCode} already exists`);
            }
        }
        Object.assign(material, updateMaterialDto);
        return await this.materialsRepository.save(material);
    }
    async remove(id) {
        const material = await this.findOne(id);
        material.isActive = false;
        await this.materialsRepository.save(material);
    }
    async getLowStockMaterials() {
        return await this.materialsRepository
            .createQueryBuilder('material')
            .where('material.currentStock < material.minimumStockLevel')
            .andWhere('material.isActive = :isActive', { isActive: true })
            .orderBy('material.category', 'ASC')
            .getMany();
    }
    async updateStock(id, quantity, operation) {
        const material = await this.findOne(id);
        if (operation === 'add') {
            material.currentStock = Number(material.currentStock) + quantity;
        }
        else {
            const newStock = Number(material.currentStock) - quantity;
            if (newStock < 0) {
                throw new common_1.ConflictException('Insufficient stock');
            }
            material.currentStock = newStock;
        }
        return await this.materialsRepository.save(material);
    }
    async getStatistics() {
        const materials = await this.materialsRepository.find({
            where: { isActive: true },
        });
        const totalMaterials = materials.length;
        const lowStockCount = materials.filter(m => m.isLowStock).length;
        const totalValue = materials.reduce((sum, m) => sum + m.stockValue, 0);
        const byCategory = materials.reduce((acc, material) => {
            const category = material.category;
            if (!acc[category]) {
                acc[category] = { count: 0, value: 0 };
            }
            acc[category].count++;
            acc[category].value += material.stockValue;
            return acc;
        }, {});
        return {
            totalMaterials,
            lowStockCount,
            totalValue: Math.round(totalValue * 100) / 100,
            byCategory,
        };
    }
};
exports.MaterialsService = MaterialsService;
exports.MaterialsService = MaterialsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(material_entity_1.Material)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], MaterialsService);
//# sourceMappingURL=materials.service.js.map