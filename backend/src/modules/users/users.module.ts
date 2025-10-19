import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController, RolesController, PermissionsController } from './users.controller';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role, Permission])],
  controllers: [UsersController, RolesController, PermissionsController],
  providers: [UsersService],
  exports: [UsersService, TypeOrmModule],
})
export class UsersModule {}
