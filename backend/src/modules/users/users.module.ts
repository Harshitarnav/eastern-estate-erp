import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController, RolesController, PermissionsController } from './users.controller';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { UserPropertyAccess } from './entities/user-property-access.entity';
import { PropertyRoleTemplate } from './entities/property-role-template.entity';
import { UsersBootstrapService } from './users.bootstrap';
import { PropertyAccessService } from './services/property-access.service';
import { PropertyAccessController } from './controllers/property-access.controller';
import { Property } from '../properties/entities/property.entity';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Role,
      Permission,
      UserPropertyAccess,
      PropertyRoleTemplate,
      Property,
    ]),
    NotificationsModule, // Import for PropertyAccessController
  ],
  controllers: [
    UsersController,
    RolesController,
    PermissionsController,
    PropertyAccessController,
  ],
  providers: [UsersService, UsersBootstrapService, PropertyAccessService],
  exports: [UsersService, PropertyAccessService, TypeOrmModule],
})
export class UsersModule {}
