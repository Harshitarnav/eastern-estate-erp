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
var LocalStorageService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalStorageService = void 0;
const common_1 = require("@nestjs/common");
const fs = require("fs/promises");
const path = require("path");
let LocalStorageService = LocalStorageService_1 = class LocalStorageService {
    constructor() {
        this.logger = new common_1.Logger(LocalStorageService_1.name);
        this.uploadPath = process.env.UPLOAD_LOCATION || './uploads';
        const isDevelopment = process.env.NODE_ENV === 'development';
        this.baseUrl = isDevelopment
            ? (process.env.APP_URL || 'http://localhost:3001')
            : '';
    }
    async save(file, relativePath) {
        try {
            const fullPath = path.join(this.uploadPath, relativePath);
            const dir = path.dirname(fullPath);
            await fs.mkdir(dir, { recursive: true });
            await fs.copyFile(file.path, fullPath);
            await fs.unlink(file.path);
            this.logger.log(`File saved: ${relativePath}`);
            return relativePath;
        }
        catch (error) {
            this.logger.error(`Failed to save file: ${error.message}`);
            throw error;
        }
    }
    async delete(relativePath) {
        try {
            const fullPath = path.join(this.uploadPath, relativePath);
            await fs.unlink(fullPath);
            this.logger.log(`File deleted: ${relativePath}`);
        }
        catch (error) {
            this.logger.error(`Failed to delete file: ${error.message}`);
            throw error;
        }
    }
    getUrl(relativePath) {
        if (this.baseUrl) {
            return `${this.baseUrl}/uploads/${relativePath}`;
        }
        return `/uploads/${relativePath}`;
    }
    async exists(relativePath) {
        try {
            const fullPath = path.join(this.uploadPath, relativePath);
            await fs.access(fullPath);
            return true;
        }
        catch {
            return false;
        }
    }
};
exports.LocalStorageService = LocalStorageService;
exports.LocalStorageService = LocalStorageService = LocalStorageService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], LocalStorageService);
//# sourceMappingURL=local-storage.service.js.map