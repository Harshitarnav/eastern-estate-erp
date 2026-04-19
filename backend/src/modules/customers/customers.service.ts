import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Customer } from './entities/customer.entity';
import { Booking } from '../bookings/entities/booking.entity';
import {
  CreateCustomerDto,
  UpdateCustomerDto,
  QueryCustomerDto,
  CustomerResponseDto,
  PaginatedCustomersResponse,
} from './dto';

@Injectable()
export class CustomersService {
  private readonly logger = new Logger(CustomersService.name);

  constructor(
    @InjectRepository(Customer)
    private customersRepository: Repository<Customer>,
    @InjectRepository(Booking)
    private bookingsRepository: Repository<Booking>,
  ) {}

  /**
   * Aggregate booking totals per customer from the `bookings` table.
   * Returns a map from customerId → { totalBookings, totalAgreement, totalPaid, lastBookingDate }.
   *
   * This is the single source of truth for customer "lifetime value", since the
   * `customers.total_purchases` column is not kept in sync by the app.
   */
  private async loadBookingAggregates(
    customerIds: string[],
  ): Promise<
    Map<string, { totalBookings: number; totalAgreement: number; totalPaid: number; lastBookingDate: Date | null }>
  > {
    const map = new Map<
      string,
      { totalBookings: number; totalAgreement: number; totalPaid: number; lastBookingDate: Date | null }
    >();
    if (customerIds.length === 0) return map;

    const rows = await this.bookingsRepository
      .createQueryBuilder('b')
      .select('b.customerId', 'customerId')
      .addSelect('COUNT(*)', 'totalBookings')
      .addSelect('COALESCE(SUM(b.totalAmount), 0)', 'totalAgreement')
      .addSelect('COALESCE(SUM(b.paidAmount), 0)', 'totalPaid')
      .addSelect('MAX(b.bookingDate)', 'lastBookingDate')
      .where('b.customerId IN (:...ids)', { ids: customerIds })
      .andWhere('b.isActive = true')
      .andWhere("b.status <> 'CANCELLED'")
      .groupBy('b.customerId')
      .getRawMany<{
        customerId: string;
        totalBookings: string;
        totalAgreement: string;
        totalPaid: string;
        lastBookingDate: string | null;
      }>();

    for (const r of rows) {
      map.set(r.customerId, {
        totalBookings: Number(r.totalBookings) || 0,
        totalAgreement: Number(r.totalAgreement) || 0,
        totalPaid: Number(r.totalPaid) || 0,
        lastBookingDate: r.lastBookingDate ? new Date(r.lastBookingDate) : null,
      });
    }
    return map;
  }

  /** Apply booking aggregates onto response DTOs in-place. */
  private applyBookingAggregates(
    dtos: CustomerResponseDto[],
    agg: Map<string, { totalBookings: number; totalAgreement: number; totalPaid: number; lastBookingDate: Date | null }>,
  ): void {
    for (const dto of dtos) {
      const row = agg.get(dto.id);
      if (!row) {
        dto.totalBookings = 0;
        dto.totalPurchases = 0;
        dto.totalSpent = 0;
        continue;
      }
      dto.totalBookings = row.totalBookings;
      // totalPurchases = agreement value of all bookings; totalSpent = actually paid
      dto.totalPurchases = row.totalAgreement;
      dto.totalSpent = row.totalPaid;
      if (!dto.lastPurchaseDate && row.lastBookingDate) {
        dto.lastPurchaseDate = row.lastBookingDate;
      }
    }
  }

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
    const {
      firstName, lastName, phone, alternatePhone,
      isVIP, propertyId, designation, bankName,
      hasApprovedLoan, approvedLoanAmount,
      needsHomeLoan, annualIncome,
      type, kycStatus,
      ...rest
    } = createCustomerDto;

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

