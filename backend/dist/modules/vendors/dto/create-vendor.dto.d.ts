export declare class CreateVendorDto {
    vendorCode: string;
    vendorName: string;
    contactPerson?: string;
    email?: string;
    phoneNumber: string;
    alternatePhone?: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
    gstNumber?: string;
    panNumber?: string;
    bankName?: string;
    bankAccountNumber?: string;
    ifscCode?: string;
    materialsSupplied?: string[];
    rating?: number;
    paymentTerms?: string;
    creditLimit?: number;
    outstandingAmount?: number;
    isActive?: boolean;
}
