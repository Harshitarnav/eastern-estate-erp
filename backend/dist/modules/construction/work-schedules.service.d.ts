import { Repository } from 'typeorm';
import { WorkSchedule } from './entities/work-schedule.entity';
import { CreateWorkScheduleDto } from './dto/create-work-schedule.dto';
import { UpdateWorkScheduleDto } from './dto/update-work-schedule.dto';
export declare class WorkSchedulesService {
    private schedulesRepository;
    constructor(schedulesRepository: Repository<WorkSchedule>);
    create(createDto: CreateWorkScheduleDto): Promise<WorkSchedule>;
    findAll(filters?: {
        projectId?: string;
        assignedTo?: string;
        status?: string;
    }): Promise<WorkSchedule[]>;
    findOne(id: string): Promise<WorkSchedule>;
    update(id: string, updateDto: UpdateWorkScheduleDto): Promise<WorkSchedule>;
    remove(id: string): Promise<void>;
    updateProgress(id: string, progress: number): Promise<WorkSchedule>;
    getUpcomingTasks(projectId: string, days?: number): Promise<WorkSchedule[]>;
    getOverdueTasks(projectId: string): Promise<WorkSchedule[]>;
    getTasksByEngineer(engineerId: string): Promise<WorkSchedule[]>;
}
