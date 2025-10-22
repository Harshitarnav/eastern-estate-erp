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
exports.ConstructionDevelopmentUpdate = exports.UpdateVisibility = void 0;
const typeorm_1 = require("typeorm");
const construction_project_entity_1 = require("./construction-project.entity");
const user_entity_1 = require("../../users/entities/user.entity");
var UpdateVisibility;
(function (UpdateVisibility) {
    UpdateVisibility["ALL"] = "ALL";
    UpdateVisibility["INTERNAL"] = "INTERNAL";
    UpdateVisibility["MANAGEMENT_ONLY"] = "MANAGEMENT_ONLY";
})(UpdateVisibility || (exports.UpdateVisibility = UpdateVisibility = {}));
let ConstructionDevelopmentUpdate = class ConstructionDevelopmentUpdate {
    get hasImages() {
        return Array.isArray(this.images) && this.images.length > 0;
    }
    get hasAttachments() {
        return Array.isArray(this.attachments) && this.attachments.length > 0;
    }
    get imageCount() {
        return Array.isArray(this.images) ? this.images.length : 0;
    }
    get attachmentCount() {
        return Array.isArray(this.attachments) ? this.attachments.length : 0;
    }
    get isRecent() {
        const daysDiff = Math.floor((new Date().getTime() - new Date(this.updateDate).getTime()) /
            (1000 * 60 * 60 * 24));
        return daysDiff <= 7;
    }
};
exports.ConstructionDevelopmentUpdate = ConstructionDevelopmentUpdate;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ConstructionDevelopmentUpdate.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'construction_project_id', type: 'uuid' }),
    __metadata("design:type", String)
], ConstructionDevelopmentUpdate.prototype, "constructionProjectId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => construction_project_entity_1.ConstructionProject),
    (0, typeorm_1.JoinColumn)({ name: 'construction_project_id' }),
    __metadata("design:type", construction_project_entity_1.ConstructionProject)
], ConstructionDevelopmentUpdate.prototype, "constructionProject", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'update_date', type: 'date' }),
    __metadata("design:type", Date)
], ConstructionDevelopmentUpdate.prototype, "updateDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'update_title', type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], ConstructionDevelopmentUpdate.prototype, "updateTitle", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'update_description', type: 'text' }),
    __metadata("design:type", String)
], ConstructionDevelopmentUpdate.prototype, "updateDescription", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'feedback_notes', type: 'text', nullable: true }),
    __metadata("design:type", String)
], ConstructionDevelopmentUpdate.prototype, "feedbackNotes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', default: [] }),
    __metadata("design:type", Array)
], ConstructionDevelopmentUpdate.prototype, "images", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', default: [] }),
    __metadata("design:type", Array)
], ConstructionDevelopmentUpdate.prototype, "attachments", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by', type: 'uuid' }),
    __metadata("design:type", String)
], ConstructionDevelopmentUpdate.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'created_by' }),
    __metadata("design:type", user_entity_1.User)
], ConstructionDevelopmentUpdate.prototype, "creator", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 20,
        enum: UpdateVisibility,
        default: UpdateVisibility.ALL,
    }),
    __metadata("design:type", String)
], ConstructionDevelopmentUpdate.prototype, "visibility", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], ConstructionDevelopmentUpdate.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], ConstructionDevelopmentUpdate.prototype, "updatedAt", void 0);
exports.ConstructionDevelopmentUpdate = ConstructionDevelopmentUpdate = __decorate([
    (0, typeorm_1.Entity)('construction_development_updates')
], ConstructionDevelopmentUpdate);
//# sourceMappingURL=construction-development-update.entity.js.map