import { CustomerType, KYCStatus } from '../entities/customer.entity';
export declare class QueryCustomerDto {
    search?: string;
    type?: CustomerType;
    kycStatus?: KYCStatus;
    needsHomeLoan?: boolean;
    isVIP?: boolean;
    city?: string;
    createdFrom?: string;
    createdTo?: string;
    isActive?: boolean;
    propertyId?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
}
