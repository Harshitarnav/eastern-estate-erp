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
exports.Material = exports.UnitOfMeasurement = exports.MaterialCategory = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../users/entities/user.entity");
var MaterialCategory;
(function (MaterialCategory) {
    MaterialCategory["CEMENT"] = "CEMENT";
    MaterialCategory["STEEL"] = "STEEL";
    MaterialCategory["SAND"] = "SAND";
    MaterialCategory["AGGREGATE"] = "AGGREGATE";
    MaterialCategory["BRICKS"] = "BRICKS";
    MaterialCategory["TILES"] = "TILES";
    MaterialCategory["ELECTRICAL"] = "ELECTRICAL";
    MaterialCategory["PLUMBING"] = "PLUMBING";
    MaterialCategory["PAINT"] = "PAINT";
    MaterialCategory["HARDWARE"] = "HARDWARE";
    MaterialCategory["OTHER"] = "OTHER";
})(MaterialCategory || (exports.MaterialCategory = MaterialCategory = {}));
var UnitOfMeasurement;
(function (UnitOfMeasurement) {
    UnitOfMeasurement["KG"] = "KG";
    UnitOfMeasurement["TONNE"] = "TONNE";
    UnitOfMeasurement["BAG"] = "BAG";
    UnitOfMeasurement["PIECE"] = "PIECE";
    UnitOfMeasurement["LITRE"] = "LITRE";
    UnitOfMeasurement["CUBIC_METER"] = "CUBIC_METER";
    UnitOfMeasurement["SQUARE_METER"] = "SQUARE_METER";
    UnitOfMeasurement["BOX"] = "BOX";
    UnitOfMeasurement["SET"] = "SET";
})(UnitOfMeasurement || (exports.UnitOfMeasurement = UnitOfMeasurement = {}));
let Material = class Material {
    get isLowStock() {
        return this.currentStock <= this.minimumStockLevel;
    }
    get stockValue() {
        return Number(this.currentStock) * Number(this.unitPrice);
    }
};
exports.Material = Material;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Material.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'material_code', unique: true, length: 50 }),
    __metadata("design:type", String)
], Material.prototype, "materialCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'material_name', length: 255 }),
    __metadata("design:type", String)
], Material.prototype, "materialName", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: MaterialCategory,
    }),
    __metadata("design:type", String)
], Material.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'unit_of_measurement',
        type: 'enum',
        enum: UnitOfMeasurement,
    }),
    __metadata("design:type", String)
], Material.prototype, "unitOfMeasurement", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'current_stock', type: 'decimal', precision: 15, scale: 3, default: 0 }),
    __metadata("design:type", Number)
], Material.prototype, "currentStock", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'minimum_stock_level', type: 'decimal', precision: 15, scale: 3, default: 0 }),
    __metadata("design:type", Number)
], Material.prototype, "minimumStockLevel", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'maximum_stock_level', type: 'decimal', precision: 15, scale: 3, default: 0 }),
    __metadata("design:type", Number)
], Material.prototype, "maximumStockLevel", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'unit_price', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Material.prototype, "unitPrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'gst_percentage', type: 'decimal', precision: 5, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Material.prototype, "gstPercentage", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Material.prototype, "specifications", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', default: true }),
    __metadata("design:type", Boolean)
], Material.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Material.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Material.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], Material.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'created_by' }),
    __metadata("design:type", user_entity_1.User)
], Material.prototype, "creator", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'updated_by', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], Material.prototype, "updatedBy", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'updated_by' }),
    __metadata("design:type", user_entity_1.User)
], Material.prototype, "updater", void 0);
exports.Material = Material = __decorate([
    (0, typeorm_1.Entity)('materials')
], Material);
//# sourceMappingURL=material.entity.js.map