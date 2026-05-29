"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlatResponseDto = void 0;
class FlatResponseDto {
    static fromEntity(flat, extras) {
        const dto = new FlatResponseDto();
        Object.assign(dto, flat);
        if (extras) {
            Object.assign(dto, extras);
        }
        const tower = flat.tower;
        if (tower) {
            if (!Number(dto.superBuiltUpArea) && tower.defaultSuperBuiltUpArea) {
                dto.superBuiltUpArea = tower.defaultSuperBuiltUpArea;
            }
            if (!Number(dto.builtUpArea) && tower.defaultBuiltUpArea) {
                dto.builtUpArea = tower.defaultBuiltUpArea;
            }
            if (!Number(dto.carpetArea) && tower.defaultCarpetArea) {
                dto.carpetArea = tower.defaultCarpetArea;
            }
        }
        return dto;
    }
    static fromEntities(flats, extras) {
        return flats.map((flat) => this.fromEntity(flat, extras?.[flat.id]));
    }
}
exports.FlatResponseDto = FlatResponseDto;
//# sourceMappingURL=flat-response.dto.js.map