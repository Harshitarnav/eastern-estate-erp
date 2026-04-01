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
var PushService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PushService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const webpush = require("web-push");
const push_subscription_entity_1 = require("./entities/push-subscription.entity");
let PushService = PushService_1 = class PushService {
    constructor(pushRepo) {
        this.pushRepo = pushRepo;
        this.logger = new common_1.Logger(PushService_1.name);
        const pub = process.env.VAPID_PUBLIC_KEY;
        const priv = process.env.VAPID_PRIVATE_KEY;
        if (pub && priv) {
            webpush.setVapidDetails('mailto:hr@eecd.in', pub, priv);
            this.enabled = true;
        }
        else {
            this.logger.warn('VAPID keys not set — push notifications disabled');
            this.enabled = false;
        }
    }
    getPublicKey() {
        return process.env.VAPID_PUBLIC_KEY || null;
    }
    async subscribe(userId, endpoint, p256dh, auth) {
        const existing = await this.pushRepo.findOne({ where: { userId, endpoint } });
        if (!existing) {
            await this.pushRepo.save(this.pushRepo.create({ userId, endpoint, p256dh, auth }));
        }
    }
    async unsubscribe(userId, endpoint) {
        await this.pushRepo.delete({ userId, endpoint });
    }
    async sendToUser(userId, title, body, url) {
        if (!this.enabled)
            return;
        const subs = await this.pushRepo.find({ where: { userId } });
        const payload = JSON.stringify({ title, body, url: url || '/' });
        for (const sub of subs) {
            try {
                await webpush.sendNotification({ endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } }, payload);
            }
            catch (err) {
                if (err.statusCode === 404 || err.statusCode === 410) {
                    await this.pushRepo.delete({ id: sub.id });
                }
                else {
                    this.logger.error(`Push failed for sub ${sub.id}: ${err.message}`);
                }
            }
        }
    }
};
exports.PushService = PushService;
exports.PushService = PushService = PushService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(push_subscription_entity_1.PushSubscription)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], PushService);
//# sourceMappingURL=push.service.js.map