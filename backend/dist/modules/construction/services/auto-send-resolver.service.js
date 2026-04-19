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
var AutoSendResolverService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutoSendResolverService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const customer_entity_1 = require("../../customers/entities/customer.entity");
const property_entity_1 = require("../../properties/entities/property.entity");
const settings_service_1 = require("../../settings/settings.service");
let AutoSendResolverService = AutoSendResolverService_1 = class AutoSendResolverService {
    constructor(customerRepo, propertyRepo, settingsService) {
        this.customerRepo = customerRepo;
        this.propertyRepo = propertyRepo;
        this.settingsService = settingsService;
        this.logger = new common_1.Logger(AutoSendResolverService_1.name);
    }
    async resolve(customerId, propertyId) {
        const [customer, property, settings] = await Promise.all([
            customerId
                ? this.customerRepo.findOne({
                    where: { id: customerId },
                    select: ['id', 'autoSendMilestoneDemandDrafts'],
                })
                : Promise.resolve(null),
            propertyId
                ? this.propertyRepo.findOne({
                    where: { id: propertyId },
                    select: ['id', 'autoSendMilestoneDemandDrafts'],
                })
                : Promise.resolve(null),
            this.settingsService.get().catch(() => null),
        ]);
        const customerVal = customer?.autoSendMilestoneDemandDrafts ?? null;
        const propertyVal = property?.autoSendMilestoneDemandDrafts ?? null;
        const companyVal = settings?.autoSendMilestoneDemandDrafts ?? false;
        let shouldAutoSend;
        let source;
        if (customerVal !== null && customerVal !== undefined) {
            shouldAutoSend = !!customerVal;
            source = 'customer';
        }
        else if (propertyVal !== null && propertyVal !== undefined) {
            shouldAutoSend = !!propertyVal;
            source = 'property';
        }
        else {
            shouldAutoSend = !!companyVal;
            source = 'company';
        }
        return {
            shouldAutoSend,
            source,
            customer: customerVal,
            property: propertyVal,
            company: companyVal,
        };
    }
};
exports.AutoSendResolverService = AutoSendResolverService;
exports.AutoSendResolverService = AutoSendResolverService = AutoSendResolverService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(customer_entity_1.Customer)),
    __param(1, (0, typeorm_1.InjectRepository)(property_entity_1.Property)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        settings_service_1.SettingsService])
], AutoSendResolverService);
//# sourceMappingURL=auto-send-resolver.service.js.map