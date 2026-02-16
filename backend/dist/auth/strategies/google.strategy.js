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
exports.GoogleStrategy = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const passport_google_oauth20_1 = require("passport-google-oauth20");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../../modules/users/entities/user.entity");
let GoogleStrategy = class GoogleStrategy extends (0, passport_1.PassportStrategy)(passport_google_oauth20_1.Strategy, 'google') {
    constructor(configService, usersRepository) {
        const options = {
            clientID: configService.get('GOOGLE_CLIENT_ID'),
            clientSecret: configService.get('GOOGLE_CLIENT_SECRET'),
            callbackURL: configService.get('GOOGLE_CALLBACK_URL'),
            scope: ['email', 'profile'],
            prompt: 'select_account',
        };
        super(options);
        this.configService = configService;
        this.usersRepository = usersRepository;
    }
    async validate(accessToken, refreshToken, profile, done) {
        const { emails, name, photos } = profile;
        if (!emails || emails.length === 0) {
            return done(new common_1.UnauthorizedException('No email found from Google'), null);
        }
        const email = emails[0].value;
        const emailDomain = email.split('@')[1];
        if (emailDomain !== 'eecd.in') {
            return done(new common_1.UnauthorizedException('Only @eecd.in domain emails are allowed'), null);
        }
        const user = await this.usersRepository.findOne({
            where: { email },
            relations: ['roles', 'roles.permissions'],
        });
        if (!user) {
            return done(new common_1.UnauthorizedException('You do not have access yet. Please contact HR to set up your account.'), null);
        }
        if (!user.isActive) {
            return done(new common_1.UnauthorizedException('Your account has been deactivated. Please contact HR.'), null);
        }
        user.lastLoginAt = new Date();
        if (!user.profileImage && photos && photos.length > 0) {
            user.profileImage = photos[0].value;
        }
        if (!user.firstName && name?.givenName) {
            user.firstName = name.givenName;
        }
        if (!user.lastName && name?.familyName) {
            user.lastName = name.familyName;
        }
        await this.usersRepository.save(user);
        const userPayload = {
            id: user.id,
            email: user.email,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            profileImage: user.profileImage,
            roles: user.roles,
            permissions: user.roles.flatMap(role => role.permissions),
        };
        return done(null, userPayload);
    }
};
exports.GoogleStrategy = GoogleStrategy;
exports.GoogleStrategy = GoogleStrategy = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [config_1.ConfigService,
        typeorm_2.Repository])
], GoogleStrategy);
//# sourceMappingURL=google.strategy.js.map