import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from '../modules/users/entities/user.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
export declare class AuthService {
    private usersRepository;
    private refreshTokenRepository;
    private jwtService;
    private configService;
    constructor(usersRepository: Repository<User>, refreshTokenRepository: Repository<RefreshToken>, jwtService: JwtService, configService: ConfigService);
    validateUser(email: string, password: string): Promise<any>;
    login(loginDto: LoginDto, ipAddress?: string, userAgent?: string): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: any;
            email: any;
            username: any;
            firstName: any;
            lastName: any;
            roles: any;
        };
    }>;
    register(registerDto: RegisterDto): Promise<{
        id: string;
        email: string;
        username: string;
        firstName: string;
        lastName: string;
        phone: string;
        alternatePhone: string;
        dateOfBirth: Date;
        gender: string;
        profileImage: string;
        isActive: boolean;
        isVerified: boolean;
        emailVerifiedAt: Date;
        lastLoginAt: Date;
        failedLoginAttempts: number;
        lockedUntil: Date;
        createdBy: string;
        updatedBy: string;
        createdAt: Date;
        updatedAt: Date;
        roles: import("../modules/users/entities/role.entity").Role[];
    }>;
    refreshAccessToken(refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logout(userId: string, refreshToken?: string): Promise<{
        message: string;
    }>;
    googleLogin(user: any, ipAddress?: string, userAgent?: string): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: any;
            email: any;
            username: any;
            firstName: any;
            lastName: any;
            profileImage: any;
            roles: any;
        };
    }>;
    private createRefreshToken;
}
