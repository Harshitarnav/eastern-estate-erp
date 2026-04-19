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
exports.FlatProgressSimpleController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const fs = require("fs");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const flat_progress_service_1 = require("../flat-progress.service");
const flat_entity_1 = require("../../flats/entities/flat.entity");
const construction_project_entity_1 = require("../entities/construction-project.entity");
const construction_flat_progress_entity_1 = require("../entities/construction-flat-progress.entity");
const construction_workflow_service_1 = require("../services/construction-workflow.service");
const jwt_auth_guard_1 = require("../../../auth/guards/jwt-auth.guard");
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE_BYTES = 10 * 1024 * 1024;
const photoStorage = (0, multer_1.diskStorage)({
    destination: (_req, _file, cb) => {
        const dir = (0, path_1.join)(process.cwd(), 'uploads', 'progress-photos');
        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (_req, file, cb) => {
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
        cb(null, `${unique}${(0, path_1.extname)(file.originalname)}`);
    },
});
let FlatProgressSimpleController = class FlatProgressSimpleController {
    constructor(flatProgressService, workflowService, flatRepository, constructionProjectRepository, flatProgressRepo) {
        this.flatProgressService = flatProgressService;
        this.workflowService = workflowService;
        this.flatRepository = flatRepository;
        this.constructionProjectRepository = constructionProjectRepository;
        this.flatProgressRepo = flatProgressRepo;
    }
    async getFlatProgress(flatId) {
        return this.flatProgressService.findByFlat(flatId);
    }
    async getRecent(limit, propertyId) {
        const max = Math.min(50, Math.max(1, Number(limit) || 10));
        const qb = this.flatProgressRepo
            .createQueryBuilder('progress')
            .leftJoinAndSelect('progress.flat', 'flat')
            .leftJoinAndSelect('flat.tower', 'tower')
            .leftJoinAndSelect('flat.property', 'property')
            .orderBy('progress.updatedAt', 'DESC')
            .limit(max);
        if (propertyId) {
            qb.andWhere('flat.propertyId = :propertyId', { propertyId });
        }
        return qb.getMany();
    }
    uploadPhotos(files = []) {
        if (!files || files.length === 0) {
            throw new common_1.BadRequestException('No files uploaded');
        }
        const urls = files.map((f) => `/uploads/progress-photos/${f.filename}`);
        return { urls };
    }
    async createFlatProgress(dto) {
        const flat = await this.flatRepository.findOne({
            where: { id: dto.flatId },
            relations: ['property'],
        });
        if (!flat) {
            throw new common_1.NotFoundException(`Flat with ID ${dto.flatId} not found`);
        }
        if (!flat.propertyId) {
            throw new common_1.BadRequestException('Flat must be associated with a property');
        }
        let constructionProject = await this.constructionProjectRepository.findOne({
            where: { propertyId: flat.propertyId },
            order: { createdAt: 'DESC' },
        });
        if (!constructionProject) {
            const today = new Date();
            const oneYearLater = new Date();
            oneYearLater.setFullYear(today.getFullYear() + 1);
            constructionProject = this.constructionProjectRepository.create({
                projectName: `${flat.property?.name || 'Property'} - Construction`,
                propertyId: flat.propertyId,
                status: 'IN_PROGRESS',
                startDate: today,
                expectedCompletionDate: oneYearLater,
                overallProgress: 0,
                budgetAllocated: 0,
                budgetSpent: 0,
            });
            constructionProject = await this.constructionProjectRepository.save(constructionProject);
        }
        const existingProgress = await this.flatProgressService.findByFlatAndPhase(dto.flatId, dto.phase);
        const incomingPhotos = Array.isArray(dto.photos) ? dto.photos.filter(Boolean) : undefined;
        let savedProgress;
        if (existingProgress && !Array.isArray(existingProgress)) {
            const mergedPhotos = incomingPhotos
                ? [...(existingProgress.photos || []), ...incomingPhotos]
                : existingProgress.photos;
            savedProgress = await this.flatProgressService.update(existingProgress.id, {
                phaseProgress: dto.phaseProgress,
                overallProgress: dto.overallProgress,
                status: dto.status,
                notes: dto.notes,
                photos: mergedPhotos,
            });
        }
        else {
            const createDto = {
                ...dto,
                constructionProjectId: constructionProject.id,
                photos: incomingPhotos ?? null,
            };
            savedProgress = await this.flatProgressService.create(createDto);
        }
        let workflow = { milestonesTriggered: 0, generatedDemandDrafts: [] };
        try {
            workflow = await this.workflowService.processConstructionUpdate(dto.flatId, dto.phase, dto.phaseProgress || 0, dto.overallProgress || 0);
        }
        catch (error) {
            console.error('Error in automated workflow:', error);
        }
        return {
            ...savedProgress,
            workflow,
        };
    }
};
exports.FlatProgressSimpleController = FlatProgressSimpleController;
__decorate([
    (0, common_1.Get)('flat/:flatId'),
    __param(0, (0, common_1.Param)('flatId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FlatProgressSimpleController.prototype, "getFlatProgress", null);
__decorate([
    (0, common_1.Get)('recent'),
    __param(0, (0, common_1.Query)('limit')),
    __param(1, (0, common_1.Query)('propertyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], FlatProgressSimpleController.prototype, "getRecent", null);
__decorate([
    (0, common_1.Post)('upload/photos'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('photos', 5, {
        storage: photoStorage,
        limits: { fileSize: MAX_SIZE_BYTES },
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
], FlatProgressSimpleController.prototype, "uploadPhotos", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FlatProgressSimpleController.prototype, "createFlatProgress", null);
exports.FlatProgressSimpleController = FlatProgressSimpleController = __decorate([
    (0, common_1.Controller)('construction/flat-progress'),
    __param(2, (0, typeorm_1.InjectRepository)(flat_entity_1.Flat)),
    __param(3, (0, typeorm_1.InjectRepository)(construction_project_entity_1.ConstructionProject)),
    __param(4, (0, typeorm_1.InjectRepository)(construction_flat_progress_entity_1.ConstructionFlatProgress)),
    __metadata("design:paramtypes", [flat_progress_service_1.FlatProgressService,
        construction_workflow_service_1.ConstructionWorkflowService,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], FlatProgressSimpleController);
//# sourceMappingURL=flat-progress-simple.controller.js.map