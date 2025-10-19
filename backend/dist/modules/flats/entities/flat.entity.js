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
exports.Flat = exports.FacingDirection = exports.FlatType = exports.FlatStatus = void 0;
const typeorm_1 = require("typeorm");
const tower_entity_1 = require("../../towers/entities/tower.entity");
const property_entity_1 = require("../../properties/entities/property.entity");
const data_completeness_status_enum_1 = require("../../../common/enums/data-completeness-status.enum");
const decimalTransformer = {
    to: (value) => (value ?? null),
    from: (value) => value === null || value === undefined ? null : Number(value),
};
var FlatStatus;
(function (FlatStatus) {
    FlatStatus["AVAILABLE"] = "AVAILABLE";
    FlatStatus["ON_HOLD"] = "ON_HOLD";
    FlatStatus["BLOCKED"] = "BLOCKED";
    FlatStatus["BOOKED"] = "BOOKED";
    FlatStatus["SOLD"] = "SOLD";
    FlatStatus["UNDER_CONSTRUCTION"] = "UNDER_CONSTRUCTION";
})(FlatStatus || (exports.FlatStatus = FlatStatus = {}));
var FlatType;
(function (FlatType) {
    FlatType["STUDIO"] = "STUDIO";
    FlatType["ONE_BHK"] = "1BHK";
    FlatType["TWO_BHK"] = "2BHK";
    FlatType["THREE_BHK"] = "3BHK";
    FlatType["FOUR_BHK"] = "4BHK";
    FlatType["PENTHOUSE"] = "PENTHOUSE";
    FlatType["DUPLEX"] = "DUPLEX";
    FlatType["VILLA"] = "VILLA";
})(FlatType || (exports.FlatType = FlatType = {}));
var FacingDirection;
(function (FacingDirection) {
    FacingDirection["NORTH"] = "North";
    FacingDirection["SOUTH"] = "South";
    FacingDirection["EAST"] = "East";
    FacingDirection["WEST"] = "West";
    FacingDirection["NORTH_EAST"] = "North-East";
    FacingDirection["NORTH_WEST"] = "North-West";
    FacingDirection["SOUTH_EAST"] = "South-East";
    FacingDirection["SOUTH_WEST"] = "South-West";
})(FacingDirection || (exports.FacingDirection = FacingDirection = {}));
let Flat = class Flat {
};
exports.Flat = Flat;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Flat.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid', { name: 'property_id' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Flat.prototype, "propertyId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => property_entity_1.Property, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'property_id' }),
    __metadata("design:type", property_entity_1.Property)
], Flat.prototype, "property", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid', { name: 'tower_id' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Flat.prototype, "towerId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => tower_entity_1.Tower, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'tower_id' }),
    __metadata("design:type", tower_entity_1.Tower)
], Flat.prototype, "tower", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50 }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Flat.prototype, "flatNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], Flat.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Flat.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: FlatType,
    }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Flat.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)('int'),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Number)
], Flat.prototype, "floor", void 0);
__decorate([
    (0, typeorm_1.Column)('int', { default: 2 }),
    __metadata("design:type", Number)
], Flat.prototype, "bedrooms", void 0);
__decorate([
    (0, typeorm_1.Column)('int', { default: 2 }),
    __metadata("design:type", Number)
], Flat.prototype, "bathrooms", void 0);
__decorate([
    (0, typeorm_1.Column)('int', { default: 0 }),
    __metadata("design:type", Number)
], Flat.prototype, "balconies", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Flat.prototype, "servantRoom", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Flat.prototype, "studyRoom", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Flat.prototype, "poojaRoom", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Flat.prototype, "superBuiltUpArea", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Flat.prototype, "builtUpArea", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Flat.prototype, "carpetArea", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Flat.prototype, "balconyArea", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 15, scale: 2 }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Number)
], Flat.prototype, "basePrice", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 15, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Flat.prototype, "pricePerSqft", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 15, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Flat.prototype, "registrationCharges", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 15, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Flat.prototype, "maintenanceCharges", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 15, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Flat.prototype, "parkingCharges", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 15, scale: 2 }),
    __metadata("design:type", Number)
], Flat.prototype, "totalPrice", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 15, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Flat.prototype, "discountAmount", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 15, scale: 2 }),
    __metadata("design:type", Number)
], Flat.prototype, "finalPrice", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: FlatStatus,
        default: FlatStatus.UNDER_CONSTRUCTION,
    }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Flat.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Boolean)
], Flat.prototype, "isAvailable", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Flat.prototype, "availableFrom", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Flat.prototype, "expectedPossession", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'flat_checklist', type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], Flat.prototype, "flatChecklist", void 0);
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
], Flat.prototype, "dataCompletionPct", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'completeness_status',
        type: 'enum',
        enum: data_completeness_status_enum_1.DataCompletenessStatus,
        enumName: 'data_completeness_status_enum',
        default: data_completeness_status_enum_1.DataCompletenessStatus.NOT_STARTED,
    }),
    __metadata("design:type", String)
], Flat.prototype, "completenessStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'issues', type: 'jsonb', nullable: true }),
    __metadata("design:type", Array)
], Flat.prototype, "issues", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'issues_count', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Flat.prototype, "issuesCount", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: FacingDirection,
        nullable: true,
    }),
    __metadata("design:type", String)
], Flat.prototype, "facing", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], Flat.prototype, "vastuCompliant", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Flat.prototype, "cornerUnit", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Flat.prototype, "roadFacing", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Flat.prototype, "parkFacing", void 0);
__decorate([
    (0, typeorm_1.Column)('int', { default: 0 }),
    __metadata("design:type", Number)
], Flat.prototype, "parkingSlots", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Flat.prototype, "coveredParking", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, nullable: true }),
    __metadata("design:type", String)
], Flat.prototype, "furnishingStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'simple-array', nullable: true }),
    __metadata("design:type", Array)
], Flat.prototype, "amenities", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Flat.prototype, "specialFeatures", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Flat.prototype, "floorPlanUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'simple-array', nullable: true }),
    __metadata("design:type", Array)
], Flat.prototype, "images", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Flat.prototype, "virtualTourUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], Flat.prototype, "customerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Flat.prototype, "bookingDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Flat.prototype, "soldDate", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 15, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Flat.prototype, "tokenAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Flat.prototype, "paymentPlan", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Flat.prototype, "remarks", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Boolean)
], Flat.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 1 }),
    __metadata("design:type", Number)
], Flat.prototype, "displayOrder", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Flat.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Flat.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], Flat.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], Flat.prototype, "updatedBy", void 0);
exports.Flat = Flat = __decorate([
    (0, typeorm_1.Entity)('flats'),
    (0, typeorm_1.Index)(['towerId', 'flatNumber'], { unique: true }),
    (0, typeorm_1.Index)(['propertyId', 'status']),
    (0, typeorm_1.Index)(['status', 'isActive'])
], Flat);
//# sourceMappingURL=flat.entity.js.map