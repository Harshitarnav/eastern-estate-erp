"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateMaterialShortageDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_material_shortage_dto_1 = require("./create-material-shortage.dto");
class UpdateMaterialShortageDto extends (0, mapped_types_1.PartialType)(create_material_shortage_dto_1.CreateMaterialShortageDto) {
}
exports.UpdateMaterialShortageDto = UpdateMaterialShortageDto;
//# sourceMappingURL=update-material-shortage.dto.js.map