import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';

/**
 * Guard for customer portal routes.
 * Requires the logged-in user to have the 'customer' role and a linked customerId.
 * Attaches req.customerId for downstream use in controllers/services.
 */
@Injectable()
export class CustomerPortalGuard implements CanActivate {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) throw new UnauthorizedException();

    const roles: string[] = (user.roles || []).map((r: any) =>
      typeof r === 'string' ? r : r.name,
    );

    if (!roles.includes('customer') && !roles.includes('super_admin') && !roles.includes('admin')) {
      throw new ForbiddenException('Customer portal access only');
    }

    // Fetch the full user to get customerId
    const fullUser = await this.usersRepository.findOne({
      where: { id: user.id },
      select: ['id', 'customerId'],
    });

    if (!fullUser?.customerId) {
      throw new ForbiddenException(
        'Your account is not linked to a customer profile. Please contact support.',
      );
    }

    request.customerId = fullUser.customerId;
    return true;
  }
}
