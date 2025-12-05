import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { User } from './entities/user.entity';

/**
 * Lightweight bootstrap to ensure required roles exist and the primary admin
 * has the super_admin role so guarded endpoints (like /users) are accessible.
 */
@Injectable()
export class UsersBootstrapService implements OnModuleInit {
  private readonly logger = new Logger(UsersBootstrapService.name);

  constructor(
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async onModuleInit() {
    try {
      await this.ensureCoreRoles();
      await this.ensureAdminHasSuperAdmin();
    } catch (err) {
      this.logger.warn(`Bootstrap skipped: ${err instanceof Error ? err.message : err}`);
    }
  }

  private async ensureCoreRoles() {
    const coreRoles = ['super_admin', 'admin', 'hr_manager'];
    const existing = await this.roleRepo.find({
      where: { name: In(coreRoles) as any },
    });
    const existingNames = new Set(existing.map((r) => r.name));

    const toCreate = coreRoles.filter((name) => !existingNames.has(name));
    if (toCreate.length) {
      const created = this.roleRepo.create(
        toCreate.map((name) => ({
          name,
          displayName: name.replace('_', ' ').toUpperCase(),
          description: `${name} role`,
          isSystem: true,
          isActive: true,
        })),
      );
      await this.roleRepo.save(created);
      this.logger.log(`Created roles: ${toCreate.join(', ')}`);
    }
  }

  private async ensureAdminHasSuperAdmin() {
    const adminEmail = 'admin@eastern-estate.com';
    const user = await this.userRepo.findOne({
      where: { email: adminEmail },
      relations: ['roles'],
    });
    if (!user) {
      this.logger.warn(`Admin user ${adminEmail} not found; skipping role assignment.`);
      return;
    }
    const hasSuper = user.roles?.some((r) => r.name === 'super_admin');
    if (hasSuper) return;

    const superRole = await this.roleRepo.findOne({ where: { name: 'super_admin' } });
    if (!superRole) {
      this.logger.warn('super_admin role not found; cannot assign to admin user.');
      return;
    }
    user.roles = [...(user.roles || []), superRole];
    await this.userRepo.save(user);
    this.logger.log(`Assigned super_admin role to ${adminEmail}`);
  }
}
