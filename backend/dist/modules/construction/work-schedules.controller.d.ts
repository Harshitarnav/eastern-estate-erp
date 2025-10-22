import { WorkSchedulesService } from './work-schedules.service';
import { CreateWorkScheduleDto } from './dto/create-work-schedule.dto';
import { UpdateWorkScheduleDto } from './dto/update-work-schedule.dto';
export declare class WorkSchedulesController {
    private readonly schedulesService;
    constructor(schedulesService: WorkSchedulesService);
    create(createDto: CreateWorkScheduleDto): Promise<import("./entities/work-schedule.entity").WorkSchedule>;
    findAll(projectId?: string, assignedTo?: string, status?: string): Promise<import("./entities/work-schedule.entity").WorkSchedule[]>;
    getUpcomingTasks(projectId: string, days?: string): Promise<import("./entities/work-schedule.entity").WorkSchedule[]>;
    getOverdueTasks(projectId: string): Promise<import("./entities/work-schedule.entity").WorkSchedule[]>;
    getTasksByEngineer(engineerId: string): Promise<import("./entities/work-schedule.entity").WorkSchedule[]>;
    findOne(id: string): Promise<import("./entities/work-schedule.entity").WorkSchedule>;
    update(id: string, updateDto: UpdateWorkScheduleDto): Promise<import("./entities/work-schedule.entity").WorkSchedule>;
    updateProgress(id: string, progress: number): Promise<import("./entities/work-schedule.entity").WorkSchedule>;
    remove(id: string): Promise<void>;
}
