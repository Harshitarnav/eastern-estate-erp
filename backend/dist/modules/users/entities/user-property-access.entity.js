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
exports.UserPropertyAccess = exports.PropertyRole = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
const property_entity_1 = require("../../properties/entities/property.entity");
var PropertyRole;
(function (PropertyRole) {
    PropertyRole["SUPER_ADMIN"] = "SUPER_ADMIN";
    PropertyRole["ADMIN"] = "ADMIN";
    PropertyRole["PROPERTY_ADMIN"] = "PROPERTY_ADMIN";
    PropertyRole["GM_SALES"] = "GM_SALES";
    PropertyRole["GM_MARKETING"] = "GM_MARKETING";
    PropertyRole["GM_CONSTRUCTION"] = "GM_CONSTRUCTION";
    PropertyRole["PROPERTY_VIEWER"] = "PROPERTY_VIEWER";
})(PropertyRole || (exports.PropertyRole = PropertyRole = {}));
let UserPropertyAccess = class UserPropertyAccess {
};
exports.UserPropertyAccess = UserPropertyAccess;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], UserPropertyAccess.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id', type: 'uuid' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], UserPropertyAccess.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], UserPropertyAccess.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'property_id', type: 'uuid' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], UserPropertyAccess.prototype, "propertyId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => property_entity_1.Property, { onDelete: 'CASCADE', eager: true }),
    (0, typeorm_1.JoinColumn)({ name: 'property_id' }),
    __metadata("design:type", property_entity_1.Property)
], UserPropertyAccess.prototype, "property", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 50,
    }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], UserPropertyAccess.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', default: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Boolean)
], UserPropertyAccess.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'assigned_by', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], UserPropertyAccess.prototype, "assignedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'assigned_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], UserPropertyAccess.prototype, "assignedAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], UserPropertyAccess.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], UserPropertyAccess.prototype, "updatedAt", void 0);
exports.UserPropertyAccess = UserPropertyAccess = __decorate([
    (0, typeorm_1.Entity)('user_property_access'),
    (0, typeorm_1.Index)(['userId', 'propertyId', 'role'], { unique: true })
], UserPropertyAccess);
//# sourceMappingURL=user-property-access.entity.js.map