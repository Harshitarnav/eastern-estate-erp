export declare class CheckDuplicateLeadDto {
    email?: string;
    phone?: string;
}
export declare class DuplicateLeadResponseDto {
    isDuplicate: boolean;
    existingLead?: {
        id: string;
        fullName: string;
        email: string;
        phoneNumber: string;
        status: string;
        source: string;
        assignedTo?: string;
        createdAt: Date;
    };
}
