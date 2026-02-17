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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = require("bcrypt");
const config_1 = require("@nestjs/config");
const user_entity_1 = require("../modules/users/entities/user.entity");
const refresh_token_entity_1 = require("./entities/refresh-token.entity");
let AuthService = class AuthService {
    constructor(usersRepository, refreshTokenRepository, jwtService, configService) {
        this.usersRepository = usersRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.jwtService = jwtService;
        this.configService = configService;
    }
    async validateUser(email, password) {
        const user = await this.usersRepository.findOne({
            where: { email },
            relations: ['roles', 'roles.permissions'],
            select: ['id', 'email', 'username', 'password', 'firstName', 'lastName', 'isActive', 'isVerified'],
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (!user.isActive) {
            throw new common_1.UnauthorizedException('Account is deactivated');
        }
        if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
            throw new common_1.UnauthorizedException('Account is temporarily locked. Please try again later.');
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
            if (user.failedLoginAttempts >= 5) {
                user.lockedUntil = new Date(Date.now() + 30 * 60 * 1000);
            }
            await this.usersRepository.save(user);
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        user.failedLoginAttempts = 0;
        user.lockedUntil = null;
        user.lastLoginAt = new Date();
        await this.usersRepository.save(user);
        const { password: _, ...result } = user;
        return result;
    }
    async login(loginDto, ipAddress, userAgent) {
        const user = await this.validateUser(loginDto.email, loginDto.password);
        const payload = {
            sub: user.id,
            email: user.email,
            roles: user.roles.map((r) => r.name),
        };
        const accessToken = this.jwtService.sign(payload);
        const refreshToken = await this.createRefreshToken(user.id, ipAddress, userAgent);
        return {
            accessToken,
            refreshToken: refreshToken.token,
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                roles: user.roles.map((r) => ({
                    id: r.id,
                    name: r.name,
                    displayName: r.displayName,
                })),
            },
        };
    }
    async register(registerDto) {
        const existingUser = await this.usersRepository.findOne({
            where: [
                { email: registerDto.email },
                { username: registerDto.username },
            ],
        });
        if (existingUser) {
            throw new common_1.BadRequestException('User already exists with this email or username');
        }
        const saltRounds = parseInt(this.configService.get('BCRYPT_ROUNDS') || '12');
        const password = await bcrypt.hash(registerDto.password, saltRounds);
        const user = this.usersRepository.create({
            email: registerDto.email,
            username: registerDto.username,
            password,
            firstName: registerDto.firstName,
            lastName: registerDto.lastName,
            phone: registerDto.phone,
        });
        await this.usersRepository.save(user);
        const { password: _, ...result } = user;
        return result;
    }
    async refreshAccessToken(refreshToken) {
        const tokenRecord = await this.refreshTokenRepository.findOne({
            where: { token: refreshToken },
            relations: ['user', 'user.roles'],
        });
        if (!tokenRecord) {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
        if (new Date(tokenRecord.expiresAt) < new Date()) {
            await this.refreshTokenRepository.remove(tokenRecord);
            throw new common_1.UnauthorizedException('Refresh token expired');
        }
        const payload = {
            sub: tokenRecord.user.id,
            email: tokenRecord.user.email,
            roles: tokenRecord.user.roles.map(r => r.name),
        };
        const accessToken = this.jwtService.sign(payload);
        return {
            accessToken,
            refreshToken: tokenRecord.token,
        };
    }
    async logout(userId, refreshToken) {
        if (refreshToken) {
            await this.refreshTokenRepository.delete({ token: refreshToken });
        }
        else {
            await this.refreshTokenRepository.delete({ user: { id: userId } });
        }
        return { message: 'Logged out successfully' };
    }
    async googleLogin(user, ipAddress, userAgent) {
        const payload = {
            sub: user.id,
            email: user.email,
            roles: user.roles.map((r) => r.name),
        };
        const accessToken = this.jwtService.sign(payload);
        const refreshToken = await this.createRefreshToken(user.id, ipAddress, userAgent);
        return {
            accessToken,
            refreshToken: refreshToken.token,
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                profileImage: user.profileImage,
                roles: user.roles.map((r) => ({
                    id: r.id,
                    name: r.name,
                    displayName: r.displayName,
                })),
            },
        };
    }
    async createRefreshToken(userId, ipAddress, userAgent) {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        const token = this.jwtService.sign({ sub: userId, type: 'refresh' }, {
            secret: this.configService.get('JWT_REFRESH_SECRET'),
            expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION') || '7d',
        });
        const refreshToken = this.refreshTokenRepository.create({
            user: { id: userId },
            token,
            expiresAt,
            ipAddress,
            userAgent,
        });
        return await this.refreshTokenRepository.save(refreshToken);
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(refresh_token_entity_1.RefreshToken)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map