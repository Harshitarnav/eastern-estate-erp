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
        user: import("./auth.service").AuthUserDto;
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
    refresh(refreshTokenDto: RefreshTokenDto): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logout(req: any, body: {
        refreshToken?: string;
    }): Promise<{
        message: string;
    }>;
    getProfile(req: any): Promise<{
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
        propertyAccessMode: import("./auth.service").PropertyAccessMode;
        assignedPropertyIds?: string[];
    }>;
    googleAuth(): Promise<void>;
    googleAuthCallback(req: any, res: Response): Promise<void>;
}
