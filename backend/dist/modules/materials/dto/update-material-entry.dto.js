"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateMaterialEntryDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_material_entry_dto_1 = require("./create-material-entry.dto");
class UpdateMaterialEntryDto extends (0, mapped_types_1.PartialType)(create_material_entry_dto_1.CreateMaterialEntryDto) {
}
exports.UpdateMaterialEntryDto = UpdateMaterialEntryDto;
//# sourceMappingURL=update-material-entry.dto.js.map