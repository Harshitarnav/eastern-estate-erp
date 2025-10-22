import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConstructionProjectAssignment } from './entities/construction-project-assignment.entity';
import { CreateProjectAssignmentDto } from './dto/create-project-assignment.dto';

@Injectable()
export class ProjectAssignmentsService {
  constructor(
    @InjectRepository(ConstructionProjectAssignment)
    private readonly assignmentsRepo: Repository<ConstructionProjectAssignment>,
  ) {}

  async create(createDto: CreateProjectAssignmentDto, createdBy: string) {
    // Check if assignment already exists
    const existing = await this.assignmentsRepo.findOne({
      where: {
        constructionProjectId: createDto.constructionProjectId,
        employeeId: createDto.employeeId,
      },
    });

    if (existing) {
      throw new ConflictException(
        'This employee is already assigned to this project',
      );
    }

    const assignment = this.assignmentsRepo.create({
      ...createDto,
      assignedDate: createDto.assignedDate || new Date().toISOString().split('T')[0],
      createdBy,
    });

    return this.assignmentsRepo.save(assignment);
  }

  async findByProject(projectId: string) {
    return this.assignmentsRepo.find({
      where: { constructionProjectId: projectId, isActive: true },
      relations: ['employee', 'employee.user'],
      order: { assignedDate: 'DESC' },
    });
  }

  async findByEmployee(employeeId: string) {
    return this.assignmentsRepo.find({
      where: { employeeId, isActive: true },
      relations: ['constructionProject', 'constructionProject.property'],
      order: { assignedDate: 'DESC' },
    });
  }

  async findOne(id: string) {
    const assignment = await this.assignmentsRepo.findOne({
      where: { id },
      relations: ['employee', 'constructionProject', 'constructionProject.property'],
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    return assignment;
  }

  async deactivate(id: string) {
    const assignment = await this.findOne(id);
    assignment.isActive = false;
    return this.assignmentsRepo.save(assignment);
  }

  async remove(id: string) {
    const assignment = await this.findOne(id);
    return this.assignmentsRepo.remove(assignment);
  }

  // Get all projects accessible by an employee (for role-based filtering)
  async getEmployeeProjects(employeeId: string): Promise<string[]> {
    const assignments = await this.assignmentsRepo.find({
      where: { employeeId, isActive: true },
      select: ['constructionProjectId'],
    });

    return assignments.map((a) => a.constructionProjectId);
  }

  // Check if employee has access to a project
  async hasAccess(employeeId: string, projectId: string): Promise<boolean> {
    const assignment = await this.assignmentsRepo.findOne({
      where: {
        employeeId,
        constructionProjectId: projectId,
        isActive: true,
      },
    });

    return !!assignment;
  }

  // Get employee's role in a project
  async getEmployeeRole(employeeId: string, projectId: string) {
    const assignment = await this.assignmentsRepo.findOne({
      where: {
        employeeId,
        constructionProjectId: projectId,
        isActive: true,
      },
    });

    return assignment?.role || null;
  }
}
