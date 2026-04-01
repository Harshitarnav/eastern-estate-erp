import { User } from '../../users/entities/user.entity';
export declare class PushSubscription {
    id: string;
    userId: string;
    user: User;
    endpoint: string;
    p256dh: string;
    auth: string;
    createdAt: Date;
}
