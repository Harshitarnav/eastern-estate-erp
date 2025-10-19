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
exports.PaginatedTowerResponseDto = exports.TowerResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const data_completeness_status_enum_1 = require("../../../common/enums/data-completeness-status.enum");
class TowerResponseDto {
}
exports.TowerResponseDto = TowerResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Tower unique identifier',
        example: '550e8400-e29b-41d4-a716-446655440000',
    }),
    __metadata("design:type", String)
], TowerResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Tower name',
        example: 'Diamond Tower A',
    }),
    __metadata("design:type", String)
], TowerResponseDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Tower number/code',
        example: 'T1',
    }),
    __metadata("design:type", String)
], TowerResponseDto.prototype, "towerNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Tower code',
        example: 'T1',
    }),
    __metadata("design:type", String)
], TowerResponseDto.prototype, "towerCode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Tower description',
        example: 'Premium residential tower with 2BHK and 3BHK apartments',
    }),
    __metadata("design:type", String)
], TowerResponseDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Total number of floors',
        example: 15,
    }),
    __metadata("design:type", Number)
], TowerResponseDto.prototype, "totalFloors", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Total number of units',
        example: 60,
    }),
    __metadata("design:type", Number)
], TowerResponseDto.prototype, "totalUnits", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of basement levels',
        example: 2,
    }),
    __metadata("design:type", Number)
], TowerResponseDto.prototype, "basementLevels", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Units per floor configuration',
        example: '4 units per floor (2BHK + 3BHK)',
    }),
    __metadata("design:type", String)
], TowerResponseDto.prototype, "unitsPerFloor", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Tower-specific amenities',
        example: ['High-speed Elevators', 'Sky Lounge'],
        type: [String],
    }),
    __metadata("design:type", Array)
], TowerResponseDto.prototype, "amenities", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Construction status',
        example: 'UNDER_CONSTRUCTION',
        enum: ['PLANNED', 'UNDER_CONSTRUCTION', 'COMPLETED', 'READY_TO_MOVE'],
    }),
    __metadata("design:type", String)
], TowerResponseDto.prototype, "constructionStatus", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Construction start date',
        example: '2024-01-15',
    }),
    __metadata("design:type", Date)
], TowerResponseDto.prototype, "constructionStartDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Completion date',
        example: '2025-12-31',
    }),
    __metadata("design:type", Date)
], TowerResponseDto.prototype, "completionDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'RERA number',
        example: 'RERA/OR/2024/12345',
    }),
    __metadata("design:type", String)
], TowerResponseDto.prototype, "reraNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Built-up area in sq.ft',
        example: 75000,
    }),
    __metadata("design:type", Number)
], TowerResponseDto.prototype, "builtUpArea", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Carpet area in sq.ft',
        example: 60000,
    }),
    __metadata("design:type", Number)
], TowerResponseDto.prototype, "carpetArea", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Ceiling height in feet',
        example: 10.5,
    }),
    __metadata("design:type", Number)
], TowerResponseDto.prototype, "ceilingHeight", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of elevators',
        example: 2,
    }),
    __metadata("design:type", Number)
], TowerResponseDto.prototype, "numberOfLifts", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Vastu compliance',
        example: true,
    }),
    __metadata("design:type", Boolean)
], TowerResponseDto.prototype, "vastuCompliant", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Facing direction',
        example: 'North',
    }),
    __metadata("design:type", String)
], TowerResponseDto.prototype, "facing", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Special features',
        example: 'Premium corner units with city views',
    }),
    __metadata("design:type", String)
], TowerResponseDto.prototype, "specialFeatures", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Active status',
        example: true,
    }),
    __metadata("design:type", Boolean)
], TowerResponseDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Display order',
        example: 1,
    }),
    __metadata("design:type", Number)
], TowerResponseDto.prototype, "displayOrder", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Tower images',
        type: [String],
    }),
    __metadata("design:type", Array)
], TowerResponseDto.prototype, "images", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Floor plans',
    }),
    __metadata("design:type", Object)
], TowerResponseDto.prototype, "floorPlans", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Property ID',
        example: '550e8400-e29b-41d4-a716-446655440000',
    }),
    __metadata("design:type", String)
], TowerResponseDto.prototype, "propertyId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Property details',
    }),
    __metadata("design:type", Object)
], TowerResponseDto.prototype, "property", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Creation timestamp',
        example: '2024-01-15T10:30:00Z',
    }),
    __metadata("design:type", Date)
], TowerResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Last update timestamp',
        example: '2024-01-20T15:45:00Z',
    }),
    __metadata("design:type", Date)
], TowerResponseDto.prototype, "updatedAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Number of flats in this tower',
        example: 60,
    }),
    __metadata("design:type", Number)
], TowerResponseDto.prototype, "flatsCount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Number of available units',
        example: 45,
    }),
    __metadata("design:type", Number)
], TowerResponseDto.prototype, "availableUnits", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Number of sold units',
        example: 15,
    }),
    __metadata("design:type", Number)
], TowerResponseDto.prototype, "soldUnits", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Occupancy percentage',
        example: 25,
    }),
    __metadata("design:type", Number)
], TowerResponseDto.prototype, "occupancyRate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Planned number of units for the tower',
        example: 64,
    }),
    __metadata("design:type", Number)
], TowerResponseDto.prototype, "unitsPlanned", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Number of units currently defined',
        example: 58,
    }),
    __metadata("design:type", Number)
], TowerResponseDto.prototype, "unitsDefined", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Data completeness percentage (0-100)',
        example: 78.5,
    }),
    __metadata("design:type", Number)
], TowerResponseDto.prototype, "dataCompletionPct", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Editorial data completeness status',
        enum: data_completeness_status_enum_1.DataCompletenessStatus,
    }),
    __metadata("design:type", String)
], TowerResponseDto.prototype, "dataCompletenessStatus", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Outstanding data issue count',
        example: 3,
    }),
    __metadata("design:type", Number)
], TowerResponseDto.prototype, "issuesCount", void 0);
class PaginatedTowerResponseDto {
}
exports.PaginatedTowerResponseDto = PaginatedTowerResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Array of towers',
        type: [TowerResponseDto],
    }),
    __metadata("design:type", Array)
], PaginatedTowerResponseDto.prototype, "data", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Pagination metadata',
    }),
    __metadata("design:type", Object)
], PaginatedTowerResponseDto.prototype, "meta", void 0);
//# sourceMappingURL=tower-response.dto.js.map