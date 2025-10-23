import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
export declare class RolesController {
    private readonly rolesService;
    constructor(rolesService: RolesService);
    create(createRoleDto: CreateRoleDto, req: any): Promise<import("./entities/role.entity").Role>;
    findAll(): Promise<import("./entities/role.entity").Role[]>;
    getAllPermissions(): Promise<import("./entities/permission.entity").Permission[]>;
    findOne(id: string): Promise<import("./entities/role.entity").Role>;
    getUserPermissions(id: string): Promise<import("./entities/permission.entity").Permission[]>;
    update(id: string, updateRoleDto: UpdateRoleDto, req: any): Promise<import("./entities/role.entity").Role>;
    remove(id: string): Promise<void>;
}
