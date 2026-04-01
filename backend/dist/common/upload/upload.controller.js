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
exports.UploadController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const file_validation_pipe_1 = require("./pipes/file-validation.pipe");
const image_processor_service_1 = require("./image-processor.service");
const storage_token_1 = require("./storage/storage.token");
const os_1 = require("os");
const path = require("path");
const fs = require("fs/promises");
let UploadController = class UploadController {
    constructor(imageProcessor, storage) {
        this.imageProcessor = imageProcessor;
        this.storage = storage;
    }
    async uploadSingle(file) {
        if (!file) {
            throw new common_1.BadRequestException('File is required');
        }
        const response = {
            id: file.filename.split('.')[0],
            filename: file.filename,
            originalName: file.originalname,
            mimeType: file.mimetype,
            size: file.size,
            path: file.path,
            uploadedAt: new Date(),
            url: '',
        };
        if (this.imageProcessor.isImage(file.mimetype)) {
            const thumbKey = `thumbnails/${file.filename}`;
            const thumbTempPath = path.join((0, os_1.tmpdir)(), `thumb_${file.filename}`);
            try {
                await this.imageProcessor.generateThumbnail(file.path, thumbTempPath);
                const thumbStats = await fs.stat(thumbTempPath);
                const thumbFile = {
                    path: thumbTempPath,
                    filename: thumbKey,
                    originalname: `thumb_${file.originalname}`,
                    mimetype: 'image/jpeg',
                    size: thumbStats.size,
                };
                await this.storage.save(thumbFile, thumbKey);
                response.thumbnailUrl = this.storage.getUrl(thumbKey);
            }
            catch (error) {
                console.error('Failed to generate thumbnail:', error);
                await fs.unlink(thumbTempPath).catch(() => { });
            }
        }
        try {
            await this.storage.save(file, file.filename);
        }
        catch (err) {
            if (err?.code === 'ECONNREFUSED' || err?.name === 'AggregateError') {
                throw new common_1.ServiceUnavailableException('File storage is unavailable right now. Please try again later or contact your administrator.');
            }
            throw err;
        }
        response.url = this.storage.getUrl(file.filename);
        return response;
    }
    async uploadMultiple(files) {
        if (!files || files.length === 0) {
            throw new common_1.BadRequestException('At least one file is required');
        }
        const responses = [];
        for (const file of files) {
            const response = {
                id: file.filename.split('.')[0],
                filename: file.filename,
                originalName: file.originalname,
                mimeType: file.mimetype,
                size: file.size,
                path: file.path,
                uploadedAt: new Date(),
                url: '',
            };
            if (this.imageProcessor.isImage(file.mimetype)) {
                const thumbKey = `thumbnails/${file.filename}`;
                const thumbTempPath = path.join((0, os_1.tmpdir)(), `thumb_${file.filename}`);
                try {
                    await this.imageProcessor.generateThumbnail(file.path, thumbTempPath);
                    const thumbStats = await fs.stat(thumbTempPath);
                    const thumbFile = {
                        path: thumbTempPath,
                        filename: thumbKey,
                        originalname: `thumb_${file.originalname}`,
                        mimetype: 'image/jpeg',
                        size: thumbStats.size,
                    };
                    await this.storage.save(thumbFile, thumbKey);
                    response.thumbnailUrl = this.storage.getUrl(thumbKey);
                }
                catch (error) {
                    console.error('Failed to generate thumbnail:', error);
                    await fs.unlink(thumbTempPath).catch(() => { });
                }
            }
            try {
                await this.storage.save(file, file.filename);
            }
            catch (err) {
                if (err?.code === 'ECONNREFUSED' || err?.name === 'AggregateError') {
                    throw new common_1.ServiceUnavailableException('File storage is unavailable right now. Please try again later or contact your administrator.');
                }
                throw err;
            }
            response.url = this.storage.getUrl(file.filename);
            responses.push(response);
        }
        return responses;
    }
};
exports.UploadController = UploadController;
__decorate([
    (0, common_1.Post)('single'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)(new file_validation_pipe_1.FileValidationPipe({
        maxSize: 10 * 1024 * 1024,
        required: true,
    }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UploadController.prototype, "uploadSingle", null);
__decorate([
    (0, common_1.Post)('multiple'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files', 10)),
    __param(0, (0, common_1.UploadedFiles)(new file_validation_pipe_1.FilesValidationPipe({
        maxSize: 10 * 1024 * 1024,
        maxCount: 10,
        required: true,
    }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], UploadController.prototype, "uploadMultiple", null);
exports.UploadController = UploadController = __decorate([
    (0, common_1.Controller)('upload'),
    __param(1, (0, common_1.Inject)(storage_token_1.STORAGE_SERVICE)),
    __metadata("design:paramtypes", [image_processor_service_1.ImageProcessorService, Object])
], UploadController);
//# sourceMappingURL=upload.controller.js.map