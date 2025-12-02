import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConstructionProject } from './entities/construction-project.entity';
import { CreateConstructionProjectDto } from './dto/create-construction-project.dto';
import { UpdateConstructionProjectDto } from './dto/update-construction-project.dto';

@Injectable()
export class ConstructionProjectsService {
  constructor(
    @InjectRepository(ConstructionProject)
    private readonly constructionProjectRepository: Repository<ConstructionProject>,
  ) {}

  async create(createDto: CreateConstructionProjectDto): Promise<ConstructionProject> {
    const project = this.constructionProjectRepository.create({
      ...createDto,
      propertyId: createDto.propertyId ?? null,
      startDate: createDto.startDate ? new Date(createDto.startDate) : null,
      expectedCompletionDate: createDto.expectedCompletionDate 
        ? new Date(createDto.expectedCompletionDate) 
        : null,
    });

    return await this.constructionProjectRepository.save(project);
  }

  async findAll(propertyId?: string) {
    const where: any = {};
    if (propertyId) {
      where.propertyId = propertyId;
    }

    return await this.constructionProjectRepository.find({
      where,
      relations: ['property', 'projectManager'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<ConstructionProject> {
    const project = await this.constructionProjectRepository.findOne({
      where: { id },
      relations: ['property', 'projectManager'],
    });

    if (!project) {
      throw new NotFoundException(`Construction Project with ID ${id} not found`);
    }

    return project;
  }

  async update(id: string, updateDto: UpdateConstructionProjectDto): Promise<ConstructionProject> {
    const project = await this.findOne(id);

    Object.assign(project, updateDto);

    if (updateDto.propertyId !== undefined) {
      project.propertyId = updateDto.propertyId ?? null;
    }

    if (updateDto.startDate) {
      project.startDate = new Date(updateDto.startDate);
    }

    if (updateDto.expectedCompletionDate) {
      project.expectedCompletionDate = new Date(updateDto.expectedCompletionDate);
    }

    return await this.constructionProjectRepository.save(project);
  }

  async remove(id: string): Promise<void> {
    const project = await this.findOne(id);
    await this.constructionProjectRepository.remove(project);
  }

  async getByProperty(propertyId: string) {
    return await this.constructionProjectRepository.find({
      where: { propertyId },
      relations: ['projectManager'],
      order: { createdAt: 'DESC' },
    });
  }
}
