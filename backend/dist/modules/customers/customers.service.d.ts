import { Repository } from 'typeorm';
import { Customer } from './entities/customer.entity';
import { CreateCustomerDto, UpdateCustomerDto, QueryCustomerDto, CustomerResponseDto, PaginatedCustomersResponse } from './dto';
export declare class CustomersService {
    private customersRepository;
    constructor(customersRepository: Repository<Customer>);
    create(createCustomerDto: CreateCustomerDto): Promise<CustomerResponseDto>;
    findAll(query: QueryCustomerDto): Promise<PaginatedCustomersResponse>;
    findOne(id: string): Promise<CustomerResponseDto>;
    update(id: string, updateCustomerDto: UpdateCustomerDto): Promise<CustomerResponseDto>;
    remove(id: string): Promise<void>;
    getStatistics(): Promise<{
        total: number;
        individual: number;
        corporate: number;
        nri: number;
        vip: number;
        kycVerified: number;
        totalRevenue: number;
    }>;
}
