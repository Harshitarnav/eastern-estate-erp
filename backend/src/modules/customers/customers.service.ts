import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Customer } from './entities/customer.entity';
import {
  CreateCustomerDto,
  UpdateCustomerDto,
  QueryCustomerDto,
  CustomerResponseDto,
  PaginatedCustomersResponse,
} from './dto';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private customersRepository: Repository<Customer>,
  ) {}

  /**
   * Generate unique customer code
   */
  private async generateCustomerCode(): Promise<string> {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');

    // Get count of customers created in the current month to generate sequence
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const startOfNextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1);
    const count = await this.customersRepository.count({
      where: {
        createdAt: Between(startOfMonth as any, startOfNextMonth as any),
      },
    });

    // Try next codes until a free one is found (handles concurrent inserts)
    let sequenceNumber = count + 1;
    // eslint-disable-next-line no-constant-condition
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

  async create(createCustomerDto: CreateCustomerDto): Promise<CustomerResponseDto> {
    const existing = await this.customersRepository.findOne({
      where: [
        { email: createCustomerDto.email },
        { phoneNumber: createCustomerDto.phone },
      ],
    });

    if (existing) {
      throw new ConflictException('Customer with this email or phone already exists');
    }

    // Generate unique customer code
    const customerCode = await this.generateCustomerCode();

    // Map firstName and lastName to fullName
    const { firstName, lastName, phone, alternatePhone, isVIP, propertyId, ...rest } =
      createCustomerDto;

    // Build a safe full name even if pieces are missing
    const safeFirst = (firstName || '').trim();
    const safeLast = (lastName || '').trim();
    const fullName = [safeFirst, safeLast].filter(Boolean).join(' ') || 'Customer';

    // Ensure we always have a phone number stored (DB column is NOT NULL)
    let phoneNumber = (phone || '').trim();
    if (!phoneNumber) {
      phoneNumber = (alternatePhone || '').trim();
    }
    if (!phoneNumber) {
      phoneNumber = 'UNKNOWN';
    }

    // Handle isVIP and other metadata fields
    const metadata: any = {};
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
      legacyFirstName: safeFirst || fullName,
      legacyLastName: safeLast || '',
      phoneNumber,
      legacyPhone: phoneNumber,
      metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
    });
    const savedCustomer = await this.customersRepository.save(customer);

    return CustomerResponseDto.fromEntity(savedCustomer);
  }

  async findAll(query: QueryCustomerDto): Promise<PaginatedCustomersResponse> {
    const {
      search,
      type,
      kycStatus,
      needsHomeLoan,
      isVIP,
      city,
      createdFrom,
      createdTo,
      isActive,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = query;

    const queryBuilder = this.customersRepository.createQueryBuilder('customer');

    if (search) {
      queryBuilder.andWhere(
        "(customer.fullName ILIKE :search OR customer.email ILIKE :search OR customer.phoneNumber ILIKE :search)",
        { search: `%${search}%` },
      );
    }

    if (type) {
      queryBuilder.andWhere('customer.customerType = :type', { type });
    }

    if (kycStatus) {
      queryBuilder.andWhere('customer.kycStatus = :kycStatus', { kycStatus });
    }

    if (needsHomeLoan !== undefined) {
      queryBuilder.andWhere(
        "(customer.metadata ->> 'needsHomeLoan')::boolean = :needsHomeLoan",
        { needsHomeLoan },
      );
    }

    if (isVIP !== undefined) {
      queryBuilder.andWhere("(customer.metadata ->> 'isVIP')::boolean = :isVIP", { isVIP });
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
      queryBuilder.andWhere(
        `(customer.metadata ->> 'propertyId') = :pid OR EXISTS (SELECT 1 FROM bookings b WHERE b.customer_id = customer.id AND b.property_id = CAST(:pid AS uuid))`,
        { pid: query.propertyId },
      );
    }

    queryBuilder.orderBy(`customer.${sortBy}`, sortOrder);

    const total = await queryBuilder.getCount();
    const customers = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      data: CustomerResponseDto.fromEntities(customers),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<CustomerResponseDto> {
    const customer = await this.customersRepository.findOne({ where: { id } });

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    return CustomerResponseDto.fromEntity(customer);
  }

  async update(id: string, updateCustomerDto: UpdateCustomerDto): Promise<CustomerResponseDto> {
    const customer = await this.customersRepository.findOne({ where: { id } });

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    if (updateCustomerDto.email || updateCustomerDto.phone) {
      const existing = await this.customersRepository.findOne({
        where: [
          { email: updateCustomerDto.email || customer.email },
          { phoneNumber: updateCustomerDto.phone || customer.phoneNumber },
        ],
      });

      if (existing && existing.id !== id) {
        throw new ConflictException('Customer with this email or phone already exists');
      }
    }

    // Map firstName and lastName to fullName if provided
    const { firstName, lastName, phone, ...rest } = updateCustomerDto;
    
    if (firstName || lastName) {
      const newFirstName = firstName || customer.firstName;
      const newLastName = lastName || customer.lastName;
      customer.fullName = `${newFirstName} ${newLastName}`.trim();
      customer.legacyFirstName = newFirstName;
      customer.legacyLastName = newLastName;
    }
    
    if (phone) {
      customer.phoneNumber = phone;
      customer.legacyPhone = phone;
    }

    Object.assign(customer, rest);
    const updatedCustomer = await this.customersRepository.save(customer);

    return CustomerResponseDto.fromEntity(updatedCustomer);
  }

  async remove(id: string): Promise<void> {
    const customer = await this.customersRepository.findOne({ where: { id } });

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
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
}
