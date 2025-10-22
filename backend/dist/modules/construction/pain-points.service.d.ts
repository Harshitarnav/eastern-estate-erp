import { Repository } from 'typeorm';
import { PainPoint } from './entities/pain-point.entity';
import { CreatePainPointDto } from './dto/create-pain-point.dto';
import { UpdatePainPointDto } from './dto/update-pain-point.dto';
export declare class PainPointsService {
    private painPointsRepository;
    constructor(painPointsRepository: Repository<PainPoint>);
    create(createDto: CreatePainPointDto): Promise<PainPoint>;
    findAll(filters?: {
        projectId?: string;
        status?: string;
        severity?: string;
    }): Promise<PainPoint[]>;
    findOne(id: string): Promise<PainPoint>;
    update(id: string, updateDto: UpdatePainPointDto): Promise<PainPoint>;
    remove(id: string): Promise<void>;
    markAsResolved(id: string, resolutionNotes: string): Promise<PainPoint>;
    getOpenIssues(projectId: string): Promise<PainPoint[]>;
}
