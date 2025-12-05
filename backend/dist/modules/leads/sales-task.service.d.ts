import { Repository } from 'typeorm';
import { SalesTask, TaskStatus } from './entities/sales-task.entity';
import { CreateSalesTaskDto } from './dto/create-sales-task.dto';
export declare class SalesTaskService {
    private salesTaskRepository;
    private readonly logger;
    constructor(salesTaskRepository: Repository<SalesTask>);
    create(createTaskDto: CreateSalesTaskDto): Promise<SalesTask>;
    findByUser(userId: string, status?: TaskStatus, user?: any): Promise<SalesTask[]>;
    getTodayTasks(userId: string, user?: any): Promise<SalesTask[]>;
    getUpcomingTasks(userId: string, days?: number, user?: any): Promise<SalesTask[]>;
    getOverdueTasks(userId: string, user?: any): Promise<SalesTask[]>;
    getTasksNeedingReminders(): Promise<SalesTask[]>;
    markReminderSent(taskId: string, user?: any): Promise<void>;
    completeTask(taskId: string, outcome?: string, notes?: string, user?: any): Promise<SalesTask>;
    updateStatus(taskId: string, status: TaskStatus, user?: any): Promise<SalesTask>;
    getStatistics(userId: string, startDate?: Date, endDate?: Date, user?: any): Promise<any>;
    getTasksByDateRange(userId: string, startDate: Date, endDate: Date, user?: any): Promise<any>;
    findOne(id: string, user?: any): Promise<SalesTask>;
    update(id: string, updateData: Partial<CreateSalesTaskDto>, user?: any): Promise<SalesTask>;
    remove(id: string, user?: any): Promise<void>;
    cancelTask(id: string, reason?: string, user?: any): Promise<SalesTask>;
    private isOwner;
    private isManager;
    private groupByType;
    private calculateCompletionRate;
    private calculateAvgCompletionTime;
}
