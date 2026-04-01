import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as webpush from 'web-push';
import { PushSubscription } from './entities/push-subscription.entity';

@Injectable()
export class PushService {
  private readonly logger = new Logger(PushService.name);
  private readonly enabled: boolean;

  constructor(
    @InjectRepository(PushSubscription)
    private pushRepo: Repository<PushSubscription>,
  ) {
    const pub  = process.env.VAPID_PUBLIC_KEY;
    const priv = process.env.VAPID_PRIVATE_KEY;
    if (pub && priv) {
      webpush.setVapidDetails('mailto:hr@eecd.in', pub, priv);
      this.enabled = true;
    } else {
      this.logger.warn('VAPID keys not set — push notifications disabled');
      this.enabled = false;
    }
  }

  getPublicKey(): string | null {
    return process.env.VAPID_PUBLIC_KEY || null;
  }

  async subscribe(userId: string, endpoint: string, p256dh: string, auth: string): Promise<void> {
    const existing = await this.pushRepo.findOne({ where: { userId, endpoint } });
    if (!existing) {
      await this.pushRepo.save(this.pushRepo.create({ userId, endpoint, p256dh, auth }));
    }
  }

  async unsubscribe(userId: string, endpoint: string): Promise<void> {
    await this.pushRepo.delete({ userId, endpoint });
  }

  async sendToUser(userId: string, title: string, body: string, url?: string): Promise<void> {
    if (!this.enabled) return;
    const subs = await this.pushRepo.find({ where: { userId } });
    const payload = JSON.stringify({ title, body, url: url || '/' });
    for (const sub of subs) {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload,
        );
      } catch (err: any) {
        if (err.statusCode === 404 || err.statusCode === 410) {
          await this.pushRepo.delete({ id: sub.id });
        } else {
          this.logger.error(`Push failed for sub ${sub.id}: ${err.message}`);
        }
      }
    }
  }
}
