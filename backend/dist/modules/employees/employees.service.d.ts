import { Repository } from 'typeorm';
import { Employee } from './entities/employee.entity';
import { EmployeeFeedback } from './entities/employee-feedback.entity';
import { EmployeeReview } from './entities/employee-review.entity';
import { CreateEmployeeDto, UpdateEmployeeDto, QueryEmployeeDto, PaginatedEmployeeResponseDto } from './dto';
import { UsersService } from '../users/users.service';
import { NotificationsService } from '../notifications/notifications.service';
export declare class EmployeesService {
    private employeesRepository;
    private feedbackRepository;
    private reviewRepository;
    private usersService;
    private notificationsService;
    private readonly logger;
    constructor(employeesRepository: Repository<Employee>, feedbackRepository: Repository<EmployeeFeedback>, reviewRepository: Repository<EmployeeReview>, usersService: UsersService, notificationsService: NotificationsService);
    generateNextCode(): Promise<string>;
    create(createEmployeeDto: CreateEmployeeDto, createdBy?: string): Promise<Employee>;
    private createUserForEmployee;
    findAll(query: QueryEmployeeDto): Promise<PaginatedEmployeeResponseDto>;
    findOne(id: string): Promise<Employee>;
    update(id: string, updateEmployeeDto: UpdateEmployeeDto): Promise<Employee>;
    remove(id: string): Promise<void>;
    createFeedback(employeeId: string, data: Partial<EmployeeFeedback>, createdBy?: string): Promise<EmployeeFeedback>;
    getFeedback(employeeId: string): Promise<EmployeeFeedback[]>;
    updateFeedback(employeeId: string, feedbackId: string, data: Partial<EmployeeFeedback>, updatedBy?: string): Promise<EmployeeFeedback>;
    deleteFeedback(employeeId: string, feedbackId: string): Promise<void>;
    createReview(employeeId: string, data: Partial<EmployeeReview>, createdBy?: string): Promise<EmployeeReview>;
    getReviews(employeeId: string): Promise<EmployeeReview[]>;
    updateReview(employeeId: string, reviewId: string, data: Partial<EmployeeReview>, updatedBy?: string): Promise<EmployeeReview>;
    deleteReview(employeeId: string, reviewId: string): Promise<void>;
    getStatistics(): Promise<{
        total: number;
        active: number;
        onLeave: number;
        departmentCounts: any[];
    }>;
}
