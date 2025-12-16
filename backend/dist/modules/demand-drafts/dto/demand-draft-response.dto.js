"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DemandDraftResponseDto = void 0;
class DemandDraftResponseDto {
    static fromEntity(entity) {
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
    static fromEntities(entities) {
        return entities.map((e) => this.fromEntity(e));
    }
}
exports.DemandDraftResponseDto = DemandDraftResponseDto;
//# sourceMappingURL=demand-draft-response.dto.js.map