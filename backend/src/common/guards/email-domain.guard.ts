import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';

@Injectable()
export class EmailDomainGuard implements CanActivate {
  private readonly logger = new Logger(EmailDomainGuard.name);
  private readonly allowedDomain = 'eecd.in';

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.email) {
      this.logger.warn('Invalid user or missing email');
      throw new UnauthorizedException('Invalid user');
    }

    const emailDomain = user.email.split('@')[1];

    if (emailDomain !== this.allowedDomain) {
      this.logger.warn(`Unauthorized email domain: ${emailDomain} for user ${user.email}`);
      throw new UnauthorizedException(
        `Only @${this.allowedDomain} email addresses are allowed`,
      );
    }

    this.logger.debug(`Email domain verified for user: ${user.email}`);
    return true;
  }
}
