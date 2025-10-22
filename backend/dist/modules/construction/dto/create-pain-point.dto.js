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
exports.CreatePainPointDto = void 0;
const class_validator_1 = require("class-validator");
const pain_point_entity_1 = require("../entities/pain-point.entity");
class CreatePainPointDto {
}
exports.CreatePainPointDto = CreatePainPointDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreatePainPointDto.prototype, "constructionProjectId", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreatePainPointDto.prototype, "reportedBy", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(pain_point_entity_1.PainPointType),
    __metadata("design:type", String)
], CreatePainPointDto.prototype, "painPointType", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 255),
    __metadata("design:type", String)
], CreatePainPointDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePainPointDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(pain_point_entity_1.PainPointSeverity),
    __metadata("design:type", String)
], CreatePainPointDto.prototype, "severity", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(pain_point_entity_1.PainPointStatus),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreatePainPointDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreatePainPointDto.prototype, "reportedDate", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreatePainPointDto.prototype, "resolutionNotes", void 0);
//# sourceMappingURL=create-pain-point.dto.js.map