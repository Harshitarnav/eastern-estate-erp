import { Customer } from '../entities/customer.entity';

export class CustomerResponseDto {
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

  static fromEntity(customer: Customer): CustomerResponseDto {
    const dto = new CustomerResponseDto();
    Object.assign(dto, customer);
    return dto;
  }

  static fromEntities(customers: Customer[]): CustomerResponseDto[] {
    return customers.map((customer) => this.fromEntity(customer));
  }
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
