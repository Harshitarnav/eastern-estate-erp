"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadModule = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const image_processor_service_1 = require("./image-processor.service");
const local_storage_service_1 = require("./storage/local-storage.service");
const upload_controller_1 = require("./upload.controller");
const multer_config_1 = require("./multer.config");
let UploadModule = class UploadModule {
};
exports.UploadModule = UploadModule;
exports.UploadModule = UploadModule = __decorate([
    (0, common_1.Module)({
        imports: [platform_express_1.MulterModule.register(multer_config_1.multerConfig)],
        controllers: [upload_controller_1.UploadController],
        providers: [image_processor_service_1.ImageProcessorService, local_storage_service_1.LocalStorageService],
        exports: [image_processor_service_1.ImageProcessorService, local_storage_service_1.LocalStorageService, platform_express_1.MulterModule],
    })
], UploadModule);
//# sourceMappingURL=upload.module.js.map