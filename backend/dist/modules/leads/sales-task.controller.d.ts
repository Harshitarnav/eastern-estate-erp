import { SalesTaskService } from './sales-task.service';
import { CreateSalesTaskDto } from './dto/create-sales-task.dto';
import { TaskStatus } from './entities/sales-task.entity';
import { Request } from 'express';
export declare class SalesTaskController {
    private readonly salesTaskService;
    constructor(salesTaskService: SalesTaskService);
    create(createSalesTaskDto: CreateSalesTaskDto, req: Request): Promise<import("./entities/sales-task.entity").SalesTask>;
    findByUser(userId: string, status: TaskStatus, req: Request): Promise<import("./entities/sales-task.entity").SalesTask[]>;
    getTodayTasks(userId: string, req: Request): Promise<import("./entities/sales-task.entity").SalesTask[]>;
    getUpcomingTasks(userId: string, days: number, req: Request): Promise<import("./entities/sales-task.entity").SalesTask[]>;
    getOverdueTasks(userId: string, req: Request): Promise<import("./entities/sales-task.entity").SalesTask[]>;
    getStatistics(userId: string, startDate?: string, endDate?: string, req?: Request): Promise<any>;
    getTasksByDateRange(userId: string, startDate: string, endDate: string, req: Request): Promise<any>;
    findOne(id: string, req: Request): Promise<import("./entities/sales-task.entity").SalesTask>;
    update(id: string, updateData: Partial<CreateSalesTaskDto>, req: Request): Promise<import("./entities/sales-task.entity").SalesTask>;
    completeTask(id: string, body: {
        outcome?: string;
        notes?: string;
    }, req: Request): Promise<import("./entities/sales-task.entity").SalesTask>;
    updateStatus(id: string, body: {
        status: TaskStatus;
    }, req: Request): Promise<import("./entities/sales-task.entity").SalesTask>;
    cancelTask(id: string, body: {
        reason?: string;
    }, req: Request): Promise<import("./entities/sales-task.entity").SalesTask>;
    markReminderSent(id: string, req: Request): Promise<void>;
    remove(id: string, req: Request): Promise<void>;
    private isManager;
    private getEffectiveUserId;
}
