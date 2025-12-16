import { DemandDraft, DemandDraftStatus } from '../entities/demand-draft.entity';
export declare class DemandDraftResponseDto {
    id: string;
    flatId: string | null;
    customerId: string | null;
    bookingId: string | null;
    milestoneId: string | null;
    amount: number;
    status: DemandDraftStatus;
    fileUrl: string | null;
    content: string | null;
    metadata: any;
    generatedAt: Date | null;
    sentAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    static fromEntity(entity: DemandDraft): DemandDraftResponseDto;
    static fromEntities(entities: DemandDraft[]): DemandDraftResponseDto[];
}
