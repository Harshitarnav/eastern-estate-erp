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
exports.FilesValidationPipe = exports.FileValidationPipe = void 0;
const common_1 = require("@nestjs/common");
let FileValidationPipe = class FileValidationPipe {
    constructor(options) {
        this.options = options;
    }
    transform(file) {
        if (!file && this.options?.required) {
            throw new common_1.BadRequestException('File is required');
        }
        if (!file) {
            return file;
        }
        if (this.options?.maxSize && file.size > this.options.maxSize) {
            throw new common_1.BadRequestException(`File size exceeds maximum allowed size of ${this.formatBytes(this.options.maxSize)}`);
        }
        if (this.options?.allowedTypes && !this.options.allowedTypes.includes(file.mimetype)) {
            throw new common_1.BadRequestException(`File type ${file.mimetype} is not allowed. Allowed types: ${this.options.allowedTypes.join(', ')}`);
        }
        return file;
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
exports.FileValidationPipe = FileValidationPipe;
exports.FileValidationPipe = FileValidationPipe = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [Object])
], FileValidationPipe);
let FilesValidationPipe = class FilesValidationPipe {
    constructor(options) {
        this.options = options;
    }
    transform(files) {
        if ((!files || files.length === 0) && this.options?.required) {
            throw new common_1.BadRequestException('At least one file is required');
        }
        if (!files || files.length === 0) {
            return files;
        }
        if (this.options?.maxCount && files.length > this.options.maxCount) {
            throw new common_1.BadRequestException(`Maximum ${this.options.maxCount} files allowed. Received ${files.length} files.`);
        }
        files.forEach((file, index) => {
            if (this.options?.maxSize && file.size > this.options.maxSize) {
                throw new common_1.BadRequestException(`File ${index + 1} size exceeds maximum allowed size of ${this.formatBytes(this.options.maxSize)}`);
            }
            if (this.options?.allowedTypes && !this.options.allowedTypes.includes(file.mimetype)) {
                throw new common_1.BadRequestException(`File ${index + 1} type ${file.mimetype} is not allowed`);
            }
        });
        return files;
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
exports.FilesValidationPipe = FilesValidationPipe;
exports.FilesValidationPipe = FilesValidationPipe = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [Object])
], FilesValidationPipe);
//# sourceMappingURL=file-validation.pipe.js.map