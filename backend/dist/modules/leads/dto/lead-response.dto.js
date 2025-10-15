"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeadResponseDto = void 0;
class LeadResponseDto {
    static fromEntity(lead) {
        const dto = new LeadResponseDto();
        Object.assign(dto, lead);
        return dto;
    }
    static fromEntities(leads) {
        return leads.map((lead) => this.fromEntity(lead));
    }
}
exports.LeadResponseDto = LeadResponseDto;
//# sourceMappingURL=lead-response.dto.js.map