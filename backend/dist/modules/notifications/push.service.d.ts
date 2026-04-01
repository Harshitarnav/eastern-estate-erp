import { Repository } from 'typeorm';
import { PushSubscription } from './entities/push-subscription.entity';
export declare class PushService {
    private pushRepo;
    private readonly logger;
    private readonly enabled;
    constructor(pushRepo: Repository<PushSubscription>);
    getPublicKey(): string | null;
    subscribe(userId: string, endpoint: string, p256dh: string, auth: string): Promise<void>;
    unsubscribe(userId: string, endpoint: string): Promise<void>;
    sendToUser(userId: string, title: string, body: string, url?: string): Promise<void>;
}
