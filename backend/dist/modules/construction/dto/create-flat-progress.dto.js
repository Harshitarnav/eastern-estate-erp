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
exports.CreateFlatProgressDto = void 0;
const class_validator_1 = require("class-validator");
const construction_tower_progress_entity_1 = require("../entities/construction-tower-progress.entity");
class CreateFlatProgressDto {
}
exports.CreateFlatProgressDto = CreateFlatProgressDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateFlatProgressDto.prototype, "constructionProjectId", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateFlatProgressDto.prototype, "flatId", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(construction_tower_progress_entity_1.ConstructionPhase),
    __metadata("design:type", String)
], CreateFlatProgressDto.prototype, "phase", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateFlatProgressDto.prototype, "phaseProgress", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateFlatProgressDto.prototype, "overallProgress", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateFlatProgressDto.prototype, "startDate", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateFlatProgressDto.prototype, "expectedEndDate", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateFlatProgressDto.prototype, "actualEndDate", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(construction_tower_progress_entity_1.PhaseStatus),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateFlatProgressDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateFlatProgressDto.prototype, "notes", void 0);
//# sourceMappingURL=create-flat-progress.dto.js.map