import { Repository } from 'typeorm';
import { DailyProgressReport } from './entities/daily-progress-report.entity';
import { CreateDailyProgressReportDto } from './dto/create-daily-progress-report.dto';
import { UpdateDailyProgressReportDto } from './dto/update-daily-progress-report.dto';
export declare class DailyProgressReportsService {
    private reportsRepository;
    constructor(reportsRepository: Repository<DailyProgressReport>);
    create(createDto: CreateDailyProgressReportDto): Promise<DailyProgressReport>;
    findAll(filters?: {
        projectId?: string;
        fromDate?: Date;
        toDate?: Date;
    }): Promise<DailyProgressReport[]>;
    findOne(id: string): Promise<DailyProgressReport>;
    update(id: string, updateDto: UpdateDailyProgressReportDto): Promise<DailyProgressReport>;
    remove(id: string): Promise<void>;
    getAttendanceSummary(projectId: string, month: number, year: number): Promise<{
        totalPresent: number;
        totalAbsent: number;
        avgAttendance: number;
        totalDays: number;
    }>;
}
