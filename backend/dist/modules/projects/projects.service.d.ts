import { Repository } from 'typeorm';
import { Project } from './entities/project.entity';
import { CreateProjectDto, PaginatedProjectResponseDto, ProjectResponseDto, QueryProjectDto, UpdateProjectDto } from './dto';
import { Property } from '../properties/entities/property.entity';
export declare class ProjectsService {
    private readonly projectsRepository;
    private readonly propertiesRepository;
    constructor(projectsRepository: Repository<Project>, propertiesRepository: Repository<Property>);
    create(createProjectDto: CreateProjectDto, userId?: string): Promise<ProjectResponseDto>;
    findAll(query: QueryProjectDto): Promise<PaginatedProjectResponseDto>;
    findOne(id: string): Promise<ProjectResponseDto>;
    findByCode(code: string): Promise<ProjectResponseDto>;
    update(id: string, updateProjectDto: UpdateProjectDto, userId?: string): Promise<ProjectResponseDto>;
    remove(id: string): Promise<{
        message: string;
    }>;
    toggleActive(id: string): Promise<ProjectResponseDto>;
    private normalizeProjectPayload;
    private mapToResponseDto;
}
