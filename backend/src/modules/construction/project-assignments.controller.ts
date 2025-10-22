import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Body,
  Param,
  Request,
} from '@nestjs/common';
import { ProjectAssignmentsService } from './project-assignments.service';
import { CreateProjectAssignmentDto } from './dto/create-project-assignment.dto';

@Controller('construction-projects')
export class ProjectAssignmentsController {
  constructor(
    private readonly projectAssignmentsService: ProjectAssignmentsService,
  ) {}

  // Assign engineer to project
  @Post(':id/assignments')
  async assignEngineer(
    @Param('id') projectId: string,
    @Body() createDto: CreateProjectAssignmentDto,
    @Request() req: any,
  ) {
    const userId = req.user?.sub || req.user?.id;
    return this.projectAssignmentsService.create(
      { ...createDto, constructionProjectId: projectId },
      userId,
    );
  }

  // Get all assignments for a project
  @Get(':id/assignments')
  async getProjectAssignments(@Param('id') projectId: string) {
    return this.projectAssignmentsService.findByProject(projectId);
  }

  // Get all projects for current user (role-based)
  @Get('my-projects')
  async getMyProjects(@Request() req: any) {
    const employeeId = req.user?.employeeId;
    if (!employeeId) {
      return [];
    }
    return this.projectAssignmentsService.findByEmployee(employeeId);
  }

  // Get specific assignment details
  @Get('assignments/:id')
  async getAssignment(@Param('id') assignmentId: string) {
    return this.projectAssignmentsService.findOne(assignmentId);
  }

  // Deactivate assignment (soft delete)
  @Patch('assignments/:id/deactivate')
  async deactivateAssignment(@Param('id') assignmentId: string) {
    return this.projectAssignmentsService.deactivate(assignmentId);
  }

  // Delete assignment permanently
  @Delete('assignments/:id')
  async removeAssignment(@Param('id') assignmentId: string) {
    return this.projectAssignmentsService.remove(assignmentId);
  }

  // Check if user has access to project
  @Get(':projectId/check-access/:employeeId')
  async checkAccess(
    @Param('projectId') projectId: string,
    @Param('employeeId') employeeId: string,
  ) {
    const hasAccess = await this.projectAssignmentsService.hasAccess(
      employeeId,
      projectId,
    );
    return { hasAccess };
  }

  // Get user's role in project
  @Get(':projectId/role/:employeeId')
  async getEmployeeRole(
    @Param('projectId') projectId: string,
    @Param('employeeId') employeeId: string,
  ) {
    const role = await this.projectAssignmentsService.getEmployeeRole(
      employeeId,
      projectId,
    );
    return { role };
  }
}
