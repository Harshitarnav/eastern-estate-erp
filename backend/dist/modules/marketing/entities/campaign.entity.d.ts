export declare class Campaign {
    id: string;
    name: string;
    description: string;
    type: string;
    status: string;
    budget: number;
    startDate: Date;
    endDate?: Date;
    notes?: string;
    attachments?: any[];
    createdAt: Date;
    updatedAt: Date;
}
