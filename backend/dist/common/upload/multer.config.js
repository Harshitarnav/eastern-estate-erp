"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.imageUploadConfig = exports.multerConfig = void 0;
const multer_1 = require("multer");
const path_1 = require("path");
const uuid_1 = require("uuid");
const common_1 = require("@nestjs/common");
exports.multerConfig = {
    storage: (0, multer_1.diskStorage)({
        destination: (req, file, cb) => {
            const uploadPath = process.env.UPLOAD_LOCATION || './uploads';
            cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
            const uniqueId = (0, uuid_1.v4)();
            const ext = (0, path_1.extname)(file.originalname);
            const filename = `${uniqueId}${ext}`;
            cb(null, filename);
        },
    }),
    fileFilter: (req, file, cb) => {
        const allowedMimes = [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/gif',
            'image/webp',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'text/plain',
            'text/csv',
        ];
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new common_1.BadRequestException(`File type ${file.mimetype} is not allowed`), false);
        }
    },
    limits: {
        fileSize: 10 * 1024 * 1024,
    },
};
exports.imageUploadConfig = {
    ...exports.multerConfig,
    fileFilter: (req, file, cb) => {
        const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new common_1.BadRequestException('Only image files are allowed'), false);
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
};
//# sourceMappingURL=multer.config.js.map