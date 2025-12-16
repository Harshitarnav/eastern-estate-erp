import { DemandDraft, DemandDraftStatus } from '../entities/demand-draft.entity';

export class DemandDraftResponseDto {
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

  static fromEntity(entity: DemandDraft): DemandDraftResponseDto {
    const dto = new DemandDraftResponseDto();
    dto.id = entity.id;
    dto.flatId = entity.flatId;
    dto.customerId = entity.customerId;
    dto.bookingId = entity.bookingId;
    dto.milestoneId = entity.milestoneId;
    dto.amount = Number(entity.amount || 0);
    dto.status = entity.status;
    dto.fileUrl = entity.fileUrl;
    dto.content = entity.content;
    dto.metadata = entity.metadata;
    dto.generatedAt = entity.generatedAt;
    dto.sentAt = entity.sentAt;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    return dto;
  }

  static fromEntities(entities: DemandDraft[]): DemandDraftResponseDto[] {
    return entities.map((e) => this.fromEntity(e));
  }
}
