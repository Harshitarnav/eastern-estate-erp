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
var GoogleStrategy_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleStrategy = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const passport_google_oauth20_1 = require("passport-google-oauth20");
const config_1 = require("@nestjs/config");
const users_service_1 = require("../../modules/users/users.service");
let GoogleStrategy = GoogleStrategy_1 = class GoogleStrategy extends (0, passport_1.PassportStrategy)(passport_google_oauth20_1.Strategy, 'google') {
    constructor(configService, usersService) {
        const clientID = configService.get('GOOGLE_CLIENT_ID');
        const clientSecret = configService.get('GOOGLE_CLIENT_SECRET');
        const callbackURL = configService.get('GOOGLE_CALLBACK_URL');
        super({
            clientID: clientID || 'GOOGLE_OAUTH_NOT_CONFIGURED',
            clientSecret: clientSecret || 'GOOGLE_OAUTH_NOT_CONFIGURED',
            callbackURL: callbackURL || 'http://localhost:3001/api/v1/auth/google/callback',
            scope: ['email', 'profile'],
        });
        this.configService = configService;
        this.usersService = usersService;
        this.logger = new common_1.Logger(GoogleStrategy_1.name);
        this.isConfigured = !!(clientID && clientSecret && callbackURL);
        if (!this.isConfigured) {
            this.logger.warn('Google OAuth is not configured (GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET / GOOGLE_CALLBACK_URL are empty). ' +
                'Google login will be disabled. Use email + password to log in locally.');
        }
    }
    async validate(accessToken, refreshToken, profile, done) {
        if (!this.isConfigured) {
            return done(new common_1.UnauthorizedException('Google OAuth is not configured on this server. Please use email and password to log in.'), null);
        }
        const { id, name, emails, photos } = profile;
        if (!emails || emails.length === 0) {
            return done(new common_1.UnauthorizedException('No email found in Google profile'), null);
        }
        const email = emails[0].value;
        if (!email.endsWith('@eecd.in')) {
            return done(new common_1.UnauthorizedException('Access denied. Only @eecd.in email addresses are allowed to access this system.'), null);
        }
        let user = await this.usersService.findByEmail(email);
        if (!user) {
            const firstName = name?.givenName || email.split('@')[0];
            const lastName = name?.familyName || '';
            user = await this.usersService.create({
                email,
                username: email.split('@')[0],
                password: `google_oauth_${Date.now()}`,
                firstName,
                lastName,
                roleIds: [],
                profileImage: photos && photos.length > 0 ? photos[0].value : null,
            }, null);
            user = await this.usersService.findByEmail(email);
        }
        else if (!user.isActive) {
            return done(new common_1.UnauthorizedException('Your account has been deactivated. Please contact administrator.'), null);
        }
        if (!user.roles || user.roles.length === 0) {
            user = await this.usersService.findByEmail(email);
        }
        const userData = {
            id: user.id,
            email: user.email,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            profileImage: user.profileImage || (photos && photos.length > 0 ? photos[0].value : null),
            googleId: id,
            roles: user.roles || [],
        };
        return done(null, userData);
    }
};
exports.GoogleStrategy = GoogleStrategy;
exports.GoogleStrategy = GoogleStrategy = GoogleStrategy_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        users_service_1.UsersService])
], GoogleStrategy);
//# sourceMappingURL=google.strategy.js.map