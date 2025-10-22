"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ImageProcessorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageProcessorService = void 0;
const common_1 = require("@nestjs/common");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs/promises");
let ImageProcessorService = ImageProcessorService_1 = class ImageProcessorService {
    constructor() {
        this.logger = new common_1.Logger(ImageProcessorService_1.name);
        this.MAX_WIDTH = 1920;
        this.MAX_HEIGHT = 1920;
        this.THUMBNAIL_SIZE = 150;
        this.QUALITY = 85;
    }
    async processImage(inputPath, outputPath, options) {
        try {
            const maxWidth = options?.maxWidth || this.MAX_WIDTH;
            const maxHeight = options?.maxHeight || this.MAX_HEIGHT;
            const quality = options?.quality || this.QUALITY;
            const metadata = await sharp(inputPath).metadata();
            let pipeline = sharp(inputPath);
            if (metadata.width > maxWidth || metadata.height > maxHeight) {
                pipeline = pipeline.resize(maxWidth, maxHeight, {
                    fit: 'inside',
                    withoutEnlargement: true,
                });
                this.logger.log(`Resizing image from ${metadata.width}x${metadata.height}`);
            }
            await pipeline
                .jpeg({ quality, progressive: true })
                .toFile(outputPath);
            const stats = await fs.stat(outputPath);
            this.logger.log(`Image processed: ${path.basename(outputPath)} (${this.formatBytes(stats.size)})`);
            return {
                path: outputPath,
                size: stats.size,
            };
        }
        catch (error) {
            this.logger.error(`Failed to process image: ${error.message}`);
            throw error;
        }
    }
    async generateThumbnail(inputPath, outputPath, size = this.THUMBNAIL_SIZE) {
        try {
            await sharp(inputPath)
                .resize(size, size, {
                fit: 'cover',
                position: 'center',
            })
                .jpeg({ quality: 80 })
                .toFile(outputPath);
            const stats = await fs.stat(outputPath);
            this.logger.log(`Thumbnail generated: ${path.basename(outputPath)}`);
            return {
                path: outputPath,
                size: stats.size,
            };
        }
        catch (error) {
            this.logger.error(`Failed to generate thumbnail: ${error.message}`);
            throw error;
        }
    }
    async convertToWebP(inputPath, outputPath, quality = 85) {
        try {
            await sharp(inputPath)
                .webp({ quality })
                .toFile(outputPath);
            const stats = await fs.stat(outputPath);
            this.logger.log(`Converted to WebP: ${path.basename(outputPath)}`);
            return {
                path: outputPath,
                size: stats.size,
            };
        }
        catch (error) {
            this.logger.error(`Failed to convert to WebP: ${error.message}`);
            throw error;
        }
    }
    async getMetadata(imagePath) {
        return sharp(imagePath).metadata();
    }
    isImage(mimeType) {
        return mimeType.startsWith('image/');
    }
    formatBytes(bytes) {
        if (bytes === 0)
            return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }
};
exports.ImageProcessorService = ImageProcessorService;
exports.ImageProcessorService = ImageProcessorService = ImageProcessorService_1 = __decorate([
    (0, common_1.Injectable)()
], ImageProcessorService);
//# sourceMappingURL=image-processor.service.js.map