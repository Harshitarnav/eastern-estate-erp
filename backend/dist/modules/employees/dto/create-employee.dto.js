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
exports.CreateEmployeeDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const trimToUndefined = ({ value }) => value === '' || value === null ? undefined : value;
class CreateEmployeeDto {
}
exports.CreateEmployeeDto = CreateEmployeeDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "employeeCode", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "fullName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(trimToUndefined),
    (0, class_validator_1.IsEmail)({}, { message: 'Please provide a valid email address' }),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "email", void 0);
__decorate([
    (0, class_transformer_1.Transform)(trimToUndefined),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "phoneNumber", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(trimToUndefined),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "alternatePhone", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(trimToUndefined),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "profilePicture", void 0);
__decorate([
    (0, class_transformer_1.Transform)(trimToUndefined),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", Object)
], CreateEmployeeDto.prototype, "dateOfBirth", void 0);
__decorate([
    (0, class_transformer_1.Transform)(trimToUndefined),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "gender", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(trimToUndefined),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "bloodGroup", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(trimToUndefined),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "maritalStatus", void 0);
__decorate([
    (0, class_transformer_1.Transform)(trimToUndefined),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "currentAddress", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(trimToUndefined),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "permanentAddress", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(trimToUndefined),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "city", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(trimToUndefined),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "state", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(trimToUndefined),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "pincode", void 0);
__decorate([
    (0, class_transformer_1.Transform)(trimToUndefined),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "department", void 0);
__decorate([
    (0, class_transformer_1.Transform)(trimToUndefined),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "designation", void 0);
__decorate([
    (0, class_transformer_1.Transform)(trimToUndefined),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "employmentType", void 0);
__decorate([
    (0, class_transformer_1.Transform)(trimToUndefined),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "employmentStatus", void 0);
__decorate([
    (0, class_transformer_1.Transform)(trimToUndefined),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", Object)
], CreateEmployeeDto.prototype, "joiningDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(trimToUndefined),
    __metadata("design:type", Object)
], CreateEmployeeDto.prototype, "confirmationDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(trimToUndefined),
    __metadata("design:type", Object)
], CreateEmployeeDto.prototype, "resignationDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(trimToUndefined),
    __metadata("design:type", Object)
], CreateEmployeeDto.prototype, "lastWorkingDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(trimToUndefined),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "reportingManagerName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateEmployeeDto.prototype, "basicSalary", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateEmployeeDto.prototype, "houseRentAllowance", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateEmployeeDto.prototype, "transportAllowance", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateEmployeeDto.prototype, "medicalAllowance", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateEmployeeDto.prototype, "otherAllowances", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateEmployeeDto.prototype, "grossSalary", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateEmployeeDto.prototype, "pfDeduction", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateEmployeeDto.prototype, "esiDeduction", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateEmployeeDto.prototype, "taxDeduction", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateEmployeeDto.prototype, "otherDeductions", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateEmployeeDto.prototype, "netSalary", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(trimToUndefined),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "bankName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(trimToUndefined),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "bankAccountNumber", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(trimToUndefined),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "ifscCode", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(trimToUndefined),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "branchName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(trimToUndefined),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "aadharNumber", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(trimToUndefined),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "panNumber", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(trimToUndefined),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "pfNumber", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(trimToUndefined),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "esiNumber", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(trimToUndefined),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "uanNumber", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(trimToUndefined),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "emergencyContactName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(trimToUndefined),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "emergencyContactPhone", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(trimToUndefined),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "emergencyContactRelation", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateEmployeeDto.prototype, "casualLeaveBalance", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateEmployeeDto.prototype, "sickLeaveBalance", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateEmployeeDto.prototype, "earnedLeaveBalance", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateEmployeeDto.prototype, "leaveTaken", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateEmployeeDto.prototype, "totalPresent", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateEmployeeDto.prototype, "totalAbsent", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateEmployeeDto.prototype, "totalLateArrival", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(trimToUndefined),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "skills", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(trimToUndefined),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "qualifications", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(trimToUndefined),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "experience", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateEmployeeDto.prototype, "performanceRating", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(trimToUndefined),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "notes", void 0);
//# sourceMappingURL=create-employee.dto.js.map