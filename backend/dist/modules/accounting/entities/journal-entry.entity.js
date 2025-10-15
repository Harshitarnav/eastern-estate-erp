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
exports.JournalEntry = exports.JournalEntryStatus = exports.JournalEntryType = void 0;
const typeorm_1 = require("typeorm");
const property_entity_1 = require("../../properties/entities/property.entity");
var JournalEntryType;
(function (JournalEntryType) {
    JournalEntryType["MANUAL"] = "Manual";
    JournalEntryType["AUTOMATIC"] = "Automatic";
    JournalEntryType["ADJUSTMENT"] = "Adjustment";
    JournalEntryType["CLOSING"] = "Closing";
})(JournalEntryType || (exports.JournalEntryType = JournalEntryType = {}));
var JournalEntryStatus;
(function (JournalEntryStatus) {
    JournalEntryStatus["DRAFT"] = "Draft";
    JournalEntryStatus["POSTED"] = "Posted";
    JournalEntryStatus["REVERSED"] = "Reversed";
})(JournalEntryStatus || (exports.JournalEntryStatus = JournalEntryStatus = {}));
let JournalEntry = class JournalEntry {
};
exports.JournalEntry = JournalEntry;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], JournalEntry.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'entry_number', unique: true }),
    __metadata("design:type", String)
], JournalEntry.prototype, "entryNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'entry_date', type: 'date' }),
    __metadata("design:type", Date)
], JournalEntry.prototype, "entryDate", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: JournalEntryType,
        name: 'entry_type',
        default: JournalEntryType.MANUAL,
    }),
    __metadata("design:type", String)
], JournalEntry.prototype, "entryType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reference_type', nullable: true }),
    __metadata("design:type", String)
], JournalEntry.prototype, "referenceType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reference_id', nullable: true }),
    __metadata("design:type", String)
], JournalEntry.prototype, "referenceId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], JournalEntry.prototype, "narration", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        precision: 15,
        scale: 2,
        name: 'total_debit',
        default: 0,
    }),
    __metadata("design:type", Number)
], JournalEntry.prototype, "totalDebit", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        precision: 15,
        scale: 2,
        name: 'total_credit',
        default: 0,
    }),
    __metadata("design:type", Number)
], JournalEntry.prototype, "totalCredit", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: JournalEntryStatus,
        default: JournalEntryStatus.DRAFT,
    }),
    __metadata("design:type", String)
], JournalEntry.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by', nullable: true }),
    __metadata("design:type", String)
], JournalEntry.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'approved_by', nullable: true }),
    __metadata("design:type", String)
], JournalEntry.prototype, "approvedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'approved_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], JournalEntry.prototype, "approvedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'property_id', nullable: true }),
    __metadata("design:type", String)
], JournalEntry.prototype, "propertyId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => property_entity_1.Property, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'property_id' }),
    __metadata("design:type", property_entity_1.Property)
], JournalEntry.prototype, "property", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'financial_year' }),
    __metadata("design:type", String)
], JournalEntry.prototype, "financialYear", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], JournalEntry.prototype, "period", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], JournalEntry.prototype, "attachments", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], JournalEntry.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], JournalEntry.prototype, "updatedAt", void 0);
exports.JournalEntry = JournalEntry = __decorate([
    (0, typeorm_1.Entity)('journal_entries')
], JournalEntry);
//# sourceMappingURL=journal-entry.entity.js.map