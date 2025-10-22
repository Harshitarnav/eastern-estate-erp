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
exports.VendorsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const vendor_entity_1 = require("./entities/vendor.entity");
let VendorsService = class VendorsService {
    constructor(vendorsRepository) {
        this.vendorsRepository = vendorsRepository;
    }
    async create(createVendorDto) {
        const existing = await this.vendorsRepository.findOne({
            where: { vendorCode: createVendorDto.vendorCode },
        });
        if (existing) {
            throw new common_1.ConflictException(`Vendor with code ${createVendorDto.vendorCode} already exists`);
        }
        const vendor = this.vendorsRepository.create(createVendorDto);
        return await this.vendorsRepository.save(vendor);
    }
    async findAll(filters) {
        const query = this.vendorsRepository.createQueryBuilder('vendor');
        if (filters?.isActive !== undefined) {
            query.andWhere('vendor.isActive = :isActive', { isActive: filters.isActive });
        }
        if (filters?.rating !== undefined) {
            query.andWhere('vendor.rating >= :rating', { rating: filters.rating });
        }
        return await query.orderBy('vendor.vendorName', 'ASC').getMany();
    }
    async findOne(id) {
        const vendor = await this.vendorsRepository.findOne({ where: { id } });
        if (!vendor) {
            throw new common_1.NotFoundException(`Vendor with ID ${id} not found`);
        }
        return vendor;
    }
    async update(id, updateVendorDto) {
        const vendor = await this.findOne(id);
        Object.assign(vendor, updateVendorDto);
        return await this.vendorsRepository.save(vendor);
    }
    async remove(id) {
        const vendor = await this.findOne(id);
        vendor.isActive = false;
        await this.vendorsRepository.save(vendor);
    }
    async updateOutstanding(id, amount, operation) {
        const vendor = await this.findOne(id);
        if (operation === 'add') {
            vendor.outstandingAmount = Number(vendor.outstandingAmount) + amount;
        }
        else {
            vendor.outstandingAmount = Math.max(0, Number(vendor.outstandingAmount) - amount);
        }
        if (vendor.isCreditLimitExceeded) {
            throw new common_1.ConflictException('Credit limit exceeded');
        }
        return await this.vendorsRepository.save(vendor);
    }
    async getTopVendors(limit = 10) {
        return await this.vendorsRepository
            .createQueryBuilder('vendor')
            .where('vendor.isActive = :isActive', { isActive: true })
            .orderBy('vendor.rating', 'DESC')
            .limit(limit)
            .getMany();
    }
};
exports.VendorsService = VendorsService;
exports.VendorsService = VendorsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(vendor_entity_1.Vendor)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], VendorsService);
//# sourceMappingURL=vendors.service.js.map