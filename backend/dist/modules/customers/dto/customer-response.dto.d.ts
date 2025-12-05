import { Customer } from '../entities/customer.entity';
export declare class CustomerResponseDto {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    alternatePhone: string;
    dateOfBirth: string | Date;
    gender: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
    type: string;
    occupation: string;
    annualIncome: number;
    company: string;
    designation: string;
    kycStatus: string;
    panNumber: string;
    aadharNumber: string;
    needsHomeLoan: boolean;
    hasApprovedLoan: boolean;
    bankName: string;
    approvedLoanAmount: number;
    totalBookings: number;
    totalPurchases: number;
    totalSpent: number;
    lastPurchaseDate: string | Date;
    notes: string;
    tags: string[];
    isActive: boolean;
    isVIP: boolean;
    isBlacklisted: boolean;
    createdAt: string | Date;
    updatedAt: string | Date;
    fullName?: string;
    addressLine1?: string;
    addressLine2?: string;
    phoneNumber?: string;
    propertyId?: string;
    static fromEntity(customer: Customer): CustomerResponseDto;
    static fromEntities(customers: Customer[]): CustomerResponseDto[];
}
export interface PaginatedCustomersResponse {
    data: CustomerResponseDto[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}
