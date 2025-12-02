import { ConstructionProjectsService } from './construction-projects.service';
import { CreateConstructionProjectDto } from './dto/create-construction-project.dto';
import { UpdateConstructionProjectDto } from './dto/update-construction-project.dto';
export declare class ProjectsAliasController {
    private readonly constructionProjectsService;
    constructor(constructionProjectsService: ConstructionProjectsService);
    create(createDto: CreateConstructionProjectDto): Promise<import("./entities/construction-project.entity").ConstructionProject>;
    findAll(propertyId?: string): Promise<import("./entities/construction-project.entity").ConstructionProject[]>;
    getByProperty(propertyId: string): Promise<import("./entities/construction-project.entity").ConstructionProject[]>;
    findOne(id: string): Promise<import("./entities/construction-project.entity").ConstructionProject>;
    update(id: string, updateDto: UpdateConstructionProjectDto): Promise<import("./entities/construction-project.entity").ConstructionProject>;
    remove(id: string): Promise<void>;
}
