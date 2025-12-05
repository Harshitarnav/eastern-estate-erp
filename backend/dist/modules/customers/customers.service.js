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
exports.CustomersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const customer_entity_1 = require("./entities/customer.entity");
const dto_1 = require("./dto");
let CustomersService = class CustomersService {
    constructor(customersRepository) {
        this.customersRepository = customersRepository;
    }
    async generateCustomerCode() {
        const date = new Date();
        const year = date.getFullYear().toString().slice(-2);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
        const startOfNextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1);
        const count = await this.customersRepository.count({
            where: {
                createdAt: (0, typeorm_2.Between)(startOfMonth, startOfNextMonth),
            },
        });
        let sequenceNumber = count + 1;
        while (true) {
            const sequence = sequenceNumber.toString().padStart(4, '0');
            const code = `CU${year}${month}${sequence}`;
            const exists = await this.customersRepository.findOne({
                where: { customerCode: code },
                select: ['id'],
            });
            if (!exists) {
                return code;
            }
            sequenceNumber += 1;
        }
    }
    async create(createCustomerDto) {
        const existing = await this.customersRepository.findOne({
            where: [
                { email: createCustomerDto.email },
                { phoneNumber: createCustomerDto.phone },
            ],
        });
        if (existing) {
            throw new common_1.ConflictException('Customer with this email or phone already exists');
        }
        const customerCode = await this.generateCustomerCode();
        const { firstName, lastName, phone, isVIP, propertyId, ...rest } = createCustomerDto;
        const fullName = `${firstName} ${lastName}`.trim();
        const metadata = {};
        if (isVIP !== undefined) {
            metadata.isVIP = isVIP;
        }
        if (propertyId) {
            metadata.propertyId = propertyId;
        }
        const customer = this.customersRepository.create({
            ...rest,
            customerCode,
            fullName,
            phoneNumber: phone,
            metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
        });
        const savedCustomer = await this.customersRepository.save(customer);
        return dto_1.CustomerResponseDto.fromEntity(savedCustomer);
    }
    async findAll(query) {
        const { search, type, kycStatus, needsHomeLoan, isVIP, city, createdFrom, createdTo, isActive, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'DESC', } = query;
        const queryBuilder = this.customersRepository.createQueryBuilder('customer');
        if (search) {
            queryBuilder.andWhere('(customer.firstName ILIKE :search OR customer.lastName ILIKE :search OR customer.email ILIKE :search OR customer.phone ILIKE :search)', { search: `%${search}%` });
        }
        if (type) {
            queryBuilder.andWhere('customer.type = :type', { type });
        }
        if (kycStatus) {
            queryBuilder.andWhere('customer.kycStatus = :kycStatus', { kycStatus });
        }
        if (needsHomeLoan !== undefined) {
            queryBuilder.andWhere('customer.needsHomeLoan = :needsHomeLoan', { needsHomeLoan });
        }
        if (isVIP !== undefined) {
            queryBuilder.andWhere('customer.isVIP = :isVIP', { isVIP });
        }
        if (city) {
            queryBuilder.andWhere('customer.city = :city', { city });
        }
        if (createdFrom) {
            queryBuilder.andWhere('customer.createdAt >= :createdFrom', { createdFrom });
        }
        if (createdTo) {
            queryBuilder.andWhere('customer.createdAt <= :createdTo', { createdTo });
        }
        if (isActive !== undefined) {
            queryBuilder.andWhere('customer.isActive = :isActive', { isActive });
        }
        if (query.propertyId) {
            queryBuilder.andWhere(`(customer.metadata ->> 'propertyId') = :pid OR EXISTS (SELECT 1 FROM bookings b WHERE b.customer_id = customer.id AND b.property_id = CAST(:pid AS uuid))`, { pid: query.propertyId });
        }
        queryBuilder.orderBy(`customer.${sortBy}`, sortOrder);
        const total = await queryBuilder.getCount();
        const customers = await queryBuilder
            .skip((page - 1) * limit)
            .take(limit)
            .getMany();
        return {
            data: dto_1.CustomerResponseDto.fromEntities(customers),
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async findOne(id) {
        const customer = await this.customersRepository.findOne({ where: { id } });
        if (!customer) {
            throw new common_1.NotFoundException(`Customer with ID ${id} not found`);
        }
        return dto_1.CustomerResponseDto.fromEntity(customer);
    }
    async update(id, updateCustomerDto) {
        const customer = await this.customersRepository.findOne({ where: { id } });
        if (!customer) {
            throw new common_1.NotFoundException(`Customer with ID ${id} not found`);
        }
        if (updateCustomerDto.email || updateCustomerDto.phone) {
            const existing = await this.customersRepository.findOne({
                where: [
                    { email: updateCustomerDto.email || customer.email },
                    { phoneNumber: updateCustomerDto.phone || customer.phoneNumber },
                ],
            });
            if (existing && existing.id !== id) {
                throw new common_1.ConflictException('Customer with this email or phone already exists');
            }
        }
        const { firstName, lastName, phone, ...rest } = updateCustomerDto;
        if (firstName || lastName) {
            const newFirstName = firstName || customer.firstName;
            const newLastName = lastName || customer.lastName;
            customer.fullName = `${newFirstName} ${newLastName}`.trim();
        }
        if (phone) {
            customer.phoneNumber = phone;
        }
        Object.assign(customer, rest);
        const updatedCustomer = await this.customersRepository.save(customer);
        return dto_1.CustomerResponseDto.fromEntity(updatedCustomer);
    }
    async remove(id) {
        const customer = await this.customersRepository.findOne({ where: { id } });
        if (!customer) {
            throw new common_1.NotFoundException(`Customer with ID ${id} not found`);
        }
        customer.isActive = false;
        await this.customersRepository.save(customer);
    }
    async getStatistics() {
        const customers = await this.customersRepository.find({ where: { isActive: true } });
        const total = customers.length;
        const individual = customers.filter((c) => c.type === 'INDIVIDUAL').length;
        const corporate = customers.filter((c) => c.type === 'CORPORATE').length;
        const nri = customers.filter((c) => c.type === 'NRI').length;
        const vip = customers.filter((c) => c.isVIP).length;
        const kycVerified = customers.filter((c) => c.kycStatus === 'VERIFIED').length;
        const totalRevenue = customers.reduce((sum, c) => sum + Number(c.totalSpent), 0);
        return {
            total,
            individual,
            corporate,
            nri,
            vip,
            kycVerified,
            totalRevenue,
        };
    }
};
exports.CustomersService = CustomersService;
exports.CustomersService = CustomersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(customer_entity_1.Customer)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], CustomersService);
//# sourceMappingURL=customers.service.js.map