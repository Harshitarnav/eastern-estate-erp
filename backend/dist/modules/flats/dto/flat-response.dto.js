"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlatResponseDto = void 0;
class FlatResponseDto {
    static fromEntity(flat) {
        const dto = new FlatResponseDto();
        Object.assign(dto, flat);
        return dto;
    }
    static fromEntities(flats) {
        return flats.map((flat) => this.fromEntity(flat));
    }
}
exports.FlatResponseDto = FlatResponseDto;
//# sourceMappingURL=flat-response.dto.js.map