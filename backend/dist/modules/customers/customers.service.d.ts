import { Repository } from 'typeorm';
import { Customer } from './entities/customer.entity';
import { Booking } from '../bookings/entities/booking.entity';
import { CreateCustomerDto, UpdateCustomerDto, QueryCustomerDto, CustomerResponseDto, PaginatedCustomersResponse } from './dto';
export declare class CustomersService {
    private customersRepository;
    private bookingsRepository;
    private readonly logger;
    constructor(customersRepository: Repository<Customer>, bookingsRepository: Repository<Booking>);
    private loadBookingAggregates;
    private applyBookingAggregates;
    private generateCustomerCode;
    create(createCustomerDto: CreateCustomerDto): Promise<CustomerResponseDto>;
    findAll(query: QueryCustomerDto, accessiblePropertyIds?: string[] | null): Promise<PaginatedCustomersResponse>;
    private assertCustomerAccessible;
    findOne(id: string, accessiblePropertyIds?: string[] | null): Promise<CustomerResponseDto>;
    update(id: string, updateCustomerDto: UpdateCustomerDto, accessiblePropertyIds?: string[] | null): Promise<CustomerResponseDto>;
    remove(id: string, accessiblePropertyIds?: string[] | null): Promise<void>;
    getStatistics(propertyId?: string, accessiblePropertyIds?: string[] | null): Promise<{
        total: number;
        individual: number;
        corporate: number;
        nri: number;
        vip: number;
        kycVerified: number;
        totalRevenue: number;
    }>;
}
