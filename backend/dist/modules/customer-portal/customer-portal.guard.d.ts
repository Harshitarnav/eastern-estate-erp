import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
export declare class CustomerPortalGuard implements CanActivate {
    private usersRepository;
    constructor(usersRepository: Repository<User>);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
