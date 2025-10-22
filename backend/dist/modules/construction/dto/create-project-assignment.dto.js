"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateProjectAssignmentDto = void 0;
const class_validator_1 = require("class-validator");
const construction_project_assignment_entity_1 = require("../entities/construction-project-assignment.entity");
class CreateProjectAssignmentDto {
}
exports.CreateProjectAssignmentDto = CreateProjectAssignmentDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateProjectAssignmentDto.prototype, "constructionProjectId", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateProjectAssignmentDto.prototype, "employeeId", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(construction_project_assignment_entity_1.AssignmentRole),
    __metadata("design:type", String)
], CreateProjectAssignmentDto.prototype, "role", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateProjectAssignmentDto.prototype, "assignedDate", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateProjectAssignmentDto.prototype, "isActive", void 0);
//# sourceMappingURL=create-project-assignment.dto.js.map