import { DailyProgressReportsService } from './daily-progress-reports.service';
import { CreateDailyProgressReportDto } from './dto/create-daily-progress-report.dto';
import { UpdateDailyProgressReportDto } from './dto/update-daily-progress-report.dto';
export declare class DailyProgressReportsController {
    private readonly reportsService;
    constructor(reportsService: DailyProgressReportsService);
    create(createDto: CreateDailyProgressReportDto): Promise<import("./entities/daily-progress-report.entity").DailyProgressReport>;
    findAll(projectId?: string, fromDate?: string, toDate?: string): Promise<import("./entities/daily-progress-report.entity").DailyProgressReport[]>;
    getAttendanceSummary(projectId: string, month: string, year: string): Promise<{
        totalPresent: number;
        totalAbsent: number;
        avgAttendance: number;
        totalDays: number;
    }>;
    findOne(id: string): Promise<import("./entities/daily-progress-report.entity").DailyProgressReport>;
    update(id: string, updateDto: UpdateDailyProgressReportDto): Promise<import("./entities/daily-progress-report.entity").DailyProgressReport>;
    remove(id: string): Promise<void>;
}
