import { OnModuleInit } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { User } from './entities/user.entity';
export declare class UsersBootstrapService implements OnModuleInit {
    private readonly roleRepo;
    private readonly userRepo;
    private readonly logger;
    constructor(roleRepo: Repository<Role>, userRepo: Repository<User>);
    onModuleInit(): Promise<void>;
    private ensureCoreRoles;
    private ensureAdminHasSuperAdmin;
}
