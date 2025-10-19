import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    create(createUserDto: CreateUserDto, req: any): Promise<import("./entities/user.entity").User>;
    findAll(query: any): Promise<{
        data: import("./entities/user.entity").User[];
        meta: {
            total: number;
            page: any;
            limit: any;
            totalPages: number;
        };
    }>;
    findOne(id: string): Promise<import("./entities/user.entity").User>;
    update(id: string, updateUserDto: UpdateUserDto, req: any): Promise<import("./entities/user.entity").User>;
    remove(id: string): Promise<{
        message: string;
    }>;
    toggleActive(id: string): Promise<import("./entities/user.entity").User>;
}
export declare class RolesController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAllRoles(): Promise<import("./entities/role.entity").Role[]>;
    findOneRole(id: string): Promise<import("./entities/role.entity").Role>;
}
export declare class PermissionsController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAllPermissions(): Promise<import("./entities/permission.entity").Permission[]>;
}
