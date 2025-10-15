"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateFlatDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_flat_dto_1 = require("./create-flat.dto");
class UpdateFlatDto extends (0, mapped_types_1.PartialType)(create_flat_dto_1.CreateFlatDto) {
}
exports.UpdateFlatDto = UpdateFlatDto;
//# sourceMappingURL=update-flat.dto.js.map