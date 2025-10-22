import { Repository } from 'typeorm';
import { ConstructionProject } from './entities/construction-project.entity';
import { CreateConstructionProjectDto } from './dto/create-construction-project.dto';
import { UpdateConstructionProjectDto } from './dto/update-construction-project.dto';
export declare class ConstructionProjectsService {
    private readonly constructionProjectRepository;
    constructor(constructionProjectRepository: Repository<ConstructionProject>);
    create(createDto: CreateConstructionProjectDto): Promise<ConstructionProject>;
    findAll(propertyId?: string): Promise<ConstructionProject[]>;
    findOne(id: string): Promise<ConstructionProject>;
    update(id: string, updateDto: UpdateConstructionProjectDto): Promise<ConstructionProject>;
    remove(id: string): Promise<void>;
    getByProperty(propertyId: string): Promise<ConstructionProject[]>;
}
