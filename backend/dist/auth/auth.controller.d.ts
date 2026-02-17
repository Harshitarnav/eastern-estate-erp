import { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(loginDto: LoginDto, req: any): Promise<{
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
        emailDomain: string;
        allowedDomain: string;
        isDomainVerified: boolean;
        propertyAccess: import("../modules/users/entities/user-property-access.entity").UserPropertyAccess[];
        createdBy: string;
        updatedBy: string;
        createdAt: Date;
        updatedAt: Date;
        roles: import("../modules/users/entities/role.entity").Role[];
    }>;
    refresh(refreshTokenDto: RefreshTokenDto): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logout(req: any, body: {
        refreshToken?: string;
    }): Promise<{
        message: string;
    }>;
    getProfile(req: any): Promise<any>;
    googleAuth(): Promise<void>;
    googleAuthCallback(req: any, res: Response): Promise<void>;
}
