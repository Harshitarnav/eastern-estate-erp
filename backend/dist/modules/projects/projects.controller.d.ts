import { ProjectsService } from './projects.service';
import { CreateProjectDto, PaginatedProjectResponseDto, ProjectResponseDto, QueryProjectDto, UpdateProjectDto } from './dto';
export declare class ProjectsController {
    private readonly projectsService;
    constructor(projectsService: ProjectsService);
    create(createProjectDto: CreateProjectDto, req: any): Promise<ProjectResponseDto>;
    findAll(query: QueryProjectDto): Promise<PaginatedProjectResponseDto>;
    findByCode(code: string): Promise<ProjectResponseDto>;
    findOne(id: string): Promise<ProjectResponseDto>;
    update(id: string, updateProjectDto: UpdateProjectDto, req: any): Promise<ProjectResponseDto>;
    remove(id: string): Promise<{
        message: string;
    }>;
    toggleActive(id: string): Promise<ProjectResponseDto>;
}
