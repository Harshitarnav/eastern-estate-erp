"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateTowerProgressDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_tower_progress_dto_1 = require("./create-tower-progress.dto");
class UpdateTowerProgressDto extends (0, mapped_types_1.PartialType)(create_tower_progress_dto_1.CreateTowerProgressDto) {
}
exports.UpdateTowerProgressDto = UpdateTowerProgressDto;
//# sourceMappingURL=update-tower-progress.dto.js.map