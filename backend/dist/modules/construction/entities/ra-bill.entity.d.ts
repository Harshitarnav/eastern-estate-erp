import { ConstructionProject } from './construction-project.entity';
import { Vendor } from '../../vendors/entities/vendor.entity';
import { Property } from '../../properties/entities/property.entity';
import { User } from '../../users/entities/user.entity';
export declare enum RABillStatus {
    DRAFT = "DRAFT",
    SUBMITTED = "SUBMITTED",
    CERTIFIED = "CERTIFIED",
    APPROVED = "APPROVED",
    PAID = "PAID",
    REJECTED = "REJECTED"
}
export declare class RABill {
    id: string;
    raBillNumber: string;
    vendorId: string;
    vendor: Vendor;
    constructionProjectId: string;
    constructionProject: ConstructionProject;
    propertyId: string | null;
    property: Property;
    billDate: Date;
    billPeriodStart: Date | null;
    billPeriodEnd: Date | null;
    workDescription: string;
    grossAmount: number;
    previousBillsAmount: number;
    netThisBill: number;
    retentionPercentage: number;
    retentionAmount: number;
    advanceDeduction: number;
    otherDeductions: number;
    otherDeductionsDescription: string | null;
    netPayable: number;
    status: RABillStatus;
    certifiedBy: string | null;
    certifier: User;
    certifiedAt: Date | null;
    approvedBy: string | null;
    approver: User;
    approvedAt: Date | null;
    paidAt: Date | null;
    paymentReference: string | null;
    notes: string | null;
    createdBy: string | null;
    creator: User;
    journalEntryId: string | null;
    createdAt: Date;
    updatedAt: Date;
}
