import { Repository } from 'typeorm';
import { Employee } from './entities/employee.entity';
import { CreateEmployeeDto, UpdateEmployeeDto, QueryEmployeeDto, PaginatedEmployeeResponseDto } from './dto';
import { UsersService } from '../users/users.service';
import { NotificationsService } from '../notifications/notifications.service';
export declare class EmployeesService {
    private employeesRepository;
    private usersService;
    private notificationsService;
    private readonly logger;
    constructor(employeesRepository: Repository<Employee>, usersService: UsersService, notificationsService: NotificationsService);
    create(createEmployeeDto: CreateEmployeeDto, createdBy?: string): Promise<Employee>;
    private createUserForEmployee;
    findAll(query: QueryEmployeeDto): Promise<PaginatedEmployeeResponseDto>;
    findOne(id: string): Promise<Employee>;
    update(id: string, updateEmployeeDto: UpdateEmployeeDto): Promise<Employee>;
    remove(id: string): Promise<void>;
    getStatistics(): Promise<{
        total: number;
        active: number;
        onLeave: number;
        departmentCounts: any[];
    }>;
}
