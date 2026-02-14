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
var CustomersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const customer_entity_1 = require("./entities/customer.entity");
const dto_1 = require("./dto");
let CustomersService = CustomersService_1 = class CustomersService {
    constructor(customersRepository) {
        this.customersRepository = customersRepository;
        this.logger = new common_1.Logger(CustomersService_1.name);
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
        const { firstName, lastName, phone, alternatePhone, isVIP, propertyId, ...rest } = createCustomerDto;
        const safeFirst = (firstName || '').trim();
        const safeLast = (lastName || '').trim();
        const fullName = [safeFirst, safeLast].filter(Boolean).join(' ') || 'Customer';
        let phoneNumber = (phone || '').trim();
        if (!phoneNumber) {
            phoneNumber = (alternatePhone || '').trim();
        }
        if (!phoneNumber) {
            phoneNumber = 'UNKNOWN';
        }
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
            phoneNumber,
            metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
        });
        const savedCustomer = await this.customersRepository.save(customer);
        return dto_1.CustomerResponseDto.fromEntity(savedCustomer);
    }
    async findAll(query) {
        const { search, type, kycStatus, needsHomeLoan, isVIP, city, createdFrom, createdTo, isActive, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'DESC', } = query;
        const allowedSortFields = [
            'createdAt',
            'updatedAt',
            'customerCode',
            'phoneNumber',
            'city',
            'kycStatus',
            'customerType',
        ];
        const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
        const applyFilters = (qb, includeMetadata = true) => {
            if (search) {
                qb.andWhere("(customer.fullName ILIKE :search OR customer.email ILIKE :search OR customer.phoneNumber ILIKE :search)", { search: `%${search}%` });
            }
            if (type) {
                qb.andWhere('customer.customerType = :type', { type });
            }
            if (kycStatus) {
                qb.andWhere('customer.kycStatus = :kycStatus', { kycStatus });
            }
            if (includeMetadata && needsHomeLoan !== undefined) {
                qb.andWhere("(customer.metadata ->> 'needsHomeLoan')::boolean = :needsHomeLoan", {
                    needsHomeLoan,
                });
            }
            if (includeMetadata && isVIP !== undefined) {
                qb.andWhere("(customer.metadata ->> 'isVIP')::boolean = :isVIP", { isVIP });
            }
            if (city) {
                qb.andWhere('customer.city = :city', { city });
            }
            if (createdFrom) {
                qb.andWhere('customer.createdAt >= :createdFrom', { createdFrom });
            }
            if (createdTo) {
                qb.andWhere('customer.createdAt <= :createdTo', { createdTo });
            }
            if (isActive !== undefined) {
                qb.andWhere('customer.isActive = :isActive', { isActive });
            }
            if (query.propertyId) {
                qb.andWhere('EXISTS (SELECT 1 FROM bookings b WHERE b.customer_id = customer.id AND b.property_id = CAST(:pid AS uuid))', { pid: query.propertyId });
            }
            qb.orderBy(`customer.${safeSortBy}`, sortOrder);
        };
        try {
            const qb = this.customersRepository.createQueryBuilder('customer');
            applyFilters(qb, true);
            const total = await qb.getCount();
            const customers = await qb
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
        catch (error) {
            this.logger.error('Failed to fetch customers with full filters. Retrying without metadata filters.', error?.stack || String(error));
            const qb = this.customersRepository.createQueryBuilder('customer');
            applyFilters(qb, false);
            const total = await qb.getCount();
            const customers = await qb
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
                    warning: 'Returned without metadata-based filters (isVIP/needsHomeLoan) due to schema incompatibility.',
                },
            };
        }
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
        const { firstName, lastName, phone, customerCode } = updateCustomerDto;
        if (firstName || lastName) {
            const newFirstName = firstName || customer.firstName;
            const newLastName = lastName || customer.lastName;
            customer.fullName = `${newFirstName} ${newLastName}`.trim();
        }
        if (phone) {
            customer.phoneNumber = phone;
        }
        if (typeof customerCode === 'string' && customerCode.trim().length > 0) {
            customer.customerCode = customerCode.trim();
        }
        const assignIfPresent = (val, setter) => {
            if (val !== undefined && val !== null && val !== '') {
                setter(val);
            }
        };
        assignIfPresent(updateCustomerDto.email, (v) => (customer.email = v));
        assignIfPresent(updateCustomerDto.alternatePhone, (v) => (customer.alternatePhone = v));
        assignIfPresent(updateCustomerDto.dateOfBirth, (v) => (customer.dateOfBirth = new Date(v)));
        assignIfPresent(updateCustomerDto.gender, (v) => (customer.gender = v));
        assignIfPresent(updateCustomerDto.occupation, (v) => (customer.occupation = v));
        assignIfPresent(updateCustomerDto.company, (v) => (customer.companyName = v));
        assignIfPresent(updateCustomerDto.panNumber, (v) => (customer.panNumber = v));
        assignIfPresent(updateCustomerDto.aadharNumber, (v) => (customer.aadharNumber = v));
        assignIfPresent(updateCustomerDto.address, (v) => (customer.addressLine1 = v));
        assignIfPresent(updateCustomerDto.city, (v) => (customer.city = v));
        assignIfPresent(updateCustomerDto.state, (v) => (customer.state = v));
        assignIfPresent(updateCustomerDto.pincode, (v) => (customer.pincode = v));
        if (updateCustomerDto.isActive !== undefined) {
            customer.isActive = updateCustomerDto.isActive;
        }
        if (updateCustomerDto.isVIP !== undefined) {
            customer.metadata = customer.metadata || {};
            customer.metadata.isVIP = updateCustomerDto.isVIP;
        }
        assignIfPresent(updateCustomerDto.notes, (v) => (customer.notes = v));
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
exports.CustomersService = CustomersService = CustomersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(customer_entity_1.Customer)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], CustomersService);
//# sourceMappingURL=customers.service.js.map