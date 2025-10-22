import { PainPointsService } from './pain-points.service';
import { CreatePainPointDto } from './dto/create-pain-point.dto';
import { UpdatePainPointDto } from './dto/update-pain-point.dto';
export declare class PainPointsController {
    private readonly painPointsService;
    constructor(painPointsService: PainPointsService);
    create(createDto: CreatePainPointDto): Promise<import("./entities/pain-point.entity").PainPoint>;
    findAll(projectId?: string, status?: string, severity?: string): Promise<import("./entities/pain-point.entity").PainPoint[]>;
    getOpenIssues(projectId: string): Promise<import("./entities/pain-point.entity").PainPoint[]>;
    findOne(id: string): Promise<import("./entities/pain-point.entity").PainPoint>;
    update(id: string, updateDto: UpdatePainPointDto): Promise<import("./entities/pain-point.entity").PainPoint>;
    markAsResolved(id: string, resolutionNotes: string): Promise<import("./entities/pain-point.entity").PainPoint>;
    remove(id: string): Promise<void>;
}
