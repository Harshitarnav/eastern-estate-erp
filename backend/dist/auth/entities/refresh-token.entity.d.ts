import { User } from '../../modules/users/entities/user.entity';
export declare class RefreshToken {
    id: string;
    user: User;
    token: string;
    expiresAt: Date;
    ipAddress: string;
    userAgent: string;
    createdAt: Date;
}
