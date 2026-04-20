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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScopedDevelopmentUpdatesController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const fs = require("fs");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const development_updates_service_1 = require("./development-updates.service");
const create_development_update_dto_1 = require("./dto/create-development-update.dto");
const construction_development_update_entity_1 = require("./entities/construction-development-update.entity");
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE = 10 * 1024 * 1024;
const photoStorage = (0, multer_1.diskStorage)({
    destination: (_req, _file, cb) => {
        const dir = (0, path_1.join)(process.cwd(), 'uploads', 'development-photos');
        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (_req, file, cb) => {
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
        cb(null, `${unique}${(0, path_1.extname)(file.originalname)}`);
    },
});
let ScopedDevelopmentUpdatesController = class ScopedDevelopmentUpdatesController {
    constructor(service) {
        this.service = service;
    }
    async list(req, propertyId, towerId, scopeType, category, limit, offset) {
        const accessiblePropertyIds = req.user?.accessiblePropertyIds ?? null;
        return this.service.findScoped({
            propertyId,
            towerId,
            scopeType,
            category,
            limit: limit ? Math.min(parseInt(limit, 10), 200) : 50,
            offset: offset ? parseInt(offset, 10) : 0,
        }, accessiblePropertyIds);
    }
    async getOne(id, req) {
        const accessiblePropertyIds = req.user?.accessiblePropertyIds ?? null;
        return this.service.findOneScoped(id, accessiblePropertyIds);
    }
    async create(dto, req) {
        const userId = req.user?.sub || req.user?.id;
        return this.service.create(dto, userId);
    }
    async remove(id, req) {
        const accessiblePropertyIds = req.user?.accessiblePropertyIds ?? null;
        return this.service.remove(id, accessiblePropertyIds);
    }
    uploadImages(files = []) {
        if (!files || files.length === 0) {
            throw new common_1.BadRequestException('No files uploaded');
        }
        return {
            urls: files.map((f) => `/uploads/development-photos/${f.filename}`),
        };
    }
};
exports.ScopedDevelopmentUpdatesController = ScopedDevelopmentUpdatesController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('propertyId')),
    __param(2, (0, common_1.Query)('towerId')),
    __param(3, (0, common_1.Query)('scopeType')),
    __param(4, (0, common_1.Query)('category')),
    __param(5, (0, common_1.Query)('limit')),
    __param(6, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], ScopedDevelopmentUpdatesController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ScopedDevelopmentUpdatesController.prototype, "getOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_development_update_dto_1.CreateDevelopmentUpdateDto, Object]),
    __metadata("design:returntype", Promise)
], ScopedDevelopmentUpdatesController.prototype, "create", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ScopedDevelopmentUpdatesController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)('upload/images'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('images', 10, {
        storage: photoStorage,
        limits: { fileSize: MAX_SIZE },
        fileFilter: (_req, file, cb) => {
            if (!ALLOWED_MIME.includes(file.mimetype)) {
                return cb(new common_1.BadRequestException(`Unsupported file type: ${file.mimetype}. Allowed: JPEG, PNG, WebP, GIF`), false);
            }
            cb(null, true);
        },
    })),
    __param(0, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", void 0)
], ScopedDevelopmentUpdatesController.prototype, "uploadImages", null);
exports.ScopedDevelopmentUpdatesController = ScopedDevelopmentUpdatesController = __decorate([
    (0, common_1.Controller)('development-updates'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [development_updates_service_1.DevelopmentUpdatesService])
], ScopedDevelopmentUpdatesController);
//# sourceMappingURL=scoped-development-updates.controller.js.map