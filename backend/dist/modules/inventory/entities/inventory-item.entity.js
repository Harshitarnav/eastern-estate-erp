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
exports.InventoryItem = exports.StockStatus = exports.Unit = exports.ItemCategory = void 0;
const typeorm_1 = require("typeorm");
const property_entity_1 = require("../../properties/entities/property.entity");
var ItemCategory;
(function (ItemCategory) {
    ItemCategory["CONSTRUCTION_MATERIAL"] = "CONSTRUCTION_MATERIAL";
    ItemCategory["ELECTRICAL"] = "ELECTRICAL";
    ItemCategory["PLUMBING"] = "PLUMBING";
    ItemCategory["HARDWARE"] = "HARDWARE";
    ItemCategory["PAINT"] = "PAINT";
    ItemCategory["TILES"] = "TILES";
    ItemCategory["FIXTURES"] = "FIXTURES";
    ItemCategory["TOOLS"] = "TOOLS";
    ItemCategory["SAFETY_EQUIPMENT"] = "SAFETY_EQUIPMENT";
    ItemCategory["OTHER"] = "OTHER";
})(ItemCategory || (exports.ItemCategory = ItemCategory = {}));
var Unit;
(function (Unit) {
    Unit["KG"] = "KG";
    Unit["LITRE"] = "LITRE";
    Unit["METER"] = "METER";
    Unit["SQ_METER"] = "SQ_METER";
    Unit["PIECE"] = "PIECE";
    Unit["BOX"] = "BOX";
    Unit["BAG"] = "BAG";
    Unit["ROLL"] = "ROLL";
    Unit["SET"] = "SET";
    Unit["UNIT"] = "UNIT";
})(Unit || (exports.Unit = Unit = {}));
var StockStatus;
(function (StockStatus) {
    StockStatus["IN_STOCK"] = "IN_STOCK";
    StockStatus["LOW_STOCK"] = "LOW_STOCK";
    StockStatus["OUT_OF_STOCK"] = "OUT_OF_STOCK";
    StockStatus["ORDERED"] = "ORDERED";
    StockStatus["DISCONTINUED"] = "DISCONTINUED";
})(StockStatus || (exports.StockStatus = StockStatus = {}));
let InventoryItem = class InventoryItem {
};
exports.InventoryItem = InventoryItem;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], InventoryItem.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, unique: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], InventoryItem.prototype, "itemCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 200 }),
    __metadata("design:type", String)
], InventoryItem.prototype, "itemName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], InventoryItem.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ItemCategory,
    }),
    __metadata("design:type", String)
], InventoryItem.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", String)
], InventoryItem.prototype, "brand", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", String)
], InventoryItem.prototype, "model", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], InventoryItem.prototype, "quantity", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: Unit,
    }),
    __metadata("design:type", String)
], InventoryItem.prototype, "unit", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], InventoryItem.prototype, "minimumStock", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], InventoryItem.prototype, "maximumStock", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], InventoryItem.prototype, "reorderPoint", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: StockStatus,
        default: StockStatus.IN_STOCK,
    }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], InventoryItem.prototype, "stockStatus", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 15, scale: 2 }),
    __metadata("design:type", Number)
], InventoryItem.prototype, "unitPrice", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 15, scale: 2 }),
    __metadata("design:type", Number)
], InventoryItem.prototype, "totalValue", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 15, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], InventoryItem.prototype, "lastPurchasePrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], InventoryItem.prototype, "lastPurchaseDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 200, nullable: true }),
    __metadata("design:type", String)
], InventoryItem.prototype, "supplierName", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 200, nullable: true }),
    __metadata("design:type", String)
], InventoryItem.prototype, "supplierEmail", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, nullable: true }),
    __metadata("design:type", String)
], InventoryItem.prototype, "supplierPhone", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], InventoryItem.prototype, "supplierAddress", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], InventoryItem.prototype, "propertyId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => property_entity_1.Property, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'property_id' }),
    __metadata("design:type", property_entity_1.Property)
], InventoryItem.prototype, "property", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 200, nullable: true }),
    __metadata("design:type", String)
], InventoryItem.prototype, "warehouseLocation", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", String)
], InventoryItem.prototype, "rackNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", String)
], InventoryItem.prototype, "binNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", String)
], InventoryItem.prototype, "specification", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", String)
], InventoryItem.prototype, "grade", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], InventoryItem.prototype, "manufacturingDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], InventoryItem.prototype, "expiryDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", String)
], InventoryItem.prototype, "batchNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", String)
], InventoryItem.prototype, "serialNumber", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], InventoryItem.prototype, "totalIssued", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], InventoryItem.prototype, "totalReceived", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], InventoryItem.prototype, "totalReturned", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], InventoryItem.prototype, "lastIssuedDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], InventoryItem.prototype, "lastReceivedDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'simple-array', nullable: true }),
    __metadata("design:type", Array)
], InventoryItem.prototype, "images", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'simple-array', nullable: true }),
    __metadata("design:type", Array)
], InventoryItem.prototype, "documents", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], InventoryItem.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'simple-array', nullable: true }),
    __metadata("design:type", Array)
], InventoryItem.prototype, "tags", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Boolean)
], InventoryItem.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], InventoryItem.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], InventoryItem.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], InventoryItem.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], InventoryItem.prototype, "updatedBy", void 0);
exports.InventoryItem = InventoryItem = __decorate([
    (0, typeorm_1.Entity)('inventory_items'),
    (0, typeorm_1.Index)(['category']),
    (0, typeorm_1.Index)(['propertyId'])
], InventoryItem);
//# sourceMappingURL=inventory-item.entity.js.map