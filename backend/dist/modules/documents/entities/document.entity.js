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
exports.Document = exports.DocumentEntityType = exports.DocumentCategory = void 0;
const typeorm_1 = require("typeorm");
var DocumentCategory;
(function (DocumentCategory) {
    DocumentCategory["AGREEMENT"] = "AGREEMENT";
    DocumentCategory["KYC_AADHAR"] = "KYC_AADHAR";
    DocumentCategory["KYC_PAN"] = "KYC_PAN";
    DocumentCategory["KYC_PHOTO"] = "KYC_PHOTO";
    DocumentCategory["KYC_OTHER"] = "KYC_OTHER";
    DocumentCategory["BANK_DOCUMENT"] = "BANK_DOCUMENT";
    DocumentCategory["LOAN_DOCUMENT"] = "LOAN_DOCUMENT";
    DocumentCategory["PAYMENT_PROOF"] = "PAYMENT_PROOF";
    DocumentCategory["POSSESSION_LETTER"] = "POSSESSION_LETTER";
    DocumentCategory["NOC"] = "NOC";
    DocumentCategory["OTHER"] = "OTHER";
})(DocumentCategory || (exports.DocumentCategory = DocumentCategory = {}));
var DocumentEntityType;
(function (DocumentEntityType) {
    DocumentEntityType["BOOKING"] = "BOOKING";
    DocumentEntityType["CUSTOMER"] = "CUSTOMER";
    DocumentEntityType["PAYMENT"] = "PAYMENT";
    DocumentEntityType["EMPLOYEE"] = "EMPLOYEE";
    DocumentEntityType["PROPERTY"] = "PROPERTY";
    DocumentEntityType["TOWER"] = "TOWER";
    DocumentEntityType["FLAT"] = "FLAT";
})(DocumentEntityType || (exports.DocumentEntityType = DocumentEntityType = {}));
let Document = class Document {
};
exports.Document = Document;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Document.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'name', length: 255 }),
    __metadata("design:type", String)
], Document.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'category', type: 'varchar', length: 50 }),
    __metadata("design:type", String)
], Document.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'entity_type', type: 'varchar', length: 50 }),
    __metadata("design:type", String)
], Document.prototype, "entityType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'entity_id', type: 'uuid' }),
    __metadata("design:type", String)
], Document.prototype, "entityId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'customer_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], Document.prototype, "customerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'booking_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], Document.prototype, "bookingId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'file_url' }),
    __metadata("design:type", String)
], Document.prototype, "fileUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'file_name', length: 255 }),
    __metadata("design:type", String)
], Document.prototype, "fileName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'mime_type', length: 100, nullable: true }),
    __metadata("design:type", String)
], Document.prototype, "mimeType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'file_size', type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], Document.prototype, "fileSize", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'notes', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Document.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'uploaded_by', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], Document.prototype, "uploadedBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Document.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Document.prototype, "updatedAt", void 0);
exports.Document = Document = __decorate([
    (0, typeorm_1.Entity)('documents'),
    (0, typeorm_1.Index)(['entityType', 'entityId']),
    (0, typeorm_1.Index)(['customerId']),
    (0, typeorm_1.Index)(['bookingId'])
], Document);
//# sourceMappingURL=document.entity.js.map