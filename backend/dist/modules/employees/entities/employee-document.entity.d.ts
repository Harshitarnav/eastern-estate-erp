import { Employee } from './employee.entity';
export declare enum DocumentType {
    AADHAR_CARD = "AADHAR_CARD",
    PAN_CARD = "PAN_CARD",
    PASSPORT = "PASSPORT",
    DRIVING_LICENSE = "DRIVING_LICENSE",
    VOTER_ID = "VOTER_ID",
    EDUCATION_CERTIFICATE = "EDUCATION_CERTIFICATE",
    EXPERIENCE_LETTER = "EXPERIENCE_LETTER",
    RELIEVING_LETTER = "RELIEVING_LETTER",
    SALARY_SLIP = "SALARY_SLIP",
    BANK_STATEMENT = "BANK_STATEMENT",
    APPOINTMENT_LETTER = "APPOINTMENT_LETTER",
    RESIGNATION_LETTER = "RESIGNATION_LETTER",
    NOC = "NOC",
    MEDICAL_CERTIFICATE = "MEDICAL_CERTIFICATE",
    POLICE_VERIFICATION = "POLICE_VERIFICATION",
    OTHER = "OTHER"
}
export declare enum DocumentStatus {
    PENDING = "PENDING",
    SUBMITTED = "SUBMITTED",
    VERIFIED = "VERIFIED",
    REJECTED = "REJECTED",
    EXPIRED = "EXPIRED"
}
export declare class EmployeeDocument {
    id: string;
    employeeId: string;
    employee: Employee;
    documentType: DocumentType;
    documentName: string;
    documentNumber: string;
    documentDescription: string;
    documentUrl: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    documentStatus: DocumentStatus;
    issueDate: Date;
    expiryDate: Date;
    isExpirable: boolean;
    isVerified: boolean;
    verifiedBy: string;
    verifiedByName: string;
    verifiedAt: Date;
    verificationRemarks: string;
    rejectedBy: string;
    rejectedAt: Date;
    rejectionReason: string;
    submittedDate: Date;
    submissionRemarks: string;
    sendExpiryReminder: boolean;
    reminderDaysBefore: number;
    lastReminderSent: Date;
    notes: string;
    tags: string[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
}
