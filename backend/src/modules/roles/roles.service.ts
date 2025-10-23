import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { RolePermission } from './entities/role-permission.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
    @InjectRepository(RolePermission)
    private rolePermissionRepository: Repository<RolePermission>,
  ) {}

  async create(createRoleDto: CreateRoleDto, userId: string): Promise<Role> {
    const { permissionIds, ...roleData } = createRoleDto;

    // Check if role name already exists
    const existing = await this.roleRepository.findOne({
      where: { name: roleData.name },
    });

    if (existing) {
      throw new BadRequestException('Role with this name already exists');
    }

    // Create role
    const role = this.roleRepository.create({
      ...roleData,
      createdBy: userId,
    });

    await this.roleRepository.save(role);

    // Assign permissions
    if (permissionIds && permissionIds.length > 0) {
      await this.assignPermissions(role.id, permissionIds);
    }

    return this.findOne(role.id);
  }

  async findAll(): Promise<Role[]> {
    return this.roleRepository.find({
      where: { isActive: true },
      relations: ['rolePermissions', 'rolePermissions.permission'],
      order: { displayName: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: ['rolePermissions', 'rolePermissions.permission'],
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return role;
  }

  async update(id: string, updateRoleDto: UpdateRoleDto, userId: string): Promise<Role> {
    const role = await this.findOne(id);

    if (role.isSystemRole) {
      throw new BadRequestException('Cannot modify system roles');
    }

    const { permissionIds, ...roleData } = updateRoleDto;

    // Update role data
    Object.assign(role, roleData);
    role.updatedBy = userId;
    await this.roleRepository.save(role);

    // Update permissions if provided
    if (permissionIds !== undefined) {
      // Remove existing permissions
      await this.rolePermissionRepository.delete({ roleId: id });
      
      // Add new permissions
      if (permissionIds.length > 0) {
        await this.assignPermissions(id, permissionIds);
      }
    }

    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const role = await this.findOne(id);

    if (role.isSystemRole) {
      throw new BadRequestException('Cannot delete system roles');
    }

    await this.roleRepository.update(id, { isActive: false });
  }

  async getAllPermissions(): Promise<Permission[]> {
    return this.permissionRepository.find({
      order: {
        module: 'ASC',
        action: 'ASC',
      },
    });
  }

  async checkPermission(roleId: string, module: string, action: string): Promise<boolean> {
    const count = await this.rolePermissionRepository
      .createQueryBuilder('rp')
      .innerJoin('rp.permission', 'p')
      .where('rp.role_id = :roleId', { roleId })
      .andWhere('p.module = :module', { module })
      .andWhere('p.action = :action', { action })
      .getCount();

    return count > 0;
  }

  async getUserPermissions(roleId: string): Promise<Permission[]> {
    const rolePermissions = await this.rolePermissionRepository.find({
      where: { roleId },
      relations: ['permission'],
    });

    return rolePermissions.map(rp => rp.permission);
  }

  private async assignPermissions(roleId: string, permissionIds: string[]): Promise<void> {
    const permissions = await this.permissionRepository.find({
      where: { id: In(permissionIds) },
    });

    if (permissions.length !== permissionIds.length) {
      throw new BadRequestException('Some permissions not found');
    }

    const rolePermissions = permissionIds.map(permissionId => 
      this.rolePermissionRepository.create({
        roleId,
        permissionId,
      })
    );

    await this.rolePermissionRepository.save(rolePermissions);
  }
}
