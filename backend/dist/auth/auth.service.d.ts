import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from '../modules/users/entities/user.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { PropertyAccessService } from '../modules/users/services/property-access.service';
export type PropertyAccessMode = 'wide' | 'assigned';
export interface AuthUserDto {
    id: string;
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    phone?: string;
    profileImage?: string;
    roles: Array<{
        id: string;
        name: string;
        displayName: string;
    }>;
    propertyAccessMode: PropertyAccessMode;
    assignedPropertyIds?: string[];
}
export declare class AuthService {
    private usersRepository;
    private refreshTokenRepository;
    private jwtService;
    private configService;
    private propertyAccessService;
    constructor(usersRepository: Repository<User>, refreshTokenRepository: Repository<RefreshToken>, jwtService: JwtService, configService: ConfigService, propertyAccessService: PropertyAccessService);
    validateUser(email: string, password: string): Promise<any>;
    login(loginDto: LoginDto, ipAddress?: string, userAgent?: string): Promise<{
        accessToken: string;
        refreshToken: string;
        user: AuthUserDto;
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
        emailDomain: string;
        allowedDomain: string;
        isDomainVerified: boolean;
        propertyAccess: import("../modules/users/entities/user-property-access.entity").UserPropertyAccess[];
        customerId: string | null;
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
        user: AuthUserDto;
    }>;
    getAuthenticatedProfile(userId: string): Promise<{
        permissions: import("../modules/users/entities/permission.entity").Permission[];
        id: string;
        email: string;
        username: string;
        firstName: string;
        lastName: string;
        phone?: string;
        profileImage?: string;
        roles: Array<{
            id: string;
            name: string;
            displayName: string;
        }>;
        propertyAccessMode: PropertyAccessMode;
        assignedPropertyIds?: string[];
    }>;
    private mapUserRoles;
    private buildAuthUserDto;
    private createRefreshToken;
}
