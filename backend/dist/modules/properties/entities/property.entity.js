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
exports.Property = void 0;
const typeorm_1 = require("typeorm");
const data_completeness_status_enum_1 = require("../../../common/enums/data-completeness-status.enum");
const construction_project_entity_1 = require("../../construction/entities/construction-project.entity");
const decimalTransformer = {
    to: (value) => (value ?? null),
    from: (value) => value === null || value === undefined ? null : Number(value),
};
let Property = class Property {
};
exports.Property = Property;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Property.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'property_code', unique: true, length: 50 }),
    __metadata("design:type", String)
], Property.prototype, "propertyCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 200 }),
    __metadata("design:type", String)
], Property.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Property.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", String)
], Property.prototype, "country", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], Property.prototype, "address", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Property.prototype, "location", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], Property.prototype, "city", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], Property.prototype, "state", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 10 }),
    __metadata("design:type", String)
], Property.prototype, "pincode", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        precision: 10,
        scale: 8,
        nullable: true,
        transformer: decimalTransformer,
    }),
    __metadata("design:type", Number)
], Property.prototype, "latitude", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        precision: 11,
        scale: 8,
        nullable: true,
        transformer: decimalTransformer,
    }),
    __metadata("design:type", Number)
], Property.prototype, "longitude", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'nearby_landmarks',
        type: 'text',
        nullable: true,
    }),
    __metadata("design:type", String)
], Property.prototype, "nearbyLandmarks", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'total_area',
        type: 'decimal',
        precision: 15,
        scale: 2,
        nullable: true,
        transformer: decimalTransformer,
    }),
    __metadata("design:type", Number)
], Property.prototype, "totalArea", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'area_unit', length: 20, default: 'sqft' }),
    __metadata("design:type", String)
], Property.prototype, "areaUnit", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'built_up_area',
        type: 'decimal',
        precision: 15,
        scale: 2,
        nullable: true,
        transformer: decimalTransformer,
    }),
    __metadata("design:type", Number)
], Property.prototype, "builtUpArea", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'number_of_towers', type: 'int', nullable: true }),
    __metadata("design:type", Number)
], Property.prototype, "numberOfTowers", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'number_of_units', type: 'int', nullable: true }),
    __metadata("design:type", Number)
], Property.prototype, "numberOfUnits", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_towers_planned', type: 'int', nullable: true }),
    __metadata("design:type", Number)
], Property.prototype, "totalTowersPlanned", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_units_planned', type: 'int', nullable: true }),
    __metadata("design:type", Number)
], Property.prototype, "totalUnitsPlanned", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'floors_per_tower', length: 50, nullable: true }),
    __metadata("design:type", String)
], Property.prototype, "floorsPerTower", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'launch_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Property.prototype, "launchDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'expected_completion_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Property.prototype, "expectedCompletionDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'actual_completion_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Property.prototype, "actualCompletionDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'rera_number', length: 100, nullable: true }),
    __metadata("design:type", String)
], Property.prototype, "reraNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'rera_status', length: 50, nullable: true }),
    __metadata("design:type", String)
], Property.prototype, "reraStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'project_type', length: 50, nullable: true }),
    __metadata("design:type", String)
], Property.prototype, "projectType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'property_type', length: 50, nullable: true }),
    __metadata("design:type", String)
], Property.prototype, "propertyType", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, default: 'Active' }),
    __metadata("design:type", String)
], Property.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'price_min',
        type: 'decimal',
        precision: 15,
        scale: 2,
        nullable: true,
        transformer: decimalTransformer,
    }),
    __metadata("design:type", Number)
], Property.prototype, "priceMin", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'price_max',
        type: 'decimal',
        precision: 15,
        scale: 2,
        nullable: true,
        transformer: decimalTransformer,
    }),
    __metadata("design:type", Number)
], Property.prototype, "priceMax", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'expected_revenue',
        type: 'decimal',
        precision: 18,
        scale: 2,
        nullable: true,
        transformer: decimalTransformer,
    }),
    __metadata("design:type", Number)
], Property.prototype, "expectedRevenue", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'bhk_types',
        type: 'text',
        array: true,
        nullable: true,
        transformer: {
            to: (value) => value ?? null,
            from: (value) => value ?? [],
        },
    }),
    __metadata("design:type", Array)
], Property.prototype, "bhkTypes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], Property.prototype, "images", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], Property.prototype, "documents", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], Property.prototype, "amenities", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_featured', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Property.prototype, "isFeatured", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', default: true }),
    __metadata("design:type", Boolean)
], Property.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'inventory_checklist',
        type: 'jsonb',
        nullable: true,
    }),
    __metadata("design:type", Object)
], Property.prototype, "inventoryChecklist", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'data_completion_pct',
        type: 'decimal',
        precision: 5,
        scale: 2,
        default: 0,
        transformer: decimalTransformer,
    }),
    __metadata("design:type", Number)
], Property.prototype, "dataCompletionPct", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'data_completeness_status',
        type: 'enum',
        enum: data_completeness_status_enum_1.DataCompletenessStatus,
        enumName: 'data_completeness_status_enum',
        default: data_completeness_status_enum_1.DataCompletenessStatus.NOT_STARTED,
    }),
    __metadata("design:type", String)
], Property.prototype, "dataCompletenessStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'project_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], Property.prototype, "projectId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => construction_project_entity_1.ConstructionProject, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'project_id' }),
    __metadata("design:type", construction_project_entity_1.ConstructionProject)
], Property.prototype, "project", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true, name: 'created_by' }),
    __metadata("design:type", String)
], Property.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true, name: 'updated_by' }),
    __metadata("design:type", String)
], Property.prototype, "updatedBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Property.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Property.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => require('../../towers/entities/tower.entity').Tower, (tower) => tower.property),
    __metadata("design:type", Array)
], Property.prototype, "towers", void 0);
exports.Property = Property = __decorate([
    (0, typeorm_1.Entity)('properties')
], Property);
//# sourceMappingURL=property.entity.js.map