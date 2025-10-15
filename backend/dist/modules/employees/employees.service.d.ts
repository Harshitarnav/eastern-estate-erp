import { Repository } from 'typeorm';
import { Employee } from './entities/employee.entity';
import { CreateEmployeeDto, UpdateEmployeeDto, QueryEmployeeDto, PaginatedEmployeeResponseDto } from './dto';
export declare class EmployeesService {
    private employeesRepository;
    constructor(employeesRepository: Repository<Employee>);
    create(createEmployeeDto: CreateEmployeeDto): Promise<Employee>;
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