    // Build metadata for fields stored in JSONB
    const metadata: any = {};
    if (isVIP !== undefined) metadata.isVIP = isVIP;
    if (propertyId) metadata.propertyId = propertyId;
    if (designation) metadata.designation = designation;
    if (bankName) metadata.bankName = bankName;
    if (hasApprovedLoan !== undefined) metadata.hasApprovedLoan = hasApprovedLoan;
    if (approvedLoanAmount !== undefined) metadata.approvedLoanAmount = approvedLoanAmount;
    if (needsHomeLoan !== undefined) metadata.needsHomeLoan = needsHomeLoan;
    if (annualIncome !== undefined) metadata.annualIncome = annualIncome;

    const customer = this.customersRepository.create({
      ...rest,
      customerCode,
      fullName,
      phoneNumber,
      customerType: type as string,
      kycStatus: kycStatus as string,
      metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
    });
    const savedCustomer = await this.customersRepository.save(customer);

    return CustomerResponseDto.fromEntity(savedCustomer);
  }

  async findAll(query: QueryCustomerDto, accessiblePropertyIds?: string[] | null): Promise<PaginatedCustomersResponse> {
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

    // Helper to apply filters; toggle metadata-dependent filters to allow fallback if column missing
    const applyFilters = (qb: ReturnType<Repository<Customer>['createQueryBuilder']>, includeMetadata = true) => {
      if (search) {
        qb.andWhere(
          "(customer.fullName ILIKE :search OR customer.email ILIKE :search OR customer.phoneNumber ILIKE :search)",
          { search: `%${search}%` },
        );
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

      // Property filter: a customer "belongs" to a property if either
      //   (a) they were linked to it at create time (customer.metadata.propertyId), or
      //   (b) they have at least one booking against it.
      // Previously we only checked (b), so freshly-linked customers who had not
      // been booked yet were invisible when narrowing to that property.
      if (query.propertyId) {
        // Enforce access: if the user is scoped, the requested propertyId must be in their list.
        // (accessiblePropertyIds == null means global admin — no restriction.)
        if (
          accessiblePropertyIds &&
          accessiblePropertyIds.length > 0 &&
          !accessiblePropertyIds.includes(query.propertyId)
        ) {
          // Force an empty result — user cannot see this property.
          qb.andWhere('1 = 0');
        } else {
          qb.andWhere(
            `(
              (customer.metadata ->> 'propertyId') = :pidText
              OR EXISTS (SELECT 1 FROM bookings b WHERE b.customer_id = customer.id AND b.property_id = CAST(:pid AS uuid))
            )`,
            { pid: query.propertyId, pidText: query.propertyId },
          );
        }
      } else if (accessiblePropertyIds && accessiblePropertyIds.length > 0) {
        qb.andWhere(
          `(
            (customer.metadata ->> 'propertyId') = ANY(CAST(:pidsText AS text[]))
            OR EXISTS (SELECT 1 FROM bookings b WHERE b.customer_id = customer.id AND b.property_id = ANY(CAST(:pids AS uuid[])))
          )`,
          { pids: accessiblePropertyIds, pidsText: accessiblePropertyIds },
        );
      }

      qb.orderBy(`customer.${safeSortBy}`, sortOrder);
    };

    const materializeDtos = async (customers: Customer[]) => {
      const dtos = CustomerResponseDto.fromEntities(customers);
      const agg = await this.loadBookingAggregates(dtos.map((d) => d.id));
      this.applyBookingAggregates(dtos, agg);
      return dtos;
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
        data: await materializeDtos(customers),
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      // Fallback without metadata-dependent filters to avoid hard failures on older schemas
      this.logger.error('Failed to fetch customers with full filters. Retrying without metadata filters.', error?.stack || String(error));

      const qb = this.customersRepository.createQueryBuilder('customer');
      applyFilters(qb, false);

      const total = await qb.getCount();
      const customers = await qb
        .skip((page - 1) * limit)
        .take(limit)
        .getMany();

      return {
        data: await materializeDtos(customers),
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          warning: 'Returned without metadata-based filters (isVIP/needsHomeLoan) due to schema incompatibility.',
        } as any,
      };
    }
  }

  /**
   * Ensure the caller (identified by `accessiblePropertyIds`) is allowed to
   * see this customer. Null / undefined => global admin, no restriction.
   * A customer is "accessible" if either their metadata.propertyId is in the
   * caller's list or they have any booking on an accessible property.
   */
  private async assertCustomerAccessible(
    customerId: string,
    accessiblePropertyIds?: string[] | null,
  ): Promise<void> {
    if (!accessiblePropertyIds || accessiblePropertyIds.length === 0) return;
    const accessible = await this.customersRepository
      .createQueryBuilder('customer')
      .where('customer.id = :id', { id: customerId })
      .andWhere(
        `(
          (customer.metadata ->> 'propertyId') = ANY(CAST(:pidsText AS text[]))
          OR EXISTS (SELECT 1 FROM bookings b WHERE b.customer_id = customer.id AND b.property_id = ANY(CAST(:pids AS uuid[])))
        )`,
        { pids: accessiblePropertyIds, pidsText: accessiblePropertyIds },
      )
      .getCount();
    if (accessible === 0) {
      throw new NotFoundException(`Customer with ID ${customerId} not found`);
    }
  }

  async findOne(
    id: string,
    accessiblePropertyIds?: string[] | null,
  ): Promise<CustomerResponseDto> {
    const customer = await this.customersRepository.findOne({ where: { id } });

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    await this.assertCustomerAccessible(id, accessiblePropertyIds);

    const dto = CustomerResponseDto.fromEntity(customer);
    const agg = await this.loadBookingAggregates([id]);
    this.applyBookingAggregates([dto], agg);
    return dto;
  }

  async update(
    id: string,
    updateCustomerDto: UpdateCustomerDto,
    accessiblePropertyIds?: string[] | null,
  ): Promise<CustomerResponseDto> {
    const customer = await this.customersRepository.findOne({ where: { id } });

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    await this.assertCustomerAccessible(id, accessiblePropertyIds);

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

    const { firstName, lastName, phone, customerCode } = updateCustomerDto;

    // Map firstName and lastName to fullName if provided
    if (firstName || lastName) {
      const newFirstName = firstName || customer.firstName;
      const newLastName = lastName || customer.lastName;
      customer.fullName = `${newFirstName} ${newLastName}`.trim();
    }

    if (phone) {
      customer.phoneNumber = phone;
    }

    // Only update customer code when provided and non-empty
    if (typeof customerCode === 'string' && customerCode.trim().length > 0) {
      customer.customerCode = customerCode.trim();
    }

    // Map allowed fields explicitly to avoid accidentally writing unsupported columns
    const assignIfPresent = <T>(val: T | undefined | null, setter: (v: T) => void) => {
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

    // Handle type (maps to customerType column - now writable)
    if (updateCustomerDto.type !== undefined && updateCustomerDto.type !== ('' as any)) {
      customer.customerType = updateCustomerDto.type as string;
    }

    // Handle kycStatus (now writable)
    if (updateCustomerDto.kycStatus !== undefined && updateCustomerDto.kycStatus !== ('' as any)) {
      customer.kycStatus = updateCustomerDto.kycStatus as string;
    }

    // Update metadata JSONB - merge patch so existing keys are preserved
    const metaPatch: any = {};
    if (updateCustomerDto.isVIP !== undefined) metaPatch.isVIP = updateCustomerDto.isVIP;
    if (updateCustomerDto.designation !== undefined) metaPatch.designation = updateCustomerDto.designation;
    if (updateCustomerDto.bankName !== undefined) metaPatch.bankName = updateCustomerDto.bankName;
    if (updateCustomerDto.hasApprovedLoan !== undefined) metaPatch.hasApprovedLoan = updateCustomerDto.hasApprovedLoan;
    if (updateCustomerDto.approvedLoanAmount !== undefined) metaPatch.approvedLoanAmount = updateCustomerDto.approvedLoanAmount;
    if (updateCustomerDto.needsHomeLoan !== undefined) metaPatch.needsHomeLoan = updateCustomerDto.needsHomeLoan;
    if (updateCustomerDto.annualIncome !== undefined) metaPatch.annualIncome = updateCustomerDto.annualIncome;
    if (updateCustomerDto.propertyId !== undefined) metaPatch.propertyId = updateCustomerDto.propertyId;

    if (Object.keys(metaPatch).length > 0) {
      customer.metadata = { ...(customer.metadata || {}), ...metaPatch };
    }

    assignIfPresent(updateCustomerDto.notes, (v) => (customer.notes = v));

    // Tri-state auto-send override: `null` is a meaningful value (means
    // "clear the override, inherit from property/company"), so we check
    // only for `undefined` - assignIfPresent would silently drop `null`.
    if (updateCustomerDto.autoSendMilestoneDemandDrafts !== undefined) {
      customer.autoSendMilestoneDemandDrafts =
        updateCustomerDto.autoSendMilestoneDemandDrafts;
    }

    const updatedCustomer = await this.customersRepository.save(customer);

    return CustomerResponseDto.fromEntity(updatedCustomer);
  }

  async remove(
    id: string,
    accessiblePropertyIds?: string[] | null,
  ): Promise<void> {
    const customer = await this.customersRepository.findOne({ where: { id } });

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    await this.assertCustomerAccessible(id, accessiblePropertyIds);

    customer.isActive = false;
    await this.customersRepository.save(customer);
  }

  async getStatistics(
    propertyId?: string,
    accessiblePropertyIds?: string[] | null,
  ) {
    // Mirror the same (metadata OR bookings) logic used by findAll() so
    // the numbers on the cards match the customers visible in the list
    // for the current top-bar property selection.
    const qb = this.customersRepository
      .createQueryBuilder('customer')
      .where('customer.isActive = true');

    if (propertyId) {
      if (
        accessiblePropertyIds &&
        accessiblePropertyIds.length > 0 &&
        !accessiblePropertyIds.includes(propertyId)
      ) {
        qb.andWhere('1 = 0');
      } else {
        qb.andWhere(
          `(
            (customer.metadata ->> 'propertyId') = :pidText
            OR EXISTS (SELECT 1 FROM bookings b WHERE b.customer_id = customer.id AND b.property_id = CAST(:pid AS uuid))
          )`,
          { pid: propertyId, pidText: propertyId },
        );
      }
    } else if (accessiblePropertyIds && accessiblePropertyIds.length > 0) {
      qb.andWhere(
        `(
          (customer.metadata ->> 'propertyId') = ANY(CAST(:pidsText AS text[]))
          OR EXISTS (SELECT 1 FROM bookings b WHERE b.customer_id = customer.id AND b.property_id = ANY(CAST(:pids AS uuid[])))
        )`,
        { pids: accessiblePropertyIds, pidsText: accessiblePropertyIds },
      );
    }

    const customers = await qb.getMany();

    const total = customers.length;
    const individual = customers.filter((c) => c.type === 'INDIVIDUAL').length;
    const corporate = customers.filter((c) => c.type === 'CORPORATE').length;
    const nri = customers.filter((c) => c.type === 'NRI').length;
    const vip = customers.filter((c) => c.isVIP).length;
    const kycVerified = customers.filter((c) => c.kycStatus === 'VERIFIED').length;

    // Sum of paidAmount across every active, non-cancelled booking - same source as customer list.
    const revQb = this.bookingsRepository
      .createQueryBuilder('b')
      .select('COALESCE(SUM(b.paidAmount), 0)', 'totalRevenue')
      .where('b.isActive = true')
      .andWhere("b.status <> 'CANCELLED'");

    if (propertyId) {
      if (
        accessiblePropertyIds &&
        accessiblePropertyIds.length > 0 &&
        !accessiblePropertyIds.includes(propertyId)
      ) {
        revQb.andWhere('1 = 0');
      } else {
        revQb.andWhere('b.propertyId = :propertyId', { propertyId });
      }
    } else if (accessiblePropertyIds && accessiblePropertyIds.length > 0) {
      revQb.andWhere('b.propertyId IN (:...accessiblePropertyIds)', {
        accessiblePropertyIds,
      });
    }

    const { totalRevenue } =
      (await revQb.getRawOne<{ totalRevenue: string }>()) ?? { totalRevenue: '0' };

    return {
      total,
      individual,
      corporate,
      nri,
      vip,
      kycVerified,
      totalRevenue: Number(totalRevenue) || 0,
    };
  }
}
