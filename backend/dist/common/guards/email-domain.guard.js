"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var EmailDomainGuard_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailDomainGuard = void 0;
const common_1 = require("@nestjs/common");
let EmailDomainGuard = EmailDomainGuard_1 = class EmailDomainGuard {
    constructor() {
        this.logger = new common_1.Logger(EmailDomainGuard_1.name);
        this.allowedDomain = 'eecd.in';
    }
    canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user || !user.email) {
            this.logger.warn('Invalid user or missing email');
            throw new common_1.UnauthorizedException('Invalid user');
        }
        const emailDomain = user.email.split('@')[1];
        if (emailDomain !== this.allowedDomain) {
            this.logger.warn(`Unauthorized email domain: ${emailDomain} for user ${user.email}`);
            throw new common_1.UnauthorizedException(`Only @${this.allowedDomain} email addresses are allowed`);
        }
        this.logger.debug(`Email domain verified for user: ${user.email}`);
        return true;
    }
};
exports.EmailDomainGuard = EmailDomainGuard;
exports.EmailDomainGuard = EmailDomainGuard = EmailDomainGuard_1 = __decorate([
    (0, common_1.Injectable)()
], EmailDomainGuard);
//# sourceMappingURL=email-domain.guard.js.map