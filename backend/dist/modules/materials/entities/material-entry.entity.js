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
exports.MaterialEntry = exports.EntryType = void 0;
const typeorm_1 = require("typeorm");
const material_entity_1 = require("./material.entity");
const vendor_entity_1 = require("../../vendors/entities/vendor.entity");
const user_entity_1 = require("../../users/entities/user.entity");
var EntryType;
(function (EntryType) {
    EntryType["PURCHASE"] = "PURCHASE";
    EntryType["RETURN"] = "RETURN";
    EntryType["ADJUSTMENT"] = "ADJUSTMENT";
})(EntryType || (exports.EntryType = EntryType = {}));
let MaterialEntry = class MaterialEntry {
    get isLinkedToPO() {
        return !!this.purchaseOrderId;
    }
    get formattedEntryType() {
        return this.entryType.replace('_', ' ');
    }
};
exports.MaterialEntry = MaterialEntry;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], MaterialEntry.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'material_id', type: 'uuid' }),
    __metadata("design:type", String)
], MaterialEntry.prototype, "materialId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => material_entity_1.Material),
    (0, typeorm_1.JoinColumn)({ name: 'material_id' }),
    __metadata("design:type", material_entity_1.Material)
], MaterialEntry.prototype, "material", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'entry_type',
        type: 'enum',
        enum: EntryType,
    }),
    __metadata("design:type", String)
], MaterialEntry.prototype, "entryType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 15, scale: 3 }),
    __metadata("design:type", Number)
], MaterialEntry.prototype, "quantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'unit_price', type: 'decimal', precision: 15, scale: 2 }),
    __metadata("design:type", Number)
], MaterialEntry.prototype, "unitPrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_value', type: 'decimal', precision: 15, scale: 2 }),
    __metadata("design:type", Number)
], MaterialEntry.prototype, "totalValue", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'vendor_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], MaterialEntry.prototype, "vendorId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => vendor_entity_1.Vendor, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'vendor_id' }),
    __metadata("design:type", vendor_entity_1.Vendor)
], MaterialEntry.prototype, "vendor", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'purchase_order_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], MaterialEntry.prototype, "purchaseOrderId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'entry_date', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], MaterialEntry.prototype, "entryDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'entered_by', type: 'uuid' }),
    __metadata("design:type", String)
], MaterialEntry.prototype, "enteredBy", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'entered_by' }),
    __metadata("design:type", user_entity_1.User)
], MaterialEntry.prototype, "enteredByUser", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'invoice_number', length: 100, nullable: true }),
    __metadata("design:type", String)
], MaterialEntry.prototype, "invoiceNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], MaterialEntry.prototype, "remarks", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], MaterialEntry.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], MaterialEntry.prototype, "updatedAt", void 0);
exports.MaterialEntry = MaterialEntry = __decorate([
    (0, typeorm_1.Entity)('material_entries')
], MaterialEntry);
//# sourceMappingURL=material-entry.entity.js.map