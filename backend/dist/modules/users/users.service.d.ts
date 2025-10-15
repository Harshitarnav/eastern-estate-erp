import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersService {
    private usersRepository;
    private rolesRepository;
    constructor(usersRepository: Repository<User>, rolesRepository: Repository<Role>);
    create(createUserDto: CreateUserDto, createdById?: string): Promise<User>;
    findAll(query?: any): Promise<{
        data: User[];
        meta: {
            total: number;
            page: any;
            limit: any;
            totalPages: number;
        };
    }>;
    findOne(id: string): Promise<User>;
    findByEmail(email: string): Promise<User>;
    update(id: string, updateUserDto: UpdateUserDto, updatedById?: string): Promise<User>;
    remove(id: string): Promise<{
        message: string;
    }>;
    toggleActive(id: string): Promise<User>;
}
