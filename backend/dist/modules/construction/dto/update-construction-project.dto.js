"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateConstructionProjectDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_construction_project_dto_1 = require("./create-construction-project.dto");
class UpdateConstructionProjectDto extends (0, mapped_types_1.PartialType)(create_construction_project_dto_1.CreateConstructionProjectDto) {
}
exports.UpdateConstructionProjectDto = UpdateConstructionProjectDto;
//# sourceMappingURL=update-construction-project.dto.js.map