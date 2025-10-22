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
exports.JournalEntriesController = void 0;
const common_1 = require("@nestjs/common");
const journal_entries_service_1 = require("./journal-entries.service");
const create_journal_entry_dto_1 = require("./dto/create-journal-entry.dto");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const journal_entry_entity_1 = require("./entities/journal-entry.entity");
let JournalEntriesController = class JournalEntriesController {
    constructor(journalEntriesService) {
        this.journalEntriesService = journalEntriesService;
    }
    create(createJournalEntryDto, req) {
        return this.journalEntriesService.create(createJournalEntryDto, req.user.userId);
    }
    findAll(status, startDate, endDate, referenceType) {
        return this.journalEntriesService.findAll({
            status,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
            referenceType,
        });
    }
    findOne(id) {
        return this.journalEntriesService.findOne(id);
    }
    update(id, updateJournalEntryDto) {
        return this.journalEntriesService.update(id, updateJournalEntryDto);
    }
    post(id, req) {
        return this.journalEntriesService.post(id, req.user.userId);
    }
    void(id, voidDto, req) {
        return this.journalEntriesService.void(id, req.user.userId, voidDto);
    }
    remove(id) {
        return this.journalEntriesService.remove(id);
    }
};
exports.JournalEntriesController = JournalEntriesController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_journal_entry_dto_1.CreateJournalEntryDto, Object]),
    __metadata("design:returntype", void 0)
], JournalEntriesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('status')),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __param(3, (0, common_1.Query)('referenceType')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", void 0)
], JournalEntriesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], JournalEntriesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_journal_entry_dto_1.UpdateJournalEntryDto]),
    __metadata("design:returntype", void 0)
], JournalEntriesController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/post'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], JournalEntriesController.prototype, "post", null);
__decorate([
    (0, common_1.Post)(':id/void'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_journal_entry_dto_1.VoidJournalEntryDto, Object]),
    __metadata("design:returntype", void 0)
], JournalEntriesController.prototype, "void", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], JournalEntriesController.prototype, "remove", null);
exports.JournalEntriesController = JournalEntriesController = __decorate([
    (0, common_1.Controller)('journal-entries'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [journal_entries_service_1.JournalEntriesService])
], JournalEntriesController);
//# sourceMappingURL=journal-entries.controller.js.map