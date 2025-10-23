import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { RolePermission } from './entities/role-permission.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
export declare class RolesService {
    private roleRepository;
    private permissionRepository;
    private rolePermissionRepository;
    constructor(roleRepository: Repository<Role>, permissionRepository: Repository<Permission>, rolePermissionRepository: Repository<RolePermission>);
    create(createRoleDto: CreateRoleDto, userId: string): Promise<Role>;
    findAll(): Promise<Role[]>;
    findOne(id: string): Promise<Role>;
    update(id: string, updateRoleDto: UpdateRoleDto, userId: string): Promise<Role>;
    remove(id: string): Promise<void>;
    getAllPermissions(): Promise<Permission[]>;
    checkPermission(roleId: string, module: string, action: string): Promise<boolean>;
    getUserPermissions(roleId: string): Promise<Permission[]>;
    private assignPermissions;
}
