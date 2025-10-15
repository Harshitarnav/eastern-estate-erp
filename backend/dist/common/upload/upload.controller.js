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
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const multer_1 = require("multer");
const uuid_1 = require("uuid");
const path_1 = require("path");
const fs_1 = require("fs");
const imageFileFilter = (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
        return cb(new common_1.BadRequestException('Only image files are allowed'), false);
    }
    cb(null, true);
};
const documentFileFilter = (req, file, cb) => {
    const allowedExt = ['.pdf', '.doc', '.docx', '.xls', '.xlsx'];
    const ext = (0, path_1.extname)(file.originalname).toLowerCase();
    if (!allowedExt.includes(ext)) {
        return cb(new common_1.BadRequestException('Only PDF, DOC, DOCX, XLS, XLSX files are allowed'), false);
    }
    cb(null, true);
};
const getStorage = (destination) => {
    return (0, multer_1.diskStorage)({
        destination: `./uploads/${destination}`,
        filename: (req, file, cb) => {
            const uniqueName = `${(0, uuid_1.v4)()}${(0, path_1.extname)(file.originalname)}`;
            cb(null, uniqueName);
        },
    });
};
let UploadController = class UploadController {
    async uploadPropertyImages(files) {
        if (!files || files.length === 0) {
            throw new common_1.BadRequestException('No files uploaded');
        }
        const urls = files.map((file) => `${process.env.APP_URL}/api/v1/uploads/properties/${file.filename}`);
        return {
            success: true,
            urls,
            count: files.length,
        };
    }
    async uploadPropertyDocuments(files) {
        if (!files || files.length === 0) {
            throw new common_1.BadRequestException('No files uploaded');
        }
        const urls = files.map((file) => `${process.env.APP_URL}/api/v1/uploads/documents/${file.filename}`);
        return {
            success: true,
            urls,
            count: files.length,
        };
    }
    async uploadKYCDocuments(files) {
        if (!files || files.length === 0) {
            throw new common_1.BadRequestException('No files uploaded');
        }
        const urls = files.map((file) => `${process.env.APP_URL}/api/v1/uploads/kyc/${file.filename}`);
        return {
            success: true,
            urls,
            count: files.length,
        };
    }
    async uploadPaymentReceipt(file) {
        if (!file) {
            throw new common_1.BadRequestException('No file uploaded');
        }
        const url = `${process.env.APP_URL}/api/v1/uploads/receipts/${file.filename}`;
        return {
            success: true,
            url,
            filename: file.originalname,
        };
    }
    async uploadProfilePicture(file) {
        if (!file) {
            throw new common_1.BadRequestException('No file uploaded');
        }
        const url = `${process.env.APP_URL}/api/v1/uploads/avatars/${file.filename}`;
        return {
            success: true,
            url,
        };
    }
    async serveFile(folder, filename, res) {
        const allowedFolders = ['properties', 'documents', 'kyc', 'receipts', 'avatars'];
        if (!allowedFolders.includes(folder)) {
            throw new common_1.BadRequestException('Invalid folder');
        }
        const filePath = (0, path_1.join)(process.cwd(), 'uploads', folder, filename);
        if (!(0, fs_1.existsSync)(filePath)) {
            throw new common_1.BadRequestException('File not found');
        }
        return res.sendFile(filePath);
    }
};
exports.UploadController = UploadController;
__decorate([
    (0, common_1.Post)('property-images'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('images', 20, {
        storage: getStorage('properties'),
        fileFilter: imageFileFilter,
        limits: {
            fileSize: 10 * 1024 * 1024,
        },
    })),
    __param(0, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], UploadController.prototype, "uploadPropertyImages", null);
__decorate([
    (0, common_1.Post)('property-documents'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('documents', 10, {
        storage: getStorage('documents'),
        fileFilter: documentFileFilter,
        limits: {
            fileSize: 20 * 1024 * 1024,
        },
    })),
    __param(0, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], UploadController.prototype, "uploadPropertyDocuments", null);
__decorate([
    (0, common_1.Post)('kyc-documents'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('kyc', 5, {
        storage: getStorage('kyc'),
        fileFilter: (req, file, cb) => {
            const allowed = file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf';
            if (!allowed) {
                return cb(new common_1.BadRequestException('Only images and PDF files are allowed'), false);
            }
            cb(null, true);
        },
        limits: {
            fileSize: 5 * 1024 * 1024,
        },
    })),
    __param(0, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], UploadController.prototype, "uploadKYCDocuments", null);
__decorate([
    (0, common_1.Post)('payment-receipt'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('receipt', {
        storage: getStorage('receipts'),
        fileFilter: (req, file, cb) => {
            const allowed = file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf';
            if (!allowed) {
                return cb(new common_1.BadRequestException('Only images and PDF files are allowed'), false);
            }
            cb(null, true);
        },
        limits: {
            fileSize: 10 * 1024 * 1024,
        },
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UploadController.prototype, "uploadPaymentReceipt", null);
__decorate([
    (0, common_1.Post)('profile-picture'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('avatar', {
        storage: getStorage('avatars'),
        fileFilter: imageFileFilter,
        limits: {
            fileSize: 2 * 1024 * 1024,
        },
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UploadController.prototype, "uploadProfilePicture", null);
__decorate([
    (0, common_1.Get)(':folder/:filename'),
    __param(0, (0, common_1.Param)('folder')),
    __param(1, (0, common_1.Param)('filename')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], UploadController.prototype, "serveFile", null);
exports.UploadController = UploadController = __decorate([
    (0, common_1.Controller)('upload'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard)
], UploadController);
//# sourceMappingURL=upload.controller.js.map