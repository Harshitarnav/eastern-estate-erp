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
exports.EmployeeDocument = exports.DocumentStatus = exports.DocumentType = void 0;
const typeorm_1 = require("typeorm");
const employee_entity_1 = require("./employee.entity");
var DocumentType;
(function (DocumentType) {
    DocumentType["AADHAR_CARD"] = "AADHAR_CARD";
    DocumentType["PAN_CARD"] = "PAN_CARD";
    DocumentType["PASSPORT"] = "PASSPORT";
    DocumentType["DRIVING_LICENSE"] = "DRIVING_LICENSE";
    DocumentType["VOTER_ID"] = "VOTER_ID";
    DocumentType["EDUCATION_CERTIFICATE"] = "EDUCATION_CERTIFICATE";
    DocumentType["EXPERIENCE_LETTER"] = "EXPERIENCE_LETTER";
    DocumentType["RELIEVING_LETTER"] = "RELIEVING_LETTER";
    DocumentType["SALARY_SLIP"] = "SALARY_SLIP";
    DocumentType["BANK_STATEMENT"] = "BANK_STATEMENT";
    DocumentType["APPOINTMENT_LETTER"] = "APPOINTMENT_LETTER";
    DocumentType["RESIGNATION_LETTER"] = "RESIGNATION_LETTER";
    DocumentType["NOC"] = "NOC";
    DocumentType["MEDICAL_CERTIFICATE"] = "MEDICAL_CERTIFICATE";
    DocumentType["POLICE_VERIFICATION"] = "POLICE_VERIFICATION";
    DocumentType["OTHER"] = "OTHER";
})(DocumentType || (exports.DocumentType = DocumentType = {}));
var DocumentStatus;
(function (DocumentStatus) {
    DocumentStatus["PENDING"] = "PENDING";
    DocumentStatus["SUBMITTED"] = "SUBMITTED";
    DocumentStatus["VERIFIED"] = "VERIFIED";
    DocumentStatus["REJECTED"] = "REJECTED";
    DocumentStatus["EXPIRED"] = "EXPIRED";
})(DocumentStatus || (exports.DocumentStatus = DocumentStatus = {}));
let EmployeeDocument = class EmployeeDocument {
};
exports.EmployeeDocument = EmployeeDocument;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], EmployeeDocument.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid'),
    __metadata("design:type", String)
], EmployeeDocument.prototype, "employeeId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => employee_entity_1.Employee),
    (0, typeorm_1.JoinColumn)({ name: 'employeeId' }),
    __metadata("design:type", employee_entity_1.Employee)
], EmployeeDocument.prototype, "employee", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: DocumentType,
    }),
    __metadata("design:type", String)
], EmployeeDocument.prototype, "documentType", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 200 }),
    __metadata("design:type", String)
], EmployeeDocument.prototype, "documentName", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", String)
], EmployeeDocument.prototype, "documentNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], EmployeeDocument.prototype, "documentDescription", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 500 }),
    __metadata("design:type", String)
], EmployeeDocument.prototype, "documentUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", String)
], EmployeeDocument.prototype, "fileName", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, nullable: true }),
    __metadata("design:type", String)
], EmployeeDocument.prototype, "fileType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], EmployeeDocument.prototype, "fileSize", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: DocumentStatus,
        default: DocumentStatus.PENDING,
    }),
    __metadata("design:type", String)
], EmployeeDocument.prototype, "documentStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], EmployeeDocument.prototype, "issueDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], EmployeeDocument.prototype, "expiryDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], EmployeeDocument.prototype, "isExpirable", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], EmployeeDocument.prototype, "isVerified", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], EmployeeDocument.prototype, "verifiedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 200, nullable: true }),
    __metadata("design:type", String)
], EmployeeDocument.prototype, "verifiedByName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], EmployeeDocument.prototype, "verifiedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], EmployeeDocument.prototype, "verificationRemarks", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], EmployeeDocument.prototype, "rejectedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], EmployeeDocument.prototype, "rejectedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], EmployeeDocument.prototype, "rejectionReason", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], EmployeeDocument.prototype, "submittedDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], EmployeeDocument.prototype, "submissionRemarks", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], EmployeeDocument.prototype, "sendExpiryReminder", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], EmployeeDocument.prototype, "reminderDaysBefore", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], EmployeeDocument.prototype, "lastReminderSent", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], EmployeeDocument.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'simple-array', nullable: true }),
    __metadata("design:type", Array)
], EmployeeDocument.prototype, "tags", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], EmployeeDocument.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], EmployeeDocument.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], EmployeeDocument.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], EmployeeDocument.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], EmployeeDocument.prototype, "updatedBy", void 0);
exports.EmployeeDocument = EmployeeDocument = __decorate([
    (0, typeorm_1.Entity)('employee_documents'),
    (0, typeorm_1.Index)(['employeeId']),
    (0, typeorm_1.Index)(['documentType']),
    (0, typeorm_1.Index)(['documentStatus'])
], EmployeeDocument);
//# sourceMappingURL=employee-document.entity.js.map