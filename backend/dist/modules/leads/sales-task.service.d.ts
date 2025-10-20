import { Repository } from 'typeorm';
import { SalesTask, TaskStatus } from './entities/sales-task.entity';
import { CreateSalesTaskDto } from './dto/create-sales-task.dto';
export declare class SalesTaskService {
    private salesTaskRepository;
    private readonly logger;
    constructor(salesTaskRepository: Repository<SalesTask>);
    create(createTaskDto: CreateSalesTaskDto): Promise<SalesTask>;
    findByUser(userId: string, status?: TaskStatus): Promise<SalesTask[]>;
    getTodayTasks(userId: string): Promise<SalesTask[]>;
    getUpcomingTasks(userId: string, days?: number): Promise<SalesTask[]>;
    getOverdueTasks(userId: string): Promise<SalesTask[]>;
    getTasksNeedingReminders(): Promise<SalesTask[]>;
    markReminderSent(taskId: string): Promise<void>;
    completeTask(taskId: string, outcome?: string, notes?: string): Promise<SalesTask>;
    updateStatus(taskId: string, status: TaskStatus): Promise<SalesTask>;
    getStatistics(userId: string, startDate?: Date, endDate?: Date): Promise<any>;
    getTasksByDateRange(userId: string, startDate: Date, endDate: Date): Promise<any>;
    findOne(id: string): Promise<SalesTask>;
    update(id: string, updateData: Partial<CreateSalesTaskDto>): Promise<SalesTask>;
    remove(id: string): Promise<void>;
    cancelTask(id: string, reason?: string): Promise<SalesTask>;
    private groupByType;
    private calculateCompletionRate;
    private calculateAvgCompletionTime;
}
