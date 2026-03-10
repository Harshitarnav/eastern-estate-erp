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
exports.CompanySettings = void 0;
const typeorm_1 = require("typeorm");
let CompanySettings = class CompanySettings {
};
exports.CompanySettings = CompanySettings;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], CompanySettings.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'company_name', default: 'Eastern Estate' }),
    __metadata("design:type", String)
], CompanySettings.prototype, "companyName", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], CompanySettings.prototype, "tagline", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'text' }),
    __metadata("design:type", String)
], CompanySettings.prototype, "address", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], CompanySettings.prototype, "city", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], CompanySettings.prototype, "state", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], CompanySettings.prototype, "pincode", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], CompanySettings.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], CompanySettings.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], CompanySettings.prototype, "website", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], CompanySettings.prototype, "gstin", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'rera_number', nullable: true }),
    __metadata("design:type", String)
], CompanySettings.prototype, "reraNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'bank_name', nullable: true }),
    __metadata("design:type", String)
], CompanySettings.prototype, "bankName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'account_name', nullable: true }),
    __metadata("design:type", String)
], CompanySettings.prototype, "accountName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'account_number', nullable: true }),
    __metadata("design:type", String)
], CompanySettings.prototype, "accountNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ifsc_code', nullable: true }),
    __metadata("design:type", String)
], CompanySettings.prototype, "ifscCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], CompanySettings.prototype, "branch", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'upi_id', nullable: true }),
    __metadata("design:type", String)
], CompanySettings.prototype, "upiId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'smtp_host', nullable: true }),
    __metadata("design:type", String)
], CompanySettings.prototype, "smtpHost", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'smtp_port', nullable: true, default: 587 }),
    __metadata("design:type", Number)
], CompanySettings.prototype, "smtpPort", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'smtp_user', nullable: true }),
    __metadata("design:type", String)
], CompanySettings.prototype, "smtpUser", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'smtp_pass', nullable: true, select: false }),
    __metadata("design:type", String)
], CompanySettings.prototype, "smtpPass", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'smtp_from', nullable: true }),
    __metadata("design:type", String)
], CompanySettings.prototype, "smtpFrom", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], CompanySettings.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], CompanySettings.prototype, "updatedAt", void 0);
exports.CompanySettings = CompanySettings = __decorate([
    (0, typeorm_1.Entity)('company_settings')
], CompanySettings);
//# sourceMappingURL=company-settings.entity.js.map