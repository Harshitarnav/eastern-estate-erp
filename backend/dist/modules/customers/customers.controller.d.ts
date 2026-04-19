import { CustomersService } from './customers.service';
import { CreateCustomerDto, UpdateCustomerDto, QueryCustomerDto, CustomerResponseDto, PaginatedCustomersResponse } from './dto';
export declare class CustomersController {
    private readonly customersService;
    constructor(customersService: CustomersService);
    create(createCustomerDto: CreateCustomerDto): Promise<CustomerResponseDto>;
    findAll(query: QueryCustomerDto, req: any): Promise<PaginatedCustomersResponse>;
    getStatistics(propertyId: string | undefined, req: any): Promise<{
        total: number;
        individual: number;
        corporate: number;
        nri: number;
        vip: number;
        kycVerified: number;
        totalRevenue: number;
    }>;
    findOne(id: string, req: any): Promise<CustomerResponseDto>;
    update(id: string, updateCustomerDto: UpdateCustomerDto, req: any): Promise<CustomerResponseDto>;
    remove(id: string, req: any): Promise<void>;
}
