import { SalesTaskService } from './sales-task.service';
import { CreateSalesTaskDto } from './dto/create-sales-task.dto';
import { TaskStatus } from './entities/sales-task.entity';
export declare class SalesTaskController {
    private readonly salesTaskService;
    constructor(salesTaskService: SalesTaskService);
    create(createSalesTaskDto: CreateSalesTaskDto): Promise<import("./entities/sales-task.entity").SalesTask>;
    findByUser(userId: string, status?: TaskStatus): Promise<import("./entities/sales-task.entity").SalesTask[]>;
    getTodayTasks(userId: string): Promise<import("./entities/sales-task.entity").SalesTask[]>;
    getUpcomingTasks(userId: string, days?: number): Promise<import("./entities/sales-task.entity").SalesTask[]>;
    getOverdueTasks(userId: string): Promise<import("./entities/sales-task.entity").SalesTask[]>;
    getStatistics(userId: string, startDate?: string, endDate?: string): Promise<any>;
    getTasksByDateRange(userId: string, startDate: string, endDate: string): Promise<any>;
    findOne(id: string): Promise<import("./entities/sales-task.entity").SalesTask>;
    update(id: string, updateData: Partial<CreateSalesTaskDto>): Promise<import("./entities/sales-task.entity").SalesTask>;
    completeTask(id: string, body: {
        outcome?: string;
        notes?: string;
    }): Promise<import("./entities/sales-task.entity").SalesTask>;
    updateStatus(id: string, body: {
        status: TaskStatus;
    }): Promise<import("./entities/sales-task.entity").SalesTask>;
    cancelTask(id: string, body: {
        reason?: string;
    }): Promise<import("./entities/sales-task.entity").SalesTask>;
    markReminderSent(id: string): Promise<void>;
    remove(id: string): Promise<void>;
}
