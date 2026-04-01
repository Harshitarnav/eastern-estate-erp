import { EmployeesService } from './employees.service';
import { CreateEmployeeDto, UpdateEmployeeDto, QueryEmployeeDto } from './dto';
export declare class EmployeesController {
    private readonly employeesService;
    constructor(employeesService: EmployeesService);
    create(createEmployeeDto: CreateEmployeeDto): Promise<import("./entities/employee.entity").Employee>;
    findAll(query: QueryEmployeeDto): Promise<import("./dto").PaginatedEmployeeResponseDto>;
    getStatistics(): Promise<{
        total: number;
        active: number;
        onLeave: number;
        departmentCounts: any[];
    }>;
    getNextCode(): Promise<{
        code: string;
    }>;
    findOne(id: string): Promise<import("./entities/employee.entity").Employee>;
    update(id: string, updateEmployeeDto: UpdateEmployeeDto): Promise<import("./entities/employee.entity").Employee>;
    replace(id: string, updateEmployeeDto: UpdateEmployeeDto): Promise<import("./entities/employee.entity").Employee>;
    remove(id: string): Promise<void>;
    getFeedback(id: string): Promise<import("./entities/employee-feedback.entity").EmployeeFeedback[]>;
    createFeedback(id: string, body: any, req: any): Promise<import("./entities/employee-feedback.entity").EmployeeFeedback>;
    updateFeedback(id: string, feedbackId: string, body: any, req: any): Promise<import("./entities/employee-feedback.entity").EmployeeFeedback>;
    deleteFeedback(id: string, feedbackId: string): Promise<void>;
    getReviews(id: string): Promise<import("./entities/employee-review.entity").EmployeeReview[]>;
    createReview(id: string, body: any, req: any): Promise<import("./entities/employee-review.entity").EmployeeReview>;
    updateReview(id: string, reviewId: string, body: any, req: any): Promise<import("./entities/employee-review.entity").EmployeeReview>;
    deleteReview(id: string, reviewId: string): Promise<void>;
}
