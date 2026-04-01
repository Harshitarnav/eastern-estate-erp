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
exports.DocumentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const document_entity_1 = require("./entities/document.entity");
const storage_token_1 = require("../../common/upload/storage/storage.token");
const path = require("path");
let DocumentsService = class DocumentsService {
    constructor(repo, storage) {
        this.repo = repo;
        this.storage = storage;
    }
    async create(file, dto, userId) {
        try {
            await this.storage.save(file, file.filename);
        }
        catch (err) {
            if (err?.code === 'ECONNREFUSED' || err?.name === 'AggregateError') {
                throw new common_1.ServiceUnavailableException('File storage is unavailable right now. Please try again later or contact your administrator.');
            }
            throw err;
        }
        const doc = this.repo.create({
            ...dto,
            fileUrl: this.storage.getUrl(file.filename),
            fileName: file.originalname,
            mimeType: file.mimetype,
            fileSize: file.size,
            uploadedBy: userId,
        });
        return this.repo.save(doc);
    }
    async findByEntity(entityType, entityId) {
        return this.repo.find({
            where: { entityType, entityId },
            order: { createdAt: 'DESC' },
        });
    }
    async findByCustomer(customerId) {
        return this.repo.find({
            where: { customerId },
            order: { createdAt: 'DESC' },
        });
    }
    async findByBooking(bookingId) {
        return this.repo.find({
            where: { bookingId },
            order: { createdAt: 'DESC' },
        });
    }
    async findOne(id) {
        const doc = await this.repo.findOne({ where: { id } });
        if (!doc)
            throw new common_1.NotFoundException(`Document ${id} not found`);
        return doc;
    }
    async remove(id, userId) {
        const doc = await this.findOne(id);
        try {
            const key = path.basename(doc.fileUrl);
            await this.storage.delete(key);
        }
        catch {
        }
        await this.repo.remove(doc);
    }
    async update(id, updates) {
        const doc = await this.findOne(id);
        Object.assign(doc, updates);
        return this.repo.save(doc);
    }
};
exports.DocumentsService = DocumentsService;
exports.DocumentsService = DocumentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(document_entity_1.Document)),
    __param(1, (0, common_1.Inject)(storage_token_1.STORAGE_SERVICE)),
    __metadata("design:paramtypes", [typeorm_2.Repository, Object])
], DocumentsService);
//# sourceMappingURL=documents.service.js.map