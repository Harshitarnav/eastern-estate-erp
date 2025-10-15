import { Role } from './role.entity';
export declare class User {
    id: string;
    email: string;
    username: string;
    password: string;
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
    roles: Role[];
}
