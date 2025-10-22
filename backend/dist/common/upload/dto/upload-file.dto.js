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
exports.FileResponseDto = exports.UploadFileDto = exports.FileCategory = void 0;
const class_validator_1 = require("class-validator");
var FileCategory;
(function (FileCategory) {
    FileCategory["DOCUMENT"] = "document";
    FileCategory["IMAGE"] = "image";
    FileCategory["RECEIPT"] = "receipt";
    FileCategory["KYC"] = "kyc";
    FileCategory["AVATAR"] = "avatar";
    FileCategory["PROPERTY"] = "property";
    FileCategory["CONSTRUCTION"] = "construction";
    FileCategory["OTHER"] = "other";
})(FileCategory || (exports.FileCategory = FileCategory = {}));
class UploadFileDto {
}
exports.UploadFileDto = UploadFileDto;
__decorate([
    (0, class_validator_1.IsEnum)(FileCategory),
    __metadata("design:type", String)
], UploadFileDto.prototype, "category", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UploadFileDto.prototype, "entityId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UploadFileDto.prototype, "entityType", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UploadFileDto.prototype, "description", void 0);
class FileResponseDto {
}
exports.FileResponseDto = FileResponseDto;
//# sourceMappingURL=upload-file.dto.js.map