import { CustomerType } from '../entities/customer.entity';
export declare class CreateCustomerDto {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    alternatePhone?: string;
    dateOfBirth?: string;
    gender?: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
    type?: CustomerType;
    occupation?: string;
    annualIncome?: number;
    company?: string;
    panNumber?: string;
    aadharNumber?: string;
    needsHomeLoan?: boolean;
    notes?: string;
    isActive?: boolean;
}
