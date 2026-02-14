"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerResponseDto = void 0;
class CustomerResponseDto {
    static fromEntity(customer) {
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
        dto.needsHomeLoan = customer.needsHomeLoan ?? false;
        dto.hasApprovedLoan = customer.hasApprovedLoan ?? false;
        dto.bankName = customer.bankName;
        dto.approvedLoanAmount = customer.approvedLoanAmount;
        dto.totalBookings = customer.totalBookings;
        dto.totalPurchases = Number(customer.totalPurchases) || 0;
        dto.totalSpent = customer.totalSpent || Number(customer.totalPurchases) || 0;
        dto.lastPurchaseDate = customer.lastPurchaseDate;
        dto.notes = customer.notes;
        dto.tags = customer.tags || [];
        dto.isActive = customer.isActive;
        dto.isVIP = customer.isVIP;
        dto.isBlacklisted = customer.isBlacklisted || false;
        dto.createdAt = customer.createdAt;
        dto.updatedAt = customer.updatedAt;
        dto.propertyId = customer.metadata?.propertyId;
        return dto;
    }
    static fromEntities(customers) {
        return customers.map((customer) => this.fromEntity(customer));
    }
}
exports.CustomerResponseDto = CustomerResponseDto;
//# sourceMappingURL=customer-response.dto.js.map