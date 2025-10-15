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
exports.Floor = void 0;
const typeorm_1 = require("typeorm");
const tower_entity_1 = require("./tower.entity");
const flat_entity_1 = require("./flat.entity");
let Floor = class Floor {
};
exports.Floor = Floor;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Floor.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => tower_entity_1.Tower, tower => tower.floors, { onDelete: 'CASCADE' }),
    __metadata("design:type", tower_entity_1.Tower)
], Floor.prototype, "tower", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Floor.prototype, "floorNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", String)
], Floor.prototype, "floorName", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Floor.prototype, "totalFlats", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => flat_entity_1.Flat, flat => flat.floor),
    __metadata("design:type", Array)
], Floor.prototype, "flats", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Floor.prototype, "createdAt", void 0);
exports.Floor = Floor = __decorate([
    (0, typeorm_1.Entity)('floors'),
    (0, typeorm_1.Unique)(['tower', 'floorNumber'])
], Floor);
//# sourceMappingURL=floor.entity.js.map