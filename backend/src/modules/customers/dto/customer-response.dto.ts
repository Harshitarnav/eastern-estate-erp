import { Customer } from '../entities/customer.entity';

export class CustomerResponseDto {
  id: string;
  customerCode?: string;
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

  static fromEntity(customer: Customer): CustomerResponseDto {
    const dto = new CustomerResponseDto();
    dto.id = customer.id;
    dto.customerCode = customer.customerCode;
    const fullName = customer.fullName || '';
    const [firstName, ...rest] = fullName.split(' ').filter(Boolean);
    dto.fullName = fullName;
    dto.firstName = firstName || customer.firstName || '';
    dto.lastName = rest.join(' ') || customer.lastName || '';
    dto.email = customer.email;
    dto.phone = customer.phoneNumber || '';
    dto.phoneNumber = customer.phoneNumber || '';
    dto.alternatePhone = customer.alternatePhone;
    dto.dateOfBirth = customer.dateOfBirth;
    dto.gender = customer.gender;
    dto.address = customer.addressLine1 || customer.address;
    dto.addressLine1 = customer.addressLine1 || customer.address;
    dto.addressLine2 = customer.addressLine2;
    dto.city = customer.city;
    dto.state = customer.state;
    dto.pincode = customer.pincode;
    dto.country = customer.country;
    dto.type = customer.type;
    dto.occupation = customer.occupation;
    dto.annualIncome = customer.annualIncome;
    dto.company = customer.companyName || customer.company;
    dto.designation = customer.designation;
    dto.kycStatus = customer.kycStatus;
    dto.panNumber = customer.panNumber;
    dto.aadharNumber = customer.aadharNumber;
    dto.needsHomeLoan = (customer as any).needsHomeLoan ?? false;
    dto.hasApprovedLoan = (customer as any).hasApprovedLoan ?? false;
    dto.bankName = (customer as any).bankName;
    dto.approvedLoanAmount = (customer as any).approvedLoanAmount;
    dto.totalBookings = customer.totalBookings;
    dto.totalPurchases = Number(customer.totalPurchases) || 0;
    dto.totalSpent = customer.totalSpent || Number(customer.totalPurchases) || 0;
    dto.lastPurchaseDate = (customer as any).lastPurchaseDate;
    dto.notes = customer.notes;
    dto.tags = (customer as any).tags || [];
    dto.isActive = customer.isActive;
    dto.isVIP = customer.isVIP;
    dto.isBlacklisted = (customer as any).isBlacklisted || false;
    dto.createdAt = customer.createdAt;
    dto.updatedAt = customer.updatedAt;
    dto.propertyId = customer.metadata?.propertyId;
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
