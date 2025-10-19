import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './entities/project.entity';
import {
  CreateProjectDto,
  PaginatedProjectResponseDto,
  ProjectResponseDto,
  QueryProjectDto,
  UpdateProjectDto,
} from './dto';
import { Property } from '../properties/entities/property.entity';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectsRepository: Repository<Project>,
    @InjectRepository(Property)
    private readonly propertiesRepository: Repository<Property>,
  ) {}

  async create(createProjectDto: CreateProjectDto, userId?: string): Promise<ProjectResponseDto> {
    const existingProject = await this.projectsRepository.findOne({
      where: { projectCode: createProjectDto.projectCode },
    });

    if (existingProject) {
      throw new BadRequestException(`Project with code ${createProjectDto.projectCode} already exists`);
    }

    const normalizedPayload = this.normalizeProjectPayload(createProjectDto);

    const project = this.projectsRepository.create({
      ...normalizedPayload,
      isActive: normalizedPayload.isActive ?? true,
      createdBy: userId ?? null,
    });

    const savedProject = await this.projectsRepository.save(project);
    return this.mapToResponseDto(savedProject);
  }

  async findAll(query: QueryProjectDto): Promise<PaginatedProjectResponseDto> {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      isActive,
      excludeId,
    } = query;

    const queryBuilder = this.projectsRepository.createQueryBuilder('project');

    if (isActive !== undefined) {
      queryBuilder.andWhere('project.isActive = :isActive', {
        isActive: isActive === 'true',
      });
    }

    if (status) {
      queryBuilder.andWhere('project.status ILIKE :status', { status: `%${status}%` });
    }

    if (excludeId) {
      queryBuilder.andWhere('project.id != :excludeId', { excludeId });
    }

    if (search) {
      queryBuilder.andWhere(
        `(project.name ILIKE :search OR project.projectCode ILIKE :search OR project.city ILIKE :search OR project.state ILIKE :search)`,
        { search: `%${search}%` },
      );
    }

    queryBuilder.orderBy('project.createdAt', 'DESC');

    const total = await queryBuilder.getCount();
    const projects = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    const data = await Promise.all(projects.map((project) => this.mapToResponseDto(project)));

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<ProjectResponseDto> {
    const project = await this.projectsRepository.findOne({ where: { id } });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    return this.mapToResponseDto(project);
  }

  async findByCode(code: string): Promise<ProjectResponseDto> {
    const project = await this.projectsRepository.findOne({ where: { projectCode: code } });

    if (!project) {
      throw new NotFoundException(`Project with code ${code} not found`);
    }

    return this.mapToResponseDto(project);
  }

  async update(id: string, updateProjectDto: UpdateProjectDto, userId?: string): Promise<ProjectResponseDto> {
    const project = await this.projectsRepository.findOne({ where: { id } });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    if (updateProjectDto.projectCode && updateProjectDto.projectCode !== project.projectCode) {
      const existingProject = await this.projectsRepository.findOne({
        where: { projectCode: updateProjectDto.projectCode },
      });

      if (existingProject) {
        throw new BadRequestException(`Project with code ${updateProjectDto.projectCode} already exists`);
      }
    }

    const normalizedPayload = this.normalizeProjectPayload(updateProjectDto);
    Object.assign(project, normalizedPayload);
    project.updatedBy = userId ?? project.updatedBy ?? null;

    const savedProject = await this.projectsRepository.save(project);
    return this.mapToResponseDto(savedProject);
  }

  async remove(id: string): Promise<{ message: string }> {
    const project = await this.projectsRepository.findOne({ where: { id } });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    const linkedProperties = await this.propertiesRepository.count({
      where: { projectId: id, isActive: true },
    });

    if (linkedProperties > 0) {
      throw new BadRequestException('Project cannot be deleted while active properties exist under it');
    }

    project.isActive = false;
    await this.projectsRepository.save(project);
    return { message: 'Project deactivated successfully' };
  }

  async toggleActive(id: string): Promise<ProjectResponseDto> {
    const project = await this.projectsRepository.findOne({ where: { id } });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    project.isActive = !project.isActive;
    const savedProject = await this.projectsRepository.save(project);
    return this.mapToResponseDto(savedProject);
  }

  private normalizeProjectPayload(payload: Partial<CreateProjectDto | UpdateProjectDto>): Partial<Project> {
    const normalized: Partial<Project> = { ...payload } as unknown as Partial<Project>;

    if (payload.startDate !== undefined) {
      normalized.startDate = payload.startDate ? new Date(payload.startDate) : null;
    }

    if (payload.endDate !== undefined) {
      normalized.endDate = payload.endDate ? new Date(payload.endDate) : null;
    }

    if (payload.isActive !== undefined) {
      normalized.isActive = Boolean(payload.isActive);
    }

    return normalized;
  }

  private async mapToResponseDto(project: Project): Promise<ProjectResponseDto> {
    const propertiesCount = await this.propertiesRepository.count({
      where: { projectId: project.id, isActive: true },
    });

    return {
      id: project.id,
      projectCode: project.projectCode,
      name: project.name,
      description: project.description ?? undefined,
      address: project.address ?? undefined,
      city: project.city ?? undefined,
      state: project.state ?? undefined,
      country: project.country ?? undefined,
      pincode: project.pincode ?? undefined,
      status: project.status ?? undefined,
      startDate: project.startDate ?? undefined,
      endDate: project.endDate ?? undefined,
      contactPerson: project.contactPerson ?? undefined,
      contactEmail: project.contactEmail ?? undefined,
      contactPhone: project.contactPhone ?? undefined,
      gstNumber: project.gstNumber ?? undefined,
      panNumber: project.panNumber ?? undefined,
      financeEntityName: project.financeEntityName ?? undefined,
      isActive: project.isActive,
      createdBy: project.createdBy ?? undefined,
      updatedBy: project.updatedBy ?? undefined,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      propertiesCount,
    };
  }
}
