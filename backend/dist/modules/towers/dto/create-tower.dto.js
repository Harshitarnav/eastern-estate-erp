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
exports.CreateTowerDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
class CreateTowerDto {
}
exports.CreateTowerDto = CreateTowerDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Name of the tower',
        example: 'Tower A',
        maxLength: 100,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Tower name is required for identification' }),
    (0, class_validator_1.MaxLength)(100, { message: 'Tower name cannot exceed 100 characters' }),
    __metadata("design:type", String)
], CreateTowerDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Unique tower number/code',
        example: 'T1',
        maxLength: 50,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Tower number is required' }),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], CreateTowerDto.prototype, "towerNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Tower code identifier (defaults to tower number when omitted)',
        example: 'T1',
        maxLength: 50,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], CreateTowerDto.prototype, "towerCode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Detailed description of the tower',
        example: 'Premium tower featuring spacious 2BHK and 3BHK apartments with world-class amenities',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateTowerDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Total number of floors',
        example: 15,
        minimum: 1,
        maximum: 100,
    }),
    (0, class_validator_1.IsInt)({ message: 'Total floors must be a whole number' }),
    (0, class_validator_1.Min)(1, { message: 'Tower must have at least 1 floor' }),
    (0, class_validator_1.Max)(100, { message: 'Total floors cannot exceed 100' }),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateTowerDto.prototype, "totalFloors", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Total number of residential units',
        example: 60,
        minimum: 1,
    }),
    (0, class_validator_1.IsInt)({ message: 'Total units must be a whole number' }),
    (0, class_validator_1.Min)(1, { message: 'Tower must have at least 1 unit' }),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateTowerDto.prototype, "totalUnits", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Planned number of units for the tower',
        example: 64,
    }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateTowerDto.prototype, "unitsPlanned", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Number of basement levels',
        example: 2,
        default: 0,
    }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0, { message: 'Basement levels cannot be negative' }),
    (0, class_validator_1.Max)(5, { message: 'Basement levels cannot exceed 5' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateTowerDto.prototype, "basementLevels", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Units per floor configuration',
        example: '4 units per floor (2BHK + 3BHK)',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], CreateTowerDto.prototype, "unitsPerFloor", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Array of tower-specific amenities',
        example: ['High-speed Elevators', 'Sky Lounge', 'Terrace Garden'],
        type: [String],
    }),
    (0, class_validator_1.IsArray)({ message: 'Amenities must be provided as an array' }),
    (0, class_validator_1.IsString)({ each: true, message: 'Each amenity must be a string' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateTowerDto.prototype, "amenities", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Current construction status',
        enum: ['PLANNED', 'UNDER_CONSTRUCTION', 'COMPLETED', 'READY_TO_MOVE'],
        example: 'UNDER_CONSTRUCTION',
        default: 'PLANNED',
    }),
    (0, class_validator_1.IsEnum)(['PLANNED', 'UNDER_CONSTRUCTION', 'COMPLETED', 'READY_TO_MOVE'], {
        message: 'Invalid construction status',
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateTowerDto.prototype, "constructionStatus", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Construction start date',
        example: '2024-01-15',
    }),
    (0, class_validator_1.IsDateString)({}, { message: 'Invalid date format for construction start' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateTowerDto.prototype, "constructionStartDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Expected or actual completion date',
        example: '2025-12-31',
    }),
    (0, class_validator_1.IsDateString)({}, { message: 'Invalid date format for completion date' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateTowerDto.prototype, "completionDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'RERA approval number',
        example: 'RERA/OR/2024/12345',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CreateTowerDto.prototype, "reraNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Total built-up area in sq.ft',
        example: 75000,
    }),
    (0, class_validator_1.IsNumber)({}, { message: 'Built-up area must be a number' }),
    (0, class_validator_1.Min)(0, { message: 'Built-up area cannot be negative' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateTowerDto.prototype, "builtUpArea", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Total carpet area in sq.ft',
        example: 60000,
    }),
    (0, class_validator_1.IsNumber)({}, { message: 'Carpet area must be a number' }),
    (0, class_validator_1.Min)(0, { message: 'Carpet area cannot be negative' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateTowerDto.prototype, "carpetArea", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Floor-to-ceiling height in feet',
        example: 10.5,
    }),
    (0, class_validator_1.IsNumber)({}, { message: 'Ceiling height must be a number' }),
    (0, class_validator_1.Min)(8, { message: 'Minimum ceiling height should be 8 feet' }),
    (0, class_validator_1.Max)(20, { message: 'Maximum ceiling height cannot exceed 20 feet' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateTowerDto.prototype, "ceilingHeight", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Number of elevators',
        example: 2,
        default: 1,
    }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1, { message: 'At least 1 elevator is required' }),
    (0, class_validator_1.Max)(10, { message: 'Maximum 10 elevators allowed' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateTowerDto.prototype, "numberOfLifts", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Vastu compliance status',
        example: true,
        default: true,
    }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateTowerDto.prototype, "vastuCompliant", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Tower facing direction',
        example: 'North',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], CreateTowerDto.prototype, "facing", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Special features and highlights',
        example: 'Premium corner units with panoramic city views',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateTowerDto.prototype, "specialFeatures", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Display order for sorting',
        example: 1,
        default: 0,
    }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateTowerDto.prototype, "displayOrder", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Array of image URLs',
        example: ['https://example.com/tower1.jpg', 'https://example.com/tower2.jpg'],
        type: [String],
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateTowerDto.prototype, "images", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Floor plan images mapped by floor range',
        example: { 'ground': 'url1', '1-10': 'url2' },
    }),
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateTowerDto.prototype, "floorPlans", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'UUID of the parent property',
        example: '550e8400-e29b-41d4-a716-446655440000',
    }),
    (0, class_validator_1.IsUUID)('4', { message: 'Invalid property ID format' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Property ID is required' }),
    __metadata("design:type", String)
], CreateTowerDto.prototype, "propertyId", void 0);
//# sourceMappingURL=create-tower.dto.js.map