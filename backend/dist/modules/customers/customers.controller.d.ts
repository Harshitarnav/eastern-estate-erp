import { CustomersService } from './customers.service';
import { CreateCustomerDto, UpdateCustomerDto, QueryCustomerDto, CustomerResponseDto, PaginatedCustomersResponse } from './dto';
export declare class CustomersController {
    private readonly customersService;
    constructor(customersService: CustomersService);
    create(createCustomerDto: CreateCustomerDto): Promise<CustomerResponseDto>;
    findAll(query: QueryCustomerDto): Promise<PaginatedCustomersResponse>;
    getStatistics(): Promise<{
        total: number;
        individual: number;
        corporate: number;
        nri: number;
        vip: number;
        kycVerified: number;
        totalRevenue: number;
    }>;
    findOne(id: string): Promise<CustomerResponseDto>;
    update(id: string, updateCustomerDto: UpdateCustomerDto): Promise<CustomerResponseDto>;
    remove(id: string): Promise<void>;
}
