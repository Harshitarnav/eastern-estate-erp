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
exports.DeleteRowDto = exports.InsertRowDto = exports.UpdateRowDto = exports.ExecuteQueryDto = void 0;
const class_validator_1 = require("class-validator");
class ExecuteQueryDto {
    constructor() {
        this.limit = 1000;
        this.readonly = false;
    }
}
exports.ExecuteQueryDto = ExecuteQueryDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ExecuteQueryDto.prototype, "query", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(10000),
    __metadata("design:type", Number)
], ExecuteQueryDto.prototype, "limit", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ExecuteQueryDto.prototype, "readonly", void 0);
class UpdateRowDto {
    constructor() {
        this.idColumn = 'id';
    }
}
exports.UpdateRowDto = UpdateRowDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateRowDto.prototype, "table", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateRowDto.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateRowDto.prototype, "idColumn", void 0);
class InsertRowDto {
}
exports.InsertRowDto = InsertRowDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], InsertRowDto.prototype, "table", void 0);
class DeleteRowDto {
    constructor() {
        this.idColumn = 'id';
    }
}
exports.DeleteRowDto = DeleteRowDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DeleteRowDto.prototype, "table", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DeleteRowDto.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DeleteRowDto.prototype, "idColumn", void 0);
//# sourceMappingURL=query.dto.js.map